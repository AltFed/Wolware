#!/usr/bin/env python3
"""
Wolware Desktop - main.py
Tenta pywebview (Edge Chromium su Windows), poi apre nel browser come fallback.
"""
import threading
import socket
import time
import sys

from app import app as flask_app


def find_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        return s.getsockname()[1]


def start_flask(port):
    flask_app.run(host='127.0.0.1', port=port, debug=False, use_reloader=False)


def launch():
    port = find_free_port()
    url = f'http://127.0.0.1:{port}'

    t = threading.Thread(target=start_flask, args=(port,), daemon=True)
    t.start()
    time.sleep(0.9)

    # Tentativo 1: pywebview con Edge Chromium (WebView2)
    try:
        import webview
        window = webview.create_window(
            title='Wolware - Gestione Pratiche',
            url=url,
            width=1280,
            height=820,
            min_size=(900, 600),
            resizable=True,
            text_select=True,
        )
        try:
            webview.start(gui='edgechromium', debug=False)
        except Exception:
            webview.start(debug=False)
        return
    except Exception as e:
        print(f'[pywebview non disponibile: {e}]')
        print('[Apertura nel browser di sistema...]')

    # Fallback: browser predefinito (Edge / Chrome / Firefox)
    import webbrowser
    webbrowser.open(url)
    print(f'\nWolware avviato su {url}')
    print('Tieni questo terminale aperto. Chiudilo per spegnere Wolware.\n')
    try:
        input('Premi INVIO per chiudere...')
    except (KeyboardInterrupt, EOFError):
        pass


if __name__ == '__main__':
    launch()
