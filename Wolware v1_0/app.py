from flask import Flask, render_template, request, jsonify
import sqlite3
import os
from datetime import datetime

app = Flask(__name__)

# Il database viene salvato nella stessa cartella dell'app
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'wolware.db')


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS ditte (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ragione_sociale TEXT NOT NULL,
        partita_iva TEXT UNIQUE,
        codice_fiscale TEXT,
        forma_giuridica TEXT,
        settore_ateco TEXT,
        codice_ateco TEXT,
        indirizzo TEXT,
        citta TEXT,
        cap TEXT,
        provincia TEXT,
        telefono TEXT,
        email TEXT,
        pec TEXT,
        referente TEXT,
        data_inizio_rapporto TEXT,
        note TEXT,
        created_at TEXT DEFAULT (datetime('now'))
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS pratiche (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ditta_id INTEGER,
        tipo_pratica TEXT NOT NULL,
        descrizione TEXT,
        stato TEXT DEFAULT 'Aperta',
        priorita TEXT DEFAULT 'Normale',
        data_apertura TEXT,
        data_scadenza TEXT,
        data_chiusura TEXT,
        note TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (ditta_id) REFERENCES ditte(id)
    )''')
    conn.commit()
    conn.close()


init_db()


# ── ROUTES ──────────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/ditte', methods=['GET'])
def get_ditte():
    conn = get_db()
    ditte = conn.execute('SELECT * FROM ditte ORDER BY ragione_sociale').fetchall()
    conn.close()
    return jsonify([dict(d) for d in ditte])


@app.route('/api/ditte', methods=['POST'])
def create_ditta():
    data = request.get_json()
    if not data.get('ragione_sociale'):
        return jsonify({'error': 'Ragione Sociale obbligatoria'}), 400
    conn = get_db()
    try:
        conn.execute('''INSERT INTO ditte
            (ragione_sociale,partita_iva,codice_fiscale,forma_giuridica,settore_ateco,
             codice_ateco,indirizzo,citta,cap,provincia,telefono,email,pec,referente,
             data_inizio_rapporto,note)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''', (
            data.get('ragione_sociale'), data.get('partita_iva'),
            data.get('codice_fiscale'), data.get('forma_giuridica'),
            data.get('settore_ateco'), data.get('codice_ateco'),
            data.get('indirizzo'), data.get('citta'), data.get('cap'),
            data.get('provincia'), data.get('telefono'), data.get('email'),
            data.get('pec'), data.get('referente'),
            data.get('data_inizio_rapporto'), data.get('note')))
        conn.commit()
        new_id = conn.execute('SELECT last_insert_rowid()').fetchone()[0]
        d = conn.execute('SELECT * FROM ditte WHERE id=?', (new_id,)).fetchone()
        conn.close()
        return jsonify(dict(d)), 201
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': 'Partita IVA già presente'}), 409


@app.route('/api/ditte/<int:id>', methods=['GET'])
def get_ditta(id):
    conn = get_db()
    d = conn.execute('SELECT * FROM ditte WHERE id=?', (id,)).fetchone()
    conn.close()
    return jsonify(dict(d)) if d else (jsonify({'error': 'Non trovata'}), 404)


@app.route('/api/ditte/<int:id>', methods=['PUT'])
def update_ditta(id):
    data = request.get_json()
    conn = get_db()
    conn.execute('''UPDATE ditte SET ragione_sociale=?,partita_iva=?,codice_fiscale=?,
        forma_giuridica=?,settore_ateco=?,codice_ateco=?,indirizzo=?,citta=?,cap=?,
        provincia=?,telefono=?,email=?,pec=?,referente=?,data_inizio_rapporto=?,note=?
        WHERE id=?''', (
        data.get('ragione_sociale'), data.get('partita_iva'),
        data.get('codice_fiscale'), data.get('forma_giuridica'),
        data.get('settore_ateco'), data.get('codice_ateco'),
        data.get('indirizzo'), data.get('citta'), data.get('cap'),
        data.get('provincia'), data.get('telefono'), data.get('email'),
        data.get('pec'), data.get('referente'),
        data.get('data_inizio_rapporto'), data.get('note'), id))
    conn.commit()
    d = conn.execute('SELECT * FROM ditte WHERE id=?', (id,)).fetchone()
    conn.close()
    return jsonify(dict(d))


@app.route('/api/ditte/<int:id>', methods=['DELETE'])
def delete_ditta(id):
    conn = get_db()
    conn.execute('DELETE FROM ditte WHERE id=?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})


@app.route('/api/pratiche', methods=['GET'])
def get_pratiche():
    conn = get_db()
    pratiche = conn.execute('''SELECT p.*, d.ragione_sociale as ditta_nome
        FROM pratiche p LEFT JOIN ditte d ON p.ditta_id=d.id
        ORDER BY p.created_at DESC''').fetchall()
    conn.close()
    return jsonify([dict(p) for p in pratiche])


@app.route('/api/pratiche', methods=['POST'])
def create_pratica():
    data = request.get_json()
    if not data.get('tipo_pratica'):
        return jsonify({'error': 'Tipo pratica obbligatorio'}), 400
    conn = get_db()
    conn.execute('''INSERT INTO pratiche
        (ditta_id,tipo_pratica,descrizione,stato,priorita,data_apertura,data_scadenza,note)
        VALUES (?,?,?,?,?,?,?,?)''', (
        data.get('ditta_id'), data.get('tipo_pratica'), data.get('descrizione'),
        data.get('stato', 'Aperta'), data.get('priorita', 'Normale'),
        data.get('data_apertura', datetime.now().strftime('%Y-%m-%d')),
        data.get('data_scadenza'), data.get('note')))
    conn.commit()
    new_id = conn.execute('SELECT last_insert_rowid()').fetchone()[0]
    p = conn.execute('''SELECT p.*, d.ragione_sociale as ditta_nome
        FROM pratiche p LEFT JOIN ditte d ON p.ditta_id=d.id
        WHERE p.id=?''', (new_id,)).fetchone()
    conn.close()
    return jsonify(dict(p)), 201


@app.route('/api/pratiche/<int:id>', methods=['PUT'])
def update_pratica(id):
    data = request.get_json()
    conn = get_db()
    conn.execute('''UPDATE pratiche SET ditta_id=?,tipo_pratica=?,descrizione=?,stato=?,
        priorita=?,data_apertura=?,data_scadenza=?,data_chiusura=?,note=? WHERE id=?''', (
        data.get('ditta_id'), data.get('tipo_pratica'), data.get('descrizione'),
        data.get('stato'), data.get('priorita'), data.get('data_apertura'),
        data.get('data_scadenza'), data.get('data_chiusura'), data.get('note'), id))
    conn.commit()
    p = conn.execute('''SELECT p.*, d.ragione_sociale as ditta_nome
        FROM pratiche p LEFT JOIN ditte d ON p.ditta_id=d.id
        WHERE p.id=?''', (id,)).fetchone()
    conn.close()
    return jsonify(dict(p))


@app.route('/api/pratiche/<int:id>', methods=['DELETE'])
def delete_pratica(id):
    conn = get_db()
    conn.execute('DELETE FROM pratiche WHERE id=?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})


@app.route('/api/stats')
def get_stats():
    conn = get_db()
    s = {
        'ditte': conn.execute('SELECT COUNT(*) FROM ditte').fetchone()[0],
        'pratiche_aperte': conn.execute(
            "SELECT COUNT(*) FROM pratiche WHERE stato='Aperta'").fetchone()[0],
        'pratiche_chiuse': conn.execute(
            "SELECT COUNT(*) FROM pratiche WHERE stato='Chiusa'").fetchone()[0],
        'pratiche_totali': conn.execute('SELECT COUNT(*) FROM pratiche').fetchone()[0],
    }
    conn.close()
    return jsonify(s)


if __name__ == '__main__':
    # Solo per sviluppo/test via browser
    app.run(debug=True, port=5000)
