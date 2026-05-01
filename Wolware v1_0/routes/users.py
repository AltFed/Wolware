# routes/users.py
# Blueprint 'users' — API REST per la gestione degli utenti.
# Accessibile solo agli admin (@admin_required).
# GET    /api/users                  → lista tutti gli utenti
# POST   /api/users                  → crea un nuovo utente
# DELETE /api/users/<id>             → elimina un utente
# PUT    /api/users/<id>/password    → cambia password a un utente

import sqlite3
from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash
from database import get_db
from auth.decorators import login_required, admin_required

users_bp = Blueprint('users', __name__)

VALID_ROLES = ('admin', 'user')


# ── GET /api/me ────────────────────────────────────────────────────────────────
@users_bp.route('/api/me')
@login_required
def get_me():
    if session.get('user_id') == 0:
        return jsonify({
            'id': 0,
            'username': session.get('username', 'developer'),
            'role': session.get('role', 'admin'),
        })
    conn = get_db()
    try:
        user = conn.execute(
            "SELECT id, username, role FROM users WHERE id=?",
            (session['user_id'],)
        ).fetchone()
        if user is None:
            return jsonify({'error': 'Utente non trovato'}), 404
        return jsonify(dict(user))
    finally:
        conn.close()


# ── GET /api/users ─────────────────────────────────────────────────────────────
@users_bp.route('/api/users', methods=['GET'])
@login_required
@admin_required
def get_users():
    conn = get_db()
    try:
        users = conn.execute(
            "SELECT id, username, role, created_at FROM users ORDER BY created_at DESC"
        ).fetchall()
        return jsonify([dict(u) for u in users])
    finally:
        conn.close()


# ── POST /api/users ────────────────────────────────────────────────────────────
@users_bp.route('/api/users', methods=['POST'])
@login_required
@admin_required
def create_user():
    data = request.get_json()
    if not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username e password obbligatori'}), 400

    # FIX: validazione del ruolo — accetta solo valori noti
    role = data.get('role', 'user')
    if role not in VALID_ROLES:
        return jsonify({'error': f'Ruolo non valido. Valori ammessi: {", ".join(VALID_ROLES)}'}), 400

    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO users (username, password_hash, role) VALUES (?,?,?)",
            (data['username'], generate_password_hash(data['password']), role)
        )
        conn.commit()
        new_id = conn.execute('SELECT last_insert_rowid()').fetchone()[0]
        u = conn.execute(
            "SELECT id, username, role, created_at FROM users WHERE id=?", (new_id,)
        ).fetchone()
        return jsonify(dict(u)), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Username già esistente'}), 409
    finally:
        conn.close()


# ── DELETE /api/users/<id> ─────────────────────────────────────────────────────
@users_bp.route('/api/users/<int:id>', methods=['DELETE'])
@login_required
@admin_required
def delete_user(id):
    if id == session.get('user_id'):
        return jsonify({'error': 'Non puoi eliminare te stesso'}), 400
    conn = get_db()
    try:
        conn.execute("DELETE FROM users WHERE id=?", (id,))
        conn.commit()
        return jsonify({'ok': True})
    finally:
        conn.close()


# ── PUT /api/users/<id>/password ───────────────────────────────────────────────
@users_bp.route('/api/users/<int:id>/password', methods=['PUT'])
@login_required
@admin_required
def change_password(id):
    data = request.get_json()
    if not data.get('password'):
        return jsonify({'error': 'Password obbligatoria'}), 400
    conn = get_db()
    try:
        conn.execute(
            "UPDATE users SET password_hash=? WHERE id=?",
            (generate_password_hash(data['password']), id)
        )
        conn.commit()
        return jsonify({'ok': True})
    finally:
        conn.close()

# ── PUT /api/users/<id>/role ───────────────────────────────────────────────────
@users_bp.route('/api/users/<int:id>/role', methods=['PUT'])
@login_required
@admin_required
def change_role(id):
    if id == session.get('user_id'):
        return jsonify({'error': 'Non puoi cambiare il tuo stesso ruolo'}), 400
    data = request.get_json()
    role = data.get('role', '')
    if role not in VALID_ROLES:
        return jsonify({'error': f'Ruolo non valido. Valori ammessi: {", ".join(VALID_ROLES)}'}), 400
    conn = get_db()
    try:
        conn.execute('UPDATE users SET role=? WHERE id=?', (role, id))
        conn.commit()
        u = conn.execute(
            'SELECT id, username, role, created_at FROM users WHERE id=?', (id,)
        ).fetchone()
        return jsonify(dict(u))
    finally:
        conn.close()
        
# ── PUT /api/users/<id>/username ───────────────────────────────────────────────
@users_bp.route('/api/users/<int:id>/username', methods=['PUT'])
@login_required
@admin_required
def change_username(id):
    data = request.get_json()
    username = (data.get('username') or '').strip()
    if not username:
        return jsonify({'error': 'Username obbligatorio'}), 400
    conn = get_db()
    try:
        conn.execute('UPDATE users SET username=? WHERE id=?', (username, id))
        conn.commit()
        u = conn.execute(
            'SELECT id, username, role, created_at FROM users WHERE id=?', (id,)
        ).fetchone()
        return jsonify(dict(u))
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Username già esistente'}), 409
    finally:
        conn.close()