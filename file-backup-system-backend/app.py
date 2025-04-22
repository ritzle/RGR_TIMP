from flask import Flask
from flask_cors import CORS 
from auth import auth_bp 
from HomePage import HomePage_bp
from ServerDetail import ServerDetail_bp
from config import Config
from models import db

import logging
from colorlog import ColoredFormatter

# Убрать дублирование логов от werkzeug
logging.getLogger('werkzeug').propagate = False

# Цветной формат логов
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

# Потоковый handler
console_handler = logging.StreamHandler()
console_handler.setFormatter(formatter)

# Главный логгер
logger = logging.getLogger()
logger.setLevel(logging.DEBUG)
logger.addHandler(console_handler)

# Инициализация Flask
app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
CORS(app)

app.register_blueprint(auth_bp)
app.register_blueprint(HomePage_bp)
app.register_blueprint(ServerDetail_bp)

if __name__ == "__main__":
    app.run(debug=True)
