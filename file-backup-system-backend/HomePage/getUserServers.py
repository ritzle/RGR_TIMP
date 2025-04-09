from flask import request, jsonify
from . import HomePage_bp
from models import db, User, Server
from utils import generate_code, send_email

import logging


logging.basicConfig(level=logging.INFO)

@HomePage_bp.route("/api/get-user-servers", methods=["GET"])
def get_user_servers():

    email = request.args.get("email")
    if not email:
        return jsonify({"message": "Email не указан"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
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
    return jsonify(result)


