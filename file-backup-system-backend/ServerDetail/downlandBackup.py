from flask import request, send_file, jsonify
from . import ServerDetail_bp
import requests
import tempfile
import os
import logging

logger = logging.getLogger(__name__)

@ServerDetail_bp.route("/api/download-backup", methods=["GET"])
def api_download_backup():
    address = request.args.get("address")
    backup_name = request.args.get("backup")

    if not address or not backup_name:
        return jsonify({"message": "Не указаны адрес или имя бэкапа"}), 400

    try:
        # Корректный путь к файловому серверу
        response = requests.get(
            f"{address}/download/download_backup?name={backup_name}",
            stream=True,
            timeout=10
        )

        if response.status_code != 200:
            try:
                error_msg = response.json().get("message", "Ошибка при скачивании файла")
            except ValueError:
                error_msg = response.text or "Ошибка при скачивании файла"

            return jsonify({"message": error_msg}), response.status_code

        # Временное сохранение полученного файла
        temp_dir = tempfile.mkdtemp()
        temp_path = os.path.join(temp_dir, f"{backup_name}.zip")

        with open(temp_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)

        # Отправляем файл клиенту
        return send_file(
            temp_path,
            as_attachment=True,
            download_name=f"{backup_name}.zip",
            mimetype="application/zip"
        )

    except requests.exceptions.Timeout:
        return jsonify({"message": "Время ожидания истекло"}), 408
    except Exception as e:
        logger.exception("Ошибка при скачивании бэкапа")
        return jsonify({"message": f"Внутренняя ошибка: {str(e)}"}), 500
