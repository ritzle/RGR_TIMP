from flask import Flask
from flask_cors import CORS
from routes import register_blueprints
import os

app = Flask(__name__)
CORS(app)

#на всякий
os.makedirs("storage/files", exist_ok=True)
os.makedirs("storage/backups", exist_ok=True)

register_blueprints(app)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
