from flask import request, send_file, after_this_request
from . import ServerDetail_bp
import paramiko
import os
import logging
from datetime import datetime

# Настройка логгера
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
handler = logging.FileHandler("ssh_backup.log")
formatter = logging.Formatter('[%(asctime)s] %(levelname)s - %(message)s')
handler.setFormatter(formatter)
if not logger.handlers:
    logger.addHandler(handler)

@ServerDetail_bp.route("/api/ssh-login", methods=["POST"])
def ssh_login_and_backup():
    data = request.json
    address = data.get("address")
    username = data.get("username")
    password = data.get("password")
    port = data.get("port", 22)

    logger.info("Получен запрос SSH-бэкапа")
    logger.debug(f"Параметры: address={address}, username={username}, port={port}")

    if not all([address, username, password]):
        logger.warning("Отсутствуют обязательные параметры")
        return {"message": "Отсутствуют необходимые параметры"}, 400

    remote_backup_path = "/tmp/backup.tar.gz"
    local_backup_dir = "backups"
    os.makedirs(local_backup_dir, exist_ok=True)
    local_backup_path = os.path.join(
        local_backup_dir,
        f"backup_{address.replace('.', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.tar.gz"
    )

    try:
        logger.info(f"Подключение к SSH {address}:{port} как {username}")
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(hostname=address, port=int(port), username=username, password=password, timeout=10)

        backup_command = f"tar -czf {remote_backup_path} /home/{username}"
        logger.info(f"Выполнение команды архивации: {backup_command}")
        stdin, stdout, stderr = ssh.exec_command(backup_command)

        exit_status = stdout.channel.recv_exit_status()
        if exit_status != 0:
            error_msg = stderr.read().decode()
            logger.error(f"Ошибка создания архива: {error_msg}")
            return {"message": f"Ошибка при создании бэкапа: {error_msg}"}, 500

        logger.info(f"Архив успешно создан на {address}, скачивание...")
        sftp = ssh.open_sftp()
        sftp.get(remote_backup_path, local_backup_path)
        sftp.remove(remote_backup_path)
        sftp.close()
        ssh.close()

        logger.info(f"Бэкап успешно скачан: {local_backup_path}")

        @after_this_request
        def cleanup(response):
            try:
                os.remove(local_backup_path)
                logger.info(f"Удалён локальный файл бэкапа: {local_backup_path}")
            except Exception as e:
                logger.warning(f"Не удалось удалить файл: {local_backup_path} — {str(e)}")
            return response

        return send_file(local_backup_path, as_attachment=True, download_name=os.path.basename(local_backup_path))

    except paramiko.AuthenticationException:
        logger.warning(f"Ошибка аутентификации: {address} / {username}")
        return {"message": "Неверный логин или пароль"}, 401

    except paramiko.SSHException as e:
        logger.error(f"SSH ошибка: {str(e)}")
        return {"message": f"SSH ошибка: {str(e)}"}, 500

    except Exception as e:
        logger.exception(f"Ошибка при подключении к {address}")
        return {"message": f"Ошибка при SSH-подключении: {str(e)}"}, 500
