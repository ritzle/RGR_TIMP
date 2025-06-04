# logger.py

import logging
from logging.handlers import RotatingFileHandler
import os

# Убедись, что каталог для логов существует
if not os.path.exists("logs"):
    os.makedirs("logs")

# Настройка логгера
logger = logging.getLogger("main_logger")
logger.setLevel(logging.INFO)

# Проверка на повторное добавление обработчиков
if not logger.handlers:
    file_handler = RotatingFileHandler("logs/app.log", maxBytes=1_000_000, backupCount=3)
    file_handler.setLevel(logging.INFO)

    formatter = logging.Formatter("[%(asctime)s] %(levelname)s in %(module)s: %(message)s")
    file_handler.setFormatter(formatter)

    logger.addHandler(file_handler)
