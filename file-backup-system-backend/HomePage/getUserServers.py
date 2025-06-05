from flask import request, jsonify
from . import HomePage_bp
from models import db, User, Server

from logger import logger



@HomePage_bp.route("/api/get-user-servers", methods=["GET"])
def get_user_servers():
    try:
        # Проверка авторизации через токен
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            logger.warning("❌ Отсутствует токен авторизации")
            return jsonify({"message": "Требуется авторизация"}), 401

        token = auth_header.split(" ")[1]
        try:
            # Декодируем токен и проверяем email
            from flask_jwt_extended import decode_token
            decoded = decode_token(token)
            token_email = decoded.get("sub")  # Flask-JWT-Extended использует 'sub' для identity
        except Exception as e:
            logger.warning(f"❌ Невалидный токен: {str(e)}")
            return jsonify({"message": "Невалидный токен"}), 401

        # Получаем email из параметров запроса
        request_email = request.args.get("email", "").strip().lower()
        if not request_email:
            logger.warning("❌ Email не указан в запросе")
            return jsonify({"message": "Email не указан"}), 400

        # Проверяем соответствие email в токене и запросе
        if token_email != request_email:
            logger.warning(f"❌ Несоответствие email: токен {token_email} ≠ запрос {request_email}")
            return jsonify({"message": "Доступ запрещен"}), 403

        # Основная логика обработки запроса
        user = User.query.filter_by(email=request_email).first()
        if not user:
            logger.warning(f"❌ Пользователь {request_email} не найден")
            return jsonify({"message": "Пользователь не найден"}), 404

        servers = Server.query.filter_by(user_id=user.id).all()
        result = [{
            "id": server.id,
            "name": server.name,
            "ip": server.ip_address
        } for server in servers]

        logger.info(f"✅ Получено {len(result)} серверов для {request_email}")
        return jsonify(result), 200

    except Exception as e:
        logger.error(f"❌ Ошибка при получении серверов: {str(e)}")
        return jsonify({"message": "Ошибка сервера"}), 500