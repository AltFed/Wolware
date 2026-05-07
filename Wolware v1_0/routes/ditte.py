
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
    import datetime
    anno = request.args.get('anno', type=int) or datetime.date.today().year
    conn = get_db()
    try:
        where = "" if mostra_archiviati else "WHERE d.archiviato = 0"
        ditte = conn.execute(f'''
            SELECT d.*, t.nome AS tariffario_nome_join
            FROM ditte d
            LEFT JOIN tariffari t ON d.tariffario_id = t.id
            {where}
            ORDER BY d.ragione_sociale COLLATE NOCASE
        ''').fetchall()

        result = []
        for d in ditte:
            row = dict(d)
            did = d['id']

            # ── Totale dovuto (pratiche + IVA + residuo_iniziale + addebiti) ──
            res_iniziale = float(d['residuo_iniziale'] or 0)
            tot_pratiche = conn.execute(
                'SELECT COALESCE(SUM(importo),0) FROM pratiche WHERE ditta_id=?', (did,)
            ).fetchone()[0] or 0.0
            iva_pratiche = conn.execute(
                '''SELECT COALESCE(SUM(importo*0.22),0) FROM pratiche
                   WHERE ditta_id=? AND (esente_iva IS NULL OR esente_iva=0)''', (did,)
            ).fetchone()[0] or 0.0
            tot_addebiti = conn.execute(
                "SELECT COALESCE(SUM(importo),0) FROM arrotondamenti WHERE ditta_id=? AND tipo='addebito'", (did,)
            ).fetchone()[0] or 0.0
            tot_abbuoni = conn.execute(
                "SELECT COALESCE(SUM(importo),0) FROM arrotondamenti WHERE ditta_id=? AND tipo='abbuono'", (did,)
            ).fetchone()[0] or 0.0
            tot_pagamenti = conn.execute(
                'SELECT COALESCE(SUM(importo),0) FROM pagamenti WHERE ditta_id=?', (did,)
            ).fetchone()[0] or 0.0

            totale_dovuto  = round(res_iniziale + tot_pratiche + iva_pratiche + tot_addebiti, 2)
            totale_pagato  = round(tot_pagamenti + tot_abbuoni, 2)
            totale_residuo = round(totale_dovuto - totale_pagato, 2)

            row['totale_dovuto']  = totale_dovuto
            row['totale_pagato']  = totale_pagato
            row['totale_residuo'] = totale_residuo

            # ── Indicatori mesi CF e VR per l'anno richiesto ──
            mesi_cf = conn.execute(
                "SELECT DISTINCT mese FROM pratiche WHERE ditta_id=? AND anno=? AND tipo='costo_fisso'",
                (did, anno)
            ).fetchall()
            mesi_vr = conn.execute(
                """SELECT DISTINCT mese FROM pratiche
                   WHERE ditta_id=? AND anno=?
                   AND tipo IN ('variabile','variabile_mensile','variabile_annuale')""",
                (did, anno)
            ).fetchall()

            cf_set = {r[0] for r in mesi_cf}
            vr_set = {r[0] for r in mesi_vr}
            for m in range(1, 13):
                row[f'cf_mese_{m}_{anno}'] = 1 if m in cf_set else 0
                row[f'vr_mese_{m}_{anno}'] = 1 if m in vr_set else 0

            # ── Ultimo estratto conto e ultimo pagamento ──
            ult_ec = conn.execute(
                "SELECT MAX(data_emissione) FROM fatture WHERE ditta_id=? AND stato != 'annullata'",
                (did,)
            ).fetchone()[0]
            ult_pag = conn.execute(
                'SELECT MAX(data) FROM pagamenti WHERE ditta_id=?', (did,)
            ).fetchone()[0]

            row['ultimo_ec']  = ult_ec  or None
            row['ultimo_pag'] = ult_pag or None

            result.append(row)

        return jsonify(result)
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
        d = conn.execute('''
            SELECT d.*, t.nome AS tariffario_nome
            FROM ditte d
            LEFT JOIN tariffari t ON d.tariffario_id = t.id
            WHERE d.id=?
        ''', (id,)).fetchone()
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



# ── PATCH /api/ditte/<id> — aggiornamento parziale (archivia, singoli campi) ──
@ditte_bp.route('/api/ditte/<int:id>', methods=['PATCH'])
@login_required
def patch_ditta(id):
    data = request.get_json()
    conn = get_db()
    try:
        allowed = {
            'archiviato', 'cadenza_pagamenti', 'residuo_iniziale', 'annotazioni',
            'inizio_paghe', 'fine_paghe', 'inizio_contabilita', 'fine_contabilita',
            'note', 'tariffario_id', 'tariffario_nome'
        }
        fields = {k: v for k, v in data.items() if k in allowed}
        if not fields:
            return jsonify({'error': 'Nessun campo valido'}), 400
        set_clause = ', '.join(f'{k}=?' for k in fields)
        values = list(fields.values()) + [id]
        conn.execute(f'UPDATE ditte SET {set_clause} WHERE id=?', values)
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
        conn.execute('DELETE FROM ditte WHERE id=?', (id,))
        conn.commit()
        notify_all('ditta_deleted', {'id': id})
        return jsonify({'ok': True})
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

# ── GET /api/ditte/<id>/previsione ────────────────────────────────────────────
@ditte_bp.route('/api/ditte/<int:id>/previsione', methods=['GET'])
@login_required
def previsione_cliente(id):
    mesi = int(request.args.get('mesi', 12))
    mese_da = int(request.args.get('mese_da', 1))
    conn = get_db()
    try:
        ditta = conn.execute('SELECT * FROM ditte WHERE id=?', (id,)).fetchone()
        if not ditta or not ditta['tariffario_id']:
            return jsonify({'fissi_mensili': [], 'fissi_annuali': [], 'totale': 0, 'mesi': mesi})

        tid = ditta['tariffario_id']

        # Prende tutti i macrogruppi con le loro voci
        gruppi = conn.execute(
            'SELECT id, nome, tipo FROM macrogruppi WHERE tariffario_id=?', (tid,)
        ).fetchall()

        fissi_mensili = []
        fissi_annuali = []

        for g in gruppi:
            voci = conn.execute(
                'SELECT * FROM voci_costo  WHERE macrogruppo_id=?', (g['id'],)
            ).fetchall()

            for v in voci:
                prezzo = float(v['prezzo'] or 0)
                if g['tipo'] in ('fisso_mensile', 'costifissimensili'):
                    # Controlla mesi di applicazione
                    mesi_voce = None
                    if v['mesi']:
                        try:
                            mesi_voce = json.loads(v['mesi'])
                        except:
                            pass
                    # Conta quanti mesi del periodo si applicano
                    if mesi_voce and 0 not in mesi_voce:
                        mesi_applicabili = len([
                            m for m in mesi_voce
                            if m >= mese_da and m < mese_da + mesi
                        ])
                    else:
                        mesi_applicabili = mesi

                    totale_voce = round(prezzo * mesi_applicabili, 2)
                    fissi_mensili.append({
                        'nome': v['nome'],
                        'macrogruppo': g['nome'],
                        'prezzo_unitario': prezzo,
                        'mesi': mesi_applicabili,
                        'totale': totale_voce,
                        'esente_iva': bool(v['esente_iva'])
                    })

                elif g['tipo'] in ('fisso_annuale', 'costifissiannuali'):
                    anni = max(1, round(mesi / 12))
                    totale_voce = round(prezzo * anni, 2)
                    fissi_annuali.append({
                        'nome': v['nome'],
                        'macrogruppo': g['nome'],
                        'prezzo_unitario': prezzo,
                        'anni': anni,
                        'totale': totale_voce,
                        'esente_iva': bool(v['esente_iva'])
                    })

        tot_mensili = sum(v['totale'] for v in fissi_mensili)
        tot_annuali = sum(v['totale'] for v in fissi_annuali)
        totale = round(tot_mensili + tot_annuali, 2)

        return jsonify({
            'fissi_mensili': fissi_mensili,
            'fissi_annuali': fissi_annuali,
            'totale_mensili': round(tot_mensili, 2),
            'totale_annuali': round(tot_annuali, 2),
            'totale': totale,
            'mesi': mesi
        })
    finally:
        conn.close()