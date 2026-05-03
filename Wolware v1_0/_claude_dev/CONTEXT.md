# Contesto progetto Wolware — Prima Nota Studio
_Aggiornato: 2026-05-03_

## Progetto

**Wolware** è un gestionale Flask/SQLite per studi di consulenza del lavoro (CDL).
Stack: Python 3.14 + Flask, SQLite (`wolware.db`), JS vanilla, CSS custom.
Entry point: `app.py` → `create_app()` → blueprints in `routes/`.
Frontend: SPA con tab switching in `static/js/app.js`, stili in `static/css/style.css`,
unico template `templates/index.html`.

## Branch corrente: `prima-nota`

Branch dedicato all'implementazione del modulo **Prima Nota Studio** (Blocco 1–4).
Rinominato da `perplexity`. Ownership: Claude.

## Stato implementazione

### ✅ Blocco 1 — Prima Nota Studio (COMPLETO)

| Componente | File | Stato |
|---|---|---|
| Blueprint API REST | `routes/prima_nota.py` | ✅ Completo |
| Registrazione blueprint | `app.py` | ✅ Fatto |
| Tabelle DB (7 tabelle) | `database.py` | ✅ Fatto |
| Nav item + tab button | `templates/index.html` | ✅ Fatto |
| Sezione HTML tab-panel | `templates/index.html` | ✅ Fatto |
| Modulo JS PrimaNota | `static/js/app.js` | ✅ Fatto |
| CSS Prima Nota | `static/css/style.css` | ✅ Fatto |

#### API disponibili (Blocco 1)
- `GET /api/prima-nota/saldi` — saldi cassa + banche
- `GET /api/prima-nota/movimenti` — lista movimenti (filtri: anno, mese, tipo, cerca)
- `GET /api/prima-nota/anni` — anni presenti per filtro
- `GET /api/prima-nota/clienti-da-sollecitare` — clienti con residuo > 0
- `DELETE /api/prima-nota/movimenti/<id>` — elimina movimento (gestisce giroconto e pagamento collegato)
- `PATCH /api/prima-nota/movimenti/<id>/rimuovi-fatturato` — rimuove flag fatturato

#### Tabelle DB create
- `banche_studio` — banche configurate dello studio
- `movimenti_studio` — movimenti cassa/banca/giroconto
- `movimenti_fatturati` — flag fatturato per entrate
- `macrogruppi_entrate` / `sottovoci_entrate` — categorie entrate
- `macrogruppi_uscite` / `sottovoci_uscite` — categorie uscite
- `impostazioni` — saldo iniziale cassa e altre config
- Migrazione: colonna `movimenti_studio_id` aggiunta a `pagamenti`

### ⏳ Blocco 2 — Form nuovo movimento (DA FARE)

Richiede:
- Modal HTML per inserimento movimento (entrata/uscita/giroconto)
- Selezione categoria (macrogruppo + sottovoce, con "clienti" speciale)
- `POST /api/prima-nota/movimenti` — crea movimento
- Se entrata da cliente: creare anche riga in `pagamenti`

### ⏳ Blocco 3 — Gestione Banche (DA FARE)

- Modal CRUD banche (`banche_studio`)
- `GET/POST/PUT/DELETE /api/prima-nota/banche`

### ⏳ Blocco 4 — Categorie e impostazioni (DA FARE)

- Modal CRUD macrogruppi/sottovoci entrate e uscite
- Impostazione saldo iniziale cassa
- `GET/POST/PUT/DELETE /api/prima-nota/categorie`
- `PUT /api/prima-nota/impostazioni`

## Pulsanti UI ancora senza handler (Blocco 2+)

| ID | Funzione attesa |
|---|---|
| `pnBtnMovimento` | Apre modal nuovo movimento |
| `pnBtnBanche` | Apre modal gestione banche |
| `pnBtnUscite` | Apre modal categorie uscite |
| `pnBtnEntrate` | Apre modal categorie entrate |
| `pnBtnFatturazione` | Flusso fatturazione batch |
| `pnBtnGiroconto` | Shortcut nuovo giroconto |
| `pnBtnEsporta` | Export CSV/Excel |
| `pnBtnSollecitoMassivo` | Sollecito massivo a tutti i debitori |

## Pattern architetturali del progetto

- Blueprint: `bp = Blueprint('nome', __name__)` in `routes/`, registrato in `app.py`
- DB: `get_db()` restituisce `sqlite3.connect` con `row_factory = sqlite3.Row`
- Auth: decorator `@login_required` locale in ogni blueprint (controlla `session['user_id']`)
- Tab switching JS: `window.switchTab` viene wrappato a catena — seguire il pattern
  `const _orig = switchTab; window.switchTab = function(t){ _orig(t); if(t==='xxx') doInit(); }`
- Toast: funzione globale `toast(msg, type)` disponibile in app.js
- Modal: `openModal(id)` / `closeModal(id)` globali
- `showToast` non esiste — usare `toast()`

## Note importanti

- `escHtml` non è globale in app.js — il modulo PrimaNota ha la propria `_esc()`
- `showToast` non esiste — usare `toast(msg, type)`
- Il flag fatturato ha logica: fatturato > 7gg urgente, ≤7gg da_fatturare
- Giroconto = 2 righe in `movimenti_studio` con stesso `giroconto_id` (UUID), dir opposta
- Entrata da cliente (macrogruppo_id='clienti') crea anche riga in `pagamenti`
