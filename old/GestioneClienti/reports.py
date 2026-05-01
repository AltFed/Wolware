#!/usr/bin/env python3
"""
reports.py
Generazione PDF lato Python con ReportLab:
  - Fattura proforma
  - Sollecito pagamento
  - Rendiconto annuale
  - Documento fatturazione (incassi da fatturare)
  - Previsionale costi fissi
  - Estratto conto cliente

Ogni funzione salva il PDF nella cartella dati e ne ritorna il percorso.
Il frontend riceve il path e lo mostra in un <iframe> o lo apre direttamente.
"""
import eel
import os
import datetime
from pathlib import Path

# ReportLab
try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.units import mm
    from reportlab.platypus import (
        SimpleDocTemplate, Table, TableStyle, Paragraph,
        Spacer, HRFlowable,
    )
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
    REPORTLAB_OK = True
except ImportError:
    REPORTLAB_OK = False
    print("[reports] ReportLab non installato. PDF disabilitati.")

# Cartella PDF di default (viene aggiornata da settings.py)
_DATA_DIR: str = str(Path.home() / "Documents" / "GestioneClienti")

# Colori tema
COL_DARK   = colors.HexColor("#1e3a5f")
COL_ACCENT = colors.HexColor("#3b82f6")
COL_GREEN  = colors.HexColor("#16a34a")
COL_RED    = colors.HexColor("#dc2626")
COL_GRAY   = colors.HexColor("#64748b")
COL_LIGHT  = colors.HexColor("#f8fafc")


def _ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def _fmt_euro(val: float) -> str:
    return f"€ {val:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def _pdf_path(subfolder: str, filename: str) -> str:
    folder = os.path.join(_DATA_DIR, subfolder)
    _ensure_dir(folder)
    return os.path.join(folder, filename)


def _base_styles():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle("Title2", parent=styles["Title"],
                               fontSize=16, textColor=COL_DARK, spaceAfter=6))
    styles.add(ParagraphStyle("Sub", parent=styles["Normal"],
                               fontSize=10, textColor=COL_GRAY))
    styles.add(ParagraphStyle("Bold", parent=styles["Normal"],
                               fontSize=10, fontName="Helvetica-Bold"))
    styles.add(ParagraphStyle("Right", parent=styles["Normal"],
                               fontSize=10, alignment=TA_RIGHT))
    styles.add(ParagraphStyle("Center", parent=styles["Normal"],
                               fontSize=10, alignment=TA_CENTER))
    return styles


# ── Fattura Proforma ──────────────────────────────────────────────────────────

@eel.expose
def genera_fattura_pdf(dati: dict) -> dict:
    """
    dati: { studio, cliente, righe:[{descrizione, qta, prezzo, iva}],
            numero, data, sezionale, banca, iban }
    """
    if not REPORTLAB_OK:
        return {"success": False, "error": "ReportLab non installato"}

    oggi_str = datetime.date.today().strftime("%Y%m%d")
    num = dati.get("numero", 1)
    filename = f"Fattura_{num}_{oggi_str}.pdf"
    path = _pdf_path("FATTURE", filename)
    styles = _base_styles()

    doc = SimpleDocTemplate(path, pagesize=A4,
                             leftMargin=15*mm, rightMargin=15*mm,
                             topMargin=15*mm, bottomMargin=15*mm)
    story = []

    # Intestazione
    studio = dati.get("studio", {})
    story.append(Paragraph(studio.get("ragioneSociale", "Studio"), styles["Title2"]))
    story.append(Paragraph(
        f"{studio.get('indirizzo','')} | P.IVA {studio.get('piva','')} | {studio.get('email','')}",
        styles["Sub"]
    ))
    story.append(HRFlowable(width="100%", thickness=1, color=COL_DARK, spaceAfter=8))

    # Info fattura
    story.append(Paragraph(
        f"<b>FATTURA PROFORMA N. {num}{'/'+dati.get('sezionale','') if dati.get('sezionale') else ''}</b> "
        f"del {dati.get('data', datetime.date.today().strftime('%d/%m/%Y'))}",
        styles["Bold"]
    ))
    story.append(Spacer(1, 6*mm))

    # Dati cliente
    cliente = dati.get("cliente", {})
    story.append(Paragraph(f"<b>Destinatario:</b> {cliente.get('denominazione','')}", styles["Normal"]))
    if cliente.get("codiceFiscale"):
        story.append(Paragraph(f"C.F./P.IVA: {cliente['codiceFiscale']}", styles["Sub"]))
    if cliente.get("indirizzo"):
        story.append(Paragraph(cliente["indirizzo"], styles["Sub"]))
    story.append(Spacer(1, 6*mm))

    # Tabella righe
    header = [["Descrizione", "Qtà", "Prezzo Unit.", "IVA", "Totale"]]
    rows = []
    tot_imponibile = 0.0
    tot_iva = 0.0
    for r in dati.get("righe", []):
        qta = float(r.get("qta", 1))
        prezzo = float(r.get("prezzo", 0))
        aliq = float(r.get("iva", 22))
        esente = r.get("esenteIva", False)
        imp = qta * prezzo
        iva_val = 0.0 if esente else imp * aliq / 100
        tot_imponibile += imp
        tot_iva += iva_val
        iva_label = "Esente" if esente else f"{aliq:.0f}%"
        rows.append([
            r.get("descrizione", ""),
            f"{qta:.0f}",
            _fmt_euro(prezzo),
            iva_label,
            _fmt_euro(imp + iva_val),
        ])

    tbl_data = header + rows + [
        ["", "", "", "Imponibile", _fmt_euro(tot_imponibile)],
        ["", "", "", "IVA 22%", _fmt_euro(tot_iva)],
        ["", "", "", "TOTALE", _fmt_euro(tot_imponibile + tot_iva)],
    ]

    tbl = Table(tbl_data, colWidths=[85*mm, 15*mm, 30*mm, 20*mm, 30*mm])
    tbl.setStyle(TableStyle([
        ("BACKGROUND",   (0, 0), (-1, 0), COL_DARK),
        ("TEXTCOLOR",    (0, 0), (-1, 0), colors.white),
        ("FONTNAME",     (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",     (0, 0), (-1, -1), 9),
        ("ROWBACKGROUNDS", (0, 1), (-1, -4), [COL_LIGHT, colors.white]),
        ("ALIGN",        (1, 0), (-1, -1), "RIGHT"),
        ("FONTNAME",     (3, -3), (-1, -1), "Helvetica-Bold"),
        ("TEXTCOLOR",    (4, -1), (4, -1), COL_GREEN),
        ("LINEABOVE",    (0, -3), (-1, -3), 0.5, COL_GRAY),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 4),
        ("TOPPADDING",   (0, 0), (-1, -1), 4),
    ]))
    story.append(tbl)
    story.append(Spacer(1, 8*mm))

    # Dati pagamento
    if studio.get("iban"):
        story.append(HRFlowable(width="100%", thickness=0.5, color=COL_GRAY))
        story.append(Spacer(1, 3*mm))
        story.append(Paragraph("<b>Dati per il pagamento:</b>", styles["Bold"]))
        story.append(Paragraph(f"Banca: {studio.get('banca','')}", styles["Sub"]))
        story.append(Paragraph(f"IBAN: {studio.get('iban','')}", styles["Sub"]))

    doc.build(story)
    return {"success": True, "path": path}


# ── Sollecito Pagamento ───────────────────────────────────────────────────────

@eel.expose
def genera_sollecito_pdf(dati: dict) -> dict:
    """
    dati: { studio, cliente, residuo, dettaglio:[{periodo, importo}] }
    """
    if not REPORTLAB_OK:
        return {"success": False, "error": "ReportLab non installato"}

    cliente = dati.get("cliente", {})
    safe_name = cliente.get("denominazione", "cliente").replace(" ", "_")[:30]
    oggi_str = datetime.date.today().strftime("%Y%m%d")
    filename = f"Sollecito_{safe_name}_{oggi_str}.pdf"
    path = _pdf_path("SOLLECITI", filename)
    styles = _base_styles()

    doc = SimpleDocTemplate(path, pagesize=A4,
                             leftMargin=15*mm, rightMargin=15*mm,
                             topMargin=15*mm, bottomMargin=15*mm)
    story = []

    studio = dati.get("studio", {})
    story.append(Paragraph(studio.get("ragioneSociale", "Studio"), styles["Title2"]))
    story.append(HRFlowable(width="100%", thickness=1, color=COL_DARK, spaceAfter=6))
    story.append(Spacer(1, 4*mm))

    oggi_fmt = datetime.date.today().strftime("%d/%m/%Y")
    story.append(Paragraph(f"<b>SOLLECITO DI PAGAMENTO</b> — {oggi_fmt}", styles["Bold"]))
    story.append(Spacer(1, 4*mm))
    story.append(Paragraph(f"Spett.le <b>{cliente.get('denominazione','')}</b>", styles["Normal"]))
    story.append(Spacer(1, 6*mm))
    story.append(Paragraph(
        "Con la presente siamo a sollecitare il pagamento delle competenze ancora in sospeso:",
        styles["Normal"]
    ))
    story.append(Spacer(1, 4*mm))

    # Tabella dettaglio
    rows = [["Periodo / Descrizione", "Importo"]]
    for d in dati.get("dettaglio", []):
        rows.append([d.get("periodo", ""), _fmt_euro(float(d.get("importo", 0)))])
    residuo = float(dati.get("residuo", 0))
    rows.append(["TOTALE DOVUTO", _fmt_euro(residuo)])

    tbl = Table(rows, colWidths=[130*mm, 40*mm])
    tbl.setStyle(TableStyle([
        ("BACKGROUND",   (0, 0), (-1, 0), COL_DARK),
        ("TEXTCOLOR",    (0, 0), (-1, 0), colors.white),
        ("FONTNAME",     (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",     (0, 0), (-1, -1), 9),
        ("ROWBACKGROUNDS", (0, 1), (-1, -2), [COL_LIGHT, colors.white]),
        ("ALIGN",        (1, 0), (-1, -1), "RIGHT"),
        ("FONTNAME",     (0, -1), (-1, -1), "Helvetica-Bold"),
        ("BACKGROUND",   (0, -1), (-1, -1), colors.HexColor("#fef2f2")),
        ("TEXTCOLOR",    (1, -1), (1, -1), COL_RED),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 5),
        ("TOPPADDING",   (0, 0), (-1, -1), 5),
    ]))
    story.append(tbl)
    story.append(Spacer(1, 8*mm))

    if studio.get("iban"):
        story.append(Paragraph(
            f"Per il pagamento utilizzare il seguente IBAN: <b>{studio['iban']}</b>",
            styles["Normal"]
        ))
    story.append(Spacer(1, 10*mm))
    story.append(Paragraph(
        "Confidando in una Sua pronta risposta, porgiamo distinti saluti.",
        styles["Normal"]
    ))
    story.append(Spacer(1, 12*mm))
    story.append(Paragraph(studio.get("ragioneSociale", ""), styles["Bold"]))

    doc.build(story)
    return {"success": True, "path": path}


# ── Rendiconto Annuale ────────────────────────────────────────────────────────

@eel.expose
def genera_rendiconto_pdf(dati: dict) -> dict:
    """
    dati: { anno, entrate:[{nome, importo}], uscite:[{nome, importo}],
            totaleEntrate, totaleUscite, saldi:{cassa, banche:{nome:saldo}} }
    """
    if not REPORTLAB_OK:
        return {"success": False, "error": "ReportLab non installato"}

    anno = dati.get("anno", datetime.date.today().year)
    filename = f"Rendiconto_{anno}.pdf"
    path = _pdf_path("RENDICONTO", filename)
    styles = _base_styles()

    doc = SimpleDocTemplate(path, pagesize=A4,
                             leftMargin=15*mm, rightMargin=15*mm,
                             topMargin=15*mm, bottomMargin=15*mm)
    story = []
    studio = dati.get("studio", {})

    story.append(Paragraph(studio.get("ragioneSociale", "Studio"), styles["Title2"]))
    story.append(Paragraph(f"<b>RENDICONTO ANNUALE {anno}</b>", styles["Title2"]))
    story.append(HRFlowable(width="100%", thickness=1, color=COL_DARK, spaceAfter=8))

    for sezione, label, col in [
        ("entrate", "ENTRATE", COL_GREEN),
        ("uscite",  "USCITE",  COL_RED),
    ]:
        story.append(Spacer(1, 4*mm))
        story.append(Paragraph(f"<b>{label}</b>", styles["Bold"]))
        righe = dati.get(sezione, [])
        if righe:
            tbl_data = [["Categoria", "Importo"]]
            for r in righe:
                tbl_data.append([r.get("nome", ""), _fmt_euro(float(r.get("importo", 0)))])
            totale_key = f"totale{sezione.capitalize()}"
            tbl_data.append(["TOTALE", _fmt_euro(float(dati.get(totale_key, 0)))])

            tbl = Table(tbl_data, colWidths=[130*mm, 40*mm])
            tbl.setStyle(TableStyle([
                ("BACKGROUND",   (0, 0), (-1, 0), COL_DARK),
                ("TEXTCOLOR",    (0, 0), (-1, 0), colors.white),
                ("FONTNAME",     (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE",     (0, 0), (-1, -1), 9),
                ("ROWBACKGROUNDS",(0,1),(-1,-2),[COL_LIGHT,colors.white]),
                ("ALIGN",        (1, 0), (-1, -1), "RIGHT"),
                ("FONTNAME",     (0, -1), (-1, -1), "Helvetica-Bold"),
                ("TEXTCOLOR",    (1, -1), (1, -1), col),
                ("BOTTOMPADDING",(0,0),(-1,-1), 4),
                ("TOPPADDING",   (0,0),(-1,-1), 4),
            ]))
            story.append(tbl)

    # Riepilogo finale
    story.append(Spacer(1, 6*mm))
    story.append(HRFlowable(width="100%", thickness=0.5, color=COL_GRAY))
    story.append(Spacer(1, 3*mm))
    tot_e = float(dati.get("totaleEntrate", 0))
    tot_u = float(dati.get("totaleUscite", 0))
    utile = tot_e - tot_u
    col_utile = COL_GREEN if utile >= 0 else COL_RED

    riepilogo = Table([
        ["Totale Entrate", _fmt_euro(tot_e)],
        ["Totale Uscite",  _fmt_euro(tot_u)],
        ["Utile / Perdita", _fmt_euro(utile)],
    ], colWidths=[130*mm, 40*mm])
    riepilogo.setStyle(TableStyle([
        ("FONTNAME",  (0, 0), (-1, -1), "Helvetica-Bold"),
        ("FONTSIZE",  (0, 0), (-1, -1), 10),
        ("ALIGN",     (1, 0), (-1, -1), "RIGHT"),
        ("TEXTCOLOR", (1, -1),(1, -1), col_utile),
        ("BOTTOMPADDING",(0,0),(-1,-1), 5),
    ]))
    story.append(riepilogo)

    doc.build(story)
    return {"success": True, "path": path}


# ── Documento Fatturazione Incassi ────────────────────────────────────────────

@eel.expose
def genera_documento_fatturazione_pdf(dati: dict) -> dict:
    """
    dati: { incassi:[{data, nomeCliente, tipoCliente, importo}], studio }
    """
    if not REPORTLAB_OK:
        return {"success": False, "error": "ReportLab non installato"}

    oggi = datetime.date.today()
    filename = f"Fatturazione_{oggi.strftime('%Y%m%d')}.pdf"
    path = _pdf_path("FATTURAZIONE", filename)
    styles = _base_styles()

    doc = SimpleDocTemplate(path, pagesize=A4,
                             leftMargin=15*mm, rightMargin=15*mm,
                             topMargin=15*mm, bottomMargin=15*mm)
    story = []
    studio = dati.get("studio", {})

    story.append(Paragraph(studio.get("ragioneSociale", "Studio"), styles["Title2"]))
    story.append(Paragraph(
        f"<b>INCASSI DA FATTURARE</b> — {oggi.strftime('%d/%m/%Y')} — {len(dati.get('incassi',[]))} incassi",
        styles["Bold"]
    ))
    story.append(HRFlowable(width="100%", thickness=1, color=COL_DARK, spaceAfter=6))
    story.append(Spacer(1, 4*mm))

    rows = [["Data Incasso", "Cliente", "Tipo", "Importo"]]
    totale = 0.0
    for inc in dati.get("incassi", []):
        imp = float(inc.get("importo", 0))
        totale += imp
        rows.append([
            inc.get("data", ""),
            inc.get("nomeCliente", "")[:40],
            inc.get("tipoCliente", ""),
            _fmt_euro(imp),
        ])
    rows.append(["", "", "TOTALE", _fmt_euro(totale)])

    tbl = Table(rows, colWidths=[30*mm, 90*mm, 30*mm, 30*mm])
    tbl.setStyle(TableStyle([
        ("BACKGROUND",   (0, 0), (-1, 0), COL_DARK),
        ("TEXTCOLOR",    (0, 0), (-1, 0), colors.white),
        ("FONTNAME",     (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",     (0, 0), (-1, -1), 9),
        ("ROWBACKGROUNDS",(0,1),(-1,-2),[COL_LIGHT,colors.white]),
        ("ALIGN",        (3, 0), (-1, -1), "RIGHT"),
        ("FONTNAME",     (2, -1), (-1, -1), "Helvetica-Bold"),
        ("TEXTCOLOR",    (3, -1), (3, -1), COL_GREEN),
        ("LINEABOVE",    (0, -1), (-1, -1), 0.5, COL_GRAY),
        ("BOTTOMPADDING",(0,0),(-1,-1), 4),
        ("TOPPADDING",   (0,0),(-1,-1), 4),
    ]))
    story.append(tbl)
    story.append(Spacer(1, 8*mm))
    story.append(Paragraph(
        "<i>Ricordati di emettere fattura entro 12 giorni dall'incasso.</i>",
        styles["Sub"]
    ))

    doc.build(story)
    return {"success": True, "path": path}


# ── Apri PDF nel sistema ──────────────────────────────────────────────────────

@eel.expose
def apri_pdf(path: str) -> bool:
    """Apre il PDF con il visualizzatore predefinito di sistema."""
    import subprocess
    import sys
    try:
        if sys.platform == "win32":
            os.startfile(path)
        elif sys.platform == "darwin":
            subprocess.Popen(["open", path])
        else:
            subprocess.Popen(["xdg-open", path])
        return True
    except Exception as e:
        print(f"[reports] Errore apertura PDF: {e}")
        return False


@eel.expose
def get_pdf_as_base64(path: str) -> str | None:
    """Ritorna il contenuto del PDF come stringa base64 per anteprima inline."""
    import base64
    try:
        with open(path, "rb") as f:
            return base64.b64encode(f.read()).decode("utf-8")
    except Exception as e:
        print(f"[reports] Errore lettura PDF: {e}")
        return None
