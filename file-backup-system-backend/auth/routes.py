from flask import request, jsonify
from . import auth_bp
from models import db, User
from utils import generate_code, send_email

import time, bcrypt, threading, time, logging

logging.basicConfig(level=logging.INFO)



#временное хранения для подтерждения почты 
pending_users = {}  # ключ — email


def cleanup_pending_users():
    while True:
        now = time.time()
        expired = [email for email, data in pending_users.items() if now - data["created_at"] > 120]
        for email in expired:
            logging.info(f"Удаление просроченной регистрации: {email}")
            pending_users.pop(email)
        time.sleep(60)  # проверка каждую минуту

cleanup_thread = threading.Thread(target=cleanup_pending_users, daemon=True)
cleanup_thread.start()


# Регистрация
@auth_bp.route("/api/register-init", methods=["POST"])
def register_init():
    data = request.json
    email = data.get("email")
    logging.info(f"Регистрация: {email}")

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

    logging.info(f"Код подтверждения для {email}: {code}")

    if send_email(email, code):
        return jsonify({"message": "Письмо отправлено"})
    else:
        pending_users.pop(email, None)  # очищаем
        return jsonify({"message": "Ошибка при отправке письма"}), 500








# Вход
@auth_bp.route("/api/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    logging.info(f"Попытка входа: {email}")

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"message": "Пользователь не найден"}), 404


    if not bcrypt.checkpw(password.encode(), user.password.encode()):
        return jsonify({"message": "Неверный пароль"}), 401

    return jsonify({
        "message": "Вход выполнен",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": f"{user.first_name} {user.last_name}"
        }
    })






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


    logging.info(f"пользователь с : {email} подтвердил почту")

    # Создание пользователя
    user = User(
        first_name=pending["first_name"],
        last_name=pending["last_name"],
        email=email,
        password=pending["password"],
    )
    db.session.add(user)
    db.session.commit()

    pending_users.pop(email)

    return jsonify({"message": "Почта подтверждена, пользователь создан"})

