# routes/rendiconto.py
# Blueprint Rendiconto Studio — Volume 4
# Aggrega pagamenti, movimenti studio, giroconti per anno/mese.

from flask import Blueprint, jsonify, request, session
from database import get_db
from functools import wraps

bp = Blueprint('rendiconto', __name__)


def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Non autenticato'}), 401
        return f(*args, **kwargs)
    return decorated


# ─────────────────────────────────────────────────────────────────
# GET /api/rendiconto/saldi
# Stessa logica di Prima Nota: saldo Cassa + ogni Banca configurata
# Indipendente dal filtro anno (saldo "alla data odierna")
# ─────────────────────────────────────────────────────────────────
@bp.get('/api/rendiconto/saldi')
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
# GET /api/rendiconto/riepilogo?anno=XXXX
# Restituisce tot_entrate, tot_uscite, differenza per l'anno.
# Entrate = pagamenti clienti + movimenti_studio tipo='entrata'
# Uscite  = movimenti_studio tipo='uscita'
# Giroconti esclusi (movimenti interni compensati)
# ─────────────────────────────────────────────────────────────────
@bp.get('/api/rendiconto/riepilogo')
@login_required
def get_riepilogo():
    anno = request.args.get('anno', '')
    db = get_db()

    if anno:
        # Pagamenti clienti per l'anno
        pag = db.execute(
            "SELECT COALESCE(SUM(importo),0) FROM pagamenti WHERE anno=?", (anno,)
        ).fetchone()[0]

        # Altre entrate (movimenti_studio tipo='entrata') per l'anno
        altre_entrate = db.execute(
            "SELECT COALESCE(SUM(importo),0) FROM movimenti_studio WHERE tipo='entrata' AND strftime('%Y', data)=?",
            (str(anno),)
        ).fetchone()[0]

        # Uscite (movimenti_studio tipo='uscita') per l'anno
        uscite = db.execute(
            "SELECT COALESCE(SUM(importo),0) FROM movimenti_studio WHERE tipo='uscita' AND strftime('%Y', data)=?",
            (str(anno),)
        ).fetchone()[0]
    else:
        pag = db.execute("SELECT COALESCE(SUM(importo),0) FROM pagamenti").fetchone()[0]
        altre_entrate = db.execute(
            "SELECT COALESCE(SUM(importo),0) FROM movimenti_studio WHERE tipo='entrata'"
        ).fetchone()[0]
        uscite = db.execute(
            "SELECT COALESCE(SUM(importo),0) FROM movimenti_studio WHERE tipo='uscita'"
        ).fetchone()[0]

    tot_entrate = round(pag + altre_entrate, 2)
    tot_uscite = round(uscite, 2)
    differenza = round(tot_entrate - tot_uscite, 2)

    db.close()
    return jsonify({
        'tot_entrate': tot_entrate,
        'tot_uscite': tot_uscite,
        'differenza': differenza
    })
