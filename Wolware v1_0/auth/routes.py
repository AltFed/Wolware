# auth/routes.py
# Blueprint 'auth' — route di autenticazione.
# GET  /        → app principale (protetta)
# GET  /login   → pagina di login
# POST /login   → verifica credenziali, crea sessione
# PUT  /api/users/me/password → cambia password utente loggato
# GET  /logout  → distrugge la sessione e torna al login

from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for
from werkzeug.security import check_password_hash, generate_password_hash  # ← aggiunto generate_password_hash qui
from database import get_db
from auth.decorators import login_required  # ← un solo import, in cima

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/')
@login_required
def index():
    return render_template('index.html')


@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
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


@auth_bp.route('/api/users/me/password', methods=['PUT'])
@login_required
def change_password():
    data = request.get_json()
    vecchia  = data.get('vecchia_password', '')
    nuova    = data.get('nuova_password', '')
    conferma = data.get('conferma_password', '')

    if not vecchia or not nuova or not conferma:
        return jsonify({'error': 'Tutti i campi sono obbligatori'}), 400
    if nuova != conferma:
        return jsonify({'error': 'La nuova password e la conferma non coincidono'}), 400
    if len(nuova) < 6:
        return jsonify({'error': 'La nuova password deve essere di almeno 6 caratteri'}), 400

    conn = get_db()
    try:
        user = conn.execute(
            "SELECT * FROM users WHERE id=?", (session['user_id'],)
        ).fetchone()

        if not user or not check_password_hash(user['password_hash'], vecchia):
            return jsonify({'error': 'La password attuale non è corretta'}), 401

        conn.execute(
            "UPDATE users SET password_hash=? WHERE id=?",
            (generate_password_hash(nuova), session['user_id'])
        )
        conn.commit()
        return jsonify({'ok': True})
    finally:
        conn.close()


@auth_bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('auth.login'))