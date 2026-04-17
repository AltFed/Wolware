#!/usr/bin/env python3
"""
auth.py
Autenticazione locale tramite hash password (SHA-256).
Sostituisce il login Supabase con una sessione in-memory locale.
"""
import eel
import hashlib
from database import get_conn

_sessione_attiva: bool = False


def _hash_password(pwd: str) -> str:
    """Calcola SHA-256 della password."""
    return hashlib.sha256(pwd.encode('utf-8')).hexdigest()


@eel.expose
def auth_login(password: str) -> dict:
    """
    Verifica la password. Se non è impostata, accetta qualsiasi password
    e la usa come prima password.
    Ritorna {"success": bool, "error": str|None}.
    """
    global _sessione_attiva
    with get_conn() as conn:
        row = conn.execute(
            "SELECT passwordhash FROM impostazionistudio LIMIT 1"
        ).fetchone()

    stored_hash = row['passwordhash'] if row else None

    if not stored_hash:
        # Prima esecuzione: password non ancora impostata → accesso libero
        _sessione_attiva = True
        return {"success": True, "error": None}

    if _hash_password(password) == stored_hash:
        _sessione_attiva = True
        return {"success": True, "error": None}

    return {"success": False, "error": "Password errata"}


@eel.expose
def auth_logout() -> bool:
    global _sessione_attiva
    _sessione_attiva = False
    return True


@eel.expose
def auth_check_session() -> bool:
    """Ritorna True se la sessione è attiva (usato all'avvio)."""
    return _sessione_attiva


@eel.expose
def auth_set_password(new_password: str) -> dict:
    """Imposta o aggiorna la password (chiamato da impostazioni studio)."""
    h = _hash_password(new_password)
    with get_conn() as conn:
        row = conn.execute("SELECT id FROM impostazionistudio LIMIT 1").fetchone()
        if row:
            conn.execute(
                "UPDATE impostazionistudio SET passwordhash=? WHERE id=?",
                (h, row['id'])
            )
        else:
            conn.execute(
                "INSERT INTO impostazionistudio (passwordhash) VALUES (?)", (h,)
            )
    return {"success": True}
