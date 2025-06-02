from flask import request, jsonify
from . import ServerDetail_bp
from models import db, User, Server
from utils import generate_code, send_email

import logging
import requests



logging.basicConfig(level=logging.INFO)

@ServerDetail_bp.route("/api/ping-server", methods=["GET"])
def ping_server():
    address = request.args.get("address")
    if not address:
        return jsonify({"status": "error", "message": "Адрес не указан"}), 400

    try:
        logging.info(f"проверка адресса: {address}")
        response = requests.get(f"{address}/test/ping", timeout=3)
        data = response.json()
        return jsonify(data)
    except requests.exceptions.Timeout:
        return jsonify({"status": "timeout", "message": "Время ожидания истекло"}), 408
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    


@ServerDetail_bp.route("/api/ping-host", methods=["GET"])
def ping_host():
    """
    Проверяет доступность хоста по HTTP/HTTPS
    Возвращает:
    - 200 OK: если хост отвечает (любой HTTP код)
    - Ошибки: при проблемах с подключением
    """
    address = request.args.get("address")
    if not address:
        return jsonify({"status": "error", "message": "Адрес не указан"}), 400

    try:
        logging.info(f"Проверка доступности хоста: {address}")
        
        # Нормализация адреса (добавляем http:// если нет схемы)
        if not address.startswith(('http://', 'https://')):
            address = f'http://{address}'

        # Делаем HEAD-запрос вместо GET (только проверка соединения)
        response = requests.head(
            address,
            timeout=3,
            allow_redirects=True,  # Проверяем с учетом редиректов
            headers={'User-Agent': 'ServerAvailabilityChecker/1.0'}
        )
        
        # Любой ответ считается успехом (даже 404/500)
        return jsonify({
            "status": "available",
            "code": response.status_code,
            "url": response.url  # Финальный URL после редиректов
        })

    except requests.exceptions.Timeout:
        logging.warning(f"Таймаут при проверке {address}")
        return jsonify({
            "status": "timeout", 
            "message": "Сервер не ответил за 3 секунды"
        }), 408
        
    except requests.exceptions.SSLError:
        logging.warning(f"Ошибка SSL для {address}")
        return jsonify({
            "status": "ssl_error",
            "message": "Проблема с SSL сертификатом"
        }), 525  # Cloudflare's SSL Handshake Failed
        
    except requests.exceptions.ConnectionError as e:
        logging.warning(f"Ошибка подключения к {address}: {str(e)}")
        return jsonify({
            "status": "unreachable",
            "message": "Не удалось установить соединение",
            "details": str(e)
        }), 503
        
    except Exception as e:
        logging.error(f"Неожиданная ошибка при проверке {address}: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Внутренняя ошибка при проверке",
            "details": str(e)
        }), 500