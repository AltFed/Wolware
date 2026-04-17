#!/usr/bin/env python3
"""
tariffs.py
CRUD tariffari base (modelli tariffari configurabili per macrogruppo/voci).
"""
import eel
from database import get_conn, to_json, from_json


@eel.expose
def db_carica_tariffari_base() -> list:
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM tariffaribase ORDER BY nome"
        ).fetchall()
    return [
        {
            "id":          r["id"],
            "nome":        r["nome"],
            "macrogruppi": from_json(r["macrogruppi"]) or [],
        }
        for r in rows
    ]


@eel.expose
def db_salva_tariffario_base(tariffario: dict) -> dict | None:
    tid = tariffario.get("id")
    record = (tariffario["nome"], to_json(tariffario.get("macrogruppi", [])))
    with get_conn() as conn:
        if tid and isinstance(tid, int) and tid > 0:
            conn.execute(
                "UPDATE tariffaribase SET nome=?, macrogruppi=? WHERE id=?",
                record + (tid,)
            )
            return {"id": tid}
        else:
            cur = conn.execute(
                "INSERT INTO tariffaribase (nome, macrogruppi) VALUES (?,?)", record
            )
            return {"id": cur.lastrowid}


@eel.expose
def db_elimina_tariffario_base(tid: int) -> bool:
    with get_conn() as conn:
        conn.execute("DELETE FROM tariffaribase WHERE id=?", (tid,))
    return True
