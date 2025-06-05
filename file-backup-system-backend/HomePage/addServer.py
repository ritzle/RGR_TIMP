from flask import request, jsonify
from . import HomePage_bp
from models import db, User, Server
from utils import generate_code, send_email, decode_token
from logger import logger

@HomePage_bp.route("/api/add-server", methods=["POST"])
def add_server():
    try:
        # Извлечение и проверка токена
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

        # Чтение тела запроса
        data = request.get_json()

        required_fields = ["email", "ip_address", "name"]
        missing_fields = [field for field in required_fields if field not in data or not data[field].strip()]
        if missing_fields:
            logger.warning(f"❌ Недостаточно данных: отсутствуют поля {missing_fields}")
            return jsonify({"message": "Недостаточно данных"}), 400

        email = data["email"].strip().lower()
        ip_address = data["ip_address"].strip()
        name = data["name"].strip()

        # Сравнение email из токена и тела запроса
        if email != token_email:
            logger.warning(f"❌ Email в токене и запросе не совпадают: {email} != {token_email}")
            return jsonify({"message": "Попытка подделки запроса"}), 403

        user = User.query.filter_by(email=email).first()
        if not user:
            logger.warning(f"❌ Пользователь не найден: {email}")
            return jsonify({"message": "Пользователь не найден"}), 404

        existing = Server.query.filter_by(ip_address=ip_address, user_id=user.id).first()
        if existing:
            logger.info(f"⚠️ IP {ip_address} уже зарегистрирован у пользователя {email}")
            return jsonify({"message": "Этот IP уже зарегистрирован у данного пользователя"}), 400

        new_server = Server(name=name, ip_address=ip_address, user_id=user.id)
        db.session.add(new_server)
        db.session.commit()

        logger.info(f"✅ Добавлен сервер '{name}' ({ip_address}) для пользователя {email}")
        return jsonify({"message": "Сервер добавлен успешно"}), 200

    except Exception as e:
        logger.error(f"❌ Ошибка при добавлении сервера: {e}")
        return jsonify({"message": "Внутренняя ошибка сервера"}), 500
