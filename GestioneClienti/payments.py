#!/usr/bin/env python3
"""
payments.py
CRUD pagamenti clienti.
"""
import eel
from database import get_conn


def _row_to_pagamento(r) -> dict:
    return {
        "id":               r["id"],
        "clienteId":        r["clienteid"],
        "data":             r["data"],
        "importo":          float(r["importo"] or 0),
        "mezzo":            r["mezzo"],
        "movimentoStudioId": r["movimentostudioid"],
        "tipologia":        r["tipologia"],
        "note":             r["note"],
    }


@eel.expose
def db_carica_pagamenti() -> list:
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM pagamenti ORDER BY data DESC"
        ).fetchall()
    return [_row_to_pagamento(r) for r in rows]


@eel.expose
def db_salva_pagamento(pagamento: dict) -> dict | None:
    record = (
        pagamento["clienteId"],
        pagamento["data"],
        float(pagamento.get("importo", 0)),
        pagamento.get("mezzo"),
        pagamento.get("movimentoStudioId"),
        pagamento.get("tipologia"),
        pagamento.get("note"),
    )
    pid = pagamento.get("id")
    with get_conn() as conn:
        if pid and isinstance(pid, int) and pid > 0:
            conn.execute("""
                UPDATE pagamenti
                SET clienteid=?, data=?, importo=?, mezzo=?,
                    movimentostudioid=?, tipologia=?, note=?
                WHERE id=?
            """, record + (pid,))
            return {"id": pid}
        else:
            cur = conn.execute("""
                INSERT INTO pagamenti
                    (clienteid, data, importo, mezzo, movimentostudioid, tipologia, note)
                VALUES (?,?,?,?,?,?,?)
            """, record)
            return {"id": cur.lastrowid}


@eel.expose
def db_elimina_pagamento(pid: int) -> bool:
    with get_conn() as conn:
        conn.execute("DELETE FROM pagamenti WHERE id=?", (pid,))
    return True
