import io
import calendar
from datetime import date
from flask import Blueprint, request, jsonify, send_file
from database import get_db
from auth.routes import login_required

bp = Blueprint('estratto_bp', __name__)

NOMI_MESI = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
]


def _ultimo_giorno(anno, mese):
    return calendar.monthrange(int(anno), int(mese))[1]


def _eur(v):
    s = f"{float(v):,.2f}"
    s = s.replace(',', 'X').replace('.', ',').replace('X', '.')
    return f"€ {s}"


def _calcola_residuo(db, ditta_id, anno):
    rows = db.execute(
        'SELECT COALESCE(SUM(importo),0) FROM pratiche WHERE ditta_id=? AND anno<?',
        (ditta_id, anno)
    ).fetchone()
    tot_prat = rows[0] if rows else 0

    esente_rows = db.execute(
        'SELECT COALESCE(SUM(importo),0) FROM pratiche WHERE ditta_id=? AND anno<? AND esente_iva=1',
        (ditta_id, anno)
    ).fetchone()
    esente_prec = esente_rows[0] if esente_rows else 0

    imponibile_prec = tot_prat - esente_prec
    tot_con_iva = round(imponibile_prec * 1.22 + esente_prec, 2)

    pag_rows = db.execute(
        "SELECT COALESCE(SUM(importo),0) FROM pagamenti WHERE ditta_id=? AND strftime('%Y',data)<?",
        (ditta_id, str(anno))
    ).fetchone()
    tot_pag = pag_rows[0] if pag_rows else 0

    # ⚠️ RIMOSSO: non sottrarre arrotondamenti qui
    return round(tot_con_iva - tot_pag, 2)


def _fetch_pratiche(db, ditta_id, periodo, anno, mese, da_mese, a_mese):
    if periodo == 'storico':
        return db.execute(
            'SELECT * FROM pratiche WHERE ditta_id=? ORDER BY anno, mese',
            (ditta_id,)
        ).fetchall()

    elif periodo == 'mese' and anno and mese:
        return db.execute(
            'SELECT * FROM pratiche WHERE ditta_id=? AND anno=? AND mese=?',
            (ditta_id, anno, mese)
        ).fetchall()

    elif periodo == 'range' and anno and da_mese and a_mese:
        return db.execute(
            '''
            SELECT * FROM pratiche
            WHERE ditta_id=? AND anno=? AND mese BETWEEN ? AND ?
            ORDER BY mese
            ''',
            (ditta_id, anno, da_mese, a_mese)
        ).fetchall()

    else:
        return db.execute(
            'SELECT * FROM pratiche WHERE ditta_id=? AND anno=? ORDER BY mese',
            (ditta_id, anno)
        ).fetchall()


def _fetch_pagamenti(db, ditta_id, periodo, anno, mese, da_mese, a_mese):
    if periodo == 'storico':
        return db.execute(
            'SELECT * FROM pagamenti WHERE ditta_id=? ORDER BY data',
            (ditta_id,)
        ).fetchall()

    elif periodo == 'mese' and anno and mese:
        return db.execute(
            "SELECT * FROM pagamenti WHERE ditta_id=? AND strftime('%Y',data)=? AND strftime('%m',data)=?",
            (ditta_id, str(anno), str(mese).zfill(2))
        ).fetchall()

    elif periodo == 'range' and anno and da_mese and a_mese:
        return db.execute(
            """
            SELECT * FROM pagamenti
            WHERE ditta_id=?
              AND strftime('%Y',data)=?
              AND CAST(strftime('%m',data) AS INTEGER) BETWEEN ? AND ?
            ORDER BY data
            """,
            (ditta_id, str(anno), int(da_mese), int(a_mese))
        ).fetchall()

    else:
        return db.execute(
            "SELECT * FROM pagamenti WHERE ditta_id=? AND strftime('%Y',data)=? ORDER BY data",
            (ditta_id, str(anno))
        ).fetchall()


@bp.route('/api/ditte/<int:ditta_id>/estratto/pdf', methods=['POST'])
@login_required
def genera_estratto(ditta_id):
    d = request.get_json() or {}

    formato = d.get('formato', 'completo')   # 'completo' | 'sintetico'
    periodo = d.get('periodo', 'anno')       # 'anno' | 'mese' | 'range' | 'storico'
    anno = d.get('anno')
    mese = d.get('mese')
    da_mese = d.get('da_mese')
    a_mese = d.get('a_mese')
    includi_tariffario = d.get('includi_tariffario', False)

    db = get_db()
    try:
        ditta = db.execute('SELECT * FROM ditte WHERE id=?', (ditta_id,)).fetchone()
        if not ditta:
            return jsonify({'error': 'Cliente non trovato'}), 404

        pratiche = _fetch_pratiche(db, ditta_id, periodo, anno, mese, da_mese, a_mese)
        pagamenti = _fetch_pagamenti(db, ditta_id, periodo, anno, mese, da_mese, a_mese)
        arrotondamenti = db.execute(
            'SELECT * FROM arrotondamenti WHERE ditta_id=? ORDER BY data DESC',
            (ditta_id,)
        ).fetchall()

        residuo = _calcola_residuo(db, ditta_id, anno) if anno else 0

        tariffario = None
        if includi_tariffario:
            tariffario = db.execute(
                '''
                SELECT *
                FROM ditta_voci
                WHERE ditta_id=?
                ORDER BY macrogruppo_nome, nome
                ''',
                (ditta_id,)
            ).fetchall()

        buf = _genera_pdf_estratto(
            dict(ditta),
            [dict(p) for p in pratiche],
            [dict(p) for p in pagamenti],
            [dict(a) for a in arrotondamenti],
            formato,
            periodo=periodo,
            anno=anno,
            mese=mese,
            da_mese=da_mese,
            a_mese=a_mese,
            residuo=residuo,
            tariffario=[dict(t) for t in tariffario] if tariffario else None,
        )

        rs = ditta['ragione_sociale'].replace(' ', '_')

        if periodo == 'mese' and anno and mese:
            label = f"{anno}-{str(mese).zfill(2)}"
        elif periodo == 'range' and anno:
            label = f"{anno}-{str(da_mese).zfill(2)}-{str(a_mese).zfill(2)}"
        elif periodo == 'storico':
            label = 'storico'
        else:
            label = str(anno or 'anno')

        suffisso = 'Sintetico' if formato == 'sintetico' else 'Completo'
        nome_file = f"{rs}-Estratto-{suffisso}-{label}.pdf"

        return send_file(
            buf,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=nome_file
        )
    finally:
        db.close()


def _genera_pdf_estratto(
    ditta,
    pratiche,
    pagamenti,
    arrotondamenti,
    formato,
    periodo=None,
    anno=None,
    mese=None,
    da_mese=None,
    a_mese=None,
    residuo=0,
    tariffario=None
):
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.units import cm
        from reportlab.lib import colors
        from reportlab.platypus import (
            SimpleDocTemplate, Table, TableStyle, Paragraph,
            Spacer, PageBreak, HRFlowable
        )
        from reportlab.lib.styles import ParagraphStyle
    except ImportError:
        raise RuntimeError("reportlab non installato")

    buf = io.BytesIO()

    C_BLU = colors.HexColor('#1a365d')
    C_TEAL = colors.HexColor('#2c7a7b')
    C_LIGHT = colors.HexColor('#ebf8ff')
    C_HEADER = colors.HexColor('#2d3748')
    C_ALT = colors.HexColor('#f7fafc')
    C_ROSSO = colors.HexColor('#c53030')
    C_VERDE = colors.HexColor('#276749')
    C_BORDER = colors.HexColor('#e2e8f0')
    C_MUTED = colors.HexColor('#718096')

    W, H = A4
    ML = MR = 1.8 * cm
    MT = MB = 1.8 * cm
    CONTENT_W = W - ML - MR

    rs = ditta.get('ragione_sociale', '')
    oggi = date.today().strftime('%d/%m/%Y')

    if periodo == 'mese' and anno and mese:
        label_periodo = f"{NOMI_MESI[int(mese)-1]} {anno}"
    elif periodo == 'range' and anno and da_mese and a_mese:
        label_periodo = f"{NOMI_MESI[int(da_mese)-1][:3]}-{NOMI_MESI[int(a_mese)-1][:3]} {anno}"
    elif periodo == 'storico':
        label_periodo = 'Storico completo'
    else:
        label_periodo = f"Anno {anno}"

    data_paghe = ditta.get('data_inizio_paghe', '')
    data_contab = ditta.get('data_inizio_contabilita', '')
    info_cliente = ''
    if data_paghe:
        info_cliente += f"Cliente Paghe dal {data_paghe}"
    if data_contab:
        sep = '  |  ' if info_cliente else ''
        info_cliente += f"{sep}Cliente Contabilità dal {data_contab}"

    esente = sum(float(p.get('importo') or 0) for p in pratiche if p.get('esente_iva'))
    imponibile = sum(float(p.get('importo') or 0) for p in pratiche if not p.get('esente_iva'))
    iva_tot = round(imponibile * 0.22, 2)
    dovuto = round(imponibile + iva_tot + esente, 2)
    tot_pag = sum(float(p.get('importo') or 0) for p in pagamenti)
    tot_arrot = sum(
        float(a.get('importo') or 0) if a.get('tipo') == 'addebito'
        else -float(a.get('importo') or 0)
        for a in arrotondamenti
    )
    saldo = round(dovuto - tot_pag + tot_arrot, 2)

    def sty(name, **kw):
        base = dict(
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            textColor=colors.HexColor('#2d3748')
        )
        base.update(kw)
        return ParagraphStyle(name, **base)

    S_TITLE = sty('title', fontSize=16, fontName='Helvetica-Bold', textColor=C_BLU, leading=20, spaceAfter=2)
    S_SUB = sty('sub', fontSize=11, fontName='Helvetica-Bold', textColor=C_BLU, leading=14)
    S_PERIOD = sty('period', fontSize=10, textColor=C_TEAL, fontName='Helvetica-Bold', leading=13)
    S_INFO = sty('info', fontSize=8, textColor=C_MUTED)
    S_H2 = sty('h2', fontSize=10, fontName='Helvetica-Bold', textColor=C_HEADER, leading=14, spaceBefore=8, spaceAfter=3)
    S_BODY = sty('body', fontSize=9)
    S_SMALL = sty('small', fontSize=8, textColor=C_MUTED)
    S_VERDE = sty('verde', fontSize=9, fontName='Helvetica-Bold', textColor=C_VERDE)
    S_ROSSO = sty('rosso', fontSize=9, fontName='Helvetica-Bold', textColor=C_ROSSO)

    def saldo_par(v):
        if v > 0:
            return Paragraph(f"<b>{_eur(v)} DA PAGARE</b>", S_ROSSO)
        elif v < 0:
            return Paragraph(f"<b>{_eur(abs(v))} A CREDITO</b>", S_VERDE)
        return Paragraph("<b>€ 0,00 PARI</b>", S_BODY)

    def _header_footer(canvas, doc):
        canvas.saveState()
        canvas.setStrokeColor(C_BORDER)
        canvas.setLineWidth(0.5)
        canvas.line(ML, MB - 0.3 * cm, W - MR, MB - 0.3 * cm)
        canvas.setFont('Helvetica', 7)
        canvas.setFillColor(C_MUTED)
        canvas.drawString(ML, MB - 0.55 * cm, f"{rs}  |  {label_periodo}  |  Pag. {doc.page}")
        canvas.drawRightString(W - MR, MB - 0.55 * cm, oggi)
        canvas.restoreState()

    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=ML,
        rightMargin=MR,
        topMargin=MT,
        bottomMargin=MB + 0.5 * cm,
        title=f"Estratto Conto - {rs} - {label_periodo}",
        author="Wolware",
        subject=f"Estratto {formato} - {label_periodo}",
        creator="Wolware"
    )

    story = []

    # COPERTINA
    story.append(Paragraph("ESTRATTO CONTO", S_TITLE))
    story.append(Paragraph(label_periodo, S_PERIOD))
    story.append(Spacer(1, 0.1 * cm))
    story.append(Paragraph(f"<b>{rs}</b>", S_SUB))
    if info_cliente:
        story.append(Paragraph(info_cliente, S_INFO))
    story.append(Spacer(1, 0.4 * cm))
    story.append(HRFlowable(width=CONTENT_W, thickness=1.5, color=C_BLU, spaceAfter=10))

    col_l = CONTENT_W * 0.55
    col_r = CONTENT_W * 0.45
    riepilogo_rows = []

    if residuo != 0:
        riepilogo_rows.append([
            Paragraph("Residuo anni precedenti", S_BODY),
            Paragraph(f"<b>{_eur(residuo)}</b>", S_ROSSO if residuo > 0 else S_VERDE)
        ])

    riepilogo_rows += [
        [
            Paragraph(f"Competenze periodo ({label_periodo})", S_BODY),
            Paragraph(f"<b>{_eur(dovuto)}</b>", S_BODY)
        ],
        [
            Paragraph("Pagamenti ricevuti", S_BODY),
            Paragraph(f"<b>- {_eur(tot_pag)}</b>", S_VERDE if tot_pag > 0 else S_BODY)
        ]
    ]

    riepilogo_rows.append([
        Paragraph("<b>SALDO ATTUALE</b>", sty('bld', fontName='Helvetica-Bold', fontSize=10)),
        saldo_par(saldo)
    ])

    n_r = len(riepilogo_rows)
    t_riepilogo = Table(riepilogo_rows, colWidths=[col_l, col_r])
    t_riepilogo.setStyle(TableStyle([
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('LINEABOVE', (0, n_r - 1), (-1, n_r - 1), 1, C_BLU),
        ('BACKGROUND', (0, n_r - 1), (-1, n_r - 1), C_LIGHT),
        ('GRID', (0, 0), (-1, n_r - 2), 0.3, C_BORDER),
    ]))
    story.append(t_riepilogo)
    story.append(Spacer(1, 0.3 * cm))
    story.append(Paragraph(
        f"Dettaglio: Imponibile {_eur(imponibile)} + IVA 22% {_eur(iva_tot)} + Esente {_eur(esente)}",
        S_SMALL
    ))

    pratiche_per_mese = {}
    for p in pratiche:
        pratiche_per_mese.setdefault(int(p['mese']), []).append(p)

    pagamenti_per_mese = {}
    for p in pagamenti:
        try:
            m = int(p['data'].split('-')[1])
        except Exception:
            m = 0
        pagamenti_per_mese.setdefault(m, []).append(p)

    def _group_voci(voci):
        g = {}
        for v in voci:
            nome = v.get('nome', '')
            if nome not in g:
                g[nome] = {
                    'qty': 0,
                    'prezzo': float(v.get('importo') or 0),
                    'esente': v.get('esente_iva', 0)
                }
            g[nome]['qty'] += 1
        return g

    if formato == 'completo':
        story.append(PageBreak())
        story.append(Paragraph("RIEPILOGO MOVIMENTI", S_H2))

        if residuo != 0:
            story.append(Paragraph(
                f"Saldo iniziale (residuo anni precedenti): <b>{_eur(residuo)}</b>",
                S_BODY
            ))
        story.append(Spacer(1, 0.2 * cm))

        righe_mov = [['MESE', 'COMPETENZE', 'PAGAMENTI', 'SALDO PROGR.']]
        sp = residuo
        tot_comp = 0
        tot_pag_tab = 0

        for m in range(1, 13):
            voci_m = pratiche_per_mese.get(m, [])
            pag_m = pagamenti_per_mese.get(m, [])

            c = sum(float(v.get('importo') or 0) for v in voci_m)
            e = sum(float(v.get('importo') or 0) for v in voci_m if v.get('esente_iva'))
            comp_iva = round((c - e) * 1.22 + e, 2)
            pag_m_tot = sum(float(p.get('importo') or 0) for p in pag_m)

            sp = round(sp + comp_iva - pag_m_tot, 2)
            tot_comp += comp_iva
            tot_pag_tab += pag_m_tot

            pag_str = ''
            if pag_m:
                parti = []
                for p in pag_m:
                    try:
                        bits = p['data'].split('-')
                        dfmt = f"{bits[2].lstrip('0')}/{bits[1].lstrip('0')}"
                    except Exception:
                        dfmt = p.get('data', '')
                    parti.append(f"{_eur(p.get('importo', 0))} ({dfmt})")
                pag_str = ', '.join(parti)

            righe_mov.append([
                NOMI_MESI[m - 1],
                _eur(comp_iva),
                pag_str or '-',
                _eur(sp)
            ])

        saldo_label = 'DA PAGARE' if saldo > 0 else ('A CREDITO' if saldo < 0 else '')
        righe_mov.append(['TOTALE', _eur(tot_comp), _eur(tot_pag_tab), ''])
        righe_mov.append([
            Paragraph(
                f"<b>SALDO FINALE: {_eur(saldo)} {saldo_label}</b>",
                S_ROSSO if saldo > 0 else S_VERDE
            ),
            '', '', ''
        ])

        CW = CONTENT_W / 4
        t_mov = Table(righe_mov, colWidths=[CW * 1.2, CW * 0.9, CW * 1.1, CW * 0.8])
        n_m = len(righe_mov)
        t_mov.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), C_HEADER),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('ROWBACKGROUNDS', (0, 1), (-1, n_m - 3), [colors.white, C_ALT]),
            ('GRID', (0, 0), (-1, n_m - 3), 0.3, C_BORDER),
            ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ('FONTNAME', (0, n_m - 2), (-1, n_m - 2), 'Helvetica-Bold'),
            ('LINEABOVE', (0, n_m - 2), (-1, n_m - 2), 1, C_BLU),
            ('BACKGROUND', (0, n_m - 2), (-1, n_m - 2), C_LIGHT),
            ('SPAN', (0, n_m - 1), (-1, n_m - 1)),
            ('BACKGROUND', (0, n_m - 1), (-1, n_m - 1), C_LIGHT),
            ('TOPPADDING', (0, n_m - 1), (-1, n_m - 1), 5),
            ('BOTTOMPADDING', (0, n_m - 1), (-1, n_m - 1), 5),
        ]))
        story.append(t_mov)

        story.append(PageBreak())
        story.append(Paragraph("DETTAGLIO COMPETENZE", S_H2))
        story.append(Spacer(1, 0.1 * cm))

        for m in sorted(pratiche_per_mese.keys(), reverse=True):
            voci_m = pratiche_per_mese[m]
            e_m = sum(float(v.get('importo') or 0) for v in voci_m if v.get('esente_iva'))
            i_m = sum(float(v.get('importo') or 0) for v in voci_m) - e_m
            tot_m = round(i_m * 1.22 + e_m, 2)

            saldo_fine = residuo
            for mm in range(1, m + 1):
                vv = pratiche_per_mese.get(mm, [])
                pp = pagamenti_per_mese.get(mm, [])
                c2 = sum(float(v.get('importo') or 0) for v in vv)
                e2 = sum(float(v.get('importo') or 0) for v in vv if v.get('esente_iva'))
                saldo_fine += round((c2 - e2) * 1.22 + e2, 2)
                saldo_fine -= sum(float(p.get('importo') or 0) for p in pp)
                saldo_fine = round(saldo_fine, 2)

            story.append(Paragraph(
                f"<b>{NOMI_MESI[m - 1].upper()} {anno}</b> — Totale: <b>{_eur(tot_m)}</b>",
                S_H2
            ))

            g = _group_voci(voci_m)
            righe_v = []

            for nome, info in g.items():
                qty = info['qty']
                prz = info['prezzo']
                iva_v = 0 if info['esente'] else round(prz * 0.22 * qty, 2)
                tot_v = qty * prz + iva_v
                iva_s = '(esente IVA)' if info['esente'] else f'+ IVA {_eur(iva_v)}'
                desc = f'{qty} x {_eur(prz)}' if qty > 1 else _eur(prz)

                righe_v.append([
                    Paragraph(nome, S_BODY),
                    Paragraph(f'{desc}  {iva_s}', S_SMALL),
                    Paragraph(f"<b>{_eur(tot_v)}</b>", S_BODY),
                ])

            t_v = Table(righe_v, colWidths=[CONTENT_W * 0.38, CONTENT_W * 0.42, CONTENT_W * 0.20])
            t_v.setStyle(TableStyle([
                ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
                ('TOPPADDING', (0, 0), (-1, -1), 3),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
                ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.white, C_ALT]),
                ('GRID', (0, 0), (-1, -1), 0.3, C_BORDER),
            ]))
            story.append(t_v)

            story.append(Paragraph(
                f'<font color="#718096">Imponibile {_eur(i_m)} + IVA {_eur(round(i_m * 0.22, 2))}</font>',
                S_SMALL
            ))

            for p in pagamenti_per_mese.get(m, []):
                metodo = p.get('metodo', '')
                note_p = p.get('note', '')
                lbl = f"{p.get('data', '')}  {metodo}"
                if note_p:
                    lbl += f" - {note_p}"
                story.append(Paragraph(
                    f'Pagamenti: <b>{lbl}  {_eur(p.get("importo", 0))}</b>',
                    S_BODY
                ))

            story.append(Paragraph(
                f"Saldo al {_ultimo_giorno(anno, m)}/{str(m).zfill(2)}/{anno}: <b>{_eur(saldo_fine)}</b>",
                S_BODY
            ))
            story.append(Spacer(1, 0.3 * cm))

        if residuo != 0:
            story.append(HRFlowable(width=CONTENT_W, thickness=0.5, color=C_BORDER))
            story.append(Spacer(1, 0.15 * cm))
            story.append(Paragraph(
                f"SALDO INIZIALE (Residuo anni precedenti)  <b>{_eur(residuo)}</b>",
                S_BODY
            ))

    else:
        story.append(Spacer(1, 0.4 * cm))
        story.append(HRFlowable(width=CONTENT_W, thickness=0.5, color=C_BORDER, spaceAfter=6))

        saldi_per_mese = {}
        sp2 = residuo
        for m in range(1, 13):
            vv = pratiche_per_mese.get(m, [])
            pp = pagamenti_per_mese.get(m, [])
            c = sum(float(v.get('importo') or 0) for v in vv)
            e = sum(float(v.get('importo') or 0) for v in vv if v.get('esente_iva'))
            sp2 += round((c - e) * 1.22 + e, 2)
            sp2 -= sum(float(p.get('importo') or 0) for p in pp)
            sp2 = round(sp2, 2)
            if vv or pp:
                saldi_per_mese[m] = sp2

        righe_sin = [['PERIODO', 'DESCRIZIONE', 'IMPORTO', 'SALDO PROGR.']]

        for m in sorted(saldi_per_mese.keys(), reverse=True):
            voci_m = pratiche_per_mese.get(m, [])
            pag_m = pagamenti_per_mese.get(m, [])
            saldo_m = saldi_per_mese[m]

            if voci_m:
                g = _group_voci(voci_m)
                bullet_lines = []
                tot_sin = 0

                for nome, info in g.items():
                    qty = info['qty']
                    prz = info['prezzo']
                    iva_v = 0 if info['esente'] else round(prz * 0.22 * qty, 2)
                    tot_v = qty * prz + iva_v
                    tot_sin += tot_v

                    iva_s = '(esente IVA)' if info['esente'] else f'+ IVA {_eur(iva_v)}'
                    qs = f' x{qty}' if qty > 1 else ''
                    bullet_lines.append(f"• {nome}{qs}  {_eur(qty * prz)} {iva_s}")

                righe_sin.append([
                    Paragraph(f"<b>{NOMI_MESI[m - 1][:3]} {anno}</b>", S_BODY),
                    Paragraph('<br/>'.join(bullet_lines), S_SMALL),
                    Paragraph(f"<b>{_eur(tot_sin)}</b>", S_BODY),
                    Paragraph(f"<b>{_eur(saldo_m)}</b>", S_ROSSO if saldo_m > 0 else S_VERDE),
                ])

            for p in pag_m:
                metodo = p.get('metodo', '')
                note_p = p.get('note', '')
                lbl = metodo
                if note_p:
                    lbl += f" - {note_p}"

                try:
                    bits = p['data'].split('-')
                    dfmt = f"{bits[2].lstrip('0')}/{bits[1]}/{bits[0]}"
                except Exception:
                    dfmt = p.get('data', '')

                saldo_prima = round(saldo_m + float(p.get('importo', 0)), 2)

                righe_sin.append([
                    Paragraph(dfmt, S_SMALL),
                    Paragraph(lbl, S_SMALL),
                    Paragraph(f"<b>- {_eur(p.get('importo', 0))}</b>", S_VERDE),
                    Paragraph(
                        f"<b>{_eur(saldo_prima)}</b>",
                        S_ROSSO if saldo_prima > 0 else S_VERDE
                    ),
                ])

        if residuo != 0:
            righe_sin.insert(1, [
                Paragraph('<b>Residuo Anni Prec.</b>', S_BODY),
                Paragraph('Saldo da anni precedenti', S_SMALL),
                Paragraph(f'<b>{_eur(abs(residuo))}</b>', S_ROSSO if residuo > 0 else S_VERDE),
                Paragraph(f'<b>{_eur(residuo)}</b>', S_ROSSO if residuo > 0 else S_VERDE),
            ])

        CW2 = CONTENT_W / 4
        t_sin = Table(righe_sin, colWidths=[CW2 * 0.8, CW2 * 1.6, CW2 * 0.8, CW2 * 0.8])
        t_sin.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), C_HEADER),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, C_ALT]),
            ('GRID', (0, 0), (-1, -1), 0.3, C_BORDER),
            ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(t_sin)

    if tariffario:
        story.append(PageBreak())
        story.append(Paragraph("TARIFFARIO APPLICATO", S_H2))
        story.append(Paragraph(f"<b>{rs}</b>", S_SUB))
        story.append(Spacer(1, 0.3 * cm))

        gruppi = {}
        for v in tariffario:
            mg = v.get('macrogruppo_nome', 'Altro')
            gruppi.setdefault(mg, []).append(v)

        for mg, voci_mg in gruppi.items():
            story.append(Paragraph(
                mg,
                sty('mg', fontName='Helvetica-Bold', fontSize=8, textColor=C_TEAL, spaceBefore=6, spaceAfter=2)
            ))

            righe_tar = []
            for v in voci_mg:
                mese_rif = v.get('mese_riferimento', '')
                mese_str = NOMI_MESI[int(mese_rif) - 1] if mese_rif else ''
                righe_tar.append([
                    Paragraph(v.get('nome', ''), S_BODY),
                    Paragraph(mese_str, S_SMALL),
                    Paragraph(_eur(v.get('prezzo', 0)), S_BODY),
                ])

            t_tar = Table(righe_tar, colWidths=[CONTENT_W * 0.55, CONTENT_W * 0.20, CONTENT_W * 0.25])
            t_tar.setStyle(TableStyle([
                ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
                ('TOPPADDING', (0, 0), (-1, -1), 3),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
                ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.white, C_ALT]),
                ('GRID', (0, 0), (-1, -1), 0.3, C_BORDER),
            ]))
            story.append(t_tar)

    doc.build(
        story,
        onFirstPage=_header_footer,
        onLaterPages=_header_footer
    )

    buf.seek(0)
    return buf