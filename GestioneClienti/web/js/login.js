/**
 * login.js
 * Login aziendale locale con eel. Nessuna registrazione pubblica.
 * Solo admin può gestire utenti (dalla sezione Impostazioni → Utenti).
 */

// ── Stato sessione ────────────────────────────────────────────────────────────
let _sessioneAttiva = false;
let _utenteCorrente = null;
let _ruoloCorrente  = null;

// ── Helpers modali (compatibili con app.js) ──────────────────────────────────
function _apriModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('show');
}
function _chiudiModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('show');
}


// ── Setup DOM al caricamento ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    await checkSessioneIniziale();
});

// ── Controlla sessione all'avvio ──────────────────────────────────────────────
async function checkSessioneIniziale() {
    try {
        const isPrimoAvvio = await eel.auth_primo_avvio()();
        if (isPrimoAvvio) {
            mostraSetupIniziale();
            return false;
        }
        const sess = await eel.auth_check_session()();
        if (sess && sess.active) {
            await mostraApp(sess.user, sess.ruolo || 'user');
            return true;
        }
    } catch(e) {
        console.warn('Eel non ancora pronto, attendo...', e);
    }
    mostraFormLogin();
    return false;
}

// ── Form login standard ───────────────────────────────────────────────────────
function mostraFormLogin() {
    const loginScreen = document.getElementById('login-screen');
    if (!loginScreen) return;
    loginScreen.style.display = 'flex';
    document.getElementById('app-main').style.display = 'none';

    const box = loginScreen.querySelector('.login-box');
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
                <input type="text" id="login-username" required placeholder="Il tuo username" autocomplete="username">
            </div>
            <div class="form-group">
                <label for="login-password">Password</label>
                <input type="password" id="login-password" required placeholder="••••••••" autocomplete="current-password">
            </div>
            <button type="submit" class="login-btn" id="login-btn">Accedi</button>
        </form>
    `;
}

// ── Primo avvio: crea account admin ──────────────────────────────────────────
function mostraSetupIniziale() {
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen) loginScreen.style.display = 'flex';
    document.getElementById('app-main').style.display = 'none';

    const box = loginScreen ? loginScreen.querySelector('.login-box') : null;
    if (!box) return;
    box.innerHTML = `
        <div class="login-header">
            <h1>Scheda Cliente</h1>
            <p style="color:#16a34a;font-weight:600;">Primo avvio — crea il tuo account admin</p>
        </div>
        <div id="login-error" class="login-error" style="display:none"></div>
        <form class="login-form" onsubmit="creaAccountIniziale(event)">
            <div class="form-group">
                <label for="login-username">Username</label>
                <input type="text" id="login-username" required placeholder="Es. mario" autocomplete="username">
            </div>
            <div class="form-group">
                <label for="login-password">Password</label>
                <input type="password" id="login-password" required placeholder="Scegli una password sicura" autocomplete="new-password">
            </div>
            <div class="form-group">
                <label for="login-password2">Ripeti password</label>
                <input type="password" id="login-password2" required placeholder="Ripeti la password" autocomplete="new-password">
            </div>
            <button type="submit" class="login-btn" id="login-btn">Crea account e accedi</button>
        </form>
        <p style="font-size:12px;color:#94a3b8;text-align:center;margin-top:16px;">
            Puoi aggiungere altri utenti in seguito dalla sezione Utenti nella sidebar.
        </p>
    `;
}

// ── Login ─────────────────────────────────────────────────────────────────────
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
            await mostraApp(res.user, res.ruolo || 'user');
        } else {
            errorDiv.textContent = res.error || 'Credenziali non valide';
            errorDiv.style.display = 'block';
            errorDiv.className = 'login-error show';
        }
    } catch (e) {
        errorDiv.textContent = 'Errore interno: ' + e.message;
        errorDiv.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.textContent = 'Accedi';
    }
}

// ── Creazione primo account ───────────────────────────────────────────────────
async function creaAccountIniziale(event) {
    if (event) event.preventDefault();
    const username  = (document.getElementById('login-username')?.value || '').trim();
    const password  = document.getElementById('login-password')?.value || '';
    const password2 = document.getElementById('login-password2')?.value || '';
    const btn       = document.getElementById('login-btn');
    const errorDiv  = document.getElementById('login-error');

    if (password !== password2) {
        errorDiv.textContent = 'Le password non coincidono';
        errorDiv.style.display = 'block';
        return;
    }
    if (password.length < 4) {
        errorDiv.textContent = 'Password troppo corta (minimo 4 caratteri)';
        errorDiv.style.display = 'block';
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Creazione in corso...';
    errorDiv.style.display = 'none';

    try {
        // Crea come admin (ruolo fisso per il primo account)
        const res = await eel.auth_crea_account(username, password, 'admin')();
        if (res.success) {
            const loginRes = await eel.auth_login(username, password)();
            if (loginRes.success) await mostraApp(loginRes.user, loginRes.ruolo || 'admin');
        } else {
            errorDiv.textContent = res.error;
            errorDiv.style.display = 'block';
        }
    } catch (e) {
        errorDiv.textContent = 'Errore: ' + e.message;
        errorDiv.style.display = 'block';
    } finally {
        btn.disabled = false;
    }
}

// ── Mostra app dopo login ─────────────────────────────────────────────────────
async function mostraApp(username, ruolo) {
    _sessioneAttiva  = true;
    _utenteCorrente  = username;
    _ruoloCorrente   = ruolo || 'user';

    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-main').style.display = 'block';

    // Aggiorna display utente nella sidebar
    const el = document.getElementById('user-email-display');
    if (el) el.textContent = username;

    // Mostra voce sidebar Utenti solo all'admin
    const navUtenti = document.getElementById('nav-gestione-utenti');
    if (navUtenti) navUtenti.style.display = (_ruoloCorrente === 'admin') ? 'flex' : 'none';

    // Avvia caricamento dati app (funzione in app.js)
    if (typeof caricaDatiApp === 'function') await caricaDatiApp();
}

// ── Logout ────────────────────────────────────────────────────────────────────
async function logoutUtente() {
    if (!confirm('Vuoi uscire?')) return;
    await eel.auth_logout()();
    _sessioneAttiva = false;
    _utenteCorrente = null;
    _ruoloCorrente  = null;
    mostraFormLogin();
}

// ── Gestione Utenti (solo admin) ──────────────────────────────────────────────
async function apriGestioneUtenti() {
    if (_ruoloCorrente !== 'admin') return;
    await _renderGestioneUtenti();
    _apriModal('modal-gestione-utenti');
}

async function _renderGestioneUtenti() {
    const utenti = await eel.auth_lista_utenti()();
    const righe = utenti.map(u => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #f1f5f9;">
            <span>
                <strong>${u.username}</strong>
                <span style="font-size:11px;color:#94a3b8;margin-left:6px;">${u.ruolo === 'admin' ? icon('key',12,'margin-right:3px') + ' admin' : 'utente'}</span>
            </span>
            ${u.username !== _utenteCorrente ? `
            <div style="display:flex;gap:6px;">
                <button class="btn-secondary" style="padding:3px 10px;font-size:11px;"
                    onclick="resetPasswordUtente('${u.username}')">Reset pwd</button>
                <button class="btn-danger" style="padding:3px 10px;font-size:11px;"
                    onclick="eliminaUtente('${u.username}')">Elimina</button>
            </div>` : `<span style="font-size:11px;color:#94a3b8;">non eliminabile</span>`}
        </div>`).join('');

    const html = `
        <div style="margin-bottom:20px;">
            <strong style="font-size:13px;">Utenti registrati</strong>
            <div style="margin-top:10px;">${righe}</div>
        </div>
        <hr style="margin:16px 0;border-color:#e2e8f0;">
        <strong style="font-size:13px;">Aggiungi nuovo utente</strong>
        <div class="form-group" style="margin-top:12px;">
            <label>Username</label>
            <input type="text" id="nuovo-utente-username" class="form-input" placeholder="Es. mario.rossi">
        </div>
        <div class="form-group">
            <label>Password iniziale</label>
            <input type="password" id="nuovo-utente-password" class="form-input" placeholder="Minimo 4 caratteri">
        </div>
        <div class="form-group">
            <label>Ruolo</label>
            <select id="nuovo-utente-ruolo" class="form-select">
                <option value="user">Utente standard</option>
                <option value="admin">Admin</option>
            </select>
        </div>
        <hr style="margin:16px 0;border-color:#e2e8f0;">
        <strong style="font-size:13px;">Cambia la tua password</strong>
        <div class="form-group" style="margin-top:12px;">
            <label>Password attuale</label>
            <input type="password" id="cambia-pwd-vecchia" class="form-input">
        </div>
        <div class="form-group">
            <label>Nuova password</label>
            <input type="password" id="cambia-pwd-nuova" class="form-input">
        </div>
    `;
    document.getElementById('modal-gestione-utenti-body').innerHTML = html;
}

async function salvaGestioneUtenti() {
    const username = document.getElementById('nuovo-utente-username')?.value.trim();
    const password = document.getElementById('nuovo-utente-password')?.value;
    const ruolo    = document.getElementById('nuovo-utente-ruolo')?.value || 'user';
    const vecchiaPwd = document.getElementById('cambia-pwd-vecchia')?.value;
    const nuovaPwd   = document.getElementById('cambia-pwd-nuova')?.value;

    // Crea nuovo utente se compilato
    if (username && password) {
        const res = await eel.auth_crea_account(username, password, ruolo)();
        if (res.success) {
            showToast('Utente ' + username + ' creato!', 'success');
        } else {
            showToast(res.error, 'error');
            return;
        }
    }

    // Cambia password se compilato
    if (vecchiaPwd && nuovaPwd) {
        const res = await eel.auth_cambia_password(_utenteCorrente, vecchiaPwd, nuovaPwd)();
        if (res.success) {
            showToast('Password aggiornata!', 'success');
        } else {
            showToast(res.error, 'error');
            return;
        }
    }

    _chiudiModal('modal-gestione-utenti');
    // Riapri con lista aggiornata
    if (username && password) {
        await apriGestioneUtenti();
    }
}

async function eliminaUtente(username) {
    if (!confirm('Eliminare l\'utente ' + username + '?')) return;
    const res = await eel.auth_elimina_account(username)();
    if (res.success) {
        showToast('Utente eliminato', 'success');
        await _renderGestioneUtenti(); // aggiorna lista senza chiudere
    } else {
        showToast(res.error, 'error');
    }
}

async function resetPasswordUtente(username) {
    const nuovaPwd = prompt('Nuova password per ' + username + ':');
    if (!nuovaPwd) return;
    // Admin può resettare senza vecchia password (stringa vuota bypassata lato Python)
    const res = await eel.auth_cambia_password(username, '', nuovaPwd)();
    if (res.success) {
        showToast('Password di ' + username + ' aggiornata', 'success');
    } else {
        showToast(res.error, 'error');
    }
}

// ── Observer: aggiorna visibilità nav-gestione-utenti quando app diventa visibile ──
const _navObserver = new MutationObserver(() => {
    const appMain  = document.getElementById('app-main');
    const navUtenti = document.getElementById('nav-gestione-utenti');
    if (appMain && navUtenti && appMain.style.display !== 'none') {
        navUtenti.style.display = (_ruoloCorrente === 'admin') ? 'flex' : 'none';
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const appMain = document.getElementById('app-main');
    if (appMain) _navObserver.observe(appMain, { attributes: true, attributeFilter: ['style'] });
});

// ── Registrazione funzioni globali login ──
window._logoutUtente      = logoutUtente;
window._apriGestioneUtenti = apriGestioneUtenti;