# routes/rendiconto.py
# Blueprint Rendiconto Studio — Volume 4
# Aggrega pagamenti, movimenti studio, giroconti per anno/mese.

from flask import Blueprint, jsonify, session
from functools import wraps

bp = Blueprint('rendiconto', __name__)


def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Non autenticato'}), 401
        return f(*args, **kwargs)
    return decorated


@bp.get('/api/rendiconto/ping')
@login_required
def ping():
    return jsonify({'ok': True})
