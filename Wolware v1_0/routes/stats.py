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

def _residuo_anni_precedenti(conn, ditta_id: int, anno: int) -> float:
    """
    Calcola il totale non pagato dal cliente in tutti gli anni precedenti ad 'anno'.
    Somma anno per anno dal primo anno con dati fino ad anno-1,
    partendo dal residuo_iniziale manuale come saldo di apertura.
    """
    # Prendi il residuo_iniziale manuale come base di partenza
    d = conn.execute('SELECT residuo_iniziale FROM ditte WHERE id=?', (ditta_id,)).fetchone()
    base = round(float(d['residuo_iniziale'] or 0.0), 2) if d else 0.0

    # Trova il primo anno con dati (pratiche o pagamenti)
    row = conn.execute(
        '''SELECT MIN(anno) FROM (
            SELECT anno FROM pratiche WHERE ditta_id=?
            UNION
            SELECT anno FROM pagamenti WHERE ditta_id=?
        )''', (ditta_id, ditta_id)
    ).fetchone()
    primo_anno = row[0] if row and row[0] else anno

    # Somma i residui anno per anno fino ad anno-1
    totale = base
    for a in range(primo_anno, anno):
        r = _riepilogo_ditta(conn, ditta_id, a, residuo_iniziale_override=0.0)
        totale += r['dovuto'] - r['pagato'] - r['abbuoni'] + r['addebiti']

    return round(totale, 2)

# ═══════════════════════════════════════════════════════════════════════════════
# HELPER — calcola il riepilogo finanziario completo di una ditta per un anno
# ═══════════════════════════════════════════════════════════════════════════════
def _residuo_anni_precedenti(conn, ditta_id: int, anno: int) -> float:
    """
    Calcola il totale non pagato dal cliente in tutti gli anni precedenti ad 'anno'.
    Somma anno per anno dal primo anno con dati fino ad anno-1,
    partendo dal residuo_iniziale manuale come saldo di apertura.
    """
    d = conn.execute('SELECT residuo_iniziale FROM ditte WHERE id=?', (ditta_id,)).fetchone()
    base = round(float(d['residuo_iniziale'] or 0.0), 2) if d else 0.0

    row = conn.execute(
        '''SELECT MIN(anno) FROM (
            SELECT anno FROM pratiche WHERE ditta_id=?
            UNION
            SELECT anno FROM pagamenti WHERE ditta_id=?
        )''', (ditta_id, ditta_id)
    ).fetchone()
    primo_anno = row[0] if row and row[0] else anno

    totale = base
    for a in range(primo_anno, anno):
        r = _riepilogo_ditta(conn, ditta_id, a, residuo_iniziale_override=0.0)
        totale += r['dovuto'] - r['pagato'] - r['abbuoni'] + r['addebiti']

    return round(totale, 2)


def _riepilogo_ditta(conn, ditta_id: int, anno: int, residuo_iniziale_override: float = None) -> dict:
    """
    Calcola per (ditta_id, anno):
      - dovuto      = somma importi pratiche dell'anno + IVA 22% su non-esenti
      - pagato      = somma pagamenti dell'anno
      - abbuoni     = somma arrotondamenti tipo 'abbuono'
      - addebiti    = somma arrotondamenti tipo 'addebito'
      - residuo     = dovuto - pagato - abbuoni + addebiti + residuo_anni_precedenti
    Il residuo_anni_precedenti è calcolato dinamicamente sommando i residui di tutti gli anni precedenti.
    """

    # Dovuto: somma importi pratiche dell'anno + IVA 22% per le non esenti
    row_imponibile = conn.execute(
        '''SELECT COALESCE(SUM(importo), 0.0) FROM pratiche
           WHERE ditta_id=? AND anno=? AND (esente_iva IS NULL OR esente_iva=0)''',
        (ditta_id, anno)
    ).fetchone()
    imponibile = round(float(row_imponibile[0]), 2)

    row_esente = conn.execute(
        '''SELECT COALESCE(SUM(importo), 0.0) FROM pratiche
           WHERE ditta_id=? AND anno=? AND esente_iva=1''',
        (ditta_id, anno)
    ).fetchone()
    esente = round(float(row_esente[0]), 2)

    iva = round(imponibile * 0.22, 2)
    dovuto = round(imponibile + esente + iva, 2)

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

    # Residuo anni precedenti — usa override se passato (evita loop ricorsivo), altrimenti calcola dinamicamente
    if residuo_iniziale_override is not None:
        residuo_anni_prec = round(float(residuo_iniziale_override), 2)
    else:
        residuo_anni_prec = _residuo_anni_precedenti(conn, ditta_id, anno)

    # Residuo = dovuto + addebiti - pagato - abbuoni + residuo_anni_precedenti
    residuo = round(dovuto + addebiti - pagato - abbuoni + residuo_anni_prec, 2)

    return {
        'anno':                    anno,
        'imponibile':              imponibile,
        'esente':                  esente,
        'iva':                     iva,
        'dovuto':                  dovuto,
        'pagato':                  pagato,
        'abbuoni':                 abbuoni,
        'addebiti':                addebiti,
        'residuo_iniziale':        residuo_anni_prec,  # mantenuto per compatibilità frontend
        'residuo_anni_precedenti': residuo_anni_prec,  # nuovo campo esplicito
        'residuo':                 residuo,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# GET /api/stats — statistiche globali per la dashboard
# ═══════════════════════════════════════════════════════════════════════════════
@stats_bp.route('/api/stats', methods=['GET'])
@login_required
def get_stats():
    conn = get_db()
    try:
        n_ditte     = conn.execute("SELECT COUNT(*) FROM ditte WHERE archiviato=0").fetchone()[0]
        n_archiviati = conn.execute("SELECT COUNT(*) FROM ditte WHERE archiviato=1").fetchone()[0]
        n_totali    = conn.execute("SELECT COUNT(*) FROM pratiche").fetchone()[0]
        n_aperte    = conn.execute("SELECT COUNT(*) FROM pratiche WHERE data_esecuzione IS NULL").fetchone()[0]
        n_chiuse    = conn.execute("SELECT COUNT(*) FROM pratiche WHERE data_esecuzione IS NOT NULL").fetchone()[0]

        return jsonify({
            'ditte':      n_ditte,
            'archiviati': n_archiviati,
            'pratiche': {
                'totali': n_totali,
                'aperte': n_aperte,
                'chiuse': n_chiuse,
            },
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
                "SELECT COALESCE(SUM(importo), 0.0) FROM pagamenti WHERE ditta_id=? AND anno=? AND CAST(strftime('%m', data) AS INTEGER)=?",
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
     
