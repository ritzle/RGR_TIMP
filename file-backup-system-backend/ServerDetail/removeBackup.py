from flask import request, jsonify
from . import ServerDetail_bp
import requests
import logging

# Получаем логгер текущего модуля
logger = logging.getLogger(__name__)

@ServerDetail_bp.route("/api/remove-backup", methods=["DELETE"])
def api_remove_backup():
    logger.debug("-------------------------------------------------------------")

    address = request.args.get("address")
    backup_name = request.args.get("backupName")

    if not address or not backup_name:
        logger.warning("Запрос без адреса сервера или имени бэкапа")
        return jsonify({"message": "Необходимо указать адрес сервера и имя бэкапа"}), 400

    logger.info(f"Инициализация удаления бэкапа: {backup_name} на сервере: {address}")

    try:
        url = f"{address}/remove/remove-backup/{backup_name}"
        logger.debug(f"Отправка запроса на удаление на файловый сервер: {url}")

        response = requests.delete(url, timeout=5)

        if response.status_code == 200:
            logger.info(f"Бэкап {backup_name} успешно удален")
            logger.debug("-------------------------------------------------------------")
            return jsonify({"message": "Бэкап успешно удалён"}), 200
        else:
            try:
                message = response.json().get("message", "Ошибка на сервере")
            except ValueError:
                message = response.text
            logger.error(f"Ошибка со стороны сервера: {response.status_code} - {message}")
            logger.debug("-------------------------------------------------------------")
            return jsonify({"message": message}), response.status_code

    except requests.exceptions.Timeout:
        logger.error("Время ожидания ответа от сервера истекло")
        logger.debug("-------------------------------------------------------------")
        return jsonify({"message": "Время ожидания истекло"}), 408

    except Exception as e:
        logger.critical(f"Исключение при удалении бэкапа: {str(e)}")
        logger.debug("-------------------------------------------------------------")
        return jsonify({"message": f"Ошибка: {str(e)}"}), 500
