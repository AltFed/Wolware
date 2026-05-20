#!/bin/bash
# ============================================================
#  Wolware — Build Windows EXE da Linux tramite Wine
#  Produce dist/Wolware/Wolware.exe pronto per Windows
# ============================================================
set -e

PYTHON_VERSION="3.12.10"
PYTHON_INSTALLER="python-${PYTHON_VERSION}-amd64.exe"
PYTHON_URL="https://www.python.org/ftp/python/${PYTHON_VERSION}/${PYTHON_INSTALLER}"
WINE_PYTHON="wine python"

# ── 1. Installa Wine se mancante ────────────────────────────
if ! command -v wine &>/dev/null; then
  echo ">>> Wine non trovato — installazione in corso..."
  sudo dpkg --add-architecture i386
  sudo apt-get update -q
  sudo apt-get install -y wine wine64
fi

echo ">>> Wine: $(wine --version)"

# ── 2. Installa Python for Windows dentro Wine ──────────────
WINE_PYTHON_EXE="$HOME/.wine/drive_c/users/$USER/AppData/Local/Programs/Python/Python312/python.exe"

if [ ! -f "$WINE_PYTHON_EXE" ]; then
  echo ">>> Python Windows non trovato — download e installazione..."
  wget -q --show-progress -O "/tmp/${PYTHON_INSTALLER}" "${PYTHON_URL}"
  # Installazione silenziosa con PATH e pip inclusi
  wine "/tmp/${PYTHON_INSTALLER}" /quiet InstallAllUsers=0 PrependPath=1 Include_pip=1
  echo ">>> Python Windows installato."
fi

WINE_PYTHON_CMD="wine $WINE_PYTHON_EXE"

# ── 3. Installa dipendenze Windows ──────────────────────────
echo ">>> Installazione flask e pyinstaller per Windows..."
$WINE_PYTHON_CMD -m pip install flask pyinstaller --quiet

# ── 4. Build ────────────────────────────────────────────────
echo ""
echo ">>> Build in corso... (potrebbe richiedere qualche minuto)"

$WINE_PYTHON_CMD -m PyInstaller \
  --name "Wolware" \
  --onedir \
  --windowed \
  --add-data "templates;templates" \
  --add-data "static;static" \
  --hidden-import "flask" \
  --hidden-import "sqlite3" \
  --noconfirm \
  main.py

echo ""
echo ">>> Build completata! Trovi l'exe in ./dist/Wolware/"
