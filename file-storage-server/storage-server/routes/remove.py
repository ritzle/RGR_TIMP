from flask import Blueprint, request, jsonify
import os

remove_bp = Blueprint("remove", __name__)

BACKUP_FOLDER = "storage/backups"

@remove_bp.route("/remove-backup/<backup_name>", methods=["DELETE"])
def remove_backup(backup_name):
    try:
        # Проверка на наличие запрещённых символов в имени файла
        if '../' in backup_name or '~' in backup_name:
            return jsonify({
                "message": "Некорректное имя бэкапа"
            }), 400

        # Путь к архиву и к файлу с комментарием
        backup_path = os.path.join(BACKUP_FOLDER, backup_name)
        comment_path = os.path.join(BACKUP_FOLDER, f"{backup_name}.json")

        # Проверка существования бэкапа
        if not os.path.exists(backup_path):
            return jsonify({
                "message": f"Бэкап {backup_name} не найден",
                "backup_exists": False
            }), 404

        # Удаление архива
        os.remove(backup_path)
        
        # Удаление файла с комментарием (если он есть)
        comment_deleted = False
        if os.path.exists(comment_path):
            os.remove(comment_path)
            comment_deleted = True

        return jsonify({
            "message": f"Бэкап {backup_name} успешно удалён",
            "backup_deleted": True,
            "comment_deleted": comment_deleted
        }), 200

    except PermissionError:
        return jsonify({
            "message": "Ошибка прав доступа при удалении файлов"
        }), 403
        
    except Exception as e:
        return jsonify({
            "message": f"Ошибка при удалении бэкапа: {str(e)}",
            "error_type": type(e).__name__
        }), 500