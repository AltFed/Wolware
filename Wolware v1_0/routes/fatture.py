import json
import io
from datetime import date
from flask import Blueprint, request, jsonify, send_file
from database import get_db
from auth.routes import login_required

bp = Blueprint('fatture_bp', __name__)

IVA = 1.22  # Aliquota fissa 22%


# ─── Helper calcolo numero fattura ───────────────────────────────────────────

def _next_numero(db, anno, tipo):
    """Genera il numero progressivo per tipo/anno."""
    prefissi = {
        'ordinaria':   'FT',
        'proforma':    'PF',
        'nota_credito':'NC',
        'acconto':     'AC',
        'saldo':       'SL',
        'elettronica': 'FE',
    }
    pref = prefissi.get(tipo, 'XX')
    count = db.execute(
        'SELECT COUNT(*) FROM fatture WHERE anno=? AND tipo=?',
        (anno, tipo)
    ).fetchone()[0]
    return f'{pref}{anno}-{str(count + 1).zfill(4)}'


# ─── GET storico fatture cliente ─────────────────────────────────────────────

@bp.route('/api/ditte/<int:ditta_id>/fatture', methods=['GET'])
@login_required
def list_fatture(ditta_id):
    anno = request.args.get('anno', type=int)
    db = get_db()
    try:
        query = 'SELECT * FROM fatture WHERE ditta_id=?'
        params = [ditta_id]
        if anno:
            query += ' AND anno=?'
            params.append(anno)
        query += ' ORDER BY id DESC'
        rows = db.execute(query, params).fetchall()
        result = []
        for r in rows:
            d = dict(r)
            d['righe'] = json.loads(d.get('righe_json') or '[]')
            result.append(d)
        return jsonify(result)
    finally:
        db.close()


# ─── GET importa righe dalle pratiche del periodo ────────────────────────────

@bp.route('/api/ditte/<int:ditta_id>/fatture/importa-righe', methods=['GET'])
@login_required
def importa_righe(ditta_id):
    """
    Restituisce le pratiche del cliente nel periodo indicato,
    già formattate come righe di fattura.
    """
    da_anno  = request.args.get('da_anno',  type=int)
    da_mese  = request.args.get('da_mese',  type=int)
    a_anno   = request.args.get('a_anno',   type=int)
    a_mese   = request.args.get('a_mese',   type=int)

    if not all([da_anno, da_mese, a_anno, a_mese]):
        return jsonify({'error': 'Parametri periodo mancanti'}), 400

    db = get_db()
    try:
        pratiche = db.execute(
            '''SELECT * FROM pratiche
               WHERE ditta_id=?
                 AND (anno > ? OR (anno=? AND mese >= ?))
                 AND (anno < ? OR (anno=? AND mese <= ?))
               ORDER BY anno, mese''',
            (ditta_id,
             da_anno, da_anno, da_mese,
             a_anno,  a_anno,  a_mese)
        ).fetchall()

        righe = []
        for p in pratiche:
            righe.append({
                'pratica_id':  p['id'],
                'descrizione': p['nome'],
                'mese_label':  f"{_mese_label(p['mese'])} {p['anno']}",
                'qta':         p['quantita'] or 1,
                'prezzo':      p['prezzo'],
                'totale':      p['importo'],
                'esente_iva':  p['esente_iva'],
                'aliquota_iva': 0 if p['esente_iva'] else 22,
            })
        return jsonify(righe)
    finally:
        db.close()


def _mese_label(m):
    nomi = ['Gen','Feb','Mar','Apr','Mag','Giu',
            'Lug','Ago','Set','Ott','Nov','Dic']
    return nomi[m - 1] if 1 <= m <= 12 else str(m)


# ─── POST crea / salva fattura ────────────────────────────────────────────────

@bp.route('/api/ditte/<int:ditta_id>/fatture', methods=['POST'])
@login_required
def crea_fattura(ditta_id):
    d = request.get_json()
    anno  = d.get('anno', date.today().year)
    tipo  = d.get('tipo', 'proforma')
    righe = d.get('righe', [])

    # Calcola totali
    imponibile = sum(
        float(r['totale']) for r in righe if not r.get('esente_iva')
    )
    esente = sum(
        float(r['totale']) for r in righe if r.get('esente_iva')
    )
    iva   = round(imponibile * 0.22, 2)
    tot   = round(imponibile + iva + esente, 2)

    db = get_db()
    try:
        numero = _next_numero(db, anno, tipo)
        db.execute(
            '''INSERT INTO fatture
               (ditta_id, numero, anno, tipo, stato, data_emissione,
                periodo_da_anno, periodo_da_mese,
                periodo_a_anno,  periodo_a_mese,
                imponibile, esente_iva, totale_iva, totale,
                note, righe_json)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
            (
                ditta_id,
                numero,
                anno,
                tipo,
                d.get('stato', 'bozza'),
                d.get('data_emissione', date.today().isoformat()),
                d.get('periodo_da_anno'),
                d.get('periodo_da_mese'),
                d.get('periodo_a_anno'),
                d.get('periodo_a_mese'),
                imponibile,
                esente,
                iva,
                tot,
                d.get('note', ''),
                json.dumps(righe),
            )
        )
        db.commit()
        new_id = db.execute('SELECT last_insert_rowid()').fetchone()[0]
        row = db.execute('SELECT * FROM fatture WHERE id=?', (new_id,)).fetchone()
        result = dict(row)
        result['righe'] = json.loads(result['righe_json'])
        return jsonify(result), 201
    finally:
        db.close()


# ─── PUT aggiorna stato fattura ───────────────────────────────────────────────

@bp.route('/api/ditte/<int:ditta_id>/fatture/<int:fid>', methods=['PUT'])
@login_required
def aggiorna_fattura(ditta_id, fid):
    d = request.get_json()
    db = get_db()
    try:
        db.execute(
            '''UPDATE fatture
               SET stato=?, note=?, righe_json=?,
                   imponibile=?, esente_iva=?, totale_iva=?, totale=?
               WHERE id=? AND ditta_id=?''',
            (
                d.get('stato'),
                d.get('note', ''),
                json.dumps(d.get('righe', [])),
                d.get('imponibile', 0),
                d.get('esente_iva', 0),
                d.get('totale_iva', 0),
                d.get('totale', 0),
                fid, ditta_id,
            )
        )
        db.commit()
        row = db.execute('SELECT * FROM fatture WHERE id=?', (fid,)).fetchone()
        result = dict(row)
        result['righe'] = json.loads(result['righe_json'])
        return jsonify(result)
    finally:
        db.close()


# ─── DELETE annulla fattura ───────────────────────────────────────────────────

@bp.route('/api/ditte/<int:ditta_id>/fatture/<int:fid>', methods=['DELETE'])
@login_required
def annulla_fattura(ditta_id, fid):
    db = get_db()
    try:
        db.execute(
            "UPDATE fatture SET stato='annullata' WHERE id=? AND ditta_id=?",
            (fid, ditta_id)
        )
        db.commit()
        return jsonify({'ok': True})
    finally:
        db.close()


# ─── GET genera PDF fattura ───────────────────────────────────────────────────

@bp.route('/api/ditte/<int:ditta_id>/fatture/<int:fid>/pdf', methods=['GET'])
@login_required
def pdf_fattura(ditta_id, fid):
    db = get_db()
    try:
        fattura = db.execute(
            'SELECT * FROM fatture WHERE id=? AND ditta_id=?', (fid, ditta_id)
        ).fetchone()
        if not fattura:
            return jsonify({'error': 'Fattura non trovata'}), 404

        ditta = db.execute('SELECT * FROM ditte WHERE id=?', (ditta_id,)).fetchone()
        righe = json.loads(fattura['righe_json'] or '[]')

        buf = _genera_pdf_fattura(dict(fattura), dict(ditta), righe)
        return send_file(
            buf,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f"fattura_{fattura['numero']}.pdf"
        )
    finally:
        db.close()


def _genera_pdf_fattura(fattura, ditta, righe):
    """Genera il PDF della fattura usando reportlab."""
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.units import cm
        from reportlab.lib import colors
        from reportlab.platypus import (SimpleDocTemplate, Table, TableStyle,
                                        Paragraph, Spacer)
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    except ImportError:
        raise RuntimeError("reportlab non installato. Esegui: pip install reportlab")

    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                             leftMargin=2*cm, rightMargin=2*cm,
                             topMargin=2*cm, bottomMargin=2*cm)
    styles = getSampleStyleSheet()
    H1 = ParagraphStyle('h1', fontSize=16, leading=20, spaceAfter=4)
    SMALL = ParagraphStyle('small', fontSize=9, leading=12)

    story = []

    # Intestazione studio (placeholder — i dati studio vanno da configurazione)
    story.append(Paragraph(f"<b>Studio CDL</b>", H1))
    story.append(Spacer(1, 0.3*cm))
    story.append(Paragraph(f"<b>FATTURA N° {fattura['numero']}</b>  —  {fattura['data_emissione']}", styles['Normal']))
    story.append(Spacer(1, 0.5*cm))

    # Dati cliente
    story.append(Paragraph(f"<b>Cliente:</b> {ditta.get('ragione_sociale', '')}", SMALL))
    story.append(Paragraph(f"<b>C.F./P.IVA:</b> {ditta.get('codice_fiscale', '')}", SMALL))
    story.append(Paragraph(f"<b>Indirizzo:</b> {ditta.get('indirizzo', '')}", SMALL))
    story.append(Spacer(1, 0.5*cm))

    # Righe fattura
    header = [['Descrizione', 'Mese', 'Qta', 'Prezzo', 'IVA%', 'Totale']]
    dati = []
    for r in righe:
        dati.append([
            r.get('descrizione', ''),
            r.get('mese_label', ''),
            str(r.get('qta', 1)),
            f"€ {float(r.get('prezzo', 0)):.2f}",
            'Esente' if r.get('esente_iva') else '22%',
            f"€ {float(r.get('totale', 0)):.2f}",
        ])

    tabella = Table(header + dati, colWidths=[6*cm, 2.5*cm, 1.2*cm, 2.5*cm, 1.5*cm, 2.5*cm])
    tabella.setStyle(TableStyle([
        ('BACKGROUND',  (0,0), (-1,0), colors.HexColor('#2d3748')),
        ('TEXTCOLOR',   (0,0), (-1,0), colors.white),
        ('FONTNAME',    (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE',    (0,0), (-1,-1), 9),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f7fafc')]),
        ('GRID',        (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('ALIGN',       (2,0), (-1,-1), 'RIGHT'),
        ('TOPPADDING',  (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(tabella)
    story.append(Spacer(1, 0.5*cm))

    # Totali
    tot_righe = [
        ['Imponibile', f"€ {fattura['imponibile']:.2f}"],
        ['Esente IVA', f"€ {fattura['esente_iva']:.2f}"],
        ['IVA 22%',    f"€ {fattura['totale_iva']:.2f}"],
        ['TOTALE',     f"€ {fattura['totale']:.2f}"],
    ]
    tot_table = Table(tot_righe, colWidths=[12*cm, 4*cm])
    tot_table.setStyle(TableStyle([
        ('ALIGN',      (1,0), (-1,-1), 'RIGHT'),
        ('FONTNAME',   (0,3), (-1,3), 'Helvetica-Bold'),
        ('FONTSIZE',   (0,0), (-1,-1), 10),
        ('LINEABOVE',  (0,3), (-1,3), 1, colors.black),
        ('TOPPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(tot_table)

    doc.build(story)
    buf.seek(0)
    return buf