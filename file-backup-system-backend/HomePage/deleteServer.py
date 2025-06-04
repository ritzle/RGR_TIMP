from flask import request, jsonify
from . import HomePage_bp
from models import db, User, Server

from logger import logger



@HomePage_bp.route("/api/delete-server", methods=["POST"])
def delete_server():
    try:
        data = request.get_json()

        # Проверка на наличие всех необходимых полей
        required_fields = ["email", "name"]
        missing_fields = [field for field in required_fields if field not in data or not data[field].strip()]
        if missing_fields:
            logger.warning(f"❌ Недостаточно данных: отсутствуют поля {missing_fields}")
            return jsonify({"message": "Недостаточно данных"}), 400

        email = data["email"].strip().lower()
        name = data["name"].strip()

        user = User.query.filter_by(email=email).first()
        if not user:
            logger.warning(f"❌ Пользователь не найден: {email}")
            return jsonify({"message": "Пользователь не найден"}), 404

        server = Server.query.filter_by(name=name, user_id=user.id).first()
        if not server:
            logger.info(f"⚠️ Сервер '{name}' не найден у пользователя {email}")
            return jsonify({"message": "Сервер не найден"}), 404

        # Удаление сервера
        db.session.delete(server)
        db.session.commit()

        logger.info(f"✅ Удалён сервер '{name}' пользователя {email}")
        return jsonify({"message": "Сервер удалён успешно"}), 200

    except Exception as e:
        logger.error(f"❌ Ошибка при удалении сервера: {e}")
        db.session.rollback()
        return jsonify({"message": "Ошибка при удалении сервера"}), 500
