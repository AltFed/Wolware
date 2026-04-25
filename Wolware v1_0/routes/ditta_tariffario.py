# routes/ditta_tariffario.py
# Gestione tariffario associato a una ditta specifica

from flask import Blueprint, request, jsonify
from database import get_db
from auth.decorators import login_required

bp = Blueprint('ditta_tariffario', __name__)

# Mappa tipo macrogruppo → tipo ditta_voci (compatibilità bidirezionale)
TIPO_MAP = {
    'costi_fissi_mensili':      'costi_fissi_mensili',
    'costi_fissi_annuali':      'costi_fissi_annuali',
    'costi_variabili_mensili':  'costi_variabili_mensili',
    'costi_variabili_annuali':  'costi_variabili_annuali',
    # legacy
    'fisso_mensile':    'costi_fissi_mensili',
    'fisso_annuale':    'costi_fissi_annuali',
    'variabile_mensile':'costi_variabili_mensili',
    'variabile_annuale':'costi_variabili_annuali',
}


# GET /api/ditte/<id>/tariffario
@bp.route('/api/ditte/<int:ditta_id>/tariffario', methods=['GET'])
@login_required
def get_ditta_tariffario(ditta_id):
    db = get_db()
    try:
        ditta = db.execute(
            'SELECT tariffario_id FROM ditte WHERE id=?', (ditta_id,)
        ).fetchone()
        if not ditta:
            return jsonify({'error': 'Ditta non trovata'}), 404

        tariffario = None
        if ditta['tariffario_id']:
            t = db.execute(
                'SELECT id, nome FROM tariffari WHERE id=?', (ditta['tariffario_id'],)
            ).fetchone()
            if t:
                tariffario = {'id': t['id'], 'nome': t['nome']}

        voci = db.execute(
            '''SELECT * FROM ditta_voci
               WHERE ditta_id=?
               ORDER BY tipo, macrogruppo_nome, nome''',
            (ditta_id,)
        ).fetchall()

        return jsonify({
            'tariffario': tariffario,
            'voci': [dict(v) for v in voci]
        })
    finally:
        db.close()


# PUT /api/ditte/<id>/tariffario/associa
@bp.route('/api/ditte/<int:ditta_id>/tariffario/associa', methods=['PUT'])
@login_required
def associa_tariffario(ditta_id):
    data = request.get_json()
    db = get_db()
    try:
        db.execute(
            'UPDATE ditte SET tariffario_id=? WHERE id=?',
            (data.get('tariffario_id'), ditta_id)
        )
        db.commit()
        return jsonify({'ok': True})
    finally:
        db.close()


# POST /api/ditte/<id>/tariffario/sync
@bp.route('/api/ditte/<int:ditta_id>/tariffario/sync', methods=['POST'])
@login_required
def sync_tariffario(ditta_id):
    db = get_db()
    try:
        ditta = db.execute(
            'SELECT tariffario_id FROM ditte WHERE id=?', (ditta_id,)
        ).fetchone()
        if not ditta or not ditta['tariffario_id']:
            return jsonify({'error': 'Nessun tariffario associato'}), 400

        voci_standard = db.execute(
            '''SELECT vc.id, vc.nome, vc.prezzo, vc.note,
                      vc.esente_iva, vc.richiede_anno_precedente, vc.mesi_json,
                      mg.nome as mg_nome, mg.tipo
               FROM voci_costo vc
               JOIN macrogruppi mg ON mg.id = vc.macrogruppo_id
               WHERE mg.tariffario_id = ?''',
            (ditta['tariffario_id'],)
        ).fetchall()

        aggiunte = aggiornate = 0
        for v in voci_standard:
            tipo_mapped = TIPO_MAP.get(v['tipo'], v['tipo'])
            existing = db.execute(
                'SELECT id FROM ditta_voci WHERE ditta_id=? AND voce_costo_id=?',
                (ditta_id, v['id'])
            ).fetchone()
            if existing:
                db.execute(
                    '''UPDATE ditta_voci
                       SET nome=?, prezzo=?, macrogruppo_nome=?, tipo=?,
                           esente_iva=?, richiede_anno_precedente=?, mesi_json=?
                       WHERE id=?''',
                    (v['nome'], v['prezzo'], v['mg_nome'], tipo_mapped,
                     v['esente_iva'], v['richiede_anno_precedente'], v['mesi_json'],
                     existing['id'])
                )
                aggiornate += 1
            else:
                db.execute(
                    '''INSERT INTO ditta_voci
                       (ditta_id, voce_costo_id, nome, prezzo, note,
                        macrogruppo_nome, tipo, custom,
                        esente_iva, richiede_anno_precedente, mesi_json)
                       VALUES (?,?,?,?,?,?,?,0,?,?,?)''',
                    (ditta_id, v['id'], v['nome'], v['prezzo'], v['note'],
                     v['mg_nome'], tipo_mapped,
                     v['esente_iva'], v['richiede_anno_precedente'], v['mesi_json'])
                )
                aggiunte += 1

        db.commit()
        return jsonify({'ok': True, 'aggiunte': aggiunte, 'aggiornate': aggiornate})
    finally:
        db.close()


# POST /api/ditte/<id>/tariffario/voce  → voce custom
@bp.route('/api/ditte/<int:ditta_id>/tariffario/voce', methods=['POST'])
@login_required
def add_voce_custom(ditta_id):
    d = request.get_json()
    db = get_db()
    try:
        db.execute(
            '''INSERT INTO ditta_voci
               (ditta_id, voce_costo_id, nome, prezzo, note,
                macrogruppo_nome, tipo, custom)
               VALUES (?,NULL,?,?,?,?,?,1)''',
            (ditta_id, d.get('nome'), d.get('prezzo', 0),
             d.get('note', ''), d.get('macrogruppo_nome', 'Extra'),
             d.get('tipo', 'costi_fissi_mensili'))
        )
        db.commit()
        return jsonify({'ok': True})
    finally:
        db.close()


# PUT /api/ditte/<id>/tariffario/voce/<vid>
@bp.route('/api/ditte/<int:ditta_id>/tariffario/voce/<int:vid>', methods=['PUT'])
@login_required
def update_voce(ditta_id, vid):
    d = request.get_json()
    db = get_db()
    try:
        db.execute(
            '''UPDATE ditta_voci
               SET nome=?, prezzo=?, note=?, macrogruppo_nome=?, tipo=?
               WHERE id=? AND ditta_id=?''',
            (d.get('nome'), d.get('prezzo', 0), d.get('note', ''),
             d.get('macrogruppo_nome'), d.get('tipo'), vid, ditta_id)
        )
        db.commit()
        return jsonify({'ok': True})
    finally:
        db.close()


# DELETE /api/ditte/<id>/tariffario/voce/<vid>
@bp.route('/api/ditte/<int:ditta_id>/tariffario/voce/<int:vid>', methods=['DELETE'])
@login_required
def delete_voce(ditta_id, vid):
    db = get_db()
    try:
        db.execute(
            'DELETE FROM ditta_voci WHERE id=? AND ditta_id=?', (vid, ditta_id)
        )
        db.commit()
        return jsonify({'ok': True})
    finally:
        db.close()
