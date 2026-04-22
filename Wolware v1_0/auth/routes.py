# auth/routes.py
# Blueprint 'auth' — route di autenticazione.
# GET  /        → app principale (protetta)
# GET  /login   → pagina di login
# POST /login   → verifica credenziali, crea sessione
# GET  /logout  → distrugge la sessione e torna al login

from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for
from werkzeug.security import check_password_hash
from database import get_db
from auth.decorators import login_required

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/')
@login_required
def index():
    return render_template('index.html')


@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    # Se già loggato vai diretto all'app
    if 'user_id' in session:
        return redirect(url_for('auth.index'))

    if request.method == 'POST':
        data = request.get_json()
        conn = get_db()
        user = conn.execute(
            "SELECT * FROM users WHERE username=?", (data['username'],)
        ).fetchone()
        conn.close()

        if user and check_password_hash(user['password_hash'], data['password']):
            session['user_id']  = user['id']
            session['role']     = user['role']
            session['username'] = user['username']
            return jsonify({'ok': True, 'role': user['role']})

        return jsonify({'error': 'Credenziali errate'}), 401

    return render_template('login.html')


@auth_bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('auth.login'))