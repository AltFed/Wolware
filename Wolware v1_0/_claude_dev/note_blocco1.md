# Note implementazione Blocco 1 — Prima Nota Studio

## File creati/modificati in questo branch

### Nuovi file
| File | Descrizione |
|---|---|
| `routes/prima_nota.py` | Blueprint Flask con tutte le API REST del Blocco 1 |
| `_perplexity_dev/` | Cartella di appoggio (SQL migration, test, note) |

### File da modificare manualmente (istruzioni sotto)
| File | Modifica richiesta |
|---|---|
| `app.py` | Registrare il blueprint `prima_nota` |
| `database.py` | Aggiungere le tabelle Prima Nota in `init_db()` |
| `templates/index.html` | Aggiungere la sezione `#tab-prima-nota` e i nav item |
| `static/js/app.js` | Aggiungere il modulo `PrimaNota` |
| `static/css/style.css` | Aggiungere gli stili Prima Nota |

---

## 1. Patch app.py

Aggiungere dopo gli altri import di blueprint:

```python
from routes.prima_nota import bp as prima_nota_bp
```

Aggiungere nel blocco `app.register_blueprint(...)`:

```python
app.register_blueprint(prima_nota_bp)
```

---

## 2. Patch database.py — tabelle da aggiungere in init_db()

```python
# ═══════════════════════════════════════════════════════════════════
# TABELLE: Prima Nota Studio
# ═══════════════════════════════════════════════════════════════════

c.execute('''CREATE TABLE IF NOT EXISTS banche_studio (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    nome           TEXT NOT NULL,
    saldo_iniziale REAL DEFAULT 0.0,
    ordine         INTEGER DEFAULT 0,
    colore         TEXT DEFAULT '#6366f1',
    created_at     TEXT DEFAULT (datetime('now', 'localtime'))
)''')

c.execute('''CREATE TABLE IF NOT EXISTS movimenti_studio (
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
)''')

c.execute('''CREATE TABLE IF NOT EXISTS movimenti_fatturati (
    movimento_id      INTEGER PRIMARY KEY REFERENCES movimenti_studio(id) ON DELETE CASCADE,
    data_fatturazione TEXT DEFAULT (datetime('now', 'localtime'))
)''')

c.execute('''CREATE TABLE IF NOT EXISTS macrogruppi_entrate (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    nome   TEXT NOT NULL,
    ordine INTEGER DEFAULT 0
)''')

c.execute('''CREATE TABLE IF NOT EXISTS sottovoci_entrate (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    macrogruppo_id INTEGER NOT NULL REFERENCES macrogruppi_entrate(id),
    nome           TEXT NOT NULL,
    ordine         INTEGER DEFAULT 0
)''')

c.execute('''CREATE TABLE IF NOT EXISTS macrogruppi_uscite (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    nome   TEXT NOT NULL,
    ordine INTEGER DEFAULT 0
)''')

c.execute('''CREATE TABLE IF NOT EXISTS sottovoci_uscite (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    macrogruppo_id INTEGER NOT NULL REFERENCES macrogruppi_uscite(id),
    nome           TEXT NOT NULL,
    ordine         INTEGER DEFAULT 0
)''')

c.execute('''CREATE TABLE IF NOT EXISTS impostazioni (
    chiave TEXT PRIMARY KEY,
    valore TEXT
)''')

# Migrazione: aggiungi colonna movimenti_studio_id ai pagamenti
existing_pag = [row[1] for row in c.execute("PRAGMA table_info(pagamenti)").fetchall()]
if 'movimenti_studio_id' not in existing_pag:
    c.execute('ALTER TABLE pagamenti ADD COLUMN movimenti_studio_id INTEGER REFERENCES movimenti_studio(id)')
```

---

## 3. Patch index.html — nav item da aggiungere nella sidebar

```html
<!-- Aggiungere tra Tariffari e Clienti nel sidebar-nav -->
<a href="#" class="nav-item" data-tab="prima-nota">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="2" y="5" width="20" height="14" rx="2"/>
    <line x1="2" y1="10" x2="22" y2="10"/>
  </svg>
  Prima Nota
</a>
```

E il tab button nella topbar:

```html
<button class="tab-btn" data-tab="prima-nota">
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="2" y="5" width="20" height="14" rx="2"/>
    <line x1="2" y1="10" x2="22" y2="10"/>
  </svg>
  Prima Nota
</button>
```

---

## 4. Sezione HTML tab-prima-nota (da inserire in index.html)

Vedi il file `prima_nota_section.html` in questa cartella.

---

## 5. Struttura dati MovimentoStudio

```
MovimentoStudio {
  id: int
  tipo: 'entrata' | 'uscita' | 'giroconto'
  data: 'YYYY-MM-DD'
  tipologia: 'cassa' | 'banca_<id>'
  macrogruppo_id: 'clienti' | '<int>' | null
  macrogruppo_nome: str
  sottovoce_id: str | null
  sottovoce_nome: str
  importo: float (sempre positivo)
  descrizione: str
  giroconto_id: str (UUID condiviso tra le 2 gambe) | null
  giroconto_dir: 'entrata' | 'uscita' | null
}
```

## 6. Flag fatturato — logica

| Stato | Icona | Colore | Condizione |
|---|---|---|---|
| Fatturato | ✓ | verde | id in movimenti_fatturati |
| Urgente | ! | arancione | non fatturato + data > 7 giorni fa |
| Da fatturare | ○ | grigio | non fatturato + recente |

Click su ✓ → `PATCH /api/prima-nota/movimenti/<id>/rimuovi-fatturato`

## 7. Eliminazione giroconto — fix bug

La route DELETE gestisce il bug noto:
- Se `tipo='giroconto'` e `giroconto_id` è presente,
  elimina **entrambe** le gambe cercando altri movimenti con lo stesso `giroconto_id`.
- Il frontend deve mostrare una confirm dialog:
  *"Stai eliminando un giroconto: verranno rimossi entrambi i movimenti collegati. Procedere?"*
