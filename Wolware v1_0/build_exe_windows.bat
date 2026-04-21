@echo off
REM ============================================================
REM  Wolware — Build eseguibile standalone per Windows
REM ============================================================
echo Installazione dipendenze...
pip install flask pywebview pyinstaller -q

echo.
echo Build in corso...

pyinstaller ^
  --name "Wolware" ^
  --onedir ^
  --windowed ^
  --add-data "templates;templates" ^
  --add-data "static;static" ^
  --hidden-import "flask" ^
  --hidden-import "webview" ^
  --hidden-import "webview.platforms.winforms" ^
  main.py

echo.
echo Build completata! Trovi l'app in dist\Wolware\
pause
