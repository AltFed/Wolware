# routes/pratiche.py
# Blueprint 'pratiche' — API REST per le voci di costo per mese.
#
# GET    /api/pratiche?ditta_id=X&anno=Y       → voci del cliente per anno
# GET    /api/pratiche?ditta_id=X&anno=Y&mese=M → voci del cliente per mese
# POST   /api/pratiche                          → crea una voce
# PUT    /api/pratiche/<id>                     → aggiorna una voce
# DELETE /api/pratiche/<id>                     → elimina una voce

from flask import Blueprint, request, jsonify
from database import get_db
from auth.decorators import login_required
from routes.events import notify_all

pratiche_bp = Blueprint('pratiche', __name__)


@pratiche_bp.route('/api/pratiche', methods=['GET'])
@login_required
def get_pratiche():
    ditta_id = request.args.get('ditta_id', type=int)
    anno     = request.args.get('anno',     type=int)
    mese     = request.args.get('mese',     type=int)

    if not ditta_id or not anno:
        return jsonify({'error': 'ditta_id e anno sono obbligatori'}), 400

    query  = 'SELECT * FROM pratiche WHERE ditta_id=? AND anno=?'
    params = [ditta_id, anno]
    if mese:
        query  += ' AND mese=?'
        params.append(mese)
    query += ' ORDER BY mese DESC, id ASC'

    conn = get_db()
    try:
        rows = conn.execute(query, params).fetchall()
        return jsonify([dict(r) for r in rows])
    finally:
        conn.close()


@pratiche_bp.route('/api/pratiche', methods=['POST'])
@login_required
def create_pratica():
    data = request.get_json()

    required = ['ditta_id', 'anno', 'mese', 'nome']
    for field in required:
        if not data.get(field):
            return jsonify({'error': f'Campo obbligatorio mancante: {field}'}), 400

    mese = int(data['mese'])
    if not 1 <= mese <= 12:
        return jsonify({'error': 'mese deve essere tra 1 e 12'}), 400

    quantita = float(data.get('quantita', 1.0))
    prezzo   = float(data.get('prezzo',   0.0))
    importo  = round(quantita * prezzo, 2)

    conn = get_db()
    try:
        conn.execute('''
            INSERT INTO pratiche
                (ditta_id, anno, mese, tipo, macrogruppo_id, macrogruppo_nome,
                 voce_id, nome, quantita, prezzo, importo, esente_iva,
                 data_esecuzione, note)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ''', (
            data['ditta_id'],
            data['anno'],
            mese,
            data.get('tipo', 'costo_fisso'),
            data.get('macrogruppo_id'),
            data.get('macrogruppo_nome'),
            data.get('voce_id'),
            data['nome'],
            quantita,
            prezzo,
            importo,
            int(data.get('esente_iva', 0)),
            data.get('data_esecuzione'),
            data.get('note'),
        ))
        conn.commit()
        new_id = conn.execute('SELECT last_insert_rowid()').fetchone()[0]
        row = conn.execute('SELECT * FROM pratiche WHERE id=?', (new_id,)).fetchone()
        notify_all('pratica_created', dict(row))
        return jsonify(dict(row)), 201
    finally:
        conn.close()


@pratiche_bp.route('/api/pratiche/<int:id>', methods=['PUT'])
@login_required
def update_pratica(id):
    data = request.get_json()

    quantita = float(data.get('quantita', 1.0))
    prezzo   = float(data.get('prezzo',   0.0))
    importo  = round(quantita * prezzo, 2)

    conn = get_db()
    try:
        conn.execute('''
            UPDATE pratiche SET
                tipo=?, macrogruppo_id=?, macrogruppo_nome=?, voce_id=?,
                nome=?, quantita=?, prezzo=?, importo=?, esente_iva=?,
                data_esecuzione=?, note=?
            WHERE id=?
        ''', (
            data.get('tipo', 'costo_fisso'),
            data.get('macrogruppo_id'),
            data.get('macrogruppo_nome'),
            data.get('voce_id'),
            data.get('nome'),
            quantita,
            prezzo,
            importo,
            int(data.get('esente_iva', 0)),
            data.get('data_esecuzione'),
            data.get('note'),
            id,
        ))
        conn.commit()
        row = conn.execute('SELECT * FROM pratiche WHERE id=?', (id,)).fetchone()
        notify_all('pratica_updated', dict(row))
        return jsonify(dict(row))
    finally:
        conn.close()


@pratiche_bp.route('/api/pratiche/<int:id>', methods=['DELETE'])
@login_required
def delete_pratica(id):
    conn = get_db()
    try:
        conn.execute('DELETE FROM pratiche WHERE id=?', (id,))
        conn.commit()
        notify_all('pratica_deleted', {'id': id})
        return jsonify({'ok': True})
    finally:
        conn.close()