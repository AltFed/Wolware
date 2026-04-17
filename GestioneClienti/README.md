# GestioneClienti — App Desktop Python + Eel

Versione desktop offline del gestionale, con SQLite locale al posto di Supabase.

## Struttura
```
GestioneClienti/
├── main.py          ← Entry point
├── database.py      ← SQLite schema + helpers
├── auth.py          ← Login locale SHA-256
├── clients.py       ← CRUD clienti, pratiche, arrotondamenti
├── payments.py      ← CRUD pagamenti
├── movements.py     ← Prima Nota, banche, macrogruppi
├── tariffs.py       ← Tariffari base
├── settings.py      ← Impostazioni, backup, fatture emesse
├── reports.py       ← Generazione PDF (ReportLab)
├── requirements.txt
└── web/
    ├── index.html   ← UI originale (adattata)
    ├── css/
    │   └── style.css
    └── js/
        ├── eel-bridge.js  ← Sostituisce supabase-config.js
        └── app.js         ← Logica UI originale (invariata)
```

## Installazione

```bash
pip install -r requirements.txt
```

Per usare la finestra Chrome-app (consigliato):
```bash
pip install eel[chrome]
```

## Avvio

```bash
python main.py
```

## Modifiche a index.html

Nel file `web/index.html`, sostituire:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/..."></script>
<script src="js/supabase-config.js"></script>
```
con:
```html
<script type="text/javascript" src="/eel.js"></script>
<script src="js/eel-bridge.js"></script>
```
Il file `/eel.js` è servito automaticamente da Eel.

## PDF
I PDF vengono generati da Python con ReportLab e salvati in:
`~/Documents/GestioneClienti/FATTURE|SOLLECITI|RENDICONTO|FATTURAZIONE/`

## Backup
I backup JSON sono salvati in `~/Documents/GestioneClienti/BACKUP/`.
Compatibili con il formato v2.1 dell'app originale.

## Note Database
Il database SQLite (`gestione_clienti.db`) viene creato nella stessa 
cartella di `main.py` al primo avvio.
