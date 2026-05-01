#!/bin/bash
# Avvio diretto (richiede Python installato)
echo "========================================"
echo "  WOLWARE Desktop v1.0"
echo "========================================"
pip install flask pywebview -q 2>/dev/null
cd "$(dirname "$0")"
python3 main.py
