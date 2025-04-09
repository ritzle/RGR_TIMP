from flask import Blueprint, jsonify, request
import os
import shutil
import zipfile

restore_bp = Blueprint("restore", __name__)

FILES_FOLDER = "storage/files"
BACKUP_FOLDER = "storage/backups"


"""
    Полное восстановление: удаляет все файлы в storage/files/
    и распаковывает архив из storage/backups/
"""
@restore_bp.route("/", methods=["POST"])
def restore_backup():
    data = request.get_json()
    backup_name = data.get("backup_name")

    if not backup_name:
        return jsonify({"message": "Имя архива не передано"}), 400

    backup_path = os.path.join(BACKUP_FOLDER, backup_name)
    if not os.path.exists(backup_path):
        return jsonify({"message": f"Архив {backup_name} не найден"}), 404

    # Удаляем всё из storage/files (полная перезапись)
    if os.path.exists(FILES_FOLDER):
        shutil.rmtree(FILES_FOLDER)
    os.makedirs(FILES_FOLDER, exist_ok=True)

    # Распаковываем архив полностью
    with zipfile.ZipFile(backup_path, 'r') as zip_ref:
        zip_ref.extractall(FILES_FOLDER)

    return jsonify({"message": f"Полное восстановление завершено из {backup_name}"}), 200


"""
    Выборочное восстановление: заменяет только совпадающие файлы
    в storage/files/ из архива
"""
@restore_bp.route("/selective", methods=["POST"])
def selective_restore():
    data = request.get_json()
    backup_name = data.get("backup_name")

    if not backup_name:
        return jsonify({"message": "Имя архива не передано"}), 400

    backup_path = os.path.join(BACKUP_FOLDER, backup_name)
    if not os.path.exists(backup_path):
        return jsonify({"message": f"Архив {backup_name} не найден"}), 404

    if not os.path.exists(FILES_FOLDER):
        return jsonify({"message": "Целевая папка не найдена"}), 500

    restored_count = 0

    with zipfile.ZipFile(backup_path, 'r') as zipf:
        existing_files = set(os.listdir(FILES_FOLDER))

        for member in zipf.namelist():
            filename = os.path.basename(member)
            if filename in existing_files:
                zipf.extract(member, FILES_FOLDER)
                restored_count += 1

    return jsonify({
        "message": f"Выборочное восстановление завершено. Обновлено файлов: {restored_count}",
        "archive": backup_name
    }), 200
