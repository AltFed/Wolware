# routes/arrotondamenti.py
from flask import Blueprint, request, jsonify
from database import get_db
from auth.decorators import login_required
from routes.events import notify_all

arrotondamenti_bp = Blueprint('arrotondamenti', __name__)


# ─── Helper calcolo residuo (usato anche da solleciti.py) ────────────────────

def calcola_residuo(db, ditta_id):
    """
    Calcola il saldo attuale del cliente:
    residuo_iniziale + pratiche (+ IVA su imponibili) - pagamenti - arrotondamenti/addebiti
    """
    ditta = db.execute(
        'SELECT residuo_iniziale FROM ditte WHERE id=?', (ditta_id,)
    ).fetchone()
    residuo_iniziale = float(ditta['residuo_iniziale'] or 0) if ditta else 0.0

    # La colonna corretta nella tabella pratiche è 'importo' (prezzo × quantità)
    tot_pratiche = db.execute(
        'SELECT COALESCE(SUM(importo), 0) FROM pratiche WHERE ditta_id=?',
        (ditta_id,)
    ).fetchone()[0] or 0.0

    tot_pagamenti = db.execute(
        'SELECT COALESCE(SUM(importo), 0) FROM pagamenti WHERE ditta_id=?',
        (ditta_id,)
    ).fetchone()[0] or 0.0

    tot_abbuoni = db.execute(
        "SELECT COALESCE(SUM(importo), 0) FROM arrotondamenti WHERE ditta_id=? AND tipo='abbuono'",
        (ditta_id,)
    ).fetchone()[0] or 0.0

    tot_addebiti = db.execute(
        "SELECT COALESCE(SUM(importo), 0) FROM arrotondamenti WHERE ditta_id=? AND tipo='addebito'",
        (ditta_id,)
    ).fetchone()[0] or 0.0

    totale_dovuto = residuo_iniziale + float(tot_pratiche) + float(tot_addebiti)
    return round(totale_dovuto - float(tot_pagamenti) - float(tot_abbuoni), 2)


# ─── GET lista arrotondamenti cliente ────────────────────────────────────────

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


# ─── GET anteprima residuo (live modal) ──────────────────────────────────────

@arrotondamenti_bp.route('/api/arrotondamenti/anteprima', methods=['GET'])
@login_required
def anteprima_arrotondamento():
    """
    Calcola il nuovo residuo PRIMA di salvare → per l'anteprima live nel modal.
    Parametri query: ditta_id, tipo (abbuono|addebito), importo
    """
    ditta_id = request.args.get('ditta_id', type=int)
    tipo     = request.args.get('tipo', 'abbuono')
    importo  = abs(float(request.args.get('importo', 0)))

    if not ditta_id:
        return jsonify({'error': 'ditta_id obbligatorio'}), 400
    if tipo not in ('abbuono', 'addebito'):
        return jsonify({'error': "tipo deve essere 'abbuono' o 'addebito'"}), 400

    conn = get_db()
    try:
        residuo_attuale = calcola_residuo(conn, ditta_id)

        if tipo == 'abbuono':
            nuovo_residuo = round(residuo_attuale - importo, 2)
        else:  # addebito
            nuovo_residuo = round(residuo_attuale + importo, 2)

        return jsonify({
            'residuo_attuale':   residuo_attuale,
            'tipo':              tipo,
            'importo_applicato': importo,
            'nuovo_residuo':     nuovo_residuo,
        })
    finally:
        conn.close()


# ─── POST crea arrotondamento ────────────────────────────────────────────────

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
        row    = conn.execute('SELECT * FROM arrotondamenti WHERE id=?', (new_id,)).fetchone()

        # Calcola e allega il nuovo residuo nella notifica SSE
        nuovo_residuo = calcola_residuo(conn, data['ditta_id'])
        payload = dict(row)
        payload['nuovo_residuo'] = nuovo_residuo

        notify_all('arrotondamento_created', payload)
        return jsonify(payload), 201
    finally:
        conn.close()


# ─── DELETE annulla arrotondamento ───────────────────────────────────────────

@arrotondamenti_bp.route('/api/arrotondamenti/<int:id>', methods=['DELETE'])
@login_required
def delete_arrotondamento(id):
    conn = get_db()
    try:
        # Recupera ditta_id prima di cancellare per ricalcolare residuo
        row = conn.execute(
            'SELECT ditta_id FROM arrotondamenti WHERE id=?', (id,)
        ).fetchone()
        conn.execute('DELETE FROM arrotondamenti WHERE id=?', (id,))
        conn.commit()

        payload = {'id': id}
        if row:
            payload['nuovo_residuo'] = calcola_residuo(conn, row['ditta_id'])
            payload['ditta_id']      = row['ditta_id']

        notify_all('arrotondamento_deleted', payload)
        return jsonify({'ok': True})
    finally:
        conn.close()