import io
from flask import Blueprint, request, jsonify, send_file
from database import get_db
from auth.routes import login_required

bp = Blueprint('estratto_bp', __name__)


@bp.route('/api/ditte/<int:ditta_id>/estratto/pdf', methods=['POST'])
@login_required
def genera_estratto(ditta_id):
    d = request.get_json()
    formato  = d.get('formato', 'completo')   # 'completo' | 'sintetico'
    periodo  = d.get('periodo', 'anno')        # 'anno' | 'mese' | 'range' | 'storico'
    anno     = d.get('anno')
    mese     = d.get('mese')
    da_mese  = d.get('da_mese')
    a_mese   = d.get('a_mese')
    includi_tariffario = d.get('includi_tariffario', False)

    db = get_db()
    try:
        ditta = db.execute('SELECT * FROM ditte WHERE id=?', (ditta_id,)).fetchone()
        if not ditta:
            return jsonify({'error': 'Cliente non trovato'}), 404

        # Recupera pratiche nel periodo
        pratiche = _fetch_pratiche(db, ditta_id, periodo, anno, mese, da_mese, a_mese)
        # Recupera pagamenti nel periodo
        pagamenti = _fetch_pagamenti(db, ditta_id, periodo, anno, mese, da_mese, a_mese)
        # Recupera arrotondamenti (globali)
        arrotondamenti = db.execute(
            'SELECT * FROM arrotondamenti WHERE ditta_id=? ORDER BY data DESC',
            (ditta_id,)
        ).fetchall()
        # Tariffario (opzionale)
        tariffario = None
        if includi_tariffario:
            tariffario = db.execute(
                'SELECT * FROM ditta_voci WHERE ditta_id=? ORDER BY macrogruppo_nome, nome',
                (ditta_id,)
            ).fetchall()

        buf = _genera_pdf_estratto(
            dict(ditta),
            [dict(p) for p in pratiche],
            [dict(p) for p in pagamenti],
            [dict(a) for a in arrotondamenti],
            formato,
            tariffario=[dict(t) for t in tariffario] if tariffario else None,
        )
        nome_file = f"estratto_{ditta['ragione_sociale'].replace(' ', '_')}_{anno or 'storico'}.pdf"
        return send_file(buf, mimetype='application/pdf',
                         as_attachment=True, download_name=nome_file)
    finally:
        db.close()


def _fetch_pratiche(db, ditta_id, periodo, anno, mese, da_mese, a_mese):
    if periodo == 'storico':
        return db.execute(
            'SELECT * FROM pratiche WHERE ditta_id=? ORDER BY anno, mese', (ditta_id,)
        ).fetchall()
    elif periodo == 'mese' and anno and mese:
        return db.execute(
            'SELECT * FROM pratiche WHERE ditta_id=? AND anno=? AND mese=?',
            (ditta_id, anno, mese)
        ).fetchall()
    elif periodo == 'range' and anno and da_mese and a_mese:
        return db.execute(
            '''SELECT * FROM pratiche WHERE ditta_id=? AND anno=?
               AND mese BETWEEN ? AND ? ORDER BY mese''',
            (ditta_id, anno, da_mese, a_mese)
        ).fetchall()
    else:  # 'anno' default
        return db.execute(
            'SELECT * FROM pratiche WHERE ditta_id=? AND anno=? ORDER BY mese',
            (ditta_id, anno)
        ).fetchall()


def _fetch_pagamenti(db, ditta_id, periodo, anno, mese, da_mese, a_mese):
    if periodo == 'storico':
        return db.execute(
            'SELECT * FROM pagamenti WHERE ditta_id=? ORDER BY data', (ditta_id,)
        ).fetchall()
    elif periodo == 'mese' and anno and mese:
        return db.execute(
            "SELECT * FROM pagamenti WHERE ditta_id=? AND strftime('%Y',data)=? AND strftime('%m',data)=?",
            (ditta_id, str(anno), str(mese).zfill(2))
        ).fetchall()
    else:
        return db.execute(
            "SELECT * FROM pagamenti WHERE ditta_id=? AND strftime('%Y',data)=? ORDER BY data",
            (ditta_id, str(anno))
        ).fetchall()


def _genera_pdf_estratto(ditta, pratiche, pagamenti, arrotondamenti, formato, tariffario=None):
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.units import cm
        from reportlab.lib import colors
        from reportlab.platypus import (SimpleDocTemplate, Table, TableStyle,
                                        Paragraph, Spacer, PageBreak)
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    except ImportError:
        raise RuntimeError("reportlab non installato")

    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                             leftMargin=2*cm, rightMargin=2*cm,
                             topMargin=2*cm, bottomMargin=2*cm)
    styles = getSampleStyleSheet()
    H1 = ParagraphStyle('h1', fontSize=14, leading=18, spaceAfter=4,
                         fontName='Helvetica-Bold')
    H2 = ParagraphStyle('h2', fontSize=11, leading=14, spaceAfter=2,
                         fontName='Helvetica-Bold')
    SMALL = ParagraphStyle('sm', fontSize=9, leading=12)

    story = []
    story.append(Paragraph("ESTRATTO CONTO", H1))
    story.append(Paragraph(f"Cliente: <b>{ditta.get('ragione_sociale', '')}</b>", SMALL))
    story.append(Paragraph(f"C.F./P.IVA: {ditta.get('codice_fiscale', '')}", SMALL))
    story.append(Spacer(1, 0.5*cm))

    # Riepilogo finanziario
    tot_pratiche = sum(p['importo'] for p in pratiche)
    esente       = sum(p['importo'] for p in pratiche if p.get('esente_iva'))
    imponibile   = tot_pratiche - esente
    iva          = round(imponibile * 0.22, 2)
    tot_iva      = round(imponibile + iva + esente, 2)
    tot_pag      = sum(p.get('importo', 0) for p in pagamenti)
    tot_arrot    = sum(a.get('importo', 0) for a in arrotondamenti)
    saldo        = round(tot_iva - tot_pag - tot_arrot, 2)

    riepilogo = [
        ['Totale pratiche (imponibile)', f"€ {imponibile:.2f}"],
        ['Esente IVA',                   f"€ {esente:.2f}"],
        ['IVA 22%',                      f"€ {iva:.2f}"],
        ['Totale con IVA',               f"€ {tot_iva:.2f}"],
        ['Pagamenti ricevuti',           f"€ {tot_pag:.2f}"],
        ['Arrotondamenti',               f"€ {tot_arrot:.2f}"],
        ['SALDO',                        f"€ {saldo:.2f}"],
    ]
    t = Table(riepilogo, colWidths=[11*cm, 5*cm])
    t.setStyle(TableStyle([
        ('FONTNAME',  (0,6), (-1,6), 'Helvetica-Bold'),
        ('FONTSIZE',  (0,0), (-1,-1), 9),
        ('ALIGN',     (1,0), (-1,-1), 'RIGHT'),
        ('GRID',      (0,0), (-1,-1), 0.3, colors.HexColor('#e2e8f0')),
        ('BACKGROUND',(0,6), (-1,6), colors.HexColor('#ebf8ff')),
        ('TOPPADDING',(0,0), (-1,-1), 3),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.5*cm))

    if formato == 'completo':
        # Pratiche per mese
        pratiche_per_mese = {}
        for p in pratiche:
            k = (p['anno'], p['mese'])
            pratiche_per_mese.setdefault(k, []).append(p)

        nomi_mesi = ['Gen','Feb','Mar','Apr','Mag','Giu',
                     'Lug','Ago','Set','Ott','Nov','Dic']

        for (anno, mese), voci in sorted(pratiche_per_mese.items()):
            titolo_mese = f"{nomi_mesi[mese-1]} {anno}"
            story.append(Paragraph(titolo_mese, H2))
            righe_m = [['Descrizione', 'Importo', 'IVA']]
            for v in voci:
                righe_m.append([
                    v['nome'],
                    f"€ {float(v['importo'] or 0):.2f}",
                    'Esente' if v.get('esente_iva') else '22%',
                ])
            tm = Table(righe_m, colWidths=[10*cm, 3*cm, 3*cm])
            tm.setStyle(TableStyle([
                ('BACKGROUND',    (0,0),(-1,0), colors.HexColor('#2d3748')),
                ('TEXTCOLOR',     (0,0),(-1,0), colors.white),
                ('FONTNAME',      (0,0),(-1,0), 'Helvetica-Bold'),
                ('FONTSIZE',      (0,0),(-1,-1), 8),
                ('ROWBACKGROUNDS',(0,1),(-1,-1), [colors.white, colors.HexColor('#f7fafc')]),
                ('GRID',          (0,0),(-1,-1), 0.3, colors.HexColor('#e2e8f0')),
                ('ALIGN',         (1,0),(-1,-1), 'RIGHT'),
                ('TOPPADDING',    (0,0),(-1,-1), 3),
            ]))
            story.append(tm)
            story.append(Spacer(1, 0.3*cm))

        # Pagamenti
        if pagamenti:
            story.append(Paragraph("Pagamenti ricevuti", H2))
            righe_p = [['Data', 'Metodo', 'Note', 'Importo']]
            for p in pagamenti:
                righe_p.append([
                    p.get('data', ''),
                    p.get('metodo', ''),
                    p.get('note', ''),
                    f"€ {p.get('importo', 0):.2f}",
                ])
            tp = Table(righe_p, colWidths=[3*cm, 3*cm, 7*cm, 3*cm])
            tp.setStyle(TableStyle([
                ('BACKGROUND',    (0,0),(-1,0), colors.HexColor('#2d3748')),
                ('TEXTCOLOR',     (0,0),(-1,0), colors.white),
                ('FONTNAME',      (0,0),(-1,0), 'Helvetica-Bold'),
                ('FONTSIZE',      (0,0),(-1,-1), 8),
                ('ROWBACKGROUNDS',(0,1),(-1,-1), [colors.white, colors.HexColor('#f7fafc')]),
                ('GRID',          (0,0),(-1,-1), 0.3, colors.HexColor('#e2e8f0')),
                ('ALIGN',         (3,0),(-1,-1), 'RIGHT'),
                ('TOPPADDING',    (0,0),(-1,-1), 3),
            ]))
            story.append(tp)

    # Pagina tariffario opzionale
    if tariffario:
        story.append(PageBreak())
        story.append(Paragraph("Tariffario applicato", H1))
        story.append(Spacer(1, 0.3*cm))
        righe_t = [['Macrogruppo', 'Voce', 'Prezzo', 'Esente IVA']]
        for v in tariffario:
            righe_t.append([
                v.get('macrogruppo_nome', ''),
                v.get('nome', ''),
                f"€ {v.get('prezzo', 0):.2f}",
                'Sì' if v.get('esente_iva') else 'No',
            ])
        tt = Table(righe_t, colWidths=[5*cm, 7*cm, 3*cm, 2.5*cm])
        tt.setStyle(TableStyle([
            ('BACKGROUND',    (0,0),(-1,0), colors.HexColor('#2d3748')),
            ('TEXTCOLOR',     (0,0),(-1,0), colors.white),
            ('FONTNAME',      (0,0),(-1,0), 'Helvetica-Bold'),
            ('FONTSIZE',      (0,0),(-1,-1), 8),
            ('ROWBACKGROUNDS',(0,1),(-1,-1), [colors.white, colors.HexColor('#f7fafc')]),
            ('GRID',          (0,0),(-1,-1), 0.3, colors.HexColor('#e2e8f0')),
            ('TOPPADDING',    (0,0),(-1,-1), 3),
        ]))
        story.append(tt)

    doc.build(story)
    buf.seek(0)
    return buf