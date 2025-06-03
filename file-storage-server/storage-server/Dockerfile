FROM python:3.12-slim


WORKDIR /app


COPY . .


RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir apscheduler


EXPOSE 5001


CMD ["python", "app.py"]