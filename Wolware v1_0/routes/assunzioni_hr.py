# routes/assunzioni_hr.py
# Blueprint 'assunzioni_hr' — API REST per il modulo Pratiche HR / Assunzioni.
#
# GET    /api/assunzioni/employees?ditta_id=X          → dipendenti della ditta
# POST   /api/assunzioni/employees                     → crea/aggiorna dipendente
# GET    /api/assunzioni/employees/<id>                → singolo dipendente
# PUT    /api/assunzioni/employees/<id>                → aggiorna dipendente
# DELETE /api/assunzioni/employees/<id>                → elimina (solo se no assunzioni)
#
# GET    /api/assunzioni?ditta_id=X                    → pratiche assunzione della ditta
# POST   /api/assunzioni                               → crea pratica (stato=bozza o completa)
# PUT    /api/assunzioni/<id>                          → aggiorna/completa pratica
# DELETE /api/assunzioni/<id>                          → elimina pratica (solo bozze)
# POST   /api/assunzioni/<id>/completa                 → finalizza: avvia le 4 azioni
#
# GET    /api/scadenziario?ditta_id=X                  → righe scadenziario della ditta
# POST   /api/scadenziario/<id>/azione                 → segna azione completata
# DELETE /api/scadenziario/<id>                        → elimina riga scadenziario
#
# GET    /api/assunzioni/lookup/ccnl                   → lista CCNL (da impostazioni)
# GET    /api/assunzioni/lookup/istat                  → lista qualifiche ISTAT

import json
from datetime import datetime, date, timedelta
from flask import Blueprint, request, jsonify
from database import get_db
from auth.decorators import login_required

bp = Blueprint('assunzioni_hr', __name__)


# ═══════════════════════════════════════════════════════════════════════
# MATRICE DI CONFIGURAZIONE ASSUNZIONI
# Dizionario che definisce per ogni tipo pratica:
#   - label:        etichetta leggibile
#   - riga3_tmpl:   template per riepilogo_r3 (%DATA% = data_fine)
#   - alert_tipo:   tipo alert da generare (None = nessuno)
#   - alert_label:  testo dell'alert in riepilogo_r3 scadenza
#   - alert_offset: giorni prima della data_fine da anticipare l'alert
#   - azioni_workflow: checklist operazioni post-assunzione
# ═══════════════════════════════════════════════════════════════════════
MATRICE_ASSUNZIONI = {
    '1.1': {
        'label': 'Assunzione a Tempo Indeterminato',
        'riga3_tmpl': 'Tempo Indeterminato',
        'alert_tipo': None,
        'alert_label': None,
        'azioni_workflow': [
            'Trasmissione XML UNILAV',
            'Firma Documenti',
            'Consegna Lettera di Assunzione',
            'Consegna Informativa Privacy',
            'Modulo TFR2 firmato',
            'Modulo Detrazioni Fiscali firmato',
        ],
    },
    '1.2': {
        'label': 'Assunzione a Tempo Determinato',
        'riga3_tmpl': 'Tempo determinato al %DATA%',
        'alert_tipo': 'scadenza',
        'alert_label': 'Scadenza Contratto: %DATA%',
        'azioni_workflow': [
            'Trasmissione XML UNILAV',
            'Firma Documenti',
            'Consegna Lettera di Assunzione T.D.',
            'Consegna Informativa Privacy',
            'Modulo TFR2 firmato',
            'Modulo Detrazioni Fiscali firmato',
        ],
    },
    '1.3': {
        'label': 'Assunzione T.D. (Sostituzione)',
        'riga3_tmpl': 'Fino a rientro titolare (Prev. %DATA%)',
        'alert_tipo': 'scadenza',
        'alert_label': 'Scadenza Prevista: %DATA%',
        'azioni_workflow': [
            'Trasmissione XML UNILAV',
            'Firma Documenti',
            'Consegna Lettera di Assunzione Sostituzione',
            'Consegna Informativa Privacy',
            'Modulo TFR2 firmato',
            'Modulo Detrazioni Fiscali firmato',
        ],
    },
    '2.1': {
        'label': 'Apprendistato Professionalizzante',
        'riga3_tmpl': 'Fine periodo formativo al %DATA%',
        'alert_tipo': 'scadenza',
        'alert_label': 'Scadenza Periodo Formativo: %DATA%',
        'azioni_workflow': [
            'Trasmissione XML UNILAV',
            'Firma Documenti',
            'Consegna Piano Formativo Individuale',
            'Consegna Informativa Privacy',
            'Modulo TFR2 firmato',
            'Modulo Detrazioni Fiscali firmato',
            'Nomina Tutor Aziendale',
        ],
    },
    '2.2': {
        'label': 'Apprendistato Duale',
        'riga3_tmpl': 'Fine percorso studi al %DATA%',
        'alert_tipo': 'scadenza',
        'alert_label': 'Esame/Qualifica finale: %DATA%',
        'azioni_workflow': [
            'Trasmissione XML UNILAV',
            'Firma Documenti',
            'Accordo con Istituto Formativo',
            'Consegna Informativa Privacy',
        ],
    },
    '3.1': {
        'label': 'Lavoro Intermittente Indeterminato',
        'riga3_tmpl': 'Tempo Indeterminato',
        'alert_tipo': None,
        'alert_label': None,
        'azioni_workflow': [
            'Trasmissione XML UNILAV',
            'Firma Documenti',
            'Consegna Informativa Privacy',
        ],
    },
    '3.2': {
        'label': 'Lavoro Intermittente Determinato',
        'riga3_tmpl': 'Tempo determinato al %DATA%',
        'alert_tipo': 'scadenza',
        'alert_label': 'Scadenza Contratto: %DATA%',
        'azioni_workflow': [
            'Trasmissione XML UNILAV',
            'Firma Documenti',
            'Consegna Informativa Privacy',
        ],
    },
    '4.1': {
        'label': 'Collaborazione Coordinata e Continuativa',
        'riga3_tmpl': 'Scadenza al %DATA%',
        'alert_tipo': 'scadenza',
        'alert_label': 'Scadenza Contratto: %DATA%',
        'azioni_workflow': [
            'Trasmissione XML UNILAV',
            'Firma Contratto Co.Co.Co.',
            'Iscrizione Gestione Separata INPS',
            'Consegna Informativa Privacy',
        ],
    },
    '4.2': {
        'label': 'Amministratore di Società',
        'riga3_tmpl': 'Scadenza Mandato: %DATA%',
        'alert_tipo': 'scadenza',
        'alert_label': 'Scadenza Mandato: %DATA%',
        'azioni_workflow': [
            'Delibera Assembleare',
            'Iscrizione Gestione Separata INPS (se prevista)',
            'Consegna Informativa Privacy',
        ],
    },
    '5.1': {
        'label': 'Tirocinio Extracurriculare',
        'riga3_tmpl': 'Fine Tirocinio al %DATA%',
        'alert_tipo': 'scadenza',
        'alert_label': 'Scadenza Tirocinio: %DATA%',
        'azioni_workflow': [
            'Comunicazione Obbligatoria al Centro per l\'Impiego',
            'Firma Progetto Formativo',
            'Consegna Informativa Privacy',
            'Attivazione Copertura INAIL',
        ],
    },
}


# ═══════════════════════════════════════════════════════════════════════
# HELPER: genera matricola_interna
# Formato YYNN: YY = ultime 2 cifre anno, NN = progressivo annuale
# ═══════════════════════════════════════════════════════════════════════
def _genera_matricola(conn, ditta_id: int) -> str:
    yy = str(date.today().year)[-2:]
    prefix = yy
    row = conn.execute(
        """SELECT COUNT(*) as cnt FROM employees
           WHERE ditta_id=? AND matricola_interna LIKE ?""",
        (ditta_id, f'{prefix}%')
    ).fetchone()
    next_num = (row['cnt'] or 0) + 1
    return f"{prefix}{next_num:02d}"


# ═══════════════════════════════════════════════════════════════════════
# HELPER: costruisce etichetta_utilities
# Esempio: "Impiegato 4° Liv. Full-Time"
# ═══════════════════════════════════════════════════════════════════════
def _etichetta_utilities(data: dict) -> str:
    parts = []
    if data.get('mansione'):
        parts.append(data['mansione'].strip().title())
    if data.get('livello_inquadramento'):
        parts.append(f"{data['livello_inquadramento']} Liv.")
    orario = 'Full-Time' if data.get('tipo_orario') == 'full_time' else 'Part-Time'
    parts.append(orario)
    return ' '.join(parts)


# ═══════════════════════════════════════════════════════════════════════
# HELPER: 4 azioni transazionali al completamento pratica
# Deve essere chiamato dentro una transazione già aperta su conn.
# ═══════════════════════════════════════════════════════════════════════
def _completa_assunzione(conn, assunzione: dict):
    ass_id      = assunzione['id']
    ditta_id    = assunzione['ditta_id']
    employee_id = assunzione['employee_id']
    tipo        = assunzione['tipo_pratica']
    data_inizio = assunzione['data_inizio']
    data_fine   = assunzione.get('data_fine')
    etichetta   = assunzione.get('etichetta_utilities') or ''
    mat_cfg     = MATRICE_ASSUNZIONI.get(tipo, {})

    # --- Azione 1: Workflow Scadenziario ---
    # Riga tipo 'workflow' con checklist operativa post-assunzione
    azioni_workflow = [
        {'label': a, 'completata': False}
        for a in mat_cfg.get('azioni_workflow', [])
    ]
    conn.execute(
        """INSERT INTO scadenziario
           (tipo, ditta_id, employee_id, assunzione_id,
            data_evento, portale, riepilogo_r1, riepilogo_r2, riepilogo_r3, azioni_json)
           VALUES (?,?,?,?,?,?,?,?,?,?)""",
        (
            'workflow',
            ditta_id,
            employee_id,
            ass_id,
            data_inizio,
            'Sito Ministero',
            f'Assunzione dal {_fmt_data(data_inizio)}',
            etichetta,
            _riga3(mat_cfg, data_fine),
            json.dumps(azioni_workflow),
        )
    )

    # --- Azione 2: Alert Scadenziario ---
    # Riga tipo 'scadenza' solo se la matrice prevede un alert e c'è una data_fine
    if mat_cfg.get('alert_tipo') and data_fine:
        conn.execute(
            """INSERT INTO scadenziario
               (tipo, ditta_id, employee_id, assunzione_id,
                data_evento, portale, riepilogo_r1, riepilogo_r2, riepilogo_r3, azioni_json)
               VALUES (?,?,?,?,?,?,?,?,?,?)""",
            (
                'scadenza',
                ditta_id,
                employee_id,
                ass_id,
                data_fine,
                'Interna',
                f'Assunzione dal {_fmt_data(data_inizio)}',
                etichetta,
                (mat_cfg.get('alert_label') or '').replace('%DATA%', _fmt_data(data_fine)),
                json.dumps([]),
            )
        )

    # --- Azione 3: Fascicolo Dipendente ---
    # Aggiorna status employee ad 'active'
    conn.execute(
        "UPDATE employees SET status='active' WHERE id=?",
        (employee_id,)
    )

    # --- Azione 4: Fatturazione (Scheda Cliente) ---
    # Legge prezzo pratica dal tariffario (personalizzato → globale),
    # cerca voce tariffario che matchi il tipo pratica dell'assunzione,
    # poi inserisce in pratiche per l'anno/mese corrente.
    oggi = date.today()
    label_pratica = mat_cfg.get('label', f'Pratica HR {tipo}')

    # Cerca prima voce nel tariffario personalizzato ditta
    row_prezzo = conn.execute(
        """SELECT dv.prezzo, dv.nome, dv.esente_iva, dv.macrogruppo_nome, dv.macrogruppo_id, dv.id as voce_id
           FROM ditta_voci dv
           JOIN ditte d ON d.id = dv.ditta_id
           WHERE dv.ditta_id=?
             AND (LOWER(dv.nome) LIKE '%assunz%' OR LOWER(dv.macrogruppo_nome) LIKE '%assunz%')
           LIMIT 1""",
        (ditta_id,)
    ).fetchone()

    prezzo    = float(row_prezzo['prezzo'])   if row_prezzo else 0.0
    voce_id   = row_prezzo['voce_id']         if row_prezzo else None
    nome_voce = row_prezzo['nome']            if row_prezzo else label_pratica
    mgruppo_nome = row_prezzo['macrogruppo_nome'] if row_prezzo else 'Pratiche HR'
    mgruppo_id   = row_prezzo['macrogruppo_id']  if row_prezzo else None
    esente_iva   = int(row_prezzo['esente_iva']) if row_prezzo else 0

    conn.execute(
        """INSERT INTO pratiche
           (ditta_id, anno, mese, tipo, macrogruppo_id, macrogruppo_nome,
            voce_id, nome, quantita, prezzo, importo, esente_iva,
            data_esecuzione, note)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (
            ditta_id,
            oggi.year,
            oggi.month,
            'pratica_hr',
            mgruppo_id,
            mgruppo_nome,
            voce_id,
            nome_voce,
            1.0,
            prezzo,
            prezzo,
            esente_iva,
            oggi.isoformat(),
            f'[HR] {label_pratica} — {assunzione.get("matricola_interna","")}'
        )
    )

    # Segna assunzione come completata
    conn.execute(
        "UPDATE assunzioni_hr SET stato='completata' WHERE id=?",
        (ass_id,)
    )


def _fmt_data(iso: str) -> str:
    """Converte 'YYYY-MM-DD' → 'DD/MM/YYYY'."""
    if not iso:
        return ''
    try:
        d = date.fromisoformat(iso)
        return d.strftime('%d/%m/%Y')
    except ValueError:
        return iso


def _riga3(mat_cfg: dict, data_fine: str | None) -> str:
    tmpl = mat_cfg.get('riga3_tmpl', '')
    if '%DATA%' in tmpl:
        return tmpl.replace('%DATA%', _fmt_data(data_fine or ''))
    return tmpl


# ═══════════════════════════════════════════════════════════════════════
# EMPLOYEES
# ═══════════════════════════════════════════════════════════════════════

@bp.route('/api/assunzioni/employees', methods=['GET'])
@login_required
def get_employees():
    ditta_id = request.args.get('ditta_id', type=int)
    if not ditta_id:
        return jsonify({'error': 'ditta_id obbligatorio'}), 400
    conn = get_db()
    try:
        rows = conn.execute(
            "SELECT * FROM employees WHERE ditta_id=? ORDER BY cognome, nome",
            (ditta_id,)
        ).fetchall()
        return jsonify([dict(r) for r in rows])
    finally:
        conn.close()


@bp.route('/api/assunzioni/employees', methods=['POST'])
@login_required
def create_employee():
    data = request.get_json()
    for f in ('ditta_id', 'nome', 'cognome'):
        if not data.get(f):
            return jsonify({'error': f'Campo obbligatorio mancante: {f}'}), 400
    conn = get_db()
    try:
        conn.execute(
            """INSERT INTO employees
               (ditta_id, nome, cognome, codice_fiscale, data_nascita,
                luogo_nascita, residenza_via, residenza_citta,
                residenza_cap, residenza_provincia, iban)
               VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
            (
                data['ditta_id'],
                data['nome'].strip(),
                data['cognome'].strip(),
                data.get('codice_fiscale'),
                data.get('data_nascita'),
                data.get('luogo_nascita'),
                data.get('residenza_via'),
                data.get('residenza_citta'),
                data.get('residenza_cap'),
                data.get('residenza_provincia'),
                data.get('iban'),
            )
        )
        conn.commit()
        new_id = conn.execute('SELECT last_insert_rowid()').fetchone()[0]
        row = conn.execute('SELECT * FROM employees WHERE id=?', (new_id,)).fetchone()
        return jsonify(dict(row)), 201
    finally:
        conn.close()


@bp.route('/api/assunzioni/employees/<int:emp_id>', methods=['GET'])
@login_required
def get_employee(emp_id):
    conn = get_db()
    try:
        row = conn.execute('SELECT * FROM employees WHERE id=?', (emp_id,)).fetchone()
        if not row:
            return jsonify({'error': 'Dipendente non trovato'}), 404
        return jsonify(dict(row))
    finally:
        conn.close()


@bp.route('/api/assunzioni/employees/<int:emp_id>', methods=['PUT'])
@login_required
def update_employee(emp_id):
    data = request.get_json()
    conn = get_db()
    try:
        conn.execute(
            """UPDATE employees SET
               nome=?, cognome=?, codice_fiscale=?, data_nascita=?,
               luogo_nascita=?, residenza_via=?, residenza_citta=?,
               residenza_cap=?, residenza_provincia=?, iban=?
               WHERE id=?""",
            (
                data.get('nome'),
                data.get('cognome'),
                data.get('codice_fiscale'),
                data.get('data_nascita'),
                data.get('luogo_nascita'),
                data.get('residenza_via'),
                data.get('residenza_citta'),
                data.get('residenza_cap'),
                data.get('residenza_provincia'),
                data.get('iban'),
                emp_id,
            )
        )
        conn.commit()
        row = conn.execute('SELECT * FROM employees WHERE id=?', (emp_id,)).fetchone()
        return jsonify(dict(row))
    finally:
        conn.close()


@bp.route('/api/assunzioni/employees/<int:emp_id>', methods=['DELETE'])
@login_required
def delete_employee(emp_id):
    conn = get_db()
    try:
        count = conn.execute(
            'SELECT COUNT(*) FROM assunzioni_hr WHERE employee_id=?', (emp_id,)
        ).fetchone()[0]
        if count:
            return jsonify({'error': 'Impossibile eliminare: il dipendente ha pratiche associate'}), 409
        conn.execute('DELETE FROM employees WHERE id=?', (emp_id,))
        conn.commit()
        return jsonify({'ok': True})
    finally:
        conn.close()


# ═══════════════════════════════════════════════════════════════════════
# ASSUNZIONI (pratiche HR)
# ═══════════════════════════════════════════════════════════════════════

@bp.route('/api/assunzioni', methods=['GET'])
@login_required
def get_assunzioni():
    ditta_id    = request.args.get('ditta_id', type=int)
    employee_id = request.args.get('employee_id', type=int)
    stato       = request.args.get('stato')

    query  = '''
        SELECT a.*, e.nome as emp_nome, e.cognome as emp_cognome,
               e.codice_fiscale as emp_cf, d.ragione_sociale as ditta_nome
        FROM assunzioni_hr a
        JOIN employees e ON e.id = a.employee_id
        JOIN ditte d ON d.id = a.ditta_id
        WHERE 1=1
    '''
    params = []
    if ditta_id:
        query += ' AND a.ditta_id=?'
        params.append(ditta_id)
    if employee_id:
        query += ' AND a.employee_id=?'
        params.append(employee_id)
    if stato:
        query += ' AND a.stato=?'
        params.append(stato)
    query += ' ORDER BY a.data_inizio DESC'

    conn = get_db()
    try:
        rows = conn.execute(query, params).fetchall()
        return jsonify([dict(r) for r in rows])
    finally:
        conn.close()


@bp.route('/api/assunzioni', methods=['POST'])
@login_required
def create_assunzione():
    data = request.get_json()
    for f in ('ditta_id', 'employee_id', 'tipo_pratica', 'data_inizio'):
        if not data.get(f):
            return jsonify({'error': f'Campo obbligatorio mancante: {f}'}), 400

    if data['tipo_pratica'] not in MATRICE_ASSUNZIONI:
        return jsonify({'error': f"tipo_pratica '{data['tipo_pratica']}' non riconosciuto"}), 400

    # data_fine obbligatoria per tutti i tipi a termine
    cfg = MATRICE_ASSUNZIONI[data['tipo_pratica']]
    if cfg.get('alert_tipo') == 'scadenza' and not data.get('data_fine'):
        return jsonify({'error': 'Data Fine obbligatoria per questo tipo di contratto'}), 400

    etichetta = _etichetta_utilities(data)
    conn = get_db()
    try:
        # Genera o recupera matricola_interna
        emp = conn.execute(
            'SELECT matricola_interna FROM employees WHERE id=?',
            (data['employee_id'],)
        ).fetchone()
        matricola = emp['matricola_interna'] if emp and emp['matricola_interna'] else None
        if not matricola:
            matricola = _genera_matricola(conn, data['ditta_id'])
            conn.execute(
                'UPDATE employees SET matricola_interna=? WHERE id=?',
                (matricola, data['employee_id'])
            )

        conn.execute(
            """INSERT INTO assunzioni_hr
               (ditta_id, employee_id, matricola_interna, tipo_pratica, stato,
                data_inizio, data_fine, ccnl_codice, ccnl_nome,
                livello_inquadramento, qualifica_istat, mansione,
                tipo_orario, ore_settimanali, giorni_lavoro,
                retribuzione_tipo, retribuzione_importo,
                periodo_prova_mesi, scelta_tfr, causale_termine, etichetta_utilities)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (
                data['ditta_id'],
                data['employee_id'],
                matricola,
                data['tipo_pratica'],
                data.get('stato', 'bozza'),
                data['data_inizio'],
                data.get('data_fine'),
                data.get('ccnl_codice'),
                data.get('ccnl_nome'),
                data.get('livello_inquadramento'),
                data.get('qualifica_istat'),
                data.get('mansione'),
                data.get('tipo_orario', 'full_time'),
                data.get('ore_settimanali'),
                data.get('giorni_lavoro'),
                data.get('retribuzione_tipo', 'tabellare'),
                data.get('retribuzione_importo'),
                data.get('periodo_prova_mesi'),
                data.get('scelta_tfr', 'azienda'),
                data.get('causale_termine'),
                etichetta,
            )
        )
        conn.commit()
        new_id = conn.execute('SELECT last_insert_rowid()').fetchone()[0]
        row = conn.execute('SELECT * FROM assunzioni_hr WHERE id=?', (new_id,)).fetchone()
        return jsonify(dict(row)), 201
    finally:
        conn.close()


@bp.route('/api/assunzioni/<int:ass_id>', methods=['GET'])
@login_required
def get_assunzione(ass_id):
    conn = get_db()
    try:
        row = conn.execute(
            '''SELECT a.*, e.nome as emp_nome, e.cognome as emp_cognome,
                      d.ragione_sociale as ditta_nome
               FROM assunzioni_hr a
               JOIN employees e ON e.id = a.employee_id
               JOIN ditte d ON d.id = a.ditta_id
               WHERE a.id=?''',
            (ass_id,)
        ).fetchone()
        if not row:
            return jsonify({'error': 'Pratica non trovata'}), 404
        return jsonify(dict(row))
    finally:
        conn.close()


@bp.route('/api/assunzioni/<int:ass_id>', methods=['PUT'])
@login_required
def update_assunzione(ass_id):
    data = request.get_json()
    etichetta = _etichetta_utilities(data)
    conn = get_db()
    try:
        row = conn.execute(
            'SELECT stato FROM assunzioni_hr WHERE id=?', (ass_id,)
        ).fetchone()
        if not row:
            return jsonify({'error': 'Pratica non trovata'}), 404
        if row['stato'] == 'completata':
            return jsonify({'error': 'Non è possibile modificare una pratica già completata'}), 409

        tipo = data.get('tipo_pratica', row['stato'])
        cfg  = MATRICE_ASSUNZIONI.get(tipo, {})
        if cfg.get('alert_tipo') == 'scadenza' and not data.get('data_fine'):
            return jsonify({'error': 'Data Fine obbligatoria per questo tipo di contratto'}), 400

        conn.execute(
            """UPDATE assunzioni_hr SET
               tipo_pratica=?, data_inizio=?, data_fine=?,
               ccnl_codice=?, ccnl_nome=?,
               livello_inquadramento=?, qualifica_istat=?, mansione=?,
               tipo_orario=?, ore_settimanali=?, giorni_lavoro=?,
               retribuzione_tipo=?, retribuzione_importo=?,
               periodo_prova_mesi=?, scelta_tfr=?, causale_termine=?,
               etichetta_utilities=?
               WHERE id=?""",
            (
                data.get('tipo_pratica'),
                data.get('data_inizio'),
                data.get('data_fine'),
                data.get('ccnl_codice'),
                data.get('ccnl_nome'),
                data.get('livello_inquadramento'),
                data.get('qualifica_istat'),
                data.get('mansione'),
                data.get('tipo_orario', 'full_time'),
                data.get('ore_settimanali'),
                data.get('giorni_lavoro'),
                data.get('retribuzione_tipo', 'tabellare'),
                data.get('retribuzione_importo'),
                data.get('periodo_prova_mesi'),
                data.get('scelta_tfr', 'azienda'),
                data.get('causale_termine'),
                etichetta,
                ass_id,
            )
        )
        conn.commit()
        row = conn.execute('SELECT * FROM assunzioni_hr WHERE id=?', (ass_id,)).fetchone()
        return jsonify(dict(row))
    finally:
        conn.close()


@bp.route('/api/assunzioni/<int:ass_id>', methods=['DELETE'])
@login_required
def delete_assunzione(ass_id):
    conn = get_db()
    try:
        row = conn.execute(
            'SELECT stato FROM assunzioni_hr WHERE id=?', (ass_id,)
        ).fetchone()
        if not row:
            return jsonify({'error': 'Pratica non trovata'}), 404
        if row['stato'] == 'completata':
            return jsonify({'error': 'Non è possibile eliminare una pratica completata'}), 409
        conn.execute('DELETE FROM assunzioni_hr WHERE id=?', (ass_id,))
        conn.commit()
        return jsonify({'ok': True})
    finally:
        conn.close()


@bp.route('/api/assunzioni/<int:ass_id>/completa', methods=['POST'])
@login_required
def completa_assunzione(ass_id):
    """
    Finalizza la pratica eseguendo le 4 azioni atomiche:
    1. Crea riga Workflow nello Scadenziario
    2. Crea riga Scadenza Futura (se prevista dalla matrice)
    3. Aggiorna status Employee → active
    4. Inserisce addebito in pratiche (Fatturazione/ClientCost)
    Tutta l'operazione è coperta da una singola transazione.
    """
    conn = get_db()
    try:
        row = conn.execute(
            'SELECT * FROM assunzioni_hr WHERE id=?', (ass_id,)
        ).fetchone()
        if not row:
            return jsonify({'error': 'Pratica non trovata'}), 404
        if row['stato'] == 'completata':
            return jsonify({'error': 'Pratica già completata'}), 409

        assunzione = dict(row)

        # Transazione atomica — se una qualsiasi azione fallisce,
        # rollback totale (nessuna pratica priva di fatturazione)
        conn.execute('BEGIN')
        try:
            _completa_assunzione(conn, assunzione)
            conn.execute('COMMIT')
        except Exception as e:
            conn.execute('ROLLBACK')
            return jsonify({'error': f'Errore durante il completamento: {str(e)}'}), 500

        row = conn.execute(
            '''SELECT a.*, e.nome as emp_nome, e.cognome as emp_cognome,
                      d.ragione_sociale as ditta_nome
               FROM assunzioni_hr a
               JOIN employees e ON e.id = a.employee_id
               JOIN ditte d ON d.id = a.ditta_id
               WHERE a.id=?''',
            (ass_id,)
        ).fetchone()
        return jsonify(dict(row))
    finally:
        conn.close()


# ═══════════════════════════════════════════════════════════════════════
# SCADENZIARIO
# ═══════════════════════════════════════════════════════════════════════

@bp.route('/api/scadenziario', methods=['GET'])
@login_required
def get_scadenziario():
    ditta_id    = request.args.get('ditta_id', type=int)
    tipo        = request.args.get('tipo')            # 'workflow' | 'scadenza'
    completata  = request.args.get('completata')      # '0' | '1' | None
    employee_id = request.args.get('employee_id', type=int)

    query = '''
        SELECT s.*,
               e.nome as emp_nome, e.cognome as emp_cognome,
               e.matricola_interna as emp_matricola,
               d.ragione_sociale as ditta_nome
        FROM scadenziario s
        JOIN ditte d ON d.id = s.ditta_id
        LEFT JOIN employees e ON e.id = s.employee_id
        WHERE 1=1
    '''
    params = []
    if ditta_id:
        query += ' AND s.ditta_id=?'
        params.append(ditta_id)
    if tipo:
        query += ' AND s.tipo=?'
        params.append(tipo)
    if completata is not None:
        query += ' AND s.completata=?'
        params.append(int(completata))
    if employee_id:
        query += ' AND s.employee_id=?'
        params.append(employee_id)
    query += ' ORDER BY s.data_evento ASC'

    conn = get_db()
    try:
        rows = conn.execute(query, params).fetchall()
        result = []
        for r in rows:
            d = dict(r)
            d['azioni'] = json.loads(d.get('azioni_json') or '[]')
            result.append(d)
        return jsonify(result)
    finally:
        conn.close()


@bp.route('/api/scadenziario/<int:sc_id>/azione', methods=['POST'])
@login_required
def segna_azione(sc_id):
    """Segna una singola azione della checklist come completata/non completata."""
    data   = request.get_json()
    idx    = data.get('idx')
    valore = bool(data.get('completata', True))

    conn = get_db()
    try:
        row = conn.execute(
            'SELECT azioni_json FROM scadenziario WHERE id=?', (sc_id,)
        ).fetchone()
        if not row:
            return jsonify({'error': 'Riga scadenziario non trovata'}), 404

        azioni = json.loads(row['azioni_json'] or '[]')
        if idx is None or idx < 0 or idx >= len(azioni):
            return jsonify({'error': 'Indice azione non valido'}), 400

        azioni[idx]['completata'] = valore
        tutte_completate = all(a.get('completata') for a in azioni) if azioni else False

        conn.execute(
            'UPDATE scadenziario SET azioni_json=?, completata=? WHERE id=?',
            (json.dumps(azioni), int(tutte_completate), sc_id)
        )
        conn.commit()
        return jsonify({'ok': True, 'azioni': azioni, 'completata': tutte_completate})
    finally:
        conn.close()


@bp.route('/api/scadenziario/<int:sc_id>', methods=['DELETE'])
@login_required
def delete_scadenziario(sc_id):
    conn = get_db()
    try:
        conn.execute('DELETE FROM scadenziario WHERE id=?', (sc_id,))
        conn.commit()
        return jsonify({'ok': True})
    finally:
        conn.close()


# ═══════════════════════════════════════════════════════════════════════
# LOOKUP: tipi pratica
# ═══════════════════════════════════════════════════════════════════════

@bp.route('/api/assunzioni/tipi', methods=['GET'])
@login_required
def get_tipi_assunzione():
    """Restituisce la lista dei tipi pratica disponibili dalla matrice."""
    result = [
        {'codice': k, 'label': v['label']}
        for k, v in MATRICE_ASSUNZIONI.items()
    ]
    return jsonify(result)
