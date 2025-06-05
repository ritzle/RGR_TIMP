from flask import request, jsonify
from . import HomePage_bp
from models import db, User
from utils import decode_token  # Импорт функции для проверки токена
from logger import logger

@HomePage_bp.route("/api/update-profile", methods=["POST"])
def update_profile():
    try:
        # Проверка токена
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            logger.warning("❌ Отсутствует или неверный токен авторизации")
            return jsonify({"message": "Неавторизованный доступ"}), 401

        token = auth_header.split(" ")[1]
        user_data = decode_token(token)
        if not user_data:
            logger.warning("❌ Невалидный токен")
            return jsonify({"message": "Невалидный токен"}), 401

        token_email = user_data.get("email")

        # Проверка входных данных
        data = request.get_json()
        if not data or "email" not in data or "firstName" not in data or "lastName" not in data:
            logger.warning("❌ Недостаточно данных для обновления профиля")
            return jsonify({"message": "Недостаточно данных"}), 400

        email = data["email"].strip().lower()
        first_name = data["firstName"].strip()
        last_name = data["lastName"].strip()

        # Проверка соответствия email в токене и запросе
        if email != token_email:
            logger.warning(f"❌ Несовпадение email в токене и запросе: {email} != {token_email}")
            return jsonify({"message": "Доступ запрещён"}), 403

        # Поиск и обновление пользователя
        user = User.query.filter_by(email=email).first()
        if not user:
            logger.warning(f"❌ Пользователь с email '{email}' не найден")
            return jsonify({"message": "Пользователь не найден"}), 404

        user.first_name = first_name
        user.last_name = last_name
        db.session.commit()

        logger.info(f"✅ Профиль пользователя {email} успешно обновлён")
        return jsonify({
            "message": "Профиль обновлён",
            "user": {
                "email": user.email,
                "firstName": user.first_name,
                "lastName": user.last_name
            }
        }), 200

    except Exception as e:
        logger.error(f"❌ Ошибка при обновлении профиля: {e}")
        db.session.rollback()
        return jsonify({"message": "Ошибка при обновлении профиля"}), 500