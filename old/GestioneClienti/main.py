#!/usr/bin/env python3
"""
GestioneClienti - Entry point principale.
Avvia l'interfaccia web tramite Eel e gestisce il ciclo di vita dell'app.
"""
import eel
import os
import sys

# Punta eel alla cartella web
WEB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'web')
eel.init(WEB_DIR)

# Import moduli backend (dopo eel.init per registrare le funzioni esposte)
from database import init_db          # noqa: E402
import clients   # noqa: E402 – espone funzioni eel per i clienti
import payments  # noqa: E402 – espone funzioni eel per i pagamenti
import movements # noqa: E402 – espone funzioni eel per i movimenti studio
import tariffs   # noqa: E402 – espone funzioni eel per i tariffari
import settings  # noqa: E402 – espone funzioni eel per le impostazioni
import reports   # noqa: E402 – espone funzioni eel per PDF/report
import auth      # noqa: E402 – gestione password / sessione locale


def main() -> None:
    """Inizializza DB e avvia la finestra Eel."""
    init_db()

    eel_kwargs = dict(
        host='localhost',
        port=8050,
        size=(1400, 900),
        close_callback=lambda *_: sys.exit(0),
    )

    # Prova Chrome-app, poi browser di sistema
    for mode in ('chrome-app', 'default'):
        try:
            eel.start('index.html', mode=mode, **eel_kwargs)
            break
        except EnvironmentError:
            continue
    else:
        print("Impossibile avviare l'interfaccia grafica.", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
