from flask import request, jsonify
from . import HomePage_bp
from models import db, User
from utils import generate_code, send_email

import logging


logging.basicConfig(level=logging.INFO)

@HomePage_bp.route("/api/update-profile", methods=["POST"])
def update_profile():
    data = request.json
    user = User.query.filter_by(email=data["email"]).first()
    if not user:
        return jsonify({"message": "Пользователь не найден"}), 404
    user.first_name = data["firstName"]
    user.last_name = data["lastName"]
    db.session.commit()
    return jsonify({"message": "Профиль обновлён"})
