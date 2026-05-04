#!/usr/bin/env bash
set -euo pipefail

# .command viene aperto da macOS con Terminal in automatico al doppio click
# La working directory di default è la home, quindi forziamo la cartella dello script
cd "$(dirname "$0")"

echo ""
echo "  ╔══════════════════════════════════════╗"
echo "  ║         WOLWARE — Avvio             ║"
echo "  ╚══════════════════════════════════════╝"
echo ""

wait_on_error() {
  echo ""
  read -rp "  Premi INVIO per chiudere..."
}

# ── 1. Controlla Python ──────────────────────────────────────────
PYTHON_CMD=""
for cmd in python3 python; do
  if command -v "$cmd" &>/dev/null; then
    PYTHON_CMD="$cmd"
    break
  fi
done

if [[ -z "$PYTHON_CMD" ]]; then
  echo "  [ERRORE] Python non trovato."
  echo ""
  echo "  Installa Python da: https://www.python.org/downloads/"
  echo "  Oppure con Homebrew: brew install python3"
  wait_on_error
  exit 1
fi

PYVER=$("$PYTHON_CMD" --version 2>&1)
echo "  [OK] $PYVER trovato."

# ── 2. Controlla/crea virtualenv ─────────────────────────────────
if [ ! -d ".venv" ]; then
  echo "  [INFO] Creo l'ambiente virtuale..."
  "$PYTHON_CMD" -m venv .venv
  echo "  [OK] Ambiente virtuale creato."
else
  echo "  [OK] Ambiente virtuale esistente trovato."
fi

# ── 3. Installa/aggiorna dipendenze ──────────────────────────────
echo "  [INFO] Installo le dipendenze..."
.venv/bin/pip install --upgrade pip --quiet
.venv/bin/pip install -r "Wolware v1_0/requirements.txt" --quiet
echo "  [OK] Dipendenze installate."

# ── 4. Avvia l'app ───────────────────────────────────────────────
echo ""
echo "  Avvio Wolware..."
echo "  (Chiudi questa finestra per spegnere l'app)"
echo ""
.venv/bin/python "Wolware v1_0/main.py"

# Se l'app si chiude normalmente, teniamo aperto il terminale
echo ""
echo "  Wolware si è chiuso."
read -rp "  Premi INVIO per uscire..."
