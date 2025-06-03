FROM ubuntu:22.04

# Установка необходимых пакетов
RUN apt-get update && \
    apt-get install -y openssh-server sudo && \
    mkdir /var/run/sshd

# Создание тестового пользователя: username `test`, пароль `test`
RUN useradd -m test && echo "test:test" | chpasswd && adduser test sudo

# Разрешить вход по паролю
RUN sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config && \
    sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config && \
    echo "PermitRootLogin no" >> /etc/ssh/sshd_config

# Открываем порт 22
EXPOSE 22

# Запуск SSH-сервера
CMD ["/usr/sbin/sshd", "-D"]
