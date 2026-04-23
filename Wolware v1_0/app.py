# app.py
# Entry point dell'applicazione Flask.
# La funzione create_app() inizializza Flask, il database e registra
# tutti i Blueprint. Questo file non contiene route né logica di business:
# orchestra soltanto i moduli. Viene importato da main.py per l'exe.

import os
from flask import Flask
from config import SECRET_KEY
from database import init_db
from routes.stats import stats_bp



def create_app():
    template_folder = os.environ.get('FLASK_TEMPLATES', 'templates')
    static_folder   = os.environ.get('FLASK_STATIC', 'static')

    app = Flask(__name__,
                template_folder=template_folder,
                static_folder=static_folder)
    app.secret_key = SECRET_KEY

    # Inizializza il database e crea le tabelle se non esistono
    init_db()

    # Registra i blueprint
    from auth.routes    import auth_bp
    from routes.events  import events_bp
    from routes.ditte   import ditte_bp
    from routes.pratiche import pratiche_bp
    from routes.users   import users_bp
    from routes.tariffari import tariffari_bp
    from routes.ditta_tariffario import bp as ditta_tariffario_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(events_bp)
    app.register_blueprint(ditte_bp)
    app.register_blueprint(pratiche_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(stats_bp)
    app.register_blueprint(tariffari_bp)
    app.register_blueprint(ditta_tariffario_bp)

    return app


app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5000)