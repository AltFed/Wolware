#!/usr/bin/env python3
"""
clients.py
CRUD clienti, pratiche, arrotondamenti (abbuoni), contabilizzazioni,
ultimi estratti conto e tutte le funzioni di calcolo statistiche.
"""
import eel
import json
from database import get_conn, to_json, from_json


# ── Helpers ───────────────────────────────────────────────────────────────────

def _row_to_cliente(r):
    d = dict(r)
    # Deserializza i campi JSON
    d['tariffario']       = json.loads(d['tariffario'] or '[]')
    d['storicotariffari'] = json.loads(d['storicotariffari'] or '[]')
    d['prezziPratiche']   = json.loads(d['prezziPratiche'] or '{}')
    # Normalizza il nome della chiave verso il JS (camelCase)
    return {
        'id':                d['id'],
        'denominazione':     d['denominazione'],
        'codiceFiscale':     d['codicefiscale'],
        'email':             d['email'],
        'telefono':          d['telefono'],
        'indirizzo':         d['indirizzo'],
        'tariffario':        d['tariffario'],        # array voci
        'tariffarioBaseId':  d['tariffariobaseid'],
        'tariffarioNome':    d['tariffarionome'],
        'cadenzaPagamenti':  d['cadenzapagamenti'],
        'residuoIniziale':   d['residuoiniziale'] or 0,
        'inizioPaghe':       d['iniziopaghe'],
        'finePaghe':         d['finepaghe'],
        'inizioContabilita': d['iniziocontabilita'],
        'fineContabilita':   d['finecontabilita'],
        'annotazioni':       d['annotazioni'],
        'archiviato':        bool(d['archiviato']),
        'storicoTariffari':  d['storicotariffari'],  # array cambi tariffario
        'prezziPratiche':    d['prezziPratiche'],    # oggetto prezzi override
        'updated_at':        d['updated_at'],
    }


# ── Clienti ───────────────────────────────────────────────────────────────────

@eel.expose
def db_carica_clienti() -> list:
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM clienti ORDER BY denominazione"
        ).fetchall()
    return [_row_to_cliente(r) for r in rows]


@eel.expose
def db_salva_cliente(cliente: dict) -> dict | None:
    record = (
        cliente.get("denominazione", ""),
        cliente.get("codiceFiscale"),
        cliente.get("email"),
        cliente.get("telefono"),
        cliente.get("indirizzo"),
        to_json(cliente.get("tariffario")),
        cliente.get("tariffarioBaseId"),
        cliente.get("tariffarioNome"),
        cliente.get("cadenzaPagamenti"),
        float(cliente.get("residuoIniziale") or 0),
        cliente.get("inizioPaghe"),
        cliente.get("finePaghe"),
        cliente.get("inizioContabilita"),
        cliente.get("fineContabilita"),
        cliente.get("annotazioni"),
        1 if cliente.get("archiviato") else 0,
        to_json(cliente.get("storicoTariffari")),
        to_json(cliente.get("prezziPratiche")),
        to_json(cliente.get("costiStorico")),   # ← aggiunto
    )
    cid = cliente.get("id")
    with get_conn() as conn:
        if cid and isinstance(cid, int) and cid > 0:
            conn.execute("""
                UPDATE clienti SET
                    denominazione=?, codicefiscale=?, email=?, telefono=?,
                    indirizzo=?, tariffario=?, tariffariobaseid=?, tariffarionome=?,
                    cadenzapagamenti=?, residuoiniziale=?, iniziopaghe=?,
                    finepaghe=?, iniziocontabilita=?, finecontabilita=?,
                    annotazioni=?, archiviato=?, storicotariffari=?,
                    prezziPratiche=?, costiStorico=?,
                    updated_at=datetime('now')
                WHERE id=?
            """, record + (cid,))
            new_id = cid
        else:
            cur = conn.execute("""
                INSERT INTO clienti
                    (denominazione, codicefiscale, email, telefono, indirizzo,
                     tariffario, tariffariobaseid, tariffarionome, cadenzapagamenti,
                     residuoiniziale, iniziopaghe, finepaghe, iniziocontabilita,
                     finecontabilita, annotazioni, archiviato, storicotariffari,
                     prezziPratiche, costiStorico)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, record)
            new_id = cur.lastrowid

        # Rilegge la riga appena scritta e restituisce il cliente completo
        row = conn.execute(
            "SELECT * FROM clienti WHERE id=?", (new_id,)
        ).fetchone()
        return _row_to_cliente(row)


@eel.expose
def db_elimina_cliente(cid: int) -> bool:
    with get_conn() as conn:
        conn.execute("DELETE FROM clienti WHERE id=?", (int(cid),))
    return True


# ── Pratiche Clienti (per mese) ───────────────────────────────────────────────

@eel.expose
def db_carica_pratiche_clienti() -> dict:
    """Ritorna dict {clienteId: {mese: pratiche}}."""
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM praticheclienti").fetchall()
    result: dict = {}
    for r in rows:
        cid = str(r["clienteid"])
        if cid not in result:
            result[cid] = {}
        result[cid][r["mese"]] = from_json(r["pratiche"]) or {}
    return result


@eel.expose
def db_salva_pratica_cliente(cliente_id: int, mese: str, pratiche: dict) -> None:
    pratiche_json = to_json(pratiche)
    with get_conn() as conn:
        existing = conn.execute(
            "SELECT id FROM praticheclienti WHERE clienteid=? AND mese=?",
            (cliente_id, mese)
        ).fetchone()
        if existing:
            conn.execute(
                "UPDATE praticheclienti SET pratiche=? WHERE id=?",
                (pratiche_json, existing["id"])
            )
        else:
            conn.execute(
                "INSERT INTO praticheclienti (clienteid, mese, pratiche) VALUES (?,?,?)",
                (cliente_id, mese, pratiche_json)
            )


@eel.expose
def db_elimina_pratica_cliente(cliente_id: int, mese: str) -> None:
    with get_conn() as conn:
        conn.execute(
            "DELETE FROM praticheclienti WHERE clienteid=? AND mese=?",
            (cliente_id, mese)
        )


# ── Arrotondamenti (Abbuoni) ──────────────────────────────────────────────────

@eel.expose
def db_carica_arrotondamenti() -> dict:
    """Ritorna dict {clienteId: [arrotondamento, ...]}."""
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM arrotondamenti ORDER BY data DESC"
        ).fetchall()
    result: dict = {}
    for r in rows:
        cid = str(r["clienteid"])
        if cid not in result:
            result[cid] = []
        result[cid].append({
            "id":      r["id"],
            "data":    r["data"],
            "importo": float(r["importo"]),
            "note":    r["note"],
        })
    return result


@eel.expose
def db_salva_arrotondamento(cliente_id: int, arrotondamento: dict) -> dict | None:
    with get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO arrotondamenti (clienteid, data, importo, note) VALUES (?,?,?,?)",
            (cliente_id, arrotondamento["data"],
             float(arrotondamento.get("importo", 0)),
             arrotondamento.get("note", ""))
        )
    return {"id": cur.lastrowid}


@eel.expose
def db_elimina_arrotondamento(aid: int) -> bool:
    with get_conn() as conn:
        conn.execute("DELETE FROM arrotondamenti WHERE id=?", (aid,))
    return True


# ── Ultimi Estratti Conto ─────────────────────────────────────────────────────

@eel.expose
def db_carica_ultimi_estratti_conto() -> dict:
    """Ritorna dict {clienteId: data}."""
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM ultimiestratticonto").fetchall()
    return {str(r["clienteid"]): r["data"] for r in rows}


@eel.expose
def db_salva_ultimo_estratto_conto(cliente_id: int, data: str) -> None:
    with get_conn() as conn:
        existing = conn.execute(
            "SELECT id FROM ultimiestratticonto WHERE clienteid=?", (cliente_id,)
        ).fetchone()
        if existing:
            conn.execute(
                "UPDATE ultimiestratticonto SET data=? WHERE id=?",
                (data, existing["id"])
            )
        else:
            conn.execute(
                "INSERT INTO ultimiestratticonto (clienteid, data) VALUES (?,?)",
                (cliente_id, data)
            )


# ── Contabilizzazioni ─────────────────────────────────────────────────────────

@eel.expose
def db_carica_contabilizzazioni() -> dict:
    """Ritorna dict {clienteId: [{mese, voce}, ...]}."""
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM contabilizzazioni").fetchall()
    result: dict = {}
    for r in rows:
        cid = str(r["clienteid"])
        if cid not in result:
            result[cid] = []
        result[cid].append({"mese": r["mese"], "voce": r["voce"]})
    return result


@eel.expose
def db_salva_contabilizzazioni(contabilizzazioni: dict) -> None:
    """Riscrive tutte le contabilizzazioni (delete+insert)."""
    with get_conn() as conn:
        conn.execute("DELETE FROM contabilizzazioni")
        rows = []
        for cliente_id_str, voci in contabilizzazioni.items():
            cid = int(cliente_id_str)
            for v in voci:
                if isinstance(v, dict):
                    rows.append((cid, v.get("mese", ""), v.get("voce", "")))
                else:
                    rows.append((cid, str(v), None))
        if rows:
            conn.executemany(
                "INSERT INTO contabilizzazioni (clienteid, mese, voce) VALUES (?,?,?)",
                rows
            )
