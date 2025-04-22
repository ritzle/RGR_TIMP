from .upload import upload_bp
from .backup import backup_bp
from .restore import restore_bp
from .test import test_bp
from .schedule import schedule_bp

def register_blueprints(app):
    app.register_blueprint(upload_bp, url_prefix="/upload")
    app.register_blueprint(backup_bp, url_prefix="/backup")
    app.register_blueprint(restore_bp, url_prefix="/restore")
    app.register_blueprint(test_bp, url_prefix="/test")
    app.register_blueprint(schedule_bp, url_prefix="/schedule")
