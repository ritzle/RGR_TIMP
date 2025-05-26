from flask import Blueprint

ServerDetail_bp = Blueprint("ServerDetail", __name__)

from . import pingServer, getBackups, createBackup, restoreBackup, scheduleBackup, removeBackup
