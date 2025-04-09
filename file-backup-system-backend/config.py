import os


from dotenv import load_dotenv
load_dotenv()  # загрузит переменные из .env


class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv("SECRET_KEY")
    MAIL_SENDER = os.getenv("MAIL_SENDER")
    MAIL_PASSWORD= os.getenv("MAIL_PASSWORD")