import io
from datetime import date
from flask import Blueprint, request, jsonify, send_file
from database import get_db
from auth.routes import login_required
from routes.arrotondamenti import calcola_residuo

bp = Blueprint('solleciti_bp', __name__)


@bp.route('/api/ditte/<int:ditta_id>/sollecito/pdf', methods=['POST'])
@login_required
def genera_sollecito(ditta_id):
    db = get_db()
    try:
        ditta = db.execute('SELECT * FROM ditte WHERE id=?', (ditta_id,)).fetchone()
        if not ditta:
            return jsonify({'error': 'Cliente non trovato'}), 404

        residuo = calcola_residuo(db, ditta_id)
        if residuo <= 0:
            return jsonify({'error': 'Il cliente non ha residui da sollecitare'}), 400

        buf = _genera_pdf_sollecito(dict(ditta), residuo)
        nome = f"sollecito_{ditta['nome'].replace(' ', '_')}_{date.today()}.pdf"
        return send_file(buf, mimetype='application/pdf',
                         as_attachment=True, download_name=nome)
    finally:
        db.close()


def _genera_pdf_sollecito(ditta, importo_dovuto):
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.units import cm
        from reportlab.lib import colors
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    except ImportError:
        raise RuntimeError("reportlab non installato")

    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                             leftMargin=2.5*cm, rightMargin=2.5*cm,
                             topMargin=3*cm, bottomMargin=3*cm)
    styles = getSampleStyleSheet()
    BOLD  = ParagraphStyle('bold', fontSize=12, leading=16, fontName='Helvetica-Bold')
    NORM  = ParagraphStyle('norm', fontSize=10, leading=15)
    SMALL = ParagraphStyle('sm',   fontSize=9,  leading=13, textColor=colors.HexColor('#4a5568'))

    oggi = date.today().strftime('%d/%m/%Y')
    story = []

    # Intestazione studio (da configurare con dati reali)
    story.append(Paragraph("Studio CDL — Consulente del Lavoro", BOLD))
    story.append(Paragraph("P.IVA: 00000000000 — Tel: 000 0000000", SMALL))
    story.append(Spacer(1, 1.5*cm))

    # Data e riferimento
    story.append(Paragraph(f"Data: {oggi}", NORM))
    story.append(Spacer(1, 0.5*cm))

    # Dati destinatario
    story.append(Paragraph(f"<b>Spett.le</b>", NORM))
    story.append(Paragraph(f"<b>{ditta.get('nome', '')}</b>", NORM))
    if ditta.get('indirizzo'):
        story.append(Paragraph(ditta['indirizzo'], NORM))
    story.append(Spacer(1, 1*cm))

    # Oggetto
    story.append(Paragraph("<b>Oggetto: SOLLECITO DI PAGAMENTO</b>", BOLD))
    story.append(Spacer(1, 0.7*cm))

    # Testo
    testo = (
        f"Gentile Cliente,<br/><br/>"
        f"con la presente siamo a sollecitare cortesemente il pagamento delle competenze "
        f"professionali ancora insolute relative alla nostra collaborazione.<br/><br/>"
        f"L'importo residuo risultante dai nostri registri è il seguente:"
    )
    story.append(Paragraph(testo, NORM))
    story.append(Spacer(1, 0.5*cm))

    # Importo in evidenza
    importo_table = Table(
        [['IMPORTO DOVUTO', f"€ {importo_dovuto:.2f}"]],
        colWidths=[10*cm, 6*cm]
    )
    importo_table.setStyle(TableStyle([
        ('BACKGROUND',  (0,0), (-1,-1), colors.HexColor('#ebf8ff')),
        ('FONTNAME',    (0,0), (-1,-1), 'Helvetica-Bold'),
        ('FONTSIZE',    (0,0), (-1,-1), 14),
        ('ALIGN',       (1,0), (-1,-1), 'RIGHT'),
        ('TOPPADDING',  (0,0), (-1,-1), 8),
        ('BOTTOMPADDING',(0,0),(-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING',(0,0), (-1,-1), 12),
        ('ROUNDEDCORNERS', [5]),
    ]))
    story.append(importo_table)
    story.append(Spacer(1, 0.7*cm))

    # Modalità pagamento
    story.append(Paragraph(
        "Vi preghiamo di voler provvedere al pagamento entro 10 giorni dal ricevimento "
        "della presente, tramite bonifico bancario alle seguenti coordinate:",
        NORM
    ))
    story.append(Spacer(1, 0.3*cm))
    story.append(Paragraph("<b>IBAN:</b> IT00 X000 0000 0000 0000000000", NORM))
    story.append(Spacer(1, 0.7*cm))

    story.append(Paragraph(
        "Rimaniamo a disposizione per qualsiasi chiarimento e porgiamo cordiali saluti.",
        NORM
    ))
    story.append(Spacer(1, 1.5*cm))
    story.append(Paragraph("Firma: _______________________________", NORM))

    doc.build(story)
    buf.seek(0)
    return buf