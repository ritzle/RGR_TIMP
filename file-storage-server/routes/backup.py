from flask import Blueprint, request, jsonify
import os
import json
import zipfile
from datetime import datetime

backup_bp = Blueprint("backup", __name__)

FILES_FOLDER = "storage/files"
BACKUP_FOLDER = "storage/backups"

def create_backup_with_comment(comment=""):
    if not os.path.exists(FILES_FOLDER) or not os.listdir(FILES_FOLDER):
        return False

    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    backup_name = f"backup_{timestamp}.zip"
    backup_path = os.path.join(BACKUP_FOLDER, backup_name)

    with zipfile.ZipFile(backup_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(FILES_FOLDER):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, FILES_FOLDER)
                zipf.write(file_path, arcname)

    comment_filename = f"{backup_name}.json"
    comment_path = os.path.join(BACKUP_FOLDER, comment_filename)
    with open(comment_path, "w", encoding="utf-8") as f:
        json.dump({
            "comment": comment,
            "created_at": timestamp
        }, f, ensure_ascii=False, indent=2)

    return {
        "success": True,
        "backup_name": backup_name,
        "timestamp": timestamp,
        "comment": comment
    }



@backup_bp.route("/list_backup", methods=["GET"])
def list_backups():
    if not os.path.exists(BACKUP_FOLDER):
        return jsonify({"backups": {}})

    result = {}

    for file in os.listdir(BACKUP_FOLDER):
        if file.endswith(".zip"):
            base_name = file
            comment_file = os.path.join(BACKUP_FOLDER, f"{file}.json")
            comment = ""

            if os.path.exists(comment_file):
                try:
                    with open(comment_file, "r", encoding="utf-8") as f:
                        comment_data = json.load(f)
                        comment = comment_data.get("comment", "")
                except Exception as e:
                    comment = f"[Ошибка чтения комментария: {str(e)}]"

            result[base_name] = comment

    return jsonify({"backups": result})


@backup_bp.route("/create_backup", methods=["POST"])
def create_backup():
    data = request.get_json() or {}
    comment = data.get("comment", "").strip()

    try:
        result = create_backup_with_comment(comment)
        if not result:
            return jsonify({"message": "Нет файлов для создания бэкапа"}), 400

        return jsonify({
            "message": "Бэкап успешно создан",
            "backupName": result["backup_name"],
            "timestamp": result["timestamp"],
            "comment": result["comment"]
        }), 200

    except Exception as e:
        return jsonify({"message": f"Ошибка при создании бэкапа: {str(e)}"}), 500