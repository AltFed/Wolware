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
let ditteAnno = new Date().getFullYear();

async function loadDitte() {
  try {
    const mostraArch = document.getElementById('filterArchiviati')?.checked ? 1 : 0;
    allDitte = await api(`/api/ditte?anno=${ditteAnno}&archiviati=${mostraArch}`);
    populateAnnoFilter();
    populateFilterTariffario();
    renderDitte(allDitte);
  } catch(e) { toast('Errore nel caricamento clienti', 'error'); }
}

function populateAnnoFilter() {
  const sel = document.getElementById('filterAnno');
  if (!sel) return;
  const cur = ditteAnno;
  const anni = [];
  for (let y = new Date().getFullYear(); y >= 2020; y--) anni.push(y);
  sel.innerHTML = anni.map(y => `<option value="${y}"${y===cur?' selected':''}>${y}</option>`).join('');
}

function renderDitte(list) {
  const tbody = document.getElementById('ditteBody');
  const mostraArch = document.getElementById('filterArchiviati')?.checked;
  const filtered = mostraArch ? list : list.filter(d => !d.archiviato);
  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-state-row">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
      <p>Nessun cliente${mostraArch ? '' : ' attivo'}.<br><button class="btn btn-primary btn-sm" style="margin-top:var(--space-3)" onclick="document.getElementById('btnNuovaDitta2').click()">+ Aggiungi cliente</button></p>
    </td></tr>`;
    return;
  }
  const MESI = ['G','F','M','A','M','G','L','A','S','O','N','D'];
  tbody.innerHTML = filtered.map(d => {
    // indicatori mesi CF (fissi) e VR (variabili) — placeholder visivo
    const cfDots = MESI.map((m,i) => {
      const stato = (d[`cf_mese_${i+1}_${ditteAnno}`]) ? 'done' : '';
      return `<span class="mese-dot ${stato}" title="${m}">${m}</span>`;
    }).join('');
    const vrDots = MESI.map((m,i) => {
      const stato = (d[`vr_mese_${i+1}_${ditteAnno}`]) ? 'done' : '';
      return `<span class="mese-dot ${stato}" title="${m}">${m}</span>`;
    }).join('');

    const dovuto  = d.totale_dovuto  != null ? formatEur(d.totale_dovuto)  : '—';
    const pagato  = d.totale_pagato  != null ? formatEur(d.totale_pagato)  : '—';
    const residuo = d.totale_residuo != null ? d.totale_residuo : null;
    const residuoHTML = residuo == null ? '<span style="color:var(--color-text-faint)">—</span>'
      : residuo > 0
        ? `<span class="badge-residuo debito">${formatEur(residuo)}</span>`
        : residuo < 0
          ? `<span class="badge-residuo credito">${formatEur(Math.abs(residuo))}</span>`
          : `<span style="color:var(--color-text-faint)">—</span>`;

    const cadBadge = d.cadenza
      ? `<span class="badge-cadenza">${d.cadenza}</span>`
      : '<span style="color:var(--color-text-faint)">—</span>';

    return `<tr class="cliente-row" onclick="openDettaglioCliente(${d.id})" title="${d.ragione_sociale}">
      <td class="col-denom">
        <div class="denom-wrap">
          <div class="ditta-avatar ditta-avatar-sm">${d.ragione_sociale.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}</div>
          <div>
            <div class="denom-name">${d.ragione_sociale}</div>
            ${d.tariffario_nome ? `<div class="denom-tariff">${d.tariffario_nome}</div>` : ''}
          </div>
        </div>
      </td>
      <td class="col-mesi">
        <div class="mesi-block">
          <span class="mesi-label">CF</span><div class="mesi-dots">${cfDots}</div>
        </div>
        <div class="mesi-block">
          <span class="mesi-label">VR</span><div class="mesi-dots">${vrDots}</div>
        </div>
      </td>
      <td class="col-money mono">${dovuto}</td>
      <td class="col-money mono">${pagato}</td>
      <td class="col-money">${residuoHTML}</td>
      <td class="col-cadenza">${cadBadge}</td>
      <td class="col-data mono">${d.ultimo_ec || '<span style="color:var(--color-text-faint)">—</span>'}</td>
      <td class="col-data mono">${d.ultimo_pag || '<span style="color:var(--color-text-faint)">—</span>'}</td>
    </tr>`;
  }).join('');
}

function formatEur(val) {
  if (val == null) return '—';
  return new Intl.NumberFormat('it-IT', {style:'currency', currency:'EUR', minimumFractionDigits:2}).format(val);
}

document.getElementById('filterDitte')?.addEventListener('input', filterDitte);
document.getElementById('filterForma')?.addEventListener('change', filterDitte);
document.getElementById('filterTariffario')?.addEventListener('change', filterDitte);
document.getElementById('filterAnno')?.addEventListener('change', e => { ditteAnno = +e.target.value; loadDitte(); });
document.getElementById('filterArchiviati')?.addEventListener('change', loadDitte);

// Ctrl+F focalizza la ricerca
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
    const inp = document.getElementById('filterDitte');
    if (inp && document.getElementById('tab-ditte')?.classList.contains('active')) {
      e.preventDefault(); inp.focus(); inp.select();
    }
  }
});

// bottone empty state
document.addEventListener('click', e => {
  if (e.target && e.target.id === 'btnEmptyAddCliente') {
    document.getElementById('btnNuovaDitta2')?.click();
  }
});

function filterDitte() {
  const q       = (document.getElementById('filterDitte')?.value || '').toLowerCase();
  const forma   = document.getElementById('filterForma')?.value || '';
  const tariff  = document.getElementById('filterTariffario')?.value || '';
  let f = allDitte;
  if (q) f = f.filter(d =>
    d.ragione_sociale.toLowerCase().includes(q) ||
    (d.partita_iva  || '').toLowerCase().includes(q) ||
    (d.referente    || '').toLowerCase().includes(q) ||
    (d.citta        || '').toLowerCase().includes(q)
  );
  if (forma) f = f.filter(d => d.forma_giuridica === forma);
  if (tariff === '__nessuno__') f = f.filter(d => !d.tariffario_id);
  else if (tariff) f = f.filter(d => String(d.tariffario_id) === tariff);
  renderDitte(f);
}

function populateFilterTariffario() {
  const sel = document.getElementById('filterTariffario');
  if (!sel) return;
  const cur = sel.value;
  sel.innerHTML = '<option value="">Tutti i tariffari</option>' +
    '<option value="__nessuno__">— Senza tariffario —</option>' +
    tariffariGlobali.map(t => `<option value="${t.id}"${String(t.id)===cur?' selected':''}>${t.nome}</option>`).join('');
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
  // Reset nuovi campi Blocco 2
  ['inizio_paghe','fine_paghe','inizio_contabilita','fine_contabilita'].forEach(f => {
    const el = document.getElementById(f); if (el) el.value = '';
  });
  const residuoEl = document.getElementById('residuo_iniziale');
  if (residuoEl) residuoEl.value = '0';
  const cadenzaEl = document.getElementById('cadenza_pagamenti');
  if (cadenzaEl) cadenzaEl.value = 'libero';
  document.querySelectorAll('.cadenza-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.val === 'libero');
  });
  const annotEl = document.getElementById('annotazioni');
  if (annotEl) annotEl.value = '';
  resetModalTabs();
}
function openDittaModal() {
  resetDittaForm();
  const btnDelModal = document.getElementById('btnDeleteDittaModal');
  if (btnDelModal) btnDelModal.style.display = 'none';
  const btnArchModal2 = document.getElementById('btnArchiviaDittaModal');
  if (btnArchModal2) btnArchModal2.style.display = 'none';
  openModal('modalDitta');
}

async function editDitta(id) {
  resetDittaForm();
  document.getElementById('modalDittaTitle').textContent = 'Modifica Ditta';
  try {
    const d = await api(`/api/ditte/${id}`);
    document.getElementById('dittaId').value = d.id;
    ['ragione_sociale', 'codice_fiscale', 'partita_iva', 'indirizzo', 'cap', 'citta',
      'provincia', 'cod_catastale', 'amministratore', 'cf_amministratore',
      'tel_amministratore', 'email_amministratore', 'data_inizio_rapporto',
      'email', 'pec', 'telefono',
      'inizio_paghe', 'fine_paghe', 'inizio_contabilita', 'fine_contabilita'].forEach(f => {
        const el = document.getElementById(f);
        if (el && d[f]) el.value = d[f];
      });
    document.getElementById('cedolino_onnicomprensivo').checked = !!d.cedolino_onnicomprensivo;
    // Carica cadenza pagamenti
    const cadVal = d.cadenza_pagamenti || 'libero';
    const cadHidden = document.getElementById('cadenza_pagamenti');
    if (cadHidden) cadHidden.value = cadVal;
    document.querySelectorAll('.cadenza-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.val === cadVal);
    });
    // Carica residuo iniziale e annotazioni
    const residEl = document.getElementById('residuo_iniziale');
    if (residEl) residEl.value = d.residuo_iniziale ?? 0;
    const annotEl2 = document.getElementById('annotazioni');
    if (annotEl2) annotEl2.value = d.annotazioni || '';
    if (d.sedi_json) { try { sedi = JSON.parse(d.sedi_json); sedeIdx = 0; } catch (e) { } }
    if (d.inail_json) { try { inailList = JSON.parse(d.inail_json); } catch (e) { } }
    if (d.inps_json) { try { inpsList = JSON.parse(d.inps_json); } catch (e) { } }
    if (d.cc_json) { try { ccList = JSON.parse(d.cc_json); } catch (e) { } }
    if (d.tariff_json) { try { tariffItems = JSON.parse(d.tariff_json); } catch (e) { } }
    renderSedi(); renderInail(); renderInps(); renderCC(); renderTariff();
    currentDittaIdForTariff = d.id;
    await loadDittaVoci(d.id);
    const btnDelModal = document.getElementById('btnDeleteDittaModal');
    if (btnDelModal) btnDelModal.style.display = 'flex';
    const btnArchModal = document.getElementById('btnArchiviaDittaModal');
    const lblArch = document.getElementById('btnArchiviaDittaLabel');
    if (btnArchModal) {
      btnArchModal.style.display = 'flex';
      if (lblArch) lblArch.textContent = d.archiviato ? 'Ripristina' : 'Archivia';
      btnArchModal.style.color = d.archiviato ? 'var(--color-success)' : 'var(--color-warning)';
      btnArchModal.style.borderColor = d.archiviato ? 'var(--color-success)' : 'var(--color-warning)';
    }
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
    inizio_paghe: document.getElementById('inizio_paghe')?.value || null,
    fine_paghe: document.getElementById('fine_paghe')?.value || null,
    inizio_contabilita: document.getElementById('inizio_contabilita')?.value || null,
    fine_contabilita: document.getElementById('fine_contabilita')?.value || null,
    cadenza_pagamenti: document.getElementById('cadenza_pagamenti')?.value || 'libero',
    residuo_iniziale: parseFloat(document.getElementById('residuo_iniziale')?.value || 0),
    annotazioni: document.getElementById('annotazioni')?.value?.trim() || '',
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

// Cadenza pagamenti — toggle bottoni
document.getElementById('cadenzaBtnGroup')?.addEventListener('click', e => {
  const btn = e.target.closest('.cadenza-btn');
  if (!btn) return;
  document.querySelectorAll('.cadenza-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const hidden = document.getElementById('cadenza_pagamenti');
  if (hidden) hidden.value = btn.dataset.val;
});
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

// Archivia / Ripristina ditta dal modal
document.getElementById('btnArchiviaDittaModal')?.addEventListener('click', async () => {
  const id = parseInt(document.getElementById('dittaId').value);
  if (!id) return;
  const ditta = allDitte.find(d => d.id === id);
  const nome = ditta?.ragione_sociale || 'questa ditta';
  const isArch = !!ditta?.archiviato;
  const azione = isArch ? 'Ripristinare' : 'Archiviare';
  if (!confirm(`${azione} "${nome}"?`)) return;
  try {
    await api(`/api/ditte/${id}`, 'PATCH', { archiviato: isArch ? 0 : 1 });
    closeModal('modalDitta');
    toast(isArch ? 'Ditta ripristinata' : 'Ditta archiviata', 'success');
    loadDitte();
    loadStats();
  } catch(e) {
    toast('Errore: ' + e.message, 'error');
  }
});

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
    populateFilterTariffario();
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
  container.innerHTML = tariffariGlobali.map(t => {
    const totVoci = t.voci_count || 0;
    return `
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
      <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:2px">
        ${totVoci} voce${totVoci !== 1 ? 'i' : ''} configurate
      </div>
    </div>`; }).join('');
}

// ── Seleziona un tariffario ───────────────────────────────────
async function selectTariffario(id) {
  activeTariffarioId = id;
  voceInEditing = null;
  renderTariffariList();
  const t = tariffariGlobali.find(x => x.id === id);
  document.getElementById('tariffarioNomeHeader').textContent = t.nome;
  document.getElementById('tariffarioNoteHeader').textContent = t.note || '';
  document.getElementById('tariffarioRenameInline').style.display = 'none';
  document.getElementById('tariffarioNomeHeader').style.display = '';
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
        ? (v.mesi.includes(0) ? 'Tutti' : v.mesi.map(m => MESI_LABELS[m-1]).join(' '))
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
// ── Helper stile bottone mese ─────────────────────────────────
function _applyMeseStyle(btn, active) {
  btn.style.background  = active ? 'var(--color-primary-highlight)' : 'var(--color-surface)';
  btn.style.borderColor = active ? 'var(--color-primary)' : 'var(--color-border)';
  btn.style.color       = active ? 'var(--color-primary)' : 'var(--color-text-muted)';
}

// Se tutti e 12 i mesi individuali sono selezionati → attiva T automaticamente
function _syncTuttiBtn(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const individuale = [...container.querySelectorAll('button[data-mese]')]
    .filter(b => parseInt(b.getAttribute('data-mese')) > 0);
  const tuttiSel = individuale.length > 0 && individuale.every(b => b.getAttribute('data-sel') === '1');
  const tuttiBtn = container.querySelector('button[data-mese="0"]');
  if (tuttiBtn) { tuttiBtn.setAttribute('data-sel', tuttiSel ? '1' : '0'); _applyMeseStyle(tuttiBtn, tuttiSel); }
}

function toggleMeseAdd(gid, mese, btn) {
  const sel = btn.getAttribute('data-sel') === '1';
  btn.setAttribute('data-sel', sel ? '0' : '1');
  _applyMeseStyle(btn, !sel);
  _syncTuttiBtn(`mesi-add-${gid}`);
}

// ── Mesi toggle (form editing) ────────────────────────────────
function toggleMeseEdit(vid, mese, btn) {
  const sel = btn.getAttribute('data-sel') === '1';
  btn.setAttribute('data-sel', sel ? '0' : '1');
  _applyMeseStyle(btn, !sel);
  _syncTuttiBtn(`mesi-edit-${vid}`);
}

// ── Bottone T (Tutti) form aggiunta ───────────────────────────
function toggleTuttiAdd(gid, btn) {
  const container = document.getElementById(`mesi-add-${gid}`);
  const isActive = btn.getAttribute('data-sel') === '1';
  const newSel = isActive ? 0 : 1;
  btn.setAttribute('data-sel', newSel);
  _applyMeseStyle(btn, newSel === 1);
  container.querySelectorAll('button[data-mese]').forEach(b => {
    if (parseInt(b.getAttribute('data-mese')) > 0) {
      b.setAttribute('data-sel', newSel);
      _applyMeseStyle(b, newSel === 1);
    }
  });
}

// ── Bottone T (Tutti) form editing ────────────────────────────
function toggleTuttiEdit(vid, btn) {
  const container = document.getElementById(`mesi-edit-${vid}`);
  const isActive = btn.getAttribute('data-sel') === '1';
  const newSel = isActive ? 0 : 1;
  btn.setAttribute('data-sel', newSel);
  _applyMeseStyle(btn, newSel === 1);
  container.querySelectorAll('button[data-mese]').forEach(b => {
    if (parseInt(b.getAttribute('data-mese')) > 0) {
      b.setAttribute('data-sel', newSel);
      _applyMeseStyle(b, newSel === 1);
    }
  });
}

function getMesiSelezionati(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return null;
  const tuttiBtn = container.querySelector('button[data-mese="0"]');
  if (tuttiBtn && tuttiBtn.getAttribute('data-sel') === '1') return [0];
  const btns = container.querySelectorAll('button[data-mese]');
  const sel = [];
  btns.forEach(b => {
    const m = parseInt(b.getAttribute('data-mese'));
    if (m > 0 && b.getAttribute('data-sel') === '1') sel.push(m);
  });
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
      mesi,
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
      mesi,
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
  if (voceInEditing && tabName !== 'tariffari') {
    const ok = confirm(
      'Ci sono modifiche non confermate su una voce.\n' +
      'Vuoi abbandonare le modifiche e cambiare sezione?'
    );
    if (!ok) return;
    voceInEditing = null;
  }
  _origSwitchTabTariffari(tabName);
  if (tabName === 'tariffari') loadTariffari();
};


// ── Rinomina tariffario inline ────────────────────────────────
function avviaRinominaTariffario() {
  const t = tariffariGlobali.find(x => x.id === activeTariffarioId);
  if (!t) return;
  document.getElementById('tariffarioNomeHeader').style.display = 'none';
  const inp = document.getElementById('tariffarioRenameInline');
  inp.value = t.nome;
  inp.style.display = 'inline-block';
  inp.focus();
  inp.select();
}

async function salvaRinominaTariffario() {
  const nome = document.getElementById('tariffarioRenameInline').value.trim();
  if (!nome) { toast('Il nome non può essere vuoto.', 'error'); return; }
  const t = tariffariGlobali.find(x => x.id === activeTariffarioId);
  if (nome === t.nome) { annullaRinominaTariffario(); return; }
  try {
    await api(`/api/tariffari/${activeTariffarioId}`, 'PUT', { nome, note: t.note || '' });
    toast('Tariffario rinominato', 'success');
    await loadTariffari();
    document.getElementById('tariffarioNomeHeader').textContent = nome;
  } catch(e) {
    toast('Errore nel rinominare: '+(e.message||''), 'error');
  } finally {
    document.getElementById('tariffarioRenameInline').style.display = 'none';
    document.getElementById('tariffarioNomeHeader').style.display = '';
  }
}

function annullaRinominaTariffario() {
  document.getElementById('tariffarioRenameInline').style.display = 'none';
  document.getElementById('tariffarioNomeHeader').style.display = '';
}
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
    await loadTariffariSelectDitta(data.tariffario ? data.tariffario.id : null);
    renderDittaVoci(data.voci);
    // Mostra bottone Cambia Tariffario solo su ditte esistenti con tariffario
    const btnCambia = document.getElementById('btnCambiaTariffario');
    if (btnCambia) {
      btnCambia.style.display = data.tariffario ? 'flex' : 'none';
    }
    // Carica storico
    await loadStoricoTariffario(dittaId);
  } catch (e) {
    console.error(e);
  }
}

async function loadStoricoTariffario(dittaId) {
  const section = document.getElementById('storicoTariffarioSection');
  const list    = document.getElementById('storicoTariffarioList');
  if (!section || !list) return;
  try {
    const storico = await api(`/api/ditte/${dittaId}/storico-tariffari`);
    if (!storico.length) {
      section.style.display = 'none';
      return;
    }
    section.style.display = '';
    list.innerHTML = storico.map(s => `
      <div style="display:flex;align-items:center;justify-content:space-between;
                  padding:var(--space-2) var(--space-3);border-radius:var(--radius-sm);
                  background:var(--color-bg);margin-bottom:var(--space-1)">
        <div>
          <span style="font-size:var(--text-sm);font-weight:500;color:var(--color-text)">
            ${s.tariffario_nome || '— Nessun tariffario —'}
          </span>
          ${s.note ? `<span style="font-size:var(--text-xs);color:var(--color-text-muted);margin-left:var(--space-2)">${s.note}</span>` : ''}
        </div>
        <span style="font-size:var(--text-xs);color:var(--color-text-muted);flex-shrink:0;margin-left:var(--space-3)">
          ${s.cambiato_il || ''}
        </span>
      </div>`).join('');
  } catch(e) {
    section.style.display = 'none';
  }
}

// Cambia tariffario associato → salva subito
document.getElementById('dittaTariffarioSelect')?.addEventListener('change', async function () {
  const tid = this.value || null;
  const btnCambia = document.getElementById('btnCambiaTariffario');
  if (!currentDittaIdForTariff) {
    // Nuova ditta non ancora salvata — mostra anteprima voci
    if (btnCambia) btnCambia.style.display = 'none';
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
    if (btnCambia) btnCambia.style.display = tid ? 'flex' : 'none';
    toast('Tariffario associato', 'success');
  } catch (e) {
    toast('Errore associazione: ' + e.message, 'error');
  }
});

// ── Bottone Cambia Tariffario (con avviso spec §6.2) ─────────
document.getElementById('btnCambiaTariffario')?.addEventListener('click', async () => {
  if (!currentDittaIdForTariff) return;
  const tid = document.getElementById('dittaTariffarioSelect').value || null;
  const tName = document.getElementById('dittaTariffarioSelect').selectedOptions[0]?.text || '';

  const ok = confirm(
    '⚠️ Stai per cambiare il tariffario di questa ditta.\n\n' +
    'Attenzione: i costi e le voci già inseriti manterranno i prezzi del tariffario precedente.\n' +
    'Il nuovo tariffario verrà applicato solo ai nuovi mesi.\n\n' +
    'Vuoi procedere?'
  );
  if (!ok) return;

  try {
    await api(`/api/ditte/${currentDittaIdForTariff}/cambia-tariffario`, 'POST', {
      tariffario_id: tid,
      note: `Cambiato in: ${tName}`
    });
    toast('Tariffario cambiato e registrato nello storico', 'success');
    await loadDittaVoci(currentDittaIdForTariff);
    loadDitte();
  } catch(e) {
    toast('Errore: ' + (e.message || ''), 'error');
  }
});

// ── Inizializza: sovrascrive tutto (identico al vecchio Sincronizza) ─────────
document.getElementById('btnInitTariffario')?.addEventListener('click', async function () {
  if (!currentDittaIdForTariff) {
    toast('Salva prima la ditta', 'error');
    return;
  }
  const tid = document.getElementById('dittaTariffarioSelect').value;
  if (!tid) { toast('Seleziona prima un tariffario', 'error'); return; }
  if (!confirm('⚠️ Inizializza: tutte le voci verranno sostituite con quelle del tariffario.\nLe modifiche manuali andranno perse. Continuare?')) return;
  const btn = this;
  const orig = btn.innerHTML;
  btn.disabled = true;
  btn.textContent = 'Inizializzazione...';
  const res_el = document.getElementById('syncResult');
  try {
    await api(`/api/ditte/${currentDittaIdForTariff}/tariffario/associa`, 'PUT', { tariffario_id: parseInt(tid) });
    const r = await api(`/api/ditte/${currentDittaIdForTariff}/tariffario/sync`, 'POST');
    res_el.textContent = `✓ Inizializzato: ${r.aggiunte} voci aggiunte, ${r.aggiornate} aggiornate`;
    res_el.style.display = 'block';
    setTimeout(() => res_el.style.display = 'none', 4000);
    await loadDittaVoci(currentDittaIdForTariff);
    toast('Tariffario inizializzato', 'success');
  } catch (e) {
    toast('Errore: ' + e.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = orig;
  }
});

// ── Aggiorna: aggiunge nuove voci e aggiorna solo quelle NON modificate manualmente ─
document.getElementById('btnAggiornaTariffario')?.addEventListener('click', async function () {
  if (!currentDittaIdForTariff) {
    toast('Salva prima la ditta', 'error');
    return;
  }
  const tid = document.getElementById('dittaTariffarioSelect').value;
  if (!tid) { toast('Seleziona prima un tariffario', 'error'); return; }
  const btn = this;
  const orig = btn.innerHTML;
  btn.disabled = true;
  btn.textContent = 'Aggiornamento...';
  const res_el = document.getElementById('syncResult');
  try {
    await api(`/api/ditte/${currentDittaIdForTariff}/tariffario/associa`, 'PUT', { tariffario_id: parseInt(tid) });
    const r = await api(`/api/ditte/${currentDittaIdForTariff}/tariffario/aggiorna`, 'POST');
    res_el.textContent = `✓ Aggiornato: ${r.aggiunte} nuove, ${r.aggiornate} aggiornate, ${r.saltate} lasciate invariate`;
    res_el.style.display = 'block';
    setTimeout(() => res_el.style.display = 'none', 5000);
    await loadDittaVoci(currentDittaIdForTariff);
    toast('Voci aggiornate', 'success');
  } catch (e) {
    toast('Errore: ' + e.message, 'error');
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

// Elimina ditta dal modal
document.getElementById('btnDeleteDittaModal')?.addEventListener('click', async () => {
  const id = parseInt(document.getElementById('dittaId').value);
  if (!id) return;
  const ditta = allDitte.find(d => d.id === id);
  const nome = ditta?.ragione_sociale || 'questa ditta';
  if (!confirm(`Eliminare "${nome}"?\n\nL'operazione non può essere annullata.`)) return;
  try {
    await api(`/api/ditte/${id}`, 'DELETE');
    closeModal('modalDitta');
    toast('Ditta eliminata', 'success');
    loadDitte();
    loadStats();
  } catch(e) {
    toast('Errore: ' + e.message, 'error');
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   BLOCCO 3 — MODAL DETTAGLIO CLIENTE
══════════════════════════════════════════════════════════════════════════ */

const MESI_NOMI_DET = ['','Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno',
                        'Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];

let currentDetId    = null;
let currentDetAnno  = new Date().getFullYear();
let currentDetStats = null;  // ultimo riepilogo caricato, usato da sollecito/fattura

async function openDettaglioCliente(id) {
  currentDetId   = id;
  currentDetAnno = ditteAnno;
  _buildDetAnnoSel();
  openModal('modalDettaglioCliente');
  await _loadDettaglio();
}

function _buildDetAnnoSel() {
  const sel = document.getElementById('dettaglioAnnoSel');
  const cur = currentDetAnno;
  const now = new Date().getFullYear();
  sel.innerHTML = '';
  for (let y = now + 2; y >= now - 5; y--) {
    sel.innerHTML += `<option value="${y}"${y===cur?' selected':''}>${y}</option>`;
  }
}

document.getElementById('dettaglioAnnoSel')?.addEventListener('change', async e => {
  currentDetAnno = +e.target.value;
  await _loadDettaglio(false);
});

async function _loadDettaglio(fullLoad = true) {
  try {
    if (fullLoad) {
      const d = await api(`/api/ditte/${currentDetId}`);
      _renderDetHeader(d);
    }
    const [stats, pratiche, arrot, pag] = await Promise.all([
      api(`/api/stats/ditta/${currentDetId}?anno=${currentDetAnno}`),
      api(`/api/pratiche?ditta_id=${currentDetId}&anno=${currentDetAnno}`),
      api(`/api/arrotondamenti?ditta_id=${currentDetId}`),
      api(`/api/pagamenti?ditta_id=${currentDetId}&anno=${currentDetAnno}`),
    ]);
    currentDetStats = stats;
    _renderDetRiepilogo(stats);
    _renderDetPratiche(pratiche);
    _renderDetArrot(arrot);
    _renderDetPag(pag);
    document.getElementById('dettaglioPraticheHdr').textContent = `Pratiche ${currentDetAnno}`;
    document.getElementById('dettaglioPagHdr').textContent = `Pagamenti ${currentDetAnno}`;
  } catch(e) { toast('Errore caricamento dettaglio: ' + e.message, 'error'); }
}

function _renderDetHeader(d) {
  document.getElementById('dettaglioTitle').textContent = d.ragione_sociale;
  document.getElementById('dettaglioBadgeArch').style.display = d.archiviato ? '' : 'none';

  const pagheStr = _dateRange(d.inizio_paghe, d.fine_paghe);
  const contabStr = _dateRange(d.inizio_contabilita, d.fine_contabilita);

  document.getElementById('dettaglioAnagraficaInfo').innerHTML = `
    ${d.partita_iva || d.codice_fiscale ? `<div class="dettaglio-info-row"><span class="dettaglio-info-label">P.IVA/CF</span><span class="dettaglio-info-val">${d.partita_iva || d.codice_fiscale}</span></div>` : ''}
    ${d.email ? `<div class="dettaglio-info-row"><span class="dettaglio-info-label">Email</span><span class="dettaglio-info-val">${d.email}</span></div>` : ''}
    ${d.telefono ? `<div class="dettaglio-info-row"><span class="dettaglio-info-label">Tel.</span><span class="dettaglio-info-val">${d.telefono}</span></div>` : ''}
    ${pagheStr  ? `<div class="dettaglio-info-row"><span class="dettaglio-info-label">Paghe</span><span class="dettaglio-info-val">${pagheStr}</span></div>` : ''}
    ${contabStr ? `<div class="dettaglio-info-row"><span class="dettaglio-info-label">Contab.</span><span class="dettaglio-info-val">${contabStr}</span></div>` : ''}
    ${d.cadenza_pagamenti ? `<div class="dettaglio-info-row"><span class="dettaglio-info-label">Cadenza</span><span class="dettaglio-info-val">${d.cadenza_pagamenti}</span></div>` : ''}
    ${d.tariffario_nome ? `<div class="dettaglio-info-row"><span class="dettaglio-info-label">Tariffario</span><span class="dettaglio-info-val" style="color:var(--color-primary)">${d.tariffario_nome}</span></div>` : ''}
  `;

  const btnArch = document.getElementById('btnDetArchivia');
  btnArch.textContent = d.archiviato ? '↩ Ripristina' : '📦 Archivia';
  btnArch.dataset.archiviato = d.archiviato ? '1' : '0';

  const annotEl = document.getElementById('dettaglioAnnotazioni');
  if (annotEl) annotEl.value = d.annotazioni || '';

  // Date gestione
  ['inizio_paghe','fine_paghe','inizio_contabilita','fine_contabilita'].forEach(f => {
    const el = document.getElementById('dg_' + f);
    if (el) el.value = d[f] || '';
  });
}

function _dateRange(inizio, fine) {
  if (!inizio) return '';
  const ini = inizio.slice(0, 10).split('-').reverse().join('/');
  const fin = fine ? fine.slice(0, 10).split('-').reverse().join('/') : 'In corso';
  return `${ini} → ${fin}`;
}

function _renderDetRiepilogo(s) {
  const imponibile = s.dovuto - (s.dovuto * 0); // usa dovuto direttamente
  const saldo = s.residuo;
  const saldoColor = saldo > 0 ? 'var(--color-error)' : saldo < 0 ? 'var(--color-success)' : 'var(--color-text)';
  const saldoLabel = saldo > 0 ? 'DEBITO' : saldo < 0 ? 'CREDITO' : 'IN PARI';
  document.getElementById('dettaglioRiepilogo').innerHTML = `
    <div class="dettaglio-stat-card">
      <div class="dettaglio-stat-label">Resid. prec.</div>
      <div class="dettaglio-stat-val" style="font-size:var(--text-sm)">${formatEur(s.residuo_iniziale)}</div>
    </div>
    <div class="dettaglio-stat-card">
      <div class="dettaglio-stat-label">Dovuto</div>
      <div class="dettaglio-stat-val">${formatEur(s.dovuto)}</div>
    </div>
    <div class="dettaglio-stat-card">
      <div class="dettaglio-stat-label">Pagato</div>
      <div class="dettaglio-stat-val" style="color:var(--color-success)">${formatEur(s.pagato)}</div>
    </div>
    ${s.abbuoni || s.addebiti ? `
    <div class="dettaglio-stat-card">
      <div class="dettaglio-stat-label">Arrotondamenti</div>
      <div class="dettaglio-stat-val" style="font-size:var(--text-sm)">${formatEur(s.abbuoni - s.addebiti)}</div>
    </div>` : ''}
    <div class="dettaglio-stat-card" style="border-left:2px solid var(--color-border);padding-left:var(--space-3)">
      <div class="dettaglio-stat-label">Saldo</div>
      <div class="dettaglio-stat-val" style="color:${saldoColor}">${formatEur(Math.abs(saldo))}</div>
      <div style="font-size:9px;font-weight:700;color:${saldoColor};margin-top:2px">${saldoLabel}</div>
    </div>
  `;
}

function _renderDetPratiche(list) {
  const el = document.getElementById('dettaglioPraticheBody');
  if (!list.length) {
    el.innerHTML = `<p style="color:var(--color-text-muted);font-size:var(--text-sm);padding:var(--space-3) 0">Nessuna pratica per il ${currentDetAnno}.</p>`;
    return;
  }
  const byMese = {};
  list.forEach(p => {
    if (!byMese[p.mese]) byMese[p.mese] = [];
    byMese[p.mese].push(p);
  });
  const mesiOrd = Object.keys(byMese).map(Number).sort((a,b) => b - a);
  el.innerHTML = mesiOrd.map(m => {
    const righe = byMese[m];
    const tot = righe.reduce((s, p) => s + (p.importo || 0), 0);
    const rows = righe.map(p => {
      const tipoClass = p.tipo === 'richiesta' ? 'richiesta' :
                        (p.tipo||'').includes('variabil') ? 'variabile' : 'fisso';
      const tipoLabel = p.tipo === 'richiesta' ? 'A Richiesta' :
                        (p.tipo||'').includes('variabil') ? 'Variabile' : 'Costo Fisso';
      const mg = p.macrogruppo_nome ? `<span style="color:var(--color-text-muted)"> · ${p.macrogruppo_nome}</span>` : '';
      const dettaglio = p.quantita && p.prezzo
        ? `${p.nome}${mg} &nbsp;<span style="color:var(--color-text-faint)">${p.quantita} × ${formatEur(p.prezzo)}</span>`
        : `${p.nome}${mg}`;
      const esente = p.esente_iva ? `<span class="badge-tipo esente">ESENTE IVA</span>` : '';
      return `<tr>
        <td><span class="badge-tipo ${tipoClass}">${tipoLabel}</span>${esente}</td>
        <td>${dettaglio}</td>
        <td style="text-align:right;font-variant-numeric:tabular-nums">${formatEur(p.importo)}</td>
        <td style="text-align:center">
          <button class="btn btn-icon btn-ghost" style="color:var(--color-error);font-size:12px"
            onclick="deletePraticaDet(${p.id})">🗑</button>
        </td>
      </tr>`;
    }).join('');
    return `
      <div class="pratiche-mese-card">
        <div class="pratiche-mese-hdr" onclick="this.nextElementSibling.classList.toggle('open');this.querySelector('.acc-icon').textContent=this.nextElementSibling.classList.contains('open')?'▲':'▼'">
          <span class="pratiche-mese-nome">${MESI_NOMI_DET[m]}</span>
          <span style="display:flex;align-items:center;gap:var(--space-3)">
            <span class="pratiche-mese-tot">${formatEur(tot)}</span>
            <span class="acc-icon" style="font-size:10px;color:var(--color-text-faint)">▼</span>
          </span>
        </div>
        <div class="pratiche-mese-body">
          <table class="pratiche-table">
            <thead><tr>
              <th>Tipo</th><th>Dettaglio</th>
              <th style="text-align:right">Importo</th><th></th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`;
  }).join('');
}

async function deletePraticaDet(id) {
  if (!confirm('Eliminare questa pratica?')) return;
  try {
    await api(`/api/pratiche/${id}`, 'DELETE');
    toast('Pratica eliminata', 'success');
    const [stats, pratiche] = await Promise.all([
      api(`/api/stats/ditta/${currentDetId}?anno=${currentDetAnno}`),
      api(`/api/pratiche?ditta_id=${currentDetId}&anno=${currentDetAnno}`),
    ]);
    _renderDetRiepilogo(stats);
    _renderDetPratiche(pratiche);
    loadDitte();
  } catch(e) { toast('Errore: ' + e.message, 'error'); }
}

function _renderDetArrot(list) {
  const el = document.getElementById('dettaglioArrotBody');
  if (!list.length) {
    el.innerHTML = `<p style="color:var(--color-text-muted);font-size:var(--text-sm);padding:var(--space-2) 0">Nessun arrotondamento.</p>`;
    return;
  }
  const rows = list.map(a => {
    const isAbbuono = a.tipo === 'abbuono';
    const segno = isAbbuono ? '+' : '-';
    const col   = isAbbuono ? 'var(--color-success)' : 'var(--color-error)';
    return `<tr>
      <td>${a.data ? a.data.slice(0,10).split('-').reverse().join('/') : '—'}</td>
      <td>${a.note || '—'}</td>
      <td style="text-align:right;font-variant-numeric:tabular-nums;color:${col};font-weight:600">
        ${segno}${formatEur(a.importo)}</td>
      <td style="text-align:center">
        <button class="btn btn-icon btn-ghost" style="color:var(--color-error);font-size:12px"
          onclick="deleteArrotDet(${a.id})">🗑</button>
      </td>
    </tr>`;
  }).join('');
  el.innerHTML = `<div class="dettaglio-mini-table-wrap">
    <table class="dettaglio-mini-table">
      <thead><tr><th>Data</th><th>Note</th><th style="text-align:right">Importo</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

async function deleteArrotDet(id) {
  if (!confirm('Eliminare questo arrotondamento?')) return;
  try {
    await api(`/api/arrotondamenti/${id}`, 'DELETE');
    toast('Arrotondamento eliminato', 'success');
    const arrot = await api(`/api/arrotondamenti?ditta_id=${currentDetId}`);
    _renderDetArrot(arrot);
    const stats = await api(`/api/stats/ditta/${currentDetId}?anno=${currentDetAnno}`);
    _renderDetRiepilogo(stats);
    loadDitte();
  } catch(e) { toast('Errore: ' + e.message, 'error'); }
}

function _renderDetPag(list) {
  const el = document.getElementById('dettaglioPagBody');
  if (!list.length) {
    el.innerHTML = `<p style="color:var(--color-text-muted);font-size:var(--text-sm);padding:var(--space-2) 0">Nessun pagamento per il ${currentDetAnno}.</p>`;
    return;
  }
  const rows = list.map(p => `<tr>
    <td>${p.data ? p.data.slice(0,10).split('-').reverse().join('/') : '—'}</td>
    <td>${p.metodo || '—'}</td>
    <td>${p.note || '—'}</td>
    <td style="text-align:right;font-variant-numeric:tabular-nums;color:var(--color-success);font-weight:600">${formatEur(p.importo)}</td>
  </tr>`).join('');
  el.innerHTML = `<div class="dettaglio-mini-table-wrap">
    <table class="dettaglio-mini-table">
      <thead><tr><th>Data</th><th>Metodo</th><th>Note</th><th style="text-align:right">Importo</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

/* ── Bottoni azioni header dettaglio ─────────────────────────────────────── */

document.getElementById('btnDetModifica')?.addEventListener('click', () => {
  closeModal('modalDettaglioCliente');
  editDitta(currentDetId);
});

document.getElementById('btnDetDate')?.addEventListener('click', () => {
  openModal('modalDateGestione');
});

document.getElementById('btnDetArchivia')?.addEventListener('click', async () => {
  const archiviato = document.getElementById('btnDetArchivia').dataset.archiviato === '1';
  const url = `/api/ditte/${currentDetId}/${archiviato ? 'ripristina' : 'archivia'}`;
  if (!archiviato && !confirm(`Archiviare il cliente?`)) return;
  try {
    await api(url, 'PATCH');
    toast(archiviato ? 'Cliente ripristinato' : 'Cliente archiviato', 'success');
    const d = await api(`/api/ditte/${currentDetId}`);
    _renderDetHeader(d);
    loadDitte();
  } catch(e) { toast('Errore: ' + e.message, 'error'); }
});

document.getElementById('btnDetElimina')?.addEventListener('click', async () => {
  if (!confirm('Eliminare definitivamente questo cliente? Verranno eliminate anche tutte le pratiche e i pagamenti associati.')) return;
  try {
    await api(`/api/ditte/${currentDetId}`, 'DELETE');
    closeModal('modalDettaglioCliente');
    toast('Cliente eliminato', 'success');
    loadDitte(); loadStats();
  } catch(e) { toast('Errore: ' + e.message, 'error'); }
});

/* Annotazioni — salvataggio al blur */
document.getElementById('dettaglioAnnotazioni')?.addEventListener('blur', async () => {
  const val = document.getElementById('dettaglioAnnotazioni').value;
  try {
    await api(`/api/ditte/${currentDetId}/annotazioni`, 'PATCH', { annotazioni: val });
  } catch(e) { /* silent */ }
});

/* ── Modal Date Gestione ─────────────────────────────────────────────────── */
document.getElementById('btnSalvaDateGestione')?.addEventListener('click', async () => {
  const body = {
    inizio_paghe:        document.getElementById('dg_inizio_paghe').value || null,
    fine_paghe:          document.getElementById('dg_fine_paghe').value || null,
    inizio_contabilita:  document.getElementById('dg_inizio_contabilita').value || null,
    fine_contabilita:    document.getElementById('dg_fine_contabilita').value || null,
  };
  try {
    await api(`/api/ditte/${currentDetId}/date-gestione`, 'PATCH', body);
    toast('Date aggiornate', 'success');
    closeModal('modalDateGestione');
    const d = await api(`/api/ditte/${currentDetId}`);
    _renderDetHeader(d);
    loadDitte();
  } catch(e) { toast('Errore: ' + e.message, 'error'); }
});

/* ── Modal Arrotondamento ────────────────────────────────────────────────── */
document.getElementById('modalArrotondamento')?.addEventListener('transitionend', () => {
  const today = new Date().toISOString().slice(0,10);
  if (!document.getElementById('arrot_data').value)
    document.getElementById('arrot_data').value = today;
});

['arrot_importo','arrot_tipo'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', _aggiornAAnteprimaArrot);
});

async function _aggiornAAnteprimaArrot() {
  const imp  = parseFloat(document.getElementById('arrot_importo').value) || 0;
  const tipo = document.getElementById('arrot_tipo').value;
  if (!imp || !currentDetId) { document.getElementById('arrotAnteprima').style.display = 'none'; return; }
  try {
    const res = await api(`/api/arrotondamenti/anteprima?ditta_id=${currentDetId}&importo=${imp}&tipo=${tipo}`);
    const box = document.getElementById('arrotAnteprima');
    box.style.display = '';
    box.innerHTML = `Residuo attuale: <strong>${formatEur(res.residuo_attuale)}</strong>
      &nbsp;→&nbsp; Nuovo residuo: <strong>${formatEur(res.nuovo_residuo)}</strong>`;
  } catch(e) { /* silent */ }
}

document.getElementById('btnSalvaArrotondamento')?.addEventListener('click', async () => {
  const data   = document.getElementById('arrot_data').value;
  const tipo   = document.getElementById('arrot_tipo').value;
  const imp    = parseFloat(document.getElementById('arrot_importo').value);
  const note   = document.getElementById('arrot_note').value;
  if (!data || !imp) { toast('Compila data e importo', 'error'); return; }
  try {
    await api('/api/arrotondamenti', 'POST', { ditta_id: currentDetId, data, tipo, importo: imp, note });
    toast('Arrotondamento salvato', 'success');
    closeModal('modalArrotondamento');
    document.getElementById('arrot_importo').value = '';
    document.getElementById('arrot_note').value = '';
    const [arrot, stats] = await Promise.all([
      api(`/api/arrotondamenti?ditta_id=${currentDetId}`),
      api(`/api/stats/ditta/${currentDetId}?anno=${currentDetAnno}`),
    ]);
    _renderDetArrot(arrot);
    _renderDetRiepilogo(stats);
    loadDitte();
  } catch(e) { toast('Errore: ' + e.message, 'error'); }
});

/* ── Modal Inserisci Pratiche ────────────────────────────────────────────── */
let prRigheData = [];

function _buildPrAnnoSel() {
  const sel = document.getElementById('pr_anno');
  const now = new Date().getFullYear();
  sel.innerHTML = '';
  for (let y = now + 1; y >= now - 3; y--)
    sel.innerHTML += `<option value="${y}"${y===currentDetAnno?' selected':''}>${y}</option>`;
  document.getElementById('pr_mese').value = String(new Date().getMonth() + 1);
}

function _renderPrRighe() {
  const el = document.getElementById('prRighe');
  if (!prRigheData.length) { el.innerHTML = ''; return; }
  el.innerHTML = prRigheData.map((r, i) => `
    <div style="display:grid;grid-template-columns:130px 1fr 90px 120px 32px;gap:var(--space-2);align-items:center;margin-bottom:var(--space-2)">
      <input type="date" value="${r.data}" oninput="prRigheData[${i}].data=this.value" style="font-size:var(--text-xs);padding:4px 6px;border:1px solid var(--color-border);border-radius:var(--radius-sm);background:var(--color-surface);color:var(--color-text)" />
      <input type="text" value="${r.descrizione}" placeholder="Descrizione" oninput="prRigheData[${i}].descrizione=this.value" style="font-size:var(--text-xs);padding:4px 6px;border:1px solid var(--color-border);border-radius:var(--radius-sm);background:var(--color-surface);color:var(--color-text)" />
      <input type="number" value="${r.costo}" placeholder="€" min="0" step="0.01" oninput="prRigheData[${i}].costo=parseFloat(this.value)||0" style="font-size:var(--text-xs);padding:4px 6px;border:1px solid var(--color-border);border-radius:var(--radius-sm);background:var(--color-surface);color:var(--color-text)" />
      <label class="filter-check" style="white-space:nowrap">
        <input type="checkbox" ${r.esente ? 'checked' : ''} onchange="prRigheData[${i}].esente=this.checked" />
        Esente IVA
      </label>
      <button class="btn btn-icon btn-ghost" style="color:var(--color-error)" onclick="prRigheData.splice(${i},1);_renderPrRighe()">✕</button>
    </div>`).join('');
}

document.getElementById('btnDetPratiche')?.addEventListener('click', () => {
  prRigheData = [];
  _buildPrAnnoSel();
  _renderPrRighe();
  openModal('modalInserisciPratiche');
});

document.getElementById('btnAddPraticaRichiesta')?.addEventListener('click', () => {
  const today = new Date().toISOString().slice(0,10);
  prRigheData.push({ data: today, descrizione: '', costo: 0, esente: false });
  _renderPrRighe();
});

document.getElementById('btnSalvaPratiche')?.addEventListener('click', async () => {
  const anno = +document.getElementById('pr_anno').value;
  const mese = +document.getElementById('pr_mese').value;
  const valide = prRigheData.filter(r => r.descrizione && r.costo > 0);
  if (!valide.length) { toast('Aggiungi almeno una pratica con descrizione e costo', 'error'); return; }
  try {
    await Promise.all(valide.map(r => api('/api/pratiche', 'POST', {
      ditta_id: currentDetId, anno, mese,
      tipo: 'richiesta',
      nome: r.descrizione,
      quantita: 1,
      prezzo: r.costo,
      importo: r.costo,
      esente_iva: r.esente ? 1 : 0,
      data_esecuzione: r.data,
    })));
    toast('Pratiche salvate', 'success');
    closeModal('modalInserisciPratiche');
    const [stats, pratiche] = await Promise.all([
      api(`/api/stats/ditta/${currentDetId}?anno=${currentDetAnno}`),
      api(`/api/pratiche?ditta_id=${currentDetId}&anno=${currentDetAnno}`),
    ]);
    _renderDetRiepilogo(stats);
    _renderDetPratiche(pratiche);
    loadDitte();
  } catch(e) { toast('Errore: ' + e.message, 'error'); }
});

/* ── Bottoni strumenti top-right dettaglio ───────────────────────────────── */
document.getElementById('btnDetEstratto')?.addEventListener('click', () => {
  _openEstrattoPdf();
});

document.getElementById('btnDetSollecito')?.addEventListener('click', () => {
  _openSollecito();
});

document.getElementById('btnDetArrotondamento')?.addEventListener('click', () => {
  const today = new Date().toISOString().slice(0,10);
  document.getElementById('arrot_data').value = today;
  document.getElementById('arrot_importo').value = '';
  document.getElementById('arrot_note').value = '';
  document.getElementById('arrotAnteprima').style.display = 'none';
  openModal('modalArrotondamento');
});

document.getElementById('btnDetFattura')?.addEventListener('click', () => {
  _openFattura();
});
document.getElementById('btnDetPrevisionale')?.addEventListener('click', () => {
  _openPrevisionale();
});

/* ══════════════════════════════════════════════════════════════════════════
   BLOCCO 4 — STRUMENTI TRASVERSALI
══════════════════════════════════════════════════════════════════════════ */

/* ── 4.1 Importa Excel ───────────────────────────────────────────────────── */
document.getElementById('btnImportaExcel')?.addEventListener('click', () => {
  document.getElementById('importFile').value = '';
  document.getElementById('importPreview').style.display = 'none';
  document.getElementById('btnImportaEsegui').disabled = true;
  _populateTariffSelect('importTariffario');
  openModal('modalImportaExcel');
});

let _importPreviewData = null;
document.getElementById('importFile')?.addEventListener('change', async () => {
  const file = document.getElementById('importFile').files[0];
  if (!file) return;
  const fd = new FormData();
  fd.append('file', file);
  try {
    const res = await fetch('/api/strumenti/import/preview', { method: 'POST', body: fd });
    const data = await res.json();
    _importPreviewData = data;
    const box = document.getElementById('importPreviewContent');
    const ok  = (data.ok || []).length;
    const err = (data.errori || []).length;
    box.innerHTML = `<strong style="color:var(--color-success)">✅ ${ok} clienti pronti per l'import</strong>
      ${err ? `<br><strong style="color:var(--color-error)">⚠️ ${err} righe con errori (saltate):</strong>
        <ul style="margin:var(--space-1) 0 0 var(--space-4)">${(data.errori||[]).map(e=>`<li>${e}</li>`).join('')}</ul>` : ''}`;
    document.getElementById('importPreview').style.display = '';
    document.getElementById('btnImportaEsegui').disabled = !ok;
  } catch(e) { toast('Errore anteprima: ' + e.message, 'error'); }
});

document.getElementById('btnImportaEsegui')?.addEventListener('click', async () => {
  const file = document.getElementById('importFile').files[0];
  const tariffId = document.getElementById('importTariffario').value || null;
  if (!file) return;
  const fd = new FormData();
  fd.append('file', file);
  if (tariffId) fd.append('tariffario_id', tariffId);
  try {
    const res = await fetch('/api/strumenti/import/esegui', { method: 'POST', body: fd });
    const data = await res.json();
    toast(`Importati ${data.importati || 0} clienti`, 'success');
    closeModal('modalImportaExcel');
    loadDitte();
  } catch(e) { toast('Errore import: ' + e.message, 'error'); }
});

/* ── 4.2 Costi Massivi ───────────────────────────────────────────────────── */
document.getElementById('btnCostiMassivi')?.addEventListener('click', () => {
  const now = new Date();
  document.getElementById('cm_anno').value = now.getFullYear();
  document.getElementById('cm_mese').value = now.getMonth() + 1;
  document.getElementById('cm_qta').value = 1;
  document.getElementById('cm_descrizione').value = '';
  document.getElementById('cm_importo').value = '';
  document.getElementById('cm_esente_iva').checked = false;
  document.getElementById('cm_sel_tutti').checked = true;
  document.getElementById('cm_tariff_sel_wrap').style.display = 'none';
  document.getElementById('cm_manuale_wrap').style.display = 'none';
  document.getElementById('cmAnteprima').textContent = 'Clienti selezionati: —';
  _populateTariffSelect('cm_tariff_sel');
  _loadCmManualeList();
  openModal('modalCostiMassivi');
});

async function _loadCmManualeList() {
  const list = allDitte.filter(d => !d.archiviato);
  document.getElementById('cm_manuale_list').innerHTML = list.map(d =>
    `<label class="filter-check" style="padding:2px 0">
      <input type="checkbox" class="cm-check" value="${d.id}" />
      ${d.ragione_sociale}${d.tariffario_nome ? ` <span style="color:var(--color-text-faint)">(${d.tariffario_nome})</span>` : ''}
    </label>`
  ).join('');
}

document.querySelectorAll('input[name="cm_sel"]').forEach(r => {
  r.addEventListener('change', () => {
    document.getElementById('cm_tariff_sel_wrap').style.display = r.value === 'tariffario' ? '' : 'none';
    document.getElementById('cm_manuale_wrap').style.display   = r.value === 'manuale' ? '' : 'none';
    _updateCmAnteprima();
  });
});

['cm_importo','cm_qta','cm_tariff_sel'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', _updateCmAnteprima);
});

function _updateCmAnteprima() {
  const sel   = document.querySelector('input[name="cm_sel"]:checked')?.value || 'tutti';
  const imp   = parseFloat(document.getElementById('cm_importo').value) || 0;
  const qta   = parseInt(document.getElementById('cm_qta').value) || 1;
  let n = 0;
  if (sel === 'tutti')      n = allDitte.filter(d => !d.archiviato).length;
  else if (sel === 'tariffario') {
    const tid = document.getElementById('cm_tariff_sel').value;
    n = tid ? allDitte.filter(d => !d.archiviato && String(d.tariffario_id) === tid).length : 0;
  } else {
    n = document.querySelectorAll('.cm-check:checked').length;
  }
  const tot = formatEur(imp * qta * n);
  document.getElementById('cmAnteprima').textContent = `Clienti selezionati: ${n}  ·  Totale: ${tot}`;
}
document.addEventListener('change', e => {
  if (e.target.classList.contains('cm-check')) _updateCmAnteprima();
});

document.getElementById('btnApplicaCostiMassivi')?.addEventListener('click', async () => {
  const descrizione = document.getElementById('cm_descrizione').value.trim();
  const importo     = parseFloat(document.getElementById('cm_importo').value);
  const qta         = parseInt(document.getElementById('cm_qta').value) || 1;
  const mese        = +document.getElementById('cm_mese').value;
  const anno        = +document.getElementById('cm_anno').value;
  const esente      = document.getElementById('cm_esente_iva').checked;
  if (!descrizione || !importo) { toast('Compila descrizione e importo', 'error'); return; }
  const sel  = document.querySelector('input[name="cm_sel"]:checked')?.value || 'tutti';
  const body = { descrizione, importo, qta, mese, anno, esente_iva: esente ? 1 : 0, selezione: sel };
  if (sel === 'tariffario') body.tariffario_id = document.getElementById('cm_tariff_sel').value;
  if (sel === 'manuale')    body.ditta_ids = [...document.querySelectorAll('.cm-check:checked')].map(c => +c.value);
  try {
    const res = await api('/api/strumenti/costi-massivi', 'POST', body);
    toast(`Costo applicato a ${res.n_clienti || '?'} clienti`, 'success');
    closeModal('modalCostiMassivi');
    loadDitte();
  } catch(e) { toast('Errore: ' + e.message, 'error'); }
});

/* ── 4.3 Inserimento Costi Variabili ─────────────────────────────────────── */
let ivTabData = null;

document.getElementById('btnInserimentoCostiVariabili')?.addEventListener('click', () => {
  const now = new Date();
  _buildAnnoSel('iv_anno', now.getFullYear());
  document.getElementById('iv_mese').value = now.getMonth() + 1;
  ivTabData = null;
  document.getElementById('ivTabella').innerHTML =
    '<p style="color:var(--color-text-muted);font-size:var(--text-sm)">Seleziona anno e mese e clicca "Carica".</p>';
  openModal('modalInserimentoVariabili');
  _loadIvTabella();
});

['iv_anno','iv_mese'].forEach(id =>
  document.getElementById(id)?.addEventListener('change', _loadIvTabella));

async function _loadIvTabella() {
  const anno = document.getElementById('iv_anno').value;
  const mese = document.getElementById('iv_mese').value;
  if (!anno || !mese) return;
  try {
    ivTabData = await api(`/api/strumenti/variabili/tabella?anno=${anno}&mese=${mese}`);
    _renderIvTabella();
  } catch(e) { toast('Errore caricamento tabella: ' + e.message, 'error'); }
}

function _renderIvTabella() {
  const { colonne, righe } = ivTabData;
  const el = document.getElementById('ivTabella');
  if (!colonne.length) {
    el.innerHTML = '<p style="color:var(--color-text-muted);font-size:var(--text-sm)">Nessuna voce variabile disponibile per questo mese.</p>';
    return;
  }
  const ths = colonne.map(c =>
    `<th title="${c.mg_nome}">${c.nome}</th>`).join('');
  const trs = righe.map(r => {
    const celle = colonne.map(c => {
      const cella = r.celle[c.voce_id];
      if (!cella || !cella.applicabile)
        return `<td><span class="variabili-cell-na">×</span></td>`;
      return `<td><input type="number" min="0" step="1" value="${cella.qta ?? 0}"
        data-ditta="${r.ditta_id}" data-voce="${c.voce_id}"
        class="iv-input" /></td>`;
    }).join('');
    return `<tr><td class="col-cliente">${r.ditta_nome}</td>${celle}</tr>`;
  }).join('');
  el.innerHTML = `<table class="variabili-table">
    <thead><tr><th>Cliente</th>${ths}</tr></thead>
    <tbody>${trs}</tbody>
  </table>`;
}

document.getElementById('btnCaricaVariabili')?.addEventListener('click', async () => {
  const anno = +document.getElementById('iv_anno').value;
  const mese = +document.getElementById('iv_mese').value;
  const inputs = [...document.querySelectorAll('.iv-input')];
  const righe = inputs
    .filter(i => parseFloat(i.value) > 0)
    .map(i => ({ ditta_id: +i.dataset.ditta, voce_id: +i.dataset.voce, qta: +i.value }));
  if (!righe.length) { toast('Nessuna quantità inserita', 'error'); return; }
  try {
    const res = await api('/api/strumenti/variabili/carica', 'POST', { anno, mese, righe });
    toast(`Costi variabili caricati (${res.aggiunte || righe.length} voci)`, 'success');
    closeModal('modalInserimentoVariabili');
    loadDitte();
  } catch(e) { toast('Errore: ' + e.message, 'error'); }
});

/* ── 4.4 Contabilizza Costi Fissi ────────────────────────────────────────── */
let ccfPreviewData = null;

document.getElementById('btnContabilizzaCostiFissi')?.addEventListener('click', () => {
  const now = new Date();
  _buildAnnoSel('ccf_anno', now.getFullYear());
  document.getElementById('ccf_mese_da').value = now.getMonth() + 1;
  document.getElementById('ccf_mese_a').value  = now.getMonth() + 1;
  ccfPreviewData = null;
  document.getElementById('ccfRiepilogo').style.display = 'none';
  document.getElementById('ccfTabella').innerHTML = '';
  document.getElementById('btnContabilizzaEsegui').disabled = true;
  _populateCcfDitta();
  openModal('modalContabilizzaCostiFissi');
});

async function _populateCcfDitta() {
  const sel = document.getElementById('ccf_ditta');
  sel.innerHTML = '<option value="">— Tutti i clienti —</option>' +
    allDitte.filter(d => !d.archiviato).map(d =>
      `<option value="${d.id}">${d.ragione_sociale}</option>`).join('');
}

document.getElementById('btnCcfPreview')?.addEventListener('click', async () => {
  const anno    = document.getElementById('ccf_anno').value;
  const meseDa  = document.getElementById('ccf_mese_da').value;
  const meseA   = document.getElementById('ccf_mese_a').value;
  const dittaId = document.getElementById('ccf_ditta').value;
  try {
    const qs = `anno=${anno}&mese_da=${meseDa}&mese_a=${meseA}${dittaId?`&ditta_id=${dittaId}`:''}`;
    ccfPreviewData = await api(`/api/strumenti/contabilizza/preview?${qs}`);
    _renderCcfPreview();
    document.getElementById('btnContabilizzaEsegui').disabled = !ccfPreviewData.tot_da_fare;
  } catch(e) { toast('Errore anteprima: ' + e.message, 'error'); }
});

function _renderCcfPreview() {
  const { righe, tot_da_fare, tot_gia_ok, tot_importo } = ccfPreviewData;
  const riep = document.getElementById('ccfRiepilogo');
  riep.style.display = '';
  riep.innerHTML = `Voci da contabilizzare: <strong>${tot_da_fare}</strong>
    &nbsp;·&nbsp; Già contabilizzate: <strong>${tot_gia_ok}</strong>
    &nbsp;·&nbsp; Totale da fare: <strong>${formatEur(tot_importo)}</strong>`;

  const rows = righe.map(r => {
    const statoHtml = r.stato === 'ok'
      ? `<span class="ccf-badge-ok">✓ Già contabilizzato</span>`
      : `<span class="ccf-badge-da">Da contabilizzare</span>`;
    return `<tr class="${r.stato === 'ok' ? 'ccf-row-ok' : ''}">
      <td>${r.ditta_nome}</td>
      <td>${r.voce_nome}</td>
      <td>${r.mese_nome} ${r.anno}</td>
      <td>${r.qta}</td>
      <td style="text-align:right">${formatEur(r.prezzo)}</td>
      <td style="text-align:right">${formatEur(r.totale)}</td>
      <td>${statoHtml}</td>
    </tr>`;
  }).join('');

  document.getElementById('ccfTabella').innerHTML = `
    <table class="ccf-table">
      <thead><tr>
        <th>Cliente</th><th>Voce</th><th>Mese</th>
        <th>Qta</th><th style="text-align:right">Prezzo</th>
        <th style="text-align:right">Totale</th><th>Stato</th>
      </tr></thead>
      <tbody>${rows || '<tr><td colspan="7" style="text-align:center;color:var(--color-text-muted)">Nessuna voce trovata</td></tr>'}</tbody>
    </table>`;
}

document.getElementById('btnContabilizzaEsegui')?.addEventListener('click', async () => {
  const anno   = +document.getElementById('ccf_anno').value;
  const meseDa = +document.getElementById('ccf_mese_da').value;
  const meseA  = +document.getElementById('ccf_mese_a').value;
  const dittaId = document.getElementById('ccf_ditta').value || null;
  try {
    const res = await api('/api/strumenti/contabilizza', 'POST',
      { anno, mese_da: meseDa, mese_a: meseA, ...(dittaId ? { ditta_id: +dittaId } : {}) });
    toast(`Contabilizzate ${res.aggiunte} voci (${res.saltate} già presenti)`, 'success');
    closeModal('modalContabilizzaCostiFissi');
    loadDitte();
  } catch(e) { toast('Errore: ' + e.message, 'error'); }
});

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function _populateTariffSelect(selId) {
  const sel = document.getElementById(selId);
  if (!sel) return;
  const cur = sel.value;
  sel.innerHTML = '<option value="">— Nessun tariffario —</option>' +
    tariffariGlobali.map(t =>
      `<option value="${t.id}"${String(t.id)===cur?' selected':''}>${t.nome}</option>`).join('');
}

function _buildAnnoSel(selId, defaultAnno) {
  const sel = document.getElementById(selId);
  if (!sel) return;
  const now = new Date().getFullYear();
  sel.innerHTML = '';
  for (let y = now + 2; y >= now - 5; y--)
    sel.innerHTML += `<option value="${y}"${y===defaultAnno?' selected':''}>${y}</option>`;
}

/* ══════════════════════════════════════════════════════════════════════════
   BLOCCO 5 — FATTURA, ESTRATTO, PREVISIONALE, SOLLECITO
══════════════════════════════════════════════════════════════════════════ */

/* ── 5.2 Fattura ─────────────────────────────────────────────────────────── */
let fatRighe = [];

function _openFattura() {
  const anno = currentDetAnno;
  document.getElementById('fatturaTitle').textContent = `Fattura — ${anno}`;
  _buildAnnoSel('fat_anno', anno);
  _buildAnnoSel('fat_da_anno', anno);
  _buildAnnoSel('fat_a_anno', anno);
  const now = new Date();
  document.getElementById('fat_da_mese').value = 1;
  document.getElementById('fat_a_mese').value = now.getMonth() + 1;
  document.getElementById('fat_note').value = '';
  fatRighe = [];
  _renderFatRighe();
  _loadFatStorico();
  openModal('modalFattura');
}

function _renderFatRighe() {
  const tbody = document.getElementById('fatRigheTbody');
  if (!fatRighe.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--color-text-muted);padding:var(--space-3)">Nessuna riga. Importa da pratiche o aggiungi manualmente.</td></tr>';
    _updateFatTotali();
    return;
  }
  tbody.innerHTML = fatRighe.map((r, i) => `
    <tr>
      <td><input class="fat-riga-input" data-i="${i}" data-f="descrizione" value="${(r.descrizione||'').replace(/"/g,'&quot;')}" placeholder="Descrizione"></td>
      <td><input class="fat-riga-input" data-i="${i}" data-f="mese_label" value="${(r.mese_label||'').replace(/"/g,'&quot;')}" placeholder="Periodo" style="width:90px"></td>
      <td><input class="fat-riga-input" data-i="${i}" data-f="qta" type="number" min="0.01" step="0.01" value="${r.qta||1}" style="width:55px"></td>
      <td><input class="fat-riga-input" data-i="${i}" data-f="prezzo" type="number" min="0" step="0.01" value="${r.prezzo||0}" style="width:75px"></td>
      <td><select class="fat-riga-sel" data-i="${i}" style="width:65px">
        <option value="22"${!r.esente_iva?' selected':''}>22%</option>
        <option value="0"${r.esente_iva?' selected':''}>Esente</option>
      </select></td>
      <td style="text-align:right;font-weight:600;white-space:nowrap">${formatEur(r.totale||0)}</td>
      <td><button class="btn-icon" onclick="fatRemoveRiga(${i})">🗑</button></td>
    </tr>
  `).join('');

  tbody.querySelectorAll('.fat-riga-input').forEach(inp => {
    inp.addEventListener('change', () => {
      const i = +inp.dataset.i, f = inp.dataset.f;
      fatRighe[i][f] = inp.type === 'number' ? +inp.value : inp.value;
      if (f === 'qta' || f === 'prezzo') {
        fatRighe[i].totale = _round2(fatRighe[i].qta * fatRighe[i].prezzo);
      }
      _renderFatRighe();
    });
  });
  tbody.querySelectorAll('.fat-riga-sel').forEach(sel => {
    sel.addEventListener('change', () => {
      const i = +sel.dataset.i;
      fatRighe[i].esente_iva = sel.value === '0';
      fatRighe[i].aliquota_iva = +sel.value;
      _renderFatRighe();
    });
  });
  _updateFatTotali();
}

function fatRemoveRiga(i) {
  fatRighe.splice(i, 1);
  _renderFatRighe();
}

function _round2(v) { return Math.round(v * 100) / 100; }

function _updateFatTotali() {
  const imponibile = fatRighe.filter(r => !r.esente_iva).reduce((s, r) => s + (r.totale || 0), 0);
  const esente     = fatRighe.filter(r =>  r.esente_iva).reduce((s, r) => s + (r.totale || 0), 0);
  const iva        = _round2(imponibile * 0.22);
  const totale     = _round2(imponibile + iva + esente);
  document.getElementById('fatTotImponibile').textContent = formatEur(imponibile);
  document.getElementById('fatTotEsente').textContent     = formatEur(esente);
  document.getElementById('fatTotIva').textContent        = formatEur(iva);
  document.getElementById('fatTotTotale').textContent     = formatEur(totale);
}

async function _loadFatStorico() {
  const el = document.getElementById('fatStoricoList');
  el.innerHTML = '<p style="color:var(--color-text-muted)">Caricamento...</p>';
  try {
    const list = await api(`/api/ditte/${currentDetId}/fatture?anno=${currentDetAnno}`);
    if (!list.length) {
      el.innerHTML = '<p style="color:var(--color-text-muted)">Nessuna fattura per questo anno.</p>';
      return;
    }
    const STATI_LABEL = {
      bozza:     '🟡 Bozza',
      emessa:    '🔵 Emessa',
      inviata:   '📤 Inviata',
      incassata: '✅ Incassata',
      annullata: '❌ Annullata',
    };
    const STATI_SUCC = { bozza: 'emessa', emessa: 'inviata', inviata: 'incassata' };
    el.innerHTML = list.map(f => `
      <div class="fat-storico-row">
        <span class="fat-stato-badge fat-stato-${f.stato}">${STATI_LABEL[f.stato] || f.stato}</span>
        <span class="fat-numero">${f.numero}</span>
        <span class="fat-data">${f.data_emissione || ''}</span>
        <span class="fat-totale">${formatEur(f.totale)}</span>
        <div class="fat-storico-azioni">
          <button class="btn btn-ghost btn-sm" onclick="fatDownloadPdf(${f.id})">📄 PDF</button>
          ${STATI_SUCC[f.stato] ? `<button class="btn btn-ghost btn-sm" onclick="fatAvanzaStato(${f.id},'${f.stato}')">→ ${STATI_SUCC[f.stato]}</button>` : ''}
          ${f.stato === 'bozza' ? `<button class="btn btn-ghost btn-sm" style="color:var(--color-error)" onclick="fatAnnulla(${f.id})">Annulla</button>` : ''}
        </div>
      </div>
    `).join('');
  } catch(e) {
    el.innerHTML = `<p style="color:var(--color-danger, var(--color-error))">Errore: ${e.message}</p>`;
  }
}

async function fatDownloadPdf(fid) {
  try {
    const res = await fetch(`/api/ditte/${currentDetId}/fatture/${fid}/pdf`);
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || res.statusText); }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `fattura_${fid}.pdf`; a.click();
    URL.revokeObjectURL(url);
  } catch(e) { toast('Errore PDF: ' + e.message, 'error'); }
}

async function fatAvanzaStato(fid, statoCorrente) {
  const SUCC = { bozza: 'emessa', emessa: 'inviata', inviata: 'incassata' };
  const nuovoStato = SUCC[statoCorrente];
  if (!nuovoStato) return;
  try {
    await api(`/api/ditte/${currentDetId}/fatture/${fid}`, 'PUT', { stato: nuovoStato });
    toast(`Stato aggiornato → ${nuovoStato}`, 'success');
    _loadFatStorico();
  } catch(e) { toast('Errore: ' + e.message, 'error'); }
}

async function fatAnnulla(fid) {
  if (!confirm('Annullare questa fattura?')) return;
  try {
    await api(`/api/ditte/${currentDetId}/fatture/${fid}`, 'DELETE');
    toast('Fattura annullata', 'success');
    _loadFatStorico();
  } catch(e) { toast('Errore: ' + e.message, 'error'); }
}

document.getElementById('btnFatImportaPratiche')?.addEventListener('click', async () => {
  const daMese = +document.getElementById('fat_da_mese').value;
  const daAnno = +document.getElementById('fat_da_anno').value;
  const aMese  = +document.getElementById('fat_a_mese').value;
  const aAnno  = +document.getElementById('fat_a_anno').value;
  try {
    const righe = await api(
      `/api/ditte/${currentDetId}/fatture/importa-righe?da_anno=${daAnno}&da_mese=${daMese}&a_anno=${aAnno}&a_mese=${aMese}`
    );
    fatRighe = righe;
    _renderFatRighe();
    toast(`Importate ${righe.length} righe dalle pratiche`, 'success');
  } catch(e) { toast('Errore importazione: ' + e.message, 'error'); }
});

document.getElementById('btnFatAddRiga')?.addEventListener('click', () => {
  fatRighe.push({ descrizione: '', mese_label: '', qta: 1, prezzo: 0, totale: 0, esente_iva: false, aliquota_iva: 22 });
  _renderFatRighe();
});

async function _saveFattura(stato) {
  if (!fatRighe.length) { toast('Aggiungi almeno una riga', 'error'); return; }
  const anno = +document.getElementById('fat_anno').value;
  const tipo = document.getElementById('fat_tipo').value;
  const body = {
    anno, tipo, stato,
    periodo_da_anno: +document.getElementById('fat_da_anno').value,
    periodo_da_mese: +document.getElementById('fat_da_mese').value,
    periodo_a_anno:  +document.getElementById('fat_a_anno').value,
    periodo_a_mese:  +document.getElementById('fat_a_mese').value,
    note:   document.getElementById('fat_note').value,
    righe:  fatRighe,
  };
  try {
    const res = await api(`/api/ditte/${currentDetId}/fatture`, 'POST', body);
    toast(`Fattura ${res.numero} salvata (${stato})`, 'success');
    fatRighe = [];
    _renderFatRighe();
    _loadFatStorico();
  } catch(e) { toast('Errore salvataggio: ' + e.message, 'error'); }
}

document.getElementById('btnFatSalvaBozza')?.addEventListener('click', () => _saveFattura('bozza'));
document.getElementById('btnFatEmetti')?.addEventListener('click', () => _saveFattura('emessa'));

/* ── 5.3 Estratto PDF ─────────────────────────────────────────────────────── */
function _openEstrattoPdf() {
  _buildAnnoSel('est_anno',       currentDetAnno);
  _buildAnnoSel('est_anno_mese',  currentDetAnno);
  _buildAnnoSel('est_anno_range', currentDetAnno);
  // reset to defaults
  const radioAnno = document.querySelector('input[name="est_periodo"][value="anno"]');
  if (radioAnno) radioAnno.checked = true;
  _updateEstPeriodoFields();
  openModal('modalEstrattoPdf');
}

function _updateEstPeriodoFields() {
  const periodo = document.querySelector('input[name="est_periodo"]:checked')?.value || 'anno';
  document.getElementById('estPeriodoAnno').style.display  = periodo === 'anno'    ? '' : 'none';
  document.getElementById('estPeriodoMese').style.display  = periodo === 'mese'    ? '' : 'none';
  document.getElementById('estPeriodoRange').style.display = periodo === 'range'   ? '' : 'none';
}

document.querySelectorAll('input[name="est_periodo"]').forEach(r => {
  r.addEventListener('change', _updateEstPeriodoFields);
});

document.getElementById('btnEstGeneraPdf')?.addEventListener('click', async () => {
  const formato  = document.querySelector('input[name="est_formato"]:checked')?.value || 'completo';
  const periodo  = document.querySelector('input[name="est_periodo"]:checked')?.value || 'anno';
  const includi_tariffario = document.getElementById('est_includi_tariffario')?.checked || false;

  const body = { formato, periodo, includi_tariffario };
  if (periodo === 'anno') {
    body.anno = +document.getElementById('est_anno').value;
  } else if (periodo === 'mese') {
    body.anno = +document.getElementById('est_anno_mese').value;
    body.mese = +document.getElementById('est_mese').value;
  } else if (periodo === 'range') {
    body.anno    = +document.getElementById('est_anno_range').value;
    body.da_mese = +document.getElementById('est_da_mese').value;
    body.a_mese  = +document.getElementById('est_a_mese').value;
  }
  // storico: nessun parametro extra

  try {
    const res = await fetch(`/api/ditte/${currentDetId}/estratto/pdf`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || res.statusText);
    }
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `estratto_${currentDetId}_${body.anno || 'storico'}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    closeModal('modalEstrattoPdf');
    toast('Estratto PDF generato', 'success');
  } catch(e) { toast('Errore PDF: ' + e.message, 'error'); }
});

/* ── 5.4 Previsionale ─────────────────────────────────────────────────────── */
function _openPrevisionale() {
  _buildAnnoSel('prev_anno', currentDetAnno);
  _loadPrevisionale();
  openModal('modalPrevisionale');
}

async function _loadPrevisionale() {
  const anno = +document.getElementById('prev_anno').value || currentDetAnno;
  const el   = document.getElementById('prevTabella');
  el.innerHTML = '<p style="color:var(--color-text-muted)">Caricamento...</p>';
  try {
    const data = await api(`/api/ditte/${currentDetId}/previsionale/${anno}`);
    _renderPrevTabella(data);
  } catch(e) {
    el.innerHTML = `<p style="color:var(--color-danger, var(--color-error))">Errore: ${e.message}</p>`;
  }
}

function _renderPrevTabella(data) {
  const el   = document.getElementById('prevTabella');
  const rows = data.mesi.map(m => {
    const diff      = m.differenza;
    const diffCls   = diff > 0 ? 'prev-diff-pos' : diff < 0 ? 'prev-diff-neg' : '';
    const diffSign  = diff > 0 ? '+' : '';
    return `<tr>
      <td>${m.mese_label}</td>
      <td style="text-align:right">${formatEur(m.previsto)}</td>
      <td style="text-align:right">${formatEur(m.effettivo)}</td>
      <td style="text-align:right" class="${diffCls}">${diffSign}${formatEur(diff)}</td>
    </tr>`;
  }).join('');
  const dTot    = data.differenza_tot;
  const dTotCls = dTot > 0 ? 'prev-diff-pos' : dTot < 0 ? 'prev-diff-neg' : '';
  el.innerHTML = `
    <table class="prev-table">
      <thead><tr>
        <th>Mese</th>
        <th style="text-align:right">Previsto</th>
        <th style="text-align:right">Effettivo</th>
        <th style="text-align:right">Differenza</th>
      </tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr class="prev-tot-row">
        <td><strong>TOTALE</strong></td>
        <td style="text-align:right"><strong>${formatEur(data.totale_previsto)}</strong></td>
        <td style="text-align:right"><strong>${formatEur(data.totale_effettivo)}</strong></td>
        <td style="text-align:right" class="${dTotCls}"><strong>${dTot > 0 ? '+' : ''}${formatEur(dTot)}</strong></td>
      </tr></tfoot>
    </table>
    <p style="margin-top:var(--space-2);font-size:var(--font-size-sm);color:var(--color-text-muted)">
      Tariffario: <strong>${data.tariffario_nome || '—'}</strong>
      &nbsp;·&nbsp; Cadenza: <strong>${data.cadenza || '—'}</strong>
    </p>`;
}

document.getElementById('btnPrevAggiorna')?.addEventListener('click', _loadPrevisionale);

/* ── 5.6 Sollecito ───────────────────────────────────────────────────────── */
function _openSollecito() {
  // mostra il residuo dell'anno corrente dall'ultimo riepilogo caricato
  const residuo = currentDetStats ? currentDetStats.residuo : null;
  document.getElementById('solImporto').textContent =
    residuo !== null ? formatEur(Math.abs(residuo)) : '—';
  document.getElementById('solNota').textContent =
    residuo !== null && residuo <= 0
      ? '⚠️ Questo cliente non ha residui da sollecitare.'
      : `Anno ${currentDetAnno}`;
  const btnPdf = document.getElementById('btnSolGeneraPdf');
  if (btnPdf) btnPdf.disabled = residuo !== null && residuo <= 0;
  openModal('modalSollecito');
}

document.getElementById('btnSolGeneraPdf')?.addEventListener('click', async () => {
  try {
    const res = await fetch(`/api/ditte/${currentDetId}/sollecito/pdf`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ anno: currentDetAnno }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || res.statusText);
    }
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `sollecito_${currentDetId}_${currentDetAnno}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    closeModal('modalSollecito');
    toast('PDF sollecito generato', 'success');
  } catch(e) { toast('Errore: ' + e.message, 'error'); }
});

/* ══════════════════════════════════════════════════════════════════
   MODULO: Prima Nota Studio — Blocco 1
   ══════════════════════════════════════════════════════════════════ */
const PrimaNota = (() => {
  let _movimenti = [];
  let _categorie = null;
  let _filtroAnno = '';
  let _filtroMese = '0';
  let _filtroTipo = 'tutti';
  let _filtroCerca = '';
  let _sollecitiEspansi = false;
  let _debounceTimer = null;
  let _initialized = false;

  const $ = id => document.getElementById(id);

  async function init() {
    await _caricaAnni();
    await _caricaSaldi();
    await _caricaSolleciti();
    await _caricaMovimenti();
    if (!_initialized) {
      _bindFiltri();
      _bindSolleciti();
      _bindModal();
      _initialized = true;
    }
  }

  async function _caricaAnni() {
    try {
      const anni = await fetch('/api/prima-nota/anni').then(r => r.json());
      const sel = $('pnFiltroAnno');
      sel.innerHTML = '<option value="">Tutti gli anni</option>';
      anni.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a;
        opt.textContent = a;
        if (a === String(new Date().getFullYear())) opt.selected = true;
        sel.appendChild(opt);
      });
      _filtroAnno = sel.value;
    } catch (e) { console.error('PrimaNota: errore anni', e); }
  }

  async function _caricaSaldi() {
    try {
      const saldi = await fetch('/api/prima-nota/saldi').then(r => r.json());
      const row = $('pnSaldiRow');
      row.innerHTML = '';
      saldi.forEach(s => {
        const card = document.createElement('div');
        card.className = 'pn-saldo-card' + (s.saldo < 0 ? ' pn-saldo-negativo' : '');
        if (s.id && s.id.startsWith('banca_')) {
          card.dataset.bancaId = s.id.split('_')[1];
          card.dataset.bancaNome = s.nome;
        }
        card.innerHTML = `<span class="pn-saldo-label">${_esc(s.nome)}</span>
          <span class="pn-saldo-value">${_eur(s.saldo)}</span>`;
        row.appendChild(card);
      });
    } catch (e) { console.error('PrimaNota: errore saldi', e); }
  }

  async function _caricaSolleciti() {
    try {
      const clienti = await fetch('/api/prima-nota/clienti-da-sollecitare').then(r => r.json());
      const block = $('pnSollecitiBlock');
      const badge = $('pnSollecitiCount');
      const tbody = $('pnSollecitiBody');
      if (clienti.length === 0) { block.style.display = 'none'; return; }
      block.style.display = 'block';
      badge.textContent = clienti.length;
      tbody.innerHTML = clienti.map(c => `<tr>
        <td><strong>${_esc(c.ragione_sociale)}</strong></td>
        <td class="col-money" style="color:var(--color-error);font-weight:600">${_eur(c.residuo)}</td>
        <td>${c.ultimo_pagamento ? _data(c.ultimo_pagamento) : '—'}</td>
        <td><button class="btn btn-secondary btn-sm" onclick="PrimaNota.apriSollecito(${c.id})">📬</button></td>
      </tr>`).join('');
    } catch (e) { console.error('PrimaNota: errore solleciti', e); }
  }

  async function _caricaMovimenti() {
    const p = new URLSearchParams();
    if (_filtroAnno) p.set('anno', _filtroAnno);
    if (_filtroMese && _filtroMese !== '0') p.set('mese', _filtroMese);
    if (_filtroTipo && _filtroTipo !== 'tutti') p.set('tipo', _filtroTipo);
    if (_filtroCerca) p.set('cerca', _filtroCerca);
    try {
      _movimenti = await fetch(`/api/prima-nota/movimenti?${p}`).then(r => r.json());
      _render(_movimenti);
    } catch (e) { console.error('PrimaNota: errore movimenti', e); }
  }

  function _render(movimenti) {
    const tbody = $('pnMovimentiBody');
    if (!movimenti || !movimenti.length) {
      tbody.innerHTML = `<tr><td colspan="9" class="empty-row">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="1.5" opacity="0.25" style="margin-bottom:var(--space-2)">
          <rect x="2" y="5" width="20" height="14" rx="2"/>
          <line x1="2" y1="10" x2="22" y2="10"/>
        </svg><br>Nessun movimento</td></tr>`;
      return;
    }
    tbody.innerHTML = movimenti.map(m => {
      const flagHtml   = _renderFlag(m);
      const tipoHtml   = m.tipo === 'entrata'
        ? '<span class="badge-tipo badge-entrata">Entrata</span>'
        : m.tipo === 'uscita'
          ? '<span class="badge-tipo badge-uscita">Uscita</span>'
          : `<span class="badge-tipo badge-giroconto">Giro ${m.giroconto_dir === 'entrata' ? '↓' : '↑'}</span>`;
      const cls        = m.tipo === 'entrata' ? 'pn-importo-entrata' : m.tipo === 'uscita' ? 'pn-importo-uscita' : 'pn-importo-giroconto';
      const nomeHtml   = (m.tipo === 'entrata' && m.macrogruppo_id === 'clienti' && m.sottovoce_id)
        ? `<button class="btn-link pn-nome-cliente" onclick="apriDettaglioCliente(${m.sottovoce_id})">${_esc(m.nome_display || '—')}</button>`
        : _esc(m.nome_display || m.sottovoce_nome || '—');
      const conto      = _formatConto(m.tipologia);
      return `<tr data-id="${m.id}">
        <td class="pn-col-flag">${flagHtml}</td>
        <td>${_data(m.data)}</td>
        <td>${tipoHtml}</td>
        <td>${_esc(m.macrogruppo_nome || '—')}</td>
        <td>${nomeHtml}</td>
        <td class="pn-col-note">${_esc(m.descrizione || '—')}</td>
        <td>${_esc(conto)}</td>
        <td class="col-money"><span class="${cls}">${_eur(m.importo)}</span></td>
        <td class="col-actions">
          <button class="btn-icon pn-btn-elimina" title="Elimina"
            onclick="PrimaNota.eliminaMovimento(${m.id},${m.tipo === 'giroconto'})">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </td>
      </tr>`;
    }).join('');
  }

  function _renderFlag(m) {
    if (m.tipo !== 'entrata') return '<span class="pn-flag-empty"></span>';
    if (m.flag === 'fatturato')
      return `<button class="pn-flag pn-flag-v" title="Fatturato — clicca per rimuovere"
        onclick="PrimaNota.rimuoviFatturato(${m.id})">✓</button>`;
    if (m.flag === 'urgente') {
      const giorni = m.data ? Math.floor((Date.now() - new Date(m.data)) / 86400000) : 0;
      return `<span class="pn-flag pn-flag-urgente" title="DA FATTURARE URGENTE! ${giorni} giorni fa">!</span>`;
    }
    return `<span class="pn-flag pn-flag-da-fatturare" title="Da fatturare">○</span>`;
  }

  function _formatConto(tipologia) {
    if (!tipologia) return '—';
    if (tipologia === 'cassa') return 'Cassa';
    if (tipologia.startsWith('banca_')) {
      const id = tipologia.split('_')[1];
      const card = document.querySelector(`[data-banca-id="${id}"]`);
      return card ? card.dataset.bancaNome : tipologia;
    }
    return tipologia;
  }

  function _bindFiltri() {
    $('pnFiltroAnno').addEventListener('change', e => { _filtroAnno = e.target.value; _caricaMovimenti(); });
    $('pnFiltroMese').addEventListener('change', e => { _filtroMese = e.target.value; _caricaMovimenti(); });
    $('pnFiltroTipo').addEventListener('change', e => { _filtroTipo = e.target.value; _caricaMovimenti(); });
    $('pnFiltroCerca').addEventListener('input', e => {
      clearTimeout(_debounceTimer);
      _debounceTimer = setTimeout(() => { _filtroCerca = e.target.value.trim(); _caricaMovimenti(); }, 300);
    });
  }

  function _bindSolleciti() {
    $('pnSollecitiToggle').addEventListener('click', () => {
      _sollecitiEspansi = !_sollecitiEspansi;
      $('pnSollecitiContent').style.display = _sollecitiEspansi ? 'block' : 'none';
      $('pnSollecitiChevron').style.transform = _sollecitiEspansi ? 'rotate(180deg)' : '';
    });
  }

  async function eliminaMovimento(id, isGiroconto) {
    const msg = isGiroconto
      ? 'Stai eliminando un giroconto: verranno rimossi entrambi i movimenti collegati. Procedere?'
      : 'Eliminare questo movimento?';
    if (!confirm(msg)) return;
    try {
      const data = await fetch(`/api/prima-nota/movimenti/${id}`, { method: 'DELETE' }).then(r => r.json());
      if (data.ok) { await refresh(); toast('Movimento eliminato', 'success'); }
      else toast(data.error || 'Errore eliminazione', 'error');
    } catch (e) { toast('Errore di rete', 'error'); }
  }

  async function rimuoviFatturato(id) {
    if (!confirm('Rimuovere il flag fatturato da questo movimento?')) return;
    try {
      const data = await fetch(`/api/prima-nota/movimenti/${id}/rimuovi-fatturato`, { method: 'PATCH' }).then(r => r.json());
      if (data.ok) { await _caricaMovimenti(); toast('Flag fatturato rimosso', 'success'); }
    } catch (e) { toast('Errore di rete', 'error'); }
  }

  function apriSollecito(ditteId) {
    if (typeof openModalSollecito === 'function') openModalSollecito(ditteId);
  }

  async function refresh() {
    await _caricaSaldi();
    await _caricaMovimenti();
    await _caricaSolleciti();
  }

  function _eur(val) {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(val || 0);
  }
  function _data(s) {
    if (!s) return '—';
    const [y, m, d] = s.split('-');
    return `${d}/${m}/${y.slice(2)}`;
  }
  function _esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── Blocco 4: Banche ────────────────────────────────────────────

  let _banche = [];

  async function openModalBanche() {
    $('pnBancheError').style.display = 'none';
    $('pnNuovaBancaNome').value = '';
    $('pnNuovaBancaSaldo').value = '0';
    $('pnNuovaBancaColore').value = '#6366f1';
    openModal('modalBanche');
    await _caricaBanche();
  }

  async function _caricaBanche() {
    try {
      _banche = await fetch('/api/prima-nota/banche').then(r => r.json());
      _renderBanche();
    } catch(e) {
      $('pnBancheList').innerHTML = '<p style="padding:var(--space-3);color:var(--color-error)">Errore caricamento</p>';
    }
  }

  function _renderBanche() {
    const el = $('pnBancheList');
    if (!_banche.length) {
      el.innerHTML = '<p style="padding:var(--space-4);text-align:center;color:var(--color-text-muted)">Nessuna banca configurata</p>';
      return;
    }
    el.innerHTML = _banche.map(b => `
      <div id="pn-banca-row-${b.id}" class="pn-anagrafica-row">
        <span class="pn-color-dot" style="background:${_esc(b.colore||'#6366f1')}"></span>
        <span class="pn-anagrafica-nome">${_esc(b.nome)}</span>
        <span class="pn-anagrafica-sub">Saldo iniziale: ${_eur(b.saldo_iniziale)}</span>
        <button class="btn btn-secondary btn-sm" onclick="PrimaNota.modificaBanca(${b.id})">✏</button>
        <button class="btn btn-secondary btn-sm pn-btn-elimina" onclick="PrimaNota.eliminaBanca(${b.id})">✕</button>
      </div>`).join('');
  }

  function modificaBanca(id) {
    const b = _banche.find(x => x.id === id);
    if (!b) return;
    const row = $(`pn-banca-row-${id}`);
    row.innerHTML = `
      <input class="form-input" value="${_esc(b.nome)}" id="pn-banca-edit-nome-${id}"
        style="flex:1;height:32px;padding:0 var(--space-2)">
      <input type="number" class="form-input" value="${b.saldo_iniziale}"
        id="pn-banca-edit-saldo-${id}" step="0.01"
        style="width:110px;height:32px;padding:0 var(--space-2)">
      <input type="color" value="${_esc(b.colore||'#6366f1')}"
        id="pn-banca-edit-colore-${id}"
        style="height:32px;width:44px;border:1px solid var(--color-border);border-radius:var(--radius-md);cursor:pointer;padding:2px">
      <button class="btn btn-primary btn-sm" onclick="PrimaNota.salvaBanca(${id})">Salva</button>
      <button class="btn btn-secondary btn-sm" onclick="PrimaNota.cancelBancaEdit()">✕</button>`;
    $(`pn-banca-edit-nome-${id}`).focus();
  }

  function cancelBancaEdit() { _renderBanche(); }

  async function salvaBanca(id) {
    const nome = $(`pn-banca-edit-nome-${id}`)?.value.trim();
    const saldo_iniziale = parseFloat($(`pn-banca-edit-saldo-${id}`)?.value) || 0;
    const colore = $(`pn-banca-edit-colore-${id}`)?.value || '#6366f1';
    if (!nome) { toast('Il nome è obbligatorio', 'error'); return; }
    try {
      const res = await fetch(`/api/prima-nota/banche/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, saldo_iniziale, colore })
      });
      const data = await res.json();
      if (data.ok) { await _caricaBanche(); await _caricaSaldi(); toast('Banca aggiornata', 'success'); }
      else toast(data.error || 'Errore', 'error');
    } catch(e) { toast('Errore di rete', 'error'); }
  }

  async function eliminaBanca(id) {
    const b = _banche.find(x => x.id === id);
    if (!confirm(`Eliminare la banca "${b?.nome}"?\nAttenzione: operazione non reversibile.`)) return;
    try {
      const res = await fetch(`/api/prima-nota/banche/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) { await _caricaBanche(); await _caricaSaldi(); toast('Banca eliminata', 'success'); }
      else { $('pnBancheError').textContent = data.error; $('pnBancheError').style.display = 'block'; }
    } catch(e) { toast('Errore di rete', 'error'); }
  }

  async function _aggiungiNuovaBanca() {
    const nome = $('pnNuovaBancaNome').value.trim();
    const saldo_iniziale = parseFloat($('pnNuovaBancaSaldo').value) || 0;
    const colore = $('pnNuovaBancaColore').value || '#6366f1';
    if (!nome) { toast('Inserisci il nome della banca', 'error'); return; }
    try {
      const res = await fetch('/api/prima-nota/banche', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, saldo_iniziale, colore })
      });
      const data = await res.json();
      if (data.ok) {
        $('pnNuovaBancaNome').value = '';
        $('pnNuovaBancaSaldo').value = '0';
        await _caricaBanche();
        await _caricaSaldi();
        toast('Banca aggiunta', 'success');
      } else toast(data.error || 'Errore', 'error');
    } catch(e) { toast('Errore di rete', 'error'); }
  }

  // ── Blocco 4: Macrogruppi ────────────────────────────────────────

  let _macroData = [];
  let _macroTipo = 'entrate';

  async function openModalMacrogruppi(tipo) {
    _macroTipo = tipo;
    $('pnMacroTipo').value = tipo;
    $('pnMacroTitle').textContent = tipo === 'entrate' ? 'Macrogruppi Entrate' : 'Macrogruppi Uscite';
    $('pnMacroError').style.display = 'none';
    $('pnNuovoMacroNome').value = '';
    openModal('modalMacrogruppi');
    await _caricaMacrogruppi();
  }

  async function _caricaMacrogruppi() {
    try {
      _macroData = await fetch(`/api/prima-nota/macrogruppi/${_macroTipo}`).then(r => r.json());
      _renderMacrogruppi();
    } catch(e) {
      $('pnMacroList').innerHTML = '<p style="padding:var(--space-3);color:var(--color-error)">Errore caricamento</p>';
    }
  }

  function _renderMacrogruppi() {
    const el = $('pnMacroList');
    let html = '';

    if (_macroTipo === 'entrate') {
      html += `<div class="pn-macro-group" style="margin-bottom:var(--space-2)">
        <div class="pn-anagrafica-row pn-anagrafica-row-macro" style="background:var(--color-surface-2)">
          <span class="pn-anagrafica-nome">👥 Clienti</span>
          <span class="pn-anagrafica-sub">
            <span class="pn-badge-speciale">speciale</span>
            sola lettura — sottovoci = ditte attive
          </span>
        </div>
      </div>`;
    }

    if (!_macroData.length) {
      html += '<p style="padding:var(--space-3);text-align:center;color:var(--color-text-muted)">Nessun macrogruppo configurato</p>';
    }

    for (const m of _macroData) {
      const svRows = m.sottovoci.map(s => `
        <div id="pn-sv-row-${s.id}" class="pn-anagrafica-row pn-anagrafica-row-sv">
          <span class="pn-sv-indent">↳</span>
          <span class="pn-anagrafica-nome">${_esc(s.nome)}</span>
          <button class="btn btn-secondary btn-sm" onclick="PrimaNota.modificaSv('${_macroTipo}',${m.id},${s.id})">✏</button>
          <button class="btn btn-secondary btn-sm pn-btn-elimina" onclick="PrimaNota.eliminaSv('${_macroTipo}',${m.id},${s.id})">✕</button>
        </div>`).join('');
      html += `
        <div class="pn-macro-group">
          <div id="pn-macro-row-${m.id}" class="pn-anagrafica-row pn-anagrafica-row-macro">
            <span class="pn-anagrafica-nome">${_esc(m.nome)}</span>
            <span class="pn-anagrafica-sub">${m.sottovoci.length} sottovoci</span>
            <button class="btn btn-secondary btn-sm" onclick="PrimaNota.modificaMacro('${_macroTipo}',${m.id})">✏</button>
            <button class="btn btn-secondary btn-sm pn-btn-elimina" onclick="PrimaNota.eliminaMacro('${_macroTipo}',${m.id})">✕</button>
          </div>
          ${svRows}
          <div class="pn-anagrafica-row pn-anagrafica-row-sv">
            <span class="pn-sv-indent">↳</span>
            <input class="form-input" id="pn-nuova-sv-${m.id}" placeholder="Nuova sottovoce…"
              style="flex:1;height:28px;padding:0 var(--space-2);font-size:var(--text-xs)"
              onkeydown="if(event.key==='Enter')PrimaNota.aggiungiSv('${_macroTipo}',${m.id})">
            <button class="btn btn-secondary btn-sm" onclick="PrimaNota.aggiungiSv('${_macroTipo}',${m.id})">+ Aggiungi</button>
          </div>
        </div>`;
    }

    el.innerHTML = html;
  }

  function modificaMacro(tipo, id) {
    const m = _macroData.find(x => x.id === id);
    if (!m) return;
    const row = $(`pn-macro-row-${id}`);
    row.innerHTML = `
      <input class="form-input" value="${_esc(m.nome)}" id="pn-macro-edit-${id}"
        style="flex:1;height:32px;padding:0 var(--space-2)"
        onkeydown="if(event.key==='Enter')PrimaNota.salvaMacro('${tipo}',${id})">
      <button class="btn btn-primary btn-sm" onclick="PrimaNota.salvaMacro('${tipo}',${id})">Salva</button>
      <button class="btn btn-secondary btn-sm" onclick="PrimaNota.cancelMacroEdit()">✕</button>`;
    $(`pn-macro-edit-${id}`).focus();
  }

  function cancelMacroEdit() { _renderMacrogruppi(); }

  async function salvaMacro(tipo, id) {
    const nome = $(`pn-macro-edit-${id}`)?.value.trim();
    if (!nome) { toast('Il nome è obbligatorio', 'error'); return; }
    try {
      const res = await fetch(`/api/prima-nota/macrogruppi/${tipo}/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome })
      });
      const data = await res.json();
      if (data.ok) { await _caricaMacrogruppi(); toast('Macrogruppo aggiornato', 'success'); }
      else toast(data.error || 'Errore', 'error');
    } catch(e) { toast('Errore di rete', 'error'); }
  }

  async function eliminaMacro(tipo, id) {
    const m = _macroData.find(x => x.id === id);
    if (!confirm(`Eliminare il macrogruppo "${m?.nome}" e tutte le sue sottovoci?`)) return;
    try {
      const res = await fetch(`/api/prima-nota/macrogruppi/${tipo}/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) { await _caricaMacrogruppi(); toast('Macrogruppo eliminato', 'success'); }
      else { $('pnMacroError').textContent = data.error; $('pnMacroError').style.display = 'block'; }
    } catch(e) { toast('Errore di rete', 'error'); }
  }

  function modificaSv(tipo, macroId, svId) {
    const m = _macroData.find(x => x.id === macroId);
    const s = m?.sottovoci.find(x => x.id === svId);
    if (!s) return;
    const row = $(`pn-sv-row-${svId}`);
    row.innerHTML = `
      <span class="pn-sv-indent">↳</span>
      <input class="form-input" value="${_esc(s.nome)}" id="pn-sv-edit-${svId}"
        style="flex:1;height:28px;padding:0 var(--space-2);font-size:var(--text-xs)"
        onkeydown="if(event.key==='Enter')PrimaNota.salvaSv('${tipo}',${macroId},${svId})">
      <button class="btn btn-primary btn-sm" onclick="PrimaNota.salvaSv('${tipo}',${macroId},${svId})">Salva</button>
      <button class="btn btn-secondary btn-sm" onclick="PrimaNota.cancelMacroEdit()">✕</button>`;
    $(`pn-sv-edit-${svId}`).focus();
  }

  async function salvaSv(tipo, macroId, svId) {
    const nome = $(`pn-sv-edit-${svId}`)?.value.trim();
    if (!nome) { toast('Il nome è obbligatorio', 'error'); return; }
    try {
      const res = await fetch(`/api/prima-nota/macrogruppi/${tipo}/${macroId}/sottovoci/${svId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome })
      });
      const data = await res.json();
      if (data.ok) { await _caricaMacrogruppi(); toast('Sottovoce aggiornata', 'success'); }
      else toast(data.error || 'Errore', 'error');
    } catch(e) { toast('Errore di rete', 'error'); }
  }

  async function eliminaSv(tipo, macroId, svId) {
    const m = _macroData.find(x => x.id === macroId);
    const s = m?.sottovoci.find(x => x.id === svId);
    if (!confirm(`Eliminare la sottovoce "${s?.nome}"?`)) return;
    try {
      const res = await fetch(`/api/prima-nota/macrogruppi/${tipo}/${macroId}/sottovoci/${svId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) { await _caricaMacrogruppi(); toast('Sottovoce eliminata', 'success'); }
      else { $('pnMacroError').textContent = data.error; $('pnMacroError').style.display = 'block'; }
    } catch(e) { toast('Errore di rete', 'error'); }
  }

  async function aggiungiSv(tipo, macroId) {
    const nome = $(`pn-nuova-sv-${macroId}`)?.value.trim();
    if (!nome) { toast('Inserisci il nome della sottovoce', 'error'); return; }
    try {
      const res = await fetch(`/api/prima-nota/macrogruppi/${tipo}/${macroId}/sottovoci`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome })
      });
      const data = await res.json();
      if (data.ok) { await _caricaMacrogruppi(); toast('Sottovoce aggiunta', 'success'); }
      else toast(data.error || 'Errore', 'error');
    } catch(e) { toast('Errore di rete', 'error'); }
  }

  async function _aggiungiNuovoMacro() {
    const nome = $('pnNuovoMacroNome').value.trim();
    if (!nome) { toast('Inserisci il nome del macrogruppo', 'error'); return; }
    try {
      const res = await fetch(`/api/prima-nota/macrogruppi/${_macroTipo}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome })
      });
      const data = await res.json();
      if (data.ok) {
        $('pnNuovoMacroNome').value = '';
        await _caricaMacrogruppi();
        toast('Macrogruppo aggiunto', 'success');
      } else toast(data.error || 'Errore', 'error');
    } catch(e) { toast('Errore di rete', 'error'); }
  }

  // ── Modal Registra Movimento ────────────────────────────────────

  function _bindModal() {
    $('pnBtnMovimento').addEventListener('click', openModalMovimento);
    $('pnTabEntrata').addEventListener('click', () => _setTab('entrata'));
    $('pnTabUscita').addEventListener('click', () => _setTab('uscita'));
    $('pnMovCategoria').addEventListener('change', () => {
      const raw = $('pnMovCategoria').value;
      if (!raw) {
        $('pnMovSottovoce').innerHTML = '<option value="">Prima seleziona categoria</option>';
        $('pnMovSottovoce').disabled = true;
        return;
      }
      const cat = JSON.parse(raw);
      _buildSottovoci(cat.sottovoci);
    });
    $('pnBtnSalvaMovimento').addEventListener('click', _salvaMovimento);

    // Giroconto
    $('pnBtnGiroconto').addEventListener('click', openModalGiroconto);
    $('pnGiroTipo').addEventListener('change', _onGiroTipoChange);
    $('pnBtnSalvaGiroconto').addEventListener('click', _salvaGiroconto);

    // Fatturazione
    $('pnBtnFatturazione').addEventListener('click', openModalFatturazione);

    // Banche
    $('pnBtnBanche').addEventListener('click', openModalBanche);
    $('pnBtnAggiungiBanca').addEventListener('click', _aggiungiNuovaBanca);

    // Macrogruppi
    $('pnBtnEntrate').addEventListener('click', () => openModalMacrogruppi('entrate'));
    $('pnBtnUscite').addEventListener('click', () => openModalMacrogruppi('uscite'));
    $('pnBtnAggiungiMacro').addEventListener('click', _aggiungiNuovoMacro);

    $('pnFattMaster').addEventListener('change', e => {
      document.querySelectorAll('.pn-fatt-cb').forEach(cb => {
        cb.checked = e.target.checked;
      });
      _aggiornaFattTotale();
    });
    $('pnBtnGeneraFatturazione').addEventListener('click', _generaDocumento);
  }

  function openModalMovimento() {
    // Default data = oggi
    if (!$('pnMovData').value) {
      $('pnMovData').value = new Date().toISOString().split('T')[0];
    }
    $('pnMovError').style.display = 'none';
    _categorie = null; // forza refresh categorie ad ogni apertura
    _setTab('entrata');
    _buildConti();
    openModal('modalMovimento');
  }

  async function _buildConti() {
    const sel = $('pnMovConto');
    try {
      const saldi = await fetch('/api/prima-nota/saldi').then(r => r.json());
      sel.innerHTML = '<option value="">— Seleziona... —</option>';
      saldi.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = s.nome;
        sel.appendChild(opt);
      });
    } catch(e) {
      sel.innerHTML = '<option value="cassa">Cassa</option>';
    }
  }

  async function _loadCategorie() {
    if (_categorie) return _categorie;
    _categorie = await fetch('/api/prima-nota/categorie').then(r => r.json());
    return _categorie;
  }

  async function _setTab(tipo) {
    $('pnMovTipo').value = tipo;
    const isEntrata = tipo === 'entrata';
    $('pnTabEntrata').style.cssText = isEntrata
      ? 'flex:1;background:var(--color-success);color:#fff;border:none'
      : 'flex:1';
    $('pnTabEntrata').className = isEntrata ? 'btn btn-sm' : 'btn btn-secondary btn-sm';
    $('pnTabUscita').style.cssText = !isEntrata
      ? 'flex:1;background:var(--color-error);color:#fff;border:none'
      : 'flex:1';
    $('pnTabUscita').className = !isEntrata ? 'btn btn-sm' : 'btn btn-secondary btn-sm';
    // Mantieni data, importo, note; reset categoria+sottovoce
    $('pnMovCategoria').innerHTML = '<option value="">— Seleziona... —</option>';
    $('pnMovSottovoce').innerHTML = '<option value="">Prima seleziona categoria</option>';
    $('pnMovSottovoce').disabled = true;
    $('pnMovError').style.display = 'none';
    await _buildCategorie(tipo);
  }

  async function _buildCategorie(tipo) {
    const cats = await _loadCategorie();
    const lista = tipo === 'entrata' ? cats.entrate : cats.uscite;
    const sel = $('pnMovCategoria');
    sel.innerHTML = '<option value="">— Seleziona... —</option>';
    lista.forEach(m => {
      const opt = document.createElement('option');
      opt.value = JSON.stringify({ id: m.id, nome: m.nome, sottovoci: m.sottovoci });
      opt.textContent = m.nome;
      sel.appendChild(opt);
    });
  }

  function _buildSottovoci(sottovoci) {
    const sel = $('pnMovSottovoce');
    if (!sottovoci || !sottovoci.length) {
      sel.innerHTML = '<option value="">Nessuna sottovoce configurata</option>';
      sel.disabled = true;
      return;
    }
    sel.innerHTML = '<option value="">— Seleziona... —</option>';
    sottovoci.forEach(s => {
      const opt = document.createElement('option');
      opt.value = JSON.stringify({ id: s.id, nome: s.nome });
      opt.textContent = s.nome;
      sel.appendChild(opt);
    });
    sel.disabled = false;
  }

  async function _salvaMovimento() {
    const btn = $('pnBtnSalvaMovimento');
    const tipo        = $('pnMovTipo').value;
    const data_mov    = $('pnMovData').value;
    const tipologia   = $('pnMovConto').value;
    const catRaw      = $('pnMovCategoria').value;
    const sotRaw      = $('pnMovSottovoce').value;
    const importoVal  = $('pnMovImporto').value;
    const descrizione = $('pnMovNote').value.trim();

    if (!data_mov)   return _showModalErr('Inserisci la data del movimento');
    if (!tipologia)  return _showModalErr('Seleziona Cassa o una banca');
    if (!catRaw)     return _showModalErr('Seleziona una categoria');
    if (!sotRaw)     return _showModalErr('Seleziona la sottovoce');
    const importo = parseFloat(importoVal);
    if (!importo || importo <= 0) return _showModalErr("L'importo deve essere maggiore di zero");

    const cat = JSON.parse(catRaw);
    const sot = JSON.parse(sotRaw);

    $('pnMovError').style.display = 'none';
    const origHTML = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = '…';

    try {
      const res = await fetch('/api/prima-nota/movimenti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo, data: data_mov, tipologia,
          macrogruppo_id: cat.id, macrogruppo_nome: cat.nome,
          sottovoce_id: sot.id, sottovoce_nome: sot.nome,
          importo, descrizione
        })
      });
      const data = await res.json();
      if (data.ok) {
        closeModal('modalMovimento');
        $('pnMovImporto').value = '';
        $('pnMovNote').value = '';
        await refresh();
        toast('Movimento registrato!', 'success');
      } else {
        _showModalErr(typeof data.error === 'string' ? data.error : 'Errore nel salvataggio');
      }
    } catch(e) {
      _showModalErr('Errore di rete');
    } finally {
      btn.disabled = false;
      btn.innerHTML = origHTML;
    }
  }

  function _showModalErr(msg) {
    const el = $('pnMovError');
    el.textContent = msg;
    el.style.display = 'block';
  }

  // ── Modal Giroconto ─────────────────────────────────────────────

  async function openModalGiroconto() {
    if (!$('pnGiroData').value)
      $('pnGiroData').value = new Date().toISOString().split('T')[0];
    $('pnGiroTipo').value = '';
    $('pnGiroImporto').value = '';
    $('pnGiroDescrizione').value = '';
    $('pnGiroError').style.display = 'none';
    await _buildContiGiro();
    openModal('modalGiroconto');
  }

  async function _buildContiGiro() {
    try {
      const saldi = await fetch('/api/prima-nota/saldi').then(r => r.json());
      const opzioni = saldi.map(s =>
        `<option value="${s.id}">${_esc(s.nome)}</option>`
      ).join('');
      $('pnGiroDa').innerHTML = '<option value="">— Seleziona —</option>' + opzioni;
      $('pnGiroA').innerHTML  = '<option value="">— Seleziona —</option>' + opzioni;
    } catch(e) {
      $('pnGiroDa').innerHTML = '<option value="cassa">Cassa</option>';
      $('pnGiroA').innerHTML  = '<option value="cassa">Cassa</option>';
    }
  }

  function _onGiroTipoChange() {
    const tipo = $('pnGiroTipo').value;
    const da = $('pnGiroDa');
    const a  = $('pnGiroA');

    // Ripristina tutte le opzioni prima di filtrare
    Array.from(da.options).forEach(o => o.hidden = false);
    Array.from(a.options).forEach(o => o.hidden = false);

    if (tipo === 'versamento') {
      // Da = Cassa auto, A = solo banche
      const cassaOpt = Array.from(da.options).find(o => o.value === 'cassa');
      if (cassaOpt) da.value = 'cassa';
      Array.from(a.options).forEach(o => {
        if (o.value === 'cassa') o.hidden = true;
      });
      if (a.value === 'cassa') a.value = '';
    } else if (tipo === 'prelievo') {
      // A = Cassa auto, Da = solo banche
      const cassaOpt = Array.from(a.options).find(o => o.value === 'cassa');
      if (cassaOpt) a.value = 'cassa';
      Array.from(da.options).forEach(o => {
        if (o.value === 'cassa') o.hidden = true;
      });
      if (da.value === 'cassa') da.value = '';
    } else if (tipo === 'bonifico') {
      // Entrambi solo banche
      Array.from(da.options).forEach(o => { if (o.value === 'cassa') o.hidden = true; });
      Array.from(a.options).forEach(o => { if (o.value === 'cassa') o.hidden = true; });
      if (da.value === 'cassa') da.value = '';
      if (a.value === 'cassa') a.value = '';
    }
    // spostamento: libero, nessun filtro
  }

  async function _salvaGiroconto() {
    const btn = $('pnBtnSalvaGiroconto');
    const data_mov    = $('pnGiroData').value;
    const tipo        = $('pnGiroTipo').value;
    const da          = $('pnGiroDa').value;
    const a           = $('pnGiroA').value;
    const importoVal  = $('pnGiroImporto').value;
    const descrizione = $('pnGiroDescrizione').value.trim();

    if (!data_mov)   return _showGiroErr('Inserisci la data');
    if (!tipo)       return _showGiroErr('Seleziona il tipo di giroconto');
    if (!da)         return _showGiroErr('Seleziona il conto di origine');
    if (!a)          return _showGiroErr('Seleziona il conto di destinazione');
    if (da === a)    return _showGiroErr('I conti di origine e destinazione devono essere diversi');
    const importo = parseFloat(importoVal);
    if (!importo || importo <= 0) return _showGiroErr('Inserisci un importo valido');

    $('pnGiroError').style.display = 'none';
    const origHTML = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = '…';

    try {
      const res = await fetch('/api/prima-nota/giroconto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: data_mov, tipo, da, a, importo, descrizione })
      });
      const data = await res.json();
      if (data.ok) {
        closeModal('modalGiroconto');
        await refresh();
        toast(data.msg || 'Giroconto registrato!', 'success');
      } else {
        _showGiroErr(data.error || 'Errore nel salvataggio');
      }
    } catch(e) {
      _showGiroErr('Errore di rete');
    } finally {
      btn.disabled = false;
      btn.innerHTML = origHTML;
    }
  }

  function _showGiroErr(msg) {
    const el = $('pnGiroError');
    el.textContent = msg;
    el.style.display = 'block';
  }

  // ── Modal Prepara Fatturazione ───────────────────────────────────

  let _fattIncassi = []; // cache lista incassi caricati

  async function openModalFatturazione() {
    $('pnFattError').style.display = 'none';
    $('pnFattMaster').checked = false;
    $('pnFattBody').innerHTML = '<tr><td colspan="5" class="empty-row">Caricamento…</td></tr>';
    $('pnFattCount').textContent = '0';
    $('pnFattTotale').textContent = '€ 0,00';
    openModal('modalFatturazione');
    await _caricaDaFatturare();
  }

  async function _caricaDaFatturare() {
    try {
      _fattIncassi = await fetch('/api/prima-nota/da-fatturare').then(r => r.json());
      if (!_fattIncassi.length) {
        closeModal('modalFatturazione');
        toast('Nessun incasso da fatturare disponibile', 'info');
        return;
      }
      _renderFatturazione(_fattIncassi);
    } catch(e) {
      $('pnFattBody').innerHTML = '<tr><td colspan="5" class="empty-row">Errore caricamento</td></tr>';
    }
  }

  function _renderFatturazione(incassi) {
    const tbody = $('pnFattBody');
    tbody.innerHTML = incassi.map(inc => `
      <tr>
        <td><input type="checkbox" class="pn-fatt-cb" data-id="${inc.id}"
          data-importo="${inc.importo}" onchange="_aggiornaFattTotale()"></td>
        <td>${_data(inc.data)}</td>
        <td>${_esc(inc.soggetto)}</td>
        <td>${_esc(inc.categoria)}</td>
        <td class="col-money pn-importo-entrata">${_eur(inc.importo)}</td>
      </tr>`).join('');
    _aggiornaFattTotale();
  }

  function _aggiornaFattTotale() {
    const checked = document.querySelectorAll('.pn-fatt-cb:checked');
    let tot = 0;
    checked.forEach(cb => { tot += parseFloat(cb.dataset.importo) || 0; });
    $('pnFattCount').textContent = checked.length;
    $('pnFattTotale').textContent = _eur(tot);
    // Sync master checkbox
    const all = document.querySelectorAll('.pn-fatt-cb');
    $('pnFattMaster').checked = all.length > 0 && checked.length === all.length;
    $('pnFattMaster').indeterminate = checked.length > 0 && checked.length < all.length;
  }

  async function _generaDocumento() {
    const checked = document.querySelectorAll('.pn-fatt-cb:checked');
    if (!checked.length) {
      const el = $('pnFattError');
      el.textContent = 'Seleziona almeno un incasso da fatturare';
      el.style.display = 'block';
      return;
    }
    $('pnFattError').style.display = 'none';

    const ids = Array.from(checked).map(cb => parseInt(cb.dataset.id));
    const btn = $('pnBtnGeneraFatturazione');
    const origHTML = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = '…';

    try {
      // 1. Genera e scarica PDF
      const res = await fetch('/api/prima-nota/fatturazione/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Errore generazione PDF');
      }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Fatturazione_${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      // 2. Conferma marcatura
      const ok = confirm(
        `Confermi di voler marcare ${ids.length} incasso/i come fatturati?\n` +
        'Potrai sempre rimuovere il flag cliccando l\'icona ✓ in tabella.'
      );
      if (!ok) {
        toast('PDF generato. Nessun incasso marcato.', 'info');
        return;
      }

      // 3. Marca come fatturati
      const res2 = await fetch('/api/prima-nota/fatturazione/marca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      const data = await res2.json();
      if (data.ok) {
        closeModal('modalFatturazione');
        await refresh();
        toast(`${data.marcati} incasso/i marcati come fatturati`, 'success');
      }
    } catch(e) {
      const el = $('pnFattError');
      el.textContent = e.message || 'Errore di rete';
      el.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.innerHTML = origHTML;
    }
  }

  return { init, refresh, eliminaMovimento, rimuoviFatturato, apriSollecito,
           openModalMovimento, openModalGiroconto, openModalFatturazione,
           openModalBanche, modificaBanca, salvaBanca, eliminaBanca, cancelBancaEdit,
           openModalMacrogruppi, modificaMacro, salvaMacro, eliminaMacro, cancelMacroEdit,
           modificaSv, salvaSv, eliminaSv, aggiungiSv };
})();

/* Aggancia switchTab per Prima Nota */
const _origSwitchTabPN = switchTab;
window.switchTab = function (tabName) {
  _origSwitchTabPN(tabName);
  if (tabName === 'prima-nota') PrimaNota.init();
  if (tabName === 'rendiconto') Rendiconto.init();
};

/* ─────────────────────────────────────────────────────────────────
   RENDICONTO
───────────────────────────────────────────────────────────────── */
const Rendiconto = (() => {
  const $ = id => document.getElementById(id);
  let _initialized = false;
  let _anno = String(new Date().getFullYear());
  let _mese = 0;
  let _cacheEntrate = null;
  let _cacheUscite  = null;

  async function init() {
    _populateAnni();
    await Promise.all([_caricaSaldi(), _caricaRiepilogo(), _caricaEntrate(), _caricaUscite(), _caricaGiroconti()]);
    if (!_initialized) {
      $('rdFiltroAnno').addEventListener('change', e => {
        _anno = e.target.value;
        _cacheEntrate = null; _cacheUscite = null;
        _caricaRiepilogo();
        _caricaEntrate();
        _caricaUscite();
        _caricaGiroconti();
      });
      $('rdFiltroMese').addEventListener('change', e => {
        _mese = parseInt(e.target.value) || 0;
        if (_cacheEntrate) _renderEntrate(_cacheEntrate);
        if (_cacheUscite)  _renderUscite(_cacheUscite);
      });
      $('rdMostraArchiviati').addEventListener('change', () => { _cacheEntrate = null; _caricaEntrate(); });
      $('rdBtnEsportaPdf').addEventListener('click', _esportaPdf);
      $('rdBtnEsportaExcel').addEventListener('click', _esportaExcel);
      _initialized = true;
    }
  }

  function _populateAnni() {
    const sel = $('rdFiltroAnno');
    const current = new Date().getFullYear();
    sel.innerHTML = '';
    for (let y = current + 2; y >= current - 5; y--) {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      if (y === current) opt.selected = true;
      sel.appendChild(opt);
    }
    _anno = String(current);
  }

  async function _caricaSaldi() {
    try {
      const saldi = await fetch('/api/rendiconto/saldi').then(r => r.json());
      const row = $('rdSaldiRow');
      row.innerHTML = '';
      const tot = saldi.reduce((s, c) => s + c.saldo, 0);

      // Card "Totale Disponibilità" in evidenza
      const totCard = document.createElement('div');
      totCard.className = 'pn-saldo-card' + (tot < 0 ? ' pn-saldo-negativo' : '');
      totCard.style.cssText = 'background:var(--color-surface-raised);border-color:var(--color-primary);min-width:160px';
      totCard.innerHTML = `<span class="pn-saldo-label">Totale Disponibilità</span>
        <span class="pn-saldo-value" style="color:${tot >= 0 ? 'var(--color-success)' : 'var(--color-error)'}">${_fmt(tot)}</span>`;
      row.appendChild(totCard);

      saldi.forEach(s => {
        const card = document.createElement('div');
        card.className = 'pn-saldo-card' + (s.saldo < 0 ? ' pn-saldo-negativo' : '');
        card.innerHTML = `<span class="pn-saldo-label">${s.nome}</span>
          <span class="pn-saldo-value">${_fmt(s.saldo)}</span>`;
        row.appendChild(card);
      });
    } catch (e) { console.error('Rendiconto: errore saldi', e); }
  }

  async function _caricaRiepilogo() {
    try {
      const p = new URLSearchParams({ anno: _anno });
      const d = await fetch(`/api/rendiconto/riepilogo?${p}`).then(r => r.json());
      $('rdValEntrate').textContent = _fmt(d.tot_entrate);
      $('rdValUscite').textContent  = _fmt(d.tot_uscite);
      const diffEl = $('rdValDiff');
      diffEl.textContent = (d.differenza >= 0 ? '+' : '') + _fmt(d.differenza);
      diffEl.style.color = d.differenza >= 0 ? 'var(--color-success)' : 'var(--color-error)';
    } catch (e) { console.error('Rendiconto: errore riepilogo', e); }
  }

  async function _caricaEntrate() {
    try {
      const arch = $('rdMostraArchiviati').checked ? '1' : '0';
      const p    = new URLSearchParams({ anno: _anno, mostra_archiviati: arch });
      const d    = await fetch(`/api/rendiconto/entrate?${p}`).then(r => r.json());
      _cacheEntrate = d;
      _renderEntrate(d);
    } catch (e) { console.error('Rendiconto: errore entrate', e); }
  }

  function _renderEntrate(d) {
    const wrap = $('rdEntrateWrap');
    const haData = d.sezioni_clienti.length > 0 || d.macrogruppi.length > 0;
    if (!haData) {
      wrap.innerHTML = '<div style="padding:var(--space-6);text-align:center;color:var(--color-text-muted);font-size:var(--text-sm)">Nessuna entrata nel periodo selezionato</div>';
      return;
    }

    const MESI = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];
    const sel = _mese; // 1-12 or 0=tutti
    const thCls = i => 'rd-col-money' + (sel > 0 && i === sel ? ' rd-mese-sel' : '');
    const tdCls = (i, extra) => 'rd-col-money' + (extra ? ' ' + extra : '') + (sel > 0 && i === sel ? ' rd-mese-sel' : '');

    let html = '<table class="rd-table"><thead><tr>';
    html += '<th style="min-width:200px">Voce</th>';
    MESI.forEach((m, i) => html += `<th class="${thCls(i + 1)}">${m}</th>`);
    html += `<th class="${thCls(0)}">TOT. PAG.</th>`;
    html += '<th class="rd-col-money rd-col-residuo">Residuo</th>';
    html += '</tr></thead><tbody>';

    let sidx = 0;
    // Sezioni clienti
    d.sezioni_clienti.forEach(sez => {
      const cls = { paghe:'rd-sez-paghe', cont:'rd-sez-cont', paghe_cont:'rd-sez-paghe-cont', altro:'rd-sez-altro' }[sez.colore] || 'rd-sez-altro';
      const sid = 'e' + (sidx++);
      html += `<tr class="rd-sez-hdr ${cls}" data-sid="${sid}" data-open="1">`;
      html += `<td><span class="rd-chevron">▾</span>${sez.nome}</td>`;
      sez.subtotali_mesi.forEach((v, i) => html += `<td class="${thCls(i + 1)}">${_fmtCell(v)}</td>`);
      html += `<td class="${thCls(0)}">${_fmt(sez.subtotale)}</td>`;
      html += `<td class="rd-col-money rd-col-residuo ${sez.subtotale_residui > 0 ? 'rd-val-neg' : sez.subtotale_residui < 0 ? 'rd-val-pos' : ''}">${_fmt(sez.subtotale_residui)}</td>`;
      html += '</tr>';
      sez.clienti.forEach(c => {
        const hide = sel > 0 && c.mesi[sel - 1] === 0 ? ' style="display:none"' : '';
        html += `<tr class="rd-cliente" data-parent="${sid}"${hide}>`;
        html += `<td><span class="rd-cliente-link" onclick="switchTab('ditte')">${c.nome}</span></td>`;
        c.mesi.forEach((v, i) => html += `<td class="${tdCls(i + 1, v > 0 ? 'rd-val-pos' : '')}">${_fmtCell(v)}</td>`);
        html += `<td class="${tdCls(0, c.tot_pagato > 0 ? 'rd-val-pos' : '')}">${_fmt(c.tot_pagato)}</td>`;
        const rCls = c.residuo > 0 ? 'rd-val-neg' : c.residuo < 0 ? 'rd-val-pos' : '';
        html += `<td class="rd-col-money rd-col-residuo ${rCls}">${_fmt(c.residuo)}</td>`;
        html += '</tr>';
      });
    });

    // Macrogruppi liberi
    d.macrogruppi.forEach(mg => {
      const sid = 'e' + (sidx++);
      html += `<tr class="rd-sez-hdr rd-sez-macro" data-sid="${sid}" data-open="1">`;
      html += `<td><span class="rd-chevron">▾</span>${mg.nome}</td>`;
      mg.subtotali_mesi.forEach((v, i) => html += `<td class="${thCls(i + 1)}">${_fmtCell(v)}</td>`);
      html += `<td class="${thCls(0)}">${_fmt(mg.subtotale)}</td>`;
      html += `<td class="rd-col-money rd-col-residuo rd-zero">—</td>`;
      html += '</tr>';
      mg.sottovoci.forEach(sv => {
        const hide = sel > 0 && sv.mesi[sel - 1] === 0 ? ' style="display:none"' : '';
        html += `<tr class="rd-sottovoce" data-parent="${sid}"${hide}>`;
        html += `<td>&nbsp;&nbsp;› ${sv.nome}</td>`;
        sv.mesi.forEach((v, i) => html += `<td class="${tdCls(i + 1, v > 0 ? 'rd-val-pos' : '')}">${_fmtCell(v)}</td>`);
        html += `<td class="${tdCls(0, sv.totale > 0 ? 'rd-val-pos' : '')}">${_fmt(sv.totale)}</td>`;
        html += `<td class="rd-col-money rd-col-residuo rd-zero">—</td>`;
        html += '</tr>';
      });
    });

    // Totale generale
    html += `<tr class="rd-totale-gen">`;
    html += `<td>TOTALE GENERALE</td>`;
    d.totali_mesi.forEach((v, i) => html += `<td class="${thCls(i + 1)}">${_fmtCell(v)}</td>`);
    html += `<td class="${thCls(0)}">${_fmt(d.totale_annuale)}</td>`;
    html += `<td class="rd-col-money rd-col-residuo">${_fmt(d.totale_residui)}</td>`;
    html += '</tr>';

    html += '</tbody></table>';
    wrap.innerHTML = html;
    _bindCollapse(wrap);
  }

  async function _caricaUscite() {
    try {
      const p = new URLSearchParams({ anno: _anno });
      const d = await fetch(`/api/rendiconto/uscite?${p}`).then(r => r.json());
      _cacheUscite = d;
      _renderUscite(d);
    } catch (e) { console.error('Rendiconto: errore uscite', e); }
  }

  function _renderUscite(d) {
    const wrap = $('rdUsciteWrap');
    if (!d.macrogruppi.length) {
      wrap.innerHTML = `<div style="padding:var(--space-6);text-align:center;color:var(--color-text-muted);font-size:var(--text-sm)">Nessuna uscita nel ${_anno}</div>`;
      return;
    }

    const MESI = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];
    const sel = _mese;
    const thCls = i => 'rd-col-money' + (sel > 0 && i === sel ? ' rd-mese-sel' : '');
    const tdCls = (i, extra) => 'rd-col-money' + (extra ? ' ' + extra : '') + (sel > 0 && i === sel ? ' rd-mese-sel' : '');

    let html = '<table class="rd-table"><thead><tr>';
    html += '<th style="min-width:200px">Voce</th>';
    MESI.forEach((m, i) => html += `<th class="${thCls(i + 1)}">${m}</th>`);
    html += `<th class="${thCls(0)}">Totale</th>`;
    html += '</tr></thead><tbody>';

    let sidx = 0;
    d.macrogruppi.forEach(mg => {
      const sid = 'u' + (sidx++);
      html += `<tr class="rd-sez-hdr rd-sez-macro" data-sid="${sid}" data-open="1">`;
      html += `<td><span class="rd-chevron">▾</span>${mg.nome}</td>`;
      mg.subtotali_mesi.forEach((v, i) => html += `<td class="${thCls(i + 1)}">${_fmtCellRed(v)}</td>`);
      html += `<td class="${thCls(0)} rd-val-neg">${_fmt(mg.subtotale)}</td></tr>`;

      mg.sottovoci.forEach(sv => {
        const hide = sel > 0 && sv.mesi[sel - 1] === 0 ? ' style="display:none"' : '';
        html += `<tr class="rd-sottovoce" data-parent="${sid}"${hide}>`;
        html += `<td>&nbsp;&nbsp;› ${sv.nome}</td>`;
        sv.mesi.forEach((v, i) => html += `<td class="${thCls(i + 1)}">${_fmtCellRed(v)}</td>`);
        html += `<td class="${tdCls(0, sv.totale > 0 ? 'rd-val-neg' : '')}">${_fmt(sv.totale)}</td></tr>`;
      });
    });

    html += `<tr class="rd-totale-gen"><td>TOTALE GENERALE</td>`;
    d.totali_mesi.forEach((v, i) => html += `<td class="${thCls(i + 1)}">${_fmtCellRed(v)}</td>`);
    html += `<td class="${thCls(0)} rd-val-neg">${_fmt(d.totale_annuale)}</td></tr>`;

    html += '</tbody></table>';
    wrap.innerHTML = html;
    _bindCollapse(wrap);
  }

  function _bindCollapse(wrap) {
    if (wrap.dataset.collapsebound) return;
    wrap.dataset.collapsebound = '1';
    wrap.addEventListener('click', function(e) {
      const hdr = e.target.closest('tr[data-sid]');
      if (!hdr) return;
      const sid = hdr.dataset.sid;
      const open = hdr.dataset.open === '1';
      hdr.dataset.open = open ? '0' : '1';
      const chevron = hdr.querySelector('.rd-chevron');
      if (chevron) chevron.style.transform = open ? 'rotate(-90deg)' : '';
      wrap.querySelectorAll(`tr[data-parent="${sid}"]`).forEach(row => {
        row.style.display = open ? 'none' : '';
      });
    });
  }

  async function _esportaPdf() {
    const btn = $('rdBtnEsportaPdf');
    btn.disabled = true;
    btn.textContent = 'Generazione…';
    try {
      const p = new URLSearchParams({ anno: _anno });
      const res = await fetch(`/api/rendiconto/export-pdf?${p}`);
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = `Rendiconto_${_anno}.pdf`;
      a.click(); URL.revokeObjectURL(url);
    } catch (e) {
      toast('Errore generazione PDF: ' + e.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> Esporta PDF';
    }
  }

  async function _esportaExcel() {
    const btn = $('rdBtnEsportaExcel');
    btn.disabled = true;
    btn.textContent = 'Generazione…';
    try {
      const p = new URLSearchParams({ anno: _anno });
      const res = await fetch(`/api/rendiconto/export-excel?${p}`);
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = `Rendiconto_${_anno}.xlsx`;
      a.click(); URL.revokeObjectURL(url);
    } catch (e) {
      toast('Errore generazione Excel: ' + e.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg> Esporta Excel';
    }
  }

  async function _caricaGiroconti() {
    try {
      const p = new URLSearchParams({ anno: _anno });
      const d = await fetch(`/api/rendiconto/giroconti?${p}`).then(r => r.json());
      _renderGiroconti(d);
    } catch (e) { console.error('Rendiconto: errore giroconti', e); }
  }

  function _renderGiroconti(rows) {
    const wrap = $('rdGirocontiWrap');
    if (!rows.length) {
      wrap.innerHTML = `<div style="padding:var(--space-6);text-align:center;color:var(--color-text-muted);font-size:var(--text-sm)">Nessun giroconto nel ${_anno}</div>`;
      return;
    }
    let html = '<table class="rd-table"><thead><tr>';
    ['Data','Da','A','Descrizione','Importo'].forEach((h, i) =>
      html += `<th${i === 4 ? ' class="rd-col-money"' : ''}>${h}</th>`
    );
    html += '</tr></thead><tbody>';
    rows.forEach(r => {
      html += `<tr>
        <td style="white-space:nowrap">${r.data}</td>
        <td>${r.da}</td>
        <td>${r.a}</td>
        <td style="color:var(--color-text-muted)">${r.descrizione}</td>
        <td class="rd-col-money" style="color:#7c3aed;font-weight:600">${_fmt(r.importo)}</td>
      </tr>`;
    });
    html += '</tbody></table>';
    wrap.innerHTML = html;
  }

  function _fmtCellRed(v) {
    return v === 0
      ? '<span class="rd-zero">—</span>'
      : `<span class="rd-val-neg">${_fmt(v)}</span>`;
  }

  function _fmtCell(v) {
    return v === 0
      ? '<span class="rd-zero">—</span>'
      : `<span class="rd-val-pos">${_fmt(v)}</span>`;
  }

  function _fmt(v) {
    return new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
  }

  return { init };
})();

/* INIT */
checkAuth();