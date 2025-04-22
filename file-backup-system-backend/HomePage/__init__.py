from flask import Blueprint

HomePage_bp = Blueprint("HomePage", __name__)

from . import updateProfile, addServer, getUserServers
