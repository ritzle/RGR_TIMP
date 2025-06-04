from flask import request, jsonify
from . import HomePage_bp
from models import db, User, Server

from logger import logger



@HomePage_bp.route("/api/get-user-servers", methods=["GET"])
def get_user_servers():
    try:
        email = request.args.get("email", "").strip().lower()
        if not email:
            logger.warning("❌ Email не указан в запросе")
            return jsonify({"message": "Email не указан"}), 400

        user = User.query.filter_by(email=email).first()
        if not user:
            logger.warning(f"❌ Пользователь с email '{email}' не найден")
            return jsonify({"message": "Пользователь не найден"}), 404

        servers = Server.query.filter_by(user_id=user.id).all()
        result = [
            {
                "id": server.id,
                "name": server.name,
                "ip": server.ip_address
            }
            for server in servers
        ]

        logger.info(f"✅ Получены серверы пользователя {email}: {len(result)} шт.")
        return jsonify(result), 200

    except Exception as e:
        logger.error(f"❌ Ошибка при получении серверов пользователя: {e}")
        return jsonify({"message": "Ошибка на сервере"}), 500
