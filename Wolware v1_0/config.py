# config.py
# Configurazione centralizzata dell'applicazione.
# Tutte le variabili globali (debug, chiave segreta, path DB) vengono
# lette da qui. Gli altri moduli importano da questo file invece di
# ridefinire le variabili localmente.

import os

# --- Debug Mode ---
# Avvia con: DEBUG_MODE=1 python app.py
# In debug salta il login e simula un admin

DEBUG_MODE = os.environ.get('DEBUG_MODE', '0') == '1'


# --- Flask ---
SECRET_KEY = os.environ.get('SECRET_KEY', 'wolware-dev-key-cambiala-in-produzione')

# --- Database ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'wolware.db')

# --- Utente simulato in debug ---
DEBUG_USER = {
    'id': 0,
    'username': 'developer',
    'role': 'admin'
}