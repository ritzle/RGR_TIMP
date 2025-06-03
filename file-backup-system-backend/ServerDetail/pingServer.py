from flask import request, jsonify
from . import ServerDetail_bp
from models import db, User, Server
from utils import generate_code, send_email
import paramiko

import logging
import requests



logging.basicConfig(level=logging.INFO)

@ServerDetail_bp.route("/api/ping-server", methods=["GET"])
def ping_server():
    address = request.args.get("address")
    if not address:
        return jsonify({"status": "error", "message": "Адрес не указан"}), 400

    try:
        logging.info(f"проверка адресса: {address}")
        response = requests.get(f"{address}/test/ping", timeout=3)
        data = response.json()
        return jsonify(data)
    except requests.exceptions.Timeout:
        return jsonify({"status": "timeout", "message": "Время ожидания истекло"}), 408
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    


@ServerDetail_bp.route("/api/ping-host", methods=["GET"])
def ping_ssh_host():
    """
    Проверяет доступность SSH-хоста по адресу и порту 22 (или можно указать свой порт)
    Возвращает:
    - 200 OK, если подключение успешно
    - 408, если таймаут
    - 503, если недоступен
    """
    address = request.args.get("address")
    port = request.args.get("port", 22, type=int)  # порт можно передавать параметром, по умолчанию 22
    
    if not address:
        return jsonify({"status": "error", "message": "Адрес не указан"}), 400

    try:
        logging.info(f"Проверка доступности SSH хоста: {address}:{port}")
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

        # Пытаемся подключиться без пароля, просто чтобы проверить, что сервер доступен
        ssh.connect(hostname=address, port=port, username='invalid', password='invalid', timeout=3, allow_agent=False, look_for_keys=False)
        # Если дошли сюда — странно, но значит сервер доступен и аутентификация прошла (маловероятно)
        ssh.close()
        return jsonify({"status": "available", "message": "SSH сервер доступен"}), 200

    except paramiko.AuthenticationException:
        # Это значит, что сервер доступен, но данные для авторизации неправильные — значит сервер доступен
        return jsonify({"status": "available", "message": "SSH сервер доступен, но аутентификация не пройдена"}), 200

    except paramiko.SSHException as e:
        logging.warning(f"SSH ошибка при проверке {address}: {str(e)}")
        return jsonify({"status": "ssh_error", "message": "Ошибка SSH соединения"}), 503

    except Exception as e:
        logging.warning(f"Ошибка подключения к SSH {address}: {str(e)}")
        # Возможен таймаут или недоступность
        if "timed out" in str(e).lower():
            return jsonify({"status": "timeout", "message": "Таймаут при подключении"}), 408
        return jsonify({"status": "unreachable", "message": "Не удалось подключиться"}), 503