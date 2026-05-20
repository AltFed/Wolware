import os
import shutil
import tempfile
import sqlite3
from flask import Blueprint, send_file, request, jsonify
from config import DB_PATH
from auth.decorators import login_required, admin_required

bp = Blueprint('impostazioni', __name__)


@bp.route('/api/backup/export')
@login_required
@admin_required
def export_backup():
    return send_file(
        DB_PATH,
        as_attachment=True,
        download_name='wolware_backup.db',
        mimetype='application/octet-stream',
    )


@bp.route('/api/backup/import', methods=['POST'])
@login_required
@admin_required
def import_backup():
    f = request.files.get('file')
    if not f:
        return jsonify({'error': 'Nessun file ricevuto'}), 400

    with tempfile.NamedTemporaryFile(delete=False, suffix='.db') as tmp:
        tmp_path = tmp.name
        f.save(tmp_path)

    try:
        conn = sqlite3.connect(tmp_path)
        conn.execute('PRAGMA integrity_check')
        conn.close()
    except Exception:
        os.unlink(tmp_path)
        return jsonify({'error': 'File non valido o corrotto'}), 400

    shutil.copy2(tmp_path, DB_PATH)
    os.unlink(tmp_path)
    return jsonify({'ok': True})
