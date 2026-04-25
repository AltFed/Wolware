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

    # --- Tabella ditte ---
    c.execute('''CREATE TABLE IF NOT EXISTS ditte (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ragione_sociale TEXT NOT NULL,
        partita_iva TEXT UNIQUE,
        codice_fiscale TEXT,
        forma_giuridica TEXT,
        settore_ateco TEXT,
        codice_ateco TEXT,
        indirizzo TEXT,
        citta TEXT,
        cap TEXT,
        provincia TEXT,
        cod_catastale TEXT,
        amministratore TEXT,
        cf_amministratore TEXT,
        tel_amministratore TEXT,
        email_amministratore TEXT,
        telefono TEXT,
        email TEXT,
        pec TEXT,
        referente TEXT,
        cedolino_onnicomprensivo INTEGER DEFAULT 0,
        sedi_json TEXT,
        inail_json TEXT,
        inps_json TEXT,
        cc_json TEXT,
        tariff_json TEXT,
        data_inizio_rapporto TEXT,
        note TEXT,
        created_at TEXT DEFAULT (datetime('now'))
    )''')

    # --- Migrazione colonne ditte ---
    existing = [row[1] for row in c.execute("PRAGMA table_info(ditte)").fetchall()]
    for col, typedef in [
        ('cod_catastale', 'TEXT'),
        ('amministratore', 'TEXT'),
        ('cf_amministratore', 'TEXT'),
        ('tel_amministratore', 'TEXT'),
        ('email_amministratore', 'TEXT'),
        ('cedolino_onnicomprensivo', 'INTEGER DEFAULT 0'),
        ('sedi_json', 'TEXT'),
        ('inail_json', 'TEXT'),
        ('inps_json', 'TEXT'),
        ('cc_json', 'TEXT'),
        ('tariff_json', 'TEXT'),
        ('tariffario_id', 'INTEGER'),
    ]:
        if col not in existing:
            c.execute(f'ALTER TABLE ditte ADD COLUMN {col} {typedef}')

    # --- Tabella pratiche ---
    c.execute('''CREATE TABLE IF NOT EXISTS pratiche (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ditta_id INTEGER,
        tipo_pratica TEXT NOT NULL,
        descrizione TEXT,
        stato TEXT DEFAULT 'Aperta',
        priorita TEXT DEFAULT 'Normale',
        data_apertura TEXT,
        data_scadenza TEXT,
        data_chiusura TEXT,
        note TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (ditta_id) REFERENCES ditte(id)
    )''')

    # --- Tabella users ---
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at TEXT DEFAULT (datetime('now'))
    )''')

    # --- Admin di default ---
    exists = c.execute("SELECT id FROM users WHERE username='admin'").fetchone()
    if not exists:
        c.execute(
            "INSERT INTO users (username, password_hash, role) VALUES (?,?,?)",
            ('admin', generate_password_hash('admin123'), 'admin')
        )

    # --- Tabella tariffari globali ---
    c.execute('''CREATE TABLE IF NOT EXISTS tariffari (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        note TEXT,
        created_at TEXT DEFAULT (datetime('now'))
    )''')

    # --- Tabella macrogruppi ---
    c.execute('''CREATE TABLE IF NOT EXISTS macrogruppi (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tariffario_id INTEGER NOT NULL,
        nome TEXT NOT NULL,
        tipo TEXT NOT NULL DEFAULT 'fisso_mensile',
        ordine INTEGER DEFAULT 0,
        FOREIGN KEY (tariffario_id) REFERENCES tariffari(id)
    )''')

    # --- Tabella voci di costo (tariffario standard) ---
    c.execute('''CREATE TABLE IF NOT EXISTS voci_costo (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        macrogruppo_id INTEGER NOT NULL,
        nome TEXT NOT NULL,
        prezzo REAL DEFAULT 0.0,
        esente_iva INTEGER DEFAULT 0,
        richiede_anno_precedente INTEGER DEFAULT 0,
        mesi_json TEXT,
        note TEXT,
        ordine INTEGER DEFAULT 0,
        FOREIGN KEY (macrogruppo_id) REFERENCES macrogruppi(id)
    )''')

    # --- Migrazione colonne voci_costo ---
    existing_vc = [row[1] for row in c.execute("PRAGMA table_info(voci_costo)").fetchall()]
    for col, typedef in [
        ('esente_iva', 'INTEGER DEFAULT 0'),
        ('richiede_anno_precedente', 'INTEGER DEFAULT 0'),
        ('mesi_json', 'TEXT'),
    ]:
        if col not in existing_vc:
            c.execute(f'ALTER TABLE voci_costo ADD COLUMN {col} {typedef}')

    # --- Tabella voci custom per singola ditta ---
    c.execute('''CREATE TABLE IF NOT EXISTS ditta_voci (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ditta_id INTEGER NOT NULL,
        voce_costo_id INTEGER,
        nome TEXT NOT NULL,
        prezzo REAL DEFAULT 0.0,
        unita TEXT,
        note TEXT,
        macrogruppo_nome TEXT,
        tipo TEXT DEFAULT 'fisso_mensile',
        custom INTEGER DEFAULT 0,
        FOREIGN KEY (ditta_id) REFERENCES ditte(id),
        FOREIGN KEY (voce_costo_id) REFERENCES voci_costo(id)
    )''')


    # --- Migrazione ditte.tariffario_id ---
    existing_ditte_cols = [row[1] for row in c.execute("PRAGMA table_info(ditte)").fetchall()]
    if 'tariffario_id' not in existing_ditte_cols:
        c.execute("ALTER TABLE ditte ADD COLUMN tariffario_id INTEGER REFERENCES tariffari(id)")

    # --- Migrazione ditta_voci (nuovi campi v2) ---
    existing_dv_cols = [row[1] for row in c.execute("PRAGMA table_info(ditta_voci)").fetchall()]
    for col, typedef in [
        ('esente_iva',               'INTEGER DEFAULT 0'),
        ('richiede_anno_precedente', 'INTEGER DEFAULT 0'),
        ('mesi_json',                'TEXT'),
    ]:
        if col not in existing_dv_cols:
            c.execute(f'ALTER TABLE ditta_voci ADD COLUMN {col} {typedef}')
    # --- Tabella storico_tariffari ---
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