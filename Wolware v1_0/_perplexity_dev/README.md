# _perplexity_dev

Cartella di appoggio per test e note di sviluppo del branch `perplexity`.

## Contenuto
- `db_migration_prima_nota.sql` — Script SQL per creare le tabelle Prima Nota
- `test_api.sh` — Test curl per le API del Blocco 1
- `note_blocco1.md` — Note di implementazione

## Come testare il Blocco 1

```bash
# Avvia il server
cd 'Wolware v1_0'
python app.py

# In un altro terminale, testa le API
bash _perplexity_dev/test_api.sh
```
