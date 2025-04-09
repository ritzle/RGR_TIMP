from flask import Blueprint, jsonify
import os
import zipfile
from datetime import datetime

backup_bp = Blueprint("backup", __name__)

FILES_FOLDER = "storage/files"
BACKUP_FOLDER = "storage/backups"

@backup_bp.route("/", methods=["POST"])
def create_backup():
    # Проверка, что папка с файлами существует
    if not os.path.exists(FILES_FOLDER) or not os.listdir(FILES_FOLDER):
        return jsonify({"message": "Нет файлов для бэкапа"}), 400

    #имя архива
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    backup_name = f"backup_{timestamp}.zip"
    backup_path = os.path.join(BACKUP_FOLDER, backup_name)

    # Создаём архив
    with zipfile.ZipFile(backup_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(FILES_FOLDER):
            for file in files:
                file_path = os.path.join(root, file)

                zipf.write(file_path, os.path.relpath(file_path, FILES_FOLDER))

    return jsonify({"message": f"Бэкап создан: {backup_name}"}), 200
