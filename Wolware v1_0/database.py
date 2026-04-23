# database.py
# Gestione del database SQLite.
# Espone get_db() per aprire una connessione e init_db() per creare
# le tabelle al primo avvio e migrare quelle esistenti.
# Viene chiamato una sola volta da create_app() in app.py.

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

    # --- Tabella ditte (invariata) ---
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

    # --- Migrazione colonne ditte (per DB già esistenti) ---
    existing = [row[1] for row in c.execute("PRAGMA table_info(ditte)").fetchall()]
    for col, typedef in [
        ('cod_catastale', 'TEXT'), ('amministratore', 'TEXT'),
        ('cf_amministratore', 'TEXT'), ('tel_amministratore', 'TEXT'),
        ('email_amministratore', 'TEXT'),
        ('cedolino_onnicomprensivo', 'INTEGER DEFAULT 0'),
        ('sedi_json', 'TEXT'), ('inail_json', 'TEXT'),
        ('inps_json', 'TEXT'), ('cc_json', 'TEXT'), ('tariff_json', 'TEXT'),
    ]:
        if col not in existing:
            c.execute(f'ALTER TABLE ditte ADD COLUMN {col} {typedef}')

    # --- Tabella pratiche (invariata) ---
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

    # --- Tabella users (NUOVA) ---
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at TEXT DEFAULT (datetime('now'))
    )''')

    # --- Admin di default (solo se non esiste) ---
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

    # --- Tabella voci di costo ---
    c.execute('''CREATE TABLE IF NOT EXISTS voci_costo (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        macrogruppo_id INTEGER NOT NULL,
        nome TEXT NOT NULL,
        prezzo REAL DEFAULT 0.0,
        unita TEXT,
        note TEXT,
        ordine INTEGER DEFAULT 0,
        FOREIGN KEY (macrogruppo_id) REFERENCES macrogruppi(id)
    )''')

    conn.commit()
    conn.close()