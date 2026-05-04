# routes/rendiconto.py
# Blueprint Rendiconto Studio — Volume 4
# Aggrega pagamenti, movimenti studio, giroconti per anno/mese.

from flask import Blueprint, jsonify, request, session
from database import get_db
from functools import wraps
from datetime import date

bp = Blueprint('rendiconto', __name__)


def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Non autenticato'}), 401
        return f(*args, **kwargs)
    return decorated


def _gestione_attiva(ditta: dict, anno: int, tipo: str) -> bool:
    """True se la gestione (paghe/contabilita) era attiva durante l'anno."""
    inizio = ditta.get(f'inizio_{tipo}')
    fine   = ditta.get(f'fine_{tipo}')
    if not inizio:
        return False
    try:
        if anno < int(str(inizio)[:4]):
            return False
        if fine and anno > int(str(fine)[:4]):
            return False
    except Exception:
        pass
    return True


def _calcola_residuo(db, ditta_id: int, anno: str) -> float:
    """Residuo cumulativo di un cliente calcolato su tutto lo storico."""
    row = db.execute('SELECT residuo_iniziale FROM ditte WHERE id=?', (ditta_id,)).fetchone()
    res_ini = row['residuo_iniziale'] if row else 0.0

    dovuto  = db.execute('SELECT COALESCE(SUM(importo),0) FROM pratiche WHERE ditta_id=?', (ditta_id,)).fetchone()[0]
    pagato  = db.execute('SELECT COALESCE(SUM(importo),0) FROM pagamenti WHERE ditta_id=?', (ditta_id,)).fetchone()[0]
    abbuoni = db.execute("SELECT COALESCE(SUM(importo),0) FROM arrotondamenti WHERE ditta_id=? AND tipo='abbuono'", (ditta_id,)).fetchone()[0]
    addebiti= db.execute("SELECT COALESCE(SUM(importo),0) FROM arrotondamenti WHERE ditta_id=? AND tipo='addebito'", (ditta_id,)).fetchone()[0]

    return round(res_ini + dovuto - pagato - abbuoni + addebiti, 2)


# ─────────────────────────────────────────────────────────────────
# GET /api/rendiconto/saldi
# ─────────────────────────────────────────────────────────────────
@bp.get('/api/rendiconto/saldi')
@login_required
def get_saldi():
    db = get_db()
    saldi = []

    cassa_in      = db.execute("SELECT COALESCE(SUM(importo),0) FROM movimenti_studio WHERE tipologia='cassa' AND tipo='entrata'").fetchone()[0]
    cassa_out     = db.execute("SELECT COALESCE(SUM(importo),0) FROM movimenti_studio WHERE tipologia='cassa' AND tipo='uscita'").fetchone()[0]
    cassa_giro_in = db.execute("SELECT COALESCE(SUM(importo),0) FROM movimenti_studio WHERE tipologia='cassa' AND tipo='giroconto' AND giroconto_dir='entrata'").fetchone()[0]
    cassa_giro_out= db.execute("SELECT COALESCE(SUM(importo),0) FROM movimenti_studio WHERE tipologia='cassa' AND tipo='giroconto' AND giroconto_dir='uscita'").fetchone()[0]

    cassa_saldo_iniziale = 0.0
    try:
        row = db.execute("SELECT valore FROM impostazioni WHERE chiave='saldo_iniziale_cassa'").fetchone()
        if row:
            cassa_saldo_iniziale = float(row['valore'])
    except Exception:
        pass

    saldi.append({'id': 'cassa', 'nome': 'Cassa',
                  'saldo': round(cassa_saldo_iniziale + cassa_in - cassa_out + cassa_giro_in - cassa_giro_out, 2)})

    for banca in db.execute('SELECT * FROM banche_studio ORDER BY ordine, nome').fetchall():
        tid = f"banca_{banca['id']}"
        b_in      = db.execute("SELECT COALESCE(SUM(importo),0) FROM movimenti_studio WHERE tipologia=? AND tipo='entrata'", (tid,)).fetchone()[0]
        b_out     = db.execute("SELECT COALESCE(SUM(importo),0) FROM movimenti_studio WHERE tipologia=? AND tipo='uscita'", (tid,)).fetchone()[0]
        b_giro_in = db.execute("SELECT COALESCE(SUM(importo),0) FROM movimenti_studio WHERE tipologia=? AND tipo='giroconto' AND giroconto_dir='entrata'", (tid,)).fetchone()[0]
        b_giro_out= db.execute("SELECT COALESCE(SUM(importo),0) FROM movimenti_studio WHERE tipologia=? AND tipo='giroconto' AND giroconto_dir='uscita'", (tid,)).fetchone()[0]
        saldi.append({'id': tid, 'nome': banca['nome'],
                      'saldo': round(banca['saldo_iniziale'] + b_in - b_out + b_giro_in - b_giro_out, 2)})

    db.close()
    return jsonify(saldi)


# ─────────────────────────────────────────────────────────────────
# GET /api/rendiconto/riepilogo?anno=XXXX
# ─────────────────────────────────────────────────────────────────
@bp.get('/api/rendiconto/riepilogo')
@login_required
def get_riepilogo():
    anno = request.args.get('anno', '')
    db   = get_db()

    if anno:
        pag          = db.execute("SELECT COALESCE(SUM(importo),0) FROM pagamenti WHERE anno=?", (anno,)).fetchone()[0]
        altre_entrate= db.execute("SELECT COALESCE(SUM(importo),0) FROM movimenti_studio WHERE tipo='entrata' AND strftime('%Y',data)=?", (anno,)).fetchone()[0]
        uscite       = db.execute("SELECT COALESCE(SUM(importo),0) FROM movimenti_studio WHERE tipo='uscita'  AND strftime('%Y',data)=?", (anno,)).fetchone()[0]
    else:
        pag          = db.execute("SELECT COALESCE(SUM(importo),0) FROM pagamenti").fetchone()[0]
        altre_entrate= db.execute("SELECT COALESCE(SUM(importo),0) FROM movimenti_studio WHERE tipo='entrata'").fetchone()[0]
        uscite       = db.execute("SELECT COALESCE(SUM(importo),0) FROM movimenti_studio WHERE tipo='uscita'").fetchone()[0]

    tot_e = round(pag + altre_entrate, 2)
    tot_u = round(uscite, 2)
    db.close()
    return jsonify({'tot_entrate': tot_e, 'tot_uscite': tot_u, 'differenza': round(tot_e - tot_u, 2)})


# ─────────────────────────────────────────────────────────────────
# GET /api/rendiconto/entrate?anno=XXXX&mostra_archiviati=0
# Sezioni clienti (per categoria) + macrogruppi liberi, per mese
# ─────────────────────────────────────────────────────────────────
@bp.get('/api/rendiconto/entrate')
@login_required
def get_entrate():
    anno             = request.args.get('anno', str(date.today().year))
    mostra_archiviati= request.args.get('mostra_archiviati', '0') == '1'
    db               = get_db()
    anno_str         = str(anno)

    # ── Pagamenti mensili per cliente ────────────────────────────
    pag_rows = db.execute(
        '''SELECT ditta_id, CAST(strftime('%m', data) AS INTEGER) AS mese, SUM(importo) AS tot
           FROM pagamenti WHERE anno=?
           GROUP BY ditta_id, mese''', (anno_str,)
    ).fetchall()
    pag_by_ditta = {}
    for r in pag_rows:
        pag_by_ditta.setdefault(r['ditta_id'], {})[r['mese']] = r['tot']

    # ── Clienti ──────────────────────────────────────────────────
    arch_sql = '' if mostra_archiviati else 'AND (d.archiviato IS NULL OR d.archiviato=0)'
    ditte = db.execute(
        f'''SELECT id, ragione_sociale, residuo_iniziale,
                   inizio_paghe, fine_paghe, inizio_contabilita, fine_contabilita
            FROM ditte d WHERE 1=1 {arch_sql}
            ORDER BY ragione_sociale'''
    ).fetchall()

    sezioni = {
        'paghe':      {'nome': 'CLIENTI PAGHE',               'colore': 'paghe',      'clienti': []},
        'cont':       {'nome': 'CLIENTI CONTABILITÀ',          'colore': 'cont',       'clienti': []},
        'paghe_cont': {'nome': 'CLIENTI PAGHE + CONTABILITÀ',  'colore': 'paghe_cont', 'clienti': []},
        'altro':      {'nome': 'CLIENTI (ALTRO)',               'colore': 'altro',      'clienti': []},
    }

    for d in ditte:
        d = dict(d)
        mesi_map = pag_by_ditta.get(d['id'], {})
        mesi     = [round(mesi_map.get(m, 0.0), 2) for m in range(1, 13)]
        tot_pag  = round(sum(mesi), 2)
        residuo  = _calcola_residuo(db, d['id'], anno_str)

        if tot_pag == 0 and residuo == 0:
            continue

        ha_p = _gestione_attiva(d, int(anno_str), 'paghe')
        ha_c = _gestione_attiva(d, int(anno_str), 'contabilita')

        entry = {'id': d['id'], 'nome': d['ragione_sociale'],
                 'mesi': mesi, 'tot_pagato': tot_pag, 'residuo': residuo}

        if ha_p and ha_c:
            sezioni['paghe_cont']['clienti'].append(entry)
        elif ha_p:
            sezioni['paghe']['clienti'].append(entry)
        elif ha_c:
            sezioni['cont']['clienti'].append(entry)
        else:
            sezioni['altro']['clienti'].append(entry)

    result_sezioni = []
    for key, sez in sezioni.items():
        if not sez['clienti']:
            continue
        sub_mesi = [round(sum(c['mesi'][i] for c in sez['clienti']), 2) for i in range(12)]
        result_sezioni.append({
            'id': key, 'nome': sez['nome'], 'colore': sez['colore'],
            'clienti': sez['clienti'],
            'subtotali_mesi': sub_mesi,
            'subtotale': round(sum(sub_mesi), 2),
            'subtotale_residui': round(sum(c['residuo'] for c in sez['clienti']), 2),
        })

    # ── Macrogruppi entrate liberi (movimenti_studio, non-clienti) ─
    ms_rows = db.execute(
        '''SELECT macrogruppo_id, macrogruppo_nome, sottovoce_id, sottovoce_nome,
                  CAST(strftime('%m', data) AS INTEGER) AS mese, SUM(importo) AS tot
           FROM movimenti_studio
           WHERE tipo='entrata' AND strftime('%Y', data)=?
             AND (macrogruppo_id IS NULL OR macrogruppo_id != 'clienti')
           GROUP BY macrogruppo_id, sottovoce_id, mese
           ORDER BY macrogruppo_nome, sottovoce_nome, mese''', (anno_str,)
    ).fetchall()

    mg_map = {}
    for r in ms_rows:
        mgid   = r['macrogruppo_id'] or '__altro__'
        mgnome = r['macrogruppo_nome'] or 'Altre entrate'
        svid   = r['sottovoce_id']   or '__sv__'
        svnome = r['sottovoce_nome'] or '—'
        mg_map.setdefault(mgid, {'id': mgid, 'nome': mgnome, 'sottovoci': {}})
        mg_map[mgid]['sottovoci'].setdefault(svid, {'id': svid, 'nome': svnome, 'mesi': [0.0]*12})
        mg_map[mgid]['sottovoci'][svid]['mesi'][r['mese'] - 1] = round(r['tot'], 2)

    result_mg = []
    for mg in mg_map.values():
        sottovoci = list(mg['sottovoci'].values())
        for sv in sottovoci:
            sv['totale'] = round(sum(sv['mesi']), 2)
        sub_mesi = [round(sum(sv['mesi'][i] for sv in sottovoci), 2) for i in range(12)]
        result_mg.append({'id': mg['id'], 'nome': mg['nome'],
                          'sottovoci': sottovoci,
                          'subtotali_mesi': sub_mesi,
                          'subtotale': round(sum(sub_mesi), 2)})

    # ── Totali generali ──────────────────────────────────────────
    totali_mesi = [0.0] * 12
    for s in result_sezioni:
        for i in range(12): totali_mesi[i] += s['subtotali_mesi'][i]
    for m in result_mg:
        for i in range(12): totali_mesi[i] += m['subtotali_mesi'][i]
    totali_mesi = [round(v, 2) for v in totali_mesi]

    db.close()
    return jsonify({
        'sezioni_clienti': result_sezioni,
        'macrogruppi':     result_mg,
        'totali_mesi':     totali_mesi,
        'totale_annuale':  round(sum(totali_mesi), 2),
        'totale_residui':  round(sum(s.get('subtotale_residui', 0) for s in result_sezioni), 2),
    })


# ─────────────────────────────────────────────────────────────────
# GET /api/rendiconto/uscite?anno=XXXX
# Gerarchia macrogruppo → sottovoce, distribuzione mensile
# ─────────────────────────────────────────────────────────────────
@bp.get('/api/rendiconto/uscite')
@login_required
def get_uscite():
    anno     = request.args.get('anno', str(date.today().year))
    anno_str = str(anno)
    db       = get_db()

    rows = db.execute(
        '''SELECT macrogruppo_id, macrogruppo_nome, sottovoce_id, sottovoce_nome,
                  CAST(strftime('%m', data) AS INTEGER) AS mese, SUM(importo) AS tot
           FROM movimenti_studio
           WHERE tipo='uscita' AND strftime('%Y', data)=?
           GROUP BY macrogruppo_id, sottovoce_id, mese
           ORDER BY macrogruppo_nome, sottovoce_nome, mese''', (anno_str,)
    ).fetchall()

    mg_map = {}
    for r in rows:
        mgid   = r['macrogruppo_id']   or '__altro__'
        mgnome = r['macrogruppo_nome'] or 'Altre uscite'
        svid   = r['sottovoce_id']     or '__sv__'
        svnome = r['sottovoce_nome']   or '—'
        mg_map.setdefault(mgid, {'id': mgid, 'nome': mgnome, 'sottovoci': {}})
        mg_map[mgid]['sottovoci'].setdefault(svid, {'id': svid, 'nome': svnome, 'mesi': [0.0]*12})
        mg_map[mgid]['sottovoci'][svid]['mesi'][r['mese'] - 1] = round(r['tot'], 2)

    macrogruppi = []
    totali_mesi = [0.0] * 12
    for mg in mg_map.values():
        sottovoci = list(mg['sottovoci'].values())
        for sv in sottovoci:
            sv['totale'] = round(sum(sv['mesi']), 2)
        sub_mesi = [round(sum(sv['mesi'][i] for sv in sottovoci), 2) for i in range(12)]
        for i in range(12): totali_mesi[i] += sub_mesi[i]
        macrogruppi.append({'id': mg['id'], 'nome': mg['nome'],
                            'sottovoci': sottovoci,
                            'subtotali_mesi': sub_mesi,
                            'subtotale': round(sum(sub_mesi), 2)})

    totali_mesi = [round(v, 2) for v in totali_mesi]
    db.close()
    return jsonify({
        'macrogruppi':    macrogruppi,
        'totali_mesi':    totali_mesi,
        'totale_annuale': round(sum(totali_mesi), 2),
    })
