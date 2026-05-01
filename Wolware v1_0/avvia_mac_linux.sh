#!/bin/bash
pip install flask pywebview -q 2>/dev/null || pip install flask -q
cd "$(dirname "$0")"
python3 main.py
