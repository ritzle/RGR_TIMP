from flask import request, jsonify
from . import HomePage_bp
from models import db, User
from utils import generate_code, send_email
import bcrypt
import time
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Храним временные данные для смены пароля
password_reset_requests = {}

@HomePage_bp.route("/api/send-reset-code", methods=["POST"])
def send_reset_code():
    data = request.get_json()
    if not data:
        return jsonify({"message": "Неверный формат данных"}), 400
        
    email = data.get("email")
    if not email:
        return jsonify({"message": "Email обязателен"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "Пользователь не найден"}), 404

    # Генерируем код и сохраняем его с временной меткой
    code = generate_code()
    password_reset_requests[email] = {
        "code": code,
        "timestamp": time.time(),
        "verified": False,
        "new_password": None
    }

    # Отправляем код на почту
    if not send_email(email, f"Ваш код подтверждения: {code}"):
        password_reset_requests.pop(email, None)
        return jsonify({"message": "Ошибка при отправке кода"}), 500

    return jsonify({"message": "Код подтверждения отправлен на почту"}), 200

@HomePage_bp.route("/api/verify-reset-code", methods=["POST"])
def verify_reset_code():
    data = request.get_json()
    if not data:
        return jsonify({"message": "Неверный формат данных"}), 400
        
    email = data.get("email")
    code = data.get("code")
    if not email or not code:
        return jsonify({"message": "Email и код обязательны"}), 400

    # Проверяем наличие запроса
    if email not in password_reset_requests:
        return jsonify({"message": "Запрос на смену пароля не найден"}), 400

    request_data = password_reset_requests[email]
    
    # Проверяем срок действия кода (5 минут)
    if time.time() - request_data["timestamp"] > 300:
        password_reset_requests.pop(email, None)
        return jsonify({"message": "Срок действия кода истёк"}), 400

    # Проверяем код
    if request_data["code"] != code:
        return jsonify({"message": "Неверный код подтверждения"}), 400

    # Помечаем как подтверждённый
    password_reset_requests[email]["verified"] = True
    return jsonify({"message": "Код подтверждён"}), 200

@HomePage_bp.route("/api/change-password", methods=["POST"])
def change_password():
    data = request.get_json()
    if not data:
        return jsonify({"message": "Неверный формат данных"}), 400
        
    email = data.get("email")
    new_password = data.get("newPassword")
    if not email or not new_password:
        return jsonify({"message": "Email и новый пароль обязательны"}), 400

    # Проверяем подтверждение почты
    if email not in password_reset_requests or not password_reset_requests[email]["verified"]:
        return jsonify({"message": "Требуется подтверждение email"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "Пользователь не найден"}), 404

    try:
        # Хешируем новый пароль
        hashed_password = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt()).decode()
        user.password = hashed_password
        db.session.commit()

        # Удаляем запрос после успешной смены
        password_reset_requests.pop(email, None)
        
        logger.info(f"Пароль успешно изменён для {email}")
        return jsonify({"message": "Пароль успешно изменён"}), 200

    except Exception as e:
        logger.error(f"Ошибка при смене пароля: {str(e)}")
        return jsonify({"message": "Ошибка сервера"}), 500