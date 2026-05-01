from flask import Blueprint, request, jsonify
import json
from database import get_db
from auth.decorators import login_required

tariffari_bp = Blueprint('tariffari', __name__)

TIPI_VALIDI = [
    'fisso_mensile', 'fisso_annuale',
    'variabile_mensile', 'variabile_annuale',
    # alias lunghi (usati da ditta_tariffario)
    'costi_fissi_mensili', 'costi_fissi_annuali',
    'costi_variabili_mensili', 'costi_variabili_annuali',
]

# ── Helpers ──────────────────────────────────────────────────
def _parse_mesi(raw):
    """Normalizza mesi: accetta lista o JSON string, ritorna lista [1-12] o None."""
    if raw is None:
        return None
    if isinstance(raw, list):
        return raw
    try:
        return json.loads(raw)
    except Exception:
        return None

# ── Tariffari ────────────────────────────────────────────────
@tariffari_bp.route('/api/tariffari', methods=['GET'])
@login_required
def list_tariffari():
    db = get_db()
    try:
        rows = db.execute('SELECT * FROM tariffari ORDER BY created_at DESC').fetchall()
        result = []
        for r in rows:
            t = dict(r)
            count = db.execute(
                'SELECT COUNT(*) FROM voci_costo WHERE macrogruppo_id IN '
                '(SELECT id FROM macrogruppi WHERE tariffario_id=?)', (t['id'],)
            ).fetchone()[0]
            t['voci_count'] = count
            result.append(t)
        return jsonify(result)
    finally:
        db.close()

@tariffari_bp.route('/api/tariffari', methods=['POST'])
@login_required
def create_tariffario():
    data = request.get_json()
    nome = (data.get('nome') or '').strip()
    if not nome:
        return jsonify({'error': 'Nome obbligatorio'}), 400
    db = get_db()
    try:
        cur = db.execute('INSERT INTO tariffari (nome, note) VALUES (?,?)',
                         (nome, data.get('note', '')))
        db.commit()   # ← commit PRIMA del fetch
        row = db.execute('SELECT * FROM tariffari WHERE id=?', (cur.lastrowid,)).fetchone()
        return jsonify(dict(row)), 201
    finally:
        db.close()

@tariffari_bp.route('/api/tariffari/<int:tid>', methods=['PUT'])
@login_required
def update_tariffario(tid):
    data = request.get_json()
    nome = (data.get('nome') or '').strip()
    if not nome:
        return jsonify({'error': 'Nome obbligatorio'}), 400
    db = get_db()
    try:
        db.execute('UPDATE tariffari SET nome=?, note=? WHERE id=?',
                   (nome, data.get('note', ''), tid))
        db.commit()
        row = db.execute('SELECT * FROM tariffari WHERE id=?', (tid,)).fetchone()
        return jsonify(dict(row))
    finally:
        db.close()

@tariffari_bp.route('/api/tariffari/<int:tid>', methods=['GET'])
@login_required
def get_tariffario(tid):
    db = get_db()
    try:
        row = db.execute('SELECT * FROM tariffari WHERE id=?', (tid,)).fetchone()
        if not row:
            return jsonify({'error': 'Tariffario non trovato'}), 404
        t = dict(row)
        t['voci_count'] = db.execute(
            'SELECT COUNT(*) FROM voci_costo WHERE macrogruppo_id IN '
            '(SELECT id FROM macrogruppi WHERE tariffario_id=?)', (tid,)
        ).fetchone()[0]
        return jsonify(t)
    finally:
        db.close()

@tariffari_bp.route('/api/tariffari/<int:tid>', methods=['DELETE'])
@login_required
def delete_tariffario(tid):
    db = get_db()
    try:
        # Sgancia le ditte che usavano questo tariffario
        db.execute(
            "UPDATE ditte SET tariffario_id=NULL, tariffario_nome=NULL WHERE tariffario_id=?",
            (tid,)
        )
        db.execute('DELETE FROM voci_costo WHERE macrogruppo_id IN '
                   '(SELECT id FROM macrogruppi WHERE tariffario_id=?)', (tid,))
        db.execute('DELETE FROM macrogruppi WHERE tariffario_id=?', (tid,))
        db.execute('DELETE FROM tariffari WHERE id=?', (tid,))
        db.commit()
        return jsonify({'ok': True})
    finally:
        db.close()

@tariffari_bp.route('/api/tariffari/<int:tid>/duplica', methods=['POST'])
@login_required
def duplica_tariffario(tid):
    """Copia profonda di un tariffario: macrogruppi + voci."""
    data = request.get_json()
    nuovo_nome = (data.get('nome') or '').strip()
    if not nuovo_nome:
        return jsonify({'error': 'Nome obbligatorio'}), 400
    db = get_db()
    try:
        src = db.execute('SELECT * FROM tariffari WHERE id=?', (tid,)).fetchone()
        if not src:
            return jsonify({'error': 'Tariffario non trovato'}), 404

        cur = db.execute('INSERT INTO tariffari (nome, note) VALUES (?,?)',
                         (nuovo_nome, src['note'] or ''))
        new_tid = cur.lastrowid

        gruppi = db.execute(
            'SELECT * FROM macrogruppi WHERE tariffario_id=? ORDER BY ordine, id', (tid,)
        ).fetchall()
        for g in gruppi:
            cur_g = db.execute(
                'INSERT INTO macrogruppi (tariffario_id, nome, tipo, ordine) VALUES (?,?,?,?)',
                (new_tid, g['nome'], g['tipo'], g['ordine'])
            )
            new_gid = cur_g.lastrowid
            voci = db.execute(
                'SELECT * FROM voci_costo WHERE macrogruppo_id=? ORDER BY ordine, id', (g['id'],)
            ).fetchall()
            for v in voci:
                db.execute(
                    'INSERT INTO voci_costo '
                    '(macrogruppo_id, nome, prezzo, esente_iva, richiede_anno_precedente, mesi_json, note, ordine) '
                    'VALUES (?,?,?,?,?,?,?,?)',
                    (new_gid, v['nome'], v['prezzo'],
                     v['esente_iva'] or 0, v['richiede_anno_precedente'] or 0,
                     v['mesi_json'], v['note'], v['ordine'])
                )
        db.commit()
        new_t = dict(db.execute('SELECT * FROM tariffari WHERE id=?', (new_tid,)).fetchone())
        return jsonify(new_t), 201
    finally:
        db.close()

# ── Macrogruppi ──────────────────────────────────────────────
@tariffari_bp.route('/api/tariffari/<int:tid>/macrogruppi', methods=['GET'])
@login_required
def list_macrogruppi(tid):
    db = get_db()
    try:
        gruppi = db.execute(
            'SELECT * FROM macrogruppi WHERE tariffario_id=? ORDER BY ordine, id', (tid,)
        ).fetchall()
        result = []
        for g in gruppi:
            gd = dict(g)
            voci = db.execute(
                'SELECT * FROM voci_costo WHERE macrogruppo_id=? ORDER BY ordine, id', (g['id'],)
            ).fetchall()
            voci_list = []
            for v in voci:
                vd = dict(v)
                vd['mesi'] = _parse_mesi(vd.get('mesi_json'))
                voci_list.append(vd)
            gd['voci'] = voci_list
            result.append(gd)
        return jsonify(result)
    finally:
        db.close()

@tariffari_bp.route('/api/tariffari/<int:tid>/macrogruppi', methods=['POST'])
@login_required
def create_macrogruppo(tid):
    data = request.get_json()
    nome = (data.get('nome') or '').strip()
    tipo = data.get('tipo', 'fisso_mensile')
    if not nome:
        return jsonify({'error': 'Nome obbligatorio'}), 400
    if tipo not in TIPI_VALIDI:
        tipo = 'fisso_mensile'
    db = get_db()
    try:
        cur = db.execute(
            'INSERT INTO macrogruppi (tariffario_id, nome, tipo, ordine) VALUES (?,?,?,?)',
            (tid, nome, tipo, data.get('ordine', 0))
        )
        row = db.execute('SELECT * FROM macrogruppi WHERE id=?', (cur.lastrowid,)).fetchone()
        db.commit()
        return jsonify(dict(row)), 201
    finally:
        db.close()

@tariffari_bp.route('/api/macrogruppi/<int:gid>', methods=['PUT'])
@login_required
def update_macrogruppo(gid):
    """Aggiorna SOLO il nome — il tipo è immutabile dopo la creazione."""
    data = request.get_json()
    nome = (data.get('nome') or '').strip()
    if not nome:
        return jsonify({'error': 'Nome obbligatorio'}), 400
    db = get_db()
    try:
        db.execute('UPDATE macrogruppi SET nome=? WHERE id=?', (nome, gid))
        db.commit()
        row = db.execute('SELECT * FROM macrogruppi WHERE id=?', (gid,)).fetchone()
        return jsonify(dict(row))
    finally:
        db.close()

@tariffari_bp.route('/api/macrogruppi/<int:gid>', methods=['DELETE'])
@login_required
def delete_macrogruppo(gid):
    db = get_db()
    try:
        db.execute('DELETE FROM voci_costo WHERE macrogruppo_id=?', (gid,))
        db.execute('DELETE FROM macrogruppi WHERE id=?', (gid,))
        db.commit()
        return jsonify({'ok': True})
    finally:
        db.close()

# ── Voci di costo ────────────────────────────────────────────
@tariffari_bp.route('/api/macrogruppi/<int:gid>/voci', methods=['POST'])
@login_required
def create_voce(gid):
    data = request.get_json()
    nome = (data.get('nome') or '').strip()
    if not nome:
        return jsonify({'error': 'Nome obbligatorio'}), 400
    esente_iva = 1 if data.get('esente_iva') else 0
    anno_prec  = 1 if data.get('richiede_anno_precedente') else 0
    mesi       = _parse_mesi(data.get('mesi'))
    mesi_json  = json.dumps(mesi) if mesi is not None else None
    db = get_db()
    try:
        cur = db.execute(
            'INSERT INTO voci_costo '
            '(macrogruppo_id, nome, prezzo, esente_iva, richiede_anno_precedente, mesi_json, note, ordine) '
            'VALUES (?,?,?,?,?,?,?,?)',
            (gid, nome, data.get('prezzo') or 0.0, esente_iva, anno_prec,
             mesi_json, data.get('note', ''), data.get('ordine', 0))
        )
        row = db.execute('SELECT * FROM voci_costo WHERE id=?', (cur.lastrowid,)).fetchone()
        db.commit()
        vd = dict(row)
        vd['mesi'] = mesi
        return jsonify(vd), 201
    finally:
        db.close()

@tariffari_bp.route('/api/voci/<int:vid>', methods=['PUT'])
@login_required
def update_voce(vid):
    data = request.get_json()
    esente_iva = 1 if data.get('esente_iva') else 0
    anno_prec  = 1 if data.get('richiede_anno_precedente') else 0
    mesi       = _parse_mesi(data.get('mesi'))
    mesi_json  = json.dumps(mesi) if mesi is not None else None
    db = get_db()
    try:
        db.execute(
            'UPDATE voci_costo SET nome=?, prezzo=?, esente_iva=?, '
            'richiede_anno_precedente=?, mesi_json=?, note=? WHERE id=?',
            (data.get('nome', ''), data.get('prezzo') or 0.0,
             esente_iva, anno_prec, mesi_json, data.get('note', ''), vid)
        )
        db.commit()
        row = db.execute('SELECT * FROM voci_costo WHERE id=?', (vid,)).fetchone()
        vd = dict(row)
        vd['mesi'] = mesi
        return jsonify(vd)
    finally:
        db.close()

@tariffari_bp.route('/api/voci/<int:vid>', methods=['DELETE'])
@login_required
def delete_voce(vid):
    db = get_db()
    try:
        db.execute('DELETE FROM voci_costo WHERE id=?', (vid,))
        db.commit()
        return jsonify({'ok': True})
    finally:
        db.close()
