# routes/ditte.py
# Blueprint 'ditte' — API REST per la gestione delle ditte.
# GET    /api/ditte        → lista tutte le ditte
# POST   /api/ditte        → crea una nuova ditta
# GET    /api/ditte/<id>   → dettaglio singola ditta
# PUT    /api/ditte/<id>   → aggiorna una ditta
# DELETE /api/ditte/<id>   → elimina una ditta
# Ogni modifica chiama notify_all() per aggiornare gli altri utenti.

import sqlite3
from flask import Blueprint, request, jsonify
from database import get_db
from auth.decorators import login_required
from routes.events import notify_all

ditte_bp = Blueprint('ditte', __name__)


@ditte_bp.route('/api/ditte', methods=['GET'])
@login_required
def get_ditte():
    conn = get_db()
    ditte = conn.execute('SELECT * FROM ditte ORDER BY ragione_sociale').fetchall()
    conn.close()
    return jsonify([dict(d) for d in ditte])


@ditte_bp.route('/api/ditte', methods=['POST'])
@login_required
def create_ditta():
    data = request.get_json()
    if not data.get('ragione_sociale'):
        return jsonify({'error': 'Ragione Sociale obbligatoria'}), 400
    conn = get_db()
    try:
        conn.execute('''INSERT INTO ditte
            (ragione_sociale,partita_iva,codice_fiscale,forma_giuridica,
             settore_ateco,codice_ateco,indirizzo,citta,cap,provincia,cod_catastale,
             amministratore,cf_amministratore,tel_amministratore,email_amministratore,
             telefono,email,pec,referente,cedolino_onnicomprensivo,
             sedi_json,inail_json,inps_json,cc_json,tariff_json,data_inizio_rapporto,note)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''', (
            data.get('ragione_sociale'), data.get('partita_iva'),
            data.get('codice_fiscale'), data.get('forma_giuridica'),
            data.get('settore_ateco'), data.get('codice_ateco'),
            data.get('indirizzo'), data.get('citta'), data.get('cap'),
            data.get('provincia'), data.get('cod_catastale'),
            data.get('amministratore'), data.get('cf_amministratore'),
            data.get('tel_amministratore'), data.get('email_amministratore'),
            data.get('telefono'), data.get('email'), data.get('pec'),
            data.get('referente'), data.get('cedolino_onnicomprensivo', 0),
            data.get('sedi_json'), data.get('inail_json'), data.get('inps_json'),
            data.get('cc_json'), data.get('tariff_json'),
            data.get('data_inizio_rapporto'), data.get('note')))
        conn.commit()
        new_id = conn.execute('SELECT last_insert_rowid()').fetchone()[0]
        d = conn.execute('SELECT * FROM ditte WHERE id=?', (new_id,)).fetchone()
        conn.close()
        notify_all('ditta_created', dict(d))
        return jsonify(dict(d)), 201
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': 'Partita IVA già presente'}), 409


@ditte_bp.route('/api/ditte/<int:id>', methods=['GET'])
@login_required
def get_ditta(id):
    conn = get_db()
    d = conn.execute('SELECT * FROM ditte WHERE id=?', (id,)).fetchone()
    conn.close()
    return jsonify(dict(d)) if d else (jsonify({'error': 'Non trovata'}), 404)


@ditte_bp.route('/api/ditte/<int:id>', methods=['PUT'])
@login_required
def update_ditta(id):
    data = request.get_json()
    conn = get_db()
    conn.execute('''UPDATE ditte SET ragione_sociale=?,partita_iva=?,codice_fiscale=?,
        forma_giuridica=?,settore_ateco=?,codice_ateco=?,indirizzo=?,citta=?,cap=?,
        provincia=?,cod_catastale=?,amministratore=?,cf_amministratore=?,
        tel_amministratore=?,email_amministratore=?,telefono=?,email=?,pec=?,referente=?,
        cedolino_onnicomprensivo=?,sedi_json=?,inail_json=?,inps_json=?,cc_json=?,
        tariff_json=?,data_inizio_rapporto=?,note=?
        WHERE id=?''', (
        data.get('ragione_sociale'), data.get('partita_iva'),
        data.get('codice_fiscale'), data.get('forma_giuridica'),
        data.get('settore_ateco'), data.get('codice_ateco'),
        data.get('indirizzo'), data.get('citta'), data.get('cap'),
        data.get('provincia'), data.get('cod_catastale'),
        data.get('amministratore'), data.get('cf_amministratore'),
        data.get('tel_amministratore'), data.get('email_amministratore'),
        data.get('telefono'), data.get('email'), data.get('pec'),
        data.get('referente'), data.get('cedolino_onnicomprensivo', 0),
        data.get('sedi_json'), data.get('inail_json'), data.get('inps_json'),
        data.get('cc_json'), data.get('tariff_json'),
        data.get('data_inizio_rapporto'), data.get('note'), id))
    conn.commit()
    d = conn.execute('SELECT * FROM ditte WHERE id=?', (id,)).fetchone()
    conn.close()
    notify_all('ditta_updated', dict(d))
    return jsonify(dict(d))


@ditte_bp.route('/api/ditte/<int:id>', methods=['DELETE'])
@login_required
def delete_ditta(id):
    conn = get_db()
    conn.execute('DELETE FROM ditte WHERE id=?', (id,))
    conn.commit()
    conn.close()
    notify_all('ditta_deleted', {'id': id})
    return jsonify({'ok': True})