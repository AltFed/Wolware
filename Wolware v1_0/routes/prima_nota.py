# routes/prima_nota.py
# Blueprint per la Prima Nota Studio — Blocco 1
# Gestisce: saldi, movimenti, clienti da sollecitare, flag fatturato
# Blocchi 2/3/4 saranno aggiunti nei turni successivi.

from flask import Blueprint, jsonify, request, session
from database import get_db
from datetime import date, datetime, timedelta
from functools import wraps
import json

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
