# routes/pagamenti.py
from flask import Blueprint, request, jsonify
from database import get_db
from auth.decorators import login_required
from routes.events import notify_all

pagamenti_bp = Blueprint('pagamenti', __name__)


@pagamenti_bp.route('/api/pagamenti', methods=['GET'])
@login_required
def get_pagamenti():
    ditta_id = request.args.get('ditta_id', type=int)
    anno     = request.args.get('anno', type=int)
    if not ditta_id:
        return jsonify({'error': 'ditta_id obbligatorio'}), 400
    conn = get_db()
    try:
        query  = 'SELECT * FROM pagamenti WHERE ditta_id=?'
        params = [ditta_id]
        if anno:
            query += " AND strftime('%Y', data) = ?"
            params.append(str(anno))
        query += ' ORDER BY data DESC'
        rows = conn.execute(query, params).fetchall()
        return jsonify([dict(r) for r in rows])
    finally:
        conn.close()


@pagamenti_bp.route('/api/pagamenti', methods=['POST'])
@login_required
def create_pagamento():
    data = request.get_json()
    for field in ['ditta_id', 'data', 'importo']:
        if data.get(field) is None:
            return jsonify({'error': f'Campo obbligatorio mancante: {field}'}), 400
    importo = float(data['importo'])
    if importo <= 0:
        return jsonify({'error': 'importo deve essere > 0'}), 400

    conn = get_db()
    try:
        conn.execute(
            '''INSERT INTO pagamenti (ditta_id, data, importo, metodo, note)
               VALUES (?, ?, ?, ?, ?)''',
            (
                data['ditta_id'],
                data['data'],
                importo,
                data.get('metodo', ''),
                data.get('note', ''),
            )
        )
        conn.commit()
        new_id = conn.execute('SELECT last_insert_rowid()').fetchone()[0]
        row    = conn.execute('SELECT * FROM pagamenti WHERE id=?', (new_id,)).fetchone()
        notify_all('pagamento_created', dict(row))
        return jsonify(dict(row)), 201
    finally:
        conn.close()


@pagamenti_bp.route('/api/pagamenti/<int:id>', methods=['DELETE'])
@login_required
def delete_pagamento(id):
    conn = get_db()
    try:
        row = conn.execute(
            'SELECT ditta_id FROM pagamenti WHERE id=?', (id,)
        ).fetchone()
        if not row:
            return jsonify({'error': 'Pagamento non trovato'}), 404
        conn.execute('DELETE FROM pagamenti WHERE id=?', (id,))
        conn.commit()
        notify_all('pagamento_deleted', {'id': id, 'ditta_id': row['ditta_id']})
        return jsonify({'ok': True})
    finally:
        conn.close()