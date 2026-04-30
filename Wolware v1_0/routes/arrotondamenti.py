# routes/arrotondamenti.py
from flask import Blueprint, request, jsonify
from database import get_db
from auth.decorators import login_required
from routes.events import notify_all

arrotondamenti_bp = Blueprint('arrotondamenti', __name__)


@arrotondamenti_bp.route('/api/arrotondamenti', methods=['GET'])
@login_required
def get_arrotondamenti():
    ditta_id = request.args.get('ditta_id', type=int)
    if not ditta_id:
        return jsonify({'error': 'ditta_id obbligatorio'}), 400
    conn = get_db()
    try:
        rows = conn.execute(
            'SELECT * FROM arrotondamenti WHERE ditta_id=? ORDER BY data DESC',
            (ditta_id,)
        ).fetchall()
        return jsonify([dict(r) for r in rows])
    finally:
        conn.close()


@arrotondamenti_bp.route('/api/arrotondamenti', methods=['POST'])
@login_required
def create_arrotondamento():
    data = request.get_json()
    for field in ['ditta_id', 'data', 'tipo', 'importo']:
        if data.get(field) is None:
            return jsonify({'error': f'Campo obbligatorio mancante: {field}'}), 400
    if data['tipo'] not in ('abbuono', 'addebito'):
        return jsonify({'error': "tipo deve essere 'abbuono' o 'addebito'"}), 400
    importo = float(data['importo'])
    if importo < 0:
        return jsonify({'error': 'importo deve essere >= 0'}), 400
    conn = get_db()
    try:
        conn.execute(
            'INSERT INTO arrotondamenti (ditta_id, data, tipo, importo, note) VALUES (?,?,?,?,?)',
            (data['ditta_id'], data['data'], data['tipo'], importo, data.get('note'))
        )
        conn.commit()
        new_id = conn.execute('SELECT last_insert_rowid()').fetchone()[0]
        row = conn.execute('SELECT * FROM arrotondamenti WHERE id=?', (new_id,)).fetchone()
        notify_all('arrotondamento_created', dict(row))
        return jsonify(dict(row)), 201
    finally:
        conn.close()


@arrotondamenti_bp.route('/api/arrotondamenti/<int:id>', methods=['DELETE'])
@login_required
def delete_arrotondamento(id):
    conn = get_db()
    try:
        conn.execute('DELETE FROM arrotondamenti WHERE id=?', (id,))
        conn.commit()
        notify_all('arrotondamento_deleted', {'id': id})
        return jsonify({'ok': True})
    finally:
        conn.close()