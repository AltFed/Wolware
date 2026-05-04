@echo off
setlocal enabledelayedexpansion
title Wolware — Avvio automatico
cd /d "%~dp0"

echo.
echo  ╔══════════════════════════════════════╗
echo  ║         WOLWARE — Avvio             ║
echo  ╚══════════════════════════════════════╝
echo.

REM ── 1. Controlla Python ───────────────────────────────────────
python --version >nul 2>&1
if errorlevel 1 (
    echo  [ERRORE] Python non trovato.
    echo.
    echo  Scarica e installa Python da: https://www.python.org/downloads/
    echo  Assicurati di spuntare "Add Python to PATH" durante l'installazione.
    echo.
    pause
    exit /b 1
)
for /f "tokens=2" %%v in ('python --version 2^>^&1') do set PYVER=%%v
echo  [OK] Python %PYVER% trovato.

REM ── 2. Controlla/crea virtualenv ───────────────────────────────
if not exist ".venv" (
    echo  [INFO] Creo l'ambiente virtuale...
    python -m venv .venv
    if errorlevel 1 (
        echo  [ERRORE] Impossibile creare il virtualenv.
        pause
        exit /b 1
    )
    echo  [OK] Ambiente virtuale creato.
) else (
    echo  [OK] Ambiente virtuale esistente trovato.
)

REM ── 3. Installa/aggiorna dipendenze ────────────────────────────
echo  [INFO] Installo le dipendenze...
.venv\Scripts\pip install --upgrade pip --quiet
.venv\Scripts\pip install -r "Wolware v1_0\requirements.txt" --quiet
if errorlevel 1 (
    echo  [ERRORE] Installazione dipendenze fallita.
    pause
    exit /b 1
)
echo  [OK] Dipendenze installate.

REM ── 4. Avvia l'app ─────────────────────────────────────────────
echo.
echo  Avvio Wolware...
echo  (Chiudi questa finestra per spegnere l'app)
echo.
.venv\Scripts\python "Wolware v1_0\main.py"

if errorlevel 1 (
    echo.
    echo  [ERRORE] L'applicazione e' terminata con un errore.
    pause
)
