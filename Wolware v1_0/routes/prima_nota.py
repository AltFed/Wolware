# routes/prima_nota.py
# Blueprint per la Prima Nota Studio — Blocco 1
# Gestisce: saldi, movimenti, clienti da sollecitare, flag fatturato
# Blocchi 2/3/4 saranno aggiunti nei turni successivi.

from flask import Blueprint, jsonify, request, session, send_file
from database import get_db
from datetime import date, datetime, timedelta
from functools import wraps
import io
import json
import uuid

bp = Blueprint('prima_nota', __name__)


def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Non autenticato'}), 401
        return f(*args, **kwargs)
    return decorated


# ─────────────────────────────────────────────────────────────────
# HELPER: calcola il residuo di un cliente
# Formula: residuoIniziale + totale_con_iva - pagamenti - abbuoni
# ─────────────────────────────────────────────────────────────────
def _calcola_residuo(db, ditta_id, anno=None):
    """
    Calcola il residuo di una ditta per l'anno corrente (o tutti gli anni se anno=None).
    Restituisce (residuo_float, data_ultimo_pagamento).
    """
    # Residuo iniziale
    row = db.execute('SELECT residuo_iniziale FROM ditte WHERE id=?', (ditta_id,)).fetchone()
    residuo_iniziale = row['residuo_iniziale'] if row else 0.0

    # Dovuto (pratiche)
    if anno:
        dovuto = db.execute(
            'SELECT COALESCE(SUM(importo),0) FROM pratiche WHERE ditta_id=? AND anno=?',
            (ditta_id, anno)
        ).fetchone()[0]
    else:
        dovuto = db.execute(
            'SELECT COALESCE(SUM(importo),0) FROM pratiche WHERE ditta_id=?',
            (ditta_id,)
        ).fetchone()[0]

    # Pagamenti
    if anno:
        pagato = db.execute(
            'SELECT COALESCE(SUM(importo),0) FROM pagamenti WHERE ditta_id=? AND anno=?',
            (ditta_id, anno)
        ).fetchone()[0]
    else:
        pagato = db.execute(
            'SELECT COALESCE(SUM(importo),0) FROM pagamenti WHERE ditta_id=?',
            (ditta_id,)
        ).fetchone()[0]

    # Abbuoni
    if anno:
        abbuoni = db.execute(
            "SELECT COALESCE(SUM(importo),0) FROM arrotondamenti WHERE ditta_id=? AND tipo='abbuono' AND strftime('%Y', data)=?",
            (ditta_id, str(anno))
        ).fetchone()[0]
    else:
        abbuoni = db.execute(
            "SELECT COALESCE(SUM(importo),0) FROM arrotondamenti WHERE ditta_id=? AND tipo='abbuono'",
            (ditta_id,)
        ).fetchone()[0]

    # Addebiti
    if anno:
        addebiti = db.execute(
            "SELECT COALESCE(SUM(importo),0) FROM arrotondamenti WHERE ditta_id=? AND tipo='addebito' AND strftime('%Y', data)=?",
            (ditta_id, str(anno))
        ).fetchone()[0]
    else:
        addebiti = db.execute(
            "SELECT COALESCE(SUM(importo),0) FROM arrotondamenti WHERE ditta_id=? AND tipo='addebito'",
            (ditta_id,)
        ).fetchone()[0]

    # Ultimo pagamento
    ult_pag_row = db.execute(
        'SELECT MAX(data) FROM pagamenti WHERE ditta_id=?', (ditta_id,)
    ).fetchone()
    ult_pag = ult_pag_row[0] if ult_pag_row else None

    residuo = residuo_iniziale + dovuto - pagato - abbuoni + addebiti
    return round(residuo, 2), ult_pag


# ─────────────────────────────────────────────────────────────────
# GET /api/prima-nota/saldi
# Restituisce i saldi di Cassa e tutte le Banche configurate
# ─────────────────────────────────────────────────────────────────
@bp.route('/api/prima-nota/saldi')
@login_required
def get_saldi():
    db = get_db()
    saldi = []

    # Saldo CASSA
    cassa_in = db.execute(
        "SELECT COALESCE(SUM(importo),0) FROM movimenti_studio WHERE tipologia='cassa' AND tipo='entrata'"
    ).fetchone()[0]
    cassa_out = db.execute(
        "SELECT COALESCE(SUM(importo),0) FROM movimenti_studio WHERE tipologia='cassa' AND tipo='uscita'"
    ).fetchone()[0]
    cassa_giro_in = db.execute(
        "SELECT COALESCE(SUM(importo),0) FROM movimenti_studio WHERE tipologia='cassa' AND tipo='giroconto' AND giroconto_dir='entrata'"
    ).fetchone()[0]
    cassa_giro_out = db.execute(
        "SELECT COALESCE(SUM(importo),0) FROM movimenti_studio WHERE tipologia='cassa' AND tipo='giroconto' AND giroconto_dir='uscita'"
    ).fetchone()[0]

    # Saldo iniziale cassa (da impostazioni, default 0)
    cassa_saldo_iniziale = 0.0
    try:
        row = db.execute("SELECT valore FROM impostazioni WHERE chiave='saldo_iniziale_cassa'").fetchone()
        if row:
            cassa_saldo_iniziale = float(row['valore'])
    except Exception:
        pass

    saldo_cassa = cassa_saldo_iniziale + cassa_in - cassa_out + cassa_giro_in - cassa_giro_out
    saldi.append({'id': 'cassa', 'nome': 'Cassa', 'saldo': round(saldo_cassa, 2)})

    # Saldi BANCHE
    banche = db.execute('SELECT * FROM banche_studio ORDER BY ordine, nome').fetchall()
    for banca in banche:
        tid = f"banca_{banca['id']}"
        b_in = db.execute(
            "SELECT COALESCE(SUM(importo),0) FROM movimenti_studio WHERE tipologia=? AND tipo='entrata'", (tid,)
        ).fetchone()[0]
        b_out = db.execute(
            "SELECT COALESCE(SUM(importo),0) FROM movimenti_studio WHERE tipologia=? AND tipo='uscita'", (tid,)
        ).fetchone()[0]
        b_giro_in = db.execute(
            "SELECT COALESCE(SUM(importo),0) FROM movimenti_studio WHERE tipologia=? AND tipo='giroconto' AND giroconto_dir='entrata'", (tid,)
        ).fetchone()[0]
        b_giro_out = db.execute(
            "SELECT COALESCE(SUM(importo),0) FROM movimenti_studio WHERE tipologia=? AND tipo='giroconto' AND giroconto_dir='uscita'", (tid,)
        ).fetchone()[0]
        saldo_banca = banca['saldo_iniziale'] + b_in - b_out + b_giro_in - b_giro_out
        saldi.append({'id': tid, 'nome': banca['nome'], 'saldo': round(saldo_banca, 2)})

    db.close()
    return jsonify(saldi)


# ─────────────────────────────────────────────────────────────────
# GET /api/prima-nota/movimenti
# Query params: anno, mese, tipo, cerca
# ─────────────────────────────────────────────────────────────────
@bp.route('/api/prima-nota/movimenti')
@login_required
def get_movimenti():
    db = get_db()
    anno = request.args.get('anno', '')
    mese = request.args.get('mese', '')
    tipo = request.args.get('tipo', '')
    cerca = request.args.get('cerca', '').strip()

    query = """
        SELECT m.*,
               CASE
                   WHEN m.tipo='entrata' AND m.macrogruppo_id='clienti' THEN d.ragione_sociale
                   ELSE m.sottovoce_nome
               END AS nome_display,
               CASE
                   WHEN mf.movimento_id IS NOT NULL THEN 1 ELSE 0
               END AS fatturato,
               mf.data_fatturazione
        FROM movimenti_studio m
        LEFT JOIN ditte d ON (m.macrogruppo_id='clienti' AND m.sottovoce_id = CAST(d.id AS TEXT))
        LEFT JOIN movimenti_fatturati mf ON mf.movimento_id = m.id
        WHERE 1=1
    """
    params = []

    if anno:
        query += " AND strftime('%Y', m.data) = ?"
        params.append(str(anno))
    if mese and mese != '0':
        query += " AND strftime('%m', m.data) = ?"
        params.append(str(mese).zfill(2))
    if tipo and tipo != 'tutti':
        if tipo == 'entrate':
            query += " AND m.tipo = 'entrata'"
        elif tipo == 'uscite':
            query += " AND m.tipo = 'uscita'"
        elif tipo == 'giroconti':
            query += " AND m.tipo = 'giroconto'"
    if cerca:
        query += " AND (m.macrogruppo_nome LIKE ? OR m.sottovoce_nome LIKE ? OR m.descrizione LIKE ? OR d.ragione_sociale LIKE ?)"
        like = f'%{cerca}%'
        params.extend([like, like, like, like])

    fatturato = request.args.get('fatturato', 'tutti')
    if fatturato == 'si':
        query += " AND mf.movimento_id IS NOT NULL"
    elif fatturato == 'no':
        query += " AND mf.movimento_id IS NULL AND m.tipo = 'entrata'"

    query += " ORDER BY m.data DESC, m.id DESC"

    rows = db.execute(query, params).fetchall()
    today = date.today()
    result = []
    for r in rows:
        d = dict(r)
        # Calcola flag_fatturato
        if d['tipo'] in ('entrata',):
            if d['fatturato']:
                d['flag'] = 'fatturato'
            else:
                data_mov = datetime.strptime(d['data'], '%Y-%m-%d').date()
                giorni = (today - data_mov).days
                d['flag'] = 'urgente' if giorni > 7 else 'da_fatturare'
        else:
            d['flag'] = None
        result.append(d)

    db.close()
    return jsonify(result)


# ─────────────────────────────────────────────────────────────────
# GET /api/prima-nota/clienti-da-sollecitare
# Clienti non archiviati con residuo > 0, ordinati per residuo DESC
# ─────────────────────────────────────────────────────────────────
@bp.route('/api/prima-nota/clienti-da-sollecitare')
@login_required
def get_clienti_da_sollecitare():
    db = get_db()
    ditte = db.execute(
        'SELECT id, ragione_sociale FROM ditte WHERE archiviato=0 ORDER BY ragione_sociale'
    ).fetchall()

    result = []
    for ditta in ditte:
        residuo, ult_pag = _calcola_residuo(db, ditta['id'])
        if residuo > 0:
            result.append({
                'id': ditta['id'],
                'ragione_sociale': ditta['ragione_sociale'],
                'residuo': residuo,
                'ultimo_pagamento': ult_pag
            })

    # Ordina per residuo decrescente
    result.sort(key=lambda x: x['residuo'], reverse=True)
    db.close()
    return jsonify(result)


# ─────────────────────────────────────────────────────────────────
# DELETE /api/prima-nota/movimenti/<id>
# Elimina un movimento. Se giroconto: elimina entrambe le gambe.
# Se entrata cliente: elimina anche il pagamento collegato.
# ─────────────────────────────────────────────────────────────────
@bp.route('/api/prima-nota/movimenti/<int:mov_id>', methods=['DELETE'])
@login_required
def elimina_movimento(mov_id):
    db = get_db()
    mov = db.execute('SELECT * FROM movimenti_studio WHERE id=?', (mov_id,)).fetchone()
    if not mov:
        db.close()
        return jsonify({'error': 'Movimento non trovato'}), 404

    ids_da_eliminare = [mov_id]

    # Se è un giroconto: elimina anche la gamba speculare
    if mov['tipo'] == 'giroconto' and mov['giroconto_id']:
        altra_gamba = db.execute(
            'SELECT id FROM movimenti_studio WHERE giroconto_id=? AND id!=?',
            (mov['giroconto_id'], mov_id)
        ).fetchone()
        if altra_gamba:
            ids_da_eliminare.append(altra_gamba['id'])

    # Se è un'entrata da cliente: elimina pagamento collegato
    if mov['tipo'] == 'entrata' and mov['macrogruppo_id'] == 'clienti':
        db.execute(
            'DELETE FROM pagamenti WHERE movimenti_studio_id=?', (mov_id,)
        )

    # Rimuovi flag fatturato
    db.execute('DELETE FROM movimenti_fatturati WHERE movimento_id=?', (mov_id,))

    # Elimina movimento(i)
    for mid in ids_da_eliminare:
        db.execute('DELETE FROM movimenti_studio WHERE id=?', (mid,))
        db.execute('DELETE FROM movimenti_fatturati WHERE movimento_id=?', (mid,))

    db.commit()
    db.close()
    return jsonify({'ok': True, 'eliminati': ids_da_eliminare})


# ─────────────────────────────────────────────────────────────────
# PATCH /api/prima-nota/movimenti/<id>/rimuovi-fatturato
# Rimuove il flag fatturato da un movimento (click sull'icona V)
# ─────────────────────────────────────────────────────────────────
@bp.route('/api/prima-nota/movimenti/<int:mov_id>/rimuovi-fatturato', methods=['PATCH'])
@login_required
def rimuovi_fatturato(mov_id):
    db = get_db()
    db.execute('DELETE FROM movimenti_fatturati WHERE movimento_id=?', (mov_id,))
    db.commit()
    db.close()
    return jsonify({'ok': True})


# ─────────────────────────────────────────────────────────────────
# GET /api/prima-nota/anni
# Lista degli anni presenti in movimenti_studio (per il filtro)
# ─────────────────────────────────────────────────────────────────
@bp.route('/api/prima-nota/anni')
@login_required
def get_anni():
    db = get_db()
    rows = db.execute(
        "SELECT DISTINCT strftime('%Y', data) AS anno FROM movimenti_studio ORDER BY anno DESC"
    ).fetchall()
    anni = [r['anno'] for r in rows if r['anno']]
    # Assicura che l'anno corrente sia sempre presente
    anno_corrente = str(date.today().year)
    if anno_corrente not in anni:
        anni.insert(0, anno_corrente)
    db.close()
    return jsonify(anni)


# ─────────────────────────────────────────────────────────────────
# GET /api/prima-nota/categorie
# Restituisce macrogruppi+sottovoci per entrate e uscite.
# Entrate: [{"clienti" speciale} + macrogruppi_entrate]
# Uscite:  [macrogruppi_uscite]
# ─────────────────────────────────────────────────────────────────
@bp.route('/api/prima-nota/categorie')
@login_required
def get_categorie():
    db = get_db()

    # Entrate — "Clienti" speciale (lista clienti non archiviati)
    clienti = db.execute(
        'SELECT id, ragione_sociale FROM ditte WHERE archiviato=0 ORDER BY ragione_sociale'
    ).fetchall()
    entrate = [{
        'id': 'clienti',
        'nome': 'Clienti',
        'speciale': True,
        'sottovoci': [{'id': str(c['id']), 'nome': c['ragione_sociale']} for c in clienti]
    }]

    # Entrate — macrogruppi liberi con sottovoci
    macro_e = db.execute('SELECT * FROM macrogruppi_entrate ORDER BY ordine, nome').fetchall()
    for m in macro_e:
        sv = db.execute(
            'SELECT * FROM sottovoci_entrate WHERE macrogruppo_id=? ORDER BY ordine, nome', (m['id'],)
        ).fetchall()
        entrate.append({
            'id': m['id'],
            'nome': m['nome'],
            'speciale': False,
            'sottovoci': [{'id': s['id'], 'nome': s['nome']} for s in sv]
        })

    # Uscite — macrogruppi con sottovoci
    uscite = []
    macro_u = db.execute('SELECT * FROM macrogruppi_uscite ORDER BY ordine, nome').fetchall()
    for m in macro_u:
        sv = db.execute(
            'SELECT * FROM sottovoci_uscite WHERE macrogruppo_id=? ORDER BY ordine, nome', (m['id'],)
        ).fetchall()
        uscite.append({
            'id': m['id'],
            'nome': m['nome'],
            'sottovoci': [{'id': s['id'], 'nome': s['nome']} for s in sv]
        })

    db.close()
    return jsonify({'entrate': entrate, 'uscite': uscite})


# ─────────────────────────────────────────────────────────────────
# POST /api/prima-nota/movimenti
# Crea un movimento entrata o uscita.
# Se entrata + categoria "clienti": crea anche il pagamento.
# ─────────────────────────────────────────────────────────────────
@bp.route('/api/prima-nota/movimenti', methods=['POST'])
@login_required
def crea_movimento():
    db = get_db()
    d = request.get_json() or {}

    tipo           = d.get('tipo', '').strip()
    data_mov       = d.get('data', '').strip()
    tipologia      = d.get('tipologia', '').strip()
    macrogruppo_id = str(d.get('macrogruppo_id', '')).strip()
    macrogruppo_nome = d.get('macrogruppo_nome', '').strip()
    sottovoce_id   = str(d.get('sottovoce_id', '')).strip()
    sottovoce_nome = d.get('sottovoce_nome', '').strip()
    descrizione    = d.get('descrizione', '').strip()

    try:
        importo = float(d.get('importo', 0))
    except (TypeError, ValueError):
        importo = 0.0

    # Validazioni specifiche per campo
    if not data_mov:
        db.close(); return jsonify({'error': 'Inserisci la data del movimento'}), 400
    if not tipologia:
        db.close(); return jsonify({'error': 'Seleziona Cassa o una banca'}), 400
    if not macrogruppo_id:
        db.close(); return jsonify({'error': 'Seleziona una categoria'}), 400
    if not sottovoce_id:
        db.close(); return jsonify({'error': 'Seleziona la sottovoce'}), 400
    if importo <= 0:
        db.close(); return jsonify({'error': "L'importo deve essere maggiore di zero"}), 400
    if tipo not in ('entrata', 'uscita'):
        db.close(); return jsonify({'error': 'Tipo non valido'}), 400

    db.execute(
        '''INSERT INTO movimenti_studio
           (tipo, data, tipologia, macrogruppo_id, macrogruppo_nome,
            sottovoce_id, sottovoce_nome, importo, descrizione)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
        (tipo, data_mov, tipologia, macrogruppo_id, macrogruppo_nome,
         sottovoce_id, sottovoce_nome, importo, descrizione)
    )
    mov_id = db.execute('SELECT last_insert_rowid()').fetchone()[0]

    # Se entrata da cliente: crea anche il pagamento sulla scheda cliente
    if tipo == 'entrata' and macrogruppo_id == 'clienti':
        anno = int(data_mov.split('-')[0])
        if tipologia == 'cassa':
            mezzo = 'Contanti'
        elif tipologia.startswith('banca_'):
            banca_id = tipologia.split('_')[1]
            banca = db.execute('SELECT nome FROM banche_studio WHERE id=?', (banca_id,)).fetchone()
            mezzo = f'Bonifico {banca["nome"]}' if banca else 'Bonifico'
        else:
            mezzo = tipologia

        db.execute(
            '''INSERT INTO pagamenti
               (ditta_id, anno, data, importo, metodo, note, movimenti_studio_id)
               VALUES (?, ?, ?, ?, ?, ?, ?)''',
            (int(sottovoce_id), anno, data_mov, importo, mezzo, descrizione, mov_id)
        )

    db.commit()
    db.close()
    return jsonify({'ok': True, 'id': mov_id})


# ─────────────────────────────────────────────────────────────────
# POST /api/prima-nota/giroconto
# Crea 2 movimenti speculari con lo stesso giroconto_id.
# Body: {data, tipo, da, a, importo, descrizione}
# tipo: versamento | prelievo | bonifico | spostamento
# ─────────────────────────────────────────────────────────────────
@bp.route('/api/prima-nota/giroconto', methods=['POST'])
@login_required
def crea_giroconto():
    db = get_db()
    d = request.get_json() or {}

    data_mov    = d.get('data', '').strip()
    tipo_giro   = d.get('tipo', '').strip()
    origine     = d.get('da', '').strip()
    dest        = d.get('a', '').strip()
    descrizione = d.get('descrizione', '').strip()

    try:
        importo = float(d.get('importo', 0))
    except (TypeError, ValueError):
        importo = 0.0

    if not data_mov:
        db.close(); return jsonify({'error': 'Inserisci la data'}), 400
    if tipo_giro not in ('versamento', 'prelievo', 'bonifico', 'spostamento'):
        db.close(); return jsonify({'error': 'Seleziona il tipo di giroconto'}), 400
    if not origine:
        db.close(); return jsonify({'error': 'Seleziona il conto di origine'}), 400
    if not dest:
        db.close(); return jsonify({'error': 'Seleziona il conto di destinazione'}), 400
    if origine == dest:
        db.close(); return jsonify({'error': 'I conti di origine e destinazione devono essere diversi'}), 400
    if importo <= 0:
        db.close(); return jsonify({'error': 'Inserisci un importo valido'}), 400

    giro_id = str(uuid.uuid4())

    def _nome_conto(tipologia):
        if tipologia == 'cassa':
            return 'Cassa'
        if tipologia.startswith('banca_'):
            bid = tipologia.split('_')[1]
            b = db.execute('SELECT nome FROM banche_studio WHERE id=?', (bid,)).fetchone()
            return b['nome'] if b else tipologia
        return tipologia

    nome_orig = _nome_conto(origine)
    nome_dest = _nome_conto(dest)

    # Gamba USCITA dal conto origine (sottovoce_nome = destinazione)
    db.execute(
        '''INSERT INTO movimenti_studio
           (tipo, data, tipologia, macrogruppo_id, macrogruppo_nome,
            sottovoce_id, sottovoce_nome, importo, descrizione,
            giroconto_id, giroconto_dir, giroconto_tipo)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?)''',
        ('giroconto', data_mov, origine,
         None, 'Giroconto', None, nome_dest,
         importo, descrizione,
         giro_id, 'uscita', tipo_giro)
    )
    id_uscita = db.execute('SELECT last_insert_rowid()').fetchone()[0]

    # Gamba ENTRATA nel conto destinazione (sottovoce_nome = origine)
    db.execute(
        '''INSERT INTO movimenti_studio
           (tipo, data, tipologia, macrogruppo_id, macrogruppo_nome,
            sottovoce_id, sottovoce_nome, importo, descrizione,
            giroconto_id, giroconto_dir, giroconto_tipo)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?)''',
        ('giroconto', data_mov, dest,
         None, 'Giroconto', None, nome_orig,
         importo, descrizione,
         giro_id, 'entrata', tipo_giro)
    )
    id_entrata = db.execute('SELECT last_insert_rowid()').fetchone()[0]

    db.commit()
    db.close()
    return jsonify({
        'ok': True,
        'ids': [id_uscita, id_entrata],
        'msg': f'Giroconto registrato: {importo:.2f} EUR da {nome_orig} a {nome_dest}'
    })


# ─────────────────────────────────────────────────────────────────
# GET /api/prima-nota/da-fatturare
# Entrate non ancora in movimenti_fatturati.
# Restituisce soggetto, categoria dedotta, data, importo.
# ─────────────────────────────────────────────────────────────────
@bp.route('/api/prima-nota/da-fatturare')
@login_required
def get_da_fatturare():
    db = get_db()
    oggi = date.today().isoformat()

    rows = db.execute(
        '''SELECT m.id, m.data, m.tipologia, m.macrogruppo_id, m.macrogruppo_nome,
                  m.sottovoce_id, m.sottovoce_nome, m.importo,
                  d.ragione_sociale,
                  d.inizio_paghe, d.fine_paghe,
                  d.inizio_contabilita, d.fine_contabilita
           FROM movimenti_studio m
           LEFT JOIN ditte d ON (m.macrogruppo_id = 'clienti'
                                  AND m.sottovoce_id = CAST(d.id AS TEXT))
           LEFT JOIN movimenti_fatturati mf ON mf.movimento_id = m.id
           WHERE m.tipo = 'entrata' AND mf.movimento_id IS NULL
           ORDER BY m.data DESC, m.id DESC'''
    ).fetchall()

    result = []
    for r in rows:
        r = dict(r)
        if r['macrogruppo_id'] == 'clienti' and r['ragione_sociale']:
            soggetto = r['ragione_sociale']
            # Deduce tipo gestione attiva oggi
            ha_paghe = (r['inizio_paghe'] and r['inizio_paghe'] <= oggi and
                        (not r['fine_paghe'] or r['fine_paghe'] >= oggi))
            ha_cont  = (r['inizio_contabilita'] and r['inizio_contabilita'] <= oggi and
                        (not r['fine_contabilita'] or r['fine_contabilita'] >= oggi))
            if ha_paghe and ha_cont:
                categoria = 'Paghe + Contabilità'
            elif ha_paghe:
                categoria = 'Paghe'
            elif ha_cont:
                categoria = 'Contabilità'
            else:
                categoria = r['macrogruppo_nome'] or 'Clienti'
        else:
            soggetto  = r['sottovoce_nome'] or r['macrogruppo_nome'] or '—'
            categoria = r['macrogruppo_nome'] or '—'

        result.append({
            'id':       r['id'],
            'data':     r['data'],
            'soggetto': soggetto,
            'categoria': categoria,
            'importo':  r['importo'],
        })

    db.close()
    return jsonify(result)


# ─────────────────────────────────────────────────────────────────
# POST /api/prima-nota/fatturazione/pdf
# Genera PDF "Incassi da fatturare" per i movimenti selezionati.
# Body: {ids: [1,2,3]}
# ─────────────────────────────────────────────────────────────────
@bp.route('/api/prima-nota/fatturazione/pdf', methods=['POST'])
@login_required
def genera_pdf_fatturazione():
    db = get_db()
    d = request.get_json() or {}
    ids = d.get('ids', [])

    if not ids:
        db.close()
        return jsonify({'error': 'Seleziona almeno un incasso da fatturare'}), 400

    placeholders = ','.join('?' * len(ids))
    rows = db.execute(
        f'''SELECT m.id, m.data, m.importo, m.macrogruppo_nome,
                   m.sottovoce_nome, m.macrogruppo_id,
                   d.ragione_sociale,
                   d.inizio_paghe, d.fine_paghe,
                   d.inizio_contabilita, d.fine_contabilita
            FROM movimenti_studio m
            LEFT JOIN ditte d ON (m.macrogruppo_id = 'clienti'
                                   AND m.sottovoce_id = CAST(d.id AS TEXT))
            WHERE m.id IN ({placeholders})
            ORDER BY m.data DESC''',
        ids
    ).fetchall()
    db.close()

    oggi = date.today().isoformat()
    incassi = []
    totale = 0.0
    for r in rows:
        r = dict(r)
        if r['macrogruppo_id'] == 'clienti' and r['ragione_sociale']:
            soggetto = r['ragione_sociale']
            ha_p = (r['inizio_paghe'] and r['inizio_paghe'] <= oggi and
                    (not r['fine_paghe'] or r['fine_paghe'] >= oggi))
            ha_c = (r['inizio_contabilita'] and r['inizio_contabilita'] <= oggi and
                    (not r['fine_contabilita'] or r['fine_contabilita'] >= oggi))
            cat = ('Paghe + Contabilità' if ha_p and ha_c
                   else 'Paghe' if ha_p
                   else 'Contabilità' if ha_c
                   else r['macrogruppo_nome'] or 'Clienti')
        else:
            soggetto = r['sottovoce_nome'] or r['macrogruppo_nome'] or '—'
            cat = r['macrogruppo_nome'] or '—'

        incassi.append({'data': r['data'], 'soggetto': soggetto,
                        'categoria': cat, 'importo': r['importo']})
        totale += r['importo']

    buf = _genera_pdf_incassi(incassi, totale)
    nome = f"Fatturazione_{date.today()}.pdf"
    return send_file(buf, mimetype='application/pdf',
                     as_attachment=True, download_name=nome)


def _genera_pdf_incassi(incassi, totale):
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.units import cm
        from reportlab.lib import colors
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    except ImportError:
        raise RuntimeError('reportlab non installato')

    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                             leftMargin=2.5*cm, rightMargin=2.5*cm,
                             topMargin=3*cm, bottomMargin=3*cm)
    styles = getSampleStyleSheet()
    TITLE = ParagraphStyle('title', fontSize=16, leading=20,
                            fontName='Helvetica-Bold', spaceAfter=6)
    BOLD  = ParagraphStyle('bold',  fontSize=11, leading=15, fontName='Helvetica-Bold')
    NORM  = ParagraphStyle('norm',  fontSize=10, leading=14)
    SMALL = ParagraphStyle('sm',    fontSize=9,  leading=13,
                            textColor=colors.HexColor('#4a5568'))
    FOOT  = ParagraphStyle('foot',  fontSize=8,  leading=12,
                            textColor=colors.HexColor('#718096'))

    oggi_fmt = date.today().strftime('%d/%m/%Y')
    story = []

    story.append(Paragraph('INCASSI DA FATTURARE', TITLE))
    story.append(Paragraph(f'Data: {oggi_fmt}   —   Incassi selezionati: {len(incassi)}', NORM))
    story.append(Spacer(1, 0.8*cm))

    # Tabella incassi
    header = ['Data', 'Soggetto', 'Tipo', 'Importo']
    table_data = [header]
    for inc in incassi:
        d_fmt = '/'.join(reversed(inc['data'].split('-'))) if inc['data'] else '—'
        table_data.append([
            d_fmt,
            inc['soggetto'],
            inc['categoria'],
            f"€ {inc['importo']:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
        ])
    # Riga totale
    table_data.append(['', '', 'TOTALE', f"€ {totale:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')])

    col_w = [2.2*cm, 7*cm, 4.5*cm, 2.8*cm]
    t = Table(table_data, colWidths=col_w, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND',   (0, 0), (-1, 0),  colors.HexColor('#2d3748')),
        ('TEXTCOLOR',    (0, 0), (-1, 0),  colors.white),
        ('FONTNAME',     (0, 0), (-1, 0),  'Helvetica-Bold'),
        ('FONTSIZE',     (0, 0), (-1, 0),  9),
        ('ROWBACKGROUNDS', (0, 1), (-2, -2), [colors.white, colors.HexColor('#f7fafc')]),
        ('FONTSIZE',     (0, 1), (-1, -1), 9),
        ('ALIGN',        (3, 0), (3, -1),  'RIGHT'),
        ('FONTNAME',     (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('LINEABOVE',    (0, -1), (-1, -1), 1, colors.HexColor('#2d3748')),
        ('GRID',         (0, 0), (-1, -2), 0.25, colors.HexColor('#e2e8f0')),
        ('TOPPADDING',   (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING',(0, 0), (-1, -1), 4),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.8*cm))

    story.append(Paragraph(
        f'Documento generato il {oggi_fmt} — Ricordati di emettere fattura entro 12 giorni dall\'incasso.',
        FOOT
    ))

    doc.build(story)
    buf.seek(0)
    return buf


# ─────────────────────────────────────────────────────────────────
# POST /api/prima-nota/fatturazione/marca
# Segna i movimenti selezionati come fatturati.
# Body: {ids: [1,2,3]}
# ─────────────────────────────────────────────────────────────────
@bp.route('/api/prima-nota/fatturazione/marca', methods=['POST'])
@login_required
def marca_fatturati():
    db = get_db()
    d = request.get_json() or {}
    ids = d.get('ids', [])

    if not ids:
        db.close()
        return jsonify({'error': 'Nessun id ricevuto'}), 400

    for mid in ids:
        db.execute(
            'INSERT OR IGNORE INTO movimenti_fatturati (movimento_id) VALUES (?)', (mid,)
        )

    db.commit()
    db.close()
    return jsonify({'ok': True, 'marcati': len(ids)})


# ═════════════════════════════════════════════════════════════════
# BLOCCO 4 — Gestione anagrafica
# ═════════════════════════════════════════════════════════════════

# ── Banche ────────────────────────────────────────────────────────

@bp.route('/api/prima-nota/banche', methods=['GET'])
@login_required
def get_banche():
    db = get_db()
    rows = db.execute('SELECT * FROM banche_studio ORDER BY ordine, nome').fetchall()
    db.close()
    return jsonify([dict(r) for r in rows])


@bp.route('/api/prima-nota/banche', methods=['POST'])
@login_required
def crea_banca():
    db = get_db()
    d = request.get_json() or {}
    nome = d.get('nome', '').strip()
    if not nome:
        db.close()
        return jsonify({'error': 'Il nome è obbligatorio'}), 400
    saldo_iniziale = float(d.get('saldo_iniziale', 0) or 0)
    colore = (d.get('colore') or '#6366f1').strip()
    ordine = db.execute('SELECT COALESCE(MAX(ordine),0)+1 FROM banche_studio').fetchone()[0]
    db.execute(
        'INSERT INTO banche_studio (nome, saldo_iniziale, colore, ordine) VALUES (?,?,?,?)',
        (nome, saldo_iniziale, colore, ordine)
    )
    bid = db.execute('SELECT last_insert_rowid()').fetchone()[0]
    db.commit()
    db.close()
    return jsonify({'ok': True, 'id': bid})


@bp.route('/api/prima-nota/banche/<int:banca_id>', methods=['PUT'])
@login_required
def aggiorna_banca(banca_id):
    db = get_db()
    d = request.get_json() or {}
    nome = d.get('nome', '').strip()
    if not nome:
        db.close()
        return jsonify({'error': 'Il nome è obbligatorio'}), 400
    saldo_iniziale = float(d.get('saldo_iniziale', 0) or 0)
    colore = (d.get('colore') or '#6366f1').strip()
    db.execute(
        'UPDATE banche_studio SET nome=?, saldo_iniziale=?, colore=? WHERE id=?',
        (nome, saldo_iniziale, colore, banca_id)
    )
    db.commit()
    db.close()
    return jsonify({'ok': True})


@bp.route('/api/prima-nota/banche/<int:banca_id>', methods=['DELETE'])
@login_required
def elimina_banca(banca_id):
    db = get_db()
    tipologia = f'banca_{banca_id}'
    count = db.execute(
        'SELECT COUNT(*) FROM movimenti_studio WHERE tipologia=?', (tipologia,)
    ).fetchone()[0]
    if count > 0:
        db.close()
        return jsonify({'error': f'Impossibile eliminare: la banca ha {count} movimenti collegati'}), 400
    db.execute('DELETE FROM banche_studio WHERE id=?', (banca_id,))
    db.commit()
    db.close()
    return jsonify({'ok': True})


# ── Macrogruppi (entrate / uscite) ────────────────────────────────

def _get_macrogruppi_list(tipo):
    t_m = f'macrogruppi_{tipo}'
    t_s = f'sottovoci_{tipo}'
    db = get_db()
    macros = db.execute(f'SELECT * FROM {t_m} ORDER BY ordine, nome').fetchall()
    result = []
    for m in macros:
        sv = db.execute(
            f'SELECT * FROM {t_s} WHERE macrogruppo_id=? ORDER BY ordine, nome', (m['id'],)
        ).fetchall()
        result.append({**dict(m), 'sottovoci': [dict(s) for s in sv]})
    db.close()
    return result


@bp.route('/api/prima-nota/macrogruppi/entrate', methods=['GET'])
@login_required
def get_macrogruppi_entrate():
    return jsonify(_get_macrogruppi_list('entrate'))


@bp.route('/api/prima-nota/macrogruppi/uscite', methods=['GET'])
@login_required
def get_macrogruppi_uscite():
    return jsonify(_get_macrogruppi_list('uscite'))


@bp.route('/api/prima-nota/macrogruppi/<tipo>', methods=['POST'])
@login_required
def crea_macrogruppo(tipo):
    if tipo not in ('entrate', 'uscite'):
        return jsonify({'error': 'Tipo non valido'}), 400
    db = get_db()
    d = request.get_json() or {}
    nome = d.get('nome', '').strip()
    if not nome:
        db.close()
        return jsonify({'error': 'Il nome è obbligatorio'}), 400
    t_m = f'macrogruppi_{tipo}'
    ordine = db.execute(f'SELECT COALESCE(MAX(ordine),0)+1 FROM {t_m}').fetchone()[0]
    db.execute(f'INSERT INTO {t_m} (nome, ordine) VALUES (?,?)', (nome, ordine))
    mid = db.execute('SELECT last_insert_rowid()').fetchone()[0]
    db.commit()
    db.close()
    return jsonify({'ok': True, 'id': mid})


@bp.route('/api/prima-nota/macrogruppi/<tipo>/<int:macro_id>', methods=['PUT'])
@login_required
def aggiorna_macrogruppo(tipo, macro_id):
    if tipo not in ('entrate', 'uscite'):
        return jsonify({'error': 'Tipo non valido'}), 400
    db = get_db()
    d = request.get_json() or {}
    nome = d.get('nome', '').strip()
    if not nome:
        db.close()
        return jsonify({'error': 'Il nome è obbligatorio'}), 400
    t_m = f'macrogruppi_{tipo}'
    db.execute(f'UPDATE {t_m} SET nome=? WHERE id=?', (nome, macro_id))
    db.commit()
    db.close()
    return jsonify({'ok': True})


@bp.route('/api/prima-nota/macrogruppi/<tipo>/<int:macro_id>', methods=['DELETE'])
@login_required
def elimina_macrogruppo(tipo, macro_id):
    if tipo not in ('entrate', 'uscite'):
        return jsonify({'error': 'Tipo non valido'}), 400
    db = get_db()
    tipo_mov = 'entrata' if tipo == 'entrate' else 'uscita'
    count = db.execute(
        'SELECT COUNT(*) FROM movimenti_studio WHERE macrogruppo_id=? AND tipo=?',
        (str(macro_id), tipo_mov)
    ).fetchone()[0]
    if count > 0:
        db.close()
        return jsonify({'error': f'Impossibile eliminare: il macrogruppo ha {count} movimenti collegati'}), 400
    t_m = f'macrogruppi_{tipo}'
    t_s = f'sottovoci_{tipo}'
    db.execute(f'DELETE FROM {t_s} WHERE macrogruppo_id=?', (macro_id,))
    db.execute(f'DELETE FROM {t_m} WHERE id=?', (macro_id,))
    db.commit()
    db.close()
    return jsonify({'ok': True})


@bp.route('/api/prima-nota/macrogruppi/<tipo>/<int:macro_id>/sottovoci', methods=['POST'])
@login_required
def crea_sottovoce(tipo, macro_id):
    if tipo not in ('entrate', 'uscite'):
        return jsonify({'error': 'Tipo non valido'}), 400
    db = get_db()
    d = request.get_json() or {}
    nome = d.get('nome', '').strip()
    if not nome:
        db.close()
        return jsonify({'error': 'Il nome è obbligatorio'}), 400
    t_s = f'sottovoci_{tipo}'
    ordine = db.execute(
        f'SELECT COALESCE(MAX(ordine),0)+1 FROM {t_s} WHERE macrogruppo_id=?', (macro_id,)
    ).fetchone()[0]
    db.execute(f'INSERT INTO {t_s} (macrogruppo_id, nome, ordine) VALUES (?,?,?)',
               (macro_id, nome, ordine))
    sid = db.execute('SELECT last_insert_rowid()').fetchone()[0]
    db.commit()
    db.close()
    return jsonify({'ok': True, 'id': sid})


@bp.route('/api/prima-nota/macrogruppi/<tipo>/<int:macro_id>/sottovoci/<int:sottovoce_id>',
          methods=['PUT'])
@login_required
def aggiorna_sottovoce(tipo, macro_id, sottovoce_id):
    if tipo not in ('entrate', 'uscite'):
        return jsonify({'error': 'Tipo non valido'}), 400
    db = get_db()
    d = request.get_json() or {}
    nome = d.get('nome', '').strip()
    if not nome:
        db.close()
        return jsonify({'error': 'Il nome è obbligatorio'}), 400
    t_s = f'sottovoci_{tipo}'
    db.execute(f'UPDATE {t_s} SET nome=? WHERE id=?', (nome, sottovoce_id))
    db.commit()
    db.close()
    return jsonify({'ok': True})


@bp.route('/api/prima-nota/macrogruppi/<tipo>/<int:macro_id>/sottovoci/<int:sottovoce_id>',
          methods=['DELETE'])
@login_required
def elimina_sottovoce(tipo, macro_id, sottovoce_id):
    if tipo not in ('entrate', 'uscite'):
        return jsonify({'error': 'Tipo non valido'}), 400
    db = get_db()
    count = db.execute(
        'SELECT COUNT(*) FROM movimenti_studio WHERE sottovoce_id=?',
        (str(sottovoce_id),)
    ).fetchone()[0]
    if count > 0:
        db.close()
        return jsonify({'error': f'Impossibile eliminare: la sottovoce ha {count} movimenti collegati'}), 400
    t_s = f'sottovoci_{tipo}'
    db.execute(f'DELETE FROM {t_s} WHERE id=?', (sottovoce_id,))
    db.commit()
    db.close()
    return jsonify({'ok': True})


# ─────────────────────────────────────────────────────────────────
# PUT /api/prima-nota/movimenti/<id>
# Modifica data, importo, descrizione di un movimento (non giroconti).
# Body: {data, importo, descrizione}
# ─────────────────────────────────────────────────────────────────
@bp.route('/api/prima-nota/movimenti/<int:mov_id>', methods=['PUT'])
@login_required
def aggiorna_movimento(mov_id):
    db = get_db()
    mov = db.execute('SELECT * FROM movimenti_studio WHERE id=?', (mov_id,)).fetchone()
    if not mov:
        db.close()
        return jsonify({'error': 'Movimento non trovato'}), 404
    if mov['tipo'] == 'giroconto':
        db.close()
        return jsonify({'error': 'Modifica diretta di giroconti non supportata'}), 400

    d = request.get_json() or {}
    nuova_data       = d.get('data', mov['data'])
    nuovo_importo    = float(d.get('importo', mov['importo']))
    nuova_descr      = d.get('descrizione', mov['descrizione'] or '')

    db.execute(
        'UPDATE movimenti_studio SET data=?, importo=?, descrizione=? WHERE id=?',
        (nuova_data, nuovo_importo, nuova_descr, mov_id)
    )
    # Sincronizza pagamento collegato (entrata cliente)
    if mov['tipo'] == 'entrata' and mov['macrogruppo_id'] == 'clienti':
        db.execute(
            'UPDATE pagamenti SET importo=?, data_pagamento=? WHERE movimenti_studio_id=?',
            (nuovo_importo, nuova_data, mov_id)
        )
    db.commit()
    db.close()
    return jsonify({'ok': True})


# ─────────────────────────────────────────────────────────────────
# GET /api/prima-nota/mesi-disponibili
# Lista year-month con movimenti (per il modal esporta)
# ─────────────────────────────────────────────────────────────────
@bp.route('/api/prima-nota/mesi-disponibili')
@login_required
def get_mesi_disponibili():
    db = get_db()
    rows = db.execute(
        "SELECT strftime('%Y-%m', data) AS mese, COUNT(*) AS n_mov "
        "FROM movimenti_studio GROUP BY mese ORDER BY mese DESC"
    ).fetchall()
    db.close()
    return jsonify([dict(r) for r in rows])


# ─────────────────────────────────────────────────────────────────
# POST /api/prima-nota/esporta/pdf
# Genera un PDF riepilogativo per i mesi selezionati.
# Body: {mesi: ['2026-01', '2026-03', ...]}
# ─────────────────────────────────────────────────────────────────
@bp.route('/api/prima-nota/esporta/pdf', methods=['POST'])
@login_required
def esporta_pdf():
    db = get_db()
    d = request.get_json() or {}
    mesi = d.get('mesi', [])
    if not mesi:
        db.close()
        return jsonify({'error': 'Seleziona almeno un mese'}), 400

    placeholders = ','.join('?' * len(mesi))
    rows = db.execute(f"""
        SELECT m.*,
               CASE WHEN m.tipo='entrata' AND m.macrogruppo_id='clienti'
                    THEN dz.ragione_sociale ELSE m.sottovoce_nome END AS nome_display,
               CASE WHEN mf.movimento_id IS NOT NULL THEN 1 ELSE 0 END AS fatturato
        FROM movimenti_studio m
        LEFT JOIN ditte dz ON (m.macrogruppo_id='clienti'
                               AND m.sottovoce_id = CAST(dz.id AS TEXT))
        LEFT JOIN movimenti_fatturati mf ON mf.movimento_id = m.id
        WHERE strftime('%Y-%m', m.data) IN ({placeholders})
        ORDER BY m.data ASC, m.id ASC
    """, mesi).fetchall()
    db.close()

    buf = _genera_pdf_riepilogo([dict(r) for r in rows], sorted(mesi))
    nome = f"Riepilogo_PrimaNota_{date.today()}.pdf"
    return send_file(buf, mimetype='application/pdf',
                     as_attachment=True, download_name=nome)


def _genera_pdf_riepilogo(movimenti, mesi):
    """Genera PDF riepilogo mensile della prima nota."""
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.units import cm
        from reportlab.lib import colors
        from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer,
                                        Table, TableStyle, HRFlowable)
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    except ImportError:
        raise RuntimeError('reportlab non installato')

    MESI_ITA = {
        '01': 'Gennaio', '02': 'Febbraio', '03': 'Marzo', '04': 'Aprile',
        '05': 'Maggio',  '06': 'Giugno',   '07': 'Luglio', '08': 'Agosto',
        '09': 'Settembre','10': 'Ottobre', '11': 'Novembre','12': 'Dicembre',
    }

    def _fmt_eur(v):
        s = f"{abs(float(v)):,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
        return f"€ {s}"

    def _fmt_data(s):
        if not s:
            return '—'
        return '/'.join(reversed(s.split('-')))

    C_HDR  = colors.HexColor('#1e293b')
    C_ENT  = colors.HexColor('#166534')
    C_USC  = colors.HexColor('#991b1b')
    C_GIR  = colors.HexColor('#5b21b6')
    C_GRAY = colors.HexColor('#64748b')
    C_SURF = colors.HexColor('#f8fafc')
    C_BRD  = colors.HexColor('#e2e8f0')

    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                             leftMargin=2*cm, rightMargin=2*cm,
                             topMargin=2.5*cm, bottomMargin=2.5*cm)

    TITLE  = ParagraphStyle('T', fontSize=16, leading=20, fontName='Helvetica-Bold', spaceAfter=2)
    SUB    = ParagraphStyle('S', fontSize=10, leading=14, fontName='Helvetica',
                             textColor=C_GRAY, spaceAfter=12)
    H2     = ParagraphStyle('H2', fontSize=12, leading=16, fontName='Helvetica-Bold',
                             textColor=C_HDR, spaceBefore=14, spaceAfter=6)
    NORM   = ParagraphStyle('N', fontSize=9, leading=13)
    SMALL  = ParagraphStyle('SM', fontSize=8, leading=12, textColor=C_GRAY)
    FOOT   = ParagraphStyle('F', fontSize=7.5, leading=11, textColor=C_GRAY)

    def _mese_label(ym):
        y, m = ym.split('-')
        return f"{MESI_ITA.get(m, m)} {y}"

    story = []
    oggi_fmt = date.today().strftime('%d/%m/%Y')

    # ── Intestazione ──────────────────────────────────────────────
    periodo = ' · '.join(_mese_label(m) for m in mesi)
    story.append(Paragraph('RIEPILOGO PRIMA NOTA STUDIO', TITLE))
    story.append(Paragraph(f'Periodo: {periodo}   —   Generato il {oggi_fmt}', SUB))

    # Raggruppa movimenti per mese
    from collections import defaultdict
    per_mese = defaultdict(list)
    for mv in movimenti:
        ym = mv['data'][:7] if mv['data'] else '????-??'
        per_mese[ym].append(mv)

    tot_entrate_periodo = 0.0
    tot_uscite_periodo  = 0.0

    for ym in mesi:
        mvs = per_mese.get(ym, [])
        story.append(HRFlowable(width='100%', thickness=0.5, color=C_BRD,
                                spaceBefore=8, spaceAfter=4))
        story.append(Paragraph(_mese_label(ym), H2))

        if not mvs:
            story.append(Paragraph('Nessun movimento in questo mese.', SMALL))
            continue

        # Separa entrate/uscite/giroconti
        entrate   = [m for m in mvs if m['tipo'] == 'entrata']
        uscite    = [m for m in mvs if m['tipo'] == 'uscita']
        giroconti = [m for m in mvs if m['tipo'] == 'giroconto']

        tot_e = sum(float(m['importo']) for m in entrate)
        tot_u = sum(float(m['importo']) for m in uscite)
        tot_entrate_periodo += tot_e
        tot_uscite_periodo  += tot_u

        col_w = [2*cm, 4.5*cm, 3.5*cm, 2.5*cm, 2.5*cm]

        def _build_section(rows_data, color, label):
            if not rows_data:
                return
            story.append(Paragraph(f'<font color="{color.hexval()}"><b>{label}</b></font>', NORM))
            tbl_data = [['Data', 'Soggetto / Categoria', 'Note', 'Conto', 'Importo']]
            for mv in rows_data:
                nome = mv.get('nome_display') or mv.get('macrogruppo_nome') or '—'
                conto = mv.get('tipologia', '') or '—'
                if conto.startswith('banca_'):
                    conto = 'Banca'
                elif conto == 'cassa':
                    conto = 'Cassa'
                tbl_data.append([
                    _fmt_data(mv.get('data', '')),
                    nome[:35],
                    (mv.get('descrizione') or '')[:28],
                    conto,
                    _fmt_eur(mv.get('importo', 0)),
                ])
            t = Table(tbl_data, colWidths=col_w, repeatRows=1)
            t.setStyle(TableStyle([
                ('BACKGROUND',    (0, 0), (-1, 0),  C_HDR),
                ('TEXTCOLOR',     (0, 0), (-1, 0),  colors.white),
                ('FONTNAME',      (0, 0), (-1, 0),  'Helvetica-Bold'),
                ('FONTSIZE',      (0, 0), (-1, 0),  8),
                ('FONTSIZE',      (0, 1), (-1, -1),  8),
                ('ROWBACKGROUNDS',(0, 1), (-1, -1), [colors.white, C_SURF]),
                ('ALIGN',         (4, 0), (4, -1),  'RIGHT'),
                ('GRID',          (0, 0), (-1, -1),  0.25, C_BRD),
                ('TOPPADDING',    (0, 0), (-1, -1),  3),
                ('BOTTOMPADDING', (0, 0), (-1, -1),  3),
                ('LEFTPADDING',   (0, 0), (-1, -1),  5),
            ]))
            story.append(t)
            story.append(Spacer(1, 0.3*cm))

        _build_section(entrate,   C_ENT, f'Entrate  ({len(entrate)} movimenti)')
        _build_section(uscite,    C_USC, f'Uscite  ({len(uscite)} movimenti)')
        _build_section(giroconti, C_GIR, f'Giroconti  ({len(giroconti)} movimenti)')

        # Riepilogo mese
        saldo = tot_e - tot_u
        saldo_col = C_ENT if saldo >= 0 else C_USC
        riepilogo = [
            ['', 'Totale entrate', _fmt_eur(tot_e)],
            ['', 'Totale uscite',  _fmt_eur(tot_u)],
            ['', 'Saldo mese',     _fmt_eur(saldo)],
        ]
        rt = Table(riepilogo, colWidths=[9*cm, 4*cm, 2*cm])
        rt.setStyle(TableStyle([
            ('ALIGN',   (2, 0), (2, -1), 'RIGHT'),
            ('FONTNAME',(1, 0), (1, -1), 'Helvetica'),
            ('FONTNAME',(1, 2), (1, 2),  'Helvetica-Bold'),
            ('FONTSIZE',(0, 0), (-1, -1), 8),
            ('TEXTCOLOR',(2, 0),(2, 0),   C_ENT),
            ('TEXTCOLOR',(2, 1),(2, 1),   C_USC),
            ('TEXTCOLOR',(2, 2),(2, 2),   saldo_col),
            ('FONTNAME', (2, 2),(2, 2),   'Helvetica-Bold'),
            ('TOPPADDING',(0,0),(-1,-1),  2),
            ('BOTTOMPADDING',(0,0),(-1,-1),2),
        ]))
        story.append(rt)

    # ── Riepilogo finale periodo ───────────────────────────────────
    story.append(HRFlowable(width='100%', thickness=1, color=C_HDR,
                             spaceBefore=14, spaceAfter=6))
    saldo_periodo = tot_entrate_periodo - tot_uscite_periodo
    sc = C_ENT if saldo_periodo >= 0 else C_USC
    sommario = [
        ['TOTALE ENTRATE PERIODO',  _fmt_eur(tot_entrate_periodo)],
        ['TOTALE USCITE PERIODO',   _fmt_eur(tot_uscite_periodo)],
        ['SALDO NETTO PERIODO',     _fmt_eur(saldo_periodo)],
    ]
    st = Table(sommario, colWidths=[12.5*cm, 3*cm])
    st.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1),  C_HDR),
        ('TEXTCOLOR',  (0, 0), (-1, -1),  colors.white),
        ('FONTNAME',   (0, 0), (-1, -1),  'Helvetica-Bold'),
        ('FONTSIZE',   (0, 0), (-1, -1),  9),
        ('ALIGN',      (1, 0), (1, -1),   'RIGHT'),
        ('TEXTCOLOR',  (1, 0), (1, 0),    colors.HexColor('#86efac')),
        ('TEXTCOLOR',  (1, 1), (1, 1),    colors.HexColor('#fca5a5')),
        ('TEXTCOLOR',  (1, 2), (1, 2),    colors.HexColor('#fde047') if saldo_periodo < 0 else colors.HexColor('#86efac')),
        ('TOPPADDING', (0, 0), (-1, -1),  5),
        ('BOTTOMPADDING',(0,0),(-1,-1),   5),
        ('LEFTPADDING',(0, 0), (-1, -1),  8),
    ]))
    story.append(st)
    story.append(Spacer(1, 0.6*cm))
    story.append(Paragraph(
        f'Documento generato il {oggi_fmt} — Prima Nota Studio · Wolware',
        FOOT
    ))

    doc.build(story)
    buf.seek(0)
    return buf
