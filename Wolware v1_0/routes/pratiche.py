# routes/pratiche.py
# Blueprint 'pratiche' — API REST per la gestione delle pratiche.
# GET    /api/pratiche        → lista tutte le pratiche
# POST   /api/pratiche        → crea una nuova pratica
# PUT    /api/pratiche/<id>   → aggiorna una pratica
# DELETE /api/pratiche/<id>   → elimina una pratica
# Ogni modifica chiama notify_all() per aggiornare gli altri utenti.

from datetime import datetime
from flask import Blueprint, request, jsonify
from database import get_db
from auth.decorators import login_required
from routes.events import notify_all

pratiche_bp = Blueprint('pratiche', __name__)


@pratiche_bp.route('/api/pratiche', methods=['GET'])
@login_required
def get_pratiche():
    conn = get_db()
    pratiche = conn.execute('''SELECT p.*, d.ragione_sociale as ditta_nome
        FROM pratiche p LEFT JOIN ditte d ON p.ditta_id=d.id
        ORDER BY p.created_at DESC''').fetchall()
    conn.close()
    return jsonify([dict(p) for p in pratiche])


@pratiche_bp.route('/api/pratiche', methods=['POST'])
@login_required
def create_pratica():
    data = request.get_json()
    if not data.get('tipo_pratica'):
        return jsonify({'error': 'Tipo pratica obbligatorio'}), 400
    conn = get_db()
    conn.execute('''INSERT INTO pratiche
        (ditta_id,tipo_pratica,descrizione,stato,priorita,data_apertura,data_scadenza,note)
        VALUES (?,?,?,?,?,?,?,?)''', (
        data.get('ditta_id'), data.get('tipo_pratica'), data.get('descrizione'),
        data.get('stato', 'Aperta'), data.get('priorita', 'Normale'),
        data.get('data_apertura', datetime.now().strftime('%Y-%m-%d')),
        data.get('data_scadenza'), data.get('note')))
    conn.commit()
    new_id = conn.execute('SELECT last_insert_rowid()').fetchone()[0]
    p = conn.execute('''SELECT p.*, d.ragione_sociale as ditta_nome
        FROM pratiche p LEFT JOIN ditte d ON p.ditta_id=d.id
        WHERE p.id=?''', (new_id,)).fetchone()
    conn.close()
    notify_all('pratica_created', dict(p))
    return jsonify(dict(p)), 201


@pratiche_bp.route('/api/pratiche/<int:id>', methods=['PUT'])
@login_required
def update_pratica(id):
    data = request.get_json()
    conn = get_db()
    conn.execute('''UPDATE pratiche SET ditta_id=?,tipo_pratica=?,descrizione=?,stato=?,
        priorita=?,data_apertura=?,data_scadenza=?,data_chiusura=?,note=?
        WHERE id=?''', (
        data.get('ditta_id'), data.get('tipo_pratica'), data.get('descrizione'),
        data.get('stato'), data.get('priorita'), data.get('data_apertura'),
        data.get('data_scadenza'), data.get('data_chiusura'), data.get('note'), id))
    conn.commit()
    p = conn.execute('''SELECT p.*, d.ragione_sociale as ditta_nome
        FROM pratiche p LEFT JOIN ditte d ON p.ditta_id=d.id
        WHERE p.id=?''', (id,)).fetchone()
    conn.close()
    notify_all('pratica_updated', dict(p))
    return jsonify(dict(p))


@pratiche_bp.route('/api/pratiche/<int:id>', methods=['DELETE'])
@login_required
def delete_pratica(id):
    conn = get_db()
    conn.execute('DELETE FROM pratiche WHERE id=?', (id,))
    conn.commit()
    conn.close()
    notify_all('pratica_deleted', {'id': id})
    return jsonify({'ok': True})