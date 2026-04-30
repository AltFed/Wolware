from flask import Blueprint, request, jsonify
from database import get_db
from auth.routes import login_required

bp = Blueprint('pratiche_richiesta_bp', __name__)


@bp.route('/api/ditte/<int:ditta_id>/pratiche-richiesta', methods=['GET'])
@login_required
def get_pratiche(ditta_id):
    anno = request.args.get('anno', type=int)
    mese = request.args.get('mese', type=int)
    db = get_db()
    try:
        query = 'SELECT * FROM pratiche WHERE ditta_id=? AND tipo="richiesta"'
        params = [ditta_id]
        if anno:
            query += ' AND anno=?'
            params.append(anno)
        if mese:
            query += ' AND mese=?'
            params.append(mese)
        query += ' ORDER BY anno DESC, mese DESC, data DESC'
        rows = db.execute(query, params).fetchall()
        return jsonify([dict(r) for r in rows])
    finally:
        db.close()


@bp.route('/api/ditte/<int:ditta_id>/pratiche-richiesta', methods=['POST'])
@login_required
def add_pratica(ditta_id):
    d = request.get_json()
    if not d.get('descrizione'):
        return jsonify({'error': 'Descrizione obbligatoria'}), 400
    if d.get('costo') is None:
        return jsonify({'error': 'Costo obbligatorio'}), 400

    anno = d.get('anno')
    mese = d.get('mese')
    if not anno or not mese:
        return jsonify({'error': 'Anno e mese obbligatori'}), 400

    db = get_db()
    try:
        db.execute(
            '''INSERT INTO pratiche
               (ditta_id, anno, mese, data, descrizione, costo, esente_iva, tipo)
               VALUES (?,?,?,?,?,?,?,?)''',
            (
                ditta_id,
                int(anno),
                int(mese),
                d.get('data', f'{anno}-{str(mese).zfill(2)}-01'),
                d['descrizione'],
                float(d['costo']),
                int(d.get('esente_iva', 0)),
                'richiesta',
            )
        )
        db.commit()
        new_id = db.execute('SELECT last_insert_rowid()').fetchone()[0]
        row = db.execute('SELECT * FROM pratiche WHERE id=?', (new_id,)).fetchone()
        return jsonify(dict(row)), 201
    finally:
        db.close()


@bp.route('/api/ditte/<int:ditta_id>/pratiche-richiesta/<int:pid>', methods=['DELETE'])
@login_required
def delete_pratica(ditta_id, pid):
    db = get_db()
    try:
        existing = db.execute(
            'SELECT id FROM pratiche WHERE id=? AND ditta_id=? AND tipo="richiesta"',
            (pid, ditta_id)
        ).fetchone()
        if not existing:
            return jsonify({'error': 'Pratica non trovata'}), 404
        db.execute('DELETE FROM pratiche WHERE id=?', (pid,))
        db.commit()
        return jsonify({'ok': True})
    finally:
        db.close()