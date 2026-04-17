#!/usr/bin/env python3
"""
auth.py
- Account admin predefinito: username=admin, password=admin
- Solo admin può creare/eliminare utenti
- Sessione in-memory, nessuna connessione internet
"""
import eel
import hashlib
import json
import os

_sessione_attiva: bool = False
_utente_corrente: str | None = None

def _hash(pwd: str) -> str:
    return hashlib.sha256(pwd.encode("utf-8")).hexdigest()

_ACCOUNTS_FILE = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "accounts.json"
)

DEFAULT_ACCOUNTS = [
    {"username": "admin", "passwordHash": _hash("admin"), "ruolo": "admin"}
]





def _carica_accounts() -> list:
    if not os.path.exists(_ACCOUNTS_FILE):
        # Prima esecuzione: crea il file con l'account admin di default
        _salva_accounts(DEFAULT_ACCOUNTS)
        return DEFAULT_ACCOUNTS
    try:
        with open(_ACCOUNTS_FILE, "r", encoding="utf-8") as f:
            accounts = json.load(f)
        # Garantisce che l'account admin esista sempre
        if not any(a["username"] == "admin" for a in accounts):
            accounts.insert(0, DEFAULT_ACCOUNTS[0])
            _salva_accounts(accounts)
        return accounts
    except Exception:
        return DEFAULT_ACCOUNTS


def _salva_accounts(accounts: list) -> None:
    with open(_ACCOUNTS_FILE, "w", encoding="utf-8") as f:
        json.dump(accounts, f, indent=2, ensure_ascii=False)


def _is_admin(username: str) -> bool:
    accounts = _carica_accounts()
    for a in accounts:
        if a["username"] == username:
            return a.get("ruolo", "user") == "admin"
    return False


# ── Funzioni esposte ──────────────────────────────────────────────────────────

@eel.expose
def auth_login(username: str, password: str) -> dict:
    global _sessione_attiva, _utente_corrente
    accounts = _carica_accounts()
    user_lower = (username or "").strip().lower()
    for acc in accounts:
        if acc["username"].lower() == user_lower:
            if acc["passwordHash"] == _hash(password):
                _sessione_attiva = True
                _utente_corrente = acc["username"]
                return {
                    "success": True,
                    "user": acc["username"],
                    "ruolo": acc.get("ruolo", "user")
                }
            return {"success": False, "error": "Password errata"}
    return {"success": False, "error": f'Utente "{username}" non trovato'}


@eel.expose
def auth_logout() -> bool:
    global _sessione_attiva, _utente_corrente
    _sessione_attiva = False
    _utente_corrente = None
    return True


@eel.expose
def auth_check_session() -> dict:
    return {
        "active": _sessione_attiva,
        "user": _utente_corrente,
        "ruolo": _get_ruolo(_utente_corrente) if _utente_corrente else None
    }


def _get_ruolo(username: str) -> str:
    for a in _carica_accounts():
        if a["username"] == username:
            return a.get("ruolo", "user")
    return "user"


@eel.expose
def auth_crea_account(username: str, password: str, ruolo: str = "user") -> dict:
    """Solo admin può creare account."""
    if not _is_admin(_utente_corrente):
        return {"success": False, "error": "Non autorizzato"}
    username = username.strip()
    if not username or not password:
        return {"success": False, "error": "Username e password obbligatori"}
    if len(password) < 4:
        return {"success": False, "error": "Password troppo corta (minimo 4 caratteri)"}
    accounts = _carica_accounts()
    if any(a["username"].lower() == username.lower() for a in accounts):
        return {"success": False, "error": "Username già esistente"}
    accounts.append({
        "username": username,
        "passwordHash": _hash(password),
        "ruolo": ruolo if ruolo in ("admin", "user") else "user"
    })
    _salva_accounts(accounts)
    return {"success": True}


@eel.expose
def auth_elimina_account(username: str) -> dict:
    """Solo admin può eliminare. Non si può eliminare admin."""
    if not _is_admin(_utente_corrente):
        return {"success": False, "error": "Non autorizzato"}
    if username.lower() == "admin":
        return {"success": False, "error": "Non puoi eliminare l'account admin"}
    accounts = _carica_accounts()
    accounts = [a for a in accounts if a["username"].lower() != username.lower()]
    _salva_accounts(accounts)
    return {"success": True}


@eel.expose
def auth_cambia_password(username: str, vecchia_pwd: str, nuova_pwd: str) -> dict:
    """Ogni utente può cambiare la propria password."""
    if username != _utente_corrente and not _is_admin(_utente_corrente):
        return {"success": False, "error": "Non autorizzato"}
    if len(nuova_pwd) < 4:
        return {"success": False, "error": "Password troppo corta (minimo 4 caratteri)"}
    accounts = _carica_accounts()
    for acc in accounts:
        if acc["username"] == username:
            # Admin può cambiare password altrui senza vecchia_pwd
            if not _is_admin(_utente_corrente) and acc["passwordHash"] != _hash(vecchia_pwd):
                return {"success": False, "error": "Password attuale errata"}
            acc["passwordHash"] = _hash(nuova_pwd)
            _salva_accounts(accounts)
            return {"success": True}
    return {"success": False, "error": "Utente non trovato"}


@eel.expose
def auth_lista_utenti() -> list:
    """Ritorna lista utenti (solo admin può vederla completa)."""
    if not _is_admin(_utente_corrente):
        return [{"username": _utente_corrente, "ruolo": "user"}]
    return [
        {"username": a["username"], "ruolo": a.get("ruolo", "user")}
        for a in _carica_accounts()
    ]


@eel.expose
def auth_primo_avvio() -> bool:
    # Con account admin predefinito non c'è mai un "primo avvio"
    return False