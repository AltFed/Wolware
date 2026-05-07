@echo off
setlocal enabledelayedexpansion
title Wolware — Build eseguibile distribuibile
cd /d "%~dp0"

echo.
echo  ================================================================
echo   WOLWARE  ^|  Build eseguibile distribuibile
echo  ================================================================
echo.
echo  Questo script crea Wolware.exe pronto per girare su qualsiasi
echo  PC Windows senza installare Python o altre dipendenze.
echo.
echo  Requisiti per questo PC (solo per il BUILD, non per i PC target):
echo    - Python 3.10 o superiore
echo    - Connessione internet (per scaricare PyInstaller)
echo.

REM ═══════════════════════════════════════════════════════════════
REM  1. VERIFICA PYTHON
REM ═══════════════════════════════════════════════════════════════
python --version >nul 2>&1
if errorlevel 1 (
    echo  [ERRORE] Python non trovato.
    echo  Installa Python da: https://www.python.org/downloads/
    echo  Assicurati di spuntare "Add Python to PATH".
    echo.
    pause
    exit /b 1
)
for /f "tokens=2" %%v in ('python --version 2^>^&1') do set PYVER=%%v
echo  [OK] Python %PYVER% trovato.
echo.

REM ═══════════════════════════════════════════════════════════════
REM  2. AMBIENTE VIRTUALE DI BUILD (isolato, non tocca il progetto)
REM ═══════════════════════════════════════════════════════════════
echo  [INFO] Creo ambiente virtuale di build...
if exist ".venv_build" (
    echo  [INFO] Rimuovo ambiente di build precedente...
    rmdir /s /q ".venv_build"
)
python -m venv .venv_build
if errorlevel 1 (
    echo  [ERRORE] Impossibile creare l'ambiente virtuale.
    pause
    exit /b 1
)
echo  [OK] Ambiente virtuale creato.
echo.

REM ═══════════════════════════════════════════════════════════════
REM  3. INSTALLA DIPENDENZE + PYINSTALLER
REM ═══════════════════════════════════════════════════════════════
echo  [INFO] Aggiorno pip...
.venv_build\Scripts\python -m pip install --upgrade pip --quiet

echo  [INFO] Installo dipendenze dell'app...
.venv_build\Scripts\pip install -r "Wolware v1_0\requirements.txt" --quiet
if errorlevel 1 (
    echo  [ERRORE] Installazione dipendenze fallita.
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
echo  [OK] Tutte le dipendenze installate.
echo.

REM ═══════════════════════════════════════════════════════════════
REM  4. PULIZIA CARTELLE BUILD PRECEDENTI
REM ═══════════════════════════════════════════════════════════════
echo  [INFO] Pulisco build precedente...
if exist "dist\Wolware" rmdir /s /q "dist\Wolware"
if exist "build"        rmdir /s /q "build"
if exist "Wolware.spec" del /q "Wolware.spec"

REM ═══════════════════════════════════════════════════════════════
REM  5. BUILD CON PYINSTALLER
REM    - Entriamo nella cartella sorgente: PyInstaller trova
REM      automaticamente tutti i moduli locali (routes/, auth/, ecc.)
REM    - --onedir: crea una cartella con l'exe + tutte le dipendenze
REM      (startup rapido, DB nella stessa cartella dell'exe)
REM    - --noconsole: nessun terminale nero all'avvio
REM ═══════════════════════════════════════════════════════════════
echo  [INFO] Build in corso — potrebbe richiedere 2-5 minuti...
echo.

cd "Wolware v1_0"

..\.venv_build\Scripts\pyinstaller ^
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
    --distpath "..\dist" ^
    --workpath "..\build" ^
    --noconfirm ^
    --clean ^
    main.py

if errorlevel 1 (
    cd ..
    echo.
    echo  [ERRORE] Build PyInstaller fallita.
    echo  Controlla il messaggio di errore sopra.
    echo.
    pause
    exit /b 1
)

cd ..
echo.
echo  [OK] Build completata con successo.
echo.

REM ═══════════════════════════════════════════════════════════════
REM  6. CREA ISTRUZIONI NELLA CARTELLA DI DISTRIBUZIONE
REM ═══════════════════════════════════════════════════════════════
(
echo Wolware — Gestionale per Studi di Consulenza del Lavoro
echo =========================================================
echo.
echo AVVIO
echo -----
echo Fai doppio clic su Wolware.exe per avviare l'applicazione.
echo Il browser si aprira' automaticamente su http://127.0.0.1:5000
echo.
echo PRIMO AVVIO
echo -----------
echo Credenziali predefinite:
echo   Utente:   admin
echo   Password: admin123
echo.
echo Cambia la password dopo il primo accesso.
echo.
echo DATI
echo ----
echo Il database (wolware.db) si trova in questa cartella.
echo Esegui backup regolari copiando wolware.db in un posto sicuro.
echo.
echo CHIUDI L'APP
echo ------------
echo Chiudi il processo Wolware.exe dal Task Manager o
echo premi Ctrl+C nel terminale se avviato da riga di comando.
echo.
echo Versione costruita il: %DATE% %TIME%
) > "dist\Wolware\LEGGIMI.txt"

REM ═══════════════════════════════════════════════════════════════
REM  7. CREA ZIP DISTRIBUIBILE
REM ═══════════════════════════════════════════════════════════════
echo  [INFO] Creo archivio ZIP distribuibile...
if exist "dist\Wolware_distribuzione.zip" del /q "dist\Wolware_distribuzione.zip"

powershell -NoProfile -Command ^
    "Compress-Archive -Path 'dist\Wolware' -DestinationPath 'dist\Wolware_distribuzione.zip' -Force"

if errorlevel 1 (
    echo  [AVVISO] Impossibile creare lo ZIP (PowerShell non disponibile).
    echo           La cartella dist\Wolware\ e' comunque pronta.
) else (
    echo  [OK] ZIP creato: dist\Wolware_distribuzione.zip
)

REM ═══════════════════════════════════════════════════════════════
REM  8. PULIZIA FINALE
REM ═══════════════════════════════════════════════════════════════
echo  [INFO] Pulisco file temporanei di build...
if exist "build"               rmdir /s /q "build"
if exist "Wolware.spec"        del /q "Wolware.spec"
if exist "Wolware v1_0\build"  rmdir /s /q "Wolware v1_0\build"
if exist "Wolware v1_0\dist"   rmdir /s /q "Wolware v1_0\dist"
if exist "Wolware v1_0\Wolware.spec" del /q "Wolware v1_0\Wolware.spec"
if exist ".venv_build"         rmdir /s /q ".venv_build"

REM ═══════════════════════════════════════════════════════════════
REM  RIEPILOGO
REM ═══════════════════════════════════════════════════════════════
echo.
echo  ================================================================
echo   BUILD COMPLETATO
echo  ================================================================
echo.
echo   Cartella:  dist\Wolware\
echo   Avvia con: dist\Wolware\Wolware.exe
echo.
echo   Per distribuire su altri PC:
echo     ZIP pronto: dist\Wolware_distribuzione.zip
echo     Estrarre lo ZIP sul PC target e avviare Wolware.exe.
echo     Non serve installare Python o altro.
echo.
echo  ================================================================
echo.
pause
