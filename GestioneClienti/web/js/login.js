/**
 * login.js
 * Login aziendale: nessun form di registrazione pubblico.
 * Solo admin può gestire utenti (dalla sezione Impostazioni).
 */

let _sessioneAttiva = false;
let _utenteCorrente = null;
let _ruoloCorrente = null;

document.addEventListener('DOMContentLoaded', async () => {
    await checkSessioneIniziale();
});

async function checkSessioneIniziale() {
    const sess = await eel.auth_check_session()();
    if (sess && sess.active) {
        await mostraApp(sess.user, sess.ruolo);
        return true;
    }
    mostraFormLogin();
    return false;
}

function mostraFormLogin() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('app-main').style.display = 'none';

    const box = document.getElementById('login-screen').querySelector('.login-box');
    if (!box) return;
    box.innerHTML = `
        <div class="login-header">
            <h1>Scheda Cliente</h1>
            <p>Accedi per continuare</p>
        </div>
        <div id="login-error" class="login-error" style="display:none"></div>
        <form class="login-form" onsubmit="loginUtente(event)">
            <div class="form-group">
                <label for="login-username">Username</label>
                <input type="text" id="login-username" required
                    placeholder="Username" autocomplete="username">
            </div>
            <div class="form-group">
                <label for="login-password">Password</label>
                <input type="password" id="login-password" required
                    placeholder="••••••••" autocomplete="current-password">
            </div>
            <button type="submit" class="login-btn" id="login-btn">Accedi</button>
        </form>
    `;
}

async function loginUtente(event) {
    if (event) event.preventDefault();
    const username = (document.getElementById('login-username')?.value || '').trim();
    const password  = document.getElementById('login-password')?.value || '';
    const btn       = document.getElementById('login-btn');
    const errorDiv  = document.getElementById('login-error');

    btn.disabled = true;
    btn.textContent = 'Accesso in corso...';
    errorDiv.style.display = 'none';

    try {
        const res = await eel.auth_login(username, password)();
        if (res.success) {
            await mostraApp(res.user, res.ruolo);
        } else {
            errorDiv.textContent = res.error || 'Credenziali non valide';
            errorDiv.style.display = 'block';
            errorDiv.className = 'login-error show';
            btn.disabled = false;
            btn.textContent = 'Accedi';
        }
    } catch (e) {
        errorDiv.textContent = 'Errore interno: ' + (e.message || e);
        errorDiv.style.display = 'block';
        btn.disabled = false;
        btn.textContent = 'Accedi';
    }
}

async function mostraApp(username, ruolo) {
    _sessioneAttiva = true;
    _utenteCorrente = username;
    _ruoloCorrente  = ruolo || 'user';
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-main').style.display = 'block';
    const el = document.getElementById('user-email-display');
    if (el) el.textContent = username;
    if (typeof caricaDatiApp === 'function') await caricaDatiApp();
    // Mostra voce sidebar Utenti solo all'admin
    const navUtenti = document.getElementById('nav-gestione-utenti');
    if (navUtenti) {
    navUtenti.style.display = (_ruoloCorrente === 'admin') ? 'flex' : 'none';
}
}

async function logoutUtente() {
    if (!confirm('Vuoi uscire?')) return;
    await eel.auth_logout()();
    _sessioneAttiva = false;
    _utenteCorrente = null;
    _ruoloCorrente  = null;
    mostraFormLogin();
}

// ── Gestione utenti (solo admin) ──────────────────────────────────────────────

async function apriGestioneUtenti() {
    // Questo pulsante non viene mai mostrato ai non-admin (vedi sotto)
    if (_ruoloCorrente !== 'admin') return;

    const utenti = await eel.auth_lista_utenti()();

    const righeUtenti = utenti.map(u => `
        <div style="display:flex;justify-content:space-between;align-items:center;
                    padding:8px 0;border-bottom:1px solid #f1f5f9">
            <span>
                <strong>${u.username}</strong>
                <span style="font-size:11px;color:#94a3b8;margin-left:6px">
                    ${u.ruolo === 'admin' ? '👑 admin' : 'utente'}
                </span>
            </span>
            ${u.username !== 'admin' ? `
            <div style="display:flex;gap:6px">
                <button class="btn-secondary" style="padding:3px 10px;font-size:11px"
                    onclick="resetPasswordUtente('${u.username}')">Reset pwd</button>
                <button class="btn-danger" style="padding:3px 10px;font-size:11px"
                    onclick="eliminaUtente('${u.username}')">Elimina</button>
            </div>` : '<span style="font-size:11px;color:#94a3b8">non eliminabile</span>'}
        </div>
    `).join('');

    const html = `
        <div style="margin-bottom:20px">
            <strong style="font-size:13px">Utenti registrati</strong>
            <div style="margin-top:10px">${righeUtenti}</div>
        </div>
        <hr style="margin:16px 0;border-color:#e2e8f0">
        <strong style="font-size:13px">Aggiungi nuovo utente</strong>
        <div class="form-group" style="margin-top:12px">
            <label>Username</label>
            <input type="text" id="nuovo-utente-username" class="form-input"
                placeholder="Es. mario.rossi">
        </div>
        <div class="form-group">
            <label>Password iniziale</label>
            <input type="password" id="nuovo-utente-password" class="form-input"
                placeholder="Minimo 4 caratteri">
        </div>
        <div class="form-group">
            <label>Ruolo</label>
            <select id="nuovo-utente-ruolo" class="form-select">
                <option value="user">Utente standard</option>
                <option value="admin">Admin</option>
            </select>
        </div>
        <hr style="margin:16px 0;border-color:#e2e8f0">
        <strong style="font-size:13px">Cambia la tua password</strong>
        <div class="form-group" style="margin-top:12px">
            <label>Password attuale</label>
            <input type="password" id="cambia-pwd-vecchia" class="form-input">
        </div>
        <div class="form-group">
            <label>Nuova password</label>
            <input type="password" id="cambia-pwd-nuova" class="form-input">
        </div>
    `;

    document.getElementById('modal-pdf-body').innerHTML = html;
    document.querySelector('#modal-pdf .modal-header h2').textContent = 'Gestione Utenti';
    document.querySelector('#modal-pdf .modal-footer .btn-primary').textContent = 'Salva';
    document.querySelector('#modal-pdf .modal-footer .btn-primary')
        .setAttribute('onclick', 'salvaGestioneUtenti()');
    apriModal('modal-pdf');
}

async function salvaGestioneUtenti() {
    const username  = (document.getElementById('nuovo-utente-username')?.value || '').trim();
    const password  = document.getElementById('nuovo-utente-password')?.value || '';
    const ruolo     = document.getElementById('nuovo-utente-ruolo')?.value || 'user';
    const vecchiaPwd = document.getElementById('cambia-pwd-vecchia')?.value || '';
    const nuovaPwd   = document.getElementById('cambia-pwd-nuova')?.value || '';

    if (username && password) {
        const res = await eel.auth_crea_account(username, password, ruolo)();
        if (res.success) showToast(`Utente "${username}" creato!`, 'success');
        else { showToast(res.error, 'error'); return; }
    }
    if (vecchiaPwd && nuovaPwd) {
        const res = await eel.auth_cambia_password(_utenteCorrente, vecchiaPwd, nuovaPwd)();
        if (res.success) showToast('Password aggiornata!', 'success');
        else { showToast(res.error, 'error'); return; }
    }
    chiudiModal('modal-pdf');
    apriGestioneUtenti(); // riapre con lista aggiornata
}

async function eliminaUtente(username) {
    if (!confirm(`Eliminare l'utente "${username}"?`)) return;
    const res = await eel.auth_elimina_account(username)();
    if (res.success) { showToast(`Utente eliminato`, 'success'); chiudiModal('modal-pdf'); apriGestioneUtenti(); }
    else showToast(res.error, 'error');
}

async function resetPasswordUtente(username) {
    const nuovaPwd = prompt(`Nuova password per "${username}":`);
    if (!nuovaPwd) return;
    // Admin può resettare senza vecchia password (stringa vuota bypassata lato Python)
    const res = await eel.auth_cambia_password(username, '', nuovaPwd)();
    if (res.success) showToast(`Password di "${username}" aggiornata`, 'success');
    else showToast(res.error, 'error');
}