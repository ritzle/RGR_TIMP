from flask import Blueprint, request, jsonify
import os

upload_bp = Blueprint("upload", __name__)
UPLOAD_FOLDER = "storage/files"

@upload_bp.route("/", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"message": "Файл не найден"}), 400

    file = request.files["file"]
    file.save(os.path.join(UPLOAD_FOLDER, file.filename))
    return jsonify({"message": f"Файл {file.filename} загружен"}), 200
