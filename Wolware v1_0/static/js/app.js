/* THEME TOGGLE */
(function () {
  const root = document.documentElement, btn = document.querySelector('[data-theme-toggle]');
  let d = matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
  root.setAttribute('data-theme', d);
  function setIcon() {
    if (!btn) return; btn.innerHTML = d === 'dark'
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }
  setIcon();
  if (btn) btn.addEventListener('click', () => { d = d === 'dark' ? 'light' : 'dark'; root.setAttribute('data-theme', d); setIcon(); });
})();

/* CLOCK */
function updateClock() {
  const el = document.getElementById('topbarClock');
  if (el) el.textContent = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
updateClock(); setInterval(updateClock, 1000);

/* TOAST */
function toast(msg, type = 'success') {
  const c = document.getElementById('toastContainer'), el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span style="font-size:1rem">${{ success: '✓', error: '✕', info: 'ℹ' }[type]}</span><span>${msg}</span>`;
  c.appendChild(el); setTimeout(() => el.remove(), 3500);
}

/* TAB NAVIGATION */
function switchTab(tabName) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  const panel = document.getElementById('tab-' + tabName);
  if (panel) panel.classList.add('active');
  document.querySelectorAll(`[data-tab="${tabName}"]`).forEach(b => b.classList.add('active'));
  if (tabName === 'home') { loadStats(); loadHomePratiche(); }
  if (tabName === 'pratiche') loadPratiche();
  if (tabName === 'ditte') loadDitte();
}
document.querySelectorAll('[data-tab]').forEach(el => {
  el.addEventListener('click', e => { e.preventDefault(); switchTab(el.dataset.tab); });
});

/* MODAL */
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.dataset.close));
});
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open'); });
});

/* DROPDOWN */
function setupDropdown(triggerId, menuId, onSelect) {
  const trigger = document.getElementById(triggerId), menu = document.getElementById(menuId);
  if (!trigger || !menu) return;
  trigger.addEventListener('click', e => { e.stopPropagation(); menu.classList.toggle('open'); });
  menu.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', () => { menu.classList.remove('open'); onSelect(item.dataset.tipo); });
  });
}
document.addEventListener('click', () => {
  document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('open'));
});

/* API */
async function api(url, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts), data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Errore del server');
  return data;
}

// Variabile globale per cachare le stats
let lastStats = null;
/* STATS */
async function loadStats() {
  // Mostra subito i valori precedenti senza azzerare
  if (lastStats) {
    document.getElementById('kpiDitte').textContent = lastStats.ditte;
    document.getElementById('kpiTotali').textContent = lastStats.pratiche.totali;
    document.getElementById('kpiAperte').textContent = lastStats.pratiche.aperte;
    document.getElementById('kpiChiuse').textContent = lastStats.pratiche.chiuse;
  }
  try {
    const s = await api('/api/stats');
    lastStats = s;
    // Anima solo se il valore è cambiato
    if (!lastStats || lastStats.ditte !== s.ditte)
      animateValue('kpiDitte', s.ditte);
    if (!lastStats || lastStats.pratiche.totali !== s.pratiche.totali)
      animateValue('kpiTotali', s.pratiche.totali);
    if (!lastStats || lastStats.pratiche.aperte !== s.pratiche.aperte)
      animateValue('kpiAperte', s.pratiche.aperte);
    if (!lastStats || lastStats.pratiche.chiuse !== s.pratiche.chiuse)
      animateValue('kpiChiuse', s.pratiche.chiuse);
  } catch (e) { console.error(e); }
}
function animateValue(id, target) {
  const el = document.getElementById(id); if (!el) return;
  let start = 0; const duration = 600;
  const step = ts => {
    if (!start) start = ts; const p = Math.min((ts - start) / duration, 1);
    el.textContent = Math.floor(p * target); if (p < 1) requestAnimationFrame(step); else el.textContent = target;
  };
  requestAnimationFrame(step);
}

/* BADGES */
function statoBadge(s) {
  const m = { 'Aperta': 'badge-orange', 'In Lavorazione': 'badge-blue', 'Chiusa': 'badge-green' };
  return `<span class="badge ${m[s] || 'badge-gray'}">${s}</span>`;
}
function prioritaBadge(p) {
  const m = { 'Urgente': 'badge-red', 'Alta': 'badge-orange', 'Normale': 'badge-gray', 'Bassa': 'badge-blue' };
  return `<span class="badge ${m[p] || 'badge-gray'}">${p}</span>`;
}
function formatDate(d) { if (!d) return '—'; const [y, m, g] = d.split('-'); return `${g}/${m}/${y}`; }

/* HOME TABLE */
async function loadHomePratiche() {
  try {
    const list = await api('/api/pratiche');
    const tbody = document.getElementById('homeTableBody'), recent = list.slice(0, 8);
    if (!recent.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="empty-row"><span class="empty-icon">📋</span><br>Nessuna pratica. Crea la tua prima pratica!</td></tr>`; return;
    }
    tbody.innerHTML = recent.map(p => `<tr>
      <td style="font-family:var(--font-mono);font-size:var(--text-xs);color:var(--color-text-faint)">#${p.id}</td>
      <td>${p.ditta_nome || '<em style="color:var(--color-text-faint)">—</em>'}</td>
      <td>${p.tipo_pratica}</td><td>${statoBadge(p.stato)}</td>
      <td>${prioritaBadge(p.priorita)}</td>
      <td style="color:var(--color-text-muted)">${formatDate(p.data_apertura)}</td>
    </tr>`).join('');
  } catch (e) { console.error(e); }
}

/* PRATICHE TAB */
let allPratiche = [];
async function loadPratiche() {
  try { allPratiche = await api('/api/pratiche'); renderPratiche(allPratiche); }
  catch (e) { toast('Errore nel caricamento pratiche', 'error'); }
}
function renderPratiche(list) {
  const tbody = document.getElementById('praticheTableBody');
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="empty-row"><span class="empty-icon">📋</span><br>Nessuna pratica trovata.</td></tr>`; return;
  }
  tbody.innerHTML = list.map(p => `<tr>
    <td style="font-family:var(--font-mono);font-size:var(--text-xs);color:var(--color-text-faint)">#${p.id}</td>
    <td style="font-weight:500">${p.ditta_nome || '—'}</td>
    <td>${p.tipo_pratica}</td>
    <td style="color:var(--color-text-muted);max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.descrizione || '—'}</td>
    <td>${statoBadge(p.stato)}</td><td>${prioritaBadge(p.priorita)}</td>
    <td style="color:var(--color-text-muted)">${formatDate(p.data_apertura)}</td>
    <td style="color:var(--color-text-muted)">${formatDate(p.data_scadenza)}</td>
    <td><div class="row-actions">
      <button class="btn btn-icon btn-ghost" title="Modifica" onclick="editPratica(${p.id})">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      </button>
      <button class="btn btn-icon btn-ghost" title="Elimina" onclick="deletePratica(${p.id})" style="color:var(--color-error)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
      </button>
    </div></td>
  </tr>`).join('');
}
document.getElementById('filterPratiche').addEventListener('input', filterPratiche);
document.getElementById('filterStato').addEventListener('change', filterPratiche);
function filterPratiche() {
  const q = document.getElementById('filterPratiche').value.toLowerCase();
  const stato = document.getElementById('filterStato').value;
  let f = allPratiche;
  if (q) f = f.filter(p => (p.tipo_pratica || '').toLowerCase().includes(q) || (p.ditta_nome || '').toLowerCase().includes(q) || (p.descrizione || '').toLowerCase().includes(q));
  if (stato) f = f.filter(p => p.stato === stato);
  renderPratiche(f);
}

/* DITTE TAB */
let allDitte = [];
async function loadDitte() {
  try { allDitte = await api('/api/ditte'); renderDitte(allDitte); }
  catch (e) { toast('Errore nel caricamento ditte', 'error'); }
}
function renderDitte(list) {
  const grid = document.getElementById('ditteGrid');
  if (!list.length) {
    grid.innerHTML = `<div class="empty-state"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg><p>Nessuna ditta presente.<br>Clicca su <strong>Nuova Ditta</strong> per aggiungere il tuo primo cliente.</p></div>`; return;
  }
  grid.innerHTML = list.map(d => {
    const ini = d.ragione_sociale.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    return `<div class="ditta-card" onclick="editDitta(${d.id})" style="cursor:pointer">
      <div class="ditta-card-header">
        <div style="display:flex;gap:var(--space-3);align-items:center">
          <div class="ditta-avatar">${ini}</div>
          <div><div class="ditta-name">${d.ragione_sociale}</div>
          <div class="ditta-forma">${d.forma_giuridica || ''} ${d.settore_ateco ? '· ' + d.settore_ateco : ''}</div></div>
        </div>
        <div class="ditta-card-actions" onclick="event.stopPropagation()">
          <button class="btn btn-icon btn-ghost" title="Modifica" onclick="editDitta(${d.id})">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn btn-icon btn-ghost" title="Elimina" onclick="deleteDitta(${d.id})" style="color:var(--color-error)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
          </button>
        </div>
      </div>
      <div class="ditta-meta">
        ${d.partita_iva ? `<div class="ditta-meta-row"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>P.IVA: ${d.partita_iva}</div>` : ''}
        ${d.citta ? `<div class="ditta-meta-row"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${d.citta}${d.provincia ? ' (' + d.provincia.toUpperCase() + ')' : ''}</div>` : ''}
        ${d.referente ? `<div class="ditta-meta-row"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>${d.referente}</div>` : ''}
        ${d.email ? `<div class="ditta-meta-row"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>${d.email}</div>` : ''}
      </div>
    </div>`;
  }).join('');
}
document.getElementById('filterDitte').addEventListener('input', filterDitte);
document.getElementById('filterForma').addEventListener('change', filterDitte);
function filterDitte() {
  const q = document.getElementById('filterDitte').value.toLowerCase();
  const forma = document.getElementById('filterForma').value;
  let f = allDitte;
  if (q) f = f.filter(d => d.ragione_sociale.toLowerCase().includes(q) || (d.partita_iva || '').toLowerCase().includes(q) || (d.referente || '').toLowerCase().includes(q) || (d.citta || '').toLowerCase().includes(q));
  if (forma) f = f.filter(d => d.forma_giuridica === forma);
  renderDitte(f);
}

async function deleteDitta(id) {
  const ditta = allDitte.find(d => d.id === id);
  const nome = ditta?.ragione_sociale || 'questa ditta';
  if (!confirm(`Eliminare "${nome}"?\n\nL'operazione non può essere annullata.`)) return;
  try {
    await api(`/api/ditte/${id}`, 'DELETE');
    toast('Ditta eliminata', 'success');
    loadDitte();
    loadStats();
  } catch(e) {
    toast('Errore eliminazione: ' + e.message, 'error');
  }
}

async function deleteDitta(id) {
  const ditta = allDitte.find(d => d.id === id);
  const nome = ditta?.ragione_sociale || 'questa ditta';
  if (!confirm(`Eliminare "${nome}"?\n\nL'operazione non può essere annullata.`)) return;
  try {
    await api(`/api/ditte/${id}`, 'DELETE');
    toast('Ditta eliminata', 'success');
    loadDitte();
    loadStats();
  } catch(e) {
    toast('Errore nell\'eliminazione: ' + e.message, 'error');
  }
}


/* ══════════════════════════════════════════════════════════
   MODAL DITTA — TABS
══════════════════════════════════════════════════════════ */
document.querySelectorAll('.modal-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const panel = tab.dataset.mtab;
    document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.modal-tab-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('mtab-' + panel).classList.add('active');
  });
});
function resetModalTabs() {
  document.querySelectorAll('.modal-tab').forEach((t, i) => t.classList.toggle('active', i === 0));
  document.querySelectorAll('.modal-tab-panel').forEach((p, i) => p.classList.toggle('active', i === 0));
}

/* ══════════════════════════════════════════════════════════
   SEDI LAVORATIVE — Carousel
══════════════════════════════════════════════════════════ */
let sedi = [];
let sedeIdx = 0;

function renderSedi() {
  const container = document.getElementById('sediCarousel');
  if (!sedi.length) {
    container.innerHTML = '<div class="sede-empty">Nessuna sede lavorativa. Clicca "Aggiungi Sede" per inserirne una.</div>';
    return;
  }
  const s = sedi[sedeIdx];
  container.innerHTML = `
    <div class="sede-card">
      <div class="sede-card-header">
        <span style="font-weight:600;font-size:var(--text-sm)">Sede ${sedeIdx + 1}</span>
        <button type="button" class="btn btn-icon btn-ghost" style="color:var(--color-error)" onclick="removeSede(${sedeIdx})">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
        </button>
      </div>
      <div class="form-grid">
        <div class="form-field col-span-2">
          <label>Nome / Descrizione Sede</label>
          <input type="text" value="${s.nome || ''}" oninput="sedi[${sedeIdx}].nome=this.value" placeholder="es. Magazzino, Filiale Nord..."/>
        </div>
        <div class="form-field col-span-2">
          <label>Indirizzo</label>
          <input type="text" value="${s.indirizzo || ''}" oninput="sedi[${sedeIdx}].indirizzo=this.value" placeholder="Via ..."/>
        </div>
        <div class="form-field">
          <label>CAP</label>
          <input type="text" maxlength="5" value="${s.cap || ''}" oninput="sedi[${sedeIdx}].cap=this.value" placeholder="80100"/>
        </div>
        <div class="form-field">
          <label>Comune</label>
          <input type="text" value="${s.citta || ''}" oninput="sedi[${sedeIdx}].citta=this.value" placeholder="Napoli"/>
        </div>
        <div class="form-field">
          <label>Prov.</label>
          <input type="text" maxlength="2" value="${s.prov || ''}" oninput="sedi[${sedeIdx}].prov=this.value" placeholder="NA"/>
        </div>
        <div class="form-field">
          <label>Cod. Catastale</label>
          <input type="text" maxlength="4" value="${s.catastale || ''}" oninput="sedi[${sedeIdx}].catastale=this.value" placeholder="F839"/>
        </div>
      </div>
      <div class="sede-nav">
        <button type="button" class="sede-nav-btn" onclick="navSede(-1)" ${sedeIdx === 0 ? 'disabled' : ''}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span class="sede-counter">${sedeIdx + 1} / ${sedi.length}</span>
        <button type="button" class="sede-nav-btn" onclick="navSede(1)" ${sedeIdx === sedi.length - 1 ? 'disabled' : ''}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>`;
}
function navSede(dir) {
  sedeIdx = Math.max(0, Math.min(sedi.length - 1, sedeIdx + dir));
  renderSedi();
}
function removeSede(i) {
  sedi.splice(i, 1);
  sedeIdx = Math.max(0, sedeIdx - 1);
  renderSedi();
}
document.getElementById('btnAddSede').addEventListener('click', () => {
  sedi.push({ nome: '', indirizzo: '', cap: '', citta: '', prov: '', catastale: '' });
  sedeIdx = sedi.length - 1;
  renderSedi();
});

/* ══════════════════════════════════════════════════════════
   INAIL
══════════════════════════════════════════════════════════ */
let inailList = [];
function renderInail() {
  const el = document.getElementById('inailList');
  if (!inailList.length) { el.innerHTML = '<div class="list-empty-msg">Nessuna gestione INAIL inserita.</div>'; return; }
  el.innerHTML = inailList.map((g, i) => `
    <div class="list-item">
      <div class="list-item-header">
        <span class="list-item-title">Gestione INAIL #${i + 1}</span>
        <button type="button" class="btn btn-icon btn-ghost" style="color:var(--color-error)" onclick="removeInail(${i})">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
        </button>
      </div>
      <div class="list-item-grid">
        <div class="list-item-field"><label>Codice PAT</label>
          <input value="${g.pat || ''}" oninput="inailList[${i}].pat=this.value" placeholder="PAT000000000"/></div>
        <div class="list-item-field"><label>Sede INAIL</label>
          <input value="${g.sede || ''}" oninput="inailList[${i}].sede=this.value" placeholder="es. Napoli"/></div>
        <div class="list-item-field"><label>Codice ATECO</label>
          <input value="${g.ateco || ''}" oninput="inailList[${i}].ateco=this.value" placeholder="es. 47.11"/></div>
        <div class="list-item-field"><label>Sede Lavorativa</label>
          <input value="${g.sedeLav || ''}" oninput="inailList[${i}].sedeLav=this.value" placeholder="es. Via Roma 1"/></div>
        <div class="list-item-field full"><label>Note</label>
          <input value="${g.note || ''}" oninput="inailList[${i}].note=this.value" placeholder="Note aggiuntive..."/></div>
      </div>
    </div>`).join('');
}
function removeInail(i) { inailList.splice(i, 1); renderInail(); }
document.getElementById('btnAddInail').addEventListener('click', () => {
  inailList.push({ pat: '', sede: '', ateco: '', sedeLav: '', note: '' });
  renderInail();
});

/* ══════════════════════════════════════════════════════════
   INPS
══════════════════════════════════════════════════════════ */
let inpsList = [];
function renderInps() {
  const el = document.getElementById('inpsList');
  if (!inpsList.length) { el.innerHTML = '<div class="list-empty-msg">Nessuna gestione INPS inserita.</div>'; return; }
  el.innerHTML = inpsList.map((g, i) => `
    <div class="list-item">
      <div class="list-item-header">
        <span class="list-item-title">Gestione INPS #${i + 1}</span>
        <button type="button" class="btn btn-icon btn-ghost" style="color:var(--color-error)" onclick="removeInps(${i})">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
        </button>
      </div>
      <div class="list-item-grid">
        <div class="list-item-field"><label>Matricola INPS</label>
          <input value="${g.matricola || ''}" oninput="inpsList[${i}].matricola=this.value" placeholder="1234567890"/></div>
        <div class="list-item-field"><label>Sede INPS</label>
          <input value="${g.sede || ''}" oninput="inpsList[${i}].sede=this.value" placeholder="es. Napoli"/></div>
        <div class="list-item-field"><label>CCNL</label>
          <input value="${g.ccnl || ''}" oninput="inpsList[${i}].ccnl=this.value" placeholder="es. Commercio"/></div>
        <div class="list-item-field"><label>Codice ATECO</label>
          <input value="${g.ateco || ''}" oninput="inpsList[${i}].ateco=this.value" placeholder="es. 47.11"/></div>
        <div class="list-item-field full"><label>Note</label>
          <input value="${g.note || ''}" oninput="inpsList[${i}].note=this.value" placeholder="Note aggiuntive..."/></div>
      </div>
    </div>`).join('');
}
function removeInps(i) { inpsList.splice(i, 1); renderInps(); }
document.getElementById('btnAddInps').addEventListener('click', () => {
  inpsList.push({ matricola: '', sede: '', ccnl: '', ateco: '', note: '' });
  renderInps();
});

/* ══════════════════════════════════════════════════════════
   CONTATTI CC
══════════════════════════════════════════════════════════ */
let ccList = [];
function renderCC() {
  const el = document.getElementById('ccList');
  if (!ccList.length) { el.innerHTML = '<div class="list-empty-msg">Nessun contatto CC aggiunto.</div>'; return; }
  el.innerHTML = ccList.map((c, i) => `
    <div class="list-item" style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-2) var(--space-3)">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;opacity:0.4"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
      <input type="email" style="flex:1;padding:0 var(--space-2);height:30px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-sm);font-size:var(--text-sm);color:var(--color-text)"
        value="${c.email || ''}" oninput="ccList[${i}].email=this.value" placeholder="email@esempio.it"/>
      <input type="text" style="width:160px;padding:0 var(--space-2);height:30px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-sm);font-size:var(--text-sm);color:var(--color-text)"
        value="${c.nome || ''}" oninput="ccList[${i}].nome=this.value" placeholder="Nome (opzionale)"/>
      <button type="button" class="btn btn-icon btn-ghost" style="color:var(--color-error);flex-shrink:0" onclick="removeCC(${i})">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
      </button>
    </div>`).join('');
}
function removeCC(i) { ccList.splice(i, 1); renderCC(); }
document.getElementById('btnAddCC').addEventListener('click', () => {
  ccList.push({ email: '', nome: '' });
  renderCC();
});

/* ══════════════════════════════════════════════════════════
   TARIFFARIO
══════════════════════════════════════════════════════════ */
let tariffItems = [];
const TARIFF_BASE = [
  { desc: 'Costo Cedolino', prezzo: '' },
  { desc: 'Assunzione', prezzo: '' },
  { desc: 'Variazione', prezzo: '' },
  { desc: 'Cessazione', prezzo: '' },
];
function renderTariff() {
  const el = document.getElementById('tariffList');
  if (!el) return; 
  if (!tariffItems.length) {
    el.innerHTML = '<div class="list-empty-msg">Nessuna voce. Clicca "Tariffario Base" per caricare le voci predefinite.</div>'; return;
  }
  el.innerHTML = `<table class="tariff-table">
    <thead><tr><th>Descrizione</th><th>Prezzo (€)</th><th></th></tr></thead>
    <tbody>${tariffItems.map((v, i) => `<tr>
      <td><input value="${v.desc || ''}" oninput="tariffItems[${i}].desc=this.value" placeholder="Descrizione voce"/></td>
      <td class="tariff-row-price"><input type="number" step="0.01" min="0" value="${v.prezzo || ''}" oninput="tariffItems[${i}].prezzo=this.value" placeholder="0.00"/></td>
      <td><button type="button" class="btn btn-icon btn-ghost" style="color:var(--color-error)" onclick="removeTariff(${i})">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
      </button></td>
    </tr>`).join('')}</tbody>
  </table>`;
}
function removeTariff(i) { tariffItems.splice(i, 1); renderTariff(); }
document.getElementById('btnTariffBase')?.addEventListener('click', () => {
  tariffItems = TARIFF_BASE.map(v => ({ ...v })); 
  renderTariff();
});
document.getElementById('btnAddTariff')?.addEventListener('click', () => {
  tariffItems.push({ desc: '', prezzo: '' }); 
  renderTariff();
});

/* ══════════════════════════════════════════════════════════
   RESET + OPEN + EDIT + SAVE  (sovrascrive le funzioni precedenti)
══════════════════════════════════════════════════════════ */
function resetDittaForm() {
  document.getElementById('dittaId').value = '';
  document.getElementById('ragione_sociale').value = '';
  document.getElementById('codice_fiscale').value = '';
  document.getElementById('partita_iva').value = '';
  document.getElementById('indirizzo').value = '';
  document.getElementById('cap').value = '';
  document.getElementById('citta').value = '';
  document.getElementById('provincia').value = '';
  document.getElementById('cod_catastale').value = '';
  document.getElementById('amministratore').value = '';
  document.getElementById('cf_amministratore').value = '';
  document.getElementById('tel_amministratore').value = '';
  document.getElementById('email_amministratore').value = '';
  document.getElementById('data_inizio_rapporto').value = '';
  document.getElementById('email').value = '';
  document.getElementById('pec').value = '';
  document.getElementById('telefono').value = '';
  document.getElementById('cedolino_onnicomprensivo').checked = false;
  sedi = []; sedeIdx = 0; inailList = []; inpsList = []; ccList = []; tariffItems = [];
  renderSedi(); renderInail(); renderInps(); renderCC(); renderTariff();
  currentDittaIdForTariff = null;
  renderDittaVoci([]);
  document.getElementById('formDittaError').style.display = 'none';
  document.getElementById('modalDittaTitle').textContent = 'Nuova Ditta';
  resetModalTabs();
}
function openDittaModal() { resetDittaForm(); openModal('modalDitta'); }

async function editDitta(id) {
  resetDittaForm();
  document.getElementById('modalDittaTitle').textContent = 'Modifica Ditta';
  try {
    const d = await api(`/api/ditte/${id}`);
    document.getElementById('dittaId').value = d.id;
    ['ragione_sociale', 'codice_fiscale', 'partita_iva', 'indirizzo', 'cap', 'citta',
      'provincia', 'cod_catastale', 'amministratore', 'cf_amministratore',
      'tel_amministratore', 'email_amministratore', 'data_inizio_rapporto',
      'email', 'pec', 'telefono'].forEach(f => {
        const el = document.getElementById(f);
        if (el && d[f]) el.value = d[f];
      });
    document.getElementById('cedolino_onnicomprensivo').checked = !!d.cedolino_onnicomprensivo;
    if (d.sedi_json) { try { sedi = JSON.parse(d.sedi_json); sedeIdx = 0; } catch (e) { } }
    if (d.inail_json) { try { inailList = JSON.parse(d.inail_json); } catch (e) { } }
    if (d.inps_json) { try { inpsList = JSON.parse(d.inps_json); } catch (e) { } }
    if (d.cc_json) { try { ccList = JSON.parse(d.cc_json); } catch (e) { } }
    if (d.tariff_json) { try { tariffItems = JSON.parse(d.tariff_json); } catch (e) { } }
    renderSedi(); renderInail(); renderInps(); renderCC(); renderTariff();
    currentDittaIdForTariff = d.id;
    await loadDittaVoci(d.id);
    openModal('modalDitta');
  } catch (e) { toast('Errore nel caricamento ditta', 'error'); }
}

document.getElementById('btnSaveDitta').addEventListener('click', async () => {
  const errEl = document.getElementById('formDittaError');
  errEl.style.display = 'none';
  if (!document.getElementById('ragione_sociale').value.trim()) {
    errEl.textContent = 'La Denominazione è obbligatoria.';
    errEl.style.display = 'block';
    resetModalTabs();
    return;
  }
  const selTariff = document.getElementById('dittaTariffarioSelect');
  const data = {
    ragione_sociale: document.getElementById('ragione_sociale').value.trim(),
    codice_fiscale: document.getElementById('codice_fiscale').value.trim(),
    partita_iva: document.getElementById('partita_iva').value.trim(),
    indirizzo: document.getElementById('indirizzo').value.trim(),
    cap: document.getElementById('cap').value.trim(),
    citta: document.getElementById('citta').value.trim(),
    provincia: document.getElementById('provincia').value.trim().toUpperCase(),
    cod_catastale: document.getElementById('cod_catastale').value.trim().toUpperCase(),
    amministratore: document.getElementById('amministratore').value.trim(),
    cf_amministratore: document.getElementById('cf_amministratore').value.trim(),
    tel_amministratore: document.getElementById('tel_amministratore').value.trim(),
    email_amministratore: document.getElementById('email_amministratore').value.trim(),
    data_inizio_rapporto: document.getElementById('data_inizio_rapporto').value,
    email: document.getElementById('email').value.trim(),
    pec: document.getElementById('pec').value.trim(),
    telefono: document.getElementById('telefono').value.trim(),
    cedolino_onnicomprensivo: document.getElementById('cedolino_onnicomprensivo').checked ? 1 : 0,
    sedi_json: JSON.stringify(sedi),
    inail_json: JSON.stringify(inailList),
    inps_json: JSON.stringify(inpsList),
    cc_json: JSON.stringify(ccList),
    tariff_json: JSON.stringify(tariffItems),
    tariffario_id: selTariff?.value ? parseInt(selTariff.value) : null,
  };
  try {
    const id = document.getElementById('dittaId').value;
    if (id) {
      await api(`/api/ditte/${id}`, 'PUT', data);
      toast('Ditta aggiornata');
    } else {
      const nuova = await api('/api/ditte', 'POST', data);
      // Auto-sync tariffario se selezionato
      if (data.tariffario_id && nuova?.id) {
        try { await api(`/api/ditte/${nuova.id}/tariffario/sync`, 'POST'); }
        catch(e) { console.warn('Auto-sync tariffario fallito:', e); }
      }
      toast('Ditta creata');
    }
    closeModal('modalDitta');
    loadDitte(); loadStats();
  } catch (e) { errEl.textContent = e.message; errEl.style.display = 'block'; }
});


/* BINDINGS */
document.getElementById('btnNuovaDitta').addEventListener('click', openDittaModal);
document.getElementById('btnNuovaDitta2').addEventListener('click', openDittaModal);
function openPraticaModal(tipo) {
  if (tipo === 'Assunzione') { openAssunzioneModal(); return; }
  const wip = ['Cessazione', 'Trasformazione Contratto', 'Proroga Contratto',
    'Elaborazione Buste Paga', 'Variazione Retributiva', 'Conguaglio Fiscale',
    'Comunicazione INPS', 'Comunicazione INAIL', 'Gestione CIG', 'Variazione INAIL',
    'Modello 770', 'CU - Certificazione Unica', 'Autoliquidazione INAIL', 'Altra Pratica'];
  document.getElementById('pratica_tipo').value = tipo;
  document.getElementById('modalPraticaTitle').textContent = 'Nuova Pratica — ' + tipo;
  const wipEl = document.getElementById('praticaWipNotice');
  if (wipEl) wipEl.style.display = wip.includes(tipo) ? 'flex' : 'none';
  loadDitteSelect('pratica_ditta_id');
  openModal('modalPratica');
}


/* ══════════════════════════════════════════════════════════
   MODAL ASSUNZIONE
══════════════════════════════════════════════════════════ */
document.querySelectorAll('.modal-tab[data-atab]').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.modal-tab[data-atab]').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('[id^="atab-"]').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const panel = document.getElementById('atab-' + tab.dataset.atab);
    if (panel) panel.classList.add('active');
  });
});
function resetAssunzioneTabs() {
  document.querySelectorAll('.modal-tab[data-atab]').forEach((t, i) => t.classList.toggle('active', i === 0));
  document.querySelectorAll('[id^="atab-"]').forEach((p, i) => p.classList.toggle('active', i === 0));
}

/* Toggle buttons */
document.querySelectorAll('.toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
    if (btn.dataset.key === 'obbligatoria')
      document.getElementById('ass_obbligatoria_section').style.display = btn.classList.contains('active') ? 'block' : 'none';
    if (btn.dataset.key === 'netto')
      document.getElementById('ass_netto_wrapper').style.display = btn.classList.contains('active') ? 'block' : 'none';
  });
});

/* Toggle straniero */
document.getElementById('ass_straniero').addEventListener('change', function () {
  document.getElementById('ass_permesso_section').style.display = this.checked ? 'block' : 'none';
});

/* Tipologia contratto → mostra data fine */
const TIPI_TERMINE = ['TD', 'TD_SOS', 'TD_PIATT', 'TD_SOS_PIATT', 'APP_QUAL', 'APP_PROF', 'APP_AF', 'INT_DET', 'TIR', 'LSU', 'FL', 'BWE'];
document.getElementById('ass_tipologia_contratto').addEventListener('change', function () {
  document.getElementById('ass_data_fine_wrapper').style.display = TIPI_TERMINE.includes(this.value) ? 'block' : 'none';
});

/* Tipologia orario → mostra retrib PT */
document.getElementById('ass_tipo_orario').addEventListener('change', function () {
  document.getElementById('ass_retrib_pt_wrapper').style.display = ['PTO', 'PTV', 'PTM'].includes(this.value) ? 'block' : 'none';
});

/* Cod istruzione → descrizione */
const ISTR_MAP = {
  '10': 'Nessun titolo', '20': 'Licenza Elementare', '30': 'Licenza Media',
  '40': 'Diploma Professionale', '50': 'Diploma Superiore', '60': 'Laurea Triennale',
  '70': 'Laurea Magistrale', '80': 'Master / Specializzazione', '90': 'Dottorato'
};
document.getElementById('ass_cod_istruzione').addEventListener('change', function () {
  document.getElementById('ass_livello_istruzione').value = ISTR_MAP[this.value] || '';
});

/* Azienda select → auto-fill campi */
document.getElementById('ass_ditta_id').addEventListener('change', async function () {
  const id = this.value;
  if (!id) { clearAziendaFields(); return; }
  try {
    const d = await api('/api/ditte/' + id);
    document.getElementById('ass_cf_azienda').value = d.codice_fiscale || '';
    document.getElementById('ass_pec_azienda').value = d.pec || '';
    document.getElementById('ass_indirizzo_legale').value = d.indirizzo || '';
    document.getElementById('ass_cap_legale').value = d.cap || '';
    document.getElementById('ass_comune_legale').value = d.citta || '';
    document.getElementById('ass_prov_legale').value = d.provincia || '';
    document.getElementById('ass_catastale_legale').value = d.cod_catastale || '';
    /* INPS */
    const inpsSel = document.getElementById('ass_matricola_inps');
    inpsSel.innerHTML = '<option value="">-- Seleziona --</option>';
    let inpsList = [];
    try { inpsList = d.inps_json ? JSON.parse(d.inps_json) : []; } catch (e) { }
    inpsList.forEach((g, i) => {
      const o = document.createElement('option');
      o.value = i;
      o.textContent = g.matricola ? g.matricola + (g.ccnl ? ' — ' + g.ccnl : '') : 'INPS #' + (i + 1);
      o.dataset.ateco = g.ateco || ''; o.dataset.ccnl = g.ccnl || '';
      inpsSel.appendChild(o);
    });
    /* INAIL */
    const inailSel = document.getElementById('ass_pat_inail');
    inailSel.innerHTML = '<option value="">-- Seleziona --</option>';
    let inailList = [];
    try { inailList = d.inail_json ? JSON.parse(d.inail_json) : []; } catch (e) { }
    inailList.forEach((g, i) => {
      const o = document.createElement('option');
      o.value = i;
      o.textContent = g.pat ? g.pat + (g.sede ? ' — ' + g.sede : '') : 'INAIL #' + (i + 1);
      inailSel.appendChild(o);
    });
    /* Sedi lavorative */
    const sedeSel = document.getElementById('ass_sede_lav_select');
    sedeSel.innerHTML = '<option value="">Sede Legale (default)</option>';
    let sediList = [];
    try { sediList = d.sedi_json ? JSON.parse(d.sedi_json) : []; } catch (e) { }
    sediList.forEach((s, i) => {
      const o = document.createElement('option');
      o.value = i;
      o.textContent = s.nome || 'Sede ' + (i + 1);
      o.dataset.indirizzo = s.indirizzo || ''; o.dataset.cap = s.cap || '';
      o.dataset.citta = s.citta || ''; o.dataset.prov = s.prov || '';
      o.dataset.catastale = s.catastale || '';
      sedeSel.appendChild(o);
    });
  } catch (e) { console.error(e); }
});

/* INPS select → autofill ATECO e CCNL */
document.getElementById('ass_matricola_inps').addEventListener('change', function () {
  const opt = this.options[this.selectedIndex];
  document.getElementById('ass_cod_ateco').value = opt.dataset ? (opt.dataset.ateco || '') : '';
  document.getElementById('ass_ccnl').value = opt.dataset ? (opt.dataset.ccnl || '') : '';
});

/* Sede lavorativa → autofill */
document.getElementById('ass_sede_lav_select').addEventListener('change', function () {
  const opt = this.options[this.selectedIndex];
  if (!opt.dataset) return;
  document.getElementById('ass_indirizzo_lav').value = opt.dataset.indirizzo || '';
  document.getElementById('ass_cap_lav').value = opt.dataset.cap || '';
  document.getElementById('ass_comune_lav').value = opt.dataset.citta || '';
  document.getElementById('ass_prov_lav').value = opt.dataset.prov || '';
  document.getElementById('ass_catastale_lav').value = opt.dataset.catastale || '';
});

function clearAziendaFields() {
  ['ass_cf_azienda', 'ass_pec_azienda', 'ass_indirizzo_legale', 'ass_cap_legale',
    'ass_comune_legale', 'ass_prov_legale', 'ass_catastale_legale', 'ass_cod_ateco', 'ass_ccnl'].forEach(id => {
      const el = document.getElementById(id); if (el) el.value = '';
    });
  document.getElementById('ass_matricola_inps').innerHTML = '<option value="">-- Seleziona prima l\'azienda --</option>';
  document.getElementById('ass_pat_inail').innerHTML = '<option value="">-- Seleziona prima l\'azienda --</option>';
  document.getElementById('ass_sede_lav_select').innerHTML = '<option value="">Sede Legale (default)</option>';
}

function resetAssunzioneForm() {
  document.querySelectorAll('#modalAssunzione input:not([type=checkbox])').forEach(el => el.value = '');
  document.querySelectorAll('#modalAssunzione select').forEach(el => el.selectedIndex = 0);
  document.querySelectorAll('#modalAssunzione textarea').forEach(el => el.value = '');
  document.querySelectorAll('#modalAssunzione input[type=checkbox]').forEach(el => el.checked = false);
  document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
  ['ass_permesso_section', 'ass_obbligatoria_section', 'ass_netto_wrapper',
    'ass_data_fine_wrapper', 'ass_retrib_pt_wrapper'].forEach(id => {
      const el = document.getElementById(id); if (el) el.style.display = 'none';
    });
  clearAziendaFields();
  const errEl = document.getElementById('formAssunzioneError');
  if (errEl) errEl.style.display = 'none';
  document.getElementById('modalAssunzioneTitle').textContent = 'Nuova Assunzione';
  document.getElementById('btnAssumiBtn').style.display = 'none';
  resetAssunzioneTabs();
}

async function populateAziendaSelect() {
  try {
    const ditte = await api('/api/ditte');
    const sel = document.getElementById('ass_ditta_id');
    sel.innerHTML = '<option value="">-- Seleziona azienda --</option>';
    ditte.forEach(d => {
      const o = document.createElement('option');
      o.value = d.id; o.textContent = d.ragione_sociale;
      sel.appendChild(o);
    });
  } catch (e) { }
}

function openAssunzioneModal() {
  resetAssunzioneForm();
  populateAziendaSelect();
  openModal('modalAssunzione');
}

/* Validazione live → mostra bottone Assumi */
document.getElementById('modalAssunzione').addEventListener('input', () => {
  const ok = document.getElementById('ass_ditta_id').value &&
    document.getElementById('ass_nome').value.trim() &&
    document.getElementById('ass_cognome').value.trim() &&
    document.getElementById('ass_cf').value.trim().length === 16 &&
    document.getElementById('ass_data_inizio').value &&
    document.getElementById('ass_tipologia_contratto').value;
  document.getElementById('btnAssumiBtn').style.display = ok ? 'inline-flex' : 'none';
});

document.getElementById('btnSalvaBozzaAssunzione').addEventListener('click', () => {
  toast('Bozza salvata', 'success');
});
document.getElementById('btnDuplicaAssunzione').addEventListener('click', () => {
  toast('Duplica — work in progress', 'info');
});
document.getElementById('btnAssumiBtn').addEventListener('click', () => {
  toast('Assunzione avviata — work in progress', 'success');
});

setupDropdown('btnNuovaPratica', 'dropdownPratica', openPraticaModal);
setupDropdown('btnNuovaPratica2', 'dropdownPratica2', openPraticaModal);

/* INIT */
loadStats(); loadHomePratiche();

/* ══════════════════════════════════════════════════════════
   AUTH — controlla ruolo e mostra tab admin
══════════════════════════════════════════════════════════ */
async function checkAuth() {
  try {
    const res = await fetch('/api/me');
    if (res.status === 401) { window.location.href = '/login'; return; }
    const user = await res.json();
    if (user.role === 'admin') {
      document.getElementById('navAdmin').style.display = '';
      document.getElementById('tabBtnAdmin').style.display = '';
    }
  } catch (e) { console.error(e); }
}

/* ══════════════════════════════════════════════════════════
   GESTIONE UTENTI (tab admin)
══════════════════════════════════════════════════════════ */
async function loadUsers() {
  try {
    const users = await api('/api/users');
    const tbody = document.getElementById('usersTableBody');
    if (!users.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="empty-row">Nessun utente trovato.</td></tr>';
      return;
    }
    tbody.innerHTML = users.map(u => `<tr>
      <td style="font-weight:500">${u.username}</td>
      <td><span class="badge ${u.role === 'admin' ? 'badge-blue' : 'badge-gray'}">${u.role}</span></td>
      <td style="color:var(--color-text-muted)">${u.created_at ? u.created_at.split(' ')[0] : '—'}</td>
      <td><div class="row-actions">
        ${u.username !== 'admin' ? `
          <button class="btn btn-icon btn-ghost" title="Reset Password"
            onclick="openResetPassword(${u.id}, '${u.username}')"
            style="color:var(--color-gold)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </button>
          <button class="btn btn-icon btn-ghost" title="Elimina"
            onclick="deleteUser(${u.id}, '${u.username}')"
            style="color:var(--color-error)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            </svg>
          </button>
        ` : '<span style="color:var(--color-text-faint);font-size:var(--text-xs)">protetto</span>'}
      </div></td>
    </tr>`).join('');
  } catch (e) { toast('Errore nel caricamento utenti', 'error'); }
}

// ── CAMBIA PASSWORD ───────────────────────────────────────────────────────────
function openCambiaPassword() {
  ['cpVecchia', 'cpNuova', 'cpConferma'].forEach(id =>
    document.getElementById(id).value = '');
  document.getElementById('formCambiaPasswordError').style.display = 'none';
  document.getElementById('formCambiaPasswordSuccess').style.display = 'none';
  openModal('modalCambiaPassword');
  setTimeout(() => document.getElementById('cpVecchia').focus(), 120);
}

document.getElementById('btnSalvaNuovaPassword').addEventListener('click', async () => {
  const vecchia = document.getElementById('cpVecchia').value;
  const nuova = document.getElementById('cpNuova').value;
  const conferma = document.getElementById('cpConferma').value;
  const errBox = document.getElementById('formCambiaPasswordError');
  const okBox = document.getElementById('formCambiaPasswordSuccess');
  const btn = document.getElementById('btnSalvaNuovaPassword');

  errBox.style.display = 'none';
  okBox.style.display = 'none';

  // Validazione frontend
  if (!vecchia || !nuova || !conferma) {
    errBox.textContent = 'Tutti i campi sono obbligatori.';
    errBox.style.display = 'block'; return;
  }
  if (nuova.length < 6) {
    errBox.textContent = 'La nuova password deve essere di almeno 6 caratteri.';
    errBox.style.display = 'block';
    document.getElementById('cpNuova').focus(); return;
  }
  if (nuova !== conferma) {
    errBox.textContent = 'La nuova password e la conferma non coincidono.';
    errBox.style.display = 'block';
    document.getElementById('cpConferma').focus(); return;
  }

  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.textContent = 'Aggiornamento…';

  try {
    await api('/api/users/me/password', 'PUT', {
      vecchia_password: vecchia,
      nuova_password: nuova,
      conferma_password: conferma
    });
    // Mostra il messaggio di successo e chiudi dopo 1.5s
    okBox.style.display = 'block';
    ['cpVecchia', 'cpNuova', 'cpConferma'].forEach(id =>
      document.getElementById(id).value = '');
    setTimeout(() => closeModal('modalCambiaPassword'), 1500);
    toast('Password aggiornata con successo', 'success');
  } catch (e) {
    errBox.textContent = e.message || 'Errore. Riprova.';
    errBox.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
});

// Invio con Enter dall'ultimo campo
document.getElementById('cpConferma').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('btnSalvaNuovaPassword').click();
});

let _deleteUserId = null; // id temporaneo in attesa di conferma

function deleteUser(id, username) {
  _deleteUserId = id;
  // Mostra il nome dell'utente nella modale
  document.getElementById('eliminaUtenteNome').textContent = username || `#${id}`;
  openModal('modalEliminaUtente');
}

document.getElementById('btnConfermaEliminaUtente').addEventListener('click', async () => {
  if (!_deleteUserId) return;
  const btn = document.getElementById('btnConfermaEliminaUtente');
  btn.disabled = true;
  btn.textContent = 'Eliminazione…';

  try {
    await api(`/api/users/${_deleteUserId}`, 'DELETE');
    closeModal('modalEliminaUtente');
    toast('Utente eliminato con successo', 'success');
    loadUsers();
  } catch (e) {
    toast(e.message || 'Errore durante l\'eliminazione', 'error');
    closeModal('modalEliminaUtente');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2.5">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      </svg>
      Elimina definitivamente`;
    _deleteUserId = null;
  }
});

function openNuovoUtente() {
  document.getElementById('nuovoUtenteUsername').value = '';
  document.getElementById('nuovoUtentePassword').value = '';
  document.getElementById('nuovoUtenteRuolo').value = 'user';
  const errBox = document.getElementById('formNuovoUtenteError');
  errBox.style.display = 'none';
  errBox.textContent = '';
  // Ripristina password nascosta
  document.getElementById('nuovoUtentePassword').type = 'password';
  document.getElementById('iconEyeOpen').style.display = '';
  document.getElementById('iconEyeClosed').style.display = 'none';
  openModal('modalNuovoUtente');
  setTimeout(() => document.getElementById('nuovoUtenteUsername').focus(), 120);
}

// Toggle mostra/nascondi password
document.getElementById('btnTogglePassword').addEventListener('click', () => {
  const input = document.getElementById('nuovoUtentePassword');
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  document.getElementById('iconEyeOpen').style.display = isHidden ? 'none' : '';
  document.getElementById('iconEyeClosed').style.display = isHidden ? '' : 'none';
});

// Invio con Enter
document.getElementById('nuovoUtentePassword').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('btnSalvaNuovoUtente').click();
});

// Salva nuovo utente
document.getElementById('btnSalvaNuovoUtente').addEventListener('click', async () => {
  const username = document.getElementById('nuovoUtenteUsername').value.trim();
  const password = document.getElementById('nuovoUtentePassword').value;
  const role = document.getElementById('nuovoUtenteRuolo').value;
  const errBox = document.getElementById('formNuovoUtenteError');
  const btn = document.getElementById('btnSalvaNuovoUtente');

  errBox.style.display = 'none';
  if (!username) {
    errBox.textContent = 'Il campo Username è obbligatorio.';
    errBox.style.display = 'block';
    document.getElementById('nuovoUtenteUsername').focus();
    return;
  }
  if (password.length < 6) {
    errBox.textContent = 'La password deve essere di almeno 6 caratteri.';
    errBox.style.display = 'block';
    document.getElementById('nuovoUtentePassword').focus();
    return;
  }

  btn.disabled = true;
  const originalHTML = btn.innerHTML;
  btn.textContent = 'Creazione…';

  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role })
    });
    const json = await res.json();
    if (!res.ok) {
      errBox.textContent = json.error || 'Errore durante la creazione.';
      errBox.style.display = 'block';
      return;
    }
    closeModal('modalNuovoUtente');
    toast(`Utente "${json.username}" creato con successo`, 'success');
    loadUsers();
  } catch (e) {
    errBox.textContent = 'Errore di rete. Riprova.';
    errBox.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
});

/* Carica utenti quando si apre il tab admin */
const _origSwitchTab = switchTab;
window.switchTab = function (tabName) {
  _origSwitchTab(tabName);
  if (tabName === 'admin') loadUsers();
};

// ── RESET PASSWORD (admin) ────────────────────────────────────────────────────

let _resetUserId = null;

function openResetPassword(id, username) {
  _resetUserId = id;
  document.getElementById('resetPasswordNome').textContent = username || `#${id}`;
  document.getElementById('resetNuovaPassword').value = '';
  document.getElementById('resetNuovaPassword').type = 'password';
  document.getElementById('resetEyeOpen').style.display = '';
  document.getElementById('resetEyeClosed').style.display = 'none';
  const errBox = document.getElementById('formResetPasswordError');
  errBox.style.display = 'none';
  errBox.textContent = '';
  openModal('modalResetPassword');
  setTimeout(() => document.getElementById('resetNuovaPassword').focus(), 120);
}

// Toggle mostra/nascondi
document.getElementById('btnToggleResetPassword').addEventListener('click', () => {
  const input = document.getElementById('resetNuovaPassword');
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  document.getElementById('resetEyeOpen').style.display = isHidden ? 'none' : '';
  document.getElementById('resetEyeClosed').style.display = isHidden ? '' : 'none';
});

// Invio con Enter
document.getElementById('resetNuovaPassword').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('btnConfermaResetPassword').click();
});

// Conferma reset
document.getElementById('btnConfermaResetPassword').addEventListener('click', async () => {
  if (!_resetUserId) return;
  const password = document.getElementById('resetNuovaPassword').value;
  const errBox = document.getElementById('formResetPasswordError');
  const btn = document.getElementById('btnConfermaResetPassword');

  errBox.style.display = 'none';

  if (password.length < 6) {
    errBox.textContent = 'La password deve essere di almeno 6 caratteri.';
    errBox.style.display = 'block';
    document.getElementById('resetNuovaPassword').focus();
    return;
  }

  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.textContent = 'Aggiornamento…';

  try {
    await api(`/api/users/${_resetUserId}/password`, 'PUT', { password });
    closeModal('modalResetPassword');
    toast(`Password di "${document.getElementById('resetPasswordNome').textContent}" aggiornata`, 'success');
  } catch (e) {
    errBox.textContent = e.message || 'Errore. Riprova.';
    errBox.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
    _resetUserId = null;
  }
});

/* ══════════════════════════════════════════════════════════
   REAL-TIME SSE
══════════════════════════════════════════════════════════ */
(function () {
  const sse = new EventSource('/api/events');
  sse.addEventListener('ditta_created', () => { loadDitte(); loadStats(); toast('Nuova ditta aggiunta', 'info'); });
  sse.addEventListener('ditta_updated', () => { loadDitte(); loadStats(); toast('Ditta modificata', 'info'); });
  sse.addEventListener('ditta_deleted', () => { loadDitte(); loadStats(); toast('Ditta eliminata', 'info'); });
  sse.addEventListener('pratica_created', () => { loadPratiche(); loadStats(); loadHomePratiche(); toast('Nuova pratica creata', 'info'); });
  sse.addEventListener('pratica_updated', () => { loadPratiche(); loadStats(); loadHomePratiche(); toast('Pratica modificata', 'info'); });
  sse.addEventListener('pratica_deleted', () => { loadPratiche(); loadStats(); loadHomePratiche(); toast('Pratica eliminata', 'info'); });
  sse.onerror = () => console.warn('SSE disconnesso, riprovo...');
})();

// ═══════════════════════════════════════════════════════════════
//  TARIFFARI GLOBALI
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
//  TARIFFARI GLOBALI  (riscrittura conforme a Scheda 1)
// ═══════════════════════════════════════════════════════════════

let tariffariGlobali = [];
let activeTariffarioId = null;
let voceInEditing = null;   // { gid, vid } – voce attualmente in editing inline

const TIPO_META = {
  fisso_mensile:    { label: 'Costi Fissi Mensili',    color: 'var(--color-blue)',   bg: 'var(--color-blue-highlight)' },
  fisso_annuale:    { label: 'Costi Fissi Annuali',    color: 'var(--color-primary)',bg: 'var(--color-primary-highlight)' },
  variabile_mensile:{ label: 'Costi Variabili Mensili',color: 'var(--color-orange)', bg: 'var(--color-orange-highlight)' },
  variabile_annuale:{ label: 'Costi Variabili Annuali',color: 'var(--color-gold)',   bg: 'var(--color-gold-highlight)' },
};
const MESI_LABELS = ['G','F','M','A','M','G','L','A','S','O','N','D'];
const TIPI_ANNUALI = ['fisso_annuale','variabile_annuale'];

function isAnnuale(tipo){ return TIPI_ANNUALI.includes(tipo); }

// ── Carica lista tariffari ────────────────────────────────────
async function loadTariffari() {
  try {
    tariffariGlobali = await api('/api/tariffari');
    renderTariffariList();
  } catch(e) {
    toast('Errore nel caricamento tariffari', 'error');
  }
}

function renderTariffariList() {
  const container = document.getElementById('tariffariList');
  if (!tariffariGlobali.length) {
    container.innerHTML = `
      <div class="empty-state" style="padding:var(--space-10) var(--space-4)">
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.25">
          <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
          <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
          <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
        <p>Nessun tariffario.<br>Clicca <strong>Nuovo Tariffario</strong>.</p>
      </div>`;
    return;
  }
  container.innerHTML = tariffariGlobali.map(t => `
    <div onclick="selectTariffario(${t.id})"
         style="padding:var(--space-3);border-radius:var(--radius-md);cursor:pointer;
                margin-bottom:var(--space-1);
                background:${t.id===activeTariffarioId?'var(--color-primary-highlight)':'transparent'};
                border:1px solid ${t.id===activeTariffarioId?'var(--color-primary)':'transparent'};
                transition:background var(--transition-interactive),border-color var(--transition-interactive)">
      <div style="font-size:var(--text-sm);font-weight:${t.id===activeTariffarioId?'600':'500'};
                  color:${t.id===activeTariffarioId?'var(--color-primary)':'var(--color-text)'}">
        ${t.nome}
      </div>
      ${t.note?`<div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:2px">${t.note}</div>`:''}
    </div>`).join('');
}

// ── Seleziona un tariffario ───────────────────────────────────
async function selectTariffario(id) {
  activeTariffarioId = id;
  voceInEditing = null;
  renderTariffariList();
  const t = tariffariGlobali.find(x => x.id === id);
  document.getElementById('tariffarioNomeHeader').textContent = t.nome;
  document.getElementById('tariffarioNoteHeader').textContent = t.note || '';
  document.getElementById('tariffarioPlaceholder').style.display = 'none';
  const content = document.getElementById('tariffarioContent');
  content.style.display = 'flex';
  await renderMacrogruppi(id);
}

// ── Render macrogruppi + voci (inline) ───────────────────────
async function renderMacrogruppi(tariffarioId) {
  let gruppi = [];
  try {
    gruppi = await api(`/api/tariffari/${tariffarioId}/macrogruppi`);
  } catch(e) {
    toast('Errore nel caricamento macrogruppi', 'error');
    return;
  }
  const container = document.getElementById('macrogruppiContainer');
  if (!gruppi.length) {
    container.innerHTML = `
      <div class="empty-state" style="padding:var(--space-10)">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.2">
          <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/>
          <line x1="9" y1="21" x2="9" y2="9"/>
        </svg>
        <p style="font-size:var(--text-sm);color:var(--color-text-muted);margin-top:var(--space-3)">
          Nessun macrogruppo.<br>Clicca <strong>+ Macrogruppo</strong> per iniziare.
        </p>
      </div>`;
    return;
  }

  const frozen = voceInEditing !== null;

  container.innerHTML = gruppi.map(g => {
    const tipo = TIPO_META[g.tipo] || TIPO_META.fisso_mensile;
    const annuale = isAnnuale(g.tipo);
    const isGruppoFrozen = frozen && voceInEditing && voceInEditing.gid !== g.id;
    const opacity = isGruppoFrozen ? '0.35' : '1';
    const pointerEvents = isGruppoFrozen ? 'none' : 'auto';

    // ── Form aggiunta nuova voce (in testa al card body) ──────
    const mesiInputHtml = annuale ? `
      <div class="form-field col-span-2" style="margin-top:var(--space-1)">
        <label style="font-size:var(--text-xs);color:var(--color-text-muted)">Mesi di applicazione</label>
        <div id="mesi-add-${g.id}" style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">
          ${MESI_LABELS.map((m,i)=>`
            <button type="button"
              onclick="toggleMeseAdd(${g.id},${i+1},this)"
              data-mese="${i+1}"
              style="width:28px;height:28px;border-radius:var(--radius-sm);
                     border:1px solid var(--color-border);font-size:11px;font-weight:600;
                     background:var(--color-surface);color:var(--color-text-muted);cursor:pointer;
                     transition:all var(--transition-interactive)">${m}</button>`).join('')}
        </div>
      </div>` : '';

    const addFormDisabled = (frozen && voceInEditing && voceInEditing.gid === g.id) ? 'disabled style="opacity:.4;pointer-events:none"' : '';

    const addFormHtml = `
      <div id="addform-${g.id}" ${addFormDisabled}
           style="padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--color-border);
                  background:var(--color-surface-2)">
        <div style="display:grid;grid-template-columns:1fr 120px;gap:var(--space-2);align-items:end">
          <div>
            <label style="font-size:var(--text-xs);color:var(--color-text-muted);display:block;margin-bottom:3px">
              Descrizione <span style="color:var(--color-error)">*</span>
            </label>
            <input id="add-nome-${g.id}" type="text" placeholder="es. Cedolino dipendente"
                   style="width:100%;padding:6px 10px;border:1px solid var(--color-border);
                          border-radius:var(--radius-sm);background:var(--color-surface);
                          font-size:var(--text-sm);color:var(--color-text)"
                   onkeydown="if(event.key==='Enter') aggiungiVoce(${g.id})"/>
          </div>
          <div>
            <label style="font-size:var(--text-xs);color:var(--color-text-muted);display:block;margin-bottom:3px">Prezzo (€)</label>
            <input id="add-prezzo-${g.id}" type="number" step="0.01" placeholder="0.00"
                   style="width:100%;padding:6px 10px;border:1px solid var(--color-border);
                          border-radius:var(--radius-sm);background:var(--color-surface);
                          font-size:var(--text-sm);color:var(--color-text)"/>
          </div>
        </div>
        <div style="display:flex;gap:var(--space-4);margin-top:var(--space-2);align-items:center">
          <label style="display:flex;align-items:center;gap:6px;font-size:var(--text-xs);cursor:pointer">
            <input type="checkbox" id="add-esente-${g.id}" style="width:14px;height:14px"/>
            Esente IVA
          </label>
          <label style="display:flex;align-items:center;gap:6px;font-size:var(--text-xs);cursor:pointer">
            <input type="checkbox" id="add-annop-${g.id}" style="width:14px;height:14px"/>
            Anno Precedente
          </label>
          <button type="button" onclick="aggiungiVoce(${g.id})"
                  style="margin-left:auto;padding:6px 14px;border-radius:var(--radius-sm);
                         background:var(--color-primary);color:#fff;font-size:var(--text-xs);
                         font-weight:600;border:none;cursor:pointer;
                         transition:background var(--transition-interactive)"
                  onmouseover="this.style.background='var(--color-primary-hover)'"
                  onmouseout="this.style.background='var(--color-primary)'">
            + Aggiungi
          </button>
        </div>
        ${mesiInputHtml}
      </div>`;

    // ── Voci esistenti ────────────────────────────────────────
    const vociHtml = g.voci && g.voci.length ? g.voci.map(v => {
      const isEditing = voceInEditing && voceInEditing.vid === v.id;
      const meseLabels = v.mesi && v.mesi.length
        ? v.mesi.map(m => MESI_LABELS[m-1]).join(' ')
        : null;

      if (isEditing) {
        // ── ROW IN EDITING ────────────────────────────────────
        const mesiEditHtml = annuale ? `
          <div style="margin-top:var(--space-2)">
            <label style="font-size:var(--text-xs);color:var(--color-text-muted)">Mesi di applicazione</label>
            <div id="mesi-edit-${v.id}" style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">
              ${MESI_LABELS.map((m,i)=>{
                const sel = v.mesi && v.mesi.includes(i+1);
                return `<button type="button"
                  onclick="toggleMeseEdit(${v.id},${i+1},this)"
                  data-mese="${i+1}" data-sel="${sel?1:0}"
                  style="width:28px;height:28px;border-radius:var(--radius-sm);
                         border:1px solid ${sel?'var(--color-primary)':'var(--color-border)'};
                         font-size:11px;font-weight:600;cursor:pointer;
                         background:${sel?'var(--color-primary-highlight)':'var(--color-surface)'};
                         color:${sel?'var(--color-primary)':'var(--color-text-muted)'};">${m}</button>`;
              }).join('')}
            </div>
          </div>` : '';

        return `
          <div id="voce-row-${v.id}"
               style="padding:var(--space-3) var(--space-4);border-radius:var(--radius-sm);
                      background:var(--color-primary-highlight);
                      border:1px solid var(--color-primary);margin-bottom:var(--space-2)">
            <div style="display:grid;grid-template-columns:1fr 120px;gap:var(--space-2);align-items:end">
              <div>
                <label style="font-size:var(--text-xs);color:var(--color-text-muted);display:block;margin-bottom:3px">
                  Descrizione <span style="color:var(--color-error)">*</span>
                </label>
                <input id="edit-nome-${v.id}" value="${(v.nome||'').replace(/"/g,'&quot;')}"
                       style="width:100%;padding:6px 10px;border:1px solid var(--color-primary);
                              border-radius:var(--radius-sm);background:var(--color-surface);
                              font-size:var(--text-sm);color:var(--color-text)"
                       onkeydown="if(event.key==='Enter') salvaVoceInline(${v.id})"/>
              </div>
              <div>
                <label style="font-size:var(--text-xs);color:var(--color-text-muted);display:block;margin-bottom:3px">Prezzo (€)</label>
                <input id="edit-prezzo-${v.id}" type="number" step="0.01"
                       value="${v.prezzo||''}"
                       style="width:100%;padding:6px 10px;border:1px solid var(--color-primary);
                              border-radius:var(--radius-sm);background:var(--color-surface);
                              font-size:var(--text-sm);color:var(--color-text)"/>
              </div>
            </div>
            <div style="display:flex;gap:var(--space-4);margin-top:var(--space-2);align-items:center;flex-wrap:wrap">
              <label style="display:flex;align-items:center;gap:6px;font-size:var(--text-xs);cursor:pointer">
                <input type="checkbox" id="edit-esente-${v.id}" ${v.esente_iva?'checked':''} style="width:14px;height:14px"/>
                Esente IVA
              </label>
              <label style="display:flex;align-items:center;gap:6px;font-size:var(--text-xs);cursor:pointer">
                <input type="checkbox" id="edit-annop-${v.id}" ${v.richiede_anno_precedente?'checked':''} style="width:14px;height:14px"/>
                Anno Precedente
              </label>
              <div style="margin-left:auto;display:flex;gap:var(--space-2)">
                <button onclick="annullaVoceInline()"
                        style="padding:5px 12px;border-radius:var(--radius-sm);font-size:var(--text-xs);
                               font-weight:600;border:1px solid var(--color-border);
                               background:var(--color-surface);cursor:pointer;color:var(--color-text)">
                  ✖ Annulla
                </button>
                <button onclick="salvaVoceInline(${v.id})"
                        style="padding:5px 12px;border-radius:var(--radius-sm);font-size:var(--text-xs);
                               font-weight:600;border:none;background:var(--color-primary);
                               color:#fff;cursor:pointer">
                  💾 Salva
                </button>
              </div>
            </div>
            ${mesiEditHtml}
          </div>`;
      }

      // ── ROW SOLA LETTURA ──────────────────────────────────
      const flagsHtml = [
        v.esente_iva ? '<span style="font-size:10px;padding:2px 6px;border-radius:var(--radius-full);background:var(--color-gold-highlight);color:var(--color-gold);font-weight:600">Esente IVA</span>' : '',
        v.richiede_anno_precedente ? '<span style="font-size:10px;padding:2px 6px;border-radius:var(--radius-full);background:var(--color-blue-highlight);color:var(--color-blue);font-weight:600">Anno Prec.</span>' : '',
        meseLabels ? `<span style="font-size:10px;padding:2px 6px;border-radius:var(--radius-full);background:var(--color-surface-offset);color:var(--color-text-muted);font-weight:600">${meseLabels}</span>` : '',
      ].filter(Boolean).join('');

      return `
        <div id="voce-row-${v.id}"
             style="display:flex;align-items:center;justify-content:space-between;
                    padding:var(--space-2) var(--space-3);border-radius:var(--radius-sm);
                    background:var(--color-bg);margin-bottom:var(--space-1);
                    opacity:${frozen&&!isEditing?'0.4':'1'};
                    pointer-events:${frozen&&!isEditing?'none':'auto'}">
          <div style="flex:1;min-width:0">
            <span style="font-size:var(--text-sm);color:var(--color-text)">${v.nome}</span>
            ${flagsHtml ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">${flagsHtml}</div>` : ''}
          </div>
          <div style="display:flex;align-items:center;gap:var(--space-3);flex-shrink:0">
            <span style="font-size:var(--text-sm);font-weight:600;font-variant-numeric:tabular-nums;color:var(--color-text)">
              ${v.prezzo > 0 ? '€ '+Number(v.prezzo).toFixed(2) : '—'}
            </span>
            <button onclick="avviaEditVoce(${g.id},${JSON.stringify(v).replace(/"/g,'&quot;')})"
                    class="btn btn-icon btn-ghost" title="Modifica voce"
                    ${frozen?'disabled style="opacity:.3;cursor:not-allowed"':''}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button onclick="eliminaVoce(${v.id})"
                    class="btn btn-icon btn-ghost" title="Elimina voce"
                    style="color:var(--color-error)"
                    ${frozen?'disabled style="opacity:.3;cursor:not-allowed"':''}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              </svg>
            </button>
          </div>
        </div>`;
    }).join('')
    : `<div style="font-size:var(--text-xs);color:var(--color-text-muted);
                   padding:var(--space-2) var(--space-1)">
         Nessuna voce. Usa il form qui sopra per aggiungerne una.
       </div>`;

    return `
      <div style="border:1px solid var(--color-border);border-radius:var(--radius-lg);
                  overflow:hidden;opacity:${opacity};pointer-events:${pointerEvents};
                  transition:opacity 200ms">
        <!-- Header macrogruppo -->
        <div style="padding:var(--space-3) var(--space-4);background:var(--color-surface-offset);
                    display:flex;align-items:center;justify-content:space-between;gap:var(--space-3)">
          <div style="display:flex;align-items:center;gap:var(--space-3)">
            <span style="font-size:var(--text-xs);font-weight:600;padding:2px var(--space-2);
                         border-radius:var(--radius-full);background:${tipo.bg};color:${tipo.color}">
              ${tipo.label}
            </span>
            <span style="font-size:var(--text-sm);font-weight:600;color:var(--color-text)">${g.nome}</span>
          </div>
          <button onclick="eliminaMacrogruppo(${g.id}, ${g.voci?g.voci.length:0})"
                  class="btn btn-icon btn-ghost" title="Elimina macrogruppo"
                  style="color:var(--color-error)"
                  ${frozen?'disabled':''}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            </svg>
          </button>
        </div>
        <!-- Form aggiunta voce + lista voci -->
        ${addFormHtml}
        <div style="padding:var(--space-3) var(--space-4)">${vociHtml}</div>
      </div>`;
  }).join('');
}

// ── Mesi toggle (form aggiunta) ───────────────────────────────
function toggleMeseAdd(gid, mese, btn) {
  const sel = btn.getAttribute('data-sel') === '1';
  btn.setAttribute('data-sel', sel ? '0' : '1');
  if (!sel) {
    btn.style.background = 'var(--color-primary-highlight)';
    btn.style.borderColor = 'var(--color-primary)';
    btn.style.color = 'var(--color-primary)';
  } else {
    btn.style.background = 'var(--color-surface)';
    btn.style.borderColor = 'var(--color-border)';
    btn.style.color = 'var(--color-text-muted)';
  }
}

// ── Mesi toggle (form editing) ────────────────────────────────
function toggleMeseEdit(vid, mese, btn) {
  const sel = btn.getAttribute('data-sel') === '1';
  btn.setAttribute('data-sel', sel ? '0' : '1');
  if (!sel) {
    btn.style.background = 'var(--color-primary-highlight)';
    btn.style.borderColor = 'var(--color-primary)';
    btn.style.color = 'var(--color-primary)';
  } else {
    btn.style.background = 'var(--color-surface)';
    btn.style.borderColor = 'var(--color-border)';
    btn.style.color = 'var(--color-text-muted)';
  }
}

function getMesiSelezionati(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return null;
  const btns = container.querySelectorAll('button[data-mese]');
  const sel = [];
  btns.forEach(b => { if (b.getAttribute('data-sel')==='1') sel.push(parseInt(b.getAttribute('data-mese'))); });
  return sel.length ? sel : null;
}

// ── Aggiungi voce (form inline) ───────────────────────────────
async function aggiungiVoce(gid) {
  if (voceInEditing) {
    toast('Salva o annulla la voce in modifica prima di continuare.', 'error');
    return;
  }
  const nomeEl = document.getElementById(`add-nome-${gid}`);
  const nome = nomeEl.value.trim();
  if (!nome) { nomeEl.focus(); nomeEl.style.borderColor='var(--color-error)'; return; }
  nomeEl.style.borderColor = '';
  const prezzo = parseFloat(document.getElementById(`add-prezzo-${gid}`).value) || 0;
  const esenteEl = document.getElementById(`add-esente-${gid}`);
  const annopEl  = document.getElementById(`add-annop-${gid}`);
  const mesi = getMesiSelezionati(`mesi-add-${gid}`);

  // Trova il gruppo per sapere se annuale
  try {
    const gruppi = await api(`/api/tariffari/${activeTariffarioId}/macrogruppi`);
    const g = gruppi.find(x => x.id === gid);
    await api(`/api/macrogruppi/${gid}/voci`, 'POST', {
      nome,
      prezzo,
      esente_iva: esenteEl ? esenteEl.checked : false,
      richiede_anno_precedente: annopEl ? annopEl.checked : false,
      mesi: isAnnuale(g ? g.tipo : '') ? mesi : null,
    });
    toast('Voce aggiunta', 'success');
    await renderMacrogruppi(activeTariffarioId);
  } catch(e) {
    toast('Errore nell\'aggiunta voce: '+(e.message||''), 'error');
  }
}

// ── Avvia editing inline voce ─────────────────────────────────
function avviaEditVoce(gid, v) {
  if (voceInEditing) {
    toast('Salva o annulla la voce in modifica prima di procedere.', 'error');
    return;
  }
  voceInEditing = { gid, vid: v.id };
  renderMacrogruppi(activeTariffarioId);
}

// ── Salva voce in editing ─────────────────────────────────────
async function salvaVoceInline(vid) {
  const nome = (document.getElementById(`edit-nome-${vid}`)?.value || '').trim();
  if (!nome) {
    toast('La descrizione è obbligatoria.', 'error');
    document.getElementById(`edit-nome-${vid}`)?.focus();
    return;
  }
  const prezzo = parseFloat(document.getElementById(`edit-prezzo-${vid}`)?.value) || 0;
  const esente = document.getElementById(`edit-esente-${vid}`)?.checked || false;
  const annop  = document.getElementById(`edit-annop-${vid}`)?.checked  || false;
  const mesi   = getMesiSelezionati(`mesi-edit-${vid}`);
  const { gid } = voceInEditing;

  try {
    const gruppi = await api(`/api/tariffari/${activeTariffarioId}/macrogruppi`);
    const g = gruppi.find(x => x.id === gid);
    await api(`/api/voci/${vid}`, 'PUT', {
      nome,
      prezzo,
      esente_iva: esente,
      richiede_anno_precedente: annop,
      mesi: isAnnuale(g ? g.tipo : '') ? mesi : null,
    });
    voceInEditing = null;
    toast('Voce aggiornata', 'success');
    await renderMacrogruppi(activeTariffarioId);
  } catch(e) {
    toast('Errore nel salvataggio: '+(e.message||''), 'error');
  }
}

// ── Annulla editing ───────────────────────────────────────────
function annullaVoceInline() {
  voceInEditing = null;
  renderMacrogruppi(activeTariffarioId);
}

// ── Elimina voce ──────────────────────────────────────────────
async function eliminaVoce(vid) {
  if (!confirm('Eliminare questa voce di costo?')) return;
  try {
    await api(`/api/voci/${vid}`, 'DELETE');
    await renderMacrogruppi(activeTariffarioId);
    toast('Voce eliminata', 'success');
  } catch(e) {
    toast('Errore nell\'eliminazione', 'error');
  }
}

// ── Elimina macrogruppo ───────────────────────────────────────
async function eliminaMacrogruppo(gid, numVoci) {
  const msg = numVoci > 0
    ? `Il macrogruppo contiene ${numVoci} voce/i. Eliminandolo verranno eliminate anche tutte le sue voci. Confermare?`
    : 'Eliminare questo macrogruppo?';
  if (!confirm(msg)) return;
  try {
    await api(`/api/macrogruppi/${gid}`, 'DELETE');
    voceInEditing = null;
    await renderMacrogruppi(activeTariffarioId);
    toast('Macrogruppo eliminato', 'success');
  } catch(e) {
    toast('Errore nell\'eliminazione', 'error');
  }
}

// ── Bottone Nuovo Tariffario ──────────────────────────────────
document.getElementById('btnNuovoTariffario').addEventListener('click', () => {
  document.getElementById('inputNomeTariffario').value = '';
  document.getElementById('inputNoteTariffario').value = '';
  document.getElementById('errNuovoTariffario').style.display = 'none';
  openModal('modalNuovoTariffario');
  setTimeout(() => document.getElementById('inputNomeTariffario').focus(), 120);
});

// ── Salva nuovo tariffario ────────────────────────────────────
document.getElementById('btnSalvaNuovoTariffario').addEventListener('click', async () => {
  const nome = document.getElementById('inputNomeTariffario').value.trim();
  const errEl = document.getElementById('errNuovoTariffario');
  errEl.style.display = 'none';
  if (!nome) {
    errEl.textContent = 'Il nome del tariffario è obbligatorio.';
    errEl.style.display = 'block';
    document.getElementById('inputNomeTariffario').focus();
    return;
  }
  try {
    const t = await api('/api/tariffari', 'POST', { nome, note: document.getElementById('inputNoteTariffario').value.trim() });
    closeModal('modalNuovoTariffario');
    await loadTariffari();
    await selectTariffario(t.id);
    toast('Tariffario creato', 'success');
  } catch(e) {
    errEl.textContent = e.message || 'Errore nella creazione.';
    errEl.style.display = 'block';
  }
});

document.getElementById('inputNomeTariffario').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('btnSalvaNuovoTariffario').click();
});

// ── Bottone Duplica Tariffario ────────────────────────────────
document.getElementById('btnDuplicaTariffario')?.addEventListener('click', () => {
  if (!tariffariGlobali.length) { toast('Nessun tariffario da duplicare.', 'error'); return; }
  const sel = document.getElementById('duplicaSorgente');
  sel.innerHTML = tariffariGlobali.map(t => `<option value="${t.id}">${t.nome}</option>`).join('');
  document.getElementById('inputNomeDuplica').value = '';
  document.getElementById('errDuplicaTariffario').style.display = 'none';
  openModal('modalDuplicaTariffario');
  setTimeout(() => document.getElementById('inputNomeDuplica').focus(), 120);
});

document.getElementById('btnConfermaDuplica')?.addEventListener('click', async () => {
  const sorgente = document.getElementById('duplicaSorgente').value;
  const nuovoNome = document.getElementById('inputNomeDuplica').value.trim();
  const errEl = document.getElementById('errDuplicaTariffario');
  errEl.style.display = 'none';
  if (!nuovoNome) {
    errEl.textContent = 'Inserisci il nome del nuovo tariffario.';
    errEl.style.display = 'block';
    document.getElementById('inputNomeDuplica').focus();
    return;
  }
  try {
    const t = await api(`/api/tariffari/${sorgente}/duplica`, 'POST', { nome: nuovoNome });
    closeModal('modalDuplicaTariffario');
    await loadTariffari();
    await selectTariffario(t.id);
    toast('Tariffario duplicato e aperto', 'success');
  } catch(e) {
    errEl.textContent = e.message || 'Errore nella duplicazione.';
    errEl.style.display = 'block';
  }
});

// ── Bottone + Macrogruppo ─────────────────────────────────────
document.getElementById('btnNuovoMacrogruppo').addEventListener('click', () => {
  if (voceInEditing) { toast('Salva o annulla la voce in modifica prima di continuare.', 'error'); return; }
  document.getElementById('inputNomeMacrogruppo').value = '';
  document.getElementById('inputTipoMacrogruppo').value = 'fisso_mensile';
  document.getElementById('errNuovoMacrogruppo').style.display = 'none';
  openModal('modalNuovoMacrogruppo');
  setTimeout(() => document.getElementById('inputNomeMacrogruppo').focus(), 120);
});

document.getElementById('btnSalvaNuovoMacrogruppo').addEventListener('click', async () => {
  const nome = document.getElementById('inputNomeMacrogruppo').value.trim();
  const tipo = document.getElementById('inputTipoMacrogruppo').value;
  const errEl = document.getElementById('errNuovoMacrogruppo');
  errEl.style.display = 'none';
  if (!nome) {
    errEl.textContent = 'Il nome del macrogruppo è obbligatorio.';
    errEl.style.display = 'block';
    return;
  }
  try {
    await api(`/api/tariffari/${activeTariffarioId}/macrogruppi`, 'POST', { nome, tipo });
    closeModal('modalNuovoMacrogruppo');
    await renderMacrogruppi(activeTariffarioId);
    toast('Macrogruppo aggiunto', 'success');
  } catch(e) {
    errEl.textContent = e.message || 'Errore nella creazione.';
    errEl.style.display = 'block';
  }
});

document.getElementById('inputNomeMacrogruppo').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('btnSalvaNuovoMacrogruppo').click();
});

// ── Elimina tariffario ────────────────────────────────────────
document.getElementById('btnDeleteTariffario').addEventListener('click', async () => {
  if (!activeTariffarioId) return;
  const t = tariffariGlobali.find(x => x.id === activeTariffarioId);
  if (!confirm(`Eliminare il tariffario "${t?.nome}"?`)) return;
  try {
    await api(`/api/tariffari/${activeTariffarioId}`, 'DELETE');
    activeTariffarioId = null;
    voceInEditing = null;
    document.getElementById('tariffarioContent').style.display = 'none';
    document.getElementById('tariffarioPlaceholder').style.display = '';
    await loadTariffari();
    toast('Tariffario eliminato', 'success');
  } catch(e) {
    toast('Errore nell\'eliminazione', 'error');
  }
});

const _origSwitchTabTariffari = switchTab;
window.switchTab = function (tabName) {
  _origSwitchTabTariffari(tabName);
  if (tabName === 'tariffari') loadTariffari();
};

// ═══════════════════════════════════════════════════════
// TARIFFARIO DITTA (tab tariffario nella modale ditta)
// ═══════════════════════════════════════════════════════

let currentDittaIdForTariff = null;

// Popola la select dei tariffari globali nel tab ditta
async function loadTariffariSelectDitta(selectedId = null) {
  const sel = document.getElementById('dittaTariffarioSelect');
  if (!sel) return;
  try {
    const list = await api('/api/tariffari');
    sel.innerHTML = '<option value="">— Nessun tariffario associato —</option>';
    list.forEach(t => {
      const o = document.createElement('option');
      o.value = t.id;
      o.textContent = t.nome;
      if (selectedId && t.id == selectedId) o.selected = true;
      sel.appendChild(o);
    });
  } catch (e) {
    console.error(e);
  }
}

// Render lista voci della ditta
function renderDittaVoci(voci) {
  const el = document.getElementById('dittaVociList');
  if (!voci || !voci.length) {
    el.innerHTML = `<div class="list-empty-msg">
      Associa un tariffario e clicca <strong>Sincronizza</strong>,
      oppure aggiungi una <strong>Voce Custom</strong>.
    </div>`;
    return;
  }

  // Raggruppa per tipo + macrogruppo_nome
  const gruppi = {};
  voci.forEach(v => {
    const key = `${v.tipo}||${v.macrogruppo_nome || 'Extra'}`;
    if (!gruppi[key]) gruppi[key] = { tipo: v.tipo, nome: v.macrogruppo_nome || 'Extra', voci: [] };
    gruppi[key].voci.push(v);
  });

  const TIPOMETA_DV = {
    costi_fissi_mensili:     { label: 'Costi Fissi Mensili',     color: 'var(--color-blue)',    bg: 'var(--color-blue-highlight)' },
    costi_fissi_annuali:     { label: 'Costi Fissi Annuali',     color: 'var(--color-primary)', bg: 'var(--color-primary-highlight)' },
    costi_variabili_mensili: { label: 'Costi Variabili Mensili', color: 'var(--color-orange)',  bg: 'var(--color-orange-highlight)' },
    costi_variabili_annuali: { label: 'Costi Variabili Annuali', color: 'var(--color-gold)',    bg: 'var(--color-gold-highlight)' },
    // legacy
    fisso_mensile:     { label: 'Fisso Mensile',     color: 'var(--color-blue)',    bg: 'var(--color-blue-highlight)' },
    fisso_annuale:     { label: 'Fisso Annuale',     color: 'var(--color-primary)', bg: 'var(--color-primary-highlight)' },
    variabile_mensile: { label: 'Variabile Mensile', color: 'var(--color-orange)',  bg: 'var(--color-orange-highlight)' },
    variabile_annuale: { label: 'Variabile Annuale', color: 'var(--color-gold)',    bg: 'var(--color-gold-highlight)' },
  };

  el.innerHTML = Object.values(gruppi).map(g => {
    const meta = TIPOMETA_DV[g.tipo] || TIPOMETA_DV['fisso_mensile'];
    const vociHtml = g.voci.map(v => `
      <div style="display:flex;align-items:center;justify-content:space-between;
                  padding:var(--space-2) var(--space-3);border-radius:var(--radius-sm);
                  background:var(--color-bg);margin-bottom:var(--space-1)">
        <div style="flex:1;min-width:0">
          <span style="font-size:var(--text-sm);color:var(--color-text)">${v.nome}</span>
          ${v.custom ? `<span style="font-size:var(--text-xs);color:var(--color-warning);margin-left:var(--space-2);font-style:italic">custom</span>` : ''}
          ${v.esente_iva ? `<span style="font-size:var(--text-xs);color:var(--color-text-muted);margin-left:var(--space-2)">Esente IVA</span>` : ''}
          ${v.mesi_json ? (() => { try { const m=['G','F','M','A','M','G','L','A','S','O','N','D']; return JSON.parse(v.mesi_json).map(i=>m[i-1]).join(' ') } catch(e){return''} })() !== '' ? `<span style="font-size:var(--text-xs);color:var(--color-text-muted);margin-left:var(--space-2)">${(() => { try { const m=['G','F','M','A','M','G','L','A','S','O','N','D']; return JSON.parse(v.mesi_json).map(i=>m[i-1]).join(' ') } catch(e){return''} })()}</span>` : '' : ''}
        </div>
        <div style="display:flex;align-items:center;gap:var(--space-3);flex-shrink:0">
          <span style="font-size:var(--text-sm);font-weight:600;font-variant-numeric:tabular-nums;color:var(--color-text)">
            ${v.prezzo > 0 ? '€ ' + Number(v.prezzo).toFixed(2) : '—'}
          </span>
          <button onclick="openEditVoceCustom(${v.id}, ${JSON.stringify(v).replace(/"/g, '&quot;')})"
                  class="btn btn-icon btn-ghost" title="Modifica voce">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button onclick="deleteVoceDitta(${v.id})"
                  class="btn btn-icon btn-ghost" title="Elimina voce"
                  style="color:var(--color-error)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            </svg>
          </button>
        </div>
      </div>`).join('');

    return `
      <div style="border:1px solid var(--color-border);border-radius:var(--radius-lg);overflow:hidden;margin-bottom:var(--space-3)">
        <div style="padding:var(--space-2) var(--space-4);background:var(--color-surface-offset);
                    display:flex;align-items:center;gap:var(--space-3)">
          <span style="font-size:var(--text-xs);font-weight:600;padding:2px var(--space-2);
                       border-radius:var(--radius-full);background:${meta.bg};color:${meta.color}">
            ${meta.label}
          </span>
          <span style="font-size:var(--text-sm);font-weight:600;color:var(--color-text)">${g.nome}</span>
        </div>
        <div style="padding:var(--space-3) var(--space-4)">${vociHtml}</div>
      </div>`;
  }).join('');
}

// Carica voci dal server
async function loadDittaVoci(dittaId) {
  if (!dittaId) return;
  try {
    const data = await api(`/api/ditte/${dittaId}/tariffario`);
    // Imposta select tariffario
    await loadTariffariSelectDitta(data.tariffario ? data.tariffario.id : null);
    renderDittaVoci(data.voci);
  } catch (e) {
    console.error(e);
  }
}

// Cambia tariffario associato → salva subito
document.getElementById('dittaTariffarioSelect')?.addEventListener('change', async function () {
  const tid = this.value || null;
  if (!currentDittaIdForTariff) {
    // Nuova ditta non ancora salvata — mostra anteprima voci
    if (tid) {
      try {
        const t = await api(`/api/tariffari/${tid}`);
        const previewVoci = [];
        (t.macrogruppi || []).forEach(mg => {
          (mg.voci || []).forEach(v => previewVoci.push({
            nome: v.nome, prezzo: v.prezzo, macrogruppo_nome: mg.nome,
            tipo: mg.tipo, custom: 0, esente_iva: v.esente_iva,
            richiede_anno_precedente: v.richiede_anno_precedente,
            mesi_json: v.mesi_json
          }));
        });
        renderDittaVoci(previewVoci);
        const hint = document.getElementById('syncResult');
        if (hint) { hint.textContent = '👆 Anteprima — le voci verranno salvate insieme alla ditta'; hint.style.display = 'block'; }
      } catch(e) { console.error(e); }
    } else {
      renderDittaVoci([]);
    }
    return;
  }
  try {
    await api(`/api/ditte/${currentDittaIdForTariff}/tariffario/associa`, 'PUT', { tariffario_id: tid });
    toast('Tariffario associato', 'success');
  } catch (e) {
    toast('Errore associazione: ' + e.message, 'error');
  }
});

// Sincronizza voci dal tariffario standard
document.getElementById('btnSyncTariffario')?.addEventListener('click', async function () {
  if (!currentDittaIdForTariff) {
    toast('Salva prima la ditta, poi sincronizza il tariffario', 'error');
    return;
  }
  const tid = document.getElementById('dittaTariffarioSelect').value;
  if (!tid) { toast('Seleziona prima un tariffario', 'error'); return; }
  const btn = this;
  const orig = btn.innerHTML;
  btn.disabled = true;
  btn.textContent = 'Sincronizzazione...';
  const res_el = document.getElementById('syncResult');
  try {
    // Prima associa (nel caso non fosse già stato salvato)
    await api(`/api/ditte/${currentDittaIdForTariff}/tariffario/associa`, 'PUT', { tariffario_id: parseInt(tid) });
    // Poi sincronizza
    const r = await api(`/api/ditte/${currentDittaIdForTariff}/tariffario/sync`, 'POST');
    res_el.textContent = `✓ Sincronizzato: ${r.aggiunte} voci aggiunte, ${r.aggiornate} aggiornate`;
    res_el.style.display = 'block';
    setTimeout(() => res_el.style.display = 'none', 4000);
    await loadDittaVoci(currentDittaIdForTariff);
    toast('Voci sincronizzate', 'success');
  } catch (e) {
    toast('Errore sincronizzazione: ' + e.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = orig;
  }
});

// Apri modale voce custom (nuova)
document.getElementById('btnAddVoceCustom')?.addEventListener('click', () => {
  document.getElementById('voceCustomEditId').value = '';
  document.getElementById('modalVoceCustomTitolo').textContent = 'Nuova Voce Custom';
  document.getElementById('vcNome').value = '';
  document.getElementById('vcPrezzo').value = '';
  document.getElementById('vcUnita').value = '';
  document.getElementById('vcGruppo').value = '';
  document.getElementById('vcTipo').value = 'fisso_mensile';
  document.getElementById('vcNote').value = '';
  document.getElementById('errVoceCustom').style.display = 'none';
  openModal('modalVoceCustom');
  setTimeout(() => document.getElementById('vcNome').focus(), 120);
});

// Apri modale voce custom (modifica)
function openEditVoceCustom(id, v) {
  document.getElementById('voceCustomEditId').value = id;
  document.getElementById('modalVoceCustomTitolo').textContent = 'Modifica Voce';
  document.getElementById('vcNome').value = v.nome || '';
  document.getElementById('vcPrezzo').value = v.prezzo || '';
  document.getElementById('vcUnita').value = v.unita || '';
  document.getElementById('vcGruppo').value = v.macrogruppo_nome || '';
  document.getElementById('vcTipo').value = v.tipo || 'fisso_mensile';
  document.getElementById('vcNote').value = v.note || '';
  document.getElementById('errVoceCustom').style.display = 'none';
  openModal('modalVoceCustom');
  setTimeout(() => document.getElementById('vcNome').focus(), 120);
}

// Salva voce custom (nuova o modifica)
document.getElementById('btnSalvaVoceCustom')?.addEventListener('click', async function () {
  const errEl = document.getElementById('errVoceCustom');
  errEl.style.display = 'none';
  const nome = document.getElementById('vcNome').value.trim();
  if (!nome) {
    errEl.textContent = 'Il nome della voce è obbligatorio.';
    errEl.style.display = 'block';
    document.getElementById('vcNome').focus();
    return;
  }
  const payload = {
    nome,
    prezzo: parseFloat(document.getElementById('vcPrezzo').value) || 0,
    unita: document.getElementById('vcUnita').value.trim(),
    macrogruppo_nome: document.getElementById('vcGruppo').value.trim() || 'Extra',
    tipo: document.getElementById('vcTipo').value,
    note: document.getElementById('vcNote').value.trim(),
  };
  const editId = document.getElementById('voceCustomEditId').value;
  const btn = this;
  btn.disabled = true;
  try {
    if (editId) {
      await api(`/api/ditte/${currentDittaIdForTariff}/tariffario/voce/${editId}`, 'PUT', payload);
      toast('Voce aggiornata', 'success');
    } else {
      await api(`/api/ditte/${currentDittaIdForTariff}/tariffario/voce`, 'POST', payload);
      toast('Voce aggiunta', 'success');
    }
    closeModal('modalVoceCustom');
    await loadDittaVoci(currentDittaIdForTariff);
  } catch (e) {
    errEl.textContent = e.message || 'Errore nel salvataggio.';
    errEl.style.display = 'block';
  } finally {
    btn.disabled = false;
  }
});

// Elimina voce ditta
async function deleteVoceDitta(vid) {
  if (!confirm('Eliminare questa voce?')) return;
  try {
    await api(`/api/ditte/${currentDittaIdForTariff}/tariffario/voce/${vid}`, 'DELETE');
    toast('Voce eliminata', 'success');
    await loadDittaVoci(currentDittaIdForTariff);
  } catch (e) {
    toast('Errore: ' + e.message, 'error');
  }
}

// Enter su vcNome → focus su prezzo
document.getElementById('vcNome')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('vcPrezzo').focus();
});

function openCambiaPassword() {
  openModal('modalCambiaPassword');
}

/* INIT */
checkAuth();