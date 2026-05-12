@echo off
echo Wolware - Avvio in corso...
pip install flask pywebview -q 2>nul || pip install flask -q
python main.py
pause
