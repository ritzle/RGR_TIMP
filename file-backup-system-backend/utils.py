import random
import smtplib
from email.mime.text import MIMEText
from email.utils import formataddr
from config import Config
import jwt
import os
from datetime import datetime, timedelta
from logger import logger  # Добавляем логгер


SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fallback-secret-key")
REFRESH_SECRET_KEY = os.getenv("JWT_REFRESH_SECRET_KEY", "fallback-refresh-secret-key")

# Время жизни токенов (можно вынести в конфиг)
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # 30 минут для access token
REFRESH_TOKEN_EXPIRE_DAYS = 7     # 7 дней для refresh token

def decode_token(token, is_refresh=False):
    """
    Декодирует JWT токен (access или refresh) и возвращает payload
    Возвращает None при ошибке или истечении срока
    """
    secret_key = REFRESH_SECRET_KEY if is_refresh else SECRET_KEY
    
    try:
        payload = jwt.decode(token, secret_key, algorithms=["HS256"])
        
        # Проверяем наличие обязательных полей
        if "sub" not in payload:
            logger.warning("Токен не содержит идентификатора пользователя (sub)")
            return None
            
        return {
            "email": payload["sub"],  # Используем стандартное поле sub
            "exp": payload.get("exp"),  # Срок действия
            "type": "refresh" if is_refresh else "access"  # Тип токена
        }
        
    except jwt.ExpiredSignatureError:
        logger.warning("Срок действия токена истек")
        return None
    except jwt.InvalidTokenError as e:
        logger.warning(f"Невалидный токен: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Ошибка декодирования токена: {str(e)}")
        return None

def generate_code(length=6):
    """Генерирует случайный цифровой код подтверждения"""
    return ''.join(random.choices('0123456789', k=length))

def create_access_token(email, expires_delta=None):
    """
    Создает JWT access токен
    """
    expires_delta = expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    try:
        payload = {
            "sub": email,
            "exp": datetime.utcnow() + expires_delta,
            "iat": datetime.utcnow(),
            "type": "access"  # Явно указываем тип токена
        }
        return jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    except Exception as e:
        logger.error(f"Ошибка создания access токена: {str(e)}")
        return None

def create_refresh_token(email, expires_delta=None):
    """
    Создает JWT refresh токен (долгоживущий)
    """
    expires_delta = expires_delta or timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    try:
        payload = {
            "sub": email,
            "exp": datetime.utcnow() + expires_delta,
            "iat": datetime.utcnow(),
            "type": "refresh"  # Явно указываем тип токена
        }
        return jwt.encode(payload, REFRESH_SECRET_KEY, algorithm="HS256")
    except Exception as e:
        logger.error(f"Ошибка создания refresh токена: {str(e)}")
        return None

def refresh_tokens(refresh_token):
    """
    Обновляет пару токенов (access + refresh) по валидному refresh токену
    Возвращает новую пару токенов или None при ошибке
    """
    # Декодируем refresh токен (с проверкой типа)
    payload = decode_token(refresh_token, is_refresh=True)
    if not payload or payload.get("type") != "refresh":
        logger.warning("Невалидный refresh токен")
        return None

    # Создаем новую пару токенов
    email = payload["email"]
    new_access_token = create_access_token(email)
    new_refresh_token = create_refresh_token(email)
    
    if not new_access_token or not new_refresh_token:
        return None

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token
    }

def send_email(to_email, code):
    """
    Отправляет email с кодом подтверждения
    Возвращает True при успехе, False при ошибке
    """
    if not all([Config.MAIL_SENDER, Config.MAIL_PASSWORD, to_email]):
        logger.error("Не хватает данных для отправки email")
        return False

    # Формируем сообщение
    message = f"""
    <h2>Подтверждение почты</h2>
    <p>Ваш код подтверждения: <strong>{code}</strong></p>
    <p>Код действителен в течение 5 минут.</p>
    """
    
    msg = MIMEText(message, "html")
    msg["Subject"] = "Код подтверждения для File Backup System"
    msg["From"] = formataddr(("File Backup System", Config.MAIL_SENDER))
    msg["To"] = to_email

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(Config.MAIL_SENDER, Config.MAIL_PASSWORD)
            server.send_message(msg)
        logger.info(f"Письмо с кодом отправлено на {to_email}")
        return True
        
    except smtplib.SMTPAuthenticationError:
        logger.error("Ошибка аутентификации SMTP: неверные учетные данные")
    except smtplib.SMTPException as e:
        logger.error(f"Ошибка SMTP: {str(e)}")
    except Exception as e:
        logger.error(f"Неожиданная ошибка при отправке email: {str(e)}")
        
    return False