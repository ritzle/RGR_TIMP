from flask import Blueprint, request, jsonify, send_file
import os
import logging

# Настройка логгера
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

dowland_bp = Blueprint("dowland", __name__)

FILES_FOLDER = "storage/files"
BACKUP_FOLDER = "storage/backups"

@dowland_bp.route("/download_backup", methods=["GET"])
def download_backup():
    backup_name = request.args.get("name")

    if not backup_name:
        logger.warning("Запрос без указания имени бэкапа")
        return jsonify({"message": "Имя бэкапа не указано"}), 400

    backup_path = os.path.join(BACKUP_FOLDER, f"{backup_name}")
    logger.info(f"Попытка загрузки бэкапа: {backup_name}, путь: {backup_path}")

    if not os.path.isfile(backup_path):
        logger.error(f"Бэкап не найден: {backup_path}")
        return jsonify({"message": "Бэкап не найден"}), 404

    try:
        logger.info(f"Бэкап найден, отправка файла: {backup_path}")
        return send_file(
            backup_path,
            as_attachment=True,
            download_name=f"{backup_name}.zip",
            mimetype="application/zip"
        )
    except Exception as e:
        logger.exception(f"Ошибка при отправке файла {backup_path}: {e}")
        return jsonify({"message": f"Ошибка при отправке файла: {str(e)}"}), 500
