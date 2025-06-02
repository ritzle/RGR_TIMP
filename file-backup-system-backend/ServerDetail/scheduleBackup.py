from flask import request, jsonify
from . import ServerDetail_bp
import requests
import logging
from datetime import datetime

# Настройка логгера
logger = logging.getLogger(__name__)

@ServerDetail_bp.route("/api/schedule-backup", methods=["POST"])
def schedule_backup():
    """
    Создание запланированного бэкапа на сервере
    """
    logger.info("Обработка запроса на создание расписания бэкапа")

    address = request.args.get("address")
    if not address:
        logger.warning("Запрос без адреса сервера")
        return jsonify({"message": "Адрес сервера не указан"}), 400

    data = request.get_json() or {}
    schedule_type = data.get("type")
    time_value = data.get("time")
    

    comment = data.get("comment")
    if comment is None:
        comment = ""
    else:
        comment = comment.strip()


    if not schedule_type or not time_value:
        logger.warning("Не указан тип расписания или время")
        return jsonify({"message": "Необходимо указать тип расписания и время"}), 400

    try:
        if schedule_type == "daily":
            try:
                datetime.strptime(time_value, "%H:%M")
            except ValueError:
                logger.warning(f"Неверный формат времени: {time_value}")
                return jsonify({"message": "Неверный формат времени. Используйте HH:MM"}), 400

            endpoint = f"{address}/schedule/backup/create-schedule_backup-time"
            payload = {"time": time_value, "comment": comment}

        elif schedule_type == "interval":
            try:
                minutes = int(time_value)
                if minutes <= 0:
                    raise ValueError
            except ValueError:
                logger.warning(f"Неверное значение интервала: {time_value}")
                return jsonify({"message": "Интервал должен быть положительным числом (минуты)"}), 400

            endpoint = f"{address}/schedule/backup/create-schedule_backup-timer"
            payload = {"minutes": minutes, "comment": comment}

        else:
            logger.warning(f"Неизвестный тип расписания: {schedule_type}")
            return jsonify({"message": "Неверный тип расписания. Используйте 'daily' или 'interval'"}), 400

        logger.info(f"Отправка запроса на {endpoint}")
        response = requests.post(endpoint, json=payload, timeout=5)

        if response.status_code == 200:
            result = response.json()
            logger.info(f"Успешно создано расписание: {result}")
            return jsonify({
                "message": "Расписание создано",
                "schedule": result,
                "type": schedule_type,
                "time": time_value
            }), 200

        logger.error(f"Ошибка сервера: {response.status_code} - {response.text}")
        return jsonify({
            "message": response.json().get("message", "Ошибка при создании расписания"),
            "details": response.text
        }), response.status_code

    except requests.exceptions.Timeout:
        logger.error("Таймаут соединения")
        return jsonify({"message": "Сервер не отвечает"}), 408
    except requests.exceptions.RequestException as e:
        logger.error(f"Ошибка соединения: {str(e)}")
        return jsonify({"message": f"Ошибка подключения: {str(e)}"}), 502
    except Exception as e:
        logger.critical(f"Критическая ошибка: {str(e)}", exc_info=True)
        return jsonify({"message": "Внутренняя ошибка сервера"}), 500


@ServerDetail_bp.route("/api/list-schedules", methods=["GET"])
def list_schedules():
    """
    Получение списка активных расписаний
    """
    logger.info("Запрос списка расписаний")

    address = request.args.get("address")
    if not address:
        logger.warning("Запрос без адреса сервера")
        return jsonify({"message": "Адрес сервера не указан"}), 400

    try:
        endpoint = f"{address}/schedule/backup/list-schedules"
        logger.info(f"Запрос к {endpoint}")

        response = requests.get(endpoint, timeout=5)

        if response.status_code == 200:
            schedules = response.json()
            logger.info(f"Получено {len(schedules.get('jobs', []))} расписаний")
            return jsonify(schedules), 200

        logger.error(f"Ошибка сервера: {response.status_code} - {response.text}")
        return jsonify({
            "message": response.json().get("message", "Ошибка получения расписаний"),
            "details": response.text
        }), response.status_code

    except requests.exceptions.Timeout:
        logger.error("Таймаут соединения")
        return jsonify({"message": "Сервер не отвечает"}), 408
    except requests.exceptions.RequestException as e:
        logger.error(f"Ошибка соединения: {str(e)}")
        return jsonify({"message": f"Ошибка подключения: {str(e)}"}), 502
    except Exception as e:
        logger.critical(f"Критическая ошибка: {str(e)}", exc_info=True)
        return jsonify({"message": "Внутренняя ошибка сервера"}), 500

@ServerDetail_bp.route("/api/cancel-schedule", methods=["DELETE"])
def cancel_schedule():
    """
    Отмена запланированного бэкапа на файловом сервере
    """
    logger.info("Обработка запроса на отмену расписания")

    address = request.args.get("address")
    job_id = request.args.get("job_id")

    if not address or not job_id:
        logger.warning("Не указан адрес сервера или ID задания")
        return jsonify({"message": "Необходимо указать адрес сервера и ID расписания"}), 400

    try:
        endpoint = f"{address}/schedule/backup/cancel-schedule/{job_id}"
        logger.info(f"Отправка DELETE-запроса на {endpoint}")

        response = requests.delete(endpoint, timeout=5)

        if response.status_code == 200:
            logger.info(f"Расписание {job_id} успешно отменено")
            return jsonify({
                "message": f"Расписание {job_id} отменено",
                "result": response.json()
            }), 200

        logger.error(f"Ошибка сервера при отмене: {response.status_code} - {response.text}")
        return jsonify({
            "message": response.json().get("message", "Ошибка при отмене расписания"),
            "details": response.text
        }), response.status_code

    except requests.exceptions.Timeout:
        logger.error("Таймаут соединения")
        return jsonify({"message": "Сервер не отвечает"}), 408
    except requests.exceptions.RequestException as e:
        logger.error(f"Ошибка соединения: {str(e)}")
        return jsonify({"message": f"Ошибка подключения: {str(e)}"}), 502
    except Exception as e:
        logger.critical(f"Критическая ошибка: {str(e)}", exc_info=True)
        return jsonify({"message": "Внутренняя ошибка сервера"}), 500
