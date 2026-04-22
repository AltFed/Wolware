# auth/decorators.py
# Decorator riutilizzabili per proteggere le route.
# @login_required  → blocca utenti non autenticati
# @admin_required  → blocca utenti non admin
# In DEBUG_MODE entrambi i decorator vengono bypassati automaticamente.

from functools import wraps
from flask import session, redirect, url_for, jsonify, request
from config import DEBUG_MODE, DEBUG_USER


def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if DEBUG_MODE:
            session['user_id']  = DEBUG_USER['id']
            session['role']     = DEBUG_USER['role']
            session['username'] = DEBUG_USER['username']
            return f(*args, **kwargs)
        if 'user_id' not in session:
            if request.path.startswith('/api/'):
                return jsonify({'error': 'Non autenticato'}), 401
            return redirect(url_for('auth.login'))
        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if DEBUG_MODE or session.get('role') == 'admin':
            return f(*args, **kwargs)
        return jsonify({'error': 'Accesso negato'}), 403
    return decorated