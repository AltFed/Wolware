#!/usr/bin/env python3
"""
movements.py
CRUD movimenti studio (Prima Nota), giroconti, banche studio,
macrogruppi entrate e uscite, movimenti fatturati.
"""
import eel
from database import get_conn, to_json, from_json


# ── Helpers ───────────────────────────────────────────────────────────────────

def _row_to_movimento(r) -> dict:
    mg_id = r["macrogruppoid"]
    mg_nome = r["macrogrupponome"]
    # Se il nome è "Clienti" e macrogruppoid è NULL, l'id logico è "clienti"
    if mg_nome == "Clienti" and mg_id is None:
        mg_id = "clienti"
    return {
        "id":              r["id"],
        "tipo":            r["tipo"],
        "data":            r["data"],
        "tipologia":       r["tipologia"],
        "macrogruppoId":   mg_id,
        "macrogruppoNome": mg_nome,
        "sottovoceId":     r["sottovoceid"],
        "sottovoceNome":   r["sottovocenome"],
        "importo":         float(r["importo"] or 0),
        "descrizione":     r["descrizione"],
        "girocontoDir":    r["girocontodir"],
    }


# ── Movimenti Studio ─────────────────────────────────────────────────────────

@eel.expose
def db_carica_movimenti_studio() -> list:
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM movimentistudio ORDER BY data DESC"
        ).fetchall()
    return [_row_to_movimento(r) for r in rows]


@eel.expose
def db_salva_movimento_studio(movimento: dict) -> dict | None:
    mg_id = movimento.get("macrogruppoId")
    if mg_id == "clienti":
        mg_id_db = None  # Clienti → NULL in DB, identificato dal nome
    else:
        mg_id_db = int(mg_id) if mg_id is not None else None

    record = (
        movimento["tipo"],
        movimento["data"],
        movimento.get("tipologia"),
        mg_id_db,
        movimento.get("macrogruppoNome"),
        movimento.get("sottovoceId"),
        movimento.get("sottovoceNome"),
        float(movimento.get("importo", 0)),
        movimento.get("descrizione"),
        movimento.get("girocontoDir"),
    )
    mid = movimento.get("id")
    with get_conn() as conn:
        if mid and isinstance(mid, int) and mid > 0:
            conn.execute("""
                UPDATE movimentistudio
                SET tipo=?, data=?, tipologia=?, macrogruppoid=?, macrogrupponome=?,
                    sottovoceid=?, sottovocenome=?, importo=?, descrizione=?, girocontodir=?
                WHERE id=?
            """, record + (mid,))
            return {"id": mid}
        else:
            cur = conn.execute("""
                INSERT INTO movimentistudio
                    (tipo, data, tipologia, macrogruppoid, macrogrupponome,
                     sottovoceid, sottovocenome, importo, descrizione, girocontodir)
                VALUES (?,?,?,?,?,?,?,?,?,?)
            """, record)
            return {"id": cur.lastrowid}


@eel.expose
def db_elimina_movimento_studio(mid: int) -> bool:
    with get_conn() as conn:
        conn.execute("DELETE FROM movimentistudio WHERE id=?", (mid,))
    return True


# ── Banche Studio ─────────────────────────────────────────────────────────────

@eel.expose
def db_carica_banche_studio() -> list:
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM banchestudio ORDER BY nome"
        ).fetchall()
    return [
        {"id": r["id"], "nome": r["nome"], "saldoIniziale": float(r["saldoiniziale"] or 0)}
        for r in rows
    ]


@eel.expose
def db_salva_banca_studio(banca: dict) -> dict | None:
    bid = banca.get("id")
    record = (banca["nome"], float(banca.get("saldoIniziale", 0)))
    with get_conn() as conn:
        if bid and isinstance(bid, int) and bid > 0:
            conn.execute(
                "UPDATE banchestudio SET nome=?, saldoiniziale=? WHERE id=?",
                record + (bid,)
            )
            return {"id": bid}
        else:
            cur = conn.execute(
                "INSERT INTO banchestudio (nome, saldoiniziale) VALUES (?,?)", record
            )
            return {"id": cur.lastrowid}


@eel.expose
def db_elimina_banca_studio(bid: int) -> bool:
    with get_conn() as conn:
        conn.execute("DELETE FROM banchestudio WHERE id=?", (bid,))
    return True


# ── Macrogruppi Entrate ───────────────────────────────────────────────────────

@eel.expose
def db_carica_macrogruppi_entrate() -> list:
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM macrogruppientrate ORDER BY nome"
        ).fetchall()
    return [
        {"id": r["id"], "nome": r["nome"], "sottovoci": from_json(r["sottovoci"]) or []}
        for r in rows
    ]


@eel.expose
def db_salva_macrogruppo_entrate(mg: dict) -> dict | None:
    mid = mg.get("id")
    record = (mg["nome"], to_json(mg.get("sottovoci", [])))
    with get_conn() as conn:
        if mid and isinstance(mid, int) and mid > 0:
            conn.execute(
                "UPDATE macrogruppientrate SET nome=?, sottovoci=? WHERE id=?",
                record + (mid,)
            )
            return {"id": mid}
        else:
            cur = conn.execute(
                "INSERT INTO macrogruppientrate (nome, sottovoci) VALUES (?,?)", record
            )
            return {"id": cur.lastrowid}


@eel.expose
def db_elimina_macrogruppo_entrate(mid: int) -> bool:
    with get_conn() as conn:
        conn.execute("DELETE FROM macrogruppientrate WHERE id=?", (mid,))
    return True


# ── Macrogruppi Uscite ────────────────────────────────────────────────────────

@eel.expose
def db_carica_macrogruppi_uscite() -> list:
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM macrogruppiuscite ORDER BY nome"
        ).fetchall()
    return [
        {"id": r["id"], "nome": r["nome"], "sottovoci": from_json(r["sottovoci"]) or []}
        for r in rows
    ]


@eel.expose
def db_salva_macrogruppo_uscite(mg: dict) -> dict | None:
    mid = mg.get("id")
    record = (mg["nome"], to_json(mg.get("sottovoci", [])))
    with get_conn() as conn:
        if mid and isinstance(mid, int) and mid > 0:
            conn.execute(
                "UPDATE macrogruppiuscite SET nome=?, sottovoci=? WHERE id=?",
                record + (mid,)
            )
            return {"id": mid}
        else:
            cur = conn.execute(
                "INSERT INTO macrogruppiuscite (nome, sottovoci) VALUES (?,?)", record
            )
            return {"id": cur.lastrowid}


@eel.expose
def db_elimina_macrogruppo_uscite(mid: int) -> bool:
    with get_conn() as conn:
        conn.execute("DELETE FROM macrogruppiuscite WHERE id=?", (mid,))
    return True


# ── Movimenti Fatturati ───────────────────────────────────────────────────────

@eel.expose
def db_carica_movimenti_fatturati() -> list:
    """Ritorna lista di ID movimenti già fatturati."""
    with get_conn() as conn:
        rows = conn.execute("SELECT movimentoid FROM movimentifatturati").fetchall()
    return [r["movimentoid"] for r in rows]


@eel.expose
def db_salva_movimenti_fatturati(movimento_ids: list) -> None:
    """Riscrive tutti i movimenti fatturati."""
    with get_conn() as conn:
        conn.execute("DELETE FROM movimentifatturati")
        if movimento_ids:
            conn.executemany(
                "INSERT OR IGNORE INTO movimentifatturati (movimentoid) VALUES (?)",
                [(mid,) for mid in movimento_ids]
            )


@eel.expose
def db_salva_movimento_fatturato(movimento_id: int, fattura_id: int = None) -> None:
    with get_conn() as conn:
        conn.execute(
            "INSERT OR IGNORE INTO movimentifatturati (movimentoid, fatturaid) VALUES (?,?)",
            (movimento_id, fattura_id)
        )
