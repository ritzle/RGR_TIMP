from flask import request, jsonify
from . import HomePage_bp
from models import db, User, Server
from utils import generate_code, send_email


from logger import logger



@HomePage_bp.route("/api/add-server", methods=["POST"])
def add_server():
    try:
        data = request.get_json()

        # Проверка на наличие всех необходимых полей
        required_fields = ["email", "ip_address", "name"]
        missing_fields = [field for field in required_fields if field not in data or not data[field].strip()]
        if missing_fields:
            logger.warning(f"❌ Недостаточно данных: отсутствуют поля {missing_fields}")
            return jsonify({"message": "Недостаточно данных"}), 400

        email = data["email"].strip().lower()
        ip_address = data["ip_address"].strip()
        name = data["name"].strip()

        user = User.query.filter_by(email=email).first()
        if not user:
            logger.warning(f"❌ Пользователь не найден: {email}")
            return jsonify({"message": "Пользователь не найден"}), 404

        # Проверка: сервер с таким IP уже зарегистрирован у этого пользователя
        existing = Server.query.filter_by(ip_address=ip_address, user_id=user.id).first()
        if existing:
            logger.info(f"⚠️ IP {ip_address} уже зарегистрирован у пользователя {email}")
            return jsonify({"message": "Этот IP уже зарегистрирован у данного пользователя"}), 400

        # Добавление сервера
        new_server = Server(
            name=name,
            ip_address=ip_address,
            user_id=user.id
        )
        db.session.add(new_server)
        db.session.commit()

        logger.info(f"✅ Добавлен сервер '{name}' ({ip_address}) для пользователя {email}")
        return jsonify({"message": "Сервер добавлен успешно"}), 200

    except Exception as e:
        logger.error(f"❌ Ошибка при добавлении сервера: {e}")
        return jsonify({"message": "Внутренняя ошибка сервера"}), 500
