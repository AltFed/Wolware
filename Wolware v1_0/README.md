# Wolware Desktop

Applicazione desktop cross-platform per la gestione delle pratiche del Consulente del Lavoro.

Tecnologie: **Python + Flask + pywebview + SQLite**
- Il database `wolware.db` viene creato automaticamente nella stessa cartella
- Funziona su **macOS**, **Windows** e **Linux** senza installare nulla di extra
- Nessun browser esterno: si apre come app nativa

---

## Avvio rapido (con Python installato)

### macOS / Linux
```bash
bash start.sh
```

### Windows
```bat
start_windows.bat
```

### Manuale
```bash
pip install flask pywebview
python3 main.py
```

---

## Build eseguibile standalone (distribuibile senza Python)

### macOS / Linux
```bash
bash build_exe.sh
# Output: dist/Wolware/  (cartella da distribuire)
```

### Windows
```bat
build_exe_windows.bat
# Output: dist\Wolware\  (cartella da distribuire)
```

L'eseguibile finale NON richiede Python installato sul PC dell'utente.
Il file `wolware.db` viene creato automaticamente accanto all'eseguibile.

---

## Struttura
```
wolware_desktop/
├── main.py                  ← Entry point desktop (pywebview)
├── app.py                   ← Backend Flask + API REST
├── wolware.db               ← Database SQLite (creato al primo avvio)
├── templates/index.html     ← Interfaccia grafica
├── static/css/style.css     ← Stile
├── static/js/app.js         ← Logica frontend
├── requirements.txt
├── start.sh / start_windows.bat         ← Avvio diretto
└── build_exe.sh / build_exe_windows.bat ← Build eseguibile
```

---

## Dipendenze sistema

| OS | WebView engine | Note |
|---|---|---|
| macOS 10.14+ | WebKit (built-in) | Nessun extra |
| Windows 10+ | WebView2 (Edge) | Già incluso in Win10/11 |
| Linux | GTK WebKit2 | `sudo apt install python3-gi gir1.2-webkit2-4.0` |
