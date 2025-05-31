from flask import Blueprint, request, jsonify
import os
import json
import zipfile
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
import atexit
from pathlib import Path

import logging
logger = logging.getLogger(__name__)

schedule_bp = Blueprint("schedule", __name__)

FILES_FOLDER = "storage/files"
BACKUP_FOLDER = "storage/backups"
SCHEDULED_JOBS_FILE = "storage/scheduled_jobs.json"

scheduler = BackgroundScheduler()
scheduler.start()
atexit.register(lambda: scheduler.shutdown())

def create_backup_with_comment(comment=""):
    if not os.path.exists(FILES_FOLDER) or not os.listdir(FILES_FOLDER):
        return False

    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    backup_name = f"backup_{timestamp}.zip"
    backup_path = os.path.join(BACKUP_FOLDER, backup_name)

    with zipfile.ZipFile(backup_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(FILES_FOLDER):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, FILES_FOLDER)
                zipf.write(file_path, arcname)

    return {
        "success": True,
        "backup_name": backup_name,
        "timestamp": timestamp,
        "comment": comment
    }

def load_scheduled_jobs():
    if Path(SCHEDULED_JOBS_FILE).exists():
        with open(SCHEDULED_JOBS_FILE, 'r') as f:
            try:
                jobs = json.load(f)
                for job in jobs:
                    try:
                        if job['trigger_type'] == 'interval':
                            scheduler.add_job(
                                create_backup_with_comment,
                                'interval',
                                minutes=job['minutes'],
                                args=[job['comment']],
                                id=job['id']
                            )
                        elif job['trigger_type'] == 'cron':
                            scheduler.add_job(
                                create_backup_with_comment,
                                'cron',
                                hour=job['hour'],
                                minute=job['minute'],
                                args=[job['comment']],
                                id=job['id']
                            )
                    except Exception as e:
                        print(f"Error loading job {job['id']}: {str(e)}")
            except json.JSONDecodeError:
                print("scheduled_jobs.json is empty or malformed. Skipping loading jobs.")

def save_scheduled_jobs():
    jobs = []
    for job in scheduler.get_jobs():
        trigger = str(job.trigger)
        job_data = {
            'id': job.id,
            'trigger_type': 'interval' if 'interval' in trigger else 'cron',
            'comment': job.args[0] if job.args else "",
            'created_at': datetime.now().isoformat()
        }

        if 'interval' in trigger:
            job_data['minutes'] = job.trigger.interval.total_seconds() // 60
            job_data['display_text'] = f"Каждые {int(job_data['minutes'])} минут"
        elif 'cron' in trigger:
            fields = {field.name: str(field) for field in job.trigger.fields}
            job_data['hour'] = int(fields.get('hour', '0'))
            job_data['minute'] = int(fields.get('minute', '0'))
            job_data['display_text'] = f"Ежедневно в {job_data['hour']:02d}:{job_data['minute']:02d}"

        jobs.append(job_data)

    with open(SCHEDULED_JOBS_FILE, 'w') as f:
        json.dump(jobs, f, indent=2, ensure_ascii=False)

@schedule_bp.route("/backup/create-schedule_backup-timer", methods=["POST"])
def schedule_timer_backup():
    data = request.get_json()
    minutes = data.get("minutes")
    comment = data.get("comment", "Scheduled backup (timer)")

    if not minutes or not isinstance(minutes, int) or minutes <= 0:
        return jsonify({
            "success": False,
            "error": "Invalid minutes parameter",
            "details": "Minutes should be positive integer"
        }), 400

    job_id = f"timer_{minutes}min_{datetime.now().timestamp()}"

    scheduler.add_job(
        create_backup_with_comment,
        'interval',
        minutes=minutes,
        args=[comment],
        id=job_id
    )

    save_scheduled_jobs()

    return jsonify({
        "success": True,
        "data": {
            "job_id": job_id,
            "type": "interval",
            "minutes": minutes,
            "comment": comment,
            "display_text": f"Каждые {minutes} минут",
            "next_run": str(scheduler.get_job(job_id).next_run_time)
        }
    }), 200

@schedule_bp.route("/backup/create-schedule_backup-time", methods=["POST"])
def schedule_time_backup():
    data = request.get_json()
    time_str = data.get("time")
    comment = data.get("comment", "Scheduled backup (daily)")

    try:
        hour, minute = map(int, time_str.split(":"))
        if not (0 <= hour < 24 and 0 <= minute < 60):
            raise ValueError
    except (ValueError, AttributeError):
        return jsonify({
            "success": False,
            "error": "Invalid time format",
            "details": "Expected HH:MM format (e.g. '17:00')"
        }), 400

    job_id = f"daily_{hour:02d}{minute:02d}_{datetime.now().timestamp()}"

    scheduler.add_job(
        create_backup_with_comment,
        'cron',
        hour=hour,
        minute=minute,
        args=[comment],
        id=job_id
    )

    save_scheduled_jobs()

    return jsonify({
        "success": True,
        "data": {
            "job_id": job_id,
            "type": "cron",
            "time": f"{hour:02d}:{minute:02d}",
            "comment": comment,
            "display_text": f"Ежедневно в {hour:02d}:{minute:02d}",
            "next_run": str(scheduler.get_job(job_id).next_run_time)
        }
    }), 200

@schedule_bp.route("/backup/list-schedules", methods=["GET"])
def list_schedules():
    jobs = []
    for job in scheduler.get_jobs():
        trigger = str(job.trigger)
        job_data = {
            "id": job.id,
            "comment": job.args[0] if job.args else "",
            "next_run": job.next_run_time.isoformat() if job.next_run_time else None,
            "status": "active"
        }

        if 'interval' in trigger:
            minutes = job.trigger.interval.total_seconds() // 60
            job_data.update({
                "type": "interval",
                "minutes": int(minutes),
                "display_text": f"Каждые {int(minutes)} минут"
            })
        elif 'cron' in trigger:
            fields = {field.name: str(field) for field in job.trigger.fields}
            job_data.update({
                "type": "cron",
                "time": f"{fields.get('hour','0').zfill(2)}:{fields.get('minute','0').zfill(2)}",
                "display_text": f"Ежедневно в {fields.get('hour','0').zfill(2)}:{fields.get('minute','0').zfill(2)}"
            })

        jobs.append(job_data)

    return jsonify({
        "success": True,
        "count": len(jobs),
        "jobs": jobs
    })

@schedule_bp.route("/backup/cancel-schedule/<job_id>", methods=["DELETE"])
def cancel_schedule(job_id):
    # Логирование входящего запроса

    
    logger.info(f"Received request to cancel job. ID: '{job_id}'")
    logger.debug(f"Full request path: {request.path}")
    logger.debug(f"Request args: {request.args}")

    # Проверка валидности job_id
    if not job_id or job_id == "undefined":
        logger.error(f"Invalid job ID received: '{job_id}'")
        return jsonify({
            "success": False,
            "error": "Invalid job ID",
            "details": f"Job ID cannot be empty or 'undefined'"
        }), 400

    job = scheduler.get_job(job_id)
    
    # Логирование найденного задания
    logger.debug(f"Queried job from scheduler: {job}")
    print("-----------------", job, "---------------")

    if not job:
        logger.warning(f"Job with ID '{job_id}' not found in scheduler")
        return jsonify({
            "success": False,
            "error": "Job not found",
            "details": f"Job with ID {job_id} doesn't exist"
        }), 404

    try:
        # Удаляем задание
        logger.info(f"Attempting to remove job: {job_id}")
        scheduler.remove_job(job_id)
        logger.info(f"Successfully removed job: {job_id}")

        # Обновляем файл с заданиями
        if Path(SCHEDULED_JOBS_FILE).exists():
            logger.debug(f"Updating jobs file: {SCHEDULED_JOBS_FILE}")
            
            try:
                with open(SCHEDULED_JOBS_FILE, 'r') as f:
                    jobs = json.load(f)
                    logger.debug(f"Current jobs in file: {len(jobs)}")
            except json.JSONDecodeError as e:
                logger.warning(f"Error reading jobs file: {str(e)}")
                jobs = []

            updated_jobs = [job for job in jobs if job.get('id') != job_id]
            logger.debug(f"Jobs after removal: {len(updated_jobs)}")

            with open(SCHEDULED_JOBS_FILE, 'w') as f:
                json.dump(updated_jobs, f, indent=2, ensure_ascii=False)
                logger.info(f"Successfully updated jobs file")

        logger.info(f"Job {job_id} cancelled successfully")
        return jsonify({
            "success": True,
            "message": "Job cancelled successfully",
            "cancelled_job": job_id
        })

    except Exception as e:
        logger.error(f"Error cancelling job {job_id}: {str(e)}", exc_info=True)
        return jsonify({
            "success": False,
            "error": "Internal server error",
            "details": str(e)
        }), 500


load_scheduled_jobs()
