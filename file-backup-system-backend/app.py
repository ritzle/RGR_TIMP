from flask import Flask
from flask_cors import CORS 
from auth import auth_bp 
from HomePage import HomePage_bp
from ServerDetail import ServerDetail_bp
from config import Config
from models import db
from flask_jwt_extended import JWTManager
import logging
from colorlog import ColoredFormatter
import os
from dotenv import load_dotenv

load_dotenv()  # загрузит переменные из .env

# Настройка логов
logging.getLogger('werkzeug').propagate = False
formatter = ColoredFormatter(
    "%(log_color)s[%(levelname)s] %(asctime)s - %(message)s",
    datefmt="%H:%M:%S",
    log_colors={
        'DEBUG': 'cyan',
        'INFO': 'green',
        'WARNING': 'yellow',
        'ERROR': 'red',
        'CRITICAL': 'bold_red'
    }
)
console_handler = logging.StreamHandler()
console_handler.setFormatter(formatter)
logger = logging.getLogger()
logger.setLevel(logging.DEBUG)
logger.addHandler(console_handler)

# Инициализация Flask
app = Flask(__name__)
app.config.from_object(Config)

# Настройка JWT (должно быть ДО регистрации blueprint)
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY") or "fallback-secret-key"  # Добавьте fallback
jwt = JWTManager(app)  # <-- Важно: инициализация перед blueprint

# Инициализация расширений
db.init_app(app)
CORS(app)

# Регистрация blueprint
app.register_blueprint(auth_bp)
app.register_blueprint(HomePage_bp)
app.register_blueprint(ServerDetail_bp)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # Создание таблиц, если их нет
    app.run(host="0.0.0.0", port=6005)