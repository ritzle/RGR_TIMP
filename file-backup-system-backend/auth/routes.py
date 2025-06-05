from flask import request, jsonify
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
    create_refresh_token,
    create_access_token
)
from . import auth_bp
from models import db, User
from utils import generate_code, send_email
from logger import logger

import time, bcrypt, threading

# Временное хранение для подтверждения почты
pending_users = {}  # ключ — email


def cleanup_pending_users():
    while True:
        now = time.time()
        expired = [
            email for email, data in pending_users.items()
            if now - data["created_at"] > 120
        ]
        for email in expired:
            logger.info(f"Удаление просроченной регистрации: {email}")
            pending_users.pop(email)
        time.sleep(60)  # проверка каждую минуту

cleanup_thread = threading.Thread(target=cleanup_pending_users, daemon=True)
cleanup_thread.start()


# Регистрация
@auth_bp.route("/api/register-init", methods=["POST"])
def register_init():
    data = request.json
    email = data.get("email")

    if email in pending_users or User.query.filter_by(email=email).first():
        return jsonify({"message": "Email уже используется или ожидает подтверждения"}), 409

    hashed_password = bcrypt.hashpw(data["password"].encode(), bcrypt.gensalt()).decode()
    code = generate_code()

    pending_users[email] = {
        "first_name": data["firstName"],
        "last_name": data["lastName"],
        "password": hashed_password,
        "verification_code": code,
        "created_at": time.time()
    }

    if send_email(email, code):
        logger.info(f"Регистрация инициирована: {email}")
        return jsonify({"message": "Письмо отправлено"})
    else:
        pending_users.pop(email, None)
        return jsonify({"message": "Ошибка при отправке письма"}), 500


# Подтверждение кода
@auth_bp.route("/api/verify", methods=["POST"])
def verify_code():
    data = request.json
    email = data.get("email")
    code = data.get("code")

    pending = pending_users.get(email)
    if not pending:
        return jsonify({"message": "Регистрация не найдена или истекла"}), 400

    if time.time() - pending["created_at"] > 300:
        pending_users.pop(email)
        return jsonify({"message": "Код истёк"}), 400

    if pending["verification_code"] != code:
        return jsonify({"message": "Неверный код"}), 400

    user = User(
        first_name=pending["first_name"],
        last_name=pending["last_name"],
        email=email,
        password=pending["password"],
    )
    db.session.add(user)
    db.session.commit()

    pending_users.pop(email)
    logger.info(f"Пользователь подтвердил почту: {email}")

    return jsonify({"message": "Почта подтверждена, пользователь создан"})


# Вход
@auth_bp.route("/api/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"message": "Пользователь не найден"}), 404

    if not bcrypt.checkpw(password.encode(), user.password.encode()):
        return jsonify({"message": "Неверный пароль"}), 401

    access_token = create_access_token(identity=email)
    refresh_token = create_refresh_token(identity=email)

    logger.info(f"Успешный вход: {email}")

    return jsonify({
        "message": "Вход выполнен",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": user.id,
            "email": user.email,
            "firstName": user.first_name,
            "lastName": user.last_name
        }
    })


# Валидация токена
@auth_bp.route("/api/validate-token", methods=["GET"])
@jwt_required()
def validate_token():
    current_user = get_jwt_identity()
    user = User.query.filter_by(email=current_user).first()
    
    if not user:
        return jsonify({"message": "Пользователь не найден"}), 404
        
    return jsonify({
        "message": "Токен действителен",
        "user": {
            "id": user.id,
            "email": user.email,
            "firstName": user.first_name,
            "lastName": user.last_name
        }
    }), 200


# Обновление токена
@auth_bp.route("/api/refresh-token", methods=["POST"])
@jwt_required(refresh=True)
def refresh_token():
    current_user = get_jwt_identity()
    
    # Создаем новую пару токенов
    new_access_token = create_access_token(identity=current_user)
    new_refresh_token = create_refresh_token(identity=current_user)
    
    return jsonify({
        "access_token": new_access_token,
        "refresh_token": new_refresh_token
    }), 200