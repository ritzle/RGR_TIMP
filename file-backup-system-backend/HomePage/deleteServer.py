from flask import request, jsonify
from . import HomePage_bp
from models import db, User, Server
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@HomePage_bp.route("/api/delete-server", methods=["POST"])
def delete_server():
    data = request.get_json()

    if not data or "name" not in data or "email" not in data:
        return jsonify({"message": "Недостаточно данных"}), 400

    user = User.query.filter_by(email=data["email"]).first()
    if not user:
        return jsonify({"message": "Пользователь не найден"}), 404

    server = Server.query.filter_by(name=data["name"], user_id=user.id).first()
    if not server:
        return jsonify({"message": "Сервер не найден"}), 404

    try:
        db.session.delete(server)
        db.session.commit()
        logger.info(f"✅ Удалён сервер '{server.name}' пользователя {user.email}")
        return jsonify({"message": "Сервер удалён успешно"}), 200
    except Exception as e:
        logger.error(f"Ошибка при удалении сервера: {e}")
        db.session.rollback()
        return jsonify({"message": "Ошибка при удалении сервера"}), 500
