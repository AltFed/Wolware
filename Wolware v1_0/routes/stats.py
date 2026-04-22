# routes/stats.py
# Blueprint 'stats' — API REST per le statistiche generali della dashboard.
# GET /api/stats → restituisce conteggio ditte e pratiche (totali, aperte, chiuse)
# Usata dalla home per animare le KPI card tramite animateValue().

from flask import Blueprint, jsonify
from database import get_db
from auth.decorators import login_required

stats_bp = Blueprint('stats', __name__)

@stats_bp.route('/api/stats', methods=['GET'])
@login_required
def get_stats():
    conn = get_db()
    ditte = conn.execute('SELECT COUNT(*) FROM ditte').fetchone()[0]
    totali = conn.execute('SELECT COUNT(*) FROM pratiche').fetchone()[0]
    aperte = conn.execute(
        "SELECT COUNT(*) FROM pratiche WHERE stato != 'Chiusa'"
    ).fetchone()[0]
    chiuse = conn.execute(
        "SELECT COUNT(*) FROM pratiche WHERE stato = 'Chiusa'"
    ).fetchone()[0]
    conn.close()
    return jsonify({
        'ditte': ditte,
        'pratiche': {
            'totali': totali,
            'aperte': aperte,
            'chiuse': chiuse
        }
    })