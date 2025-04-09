import random
import smtplib
from email.mime.text import MIMEText
from config import Config

def generate_code():
    return str(random.randint(100000, 999999))

def send_email(to_email, code):
    msg = MIMEText(f"Ваш код подтверждения: {code}")
    msg["Subject"] = "Подтверждение почты"
    msg["From"] = Config.MAIL_SENDER
    msg["To"] = to_email

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(Config.MAIL_SENDER, Config.MAIL_PASSWORD)  # пароль приложения (не обычный!)
            server.send_message(msg)
        return True
    except Exception as e:
        print("Ошибка при отправке:", e)
        return False
