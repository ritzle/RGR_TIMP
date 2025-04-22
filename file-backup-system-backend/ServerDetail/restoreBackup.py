from flask import request, jsonify
from . import ServerDetail_bp
from models import db, User, Server
from utils import generate_code, send_email

import logging
import requests

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@ServerDetail_bp.route("/api/restore-backup", methods=["POST"])
def restore_backup():
    data = request.get_json()
    address = data.get("address")
    backup = data.get("backup")

    if not address or not backup:
        logger.warning("Не передан адрес или имя бэкапа")
        return jsonify({"message": "Не указан адрес сервера или имя бэкапа"}), 400

    try:
        url = f"{address}/restore/"
        logger.info(f"Отправка запроса на восстановление на {url} с архивом {backup}")

        response = requests.post(
            url,
            json={"backup_name": backup},
            timeout=5
        )

        if response.status_code == 200:
            logger.info(f"Успешно восстановлено: {response.json()}")
            return jsonify({"message": response.json().get("message", "Восстановление завершено")}), 200
        else:
            logger.error(f"Ошибка от сервера: {response.status_code} - {response.text}")
            return jsonify({"message": response.json().get("message", "Ошибка при восстановлении")}), response.status_code

    except requests.exceptions.Timeout:
        logger.error("⏱️ Время ожидания ответа от сервера истекло")
        return jsonify({"message": "Сервер не отвечает (таймаут)"}), 408

    except Exception as e:
        logger.critical(f"Ошибка при попытке восстановить бэкап: {str(e)}")
        return jsonify({"message": f"Ошибка: {str(e)}"}), 500
