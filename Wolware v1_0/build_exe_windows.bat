@echo off
setlocal enabledelayedexpansion
title Wolware — Build eseguibile distribuibile
cd /d "%~dp0"

echo.
echo  ================================================================
echo   WOLWARE  ^|  Build eseguibile distribuibile
echo  ================================================================
echo.
echo  Crea Wolware.exe pronto per girare su qualsiasi PC Windows
echo  senza installare Python o altre dipendenze.
echo.
echo  Requisiti SOLO per questo PC (non per il PC target):
echo    - Python 3.10 o superiore  (python.org/downloads)
echo    - Connessione internet
echo.

REM ═══════════════════════════════════════════════════════════════
REM  1. VERIFICA PYTHON
REM ═══════════════════════════════════════════════════════════════
python --version >nul 2>&1
if errorlevel 1 (
    echo  [ERRORE] Python non trovato.
    echo  Installa Python da: https://www.python.org/downloads/
    echo  Ricordati di spuntare "Add Python to PATH".
    echo.
    pause
    exit /b 1
)
for /f "tokens=2" %%v in ('python --version 2^>^&1') do set PYVER=%%v
echo  [OK] Python %PYVER% trovato.
echo.

REM ═══════════════════════════════════════════════════════════════
REM  2. AMBIENTE VIRTUALE DI BUILD
REM ═══════════════════════════════════════════════════════════════
echo  [INFO] Creo ambiente virtuale di build...
if exist ".venv_build" rmdir /s /q ".venv_build"
python -m venv .venv_build
if errorlevel 1 (
    echo  [ERRORE] Impossibile creare il virtualenv.
    pause
    exit /b 1
)
echo  [OK] Ambiente virtuale creato.
echo.

REM ═══════════════════════════════════════════════════════════════
REM  3. DIPENDENZE + PYINSTALLER
REM ═══════════════════════════════════════════════════════════════
echo  [INFO] Aggiorno pip...
.venv_build\Scripts\python -m pip install --upgrade pip --quiet

echo  [INFO] Installo dipendenze app...
.venv_build\Scripts\pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo  [ERRORE] Installazione requirements.txt fallita.
    pause
    exit /b 1
)

echo  [INFO] Installo PyInstaller...
.venv_build\Scripts\pip install "pyinstaller>=6.0" --quiet
if errorlevel 1 (
    echo  [ERRORE] Installazione PyInstaller fallita.
    pause
    exit /b 1
)
echo  [OK] Dipendenze installate.
echo.

REM ═══════════════════════════════════════════════════════════════
REM  4. PULIZIA BUILD PRECEDENTE
REM ═══════════════════════════════════════════════════════════════
echo  [INFO] Pulisco build precedente...
if exist "dist\Wolware" rmdir /s /q "dist\Wolware"
if exist "build"        rmdir /s /q "build"
if exist "Wolware.spec" del /q "Wolware.spec"

REM ═══════════════════════════════════════════════════════════════
REM  5. BUILD
REM    --onedir   : cartella con exe + deps (avvio rapido, DB vicino exe)
REM    --noconsole: nessun terminale nero per l'utente finale
REM ═══════════════════════════════════════════════════════════════
echo  [INFO] Build in corso — attendi 2-5 minuti...
echo.

.venv_build\Scripts\pyinstaller ^
    --name "Wolware" ^
    --onedir ^
    --noconsole ^
    --add-data "templates;templates" ^
    --add-data "static;static" ^
    --collect-all openpyxl ^
    --collect-all reportlab ^
    --collect-all flask ^
    --collect-all werkzeug ^
    --collect-all jinja2 ^
    --hidden-import sqlite3 ^
    --hidden-import dotenv ^
    --hidden-import email.mime.text ^
    --hidden-import email.mime.multipart ^
    --hidden-import routes ^
    --hidden-import routes.stats ^
    --hidden-import routes.events ^
    --hidden-import routes.ditte ^
    --hidden-import routes.pratiche ^
    --hidden-import routes.users ^
    --hidden-import routes.tariffari ^
    --hidden-import routes.ditta_tariffario ^
    --hidden-import routes.pagamenti ^
    --hidden-import routes.arrotondamenti ^
    --hidden-import routes.strumenti ^
    --hidden-import routes.pratiche_richiesta ^
    --hidden-import routes.fatture ^
    --hidden-import routes.estratto ^
    --hidden-import routes.previsionale ^
    --hidden-import routes.solleciti ^
    --hidden-import routes.prima_nota ^
    --hidden-import routes.rendiconto ^
    --hidden-import auth ^
    --hidden-import auth.routes ^
    --hidden-import auth.decorators ^
    --noconfirm ^
    --clean ^
    main.py

if errorlevel 1 (
    echo.
    echo  [ERRORE] Build fallita. Vedi il messaggio sopra.
    echo.
    pause
    exit /b 1
)
echo.
echo  [OK] Build completata.
echo.

REM ═══════════════════════════════════════════════════════════════
REM  6. LEGGIMI
REM ═══════════════════════════════════════════════════════════════
(
echo Wolware — Gestionale per Studi di Consulenza del Lavoro
echo =========================================================
echo.
echo AVVIO
echo -----
echo Fai doppio clic su Wolware.exe
echo Il browser si apre automaticamente su http://127.0.0.1:5000
echo.
echo PRIMO ACCESSO
echo -------------
echo   Utente:   admin
echo   Password: admin123
echo   ^(cambia subito la password dopo il primo accesso^)
echo.
echo BACKUP
echo ------
echo Il database e' il file wolware.db in questa cartella.
echo Fai backup regolari copiando wolware.db altrove.
echo.
echo Build: %DATE% %TIME%
) > "dist\Wolware\LEGGIMI.txt"

REM ═══════════════════════════════════════════════════════════════
REM  7. ZIP DISTRIBUIBILE
REM ═══════════════════════════════════════════════════════════════
echo  [INFO] Creo ZIP distribuibile...
if exist "dist\Wolware_distribuzione.zip" del /q "dist\Wolware_distribuzione.zip"
powershell -NoProfile -Command "Compress-Archive -Path 'dist\Wolware' -DestinationPath 'dist\Wolware_distribuzione.zip' -Force"
if errorlevel 1 (
    echo  [AVVISO] ZIP non creato (PowerShell non disponibile^).
    echo           La cartella dist\Wolware\ e' comunque pronta.
) else (
    echo  [OK] dist\Wolware_distribuzione.zip pronto.
)

REM ═══════════════════════════════════════════════════════════════
REM  8. PULIZIA FINALE
REM ═══════════════════════════════════════════════════════════════
echo  [INFO] Rimuovo file temporanei...
if exist "build"        rmdir /s /q "build"
if exist "Wolware.spec" del /q "Wolware.spec"
if exist ".venv_build"  rmdir /s /q ".venv_build"

REM ═══════════════════════════════════════════════════════════════
echo.
echo  ================================================================
echo   COMPLETATO
echo  ================================================================
echo.
echo   Eseguibile:  dist\Wolware\Wolware.exe
echo   ZIP pronto:  dist\Wolware_distribuzione.zip
echo.
echo   Sul PC target: estrai lo ZIP, fai doppio clic su Wolware.exe.
echo   Non serve installare nulla.
echo.
echo  ================================================================
echo.
pause
