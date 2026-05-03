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

#### API Blocco 1
- `GET /api/prima-nota/saldi`
- `GET /api/prima-nota/movimenti` (filtri: anno, mese, tipo, cerca)
- `GET /api/prima-nota/anni`
- `GET /api/prima-nota/clienti-da-sollecitare`
- `DELETE /api/prima-nota/movimenti/<id>`
- `PATCH /api/prima-nota/movimenti/<id>/rimuovi-fatturato`

---

### ✅ Blocco 2 — Modal Registra Movimento (COMPLETO)

| Componente | File | Stato |
|---|---|---|
| `giroconto_tipo` migration in DB | `database.py` | ✅ Fatto |
| `GET /api/prima-nota/categorie` | `routes/prima_nota.py` | ✅ Fatto |
| `POST /api/prima-nota/movimenti` | `routes/prima_nota.py` | ✅ Fatto |
| Modal HTML `#modalMovimento` | `templates/index.html` | ✅ Fatto |
| JS modal (open/tab/categoria/sottovoce/salva) | `static/js/app.js` | ✅ Fatto |

#### API Blocco 2
- `GET /api/prima-nota/categorie` — `{entrate: [{id, nome, speciale, sottovoci}], uscite: [...]}`
- `POST /api/prima-nota/movimenti` — body: `{tipo, data, tipologia, macrogruppo_id, macrogruppo_nome, sottovoce_id, sottovoce_nome, importo, descrizione}`
  - Se entrata + macrogruppo_id='clienti': crea automaticamente record in `pagamenti`
  - Mezzo pagamento: "Contanti" (cassa) o "Bonifico NomeBanca" (banca)

#### Dettagli tecnici Blocco 2
- `_categorie` è resettato ad ogni apertura modal (no cache stale)
- Tab Entrata/Uscita: preserva data/importo/note, resetta categoria+sottovoce
- Sottovoce "Clienti" = lista ditte non archiviate da `GET /api/ditte` (via categorie endpoint)
- `openModalMovimento()` esposto pubblicamente nel modulo PrimaNota
- `pnBtnMovimento` bindato in `_bindModal()` chiamato da `init()` al primo accesso al tab

---

### ⏳ Blocco 3 — Modal Giroconto + Modal Prepara Fatturazione (DA FARE)

**Giroconto:**
- Modal con: Data, Tipo (Versamento/Prelievo/Bonifico/Spostamento), Da (origine), A (destinazione), Importo, Descrizione
- Tipo intelligente: Versamento → Da=Cassa auto; Prelievo → A=Cassa auto; Bonifico → solo banche
- Crea 2 movimenti in `movimenti_studio` con stesso `giroconto_id` (UUID), `giroconto_dir` opposta, `giroconto_tipo`
- `POST /api/prima-nota/giroconto`
- Endpoint: `pnBtnGiroconto`

**Prepara Fatturazione:**
- Modal con lista entrate non fatturate (checkbox, totale live)
- Genera PDF riepilogativo
- Marca come fatturato SOLO dopo conferma + salvataggio PDF
- `POST /api/prima-nota/fatturazione/prepara`
- Endpoint: `pnBtnFatturazione`

---

### ⏳ Blocco 4 — Modal gestione anagrafica (DA FARE)

**Banche** (`pnBtnBanche`): CRUD `banche_studio`. Blocco eliminazione se ha movimenti.
**Macrogruppi Uscite** (`pnBtnUscite`): CRUD `macrogruppi_uscite` + `sottovoci_uscite`. Editing inline.
**Macrogruppi Entrate** (`pnBtnEntrate`): identico Uscite + "CLIENTI" fisso in cima (sola lettura).

API da creare:
- `GET/POST/PUT/DELETE /api/prima-nota/banche`
- `GET/POST/PUT/DELETE /api/prima-nota/macrogruppi/entrate` + sottovoci
- `GET/POST/PUT/DELETE /api/prima-nota/macrogruppi/uscite` + sottovoci

---

## Pulsanti ancora senza handler

| ID | Blocco | Funzione |
|---|---|---|
| `pnBtnGiroconto` | 3 | Modal Giroconto |
| `pnBtnFatturazione` | 3 | Modal Prepara Fatturazione |
| `pnBtnBanche` | 4 | Modal Gestione Banche |
| `pnBtnUscite` | 4 | Modal Macrogruppi Uscite |
| `pnBtnEntrate` | 4 | Modal Macrogruppi Entrate |
| `pnBtnEsporta` | - | Export CSV/Excel (fuori scope Blocco 1-4) |
| `pnBtnSollecitoMassivo` | - | Sollecito massivo batch (fuori scope) |

---

## Pattern architetturali del progetto

- Blueprint: `bp = Blueprint('nome', __name__)` in `routes/`, registrato in `app.py`
- DB: `get_db()` con `row_factory = sqlite3.Row`; chiudere con `db.close()`
- Auth: decorator `@login_required` locale in ogni blueprint
- Tab switch: `window.switchTab` wrappato a catena
- Toast: `toast(msg, type)` globale — **NON** `showToast`
- Modal: `openModal(id)` / `closeModal(id)`
- Pagamenti: INSERT richiede `anno` (INTEGER NOT NULL) — estrarlo da `data_mov.split('-')[0]`
- `openDettaglioCliente(id)` — funzione globale in app.js per aprire dettaglio cliente
- `escHtml` NON è globale — PrimaNota usa `_esc()` interno

## Schema DB Prima Nota

```
movimenti_studio: id, tipo, data, tipologia, macrogruppo_id, macrogruppo_nome,
                  sottovoce_id, sottovoce_nome, importo, descrizione,
                  giroconto_id, giroconto_dir, giroconto_tipo, created_at
banche_studio:    id, nome, saldo_iniziale, ordine, colore, created_at
movimenti_fatturati: movimento_id, data_fatturazione
macrogruppi_entrate: id, nome, ordine
sottovoci_entrate:   id, macrogruppo_id, nome, ordine
macrogruppi_uscite:  id, nome, ordine
sottovoci_uscite:    id, macrogruppo_id, nome, ordine
impostazioni:        chiave, valore
pagamenti (colonna aggiunta): movimenti_studio_id
```
