# config.py
# Configurazione centralizzata dell'applicazione.
# Tutte le variabili globali (debug, chiave segreta, path DB) vengono
# lette da qui. Gli altri moduli importano da questo file invece di
# ridefinire le variabili localmente.

import os
import secrets

# --- Debug Mode ---
# Avvia con: DEBUG_MODE=1 python app.py
# In debug salta il login e simula un admin

DEBUG_MODE = os.environ.get('DEBUG_MODE', '0') == '1'

# --- Database ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'wolware.db')

# --- Flask SECRET_KEY ---
# Priorità:
# 1. Variabile d'ambiente SECRET_KEY (impostata manualmente o in produzione)
# 2. File .secret_key nella cartella dell'app (generato automaticamente al primo avvio)
# 3. Chiave casuale in memoria (fallback — le sessioni scadono ad ogni riavvio)

_SECRET_KEY_FILE = os.path.join(BASE_DIR, '.secret_key')

def _load_or_create_secret_key() -> str:
    # Caso 1: variabile d'ambiente impostata → usala
    env_key = os.environ.get('SECRET_KEY')
    if env_key:
        return env_key

    # Caso 2: file .secret_key già esiste → leggi e riusa
    if os.path.exists(_SECRET_KEY_FILE):
        try:
            with open(_SECRET_KEY_FILE, 'r') as f:
                key = f.read().strip()
            if key:
                return key
        except OSError:
            pass

    # Caso 3: genera una nuova chiave sicura e salvala su file
    new_key = secrets.token_hex(32)
    try:
        with open(_SECRET_KEY_FILE, 'w') as f:
            f.write(new_key)
    except OSError:
        # Se non si riesce a scrivere (permessi, exe sandboxed, ecc.)
        # usa la chiave in memoria — le sessioni scadranno al riavvio
        pass
    return new_key

SECRET_KEY = _load_or_create_secret_key()

# --- Utente simulato in debug ---
DEBUG_USER = {
    'id': 0,
    'username': 'developer',
    'role': 'admin'
}