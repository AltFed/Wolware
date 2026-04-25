# routes/stats.py
from flask import Blueprint, jsonify
from database import get_db
from auth.decorators import login_required

stats_bp = Blueprint('stats', __name__)

@stats_bp.route('/api/stats', methods=['GET'])
@login_required
def get_stats():
    conn = get_db()
    try:
        ditte   = conn.execute('SELECT COUNT(*) FROM ditte').fetchone()[0]
        totali  = conn.execute('SELECT COUNT(*) FROM pratiche').fetchone()[0]
        aperte  = conn.execute("SELECT COUNT(*) FROM pratiche WHERE stato != 'Chiusa'").fetchone()[0]
        chiuse  = conn.execute("SELECT COUNT(*) FROM pratiche WHERE stato = 'Chiusa'").fetchone()[0]
        return jsonify({
            'ditte': ditte,
            'pratiche': {'totali': totali, 'aperte': aperte, 'chiuse': chiuse}
        })
    finally:
        conn.close()
