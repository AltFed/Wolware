# routes/stats.py
# Blueprint 'stats' — API statistiche e riepilogo finanziario.
#
# GET /api/stats                              → statistiche globali dashboard
# GET /api/stats/ditta/<id>?anno=Y           → riepilogo finanziario di un cliente
# GET /api/stats/ditta/<id>/residuo          → residuo aggiornato (saldo a scalare)
# GET /api/stats/clienti-riepilogo?anno=Y    → tabella clienti con dovuto/pagato/residuo

from flask import Blueprint, request, jsonify
from database import get_db
from auth.decorators import login_required

stats_bp = Blueprint('stats', __name__)


# ═══════════════════════════════════════════════════════════════════════════════
# HELPER — calcola il riepilogo finanziario completo di una ditta per un anno
# ═══════════════════════════════════════════════════════════════════════════════
def _riepilogo_ditta(conn, ditta_id: int, anno: int) -> dict:
    """
    Calcola per (ditta_id, anno):
      - dovuto      = somma importi pratiche dell'anno
      - pagato      = somma pagamenti dell'anno
      - abbuoni     = somma arrotondamenti tipo 'abbuono'
      - addebiti    = somma arrotondamenti tipo 'addebito'
      - residuo     = dovuto - pagato - abbuoni + addebiti + residuo_iniziale
    Il residuo_iniziale è un campo manuale sulla ditta (saldo di partenza).
    """

    # Dovuto: somma importi pratiche dell'anno
    row = conn.execute(
        'SELECT COALESCE(SUM(importo), 0.0) FROM pratiche WHERE ditta_id=? AND anno=?',
        (ditta_id, anno)
    ).fetchone()
    dovuto = round(float(row[0]), 2)

    # Pagato: somma pagamenti dell'anno
    row = conn.execute(
        'SELECT COALESCE(SUM(importo), 0.0) FROM pagamenti WHERE ditta_id=? AND anno=?',
        (ditta_id, anno)
    ).fetchone()
    pagato = round(float(row[0]), 2)

    # Arrotondamenti dell'anno
    rows = conn.execute(
        'SELECT tipo, COALESCE(SUM(importo), 0.0) FROM arrotondamenti WHERE ditta_id=? AND strftime("%Y", data)=? GROUP BY tipo',
        (ditta_id, str(anno))
    ).fetchall()
    abbuoni  = 0.0
    addebiti = 0.0
    for r in rows:
        if r[0] == 'abbuono':
            abbuoni = round(float(r[1]), 2)
        elif r[0] == 'addebito':
            addebiti = round(float(r[1]), 2)

    # Residuo iniziale (campo manuale sulla ditta, anno-agnostico)
    d = conn.execute('SELECT residuo_iniziale FROM ditte WHERE id=?', (ditta_id,)).fetchone()
    residuo_iniziale = round(float(d['residuo_iniziale'] or 0.0), 2) if d else 0.0

    # Residuo = dovuto + addebiti - pagato - abbuoni + residuo_iniziale
    residuo = round(dovuto + addebiti - pagato - abbuoni + residuo_iniziale, 2)

    return {
        'anno':             anno,
        'dovuto':           dovuto,
        'pagato':           pagato,
        'abbuoni':          abbuoni,
        'addebiti':         addebiti,
        'residuo_iniziale': residuo_iniziale,
        'residuo':          residuo,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# GET /api/stats — statistiche globali per la dashboard
# ═══════════════════════════════════════════════════════════════════════════════
@stats_bp.route('/api/stats', methods=['GET'])
@login_required
def get_stats():
    conn = get_db()
    try:
        n_clienti  = conn.execute("SELECT COUNT(*) FROM ditte WHERE archiviato=0").fetchone()[0]
        n_archiviati = conn.execute("SELECT COUNT(*) FROM ditte WHERE archiviato=1").fetchone()[0]
        n_pratiche = conn.execute("SELECT COUNT(*) FROM pratiche").fetchone()[0]
        n_pagamenti = conn.execute("SELECT COUNT(*) FROM pagamenti").fetchone()[0]

        return jsonify({
            'clienti':    n_clienti,
            'archiviati': n_archiviati,
            'pratiche':   n_pratiche,
            'pagamenti':  n_pagamenti,
        })
    finally:
        conn.close()


# ═══════════════════════════════════════════════════════════════════════════════
# GET /api/stats/ditta/<id>?anno=Y — riepilogo finanziario completo di un cliente
# ═══════════════════════════════════════════════════════════════════════════════
@stats_bp.route('/api/stats/ditta/<int:ditta_id>', methods=['GET'])
@login_required
def stats_ditta(ditta_id):
    anno = request.args.get('anno', type=int)
    if not anno:
        return jsonify({'error': 'Parametro anno obbligatorio'}), 400

    conn = get_db()
    try:
        ditta = conn.execute('SELECT * FROM ditte WHERE id=?', (ditta_id,)).fetchone()
        if not ditta:
            return jsonify({'error': 'Cliente non trovato'}), 404

        riepilogo = _riepilogo_ditta(conn, ditta_id, anno)

        # Breakdown mensile — utile per grafici e tabella per mese
        mesi = []
        for mese in range(1, 13):
            row_d = conn.execute(
                'SELECT COALESCE(SUM(importo), 0.0) FROM pratiche WHERE ditta_id=? AND anno=? AND mese=?',
                (ditta_id, anno, mese)
            ).fetchone()
            row_p = conn.execute(
                'SELECT COALESCE(SUM(importo), 0.0) FROM pagamenti WHERE ditta_id=? AND anno=? AND mese(data)=?',
                (ditta_id, anno, mese)
            ).fetchone()
            mesi.append({
                'mese':   mese,
                'dovuto': round(float(row_d[0]), 2),
                'pagato': round(float(row_p[0]), 2),
            })

        return jsonify({
            **riepilogo,
            'ditta_id':       ditta_id,
            'ragione_sociale': ditta['ragione_sociale'],
            'mesi':            mesi,
        })
    finally:
        conn.close()


# ═══════════════════════════════════════════════════════════════════════════════
# GET /api/stats/ditta/<id>/residuo — solo il residuo aggiornato (saldo a scalare)
# Utile per aggiornamenti rapidi senza ricaricare tutto il riepilogo.
# ═══════════════════════════════════════════════════════════════════════════════
@stats_bp.route('/api/stats/ditta/<int:ditta_id>/residuo', methods=['GET'])
@login_required
def residuo_ditta(ditta_id):
    anno = request.args.get('anno', type=int)
    if not anno:
        return jsonify({'error': 'Parametro anno obbligatorio'}), 400

    conn = get_db()
    try:
        r = _riepilogo_ditta(conn, ditta_id, anno)
        return jsonify({
            'ditta_id': ditta_id,
            'anno':     anno,
            'residuo':  r['residuo'],
            'dovuto':   r['dovuto'],
            'pagato':   r['pagato'],
        })
    finally:
        conn.close()


# ═══════════════════════════════════════════════════════════════════════════════
# GET /api/stats/clienti-riepilogo?anno=Y
# Ritorna la lista di TUTTI i clienti attivi con dovuto/pagato/residuo.
# Questa è la query che alimenta la tabella Clienti con le colonne finanziarie.
# ═══════════════════════════════════════════════════════════════════════════════
@stats_bp.route('/api/stats/clienti-riepilogo', methods=['GET'])
@login_required
def clienti_riepilogo():
    anno = request.args.get('anno', type=int)
    if not anno:
        return jsonify({'error': 'Parametro anno obbligatorio'}), 400

    conn = get_db()
    try:
        ditte = conn.execute(
            'SELECT id, ragione_sociale, residuo_iniziale, tariffario_nome, cadenza_pagamenti FROM ditte WHERE archiviato=0 ORDER BY ragione_sociale COLLATE NOCASE'
        ).fetchall()

        risultati = []
        for d in ditte:
            r = _riepilogo_ditta(conn, d['id'], anno)
            risultati.append({
                'id':               d['id'],
                'ragione_sociale':  d['ragione_sociale'],
                'tariffario_nome':  d['tariffario_nome'],
                'cadenza_pagamenti': d['cadenza_pagamenti'],
                'dovuto':           r['dovuto'],
                'pagato':           r['pagato'],
                'abbuoni':          r['abbuoni'],
                'addebiti':         r['addebiti'],
                'residuo_iniziale': r['residuo_iniziale'],
                'residuo':          r['residuo'],
            })
            
        return jsonify(risultati), 200

    except Exception as e:
        return jsonify({'error': f'Errore nel recupero dei dati: {str(e)}'}), 500

    finally:
        # Assicura che la connessione al database venga chiusa in ogni caso
        if conn:
            conn.close()
     
