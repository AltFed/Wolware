#!/usr/bin/env python3
"""
database.py
Gestione SQLite: connessione, creazione tabelle e funzioni di utilità.
Tutte le tabelle rispecchiano la struttura dati dell'originale Supabase.
"""
import sqlite3
import json
import os
from pathlib import Path
from contextlib import contextmanager

# Percorso del database (stessa cartella dell'eseguibile)
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'gestione_clienti.db')


@contextmanager
def get_conn():
    """Context manager: apre connessione, commit automatico, chiude."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row          # accesso per nome colonna
    conn.execute("PRAGMA journal_mode=WAL") # scritture concorrenti sicure
    conn.execute("PRAGMA foreign_keys=ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


# ── JSON helpers ──────────────────────────────────────────────────────────────
def to_json(val) -> str:
    """Converte dict/list in stringa JSON per salvataggio."""
    return json.dumps(val, ensure_ascii=False) if val is not None else None


def from_json(val):
    """Converte stringa JSON in dict/list, gestisce None e stringhe vuote."""
    if not val:
        return None
    try:
        return json.loads(val)
    except (json.JSONDecodeError, TypeError):
        return val


# ── Creazione tabelle ─────────────────────────────────────────────────────────
SCHEMA_SQL = """
-- Clienti
CREATE TABLE IF NOT EXISTS clienti (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    denominazione       TEXT    NOT NULL,
    codicefiscale       TEXT,
    email               TEXT,
    telefono            TEXT,
    indirizzo           TEXT,
    tariffario          TEXT,   -- JSON array voci
    tariffariobaseid    INTEGER,
    tariffarionome      TEXT,
    cadenzapagamenti    TEXT,   -- mensile|trimestrale|quadrimestrale|semestrale|libero
    residuoiniziale     REAL    DEFAULT 0,
    iniziopaghe         TEXT,   -- ISO date
    finepaghe           TEXT,
    iniziocontabilita   TEXT,
    finecontabilita     TEXT,
    annotazioni         TEXT,
    archiviato          INTEGER DEFAULT 0,
    storicotariffari    TEXT,   -- JSON array
    prezziPratiche      TEXT,   -- JSON oggetto
    updated_at          TEXT    DEFAULT (datetime('now')),
    costiStorico        TEXT    -- JSON array { data, descrizione, importo }
);

-- Pagamenti
CREATE TABLE IF NOT EXISTS pagamenti (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    clienteid           INTEGER NOT NULL,
    data                TEXT    NOT NULL,
    importo             REAL    NOT NULL DEFAULT 0,
    mezzo               TEXT,
    movimentostudioid   INTEGER,
    tipologia           TEXT,
    note                TEXT,
    FOREIGN KEY (clienteid) REFERENCES clienti(id) ON DELETE CASCADE
);

-- Movimenti Studio (Prima Nota)
CREATE TABLE IF NOT EXISTS movimentistudio (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo            TEXT    NOT NULL, -- entrata|uscita|giroconto
    data            TEXT    NOT NULL,
    tipologia       TEXT,             -- cassa | banca <id>
    macrogruppoid   INTEGER,
    macrogrupponome TEXT,
    sottovoceid     INTEGER,
    sottovocenome   TEXT,
    importo         REAL    NOT NULL DEFAULT 0,
    descrizione     TEXT,
    girocontodir    TEXT              -- entrata|uscita (solo per giroconti)
);

-- Tariffari Base
CREATE TABLE IF NOT EXISTS tariffaribase (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nome        TEXT    NOT NULL,
    macrogruppi TEXT    -- JSON array { nome, voci[] }
);

-- Pratiche Clienti (per mese)
CREATE TABLE IF NOT EXISTS praticheclienti (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    clienteid   INTEGER NOT NULL,
    mese        TEXT    NOT NULL,  -- formato AAAA-MM
    pratiche    TEXT,              -- JSON oggetto pratiche del mese
    UNIQUE(clienteid, mese),
    FOREIGN KEY (clienteid) REFERENCES clienti(id) ON DELETE CASCADE
);

-- Banche Studio
CREATE TABLE IF NOT EXISTS banchestudio (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    nome            TEXT    NOT NULL,
    saldoiniziale   REAL    DEFAULT 0
);

-- Macrogruppi Entrate
CREATE TABLE IF NOT EXISTS macrogruppientrate (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nome        TEXT NOT NULL,
    sottovoci   TEXT -- JSON array { id, nome }
);

-- Macrogruppi Uscite
CREATE TABLE IF NOT EXISTS macrogruppiuscite (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nome        TEXT NOT NULL,
    sottovoci   TEXT -- JSON array { id, nome }
);

-- Impostazioni Studio
CREATE TABLE IF NOT EXISTS impostazionistudio (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    ragionesociale          TEXT,
    piva                    TEXT,
    codicefiscale           TEXT,
    indirizzo               TEXT,
    telefono                TEXT,
    email                   TEXT,
    pec                     TEXT,
    banca                   TEXT,
    iban                    TEXT,
    prossimonumerofattura   INTEGER DEFAULT 1,
    annofatture             INTEGER,
    sezionale               TEXT,
    passwordhash            TEXT,
    ultimobackup            TEXT
);

-- Fatture Emesse
CREATE TABLE IF NOT EXISTS fattureemesse (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    numero              INTEGER,
    data                TEXT,
    clienteid           INTEGER,
    clientedenominazione TEXT,
    imponibile          REAL DEFAULT 0,
    iva                 REAL DEFAULT 0,
    totale              REAL DEFAULT 0
);

-- Movimenti Fatturati (IDs movimento già fatturati)
CREATE TABLE IF NOT EXISTS movimentifatturati (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    movimentoid INTEGER NOT NULL UNIQUE,
    fatturaid   INTEGER
);

-- Arrotondamenti (Abbuoni)
CREATE TABLE IF NOT EXISTS arrotondamenti (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    clienteid   INTEGER NOT NULL,
    data        TEXT    NOT NULL,
    importo     REAL    NOT NULL DEFAULT 0,
    note        TEXT,
    FOREIGN KEY (clienteid) REFERENCES clienti(id) ON DELETE CASCADE
);

-- Ultimi Estratti Conto
CREATE TABLE IF NOT EXISTS ultimiestratticonto (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    clienteid   INTEGER NOT NULL UNIQUE,
    data        TEXT,
    FOREIGN KEY (clienteid) REFERENCES clienti(id) ON DELETE CASCADE
);

-- Contabilizzazioni (voci già contabilizzate per cliente/mese)
CREATE TABLE IF NOT EXISTS contabilizzazioni (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    clienteid   INTEGER NOT NULL,
    mese        TEXT    NOT NULL,
    voce        TEXT,
    FOREIGN KEY (clienteid) REFERENCES clienti(id) ON DELETE CASCADE
);
"""


def init_db() -> None:
    """Crea tutte le tabelle se non esistono. Chiamata all'avvio."""
    with get_conn() as conn:
        conn.executescript(SCHEMA_SQL)
    print(f"[DB] Inizializzato: {DB_PATH}")
