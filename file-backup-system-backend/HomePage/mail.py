from flask import request, jsonify
from . import HomePage_bp
from models import db, User
from utils import generate_code, send_email
import bcrypt
import time

from logger import logger

# Временное хранилище запросов на сброс пароля
password_reset_requests = {}

@HomePage_bp.route("/api/send-reset-code", methods=["POST"])
def send_reset_code():
    data = request.get_json()
    if not data or "email" not in data:
        logger.warning("❌ Email не указан в запросе на сброс пароля")
        return jsonify({"message": "Email обязателен"}), 400

    email = data["email"].strip().lower()
    user = User.query.filter_by(email=email).first()
    if not user:
        logger.warning(f"❌ Пользователь с email '{email}' не найден")
        return jsonify({"message": "Пользователь не найден"}), 404

    code = generate_code()
    password_reset_requests[email] = {
        "code": code,
        "timestamp": time.time(),
        "verified": False
    }

    if not send_email(email, f"Ваш код подтверждения: {code}"):
        password_reset_requests.pop(email, None)
        logger.error(f"❌ Не удалось отправить код на email {email}")
        return jsonify({"message": "Ошибка при отправке кода"}), 500

    logger.info(f"📨 Код подтверждения отправлен на email {email}")
    return jsonify({"message": "Код подтверждения отправлен на почту"}), 200


@HomePage_bp.route("/api/verify-reset-code", methods=["POST"])
def verify_reset_code():
    data = request.get_json()
    if not data or "email" not in data or "code" not in data:
        logger.warning("❌ Не хватает email или кода для подтверждения")
        return jsonify({"message": "Email и код обязательны"}), 400

    email = data["email"].strip().lower()
    code = data["code"].strip()

    if email not in password_reset_requests:
        logger.warning(f"❌ Запрос на сброс пароля для {email} не найден")
        return jsonify({"message": "Запрос на смену пароля не найден"}), 400

    req = password_reset_requests[email]

    if time.time() - req["timestamp"] > 300:
        password_reset_requests.pop(email, None)
        logger.warning(f"⌛ Срок действия кода для {email} истёк")
        return jsonify({"message": "Срок действия кода истёк"}), 400

    if req["code"] != code:
        logger.warning(f"❌ Неверный код подтверждения для {email}")
        return jsonify({"message": "Неверный код подтверждения"}), 400

    req["verified"] = True
    logger.info(f"✅ Код подтверждён для {email}")
    return jsonify({"message": "Код подтверждён"}), 200


@HomePage_bp.route("/api/change-password", methods=["POST"])
def change_password():
    data = request.get_json()
    if not data or "email" not in data or "newPassword" not in data:
        logger.warning("❌ Email и новый пароль обязательны")
        return jsonify({"message": "Email и новый пароль обязательны"}), 400

    email = data["email"].strip().lower()
    new_password = data["newPassword"]

    if email not in password_reset_requests or not password_reset_requests[email]["verified"]:
        logger.warning(f"❌ Требуется подтверждение email для {email}")
        return jsonify({"message": "Требуется подтверждение email"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        logger.warning(f"❌ Пользователь с email '{email}' не найден")
        return jsonify({"message": "Пользователь не найден"}), 404

    try:
        hashed_password = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt()).decode()
        user.password = hashed_password
        db.session.commit()
        password_reset_requests.pop(email, None)

        logger.info(f"🔐 Пароль успешно изменён для {email}")
        return jsonify({"message": "Пароль успешно изменён"}), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Ошибка при смене пароля для {email}: {e}")
        return jsonify({"message": "Ошибка сервера"}), 500
