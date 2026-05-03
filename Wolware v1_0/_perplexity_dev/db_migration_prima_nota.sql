-- ══════════════════════════════════════════════════════════════════
-- Migrazione DB: Prima Nota Studio — Blocco 1
-- Queste tabelle vengono create automaticamente da database.py
-- Questo file è puramente documentativo / per test manuali
-- ══════════════════════════════════════════════════════════════════

-- Tabella banche dello studio
CREATE TABLE IF NOT EXISTS banche_studio (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    nome           TEXT NOT NULL,
    saldo_iniziale REAL DEFAULT 0.0,
    ordine         INTEGER DEFAULT 0,
    colore         TEXT DEFAULT '#6366f1',
    created_at     TEXT DEFAULT (datetime('now', 'localtime'))
);

-- Tabella movimenti studio
-- tipologia: 'cassa' oppure 'banca_<id>'
-- tipo: 'entrata' | 'uscita' | 'giroconto'
-- macrogruppo_id: 'clienti' (speciale) | id numerico | NULL per giroconti
CREATE TABLE IF NOT EXISTS movimenti_studio (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo             TEXT NOT NULL CHECK(tipo IN ('entrata','uscita','giroconto')),
    data             TEXT NOT NULL,
    tipologia        TEXT NOT NULL,
    macrogruppo_id   TEXT,
    macrogruppo_nome TEXT,
    sottovoce_id     TEXT,
    sottovoce_nome   TEXT,
    importo          REAL NOT NULL CHECK(importo >= 0),
    descrizione      TEXT,
    giroconto_id     TEXT,
    giroconto_dir    TEXT CHECK(giroconto_dir IN ('entrata','uscita',NULL)),
    created_at       TEXT DEFAULT (datetime('now', 'localtime'))
);

-- Flag movimenti fatturati
-- Un movimento compare qui quando è stato marcato come fatturato
CREATE TABLE IF NOT EXISTS movimenti_fatturati (
    movimento_id      INTEGER PRIMARY KEY REFERENCES movimenti_studio(id) ON DELETE CASCADE,
    data_fatturazione TEXT DEFAULT (datetime('now', 'localtime'))
);

-- Macrogruppi entrate (categorie libere)
CREATE TABLE IF NOT EXISTS macrogruppi_entrate (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    nome       TEXT NOT NULL,
    ordine     INTEGER DEFAULT 0
);

-- Sottovoci macrogruppi entrate
CREATE TABLE IF NOT EXISTS sottovoci_entrate (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    macrogruppo_id INTEGER NOT NULL REFERENCES macrogruppi_entrate(id),
    nome           TEXT NOT NULL,
    ordine         INTEGER DEFAULT 0
);

-- Macrogruppi uscite
CREATE TABLE IF NOT EXISTS macrogruppi_uscite (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    nome   TEXT NOT NULL,
    ordine INTEGER DEFAULT 0
);

-- Sottovoci macrogruppi uscite
CREATE TABLE IF NOT EXISTS sottovoci_uscite (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    macrogruppo_id INTEGER NOT NULL REFERENCES macrogruppi_uscite(id),
    nome           TEXT NOT NULL,
    ordine         INTEGER DEFAULT 0
);

-- Impostazioni generali studio (usate anche per saldo iniziale Cassa)
CREATE TABLE IF NOT EXISTS impostazioni (
    chiave TEXT PRIMARY KEY,
    valore TEXT
);

-- Dati di test
INSERT OR IGNORE INTO banche_studio (nome, saldo_iniziale, ordine) VALUES
    ('Intesa SP', 15840.00, 1),
    ('Unicredit',  8500.00, 2),
    ('BNL',        3200.00, 3);

INSERT OR IGNORE INTO macrogruppi_entrate (nome, ordine) VALUES
    ('Clienti', 0),
    ('Servizi', 1),
    ('Altro',   2);

INSERT OR IGNORE INTO macrogruppi_uscite (nome, ordine) VALUES
    ('Affitto',     0),
    ('Utenze',      1),
    ('Personale',   2),
    ('Forniture',   3);
