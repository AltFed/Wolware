# _claude_dev

Cartella di contesto e appoggio per lo sviluppo guidato da Claude (branch `prima-nota`).

## Struttura

| File | Descrizione |
|---|---|
| `CONTEXT.md` | Stato corrente del progetto — letto all'inizio di ogni sessione |
| `db_migration_prima_nota.sql` | Script SQL di riferimento per le tabelle Prima Nota |
| `note_blocco1.md` | Note di implementazione Blocco 1 (storico) |
| `prima_nota_css.css` | CSS sorgente Blocco 1 (integrato in style.css) |
| `prima_nota_js.js` | JS sorgente Blocco 1 (integrato in app.js) |
| `prima_nota_section.html` | HTML sorgente Blocco 1 (integrato in index.html) |
| `test_api.sh` | Test curl per le API del Blocco 1 |

## Come testare il Blocco 1

```bash
# Avvia il server
cd 'Wolware v1_0'
python app.py

# In un altro terminale, testa le API
bash _claude_dev/test_api.sh
```

## Come usare questa cartella

All'inizio di ogni sessione Claude legge `CONTEXT.md` per avere il quadro completo
senza dover rileggere tutto il codice. Aggiornare `CONTEXT.md` a fine sessione.
