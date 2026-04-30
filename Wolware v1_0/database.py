# database.py
import sqlite3
from werkzeug.security import generate_password_hash
from config import DB_PATH


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    c = conn.cursor()

    # ═══════════════════════════════════════════════════════════════════
    # TABELLA: ditte (clienti dello studio)
    # ═══════════════════════════════════════════════════════════════════
    c.execute('''CREATE TABLE IF NOT EXISTS ditte (
        id                      INTEGER PRIMARY KEY AUTOINCREMENT,
        ragione_sociale         TEXT NOT NULL,
        partita_iva             TEXT UNIQUE,
        codice_fiscale          TEXT,
        forma_giuridica         TEXT,
        settore_ateco           TEXT,
        codice_ateco            TEXT,
        indirizzo               TEXT,
        citta                   TEXT,
        cap                     TEXT,
        provincia               TEXT,
        cod_catastale           TEXT,
        amministratore          TEXT,
        cf_amministratore       TEXT,
        tel_amministratore      TEXT,
        email_amministratore    TEXT,
        telefono                TEXT,
        email                   TEXT,
        pec                     TEXT,
        referente               TEXT,
        cedolino_onnicomprensivo INTEGER DEFAULT 0,
        sedi_json               TEXT,
        inail_json              TEXT,
        inps_json               TEXT,
        cc_json                 TEXT,
        tariff_json             TEXT,
        data_inizio_rapporto    TEXT,
        note                    TEXT,
        cadenza_pagamenti       TEXT DEFAULT 'libero',
        residuo_iniziale        REAL DEFAULT 0.0,
        inizio_paghe            TEXT,
        fine_paghe              TEXT,
        inizio_contabilita      TEXT,
        fine_contabilita        TEXT,
        archiviato              INTEGER DEFAULT 0,
        annotazioni             TEXT,
        tariffario_nome         TEXT,
        tariffario_id           INTEGER REFERENCES tariffari(id),
        created_at              TEXT DEFAULT (datetime('now'))
    )''')

    # --- Migrazione colonne ditte (per DB già esistenti) ---
    existing_ditte = [row[1] for row in c.execute("PRAGMA table_info(ditte)").fetchall()]
    for col, typedef in [
        ('cod_catastale',            'TEXT'),
        ('amministratore',           'TEXT'),
        ('cf_amministratore',        'TEXT'),
        ('tel_amministratore',       'TEXT'),
        ('email_amministratore',     'TEXT'),
        ('cedolino_onnicomprensivo', 'INTEGER DEFAULT 0'),
        ('sedi_json',                'TEXT'),
        ('inail_json',               'TEXT'),
        ('inps_json',                'TEXT'),
        ('cc_json',                  'TEXT'),
        ('tariff_json',              'TEXT'),
        ('tariffario_id',            'INTEGER REFERENCES tariffari(id)'),
        # ── Nuove colonne spec Volume 2 ──
        ('cadenza_pagamenti',        "TEXT DEFAULT 'libero'"),
        ('residuo_iniziale',         'REAL DEFAULT 0.0'),
        ('inizio_paghe',             'TEXT'),
        ('fine_paghe',               'TEXT'),
        ('inizio_contabilita',       'TEXT'),
        ('fine_contabilita',         'TEXT'),
        ('archiviato',               'INTEGER DEFAULT 0'),
        ('annotazioni',              'TEXT'),
        ('tariffario_nome',          'TEXT'),
    ]:
        if col not in existing_ditte:
            c.execute(f'ALTER TABLE ditte ADD COLUMN {col} {typedef}')

    # ═══════════════════════════════════════════════════════════════════
    # TABELLA: pratiche
    # La vecchia struttura (v1) era un task-tracker con tipo_pratica,
    # stato, priorita — incompatibile con la spec Volume 2.
    # Se trova la vecchia struttura: la rinomina in pratiche_legacy
    # (i dati non vengono persi) e crea la nuova.
    # ═══════════════════════════════════════════════════════════════════
    tables = [r[0] for r in c.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]

    if 'pratiche' in tables:
        pratiche_cols = [row[1] for row in c.execute("PRAGMA table_info(pratiche)").fetchall()]
        if 'tipo_pratica' in pratiche_cols and 'anno' not in pratiche_cols:
            c.execute('ALTER TABLE pratiche RENAME TO pratiche_legacy')

    c.execute('''CREATE TABLE IF NOT EXISTS pratiche (
        id               INTEGER PRIMARY KEY AUTOINCREMENT,
        ditta_id         INTEGER NOT NULL REFERENCES ditte(id),
        anno             INTEGER NOT NULL,
        mese             INTEGER NOT NULL CHECK(mese BETWEEN 1 AND 12),
        tipo             TEXT NOT NULL DEFAULT 'costo_fisso',
        macrogruppo_id   INTEGER REFERENCES macrogruppi(id),
        macrogruppo_nome TEXT,
        voce_id          INTEGER REFERENCES ditta_voci(id),
        nome             TEXT NOT NULL,
        quantita         REAL DEFAULT 1.0,
        prezzo           REAL DEFAULT 0.0,
        importo          REAL DEFAULT 0.0,
        esente_iva       INTEGER DEFAULT 0,
        data_esecuzione  TEXT,
        note             TEXT,
        created_at       TEXT DEFAULT (datetime('now', 'localtime'))
    )''')

    # ═══════════════════════════════════════════════════════════════════
    # TABELLA: pagamenti
    # ═══════════════════════════════════════════════════════════════════
    c.execute('''CREATE TABLE IF NOT EXISTS pagamenti (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        ditta_id   INTEGER NOT NULL REFERENCES ditte(id),
        anno       INTEGER NOT NULL,
        data       TEXT NOT NULL,
        importo    REAL NOT NULL,
        metodo     TEXT DEFAULT 'Cassa',
        note       TEXT,
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )''')

    # ═══════════════════════════════════════════════════════════════════
    # TABELLA: arrotondamenti
    # importo è sempre positivo; tipo determina il segno:
    #   'abbuono'  → diminuisce il residuo
    #   'addebito' → aumenta il residuo
    # ═══════════════════════════════════════════════════════════════════
    c.execute('''CREATE TABLE IF NOT EXISTS arrotondamenti (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        ditta_id   INTEGER NOT NULL REFERENCES ditte(id),
        data       TEXT NOT NULL,
        tipo       TEXT NOT NULL DEFAULT 'abbuono' CHECK(tipo IN ('abbuono','addebito')),
        importo    REAL NOT NULL CHECK(importo >= 0),
        note       TEXT,
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )''')

    # ═══════════════════════════════════════════════════════════════════
    # TABELLA: users
    # ═══════════════════════════════════════════════════════════════════
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        username      TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role          TEXT DEFAULT 'user',
        created_at    TEXT DEFAULT (datetime('now'))
    )''')

    exists = c.execute("SELECT id FROM users WHERE username='admin'").fetchone()
    if not exists:
        c.execute(
            "INSERT INTO users (username, password_hash, role) VALUES (?,?,?)",
            ('admin', generate_password_hash('admin123'), 'admin')
        )

    # ═══════════════════════════════════════════════════════════════════
    # TABELLA: tariffari
    # ═══════════════════════════════════════════════════════════════════
    c.execute('''CREATE TABLE IF NOT EXISTS tariffari (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        nome       TEXT NOT NULL,
        note       TEXT,
        created_at TEXT DEFAULT (datetime('now'))
    )''')

    # ═══════════════════════════════════════════════════════════════════
    # TABELLA: macrogruppi
    # tipo: 'fisso_mensile' | 'fisso_annuale' | 'variabile_mensile' | 'variabile_annuale'
    # ═══════════════════════════════════════════════════════════════════
    c.execute('''CREATE TABLE IF NOT EXISTS macrogruppi (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        tariffario_id INTEGER NOT NULL REFERENCES tariffari(id),
        nome          TEXT NOT NULL,
        tipo          TEXT NOT NULL DEFAULT 'fisso_mensile',
        ordine        INTEGER DEFAULT 0
    )''')

    # ═══════════════════════════════════════════════════════════════════
    # TABELLA: voci_costo (voci del tariffario globale)
    # ═══════════════════════════════════════════════════════════════════
    c.execute('''CREATE TABLE IF NOT EXISTS voci_costo (
        id                       INTEGER PRIMARY KEY AUTOINCREMENT,
        macrogruppo_id           INTEGER NOT NULL REFERENCES macrogruppi(id),
        nome                     TEXT NOT NULL,
        prezzo                   REAL DEFAULT 0.0,
        esente_iva               INTEGER DEFAULT 0,
        richiede_anno_precedente INTEGER DEFAULT 0,
        mesi_json                TEXT,
        note                     TEXT,
        ordine                   INTEGER DEFAULT 0
    )''')

    existing_vc = [row[1] for row in c.execute("PRAGMA table_info(voci_costo)").fetchall()]
    for col, typedef in [
        ('esente_iva',               'INTEGER DEFAULT 0'),
        ('richiede_anno_precedente', 'INTEGER DEFAULT 0'),
        ('mesi_json',                'TEXT'),
    ]:
        if col not in existing_vc:
            c.execute(f'ALTER TABLE voci_costo ADD COLUMN {col} {typedef}')

    # ═══════════════════════════════════════════════════════════════════
    # TABELLA: ditta_voci (copia personalizzata del tariffario per cliente)
    # ═══════════════════════════════════════════════════════════════════
    c.execute('''CREATE TABLE IF NOT EXISTS ditta_voci (
        id                       INTEGER PRIMARY KEY AUTOINCREMENT,
        ditta_id                 INTEGER NOT NULL REFERENCES ditte(id),
        voce_costo_id            INTEGER REFERENCES voci_costo(id),
        nome                     TEXT NOT NULL,
        prezzo                   REAL DEFAULT 0.0,
        unita                    TEXT,
        note                     TEXT,
        macrogruppo_nome         TEXT,
        macrogruppo_id           INTEGER REFERENCES macrogruppi(id),
        tipo                     TEXT DEFAULT 'fisso_mensile',
        custom                   INTEGER DEFAULT 0,
        esente_iva               INTEGER DEFAULT 0,
        richiede_anno_precedente INTEGER DEFAULT 0,
        mesi_json                TEXT,
        sync_override            INTEGER DEFAULT 0
    )''')

    existing_dv = [row[1] for row in c.execute("PRAGMA table_info(ditta_voci)").fetchall()]
    for col, typedef in [
        ('esente_iva',               'INTEGER DEFAULT 0'),
        ('richiede_anno_precedente', 'INTEGER DEFAULT 0'),
        ('mesi_json',                'TEXT'),
        ('sync_override',            'INTEGER DEFAULT 0'),
        ('macrogruppo_id',           'INTEGER REFERENCES macrogruppi(id)'),
    ]:
        if col not in existing_dv:
            c.execute(f'ALTER TABLE ditta_voci ADD COLUMN {col} {typedef}')

    # ═══════════════════════════════════════════════════════════════════
    # TABELLA: storico_tariffari
    # ═══════════════════════════════════════════════════════════════════
    c.execute('''CREATE TABLE IF NOT EXISTS storico_tariffari (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        ditta_id        INTEGER NOT NULL REFERENCES ditte(id),
        tariffario_id   INTEGER REFERENCES tariffari(id),
        tariffario_nome TEXT,
        cambiato_il     TEXT DEFAULT (datetime('now','localtime')),
        note            TEXT
    )''')

    conn.commit()
    conn.close()