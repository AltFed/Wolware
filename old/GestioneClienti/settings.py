#!/usr/bin/env python3
"""
settings.py
Impostazioni studio, backup/ripristino JSON, gestione cartella dati,
fatture emesse.
"""
import eel
import json
import os
import datetime
from pathlib import Path
from database import get_conn, to_json, from_json

# Cartella dati di default (Documents/GestioneClienti)
_DATA_DIR: str = str(Path.home() / "Documents" / "GestioneClienti")


def _ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


# ── Impostazioni Studio ───────────────────────────────────────────────────────

@eel.expose
def db_carica_impostazioni_studio() -> dict:
    with get_conn() as conn:
        r = conn.execute("SELECT * FROM impostazionistudio LIMIT 1").fetchone()
    if not r:
        return {
            "ragioneSociale": "", "piva": "", "codiceFiscale": "",
            "indirizzo": "", "telefono": "", "email": "", "pec": "",
            "banca": "", "iban": "",
            "prossimoNumeroFattura": 1,
            "annoFatture": datetime.date.today().year,
            "sezionale": "", "passwordHash": None, "ultimoBackup": None,
            "dataDir": _DATA_DIR,
        }
    return {
        "id":                     r["id"],
        "ragioneSociale":         r["ragionesociale"] or "",
        "piva":                   r["piva"] or "",
        "codiceFiscale":          r["codicefiscale"] or "",
        "indirizzo":              r["indirizzo"] or "",
        "telefono":               r["telefono"] or "",
        "email":                  r["email"] or "",
        "pec":                    r["pec"] or "",
        "banca":                  r["banca"] or "",
        "iban":                   r["iban"] or "",
        "prossimoNumeroFattura":  r["prossimonumerofattura"] or 1,
        "annoFatture":            r["annofatture"] or datetime.date.today().year,
        "sezionale":              r["sezionale"] or "",
        "passwordHash":           r["passwordhash"],
        "ultimoBackup":           r["ultimobackup"],
        "dataDir":                _DATA_DIR,
    }


@eel.expose
def db_salva_impostazioni_studio(impostazioni: dict) -> None:
    record = (
        impostazioni.get("ragioneSociale", ""),
        impostazioni.get("piva", ""),
        impostazioni.get("codiceFiscale", ""),
        impostazioni.get("indirizzo", ""),
        impostazioni.get("telefono", ""),
        impostazioni.get("email", ""),
        impostazioni.get("pec", ""),
        impostazioni.get("banca", ""),
        impostazioni.get("iban", ""),
        impostazioni.get("prossimoNumeroFattura", 1),
        impostazioni.get("annoFatture", datetime.date.today().year),
        impostazioni.get("sezionale", ""),
        impostazioni.get("passwordHash"),
        impostazioni.get("ultimoBackup"),
    )
    with get_conn() as conn:
        existing = conn.execute("SELECT id FROM impostazionistudio LIMIT 1").fetchone()
        if existing:
            conn.execute("""
                UPDATE impostazionistudio SET
                    ragionesociale=?, piva=?, codicefiscale=?, indirizzo=?,
                    telefono=?, email=?, pec=?, banca=?, iban=?,
                    prossimonumerofattura=?, annofatture=?, sezionale=?,
                    passwordhash=?, ultimobackup=?
                WHERE id=?
            """, record + (existing["id"],))
        else:
            conn.execute("""
                INSERT INTO impostazionistudio
                    (ragionesociale, piva, codicefiscale, indirizzo, telefono,
                     email, pec, banca, iban, prossimonumerofattura, annofatture,
                     sezionale, passwordhash, ultimobackup)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, record)


# ── Cartella Dati ─────────────────────────────────────────────────────────────

@eel.expose
def get_data_dir() -> str:
    return _DATA_DIR


@eel.expose
def set_data_dir(path: str) -> bool:
    global _DATA_DIR
    try:
        _ensure_dir(path)
        _DATA_DIR = path
        return True
    except Exception as e:
        print(f"[settings] Errore set_data_dir: {e}")
        return False


@eel.expose
def apri_cartella_dati() -> bool:
    """Apre la cartella dati nel file manager di sistema."""
    import subprocess
    import sys
    _ensure_dir(_DATA_DIR)
    try:
        if sys.platform == "win32":
            os.startfile(_DATA_DIR)
        elif sys.platform == "darwin":
            subprocess.Popen(["open", _DATA_DIR])
        else:
            subprocess.Popen(["xdg-open", _DATA_DIR])
        return True
    except Exception as e:
        print(f"[settings] Errore apertura cartella: {e}")
        return False


# ── Backup / Ripristino ───────────────────────────────────────────────────────

@eel.expose
def esegui_backup(dati: dict) -> dict:
    """
    Riceve tutti i dati dall'app JS e li salva in un file JSON di backup.
    Ritorna {"success": bool, "path": str}.
    """
    _ensure_dir(os.path.join(_DATA_DIR, "BACKUP"))
    oggi = datetime.date.today().strftime("%Y-%m-%d")
    filename = f"backup_{oggi}.json"
    filepath = os.path.join(_DATA_DIR, "BACKUP", filename)
    dati["_version"] = "2.1"
    dati["_data"] = datetime.datetime.now().isoformat()
    try:
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(dati, f, ensure_ascii=False, indent=2)
        # Aggiorna ultimoBackup nelle impostazioni
        with get_conn() as conn:
            conn.execute(
                "UPDATE impostazionistudio SET ultimobackup=?",
                (datetime.datetime.now().isoformat(),)
            )
        return {"success": True, "path": filepath}
    except Exception as e:
        return {"success": False, "error": str(e)}


@eel.expose
def carica_backup(filepath: str) -> dict:
    """
    Legge un file di backup JSON e ritorna i dati al frontend.
    Il frontend si occupa di ricaricare tutto nel DB.
    """
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            dati = json.load(f)
        return {"success": True, "dati": dati}
    except Exception as e:
        return {"success": False, "error": str(e)}


@eel.expose
def scegli_file_backup() -> str | None:
    """
    Apre dialogo file nativo per scegliere il file di backup.
    Ritorna il percorso selezionato o None.
    """
    try:
        import tkinter as tk
        from tkinter import filedialog
        root = tk.Tk()
        root.withdraw()
        root.attributes('-topmost', True)
        filepath = filedialog.askopenfilename(
            title="Seleziona file di backup",
            filetypes=[("JSON backup", "*.json"), ("Tutti i file", "*.*")],
            initialdir=os.path.join(_DATA_DIR, "BACKUP"),
        )
        root.destroy()
        return filepath if filepath else None
    except Exception as e:
        print(f"[settings] Errore dialogo file: {e}")
        return None


@eel.expose
def scegli_cartella() -> str | None:
    """Apre dialogo per selezionare cartella dati."""
    try:
        import tkinter as tk
        from tkinter import filedialog
        root = tk.Tk()
        root.withdraw()
        root.attributes('-topmost', True)
        dirpath = filedialog.askdirectory(
            title="Seleziona cartella dati",
            initialdir=_DATA_DIR,
        )
        root.destroy()
        return dirpath if dirpath else None
    except Exception as e:
        print(f"[settings] Errore dialogo cartella: {e}")
        return None


# ── Fatture Emesse ────────────────────────────────────────────────────────────

@eel.expose
def db_carica_fatture_emesse() -> list:
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM fattureemesse ORDER BY data DESC"
        ).fetchall()
    return [
        {
            "id":                   r["id"],
            "numero":               r["numero"],
            "data":                 r["data"],
            "clienteId":            r["clienteid"],
            "clienteDenominazione": r["clientedenominazione"],
            "imponibile":           float(r["imponibile"] or 0),
            "iva":                  float(r["iva"] or 0),
            "totale":               float(r["totale"] or 0),
        }
        for r in rows
    ]


@eel.expose
def db_salva_fattura_emessa(fattura: dict) -> dict | None:
    record = (
        fattura.get("numero"),
        fattura.get("data"),
        fattura.get("clienteId"),
        fattura.get("clienteDenominazione"),
        float(fattura.get("imponibile", 0)),
        float(fattura.get("iva", 0)),
        float(fattura.get("totale", 0)),
    )
    with get_conn() as conn:
        cur = conn.execute("""
            INSERT INTO fattureemesse
                (numero, data, clienteid, clientedenominazione, imponibile, iva, totale)
            VALUES (?,?,?,?,?,?,?)
        """, record)
    return {"id": cur.lastrowid}


@eel.expose
def db_elimina_fattura_emessa(fid: int) -> bool:
    with get_conn() as conn:
        conn.execute("DELETE FROM fattureemesse WHERE id=?", (fid,))
    return True
