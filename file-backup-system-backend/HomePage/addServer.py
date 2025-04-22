from flask import request, jsonify
from . import HomePage_bp
from models import db, User, Server
from utils import generate_code, send_email

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@HomePage_bp.route("/api/add-server", methods=["POST"])
def add_server():
    data = request.get_json()

    if not data or "email" not in data or "ip_address" not in data or "name" not in data:
        return jsonify({"message": "Недостаточно данных"}), 400

    user = User.query.filter_by(email=data["email"]).first()
    if not user:
        return jsonify({"message": "Пользователь не найден"}), 404

    # Проверка на существующий IP у пользователя
    existing = Server.query.filter_by(ip_address=data["ip_address"], user_id=user.id).first()
    if existing:
        return jsonify({"message": "Этот IP уже зарегистрирован у данного пользователя"}), 400

    new_server = Server(
        name=data["name"],
        ip_address=data["ip_address"],
        user_id=user.id
    )
    db.session.add(new_server)
    db.session.commit()

    logger.info(f"✅ Добавлен сервер '{new_server.name}' ({new_server.ip_address}) для пользователя {user.email}")

    return jsonify({"message": "Сервер добавлен успешно"}), 200
