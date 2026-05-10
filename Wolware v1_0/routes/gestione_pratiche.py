from flask import Blueprint, request, jsonify
from database import get_db
from auth.decorators import login_required

bp = Blueprint('gestione_pratiche', __name__)


@bp.route('/api/gestione-pratiche', methods=['GET'])
@login_required
def get_all():
    conn = get_db()
    try:
        rows = conn.execute('''
            SELECT gp.*, d.ragione_sociale AS ditta_nome
            FROM gestione_pratiche gp
            LEFT JOIN ditte d ON d.id = gp.ditta_id
            ORDER BY
                CASE gp.priorita WHEN 'Urgente' THEN 0 WHEN 'Alta' THEN 1
                                  WHEN 'Normale' THEN 2 ELSE 3 END,
                gp.data_scadenza ASC NULLS LAST,
                gp.id DESC
        ''').fetchall()
        return jsonify([dict(r) for r in rows])
    finally:
        conn.close()


@bp.route('/api/gestione-pratiche', methods=['POST'])
@login_required
def create():
    data = request.get_json()
    if not data.get('tipo_pratica'):
        return jsonify({'error': 'tipo_pratica obbligatorio'}), 400
    conn = get_db()
    try:
        conn.execute('''
            INSERT INTO gestione_pratiche
                (ditta_id, tipo_pratica, descrizione, stato, priorita,
                 data_apertura, data_scadenza, note)
            VALUES (?,?,?,?,?,?,?,?)
        ''', (
            data.get('ditta_id') or None,
            data['tipo_pratica'],
            data.get('descrizione'),
            data.get('stato', 'Aperta'),
            data.get('priorita', 'Normale'),
            data.get('data_apertura'),
            data.get('data_scadenza'),
            data.get('note'),
        ))
        conn.commit()
        new_id = conn.execute('SELECT last_insert_rowid()').fetchone()[0]
        row = conn.execute('''
            SELECT gp.*, d.ragione_sociale AS ditta_nome
            FROM gestione_pratiche gp LEFT JOIN ditte d ON d.id = gp.ditta_id
            WHERE gp.id=?
        ''', (new_id,)).fetchone()
        return jsonify(dict(row)), 201
    finally:
        conn.close()


@bp.route('/api/gestione-pratiche/<int:pid>', methods=['PUT'])
@login_required
def update(pid):
    data = request.get_json()
    conn = get_db()
    try:
        conn.execute('''
            UPDATE gestione_pratiche SET
                ditta_id=?, tipo_pratica=?, descrizione=?, stato=?,
                priorita=?, data_apertura=?, data_scadenza=?, note=?
            WHERE id=?
        ''', (
            data.get('ditta_id') or None,
            data.get('tipo_pratica'),
            data.get('descrizione'),
            data.get('stato', 'Aperta'),
            data.get('priorita', 'Normale'),
            data.get('data_apertura'),
            data.get('data_scadenza'),
            data.get('note'),
            pid,
        ))
        conn.commit()
        row = conn.execute('''
            SELECT gp.*, d.ragione_sociale AS ditta_nome
            FROM gestione_pratiche gp LEFT JOIN ditte d ON d.id = gp.ditta_id
            WHERE gp.id=?
        ''', (pid,)).fetchone()
        return jsonify(dict(row))
    finally:
        conn.close()


@bp.route('/api/gestione-pratiche/<int:pid>', methods=['DELETE'])
@login_required
def delete(pid):
    conn = get_db()
    try:
        conn.execute('DELETE FROM gestione_pratiche WHERE id=?', (pid,))
        conn.commit()
        return jsonify({'ok': True})
    finally:
        conn.close()
