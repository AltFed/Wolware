# routes/scadenzario.py
# Blueprint 'scadenzario' — API REST per Scadenzario e Database Dipendenti.
#
# GET  /api/scadenzario                    → tutte le assunzioni (con dati ditta)
# GET  /api/scadenzario/archivio           → pratiche archiviate (?mese=&anno=)
# GET  /api/database-dipendenti            → vista database (non annullate, con ditta)
# POST /api/assunzioni                     → crea nuova assunzione
# GET  /api/assunzioni/<id>                → dettaglio singola assunzione
# PUT  /api/assunzioni/<id>                → aggiorna assunzione (tutti i campi)
# PATCH /api/assunzioni/<id>               → aggiorna solo campi specifici (toggle flag)
# DELETE /api/assunzioni/<id>              → elimina assunzione completa
# DELETE /api/assunzioni/<id>/cessazione   → rimuove solo la cessazione
# DELETE /api/assunzioni/<id>/ultima-proroga → rimuove l'ultima proroga

import json
import datetime
from flask import Blueprint, request, jsonify
from database import get_db
from auth.decorators import login_required

bp = Blueprint('scadenzario', __name__)


def _fmt_date(s):
    """Converte 'YYYY-MM-DD' → 'DD/MM/YYYY' (restituisce '' se None)."""
    if not s:
        return ''
    try:
        parts = s.split('-')
        if len(parts) == 3:
            return f"{parts[2]}/{parts[1]}/{parts[0]}"
    except Exception:
        pass
    return s


def _ass_to_dict(row, conn):
    """Converte una riga assunzioni (sqlite3.Row) in dict JSON-serializzabile,
    aggiungendo i dati della ditta collegata."""
    d = dict(row)

    # Deserializza i campi JSON
    for field in ('proroghe_json', 'trasformazione_json', 'cessazione_json'):
        val = d.get(field)
        if val:
            try:
                d[field] = json.loads(val)
            except (json.JSONDecodeError, TypeError):
                d[field] = [] if field == 'proroghe_json' else None
        else:
            d[field] = [] if field == 'proroghe_json' else None

    # Dati ditta (JOIN sul lato Python per semplicità)
    ditta_id = d.get('ditta_id')
    if ditta_id:
        ditta = conn.execute(
            '''SELECT id, ragione_sociale, partita_iva, codice_fiscale,
                      codice_ateco, settore_ateco, amministratore,
                      cf_amministratore, pec, email,
                      indirizzo, cap, citta, provincia, cod_catastale,
                      codice_interno, matricola_inps_hr, pat_inail_hr,
                      ccnl, codice_ccnl, codice_cnel,
                      sede_lav_indirizzo, sede_lav_cap,
                      sede_lav_comune, sede_lav_provincia, sede_lav_cod_catastale
               FROM ditte WHERE id = ?''', (ditta_id,)
        ).fetchone()
        d['ditta'] = dict(ditta) if ditta else None
    else:
        d['ditta'] = None

    return d


def _genera_matricola(conn, anno):
    """Genera la prossima matricola: YY + numero progressivo a 2 cifre."""
    yy = str(anno)[-2:]
    count = conn.execute(
        "SELECT COUNT(*) FROM assunzioni WHERE strftime('%Y', data_assunzione) = ?",
        (str(anno),)
    ).fetchone()[0]
    return f"{yy}{str(count + 1).zfill(2)}"


# ── GET /api/scadenzario ──────────────────────────────────────────────────────
@bp.route('/api/scadenzario', methods=['GET'])
@login_required
def get_scadenzario():
    """Restituisce tutte le assunzioni per il frontend dello scadenzario.
    Il frontend applica la logica di filtro attivo/archivio."""
    conn = get_db()
    try:
        rows = conn.execute(
            'SELECT * FROM assunzioni ORDER BY data_assunzione DESC'
        ).fetchall()
        result = [_ass_to_dict(r, conn) for r in rows]
        return jsonify(result)
    finally:
        conn.close()


# ── GET /api/scadenzario/archivio ─────────────────────────────────────────────
@bp.route('/api/scadenzario/archivio', methods=['GET'])
@login_required
def get_archivio():
    """Restituisce le pratiche archiviate per un mese/anno selezionato.
    Una pratica è 'archiviata' se la sua data rilevante è > 2 mesi fa."""
    mese = request.args.get('mese', type=int)
    anno = request.args.get('anno', type=int)
    if not mese or not anno:
        return jsonify({'error': 'mese e anno richiesti'}), 400

    conn = get_db()
    try:
        rows = conn.execute(
            'SELECT * FROM assunzioni ORDER BY data_assunzione DESC'
        ).fetchall()
        result = [_ass_to_dict(r, conn) for r in rows]
        return jsonify({'mese': mese, 'anno': anno, 'assunzioni': result})
    finally:
        conn.close()


# ── GET /api/database-dipendenti ──────────────────────────────────────────────
@bp.route('/api/database-dipendenti', methods=['GET'])
@login_required
def get_database():
    """Vista database: tutte le assunzioni non annullate, con dati ditta,
    ordinate per ragione_sociale poi cognome."""
    conn = get_db()
    try:
        rows = conn.execute(
            '''SELECT a.*
               FROM assunzioni a
               LEFT JOIN ditte d ON a.ditta_id = d.id
               WHERE a.annullata = 0
               ORDER BY COALESCE(d.ragione_sociale,'') COLLATE NOCASE,
                        a.cognome COLLATE NOCASE,
                        a.nome    COLLATE NOCASE'''
        ).fetchall()
        result = [_ass_to_dict(r, conn) for r in rows]
        return jsonify(result)
    finally:
        conn.close()


# ── POST /api/assunzioni ──────────────────────────────────────────────────────
@bp.route('/api/assunzioni', methods=['POST'])
@login_required
def crea_assunzione():
    data = request.get_json(silent=True) or {}
    conn = get_db()
    try:
        # Genera matricola automatica se non fornita
        if not data.get('matricola'):
            anno = datetime.date.today().year
            da = data.get('data_assunzione', '')
            if da and len(da) >= 4:
                try:
                    anno = int(da[:4])
                except ValueError:
                    pass
            data['matricola'] = _genera_matricola(conn, anno)

        # Serializza sotto-oggetti JSON
        proroghe = data.get('proroghe_json', [])
        if isinstance(proroghe, list):
            proroghe = json.dumps(proroghe, ensure_ascii=False)

        trasf = data.get('trasformazione_json')
        if trasf and not isinstance(trasf, str):
            trasf = json.dumps(trasf, ensure_ascii=False)

        cess = data.get('cessazione_json')
        if cess and not isinstance(cess, str):
            cess = json.dumps(cess, ensure_ascii=False)

        cur = conn.execute(
            '''INSERT INTO assunzioni (
                stato, tipo_pratica, matricola, ditta_id,
                cognome, nome, codice_fiscale, sesso,
                data_nascita, comune_nascita, catastale_nascita,
                comune_residenza, catastale_residenza, cap_residenza, indirizzo_residenza,
                codice_istruzione, livello_istruzione, descrizione_istruzione,
                lavoratore_straniero, numero_permesso, motivo_permesso, rilasciato_da,
                data_rilascio_permesso, data_scadenza_permesso, in_rinnovo,
                data_assunzione, data_fine_contratto, tipo_contratto, intermittente_tipo,
                qualifica, livello, codice_istat, qualifica_istat, mansione,
                tipologia_orario, ore_settimanali, numero_mensilita,
                retribuzione_base, retribuzione_pt, netto_busta,
                tredicesima, quattordicesima, rateo_permessi,
                periodo_prova, ferie, permessi_contrattuali, preavviso, distribuzione_orario,
                socio_lavoratore, lavoratore_mobilita, lavoro_stagionale,
                assunzione_obbligatoria, tipo_assunzione_obbligatoria,
                lavoro_agricoltura, pubblica_amministrazione,
                proroghe_json, trasformazione_json, cessazione_json
            ) VALUES (
                ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,
                ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,
                ?,?,?,?,?,?,?,?
            )''',
            (
                data.get('stato', 'bozza'),
                data.get('tipo_pratica', 'assunzione'),
                data.get('matricola'),
                data.get('ditta_id'),
                data.get('cognome', ''),
                data.get('nome', ''),
                data.get('codice_fiscale'),
                data.get('sesso'),
                data.get('data_nascita'),
                data.get('comune_nascita'),
                data.get('catastale_nascita'),
                data.get('comune_residenza'),
                data.get('catastale_residenza'),
                data.get('cap_residenza'),
                data.get('indirizzo_residenza'),
                data.get('codice_istruzione'),
                data.get('livello_istruzione'),
                data.get('descrizione_istruzione'),
                1 if data.get('lavoratore_straniero') else 0,
                data.get('numero_permesso'),
                data.get('motivo_permesso'),
                data.get('rilasciato_da'),
                data.get('data_rilascio_permesso'),
                data.get('data_scadenza_permesso'),
                1 if data.get('in_rinnovo') else 0,
                data.get('data_assunzione'),
                data.get('data_fine_contratto'),
                data.get('tipo_contratto'),
                data.get('intermittente_tipo'),
                data.get('qualifica'),
                data.get('livello'),
                data.get('codice_istat'),
                data.get('qualifica_istat'),
                data.get('mansione'),
                data.get('tipologia_orario'),
                data.get('ore_settimanali'),
                data.get('numero_mensilita'),
                data.get('retribuzione_base'),
                data.get('retribuzione_pt'),
                data.get('netto_busta'),
                1 if data.get('tredicesima') else 0,
                1 if data.get('quattordicesima') else 0,
                1 if data.get('rateo_permessi') else 0,
                data.get('periodo_prova'),
                data.get('ferie'),
                data.get('permessi_contrattuali'),
                data.get('preavviso'),
                data.get('distribuzione_orario'),
                1 if data.get('socio_lavoratore') else 0,
                1 if data.get('lavoratore_mobilita') else 0,
                1 if data.get('lavoro_stagionale') else 0,
                1 if data.get('assunzione_obbligatoria') else 0,
                data.get('tipo_assunzione_obbligatoria'),
                1 if data.get('lavoro_agricoltura') else 0,
                1 if data.get('pubblica_amministrazione') else 0,
                proroghe,
                trasf,
                cess,
            )
        )
        conn.commit()
        new_id = cur.lastrowid
        row = conn.execute('SELECT * FROM assunzioni WHERE id=?', (new_id,)).fetchone()
        return jsonify(_ass_to_dict(row, conn)), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()


# ── GET /api/assunzioni/<id> ──────────────────────────────────────────────────
@bp.route('/api/assunzioni/<int:aid>', methods=['GET'])
@login_required
def get_assunzione(aid):
    conn = get_db()
    try:
        row = conn.execute('SELECT * FROM assunzioni WHERE id=?', (aid,)).fetchone()
        if not row:
            return jsonify({'error': 'Non trovata'}), 404
        return jsonify(_ass_to_dict(row, conn))
    finally:
        conn.close()


# ── PUT /api/assunzioni/<id> ──────────────────────────────────────────────────
@bp.route('/api/assunzioni/<int:aid>', methods=['PUT'])
@login_required
def aggiorna_assunzione(aid):
    data = request.get_json(silent=True) or {}
    conn = get_db()
    try:
        existing = conn.execute('SELECT id FROM assunzioni WHERE id=?', (aid,)).fetchone()
        if not existing:
            return jsonify({'error': 'Non trovata'}), 404

        # Serializza sotto-oggetti JSON
        proroghe = data.get('proroghe_json', [])
        if isinstance(proroghe, list):
            proroghe = json.dumps(proroghe, ensure_ascii=False)

        trasf = data.get('trasformazione_json')
        if trasf and not isinstance(trasf, str):
            trasf = json.dumps(trasf, ensure_ascii=False)

        cess = data.get('cessazione_json')
        if cess and not isinstance(cess, str):
            cess = json.dumps(cess, ensure_ascii=False)

        conn.execute(
            '''UPDATE assunzioni SET
                stato=?, tipo_pratica=?, matricola=?, ditta_id=?,
                cognome=?, nome=?, codice_fiscale=?, sesso=?,
                data_nascita=?, comune_nascita=?, catastale_nascita=?,
                comune_residenza=?, catastale_residenza=?, cap_residenza=?, indirizzo_residenza=?,
                codice_istruzione=?, livello_istruzione=?, descrizione_istruzione=?,
                lavoratore_straniero=?, numero_permesso=?, motivo_permesso=?, rilasciato_da=?,
                data_rilascio_permesso=?, data_scadenza_permesso=?, in_rinnovo=?,
                data_assunzione=?, data_fine_contratto=?, tipo_contratto=?, intermittente_tipo=?,
                qualifica=?, livello=?, codice_istat=?, qualifica_istat=?, mansione=?,
                tipologia_orario=?, ore_settimanali=?, numero_mensilita=?,
                retribuzione_base=?, retribuzione_pt=?, netto_busta=?,
                tredicesima=?, quattordicesima=?, rateo_permessi=?,
                periodo_prova=?, ferie=?, permessi_contrattuali=?, preavviso=?, distribuzione_orario=?,
                socio_lavoratore=?, lavoratore_mobilita=?, lavoro_stagionale=?,
                assunzione_obbligatoria=?, tipo_assunzione_obbligatoria=?,
                lavoro_agricoltura=?, pubblica_amministrazione=?,
                proroghe_json=?, trasformazione_json=?, cessazione_json=?,
                updated_at=datetime('now','localtime')
               WHERE id=?''',
            (
                data.get('stato', 'bozza'),
                data.get('tipo_pratica', 'assunzione'),
                data.get('matricola'),
                data.get('ditta_id'),
                data.get('cognome', ''),
                data.get('nome', ''),
                data.get('codice_fiscale'),
                data.get('sesso'),
                data.get('data_nascita'),
                data.get('comune_nascita'),
                data.get('catastale_nascita'),
                data.get('comune_residenza'),
                data.get('catastale_residenza'),
                data.get('cap_residenza'),
                data.get('indirizzo_residenza'),
                data.get('codice_istruzione'),
                data.get('livello_istruzione'),
                data.get('descrizione_istruzione'),
                1 if data.get('lavoratore_straniero') else 0,
                data.get('numero_permesso'),
                data.get('motivo_permesso'),
                data.get('rilasciato_da'),
                data.get('data_rilascio_permesso'),
                data.get('data_scadenza_permesso'),
                1 if data.get('in_rinnovo') else 0,
                data.get('data_assunzione'),
                data.get('data_fine_contratto'),
                data.get('tipo_contratto'),
                data.get('intermittente_tipo'),
                data.get('qualifica'),
                data.get('livello'),
                data.get('codice_istat'),
                data.get('qualifica_istat'),
                data.get('mansione'),
                data.get('tipologia_orario'),
                data.get('ore_settimanali'),
                data.get('numero_mensilita'),
                data.get('retribuzione_base'),
                data.get('retribuzione_pt'),
                data.get('netto_busta'),
                1 if data.get('tredicesima') else 0,
                1 if data.get('quattordicesima') else 0,
                1 if data.get('rateo_permessi') else 0,
                data.get('periodo_prova'),
                data.get('ferie'),
                data.get('permessi_contrattuali'),
                data.get('preavviso'),
                data.get('distribuzione_orario'),
                1 if data.get('socio_lavoratore') else 0,
                1 if data.get('lavoratore_mobilita') else 0,
                1 if data.get('lavoro_stagionale') else 0,
                1 if data.get('assunzione_obbligatoria') else 0,
                data.get('tipo_assunzione_obbligatoria'),
                1 if data.get('lavoro_agricoltura') else 0,
                1 if data.get('pubblica_amministrazione') else 0,
                proroghe,
                trasf,
                cess,
                aid,
            )
        )
        conn.commit()
        row = conn.execute('SELECT * FROM assunzioni WHERE id=?', (aid,)).fetchone()
        return jsonify(_ass_to_dict(row, conn))
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()


# ── PATCH /api/assunzioni/<id> ────────────────────────────────────────────────
@bp.route('/api/assunzioni/<int:aid>', methods=['PATCH'])
@login_required
def patch_assunzione(aid):
    """Aggiorna solo i campi inviati (usato per toggle flag e aggiornamenti parziali)."""
    data = request.get_json(silent=True) or {}
    conn = get_db()
    try:
        existing = conn.execute('SELECT id FROM assunzioni WHERE id=?', (aid,)).fetchone()
        if not existing:
            return jsonify({'error': 'Non trovata'}), 404

        allowed_fields = {
            'stato', 'presenze_fatto', 'slp_fatto', 'unilav_fatto', 'data_unilav',
            'email_assunzione_inviata', 'proroghe_json', 'trasformazione_json',
            'cessazione_json', 'unilav_cessazione_fatto', 'data_unilav_cessazione',
            'email_cessazione_inviata', 'presenze_cessazione_fatto', 'slp_cessazione_fatto',
            'annullata', 'data_annullamento', 'email_annullamento_inviata',
            'email_scadenza_inviata', 'unilav_scadenza_fatto', 'data_unilav_scadenza',
        }

        set_clauses = []
        values = []
        for field, val in data.items():
            if field not in allowed_fields:
                continue
            if field in ('proroghe_json', 'trasformazione_json', 'cessazione_json'):
                if not isinstance(val, str):
                    val = json.dumps(val, ensure_ascii=False)
            set_clauses.append(f'{field}=?')
            values.append(val)

        if not set_clauses:
            return jsonify({'error': 'Nessun campo valido'}), 400

        set_clauses.append("updated_at=datetime('now','localtime')")
        values.append(aid)
        conn.execute(
            f"UPDATE assunzioni SET {', '.join(set_clauses)} WHERE id=?",
            values
        )
        conn.commit()
        row = conn.execute('SELECT * FROM assunzioni WHERE id=?', (aid,)).fetchone()
        return jsonify(_ass_to_dict(row, conn))
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()


# ── DELETE /api/assunzioni/<id> ───────────────────────────────────────────────
@bp.route('/api/assunzioni/<int:aid>', methods=['DELETE'])
@login_required
def elimina_assunzione(aid):
    conn = get_db()
    try:
        existing = conn.execute('SELECT id FROM assunzioni WHERE id=?', (aid,)).fetchone()
        if not existing:
            return jsonify({'error': 'Non trovata'}), 404
        conn.execute('DELETE FROM assunzioni WHERE id=?', (aid,))
        conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()


# ── DELETE /api/assunzioni/<id>/cessazione ────────────────────────────────────
@bp.route('/api/assunzioni/<int:aid>/cessazione', methods=['DELETE'])
@login_required
def elimina_cessazione(aid):
    """Rimuove solo i dati di cessazione dalla pratica, mantenendo l'assunzione."""
    conn = get_db()
    try:
        existing = conn.execute('SELECT id FROM assunzioni WHERE id=?', (aid,)).fetchone()
        if not existing:
            return jsonify({'error': 'Non trovata'}), 404
        conn.execute(
            '''UPDATE assunzioni SET
                cessazione_json=NULL,
                unilav_cessazione_fatto=0,
                data_unilav_cessazione=NULL,
                email_cessazione_inviata=0,
                presenze_cessazione_fatto=0,
                slp_cessazione_fatto=0,
                updated_at=datetime('now','localtime')
               WHERE id=?''',
            (aid,)
        )
        conn.commit()
        row = conn.execute('SELECT * FROM assunzioni WHERE id=?', (aid,)).fetchone()
        return jsonify(_ass_to_dict(row, conn))
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()


# ── DELETE /api/assunzioni/<id>/ultima-proroga ────────────────────────────────
@bp.route('/api/assunzioni/<int:aid>/ultima-proroga', methods=['DELETE'])
@login_required
def elimina_ultima_proroga(aid):
    """Rimuove l'ultima proroga dall'array proroghe_json."""
    conn = get_db()
    try:
        row = conn.execute('SELECT * FROM assunzioni WHERE id=?', (aid,)).fetchone()
        if not row:
            return jsonify({'error': 'Non trovata'}), 404

        proroghe_raw = row['proroghe_json'] or '[]'
        try:
            proroghe = json.loads(proroghe_raw)
        except json.JSONDecodeError:
            proroghe = []

        if not proroghe:
            return jsonify({'error': 'Nessuna proroga da eliminare'}), 400

        # Ripristina la data fine contratto alla proroga precedente o alla originale
        proroga_rimossa = proroghe.pop()
        nuova_data_fine = (
            proroghe[-1]['dataFineProroga'] if proroghe
            else proroga_rimossa.get('vecchiaDataFine', row['data_fine_contratto'])
        )

        conn.execute(
            '''UPDATE assunzioni SET
                proroghe_json=?,
                data_fine_contratto=?,
                email_scadenza_inviata=0,
                unilav_scadenza_fatto=0,
                data_unilav_scadenza=NULL,
                updated_at=datetime('now','localtime')
               WHERE id=?''',
            (json.dumps(proroghe, ensure_ascii=False), nuova_data_fine, aid)
        )
        conn.commit()
        row = conn.execute('SELECT * FROM assunzioni WHERE id=?', (aid,)).fetchone()
        return jsonify(_ass_to_dict(row, conn))
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()
