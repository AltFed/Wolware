@echo off
REM  Wolware — Build Windows (senza pywebview, compatibile Python 3.14)

echo Installazione dipendenze...
pip install flask pyinstaller -q

echo.
echo Build in corso...

pyinstaller ^
  --name "Wolware" ^
  --onedir ^
  --windowed ^
  --add-data "templates;templates" ^
  --add-data "static;static" ^
  --hidden-import "flask" ^
  --hidden-import "sqlite3" ^
  main.py

echo Build completata! Trovi l'app in dist\Wolware\
pause