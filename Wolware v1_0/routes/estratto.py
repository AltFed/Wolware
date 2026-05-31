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
    # SELECT senza COALESCE complessi: prendiamo i dati grezzi
    _base_select = '''
        SELECT
            p.*,
            dv.tipo AS dv_tipo,
            dv.macrogruppo_nome AS dv_macro,
            mg.tipo AS mg_tipo,
            mg.nome AS mg_nome
        FROM pratiche p
        LEFT JOIN ditta_voci dv ON dv.id = p.voce_id
        LEFT JOIN macrogruppi mg ON mg.id = COALESCE(p.macrogruppo_id, dv.macrogruppo_id)
    '''

    def _enrich(rows):
        out = []
        for r in rows:
            d = dict(r)
            
            # --- Risoluzione tipo ---
            tipo = None
            p_tipo = (d.get('tipo') or '').strip().lower()
            dv_tipo = (d.get('dv_tipo') or '').strip().lower()
            mg_tipo = (d.get('mg_tipo') or '').strip().lower()
            
            # 1) Se p_tipo non è vuoto e non è 'costo_fisso', usa quello
            if p_tipo and p_tipo != 'costo_fisso':
                tipo = p_tipo
            # 2) Altrimenti, se dv_tipo esiste, usalo
            elif dv_tipo:
                tipo = dv_tipo
            # 3) Altrimenti mg_tipo
            elif mg_tipo:
                tipo = mg_tipo
            # 4) Default
            else:
                tipo = 'altro'
            
            d['tipo'] = tipo
            
            # --- Macrogruppo (invariato) ---
            macro = (d.get('dv_macro') or '').strip()
            if not macro:
                macro = (d.get('mg_nome') or '').strip()
            if not macro:
                macro = (d.get('macrogruppo_nome') or '').strip()
            d['macrogruppo_nome'] = macro
            
            out.append(d)
        return out

    # Query uguali a prima, ma senza il tipo_resolved
    if periodo == 'storico':
        rows = db.execute(
            _base_select + ' WHERE p.ditta_id=? ORDER BY p.anno, p.mese',
            (ditta_id,)
        ).fetchall()
        return _enrich(rows)
    elif periodo == 'mese' and anno and mese:
        rows = db.execute(
            _base_select + ' WHERE p.ditta_id=? AND p.anno=? AND p.mese=?',
            (ditta_id, anno, mese)
        ).fetchall()
        return _enrich(rows)
    elif periodo == 'range' and anno and da_mese and a_mese:
        rows = db.execute(
            _base_select + '''
            WHERE p.ditta_id=? AND p.anno=? AND p.mese BETWEEN ? AND ?
            ORDER BY p.mese
            ''',
            (ditta_id, anno, da_mese, a_mese)
        ).fetchall()
        return _enrich(rows)
    else:
        rows = db.execute(
            _base_select + ' WHERE p.ditta_id=? AND p.anno=? ORDER BY p.mese',
            (ditta_id, anno)
        ).fetchall()
        return _enrich(rows)



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
        from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
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

    # Colori tag badge
    C_TAG_FISSO    = colors.HexColor('#3182ce')
    C_TAG_VAR      = colors.HexColor('#dd6b20')
    C_TAG_ANNUALE  = colors.HexColor('#805ad5')
    C_TAG_PAG      = colors.HexColor('#38a169')
    C_TAG_FISSO_BG = colors.HexColor('#ebf8ff')
    C_TAG_VAR_BG   = colors.HexColor('#fffaf0')
    C_TAG_ANN_BG   = colors.HexColor('#faf5ff')
    C_TAG_PAG_BG   = colors.HexColor('#f0fff4')

    W, H = A4
    ML = MR = 1.8 * cm
    MT = 1.8 * cm
    MB = 1.5 * cm
    CONTENT_W = W - ML - MR

    rs     = ditta.get('ragione_sociale', '')
    oggi_d = date.today()
    oggi   = f"{oggi_d.day}/{oggi_d.month}/{oggi_d.year}"

    if periodo == 'mese' and anno and mese:
        label_periodo = f"{NOMI_MESI[int(mese)-1]} {anno}"
    elif periodo == 'range' and anno and da_mese and a_mese:
        label_periodo = f"{NOMI_MESI[int(da_mese)-1][:3]}-{NOMI_MESI[int(a_mese)-1][:3]} {anno}"
    elif periodo == 'storico':
        label_periodo = 'Storico completo'
    else:
        label_periodo = f"Anno {anno}"

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
        info_cliente += f"Paghe dal {_fmt_data(inizio_paghe)}"
    if inizio_cont:
        sep = '  ·  ' if info_cliente else ''
        info_cliente += f"{sep}Contabilità dal {_fmt_data(inizio_cont)}"
    if anno:
        sep = '  ·  ' if info_cliente else ''
        info_cliente += f"{sep}{label_periodo}"

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

    def _infer_tipo(tipo, macrogruppo):
        if tipo:
            return tipo
        if not macrogruppo:
            return ''
        m = macrogruppo.lower()
        if any(k in m for k in ('annuali', 'annuale', 'annual')):
            if any(k in m for k in ('variab', 'richiesta')):
                return 'variabile_annuale'
            return 'costi_fissi_annuali'
        if any(k in m for k in ('variab', 'richiesta')):
            return 'costi_variabili_mensili'
        if any(k in m for k in ('fissi', 'fisso', 'mensil', 'fixed', 'costo')):
            return 'costi_fissi_mensili'
        return ''

    def _group_voci(voci):
        g = {}
        for v in voci:
            nome = v.get('nome', '')
            tipo = v.get('tipo', '')
            esente = v.get('esente_iva', 0)
            importo = float(v.get('importo') or 0)
            # Se hai campi quantita e prezzo, usali; altrimenti usa importo come totale
            qty = v.get('quantita', 1.0)  # se esiste, altrimenti 1
            prezzo_unitario = v.get('prezzo', importo / qty if qty else importo)
            
            chiave = f"{nome}___{importo}"
            if chiave not in g:
                g[chiave] = {
                    'qty': qty,
                    'prezzo': prezzo_unitario,
                    'importo_totale': importo,
                    'esente': esente,
                    'tipo': tipo,
                    'nome_display': nome,
                }
            else:
                g[chiave]['qty'] += qty
                g[chiave]['importo_totale'] = round(g[chiave]['importo_totale'] + importo, 2)
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

    # Mappa tipo -> (label badge, colore testo, colore sfondo)
    TIPO_TAG = {
        # valori pratiche.tipo
        'costo_fisso':             ('fisso',   C_TAG_FISSO,   C_TAG_FISSO_BG),
        'costo_fisso_mensile':     ('fisso',   C_TAG_FISSO,   C_TAG_FISSO_BG),
        'costo_fisso_annuale':     ('annuale', C_TAG_ANNUALE, C_TAG_ANN_BG),
        'costo_variabile':         ('variab.', C_TAG_VAR,     C_TAG_VAR_BG),
        'a_richiesta':             ('annuale', C_TAG_ANNUALE, C_TAG_ANN_BG),
        # valori ditta_voci.tipo
        'fisso_mensile':           ('fisso',   C_TAG_FISSO,   C_TAG_FISSO_BG),
        'costi_fissi_mensili':     ('fisso',   C_TAG_FISSO,   C_TAG_FISSO_BG),
        'variabile_mensile':       ('variab.', C_TAG_VAR,     C_TAG_VAR_BG),
        'variabile':               ('variab.', C_TAG_VAR,     C_TAG_VAR_BG),
        'costi_variabili':         ('variab.', C_TAG_VAR,     C_TAG_VAR_BG),
        'costi_variabili_mensili': ('variab.', C_TAG_VAR,     C_TAG_VAR_BG),
        'variabile_annuale':       ('annuale', C_TAG_ANNUALE, C_TAG_ANN_BG),
        'fisso_annuale':           ('annuale', C_TAG_ANNUALE, C_TAG_ANN_BG),
        'costi_fissi_annuali':     ('annuale', C_TAG_ANNUALE, C_TAG_ANN_BG),
    }

    def _tipo_label(tipo):
        return TIPO_TAG.get(tipo, ('', C_MUTED, colors.white))

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
                footer = f"{rs}  |  {label_periodo}  |  Estratto Conto {pag_str}  |  {oggi}"
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
    #  SINTETICO — Versione B: schede mensili con tag categoria
    # ══════════════════════════════════════════════════════════════
    if formato == 'sintetico':

        # ── HEADER BOX scuro con nome cliente e saldo pill ────────
        saldo_c_hex = '#c53030' if saldo_finale > 0 else ('#276749' if saldo_finale < 0 else '#2d3748')

        nome_par = Paragraph(
            f'<font size="16" color="white"><b>{rs}</b></font><br/>'
            f'<font size="8" color="#a0aec0">{info_cliente}</font>',
            sty('hdr_nome', leading=22, textColor=colors.white)
        )
        saldo_par = Paragraph(
            f'<font size="9" color="white"><b>Saldo: {"-" if saldo_finale < 0 else ""}{_eur(abs(saldo_finale))}</b></font>',
            sty('hdr_saldo', alignment=TA_RIGHT, textColor=colors.white, leading=14)
        )

        t_hdr = Table(
            [[nome_par, saldo_par]],
            colWidths=[CONTENT_W * 0.65, CONTENT_W * 0.35]
        )
        t_hdr.setStyle(TableStyle([
            ('BACKGROUND',    (0, 0), (-1, -1), C_BLU),
            ('VALIGN',        (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING',    (0, 0), (-1, -1), 14),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 14),
            ('LEFTPADDING',   (0, 0), (0,  0),  14),
            ('RIGHTPADDING',  (-1, 0),(-1, 0),  14),
            ('ROUNDEDCORNERS',[6, 6, 6, 6]),
        ]))
        story.append(t_hdr)
        story.append(Spacer(1, 0.35 * cm))

        # ── 4 CARD STATISTICHE ────────────────────────────────────
        residuo_c_hex = '#c53030' if residuo > 0 else ('#276749' if residuo < 0 else '#2d3748')
        saldo_c_hex2  = '#c53030' if saldo_finale > 0 else ('#276749' if saldo_finale < 0 else '#2d3748')

        def _card_b(label, value, vcolor_hex, prefix=''):
            val_str = f"{prefix}{_eur(abs(value))}"
            return Paragraph(
                f'<font size="7" color="#718096">{label}</font><br/>'
                f'<font size="11" color="{vcolor_hex}"><b>{val_str}</b></font>',
                sty(f'cb_{label[:4]}', leading=20)
            )

        cards_row = [
            _card_b("Residuo anni prec.",  residuo,      residuo_c_hex),
            _card_b("Dovuto periodo",      dovuto,       '#2d3748'),
            _card_b("Pagamenti",           tot_pag,      '#276749' if tot_pag > 0 else '#2d3748', prefix='-'),
            _card_b("Saldo attuale",       saldo_finale, saldo_c_hex2),
        ]
        t_cards = Table([cards_row], colWidths=[CONTENT_W / 4] * 4)
        t_cards.setStyle(TableStyle([
            ('BOX',           (0, 0), (-1, -1), 0.8, C_BORDER),
            ('INNERGRID',     (0, 0), (-1, -1), 0.8, C_BORDER),
            ('BACKGROUND',    (0, 0), (-1, -1), colors.white),
            ('TOPPADDING',    (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ('LEFTPADDING',   (0, 0), (-1, -1), 12),
            ('RIGHTPADDING',  (0, 0), (-1, -1), 8),
            ('VALIGN',        (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(t_cards)
        story.append(Spacer(1, 0.45 * cm))

        # ── SCHEDE MENSILI ────────────────────────────────────────
        # Calcolo saldo progressivo cronologico
        saldo_prog = {}
        sp = residuo
        for m in range(1, 13):
            voci_m = pratiche_per_mese.get(m, [])
            pag_m  = pagamenti_per_mese.get(m, [])
            if voci_m:
                c = sum(float(v.get('importo') or 0) for v in voci_m)
                e = sum(float(v.get('importo') or 0) for v in voci_m if v.get('esente_iva'))
                sp = round(sp + (c - e) * 1.22 + e, 2)
            for p in pag_m:
                sp = round(sp - float(p.get('importo', 0)), 2)
            saldo_prog[m] = sp

        for m in sorted(pratiche_per_mese.keys(), reverse=True):
            voci_m = pratiche_per_mese[m]
            pag_m  = pagamenti_per_mese.get(m, [])

            e_m   = sum(float(v.get('importo') or 0) for v in voci_m if v.get('esente_iva'))
            i_m   = sum(float(v.get('importo') or 0) for v in voci_m) - e_m
            tot_m = round(i_m * 1.22 + e_m, 2)
            sp_m  = saldo_prog[m]

            # Intestazione scheda mese
            mese_nome = f"{NOMI_MESI[m-1]} {anno}"
            t_mh = Table(
                [[Paragraph(f"<b>{mese_nome}</b>", sty('mh_l', fontSize=11, fontName='Helvetica-Bold', textColor=C_DARK)),
                  Paragraph(f"<b>{_eur(tot_m)}</b>", sty('mh_r', fontSize=11, fontName='Helvetica-Bold', alignment=TA_RIGHT, textColor=C_DARK))]],
                colWidths=[CONTENT_W * 0.60, CONTENT_W * 0.40]
            )
            t_mh.setStyle(TableStyle([
                ('BACKGROUND',    (0, 0), (-1, -1), colors.white),
                ('TOPPADDING',    (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('LEFTPADDING',   (0, 0), (0,  0),  10),
                ('RIGHTPADDING',  (-1,0), (-1, 0),  10),
                ('LINEBELOW',     (0, 0), (-1, 0),  0.5, C_BORDER),
                ('BOX',           (0, 0), (-1, 0),  0.8, C_BORDER),
            ]))
            story.append(t_mh)

            # Mappa tipo -> (label badge UI, colori hex testo/sfondo)
            # Copre sia i valori di pratiche.tipo sia di ditta_voci.tipo
            TIPO_BADGE = {
                # valori pratiche.tipo
                'costo_fisso':              ('COSTO FISSO',  '#2b6cb0', '#ebf8ff'),
                'costo_fisso_mensile':      ('COSTO FISSO',  '#2b6cb0', '#ebf8ff'),
                'costo_fisso_annuale':      ('COSTO ANNUALE','#553c9a', '#faf5ff'),
                'costo_variabile':          ('VARIABILE',    '#276749', '#f0fff4'),
                'variabile':                ('VARIABILE',    '#276749', '#f0fff4'),
                'a_richiesta':              ('A RICHIESTA',  '#744210', '#fffaf0'),
                # valori ditta_voci.tipo
                'fisso_mensile':            ('COSTO FISSO',  '#2b6cb0', '#ebf8ff'),
                'costi_fissi_mensili':      ('COSTO FISSO',  '#2b6cb0', '#ebf8ff'),
                'variabile_mensile':        ('VARIABILE',    '#276749', '#f0fff4'),
                'costi_variabili':          ('VARIABILE',    '#276749', '#f0fff4'),
                'costi_variabili_mensili':  ('VARIABILE',    '#276749', '#f0fff4'),
                'variabile_annuale':        ('A RICHIESTA',  '#744210', '#fffaf0'),
                'fisso_annuale':            ('COSTO ANNUALE','#553c9a', '#faf5ff'),
                'costi_fissi_annuali':      ('COSTO ANNUALE','#553c9a', '#faf5ff'),
                # NUOVE CHIAVI PER LE TUE PRATICHE
                'costi_variabili_annuali':  ('A RICHIESTA',  '#744210', '#ffedd5'),
                'costi_variabili_annuali':  ('A RICHIESTA',  '#744210', '#ffedd5'),  # (doppia per sicurezza)
                # varianti con spazi
                'costo fisso':              ('COSTO FISSO',  '#2b6cb0', '#ebf8ff'),
                'costo annuale':            ('COSTO ANNUALE','#553c9a', '#faf5ff'),
                'a richiesta':              ('A RICHIESTA',  '#744210', '#ffedd5'),
                'variabile annuale':        ('A RICHIESTA',  '#744210', '#ffedd5'),
                'altro':                    ('ALTRO',        '#718096', '#f7fafc'),
            }

            def _badge_par(tipo, esente, key_suffix):
                badge_label, badge_fg, badge_bg = TIPO_BADGE.get(
                    tipo, ('', '#718096', '#f7fafc')
                )
                parts = []
                if badge_label:
                    parts.append(
                        f'<font size="7" color="{badge_fg}"><b>{badge_label}</b></font>'
                    )
                if esente:
                    parts.append(
                        f'<font size="7" color="#276749"><b>ESENTE IVA</b></font>'
                    )
                if not parts:
                    return Paragraph('', sty(f'bdg_{key_suffix}', fontSize=7))
                return Paragraph('<br/>'.join(parts),
                                 sty(f'bdg_{key_suffix}', fontSize=7, leading=10))

            # Header colonne tabella voci — 8 colonne con Tipo
            col_header = [
                Paragraph('<b>Tipo</b>',   sty('ch_t', fontSize=7.5, textColor=C_MUTED)),
                Paragraph('<b>Voce</b>',   sty('ch0',  fontSize=7.5, textColor=C_MUTED)),
                Paragraph('<b>Unit.</b>',  sty('ch1',  fontSize=7.5, textColor=C_MUTED, alignment=TA_RIGHT)),
                Paragraph('<b>Qtà</b>',    sty('ch2',  fontSize=7.5, textColor=C_MUTED, alignment=TA_RIGHT)),
                Paragraph('<b>Impon.</b>', sty('ch3',  fontSize=7.5, textColor=C_MUTED, alignment=TA_RIGHT)),
                Paragraph('<b>IVA</b>',    sty('ch4',  fontSize=7.5, textColor=C_MUTED, alignment=TA_RIGHT)),
                Paragraph('<b>Dovuto</b>', sty('ch5',  fontSize=7.5, textColor=C_MUTED, alignment=TA_RIGHT)),
                Paragraph('<b>Saldo</b>',  sty('ch6',  fontSize=7.5, textColor=C_MUTED, alignment=TA_RIGHT)),
            ]

            # Saldo di partenza = fine mese precedente
            saldo_riga = saldo_prog.get(m - 1, residuo) if m > 1 else residuo

            righe_voci = [col_header]
            # indici riga per colorare i badge (escludendo header)
            badge_row_styles = []

            # Costruiamo la sequenza cronologica: prima le voci, poi i pagamenti
            # (come mostrato nella versione_b_schede: competenze -> pagamento a fine)
            g = _group_voci(voci_m)
            # Costruzione righe della tabella per le voci di costo (sintetico)
            for nome, info in g.items():
                qty    = info['qty']
                prz    = info['prezzo']
                imp_v  = info.get('importo_totale', round(qty * prz, 2))
                iva_v  = 0.0 if info['esente'] else round(imp_v * 0.22, 2)
                dov_v  = round(imp_v + iva_v, 2)
                saldo_riga = round(saldo_riga + dov_v, 2)
                tipo   = info.get('tipo', '')
                esente = bool(info.get('esente'))

                # --- Mappa per i badge (aggiunta chiave 'altro' di default) ---
                TIPO_BADGE.setdefault('altro', ('ALTRO', '#718096', '#f7fafc'))

                # Ottieni badge (label, colore testo, sfondo)
                badge_label, badge_fg, badge_bg = TIPO_BADGE.get(
                    tipo if tipo else 'altro', 
                    ('ALTRO', '#718096', '#f7fafc')
                )
                
                # --- Costruzione della descrizione arricchita ---
                # Mostra: "Nome voce (Qtà × Prezzo unitario)"
                descrizione_arricchita = f"{nome} ({qty} × {_eur(prz)})"
                voce_par = Paragraph(descrizione_arricchita, 
                                    sty(f'vn_{nome[:6]}_{qty}', fontSize=8.5, textColor=C_DARK))

                # --- Badge HTML (colonna Tipo) ---
                badge_cell = Paragraph(
                    f'<font size="7" color="{badge_fg}"><b>{badge_label}</b></font>',
                    sty(f'bdg_{nome[:6]}_{qty}', fontSize=7, leading=10)
                )
                # Se la voce è esente IVA, aggiungi un indicatore nella colonna Tipo (opzionale)
                if esente:
                    badge_cell = Paragraph(
                        f'<font size="7" color="{badge_fg}"><b>{badge_label}</b></font><br/><font size="6" color="#276749">ESENTE</font>',
                        sty(f'bdg_{nome[:6]}_{qty}_es', fontSize=7, leading=10)
                    )

                iva_str = '—' if esente else _eur(iva_v)
                saldo_c_row = C_ROSSO if saldo_riga > 0 else C_VERDE

                righe_voci.append([
                    badge_cell,
                    voce_par,
                    Paragraph(_eur(prz),   sty(f'rv1_{nome[:4]}_{qty}', fontSize=8.5, alignment=TA_RIGHT)),
                    Paragraph(str(qty),    sty(f'rv2_{nome[:4]}_{qty}', fontSize=8.5, alignment=TA_RIGHT)),
                    Paragraph(_eur(imp_v), sty(f'rv3_{nome[:4]}_{qty}', fontSize=8.5, alignment=TA_RIGHT)),
                    Paragraph(iva_str,     sty(f'rv4_{nome[:4]}_{qty}', fontSize=8.5, alignment=TA_RIGHT)),
                    Paragraph(f'<b>{_eur(dov_v)}</b>',      sty(f'rv5_{nome[:4]}_{qty}', fontSize=8.5, alignment=TA_RIGHT)),
                    Paragraph(f'<b>{_eur(saldo_riga)}</b>', sty(f'rv6_{nome[:4]}_{qty}', fontSize=8.5, alignment=TA_RIGHT, textColor=saldo_c_row)),
                ])

            # Poi i pagamenti del mese (a fondo scheda, come versione_b_schede)
            for p in pag_m:
                imp_p  = float(p.get('importo', 0))
                saldo_riga = round(saldo_riga - imp_p, 2)
                metodo = p.get('metodo', '') or ''
                note_p = p.get('note', '') or ''
                desc_p = metodo
                if note_p:
                    desc_p += f' - {note_p}'
                try:
                    bits = p['data'].split('-')
                    dfmt = f"{bits[2].lstrip('0')}/{bits[1]}/{bits[0]}"
                except Exception:
                    dfmt = p.get('data', '')

                saldo_c_pag = C_ROSSO if saldo_riga > 0 else C_VERDE
                pag_badge = Paragraph(
                    '<font size="7" color="#276749"><b>PAGAMENTO</b></font>',
                    sty(f'pbdg_{dfmt}', fontSize=7, leading=10)
                )

                righe_voci.append([
                    pag_badge,
                    Paragraph(
                        f'<i><font color="#38a169">{desc_p or "Bonifico"} {dfmt}</font></i>',
                        sty(f'pag_{dfmt}', fontSize=8.5)
                    ),
                    Paragraph('—', sty(f'pag1_{dfmt}', fontSize=8.5, alignment=TA_RIGHT, textColor=C_MUTED)),
                    Paragraph('—', sty(f'pag2_{dfmt}', fontSize=8.5, alignment=TA_RIGHT, textColor=C_MUTED)),
                    Paragraph('—', sty(f'pag3_{dfmt}', fontSize=8.5, alignment=TA_RIGHT, textColor=C_MUTED)),
                    Paragraph('—', sty(f'pag4_{dfmt}', fontSize=8.5, alignment=TA_RIGHT, textColor=C_MUTED)),
                    Paragraph(f'<font color="#c53030"><b>-{_eur(imp_p)}</b></font>',
                              sty(f'pag5_{dfmt}', fontSize=8.5, alignment=TA_RIGHT)),
                    Paragraph(f'<b>{_eur(saldo_riga)}</b>',
                              sty(f'pag6_{dfmt}', fontSize=8.5, alignment=TA_RIGHT,
                                  textColor=saldo_c_pag)),
                ])

            # colWidths: Tipo | Voce | Unit. | Qtà | Impon. | IVA | Dovuto | Saldo
            CW_V = CONTENT_W
            t_voci = Table(
                righe_voci,
                colWidths=[CW_V*0.14, CW_V*0.22, CW_V*0.11, CW_V*0.05, CW_V*0.11, CW_V*0.09, CW_V*0.12, CW_V*0.16]
            )
            n_rig = len(righe_voci)
            ts_cmds = [
                ('BACKGROUND',    (0, 0), (-1, 0),  C_ALT),
                ('FONTSIZE',      (0, 0), (-1, -1), 8.5),
                ('TOPPADDING',    (0, 0), (-1, -1), 5),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
                ('LEFTPADDING',   (0, 0), (0,  -1), 6),
                ('LEFTPADDING',   (1, 0), (1,  -1), 8),
                ('RIGHTPADDING',  (-1,0), (-1, -1), 8),
                ('ROWBACKGROUNDS',(0, 1), (-1, n_rig-1), [colors.white, C_ALT]),
                ('GRID',          (0, 0), (-1, -1), 0.3, C_BORDER),
                ('BOX',           (0, 0), (-1, -1), 0.8, C_BORDER),
                ('VALIGN',        (0, 0), (-1, -1), 'MIDDLE'),
            ]
            # Sfondo badge per ogni riga voce
            for row_idx, bg_hex in badge_row_styles:
                ts_cmds.append(('BACKGROUND', (0, row_idx), (0, row_idx), colors.HexColor(bg_hex)))
            t_voci.setStyle(TableStyle(ts_cmds))
            story.append(t_voci)
            story.append(Spacer(1, 0.4 * cm))

        # ── LEGENDA TAG ───────────────────────────────────────────
        story.append(HRFlowable(width=CONTENT_W, thickness=0.5, color=C_BORDER, spaceAfter=4))

        # Legenda: ogni badge = colonna con etichetta + descrizione su due righe
        _LEG = [
            ('COSTO FISSO',   '#2b6cb0', '#dbeafe', 'Fisso mensile'),
            ('VARIABILE',     '#276749', '#dcfce7', 'Costo variabile'),
            ('COSTO ANNUALE', '#553c9a', '#ede9fe', 'Fisso annuale'),
            ('A RICHIESTA',   '#744210', '#ffedd5', 'Variabile / a richiesta'),
            ('PAGAMENTO',     '#276749', '#dcfce7', 'Pagamento ricevuto'),
            ('ESENTE IVA',    '#92400e', '#fef9c3', 'Esente IVA'),
        ]

        leg_row1 = [Paragraph('<b>LEGENDA</b>', sty('leg_hdr', fontSize=7, textColor=C_MUTED, leading=9))]
        leg_row2 = [Paragraph('', sty('leg_hdr2', fontSize=7))]

        for lbl, fg, bg, desc in _LEG:
            leg_row1.append(
                Paragraph(f'<font color="{fg}"><b>{lbl}</b></font>',
                          sty(f'lr1_{lbl[:3]}', fontSize=7, leading=9, textColor=colors.HexColor(fg)))
            )
            leg_row2.append(
                Paragraph(f'<font color="#4a5568">{desc}</font>',
                          sty(f'lr2_{lbl[:3]}', fontSize=7, leading=9, textColor=colors.HexColor('#4a5568')))
            )

        n_leg_cols = 1 + len(_LEG)
        cw_leg_label = CW_V * 0.09
        cw_leg_item  = (CW_V - cw_leg_label) / len(_LEG)
        t_leg = Table(
            [leg_row1, leg_row2],
            colWidths=[cw_leg_label] + [cw_leg_item] * len(_LEG)
        )
        # sfondo colorato per ogni colonna badge (riga 0 = etichetta, riga 1 = descrizione)
        ts_leg = [
            ('TOPPADDING',    (0, 0), (-1, -1), 2),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
            ('LEFTPADDING',   (0, 0), (-1, -1), 4),
            ('VALIGN',        (0, 0), (-1, -1), 'MIDDLE'),
        ]
        for ci, (lbl, fg, bg, desc) in enumerate(_LEG, start=1):
            ts_leg.append(('BACKGROUND', (ci, 0), (ci, 1), colors.HexColor(bg)))
            ts_leg.append(('ROUNDEDCORNERS', [3,3,3,3]))
        t_leg.setStyle(TableStyle(ts_leg))
        story.append(t_leg)
        story.append(Spacer(1, 0.2 * cm))

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

            saldo_fine = residuo
            for mm in range(1, m + 1):
                vv = pratiche_per_mese.get(mm, [])
                pp = pagamenti_per_mese.get(mm, [])
                c2 = sum(float(v.get('importo') or 0) for v in vv)
                e2 = sum(float(v.get('importo') or 0) for v in vv if v.get('esente_iva'))
                saldo_fine += round((c2 - e2) * 1.22 + e2, 2)
                saldo_fine -= sum(float(p.get('importo') or 0) for p in pp)
                saldo_fine = round(saldo_fine, 2)

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

            g = _group_voci(voci_m)
            righe_v = []
            for nome, info in g.items():
                qty   = info['qty']
                prz   = info['prezzo']
                iva_v = 0 if info['esente'] else round(prz * 0.22 * qty, 2)
                tot_v = qty * prz + iva_v
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

            story.append(Paragraph(
                f'<font color="#718096">Imponibile {_eur(i_m)} + IVA {_eur(round(i_m * 0.22, 2))}</font>',
                sty('iva_r', fontSize=8, alignment=TA_RIGHT, textColor=C_MUTED)
            ))

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
            # Versione B: Tipologia | Voce | Costo Unitario | Periodo
            TIPO_LABELS_TAR = {
                'fisso_mensile':           ('Fisso mensile', 'Mensile'),
                'costi_fissi_mensili':     ('Fisso mensile', 'Mensile'),
                'variabile_mensile':       ('Variabile',     'Mensile'),
                'variabile':               ('Variabile',     'Mensile'),
                'costi_variabili':         ('Variabile',     'Mensile'),
                'costi_variabili_mensili': ('Variabile',     'Mensile'),
                'variabile_annuale':       ('Fisso annuale', ''),
                'fisso_annuale':           ('Fisso annuale', ''),
                'costi_fissi_annuali':     ('Fisso annuale', ''),
            }

            righe_tar = [[
                Paragraph('<b>TIPOLOGIA</b>',     sty('tth0', fontSize=8, textColor=colors.white)),
                Paragraph('<b>VOCE</b>',           sty('tth1', fontSize=8, textColor=colors.white)),
                Paragraph('<b>COSTO UNITARIO</b>', sty('tth2', fontSize=8, textColor=colors.white, alignment=TA_RIGHT)),
                Paragraph('<b>PERIODO</b>',        sty('tth3', fontSize=8, textColor=colors.white, alignment=TA_CENTER)),
            ]]

            for v in tariffario:
                tipo = v.get('tipo', '')
                tipo_label, periodo_label = TIPO_LABELS_TAR.get(tipo, (tipo.replace('_', ' ').title(), ''))

                mesi_json_str = v.get('mesi_json') or ''
                if mesi_json_str and not periodo_label:
                    try:
                        mesi_list = _json.loads(mesi_json_str)
                        if mesi_list:
                            periodo_label = ', '.join(
                                NOMI_MESI[int(mx) - 1][:3]
                                for mx in mesi_list if 1 <= int(mx) <= 12
                            )
                    except Exception:
                        pass

                righe_tar.append([
                    Paragraph(tipo_label,           sty(f'tt0_{tipo[:6]}', fontSize=8.5)),
                    Paragraph(v.get('nome', ''),    sty(f'tt1_{tipo[:6]}', fontSize=8.5)),
                    Paragraph(_eur(v.get('prezzo', 0)), sty(f'tt2_{tipo[:6]}', fontSize=8.5, alignment=TA_RIGHT)),
                    Paragraph(periodo_label,        sty(f'tt3_{tipo[:6]}', fontSize=8.5, alignment=TA_CENTER)),
                ])

            n_tar = len(righe_tar)
            t_tar = Table(righe_tar,
                          colWidths=[CONTENT_W*0.22, CONTENT_W*0.40, CONTENT_W*0.20, CONTENT_W*0.18])
            t_tar.setStyle(TableStyle([
                ('BACKGROUND',    (0, 0), (-1, 0),      C_HEADER),
                ('TEXTCOLOR',     (0, 0), (-1, 0),      colors.white),
                ('FONTSIZE',      (0, 0), (-1, -1),     8.5),
                ('TOPPADDING',    (0, 0), (-1, -1),     4),
                ('BOTTOMPADDING', (0, 0), (-1, -1),     4),
                ('LEFTPADDING',   (0, 0), (0,  -1),     8),
                ('ROWBACKGROUNDS',(0, 1), (-1, n_tar-1), [colors.white, C_ALT]),
                ('GRID',          (0, 0), (-1, -1),     0.3, C_BORDER),
                ('BOX',           (0, 0), (-1, -1),     0.8, C_BORDER),
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