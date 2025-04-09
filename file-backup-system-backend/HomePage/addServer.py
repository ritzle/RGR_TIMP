from flask import request, jsonify
from . import HomePage_bp
from models import db, User, Server
from utils import generate_code, send_email

import logging


logging.basicConfig(level=logging.INFO)

@HomePage_bp.route("/api/add-server", methods=["POST"])
def add_server():
    data = request.json
    user = User.query.filter_by(email=data["email"]).first()
    if not user:
        return jsonify({"message": "Пользователь не найден"}), 404

    # Проверка на существующий IP
    existing = Server.query.filter_by(ip_address=data["ip_address"]).first()
    if existing:
        return jsonify({"message": "Этот IP уже зарегистрирован"}), 400

    new_server = Server(
        name=data["name"],
        ip_address=data["ip_address"],
        user_id=user.id
    )
    db.session.add(new_server)
    db.session.commit()
    return jsonify({"message": "Сервер добавлен"})

