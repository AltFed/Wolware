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

        pratiche_tot = {
            r['ditta_id']: dict(r) for r in conn.execute('''
                SELECT
                    ditta_id,
                    COALESCE(SUM(importo), 0) AS tot_pratiche,
                    COALESCE(SUM(
                        CASE
                            WHEN esente_iva IS NULL OR esente_iva = 0 THEN importo * 0.22
                            ELSE 0
                        END
                    ), 0) AS iva_pratiche
                FROM pratiche
                WHERE anno = ?
                GROUP BY ditta_id
            ''', (anno,)).fetchall()
        }

        arrotondamenti_tot = {
            r['ditta_id']: dict(r) for r in conn.execute('''
                SELECT
                    ditta_id,
                    COALESCE(SUM(CASE WHEN tipo='addebito' THEN importo ELSE 0 END), 0) AS tot_addebiti,
                    COALESCE(SUM(CASE WHEN tipo='abbuono' THEN importo ELSE 0 END), 0) AS tot_abbuoni
                FROM arrotondamenti
                WHERE strftime('%Y', data) = ?
                GROUP BY ditta_id
            ''', (str(anno),)).fetchall()
        }

        pagamenti_tot = {
            r['ditta_id']: dict(r) for r in conn.execute('''
                SELECT
                    ditta_id,
                    COALESCE(SUM(importo), 0) AS tot_pagamenti,
                    MAX(data) AS ultimo_pag
                FROM pagamenti
                WHERE anno = ?
                GROUP BY ditta_id
            ''', (anno,)).fetchall()
        }

        fatture_tot = {
            r['ditta_id']: dict(r) for r in conn.execute('''
                SELECT ditta_id, MAX(data_emissione) AS ultimo_ec
                FROM fatture
                WHERE stato != 'annullata'
                  AND strftime('%Y', data_emissione) = ?
                GROUP BY ditta_id
            ''', (str(anno),)).fetchall()
        }

        pratiche_anno_rows = conn.execute('''
            SELECT ditta_id, mese, tipo, MAX(data_esecuzione) AS ultima_data
            FROM pratiche
            WHERE anno = ?
            GROUP BY ditta_id, mese, tipo
        ''', (anno,)).fetchall()

        CF_TYPES = {'costi_fissi_mensili', 'fisso_mensile', 'costi_fissi_annuali', 'fisso_annuale'}
        VR_TYPES = {'costi_variabili_mensili', 'costi_variabili_annuali', 'variabile', 'variabile_mensile', 'variabile_annuale'}
        CM_TYPES = {'richiesta'}

        cf_map, vr_map, cm_map = {}, {}, {}
        data_cf_map, data_vr_map, data_cm_map = {}, {}, {}

        for r in pratiche_anno_rows:
            did = r['ditta_id']
            mese = r['mese']
            tipo = r['tipo']
            ultima_data = r['ultima_data']

            if tipo in CF_TYPES:
                cf_map.setdefault(did, set()).add(mese)
                if ultima_data and (did not in data_cf_map or ultima_data > data_cf_map[did]):
                    data_cf_map[did] = ultima_data
            elif tipo in VR_TYPES:
                vr_map.setdefault(did, set()).add(mese)
                if ultima_data and (did not in data_vr_map or ultima_data > data_vr_map[did]):
                    data_vr_map[did] = ultima_data
            elif tipo in CM_TYPES:
                cm_map.setdefault(did, set()).add(mese)
                if ultima_data and (did not in data_cm_map or ultima_data > data_cm_map[did]):
                    data_cm_map[did] = ultima_data

        result = []
        for d in ditte:
            row = dict(d)
            did = d['id']

            res_iniziale = float(d['residuo_iniziale'] or 0)
            p = pratiche_tot.get(did, {})
            a = arrotondamenti_tot.get(did, {})
            pg = pagamenti_tot.get(did, {})
            f = fatture_tot.get(did, {})

            tot_pratiche = float(p.get('tot_pratiche', 0) or 0)
            iva_pratiche = float(p.get('iva_pratiche', 0) or 0)
            tot_addebiti = float(a.get('tot_addebiti', 0) or 0)
            tot_abbuoni = float(a.get('tot_abbuoni', 0) or 0)
            tot_pagamenti = float(pg.get('tot_pagamenti', 0) or 0)

            totale_dovuto = round(res_iniziale + tot_pratiche + iva_pratiche + tot_addebiti, 2)
            totale_pagato = round(tot_pagamenti + tot_abbuoni, 2)
            totale_residuo = round(totale_dovuto - totale_pagato, 2)

            row['totale_dovuto'] = totale_dovuto
            row['totale_pagato'] = totale_pagato
            row['totale_residuo'] = totale_residuo

            cf_set = cf_map.get(did, set())
            vr_set = vr_map.get(did, set())
            cm_set = cm_map.get(did, set())
            for m in range(1, 13):
                row[f'cf_mese_{m}_{anno}'] = 1 if m in cf_set else 0
                row[f'vr_mese_{m}_{anno}'] = 1 if m in vr_set else 0
                row[f'cm_mese_{m}_{anno}'] = 1 if m in cm_set else 0

            row['data_ultima_cf'] = data_cf_map.get(did)
            row['data_ultima_vr'] = data_vr_map.get(did)
            row['data_ultima_cm'] = data_cm_map.get(did)

            row['ultimo_ec'] = f.get('ultimo_ec') if f else None
            row['ultimo_pag'] = pg.get('ultimo_pag') if pg else None
            row['ultima_contab'] = data_cf_map.get(did)

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
                 pec, referente,
                 sedi_json, inail_json, inps_json, cc_json, tariff_json,
                 data_inizio_rapporto, note, tariffario_id,
                 cadenza_pagamenti, residuo_iniziale,
                 inizio_paghe, fine_paghe,
                 inizio_contabilita, fine_contabilita,
                 archiviato, annotazioni, tariffario_nome)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
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
            data.get('referente'),
            _json_str(data.get('sedi_json')),
            _json_str(data.get('inail_json')),
            _json_str(data.get('inps_json')),
            _json_str(data.get('cc_json')),
            _json_str(data.get('tariff_json')),
            data.get('data_inizio_rapporto'), data.get('note'),
            tariffario_id,
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
                referente=?,
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
            data.get('referente'),
            _json_str(data.get('sedi_json')),
            _json_str(data.get('inail_json')),
            _json_str(data.get('inps_json')),
            _json_str(data.get('cc_json')),
            _json_str(data.get('tariff_json')),
            data.get('data_inizio_rapporto'), data.get('note'),
            data.get('tariffario_id') or None,
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


@ditte_bp.route('/api/ditte/<int:id>/cadenze', methods=['GET'])
@login_required
def get_cadenze(id):
    """Restituisce lo stato mese per mese delle pratiche ricorrenti di una ditta.
    Raggruppate per macrogruppo_nome, con stato: 'done' | 'cur' | 'empty'."""
    from datetime import date
    anno = request.args.get('anno', str(date.today().year))
    mese_corrente = date.today().month

    db = get_db()
    try:
        rows = db.execute(
            '''SELECT macrogruppo_nome, mese,
                      MAX(CASE WHEN data_esecuzione IS NOT NULL THEN 1 ELSE 0 END) AS eseguita
               FROM pratiche
               WHERE ditta_id=? AND anno=? AND macrogruppo_nome IS NOT NULL
               GROUP BY macrogruppo_nome, mese
               ORDER BY macrogruppo_nome, mese''',
            (id, anno)
        ).fetchall()

        macro_map = {}
        for r in rows:
            mg = r['macrogruppo_nome']
            if mg not in macro_map:
                macro_map[mg] = {}
            macro_map[mg][r['mese']] = r['eseguita']

        result = []
        for mg_nome, mesi_data in macro_map.items():
            stati = []
            for m in range(1, 13):
                if m not in mesi_data:
                    stati.append('empty')
                elif mesi_data[m]:
                    stati.append('done')
                elif m == int(mese_corrente):
                    stati.append('cur')
                else:
                    stati.append('open')
            result.append({'macrogruppo': mg_nome, 'stati': stati})

        return jsonify({'anno': anno, 'cadenze': result})
    finally:
        db.close()