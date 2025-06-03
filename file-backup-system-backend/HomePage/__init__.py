from flask import Blueprint
from flask_cors import CORS


HomePage_bp = Blueprint("HomePage", __name__)

CORS(HomePage_bp)
from . import updateProfile, addServer, getUserServers, deleteServer, mail
