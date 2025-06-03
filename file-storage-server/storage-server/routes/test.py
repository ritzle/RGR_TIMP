from flask import Blueprint, jsonify
import os

test_bp = Blueprint("test", __name__)

@test_bp.route("/ping", methods=["GET"])
def ping():
    return jsonify({"status": "OK", "message": "Storage API работает!"})
