from flask import request, jsonify
from . import ServerDetail_bp
import logging
import requests

logging.basicConfig(level=logging.INFO)

@ServerDetail_bp.route("/api/get-backups", methods=["GET"])
def get_backups():
    address = request.args.get("address")
    logging.info(f"[BACKUPS] Получен адрес сервера: {address}")
    
    if not address:
        return jsonify({"error": "Адрес не указан"}), 400

    try:
        response = requests.get(f"{address}/backup/list_backup", timeout=3)
        data = response.json()
        
        if isinstance(data.get("backups"), dict):
            logging.info(f"[BACKUPS] Успешно получены: {list(data['backups'].keys())}")
            return jsonify(data)
        else:
            return jsonify({"error": "Неверный формат данных от сервера"}), 502

    except requests.exceptions.Timeout:
        return jsonify({"error": "Сервер не отвечает (таймаут)"}), 408
    except Exception as e:
        logging.exception("Ошибка при получении бэкапов:")
        return jsonify({"error": str(e)}), 500
