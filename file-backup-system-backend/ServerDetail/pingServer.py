from flask import request, jsonify
from . import ServerDetail_bp
from models import db, User, Server
from utils import generate_code, send_email

import logging
import requests



logging.basicConfig(level=logging.INFO)

@ServerDetail_bp.route("/api/ping-server", methods=["GET"])
def ping_server():
    address = request.args.get("address")  # ← теперь получаем полный адрес
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