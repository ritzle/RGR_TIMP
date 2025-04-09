from flask import Flask
from flask_cors import CORS 
from auth import auth_bp 
from config import Config
from models import db

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
CORS(app)  

app.register_blueprint(auth_bp)

if __name__ == "__main__":
    app.run(debug=True)

