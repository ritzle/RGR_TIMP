from flask import request, jsonify
from . import ServerDetail_bp
import requests
import logging

# Получаем логгер текущего модуля
logger = logging.getLogger(__name__)

@ServerDetail_bp.route("/api/create-backup", methods=["POST"])
def api_create_backup():
    logger.debug("-------------------------------------------------------------")

    address = request.args.get("address")
    if not address:
        logger.warning("Запрос без адреса")
        return jsonify({"message": "Адрес не указан"}), 400

    data = request.get_json() or {}
    comment = data.get("comment", "").strip()

    logger.info(f"Инициализация бэкапа для: {address}")
    logger.debug(f"Комментарий: {comment}")

    try:
        url = f"{address}/backup/create_backup"
        logger.debug(f"Отправка запроса на файловый сервер: {url}")

        response = requests.post(
            url,
            json={"comment": comment},
            timeout=5
        )

        if response.status_code == 200:
            result = response.json()
            backup_name = result.get("message", "").replace("Бэкап создан: ", "").strip()
            logger.info(f"Бэкап успешно создан: {backup_name}")
            logger.debug("-------------------------------------------------------------")
            return jsonify({
                "message": "Бэкап успешно создан",
                "backupName": backup_name
            }), 200

        else:
            logger.error(f"Ошибка со стороны сервера: {response.status_code} - {response.text}")
            logger.debug("-------------------------------------------------------------")
            return jsonify({
                "message": response.json().get("message", "Ошибка на сервере")
            }), response.status_code

    except requests.exceptions.Timeout:
        logger.error("Время ожидания ответа от сервера истекло")
        logger.debug("-------------------------------------------------------------")
        return jsonify({"message": "Время ожидания истекло"}), 408

    except Exception as e:
        logger.critical(f"💥 Исключение при создании бэкапа: {str(e)}")
        logger.debug("-------------------------------------------------------------")
        return jsonify({"message": f"Ошибка: {str(e)}"}), 500
 