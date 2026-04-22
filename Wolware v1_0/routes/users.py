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
@users_bp.route('/api/me')
@login_required

def get_me():
    if session.get('user_id') == 0:
        return jsonify({
            'id': 0,
            'username': session.get('username', 'developer'),
            'role': session.get('role', 'admin')
        })
    conn = get_db()
    user = conn.execute(
        "SELECT id, username, role FROM users WHERE id=?",
        (session['user_id'],)
    ).fetchone()
    conn.close()
    if user is None:
        return jsonify({'error': 'Utente non trovato'}), 404
    return jsonify(dict(user))

@users_bp.route('/api/users', methods=['GET'])
@login_required
@admin_required
def get_users():
    conn = get_db()
    users = conn.execute(
        "SELECT id, username, role, created_at FROM users ORDER BY created_at DESC"
    ).fetchall()
    conn.close()
    return jsonify([dict(u) for u in users])


@users_bp.route('/api/users', methods=['POST'])
@login_required
@admin_required
def create_user():
    data = request.get_json()
    if not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username e password obbligatori'}), 400
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO users (username, password_hash, role) VALUES (?,?,?)",
            (data['username'], generate_password_hash(data['password']),
             data.get('role', 'user'))
        )
        conn.commit()
        new_id = conn.execute('SELECT last_insert_rowid()').fetchone()[0]
        u = conn.execute(
            "SELECT id, username, role, created_at FROM users WHERE id=?", (new_id,)
        ).fetchone()
        conn.close()
        return jsonify(dict(u)), 201
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': 'Username già esistente'}), 409


@users_bp.route('/api/users/<int:id>', methods=['DELETE'])
@login_required
@admin_required
def delete_user(id):
    # Impedisce all'admin di eliminare se stesso
    if id == session.get('user_id'):
        return jsonify({'error': 'Non puoi eliminare te stesso'}), 400
    conn = get_db()
    conn.execute("DELETE FROM users WHERE id=?", (id,))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})


@users_bp.route('/api/users/<int:id>/password', methods=['PUT'])
@login_required
@admin_required
def change_password(id):
    data = request.get_json()
    if not data.get('password'):
        return jsonify({'error': 'Password obbligatoria'}), 400
    conn = get_db()
    conn.execute(
        "UPDATE users SET password_hash=? WHERE id=?",
        (generate_password_hash(data['password']), id)
    )
    conn.commit()
    conn.close()
    return jsonify({'ok': True})