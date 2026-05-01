# routes/ditte.py
# Blueprint 'ditte' — API REST per la gestione delle ditte.
# GET    /api/ditte        → lista tutte le ditte
# POST   /api/ditte        → crea una nuova ditta
# GET    /api/ditte/<id>   → dettaglio singola ditta
# PUT    /api/ditte/<id>   → aggiorna una ditta
# DELETE /api/ditte/<id>   → elimina una ditta
# Ogni modifica chiama notify_all() per aggiornare gli altri utenti.

import json
import sqlite3
from flask import Blueprint, request, jsonify
from database import get_db
from auth.decorators import login_required
from routes.events import notify_all

ditte_bp = Blueprint('ditte', __name__)


def _json_str(val):
    """Converte un valore in stringa JSON valida per SQLite.
    Gestisce sia il caso in cui il frontend manda un oggetto/lista
    (Content-Type: application/json) sia una stringa già serializzata."""
    if val is None:
        return '[]'
    if isinstance(val, str):
        return val
    return json.dumps(val, ensure_ascii=False)


# ── GET /api/ditte ─────────────────────────────────────────────────────────────
@ditte_bp.route('/api/ditte', methods=['GET'])
@login_required
def get_ditte():
    mostra_archiviati = request.args.get('archiviati', '0') == '1'
    conn = get_db()
    try:
        if mostra_archiviati:
            ditte = conn.execute('''
                SELECT d.*, t.nome AS tariffario_nome_join
                FROM ditte d
                LEFT JOIN tariffari t ON d.tariffario_id = t.id
                ORDER BY d.ragione_sociale COLLATE NOCASE
            ''').fetchall()
        else:
            ditte = conn.execute('''
                SELECT d.*, t.nome AS tariffario_nome_join
                FROM ditte d
                LEFT JOIN tariffari t ON d.tariffario_id = t.id
                WHERE d.archiviato = 0
                ORDER BY d.ragione_sociale COLLATE NOCASE
            ''').fetchall()
        return jsonify([dict(d) for d in ditte])
    finally:
        conn.close()


# ── POST /api/ditte ────────────────────────────────────────────────────────────
@ditte_bp.route('/api/ditte', methods=['POST'])
@login_required
def create_ditta():
    data = request.get_json()
    if not data.get('ragione_sociale'):
        return jsonify({'error': 'Ragione Sociale obbligatoria'}), 400

    # Recupera il nome del tariffario se è stato passato un id
    tariffario_id   = data.get('tariffario_id') or None
    tariffario_nome = None
    if tariffario_id:
        conn_t = get_db()
        try:
            row = conn_t.execute('SELECT nome FROM tariffari WHERE id=?', (tariffario_id,)).fetchone()
            tariffario_nome = row['nome'] if row else None
        finally:
            conn_t.close()

    conn = get_db()
    try:
        conn.execute('''
            INSERT INTO ditte
                (ragione_sociale, partita_iva, codice_fiscale, forma_giuridica,
                 settore_ateco, codice_ateco, indirizzo, citta, cap, provincia,
                 cod_catastale, amministratore, cf_amministratore,
                 tel_amministratore, email_amministratore, telefono, email,
                 pec, referente, cedolino_onnicomprensivo,
                 sedi_json, inail_json, inps_json, cc_json, tariff_json,
                 data_inizio_rapporto, note, tariffario_id,
                 cadenza_pagamenti, residuo_iniziale,
                 inizio_paghe, fine_paghe,
                 inizio_contabilita, fine_contabilita,
                 archiviato, annotazioni, tariffario_nome)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ''', (
            data.get('ragione_sociale'),      data.get('partita_iva'),
            data.get('codice_fiscale'),       data.get('forma_giuridica'),
            data.get('settore_ateco'),        data.get('codice_ateco'),
            data.get('indirizzo'),            data.get('citta'),
            data.get('cap'),                  data.get('provincia'),
            data.get('cod_catastale'),        data.get('amministratore'),
            data.get('cf_amministratore'),    data.get('tel_amministratore'),
            data.get('email_amministratore'), data.get('telefono'),
            data.get('email'),                data.get('pec'),
            data.get('referente'),            int(data.get('cedolino_onnicomprensivo', 0)),
            _json_str(data.get('sedi_json')),
            _json_str(data.get('inail_json')),
            _json_str(data.get('inps_json')),
            _json_str(data.get('cc_json')),
            _json_str(data.get('tariff_json')),
            data.get('data_inizio_rapporto'), data.get('note'),
            tariffario_id,
            # ── Nuovi campi spec Volume 2 ──
            data.get('cadenza_pagamenti', 'libero'),
            float(data.get('residuo_iniziale', 0.0)),
            data.get('inizio_paghe'),         data.get('fine_paghe'),
            data.get('inizio_contabilita'),   data.get('fine_contabilita'),
            int(data.get('archiviato', 0)),
            data.get('annotazioni'),
            tariffario_nome,
        ))
        conn.commit()
        new_id = conn.execute('SELECT last_insert_rowid()').fetchone()[0]
        d = conn.execute('SELECT * FROM ditte WHERE id=?', (new_id,)).fetchone()
        notify_all('ditta_created', dict(d))
        return jsonify(dict(d)), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Partita IVA già presente'}), 409
    finally:
        conn.close()


# ── GET /api/ditte/<id> ────────────────────────────────────────────────────────
@ditte_bp.route('/api/ditte/<int:id>', methods=['GET'])
@login_required
def get_ditta(id):
    conn = get_db()
    try:
        d = conn.execute('SELECT * FROM ditte WHERE id=?', (id,)).fetchone()
        return jsonify(dict(d)) if d else (jsonify({'error': 'Non trovata'}), 404)
    finally:
        conn.close()


# ── PUT /api/ditte/<id> ────────────────────────────────────────────────────────
@ditte_bp.route('/api/ditte/<int:id>', methods=['PUT'])
@login_required
def update_ditta(id):
    data = request.get_json()
    conn = get_db()
    try:
        conn.execute('''
            UPDATE ditte SET
                ragione_sociale=?, partita_iva=?, codice_fiscale=?,
                forma_giuridica=?, settore_ateco=?, codice_ateco=?,
                indirizzo=?, citta=?, cap=?, provincia=?, cod_catastale=?,
                amministratore=?, cf_amministratore=?, tel_amministratore=?,
                email_amministratore=?, telefono=?, email=?, pec=?,
                referente=?, cedolino_onnicomprensivo=?,
                sedi_json=?, inail_json=?, inps_json=?, cc_json=?,
                tariff_json=?, data_inizio_rapporto=?, note=?, tariffario_id=?,
                cadenza_pagamenti=?, residuo_iniziale=?,
                inizio_paghe=?, fine_paghe=?,
                inizio_contabilita=?, fine_contabilita=?,
                annotazioni=?
            WHERE id=?
        ''', (
            data.get('ragione_sociale'),      data.get('partita_iva'),
            data.get('codice_fiscale'),       data.get('forma_giuridica'),
            data.get('settore_ateco'),        data.get('codice_ateco'),
            data.get('indirizzo'),            data.get('citta'),
            data.get('cap'),                  data.get('provincia'),
            data.get('cod_catastale'),        data.get('amministratore'),
            data.get('cf_amministratore'),    data.get('tel_amministratore'),
            data.get('email_amministratore'), data.get('telefono'),
            data.get('email'),                data.get('pec'),
            data.get('referente'),            int(data.get('cedolino_onnicomprensivo', 0)),
            _json_str(data.get('sedi_json')),
            _json_str(data.get('inail_json')),
            _json_str(data.get('inps_json')),
            _json_str(data.get('cc_json')),
            _json_str(data.get('tariff_json')),
            data.get('data_inizio_rapporto'), data.get('note'),
            data.get('tariffario_id') or None,
            # ── Nuovi campi spec Volume 2 ──
            data.get('cadenza_pagamenti', 'libero'),
            float(data.get('residuo_iniziale', 0.0)),
            data.get('inizio_paghe'),         data.get('fine_paghe'),
            data.get('inizio_contabilita'),   data.get('fine_contabilita'),
            data.get('annotazioni'),
            id,
        ))
        conn.commit()
        d = conn.execute('SELECT * FROM ditte WHERE id=?', (id,)).fetchone()
        notify_all('ditta_updated', dict(d))
        return jsonify(dict(d))
    finally:
        conn.close()


# ── DELETE /api/ditte/<id> ─────────────────────────────────────────────────────
@ditte_bp.route('/api/ditte/<int:id>', methods=['DELETE'])
@login_required
def delete_ditta(id):
    conn = get_db()
    try:
        # Eliminazione a cascata (FK non enforced in SQLite di default)
        conn.execute('DELETE FROM pratiche        WHERE ditta_id=?', (id,))
        conn.execute('DELETE FROM pagamenti       WHERE ditta_id=?', (id,))
        conn.execute('DELETE FROM arrotondamenti  WHERE ditta_id=?', (id,))
        conn.execute('DELETE FROM ditta_voci      WHERE ditta_id=?', (id,))
        conn.execute('DELETE FROM storico_tariffari WHERE ditta_id=?', (id,))
        conn.execute('DELETE FROM ditte           WHERE id=?', (id,))
        conn.commit()
        notify_all('ditta_deleted', {'id': id})
        return jsonify({'ok': True})
    finally:
        conn.close()

# ── POST /api/ditte/:id/cambia-tariffario ──────────────────────────────────────
@ditte_bp.route('/api/ditte/<int:id>/cambia-tariffario', methods=['POST'])
@login_required
def cambia_tariffario(id):
    data = request.get_json()
    nuovo_tid = data.get('tariffario_id')  # può essere None
    note = (data.get('note') or '').strip()
    conn = get_db()
    try:
        ditta = conn.execute('SELECT * FROM ditte WHERE id=?', (id,)).fetchone()
        if not ditta:
            return jsonify({'error': 'Ditta non trovata'}), 404

        # Nome del nuovo tariffario
        nome_nuovo = None
        if nuovo_tid:
            row = conn.execute('SELECT nome FROM tariffari WHERE id=?', (nuovo_tid,)).fetchone()
            nome_nuovo = row['nome'] if row else None

        # Salva nello storico
        conn.execute(
            'INSERT INTO storico_tariffari (ditta_id, tariffario_id, tariffario_nome, note) VALUES (?,?,?,?)',
            (id, nuovo_tid, nome_nuovo, note)
        )
        # Aggiorna ditta
        conn.execute('UPDATE ditte SET tariffario_id=? WHERE id=?', (nuovo_tid, id))
        conn.commit()
        return jsonify({'ok': True, 'tariffario_nome': nome_nuovo})
    finally:
        conn.close()


# ── GET /api/ditte/:id/storico-tariffari ──────────────────────────────────────
@ditte_bp.route('/api/ditte/<int:id>/storico-tariffari', methods=['GET'])
@login_required
def storico_tariffari(id):
    conn = get_db()
    try:
        rows = conn.execute(
            'SELECT * FROM storico_tariffari WHERE ditta_id=? ORDER BY cambiato_il DESC',
            (id,)
        ).fetchall()
        return jsonify([dict(r) for r in rows])
    finally:
        conn.close()

# ── PATCH /api/ditte/<id>/archivia ────────────────────────────────────────────
@ditte_bp.route('/api/ditte/<int:id>/archivia', methods=['PATCH'])
@login_required
def archivia_ditta(id):
    conn = get_db()
    try:
        conn.execute('UPDATE ditte SET archiviato=1 WHERE id=?', (id,))
        conn.commit()
        notify_all('ditta_archiviata', {'id': id})
        return jsonify({'ok': True})
    finally:
        conn.close()


# ── PATCH /api/ditte/<id>/ripristina ──────────────────────────────────────────
@ditte_bp.route('/api/ditte/<int:id>/ripristina', methods=['PATCH'])
@login_required
def ripristina_ditta(id):
    conn = get_db()
    try:
        conn.execute('UPDATE ditte SET archiviato=0 WHERE id=?', (id,))
        conn.commit()
        notify_all('ditta_ripristinata', {'id': id})
        return jsonify({'ok': True})
    finally:
        conn.close()


# ── PATCH /api/ditte/<id>/annotazioni ─────────────────────────────────────────
@ditte_bp.route('/api/ditte/<int:id>/annotazioni', methods=['PATCH'])
@login_required
def update_annotazioni(id):
    """Autosave annotazioni — chiamata al blur della textarea nel dettaglio."""
    data = request.get_json()
    conn = get_db()
    try:
        conn.execute('UPDATE ditte SET annotazioni=? WHERE id=?', (data.get('annotazioni'), id))
        conn.commit()
        return jsonify({'ok': True})
    finally:
        conn.close()


# ── PATCH /api/ditte/<id>/date-gestione ───────────────────────────────────────
@ditte_bp.route('/api/ditte/<int:id>/date-gestione', methods=['PATCH'])
@login_required
def update_date_gestione(id):
    """Modal Date Gestione — aggiorna le 4 date paghe/contabilità."""
    data = request.get_json()
    conn = get_db()
    try:
        conn.execute('''
            UPDATE ditte SET
                inizio_paghe=?, fine_paghe=?,
                inizio_contabilita=?, fine_contabilita=?
            WHERE id=?
        ''', (
            data.get('inizio_paghe'),       data.get('fine_paghe'),
            data.get('inizio_contabilita'), data.get('fine_contabilita'),
            id,
        ))
        conn.commit()
        d = conn.execute('SELECT * FROM ditte WHERE id=?', (id,)).fetchone()
        notify_all('ditta_updated', dict(d))
        return jsonify(dict(d))
    finally:
        conn.close()