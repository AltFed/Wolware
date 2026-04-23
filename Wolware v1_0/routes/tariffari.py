from flask import Blueprint, request, jsonify
from database import get_db
from auth.decorators import login_required

tariffari_bp = Blueprint('tariffari', __name__)

# ── Tariffari ────────────────────────────────────────────────
@tariffari_bp.route('/api/tariffari', methods=['GET'])
@login_required
def list_tariffari():
    db = get_db()
    rows = db.execute('SELECT * FROM tariffari ORDER BY created_at DESC').fetchall()
    db.close()
    return jsonify([dict(r) for r in rows])

@tariffari_bp.route('/api/tariffari', methods=['POST'])
@login_required
def create_tariffario():
    data = request.get_json()
    nome = (data.get('nome') or '').strip()
    if not nome:
        return jsonify({'error': 'Nome obbligatorio'}), 400
    db = get_db()
    cur = db.execute('INSERT INTO tariffari (nome, note) VALUES (?,?)',
                     (nome, data.get('note', '')))
    row = db.execute('SELECT * FROM tariffari WHERE id=?', (cur.lastrowid,)).fetchone()
    db.commit(); db.close()
    return jsonify(dict(row)), 201

@tariffari_bp.route('/api/tariffari/<int:tid>', methods=['PUT'])
@login_required
def update_tariffario(tid):
    data = request.get_json()
    nome = (data.get('nome') or '').strip()
    if not nome:
        return jsonify({'error': 'Nome obbligatorio'}), 400
    db = get_db()
    db.execute('UPDATE tariffari SET nome=?, note=? WHERE id=?',
               (nome, data.get('note', ''), tid))
    db.commit()
    row = db.execute('SELECT * FROM tariffari WHERE id=?', (tid,)).fetchone()
    db.close()
    return jsonify(dict(row))

@tariffari_bp.route('/api/tariffari/<int:tid>', methods=['DELETE'])
@login_required
def delete_tariffario(tid):
    db = get_db()
    db.execute('DELETE FROM voci_costo WHERE macrogruppo_id IN '
               '(SELECT id FROM macrogruppi WHERE tariffario_id=?)', (tid,))
    db.execute('DELETE FROM macrogruppi WHERE tariffario_id=?', (tid,))
    db.execute('DELETE FROM tariffari WHERE id=?', (tid,))
    db.commit(); db.close()
    return jsonify({'ok': True})

# ── Macrogruppi ──────────────────────────────────────────────
@tariffari_bp.route('/api/tariffari/<int:tid>/macrogruppi', methods=['GET'])
@login_required
def list_macrogruppi(tid):
    db = get_db()
    gruppi = db.execute(
        'SELECT * FROM macrogruppi WHERE tariffario_id=? ORDER BY ordine, id', (tid,)
    ).fetchall()
    result = []
    for g in gruppi:
        gd = dict(g)
        voci = db.execute(
            'SELECT * FROM voci_costo WHERE macrogruppo_id=? ORDER BY ordine, id', (g['id'],)
        ).fetchall()
        gd['voci'] = [dict(v) for v in voci]
        result.append(gd)
    db.close()
    return jsonify(result)

@tariffari_bp.route('/api/tariffari/<int:tid>/macrogruppi', methods=['POST'])
@login_required
def create_macrogruppo(tid):
    data = request.get_json()
    nome = (data.get('nome') or '').strip()
    tipo = data.get('tipo', 'fisso_mensile')
    TIPI = ['fisso_mensile', 'fisso_annuale', 'variabile_mensile', 'variabile_annuale']
    if not nome:
        return jsonify({'error': 'Nome obbligatorio'}), 400
    if tipo not in TIPI:
        tipo = 'fisso_mensile'
    db = get_db()
    cur = db.execute(
        'INSERT INTO macrogruppi (tariffario_id, nome, tipo, ordine) VALUES (?,?,?,?)',
        (tid, nome, tipo, data.get('ordine', 0))
    )
    row = db.execute('SELECT * FROM macrogruppi WHERE id=?', (cur.lastrowid,)).fetchone()
    db.commit(); db.close()
    return jsonify(dict(row)), 201

@tariffari_bp.route('/api/macrogruppi/<int:gid>', methods=['PUT'])
@login_required
def update_macrogruppo(gid):
    data = request.get_json()
    db = get_db()
    db.execute('UPDATE macrogruppi SET nome=?, tipo=? WHERE id=?',
               (data.get('nome', ''), data.get('tipo', 'fisso_mensile'), gid))
    db.commit()
    row = db.execute('SELECT * FROM macrogruppi WHERE id=?', (gid,)).fetchone()
    db.close()
    return jsonify(dict(row))

@tariffari_bp.route('/api/macrogruppi/<int:gid>', methods=['DELETE'])
@login_required
def delete_macrogruppo(gid):
    db = get_db()
    db.execute('DELETE FROM voci_costo WHERE macrogruppo_id=?', (gid,))
    db.execute('DELETE FROM macrogruppi WHERE id=?', (gid,))
    db.commit(); db.close()
    return jsonify({'ok': True})

# ── Voci di costo ────────────────────────────────────────────
@tariffari_bp.route('/api/macrogruppi/<int:gid>/voci', methods=['POST'])
@login_required
def create_voce(gid):
    data = request.get_json()
    nome = (data.get('nome') or '').strip()
    if not nome:
        return jsonify({'error': 'Nome obbligatorio'}), 400
    db = get_db()
    cur = db.execute(
        'INSERT INTO voci_costo (macrogruppo_id, nome, prezzo, unita, note, ordine) VALUES (?,?,?,?,?,?)',
        (gid, nome, data.get('prezzo', 0.0), data.get('unita', ''),
         data.get('note', ''), data.get('ordine', 0))
    )
    row = db.execute('SELECT * FROM voci_costo WHERE id=?', (cur.lastrowid,)).fetchone()
    db.commit(); db.close()
    return jsonify(dict(row)), 201

@tariffari_bp.route('/api/voci/<int:vid>', methods=['PUT'])
@login_required
def update_voce(vid):
    data = request.get_json()
    db = get_db()
    db.execute('UPDATE voci_costo SET nome=?, prezzo=?, unita=?, note=? WHERE id=?',
               (data.get('nome', ''), data.get('prezzo', 0.0),
                data.get('unita', ''), data.get('note', ''), vid))
    db.commit()
    row = db.execute('SELECT * FROM voci_costo WHERE id=?', (vid,)).fetchone()
    db.close()
    return jsonify(dict(row))

@tariffari_bp.route('/api/voci/<int:vid>', methods=['DELETE'])
@login_required
def delete_voce(vid):
    db = get_db()
    db.execute('DELETE FROM voci_costo WHERE id=?', (vid,))
    db.commit(); db.close()
    return jsonify({'ok': True})