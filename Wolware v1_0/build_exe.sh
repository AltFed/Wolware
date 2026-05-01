#!/bin/bash
# ============================================================
#  Wolware — Build eseguibile standalone con PyInstaller
#  Esegui questo script UNA VOLTA per creare l'app distribuibile
# ============================================================

echo "Installazione dipendenze..."
pip install flask pywebview pyinstaller -q

echo ""
echo "Build in corso... (potrebbe richiedere qualche minuto)"

# macOS / Linux
pyinstaller \
  --name "Wolware" \
  --onedir \
  --windowed \
  --add-data "templates:templates" \
  --add-data "static:static" \
  --hidden-import "flask" \
  --hidden-import "webview" \
  --hidden-import "webview.platforms.cocoa" \
  --hidden-import "webview.platforms.gtk" \
  --hidden-import "webview.platforms.winforms" \
  main.py

echo ""
echo "Build completata! Trovi l'app in ./dist/Wolware/"
