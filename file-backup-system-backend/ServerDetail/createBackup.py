from flask import request, jsonify
from . import ServerDetail_bp
import requests
import logging

# Получаем логгер текущего модуля
logger = logging.getLogger(__name__)

@ServerDetail_bp.route("/api/create-backup", methods=["POST"])
def api_create_backup():
    address = request.args.get("address")
    if not address:
        return jsonify({"message": "Адрес не указан"}), 400

    data = request.get_json() or {}
    comment = data.get("comment", "").strip()

    try:
        response = requests.post(
            f"{address}/backup/create_backup",
            json={"comment": comment},
            timeout=5
        )

        if response.status_code == 200:
            result = response.json()
            return jsonify({
                "success": True,
                "message": result.get("message", "Бэкап успешно создан"),
                "backup_name": result["backup_name"],
                "comment": result.get("comment", "")
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": response.json().get("message", "Ошибка на сервере")
            }), response.status_code

    except requests.exceptions.Timeout:
        return jsonify({"success": False, "message": "Время ожидания истекло"}), 408
    except Exception as e:
        return jsonify({"success": False, "message": f"Ошибка: {str(e)}"}), 500
 