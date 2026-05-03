# app.py
# Entry point dell'applicazione Flask.
# La funzione create_app() inizializza Flask, il database e registra
# tutti i Blueprint. Questo file non contiene route né logica di business:
# orchestra soltanto i moduli. Viene importato da main.py per l'exe.

import os
from flask import Flask, app
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
    from routes.pagamenti import pagamenti_bp
    from routes.arrotondamenti import arrotondamenti_bp
    from routes.strumenti import bp as strumenti_bp
    from routes.pratiche_richiesta import bp as pratiche_richiesta_bp
    from routes.fatture             import bp as fatture_bp
    from routes.estratto            import bp as estratto_bp
    from routes.previsionale        import bp as previsionale_bp
    from routes.solleciti           import bp as solleciti_bp
    from routes.prima_nota          import bp as prima_nota_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(events_bp)
    app.register_blueprint(ditte_bp)
    app.register_blueprint(pratiche_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(stats_bp)
    app.register_blueprint(tariffari_bp)
    app.register_blueprint(ditta_tariffario_bp)
    app.register_blueprint(pagamenti_bp)
    app.register_blueprint(arrotondamenti_bp)
    app.register_blueprint(strumenti_bp)
    app.register_blueprint(pratiche_richiesta_bp)
    app.register_blueprint(fatture_bp)
    app.register_blueprint(estratto_bp)
    app.register_blueprint(previsionale_bp)
    app.register_blueprint(solleciti_bp)
    app.register_blueprint(prima_nota_bp)

    return app


app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
