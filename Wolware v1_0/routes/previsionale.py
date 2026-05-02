import json
from flask import Blueprint, jsonify
from database import get_db
from auth.routes import login_required

bp = Blueprint('previsionale_bp', __name__)

NOMI_MESI = ['Gen','Feb','Mar','Apr','Mag','Giu',
             'Lug','Ago','Set','Ott','Nov','Dic']


@bp.route('/api/ditte/<int:ditta_id>/previsionale/<int:anno>', methods=['GET'])
@login_required
def get_previsionale(ditta_id, anno):
    """
    Ritorna, per ogni mese dell'anno, il totale previsto (da tariffario)
    e l'effettivo (da pratiche registrate).
    Logica:
    - Costi Fissi Mensili  → applicati in TUTTI i 12 mesi
    - Costi Fissi Annuali  → applicati solo nei mesi definiti in mesi_json
    - Variabili            → esclusi dal previsionale (imprevedibili)
    - A Richiesta          → esclusi dal previsionale
    """
    db = get_db()
    try:
        ditta = db.execute('SELECT * FROM ditte WHERE id=?', (ditta_id,)).fetchone()
        if not ditta:
            return jsonify({'error': 'Cliente non trovato'}), 404

        voci = db.execute(
            '''SELECT dv.*, mg.tipo as mg_tipo
               FROM ditta_voci dv
               LEFT JOIN macrogruppi mg ON mg.id = dv.macrogruppo_id
               WHERE dv.ditta_id=?''',
            (ditta_id,)
        ).fetchall()

        # Calcola previsto per mese
        previsto = {m: 0.0 for m in range(1, 13)}
        for v in voci:
            tipo = v['mg_tipo'] or v.get('tipo') or ''
            if tipo in ('costi_fissi_mensili', 'fissi_mensili'):
                # Applicato ogni mese
                for m in range(1, 13):
                    previsto[m] += float(v['prezzo'] or 0)
            elif tipo in ('costi_fissi_annuali', 'fissi_annuali'):
                # Solo nei mesi indicati in mesi_json
                try:
                    mesi_abilitati = json.loads(v['mesi_json'] or '[]')
                except Exception:
                    mesi_abilitati = []
                for m in mesi_abilitati:
                    if 1 <= m <= 12:
                        previsto[m] += float(v['prezzo'] or 0)
            # variabili e richiesta → skip

        # Calcola effettivo per mese (da pratiche salvate)
        pratiche = db.execute(
            'SELECT mese, SUM(importo) as tot FROM pratiche WHERE ditta_id=? AND anno=? GROUP BY mese',
            (ditta_id, anno)
        ).fetchall()
        effettivo = {m: 0.0 for m in range(1, 13)}
        for p in pratiche:
            effettivo[p['mese']] = float(p['tot'] or 0)

        # Costruisce risposta
        risultato = []
        for m in range(1, 13):
            prev = round(previsto[m], 2)
            eff  = round(effettivo[m], 2)
            risultato.append({
                'mese':        m,
                'mese_label':  NOMI_MESI[m - 1],
                'previsto':    prev,
                'effettivo':   eff,
                'differenza':  round(eff - prev, 2),
            })

        totale_previsto  = round(sum(r['previsto']  for r in risultato), 2)
        totale_effettivo = round(sum(r['effettivo'] for r in risultato), 2)

        return jsonify({
            'ditta_id':         ditta_id,
            'anno':             anno,
            'tariffario_nome':  ditta['tariffario_nome'],
            'cadenza':          ditta['cadenza_pagamenti'] or 'libero',
            'mesi':             risultato,
            'totale_previsto':  totale_previsto,
            'totale_effettivo': totale_effettivo,
            'differenza_tot':   round(totale_effettivo - totale_previsto, 2),
        })
    finally:
        db.close()