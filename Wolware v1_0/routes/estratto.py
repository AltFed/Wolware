import io
import json as _json
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
        from reportlab.lib.enums import TA_CENTER, TA_RIGHT
        from reportlab.pdfgen import canvas as rl_canvas
    except ImportError:
        raise RuntimeError("reportlab non installato")

    buf = io.BytesIO()

    C_BLU    = colors.HexColor('#1e3a5f')
    C_TEAL   = colors.HexColor('#2c7a7b')
    C_LIGHT  = colors.HexColor('#eff6ff')
    C_HEADER = colors.HexColor('#2d3748')
    C_ALT    = colors.HexColor('#f7fafc')
    C_ROSSO  = colors.HexColor('#c53030')
    C_VERDE  = colors.HexColor('#276749')
    C_BORDER = colors.HexColor('#e2e8f0')
    C_MUTED  = colors.HexColor('#718096')
    C_DARK   = colors.HexColor('#2d3748')

    W, H = A4
    ML = MR = 1.8 * cm
    MT = 1.8 * cm
    MB = 1.5 * cm
    CONTENT_W = W - ML - MR

    rs   = ditta.get('ragione_sociale', '')
    oggi_d = date.today()
    oggi = f"{oggi_d.day}/{oggi_d.month}/{oggi_d.year}"

    if periodo == 'mese' and anno and mese:
        label_periodo = f"{NOMI_MESI[int(mese)-1]} {anno}"
    elif periodo == 'range' and anno and da_mese and a_mese:
        label_periodo = f"{NOMI_MESI[int(da_mese)-1][:3]}-{NOMI_MESI[int(a_mese)-1][:3]} {anno}"
    elif periodo == 'storico':
        label_periodo = 'Storico completo'
    else:
        label_periodo = f"Anno {anno}"

    # Info cliente (usa i campi corretti del DB)
    def _fmt_data(s):
        try:
            bits = s.split('-')
            return f"{int(bits[2])}/{int(bits[1])}/{bits[0]}"
        except Exception:
            return s

    inizio_paghe = ditta.get('inizio_paghe', '')
    inizio_cont  = ditta.get('inizio_contabilita', '')
    info_cliente = ''
    if inizio_paghe:
        info_cliente += f"Cliente Paghe dal {_fmt_data(inizio_paghe)}"
    if inizio_cont:
        sep = ' | ' if info_cliente else ''
        info_cliente += f"{sep}Cliente Contabilità dal {_fmt_data(inizio_cont)}"

    # Totals
    esente     = sum(float(p.get('importo') or 0) for p in pratiche if p.get('esente_iva'))
    imponibile = sum(float(p.get('importo') or 0) for p in pratiche if not p.get('esente_iva'))
    iva_tot    = round(imponibile * 0.22, 2)
    dovuto     = round(imponibile + iva_tot + esente, 2)
    tot_pag    = sum(float(p.get('importo') or 0) for p in pagamenti)
    tot_arrot  = sum(
        float(a.get('importo') or 0) if a.get('tipo') == 'addebito'
        else -float(a.get('importo') or 0)
        for a in arrotondamenti
    )
    saldo_finale = round(residuo + dovuto - tot_pag + tot_arrot, 2)

    def _saldo_etichetta(v):
        if v > 0: return 'DA PAGARE'
        if v < 0: return 'A CREDITO'
        return 'PARI'

    # Per-month lookup
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
                g[nome] = {'qty': 0, 'prezzo': float(v.get('importo') or 0), 'esente': v.get('esente_iva', 0)}
            g[nome]['qty'] += 1
        return g

    # Style factory
    def sty(name, **kw):
        base = dict(fontName='Helvetica', fontSize=9, leading=13, textColor=C_DARK)
        base.update(kw)
        return ParagraphStyle(name, **base)

    S_TITLE  = sty('title',  fontSize=18, fontName='Helvetica-Bold', textColor=C_BLU, leading=22, alignment=TA_CENTER)
    S_SUB    = sty('sub',    fontSize=13, fontName='Helvetica-Bold', textColor=C_DARK, leading=16, alignment=TA_CENTER)
    S_PERIOD = sty('period', fontSize=10, textColor=C_MUTED, leading=13, alignment=TA_CENTER)
    S_INFO   = sty('info',   fontSize=8,  textColor=C_MUTED, alignment=TA_CENTER)
    S_H2     = sty('h2',     fontSize=10, fontName='Helvetica-Bold', textColor=C_DARK, leading=14, spaceBefore=6, spaceAfter=3)
    S_BODY   = sty('body',   fontSize=9)
    S_SMALL  = sty('small',  fontSize=8,  textColor=C_MUTED)
    S_ROSSO  = sty('rosso',  fontSize=9,  fontName='Helvetica-Bold', textColor=C_ROSSO)
    S_VERDE  = sty('verde',  fontSize=9,  fontName='Helvetica-Bold', textColor=C_VERDE)

    # ── NumberedCanvas per "Pagina X di N" ────────────────────────
    class _NumCanvas(rl_canvas.Canvas):
        def __init__(self, *args, **kwargs):
            rl_canvas.Canvas.__init__(self, *args, **kwargs)
            self._saved = []

        def showPage(self):
            self._saved.append(dict(self.__dict__))
            self._startPage()

        def save(self):
            n = len(self._saved)
            for i, state in enumerate(self._saved, 1):
                self.__dict__.update(state)
                self._disegna_footer(i, n)
                rl_canvas.Canvas.showPage(self)
            rl_canvas.Canvas.save(self)

        def _disegna_footer(self, pag, tot):
            self.saveState()
            self.setStrokeColor(C_BORDER)
            self.setLineWidth(0.5)
            self.line(ML, MB - 0.3 * cm, W - MR, MB - 0.3 * cm)
            self.setFont('Helvetica', 7)
            self.setFillColor(C_MUTED)
            if formato == 'sintetico':
                pag_str = f"Pag. {pag}/{tot}"
            else:
                pag_str = f"Pagina {pag} di {tot}"
            footer = f"{rs}  |  {label_periodo}  |  {pag_str}  |  {oggi}"
            self.drawCentredString(W / 2, MB - 0.55 * cm, footer)
            self.restoreState()

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

    # ══════════════════════════════════════════════════════════════
    #  SINTETICO
    # ══════════════════════════════════════════════════════════════
    if formato == 'sintetico':

        # Header bicolonna
        left_text = (
            f'<font size="16" color="#1e3a5f"><b>ESTRATTO CONTO</b></font><br/>'
            f'<font size="10" color="#718096">{label_periodo}</font>'
        )
        right_text = f'<font size="12" color="#1e3a5f"><b>{rs}</b></font>'
        if info_cliente:
            right_text += f'<br/><font size="8" color="#718096">{info_cliente}</font>'

        t_head = Table(
            [[Paragraph(left_text, sty('hl', leading=22)),
              Paragraph(right_text, sty('hr', leading=20, alignment=TA_RIGHT))]],
            colWidths=[CONTENT_W * 0.50, CONTENT_W * 0.50]
        )
        t_head.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ]))
        story.append(t_head)
        story.append(HRFlowable(width=CONTENT_W, thickness=1.5, color=C_BLU, spaceAfter=8))

        # 4 card statistiche
        saldo_sin  = saldo_finale
        residuo_c  = '#c53030' if residuo > 0 else ('#276749' if residuo < 0 else '#2d3748')
        saldo_c    = '#c53030' if saldo_sin > 0 else ('#276749' if saldo_sin < 0 else '#2d3748')

        def _card(label, value, vcolor, prefix=''):
            val_str = f"{prefix}{_eur(abs(value))}"
            return Paragraph(
                f'<font size="7" color="#718096">{label}</font><br/>'
                f'<font size="10" color="{vcolor}"><b>{val_str}</b></font>',
                sty(f'c_{label[:4]}', leading=18)
            )

        cards_row = [
            _card("RESIDUO ANNI PREC.", residuo, residuo_c),
            _card("DOVUTO PERIODO",     dovuto,  '#2d3748'),
            _card("PAGAMENTI",          tot_pag, '#276749' if tot_pag > 0 else '#2d3748', prefix='- '),
            _card("SALDO ATTUALE",      saldo_sin, saldo_c),
        ]
        t_cards = Table([cards_row], colWidths=[CONTENT_W / 4] * 4)
        t_cards.setStyle(TableStyle([
            ('BOX',           (0, 0), (-1, -1), 0.5, C_BORDER),
            ('INNERGRID',     (0, 0), (-1, -1), 0.5, C_BORDER),
            ('BACKGROUND',    (0, 0), (2,  0),  C_ALT),
            ('BACKGROUND',    (3, 0), (3,  0),  C_LIGHT),
            ('TOPPADDING',    (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING',   (0, 0), (-1, -1), 10),
            ('RIGHTPADDING',  (0, 0), (-1, -1), 8),
            ('VALIGN',        (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(t_cards)
        story.append(Spacer(1, 0.3 * cm))

        # ── Tabella movimenti sintetico ────────────────────────────
        # Calcolo progressivo: per ogni mese, prima applico pagamenti poi competenze.
        # In display (reverse chrono) mostro: comp row (sopra) poi pagamenti (sotto).
        events_by_month = {}
        sp = residuo
        for m in range(1, 13):
            voci_m = pratiche_per_mese.get(m, [])
            pag_m  = pagamenti_per_mese.get(m, [])
            if not voci_m and not pag_m:
                continue
            month_ev = []
            for p in pag_m:
                imp = float(p.get('importo', 0))
                sp  = round(sp - imp, 2)
                month_ev.append(('pag', p, imp, sp))
            if voci_m:
                c = sum(float(v.get('importo') or 0) for v in voci_m)
                e = sum(float(v.get('importo') or 0) for v in voci_m if v.get('esente_iva'))
                comp_iva = round((c - e) * 1.22 + e, 2)
                sp = round(sp + comp_iva, 2)
                month_ev.append(('comp', voci_m, comp_iva, sp))
            events_by_month[m] = month_ev

        righe_sin = [['PERIODO', 'DESCRIZIONE', 'IMPORTO', 'SALDO PROGR.']]

        for m in sorted(events_by_month.keys(), reverse=True):
            for ev_type, data, importo, saldo_ev in reversed(events_by_month[m]):
                if ev_type == 'comp':
                    g = _group_voci(data)
                    bullet_lines = []
                    tot_sin = 0
                    for nome, info in g.items():
                        qty = info['qty']
                        prz = info['prezzo']
                        imp_v = round(qty * prz, 2)
                        iva_v = 0 if info['esente'] else round(imp_v * 0.22, 2)
                        tot_sin += imp_v + iva_v
                        iva_s = '(esente IVA)' if info['esente'] else f'+ IVA {_eur(iva_v)}'
                        qs = f' x{qty}' if qty > 1 else ''
                        bullet_lines.append(f"• {nome}{qs} {_eur(imp_v)} {iva_s}")
                    righe_sin.append([
                        Paragraph(f"<b>{NOMI_MESI[m-1][:3]} {anno}</b>", S_BODY),
                        Paragraph('<br/>'.join(bullet_lines), S_SMALL),
                        Paragraph(f"<b>{_eur(tot_sin)}</b>", S_BODY),
                        Paragraph(f"<b>{_eur(saldo_ev)}</b>", S_ROSSO if saldo_ev > 0 else S_VERDE),
                    ])
                else:  # pagamento
                    p = data
                    metodo = p.get('metodo', '') or ''
                    note_p = p.get('note', '') or ''
                    desc = metodo
                    if note_p:
                        desc += f" - {note_p}"
                    try:
                        bits = p['data'].split('-')
                        dfmt = f"{bits[2].lstrip('0')}/{bits[1]}/{bits[0]}"
                    except Exception:
                        dfmt = p.get('data', '')
                    righe_sin.append([
                        Paragraph(dfmt, S_SMALL),
                        Paragraph(desc, S_SMALL),
                        Paragraph(f"<b>- {_eur(importo)}</b>", S_VERDE),
                        Paragraph(f"<b>{_eur(saldo_ev)}</b>", S_ROSSO if saldo_ev > 0 else S_VERDE),
                    ])

        if residuo != 0:
            righe_sin.append([
                Paragraph('<b>Residuo Anni Prec.</b>', S_BODY),
                Paragraph('', S_SMALL),
                Paragraph('', S_BODY),
                Paragraph(f'<b>{_eur(residuo)}</b>', S_ROSSO if residuo > 0 else S_VERDE),
            ])

        CW2 = CONTENT_W / 4
        t_sin = Table(righe_sin, colWidths=[CW2 * 0.8, CW2 * 1.6, CW2 * 0.8, CW2 * 0.8])
        t_sin.setStyle(TableStyle([
            ('BACKGROUND',    (0, 0), (-1, 0),  C_HEADER),
            ('TEXTCOLOR',     (0, 0), (-1, 0),  colors.white),
            ('FONTNAME',      (0, 0), (-1, 0),  'Helvetica-Bold'),
            ('FONTSIZE',      (0, 0), (-1, -1), 8),
            ('ROWBACKGROUNDS',(0, 1), (-1, -1), [colors.white, C_ALT]),
            ('GRID',          (0, 0), (-1, -1), 0.3, C_BORDER),
            ('ALIGN',         (2, 0), (-1, -1), 'RIGHT'),
            ('VALIGN',        (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING',    (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(t_sin)

    # ══════════════════════════════════════════════════════════════
    #  COMPLETO
    # ══════════════════════════════════════════════════════════════
    else:
        # ── PAG 1: COPERTINA ──────────────────────────────────────
        story.append(Spacer(1, 0.6 * cm))
        story.append(Paragraph("ESTRATTO CONTO", S_TITLE))
        story.append(Paragraph(f"<b>{rs}</b>", S_SUB))
        story.append(Spacer(1, 0.15 * cm))
        story.append(Paragraph(f"Periodo: {label_periodo}", S_PERIOD))
        if info_cliente:
            story.append(Paragraph(info_cliente, S_INFO))
        story.append(Spacer(1, 0.5 * cm))
        story.append(HRFlowable(width=CONTENT_W, thickness=0.8, color=C_BORDER, spaceAfter=12))

        col_l = CONTENT_W * 0.62
        col_r = CONTENT_W * 0.38
        riepilogo_rows = []

        if residuo != 0:
            riepilogo_rows.append([
                Paragraph("Residuo anni precedenti", S_BODY),
                Paragraph(f"<b>{_eur(residuo)}</b>", S_ROSSO if residuo > 0 else S_VERDE)
            ])

        # Etichetta pagamenti con data fine periodo
        if periodo == 'anno' or (not periodo) or periodo == 'storico':
            pag_label = f"Pagamenti ricevuti (al 31/12/{anno})"
        else:
            pag_label = "Pagamenti ricevuti"

        riepilogo_rows += [
            [Paragraph(f"Competenze periodo ({label_periodo})", S_BODY),
             Paragraph(f"<b>{_eur(dovuto)}</b>", S_BODY)],
            [Paragraph(pag_label, S_BODY),
             Paragraph(f"<b>- {_eur(tot_pag)}</b>", S_VERDE if tot_pag > 0 else S_BODY)],
        ]

        n_r = len(riepilogo_rows)
        saldo_col = C_ROSSO if saldo_finale > 0 else (C_VERDE if saldo_finale < 0 else C_DARK)
        riepilogo_rows.append([
            Paragraph("<b>SALDO ATTUALE</b>",
                      sty('sbld', fontName='Helvetica-Bold', fontSize=11)),
            Paragraph(
                f"<b>{_eur(abs(saldo_finale))}</b><br/>"
                f"<font size='9'>{_saldo_etichetta(saldo_finale)}</font>",
                sty('saldo_v', fontName='Helvetica-Bold', fontSize=12,
                    alignment=TA_RIGHT, textColor=saldo_col, leading=18)
            )
        ])

        t_riepilogo = Table(riepilogo_rows, colWidths=[col_l, col_r])
        t_riepilogo.setStyle(TableStyle([
            ('FONTSIZE',      (0, 0),  (-1, -1),  9),
            ('TOPPADDING',    (0, 0),  (-1, -1),  5),
            ('BOTTOMPADDING', (0, 0),  (-1, -1),  5),
            ('ALIGN',         (1, 0),  (-1, -1),  'RIGHT'),
            ('GRID',          (0, 0),  (-1, n_r-1), 0.3, C_BORDER),
            ('LINEABOVE',     (0, n_r), (-1, n_r), 1.5, C_BLU),
            ('LINEBELOW',     (0, n_r), (-1, n_r), 1.5, C_BLU),
            ('BACKGROUND',    (0, n_r), (-1, n_r), C_LIGHT),
            ('TOPPADDING',    (0, n_r), (-1, n_r), 8),
            ('BOTTOMPADDING', (0, n_r), (-1, n_r), 8),
        ]))
        story.append(t_riepilogo)
        story.append(Spacer(1, 0.3 * cm))
        story.append(Paragraph(
            f"Dettaglio: Imponibile {_eur(imponibile)} + IVA 22% {_eur(iva_tot)} + Esente {_eur(esente)}",
            sty('det', fontSize=8, textColor=C_MUTED, alignment=TA_CENTER)
        ))

        # ── PAG 2: RIEPILOGO MOVIMENTI ────────────────────────────
        story.append(PageBreak())
        story.append(Paragraph("RIEPILOGO MOVIMENTI", S_H2))
        story.append(Spacer(1, 0.1 * cm))

        if residuo != 0:
            story.append(Paragraph(
                f"Saldo iniziale (residuo anni precedenti): <b>{_eur(residuo)}</b>",
                S_BODY
            ))
            story.append(Spacer(1, 0.2 * cm))

        righe_mov = [['MESE', 'COMPETENZE', 'PAGAMENTI', 'SALDO PROGR.']]
        sp        = residuo
        tot_comp  = 0.0
        tot_pag_t = 0.0

        for m in range(1, 13):
            voci_m = pratiche_per_mese.get(m, [])
            pag_m  = pagamenti_per_mese.get(m, [])

            c = sum(float(v.get('importo') or 0) for v in voci_m)
            e = sum(float(v.get('importo') or 0) for v in voci_m if v.get('esente_iva'))
            comp_iva  = round((c - e) * 1.22 + e, 2)
            pag_m_tot = sum(float(p.get('importo') or 0) for p in pag_m)

            sp = round(sp + comp_iva - pag_m_tot, 2)
            tot_comp  += comp_iva
            tot_pag_t += pag_m_tot

            pag_str = ''
            if pag_m:
                parti = []
                for p in pag_m:
                    try:
                        bits = p['data'].split('-')
                        # mantieni lo zero del mese: "27/02"
                        dfmt = f"{bits[2].lstrip('0')}/{bits[1]}"
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

        tot_comp  = round(tot_comp, 2)
        tot_pag_t = round(tot_pag_t, 2)
        righe_mov.append(['TOTALE', _eur(tot_comp), _eur(tot_pag_t), ''])

        saldo_lbl = _saldo_etichetta(saldo_finale)
        righe_mov.append([
            Paragraph(
                f"<b>SALDO FINALE: {_eur(saldo_finale)} {saldo_lbl}</b>",
                S_ROSSO if saldo_finale > 0 else S_VERDE
            ),
            '', '', ''
        ])

        CW  = CONTENT_W / 4
        n_m = len(righe_mov)
        t_mov = Table(righe_mov, colWidths=[CW * 1.2, CW * 0.9, CW * 1.1, CW * 0.8])
        t_mov.setStyle(TableStyle([
            ('BACKGROUND',    (0, 0),      (-1, 0),       C_HEADER),
            ('TEXTCOLOR',     (0, 0),      (-1, 0),       colors.white),
            ('FONTNAME',      (0, 0),      (-1, 0),       'Helvetica-Bold'),
            ('FONTSIZE',      (0, 0),      (-1, -1),      8.5),
            ('ROWBACKGROUNDS',(0, 1),      (-1, n_m - 3), [colors.white, C_ALT]),
            ('GRID',          (0, 0),      (-1, n_m - 3), 0.3, C_BORDER),
            ('ALIGN',         (1, 0),      (-1, -1),      'RIGHT'),
            ('TOPPADDING',    (0, 0),      (-1, -1),      4),
            ('BOTTOMPADDING', (0, 0),      (-1, -1),      4),
            ('FONTNAME',      (0, n_m-2),  (-1, n_m-2),   'Helvetica-Bold'),
            ('LINEABOVE',     (0, n_m-2),  (-1, n_m-2),   1, C_BLU),
            ('BACKGROUND',    (0, n_m-2),  (-1, n_m-2),   C_LIGHT),
            ('SPAN',          (0, n_m-1),  (-1, n_m-1)),
            ('BACKGROUND',    (0, n_m-1),  (-1, n_m-1),   C_LIGHT),
            ('TOPPADDING',    (0, n_m-1),  (-1, n_m-1),   6),
            ('BOTTOMPADDING', (0, n_m-1),  (-1, n_m-1),   6),
        ]))
        story.append(t_mov)

        # ── PAG 3+: DETTAGLIO COMPETENZE ──────────────────────────
        story.append(PageBreak())
        story.append(Paragraph("DETTAGLIO COMPETENZE", S_H2))
        story.append(Spacer(1, 0.2 * cm))

        for m in sorted(pratiche_per_mese.keys(), reverse=True):
            voci_m = pratiche_per_mese[m]
            e_m = sum(float(v.get('importo') or 0) for v in voci_m if v.get('esente_iva'))
            i_m = sum(float(v.get('importo') or 0) for v in voci_m) - e_m
            tot_m = round(i_m * 1.22 + e_m, 2)

            # Saldo a fine mese (calcolo cumulativo)
            saldo_fine = residuo
            for mm in range(1, m + 1):
                vv = pratiche_per_mese.get(mm, [])
                pp = pagamenti_per_mese.get(mm, [])
                c2 = sum(float(v.get('importo') or 0) for v in vv)
                e2 = sum(float(v.get('importo') or 0) for v in vv if v.get('esente_iva'))
                saldo_fine += round((c2 - e2) * 1.22 + e2, 2)
                saldo_fine -= sum(float(p.get('importo') or 0) for p in pp)
                saldo_fine = round(saldo_fine, 2)

            # Intestazione mese: NOME MESE + ANNO a sinistra, Totale a destra
            mese_nome = f"{NOMI_MESI[m-1].upper()} {anno}"
            t_mh = Table(
                [[Paragraph(f"<b>{mese_nome}</b>", S_H2),
                  Paragraph(f"Totale: <b>{_eur(tot_m)}</b>",
                            sty('mh_r', fontSize=9, alignment=TA_RIGHT))]],
                colWidths=[CONTENT_W * 0.55, CONTENT_W * 0.45]
            )
            t_mh.setStyle(TableStyle([
                ('VALIGN',        (0, 0), (-1, -1), 'BOTTOM'),
                ('TOPPADDING',    (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
            ]))
            story.append(t_mh)

            # Righe voci: Nome | qty × prezzo | totale voce
            g = _group_voci(voci_m)
            righe_v = []
            for nome, info in g.items():
                qty   = info['qty']
                prz   = info['prezzo']
                iva_v = 0 if info['esente'] else round(prz * 0.22 * qty, 2)
                tot_v = qty * prz + iva_v
                # simbolo × unicode (U+00D7)
                qty_str = f"{qty} × {_eur(prz)}"
                righe_v.append([
                    Paragraph(nome, S_BODY),
                    Paragraph(qty_str,
                              sty('qty', fontSize=8.5, alignment=TA_RIGHT, textColor=C_MUTED)),
                    Paragraph(f"<b>{_eur(tot_v)}</b>",
                              sty('tv', fontSize=8.5, alignment=TA_RIGHT)),
                ])

            t_v = Table(righe_v, colWidths=[CONTENT_W * 0.46, CONTENT_W * 0.30, CONTENT_W * 0.24])
            t_v.setStyle(TableStyle([
                ('FONTSIZE',      (0, 0), (-1, -1), 8.5),
                ('TOPPADDING',    (0, 0), (-1, -1), 3),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
                ('ROWBACKGROUNDS',(0, 0), (-1, -1), [colors.white, C_ALT]),
                ('GRID',          (0, 0), (-1, -1), 0.3, C_BORDER),
            ]))
            story.append(t_v)

            # Riga IVA dettaglio (allineata a destra)
            story.append(Paragraph(
                f'<font color="#718096">Imponibile {_eur(i_m)} + IVA {_eur(round(i_m * 0.22, 2))}</font>',
                sty('iva_r', fontSize=8, alignment=TA_RIGHT, textColor=C_MUTED)
            ))

            # Pagamenti del mese
            for p in pagamenti_per_mese.get(m, []):
                try:
                    bits = p['data'].split('-')
                    dfmt = f"{bits[2].lstrip('0')}/{bits[1].lstrip('0')}/{bits[0]}"
                except Exception:
                    dfmt = p.get('data', '')
                story.append(Paragraph(
                    f'Pagamenti: <b>{dfmt} {_eur(p.get("importo", 0))}</b>',
                    S_BODY
                ))

            # Saldo al fine mese (allineato a destra)
            ultimo = _ultimo_giorno(anno, m)
            story.append(Paragraph(
                f"<font color='#718096'>Saldo al {ultimo}/{str(m).zfill(2)}/{anno}:</font>"
                f" <b>{_eur(saldo_fine)}</b>",
                sty('saldo_d', fontSize=8.5, alignment=TA_RIGHT)
            ))
            story.append(Spacer(1, 0.45 * cm))

        if residuo != 0:
            story.append(HRFlowable(width=CONTENT_W, thickness=0.5, color=C_BORDER))
            story.append(Spacer(1, 0.1 * cm))
            story.append(Paragraph(
                f"SALDO INIZIALE (Residuo anni precedenti)  <b>{_eur(residuo)}</b>",
                S_BODY
            ))

    # ══════════════════════════════════════════════════════════════
    #  TARIFFARIO (comune a entrambi i formati)
    # ══════════════════════════════════════════════════════════════
    if tariffario:
        story.append(PageBreak())
        story.append(Paragraph("TARIFFARIO APPLICATO", S_H2))
        story.append(Spacer(1, 0.2 * cm))

        if formato == 'sintetico':
            # Tariffario con gruppi tipo e mesi (come sample sintetico)
            story.append(Paragraph(f"<b>{rs}</b>",
                                   sty('rs_t', fontSize=11, fontName='Helvetica-Bold', textColor=C_BLU)))
            story.append(Spacer(1, 0.25 * cm))

            TIPO_ORDER = [
                'fisso_mensile', 'costi_fissi_mensili',
                'variabile_mensile', 'variabile', 'costi_variabili', 'costi_variabili_mensili',
                'variabile_annuale', 'fisso_annuale', 'costi_fissi_annuali',
            ]
            TIPO_LABELS = {
                'fisso_mensile':           'COSTI FISSI MENSILI',
                'costi_fissi_mensili':     'COSTI FISSI MENSILI',
                'variabile_mensile':       'COSTI VARIABILI MENSILI PAGHE',
                'variabile':               'COSTI VARIABILI',
                'costi_variabili':         'COSTI VARIABILI',
                'costi_variabili_mensili': 'COSTI VARIABILI MENSILI PAGHE',
                'variabile_annuale':       'COSTI FISSI ANNUALI PAGHE',
                'fisso_annuale':           'COSTI FISSI ANNUALI PAGHE',
                'costi_fissi_annuali':     'COSTI FISSI ANNUALI PAGHE',
            }

            gruppi = {}
            for v in tariffario:
                t  = v.get('tipo', 'altro')
                lb = TIPO_LABELS.get(t, t.upper().replace('_', ' '))
                gruppi.setdefault(lb, []).append(v)

            def _tipo_ord(lb):
                for k, vl in TIPO_LABELS.items():
                    if vl == lb:
                        return TIPO_ORDER.index(k) if k in TIPO_ORDER else 999
                return 999

            for lb in sorted(gruppi.keys(), key=_tipo_ord):
                story.append(Paragraph(
                    lb,
                    sty('tl', fontName='Helvetica-Bold', fontSize=8.5,
                        textColor=C_TEAL, spaceBefore=10, spaceAfter=2)
                ))
                righe_tar = []
                for v in gruppi[lb]:
                    mesi_json_str = v.get('mesi_json') or ''
                    mese_str = ''
                    if mesi_json_str:
                        try:
                            mesi_list = _json.loads(mesi_json_str)
                            if mesi_list:
                                mese_str = ', '.join(
                                    NOMI_MESI[int(mx) - 1]
                                    for mx in mesi_list if 1 <= int(mx) <= 12
                                )
                        except Exception:
                            pass
                    righe_tar.append([
                        Paragraph(v.get('nome', ''), S_BODY),
                        Paragraph(mese_str, S_SMALL),
                        Paragraph(_eur(v.get('prezzo', 0)),
                                  sty('pr', fontSize=9, alignment=TA_RIGHT)),
                    ])

                t_tar = Table(righe_tar,
                              colWidths=[CONTENT_W * 0.50, CONTENT_W * 0.25, CONTENT_W * 0.25])
                t_tar.setStyle(TableStyle([
                    ('FONTSIZE',      (0, 0), (-1, -1), 8.5),
                    ('TOPPADDING',    (0, 0), (-1, -1), 3),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
                    ('ROWBACKGROUNDS',(0, 0), (-1, -1), [colors.white, C_ALT]),
                    ('GRID',          (0, 0), (-1, -1), 0.3, C_BORDER),
                ]))
                story.append(t_tar)

        else:
            # Tariffario completo: tabella semplice Descrizione | Importo
            righe_tar = [['Descrizione', 'Importo']]
            for v in tariffario:
                righe_tar.append([
                    Paragraph(v.get('nome', ''), S_BODY),
                    Paragraph(_eur(v.get('prezzo', 0)),
                              sty('pr2', fontSize=9, alignment=TA_RIGHT)),
                ])

            t_tar = Table(righe_tar, colWidths=[CONTENT_W * 0.70, CONTENT_W * 0.30])
            t_tar.setStyle(TableStyle([
                ('BACKGROUND',    (0, 0), (-1, 0),  C_HEADER),
                ('TEXTCOLOR',     (0, 0), (-1, 0),  colors.white),
                ('FONTNAME',      (0, 0), (-1, 0),  'Helvetica-Bold'),
                ('FONTSIZE',      (0, 0), (-1, -1), 9),
                ('TOPPADDING',    (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                ('ALIGN',         (1, 0), (-1, -1), 'RIGHT'),
                ('ROWBACKGROUNDS',(0, 1), (-1, -1), [colors.white, C_ALT]),
                ('GRID',          (0, 0), (-1, -1), 0.3, C_BORDER),
            ]))
            story.append(t_tar)

    doc.build(story, canvasmaker=_NumCanvas)
    buf.seek(0)
    return buf
