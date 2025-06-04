from flask import request, jsonify
from . import HomePage_bp
from models import db, User

from logger import logger

@HomePage_bp.route("/api/update-profile", methods=["POST"])
def update_profile():
    try:
        data = request.get_json()
        if not data or "email" not in data or "firstName" not in data or "lastName" not in data:
            logger.warning("❌ Недостаточно данных для обновления профиля")
            return jsonify({"message": "Недостаточно данных"}), 400

        email = data["email"].strip().lower()
        first_name = data["firstName"].strip()
        last_name = data["lastName"].strip()

        user = User.query.filter_by(email=email).first()
        if not user:
            logger.warning(f"❌ Пользователь с email '{email}' не найден")
            return jsonify({"message": "Пользователь не найден"}), 404

        user.first_name = first_name
        user.last_name = last_name
        db.session.commit()

        logger.info(f"✅ Профиль пользователя {email} успешно обновлён")
        return jsonify({"message": "Профиль обновлён"}), 200

    except Exception as e:
        logger.error(f"❌ Ошибка при обновлении профиля: {e}")
        db.session.rollback()
        return jsonify({"message": "Ошибка при обновлении профиля"}), 500
