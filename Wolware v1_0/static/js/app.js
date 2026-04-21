/* THEME TOGGLE */
(function(){
  const root=document.documentElement,btn=document.querySelector('[data-theme-toggle]');
  let d=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';
  root.setAttribute('data-theme',d);
  function setIcon(){if(!btn)return;btn.innerHTML=d==='dark'
    ?'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
    :'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';}
  setIcon();
  if(btn)btn.addEventListener('click',()=>{d=d==='dark'?'light':'dark';root.setAttribute('data-theme',d);setIcon();});
})();

/* CLOCK */
function updateClock(){const el=document.getElementById('topbarClock');
  if(el)el.textContent=new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit',second:'2-digit'});}
updateClock();setInterval(updateClock,1000);

/* TOAST */
function toast(msg,type='success'){
  const c=document.getElementById('toastContainer'),el=document.createElement('div');
  el.className=`toast toast-${type}`;
  el.innerHTML=`<span style="font-size:1rem">${{success:'✓',error:'✕',info:'ℹ'}[type]}</span><span>${msg}</span>`;
  c.appendChild(el);setTimeout(()=>el.remove(),3500);
}

/* TAB NAVIGATION */
function switchTab(tabName){
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.remove('active'));
  const panel=document.getElementById('tab-'+tabName);
  if(panel)panel.classList.add('active');
  document.querySelectorAll(`[data-tab="${tabName}"]`).forEach(b=>b.classList.add('active'));
  if(tabName==='home'){loadStats();loadHomePratiche();}
  if(tabName==='pratiche')loadPratiche();
  if(tabName==='ditte')loadDitte();
}
document.querySelectorAll('[data-tab]').forEach(el=>{
  el.addEventListener('click',e=>{e.preventDefault();switchTab(el.dataset.tab);});
});

/* MODAL */
function openModal(id){document.getElementById(id).classList.add('open');}
function closeModal(id){document.getElementById(id).classList.remove('open');}
document.querySelectorAll('[data-close]').forEach(btn=>{
  btn.addEventListener('click',()=>closeModal(btn.dataset.close));
});
document.querySelectorAll('.modal-overlay').forEach(overlay=>{
  overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.classList.remove('open');});
});

/* DROPDOWN */
function setupDropdown(triggerId,menuId,onSelect){
  const trigger=document.getElementById(triggerId),menu=document.getElementById(menuId);
  if(!trigger||!menu)return;
  trigger.addEventListener('click',e=>{e.stopPropagation();menu.classList.toggle('open');});
  menu.querySelectorAll('.dropdown-item').forEach(item=>{
    item.addEventListener('click',()=>{menu.classList.remove('open');onSelect(item.dataset.tipo);});
  });
}
document.addEventListener('click',()=>{
  document.querySelectorAll('.dropdown-menu').forEach(m=>m.classList.remove('open'));
});

/* API */
async function api(url,method='GET',body=null){
  const opts={method,headers:{'Content-Type':'application/json'}};
  if(body)opts.body=JSON.stringify(body);
  const res=await fetch(url,opts),data=await res.json();
  if(!res.ok)throw new Error(data.error||'Errore del server');
  return data;
}

/* STATS */
async function loadStats(){
  try{
    const s=await api('/api/stats');
    animateValue('kpiDitte',s.ditte);animateValue('kpiTotali',s.pratiche_totali);
    animateValue('kpiAperte',s.pratiche_aperte);animateValue('kpiChiuse',s.pratiche_chiuse);
  }catch(e){console.error(e);}
}
function animateValue(id,target){
  const el=document.getElementById(id);if(!el)return;
  let start=0;const duration=600;
  const step=ts=>{if(!start)start=ts;const p=Math.min((ts-start)/duration,1);
    el.textContent=Math.floor(p*target);if(p<1)requestAnimationFrame(step);else el.textContent=target;};
  requestAnimationFrame(step);
}

/* BADGES */
function statoBadge(s){
  const m={'Aperta':'badge-orange','In Lavorazione':'badge-blue','Chiusa':'badge-green'};
  return `<span class="badge ${m[s]||'badge-gray'}">${s}</span>`;
}
function prioritaBadge(p){
  const m={'Urgente':'badge-red','Alta':'badge-orange','Normale':'badge-gray','Bassa':'badge-blue'};
  return `<span class="badge ${m[p]||'badge-gray'}">${p}</span>`;
}
function formatDate(d){if(!d)return '—';const[y,m,g]=d.split('-');return `${g}/${m}/${y}`;}

/* HOME TABLE */
async function loadHomePratiche(){
  try{
    const list=await api('/api/pratiche');
    const tbody=document.getElementById('homeTableBody'),recent=list.slice(0,8);
    if(!recent.length){
      tbody.innerHTML=`<tr><td colspan="6" class="empty-row"><span class="empty-icon">📋</span><br>Nessuna pratica. Crea la tua prima pratica!</td></tr>`;return;
    }
    tbody.innerHTML=recent.map(p=>`<tr>
      <td style="font-family:var(--font-mono);font-size:var(--text-xs);color:var(--color-text-faint)">#${p.id}</td>
      <td>${p.ditta_nome||'<em style="color:var(--color-text-faint)">—</em>'}</td>
      <td>${p.tipo_pratica}</td><td>${statoBadge(p.stato)}</td>
      <td>${prioritaBadge(p.priorita)}</td>
      <td style="color:var(--color-text-muted)">${formatDate(p.data_apertura)}</td>
    </tr>`).join('');
  }catch(e){console.error(e);}
}

/* PRATICHE TAB */
let allPratiche=[];
async function loadPratiche(){
  try{allPratiche=await api('/api/pratiche');renderPratiche(allPratiche);}
  catch(e){toast('Errore nel caricamento pratiche','error');}
}
function renderPratiche(list){
  const tbody=document.getElementById('praticheTableBody');
  if(!list.length){
    tbody.innerHTML=`<tr><td colspan="9" class="empty-row"><span class="empty-icon">📋</span><br>Nessuna pratica trovata.</td></tr>`;return;
  }
  tbody.innerHTML=list.map(p=>`<tr>
    <td style="font-family:var(--font-mono);font-size:var(--text-xs);color:var(--color-text-faint)">#${p.id}</td>
    <td style="font-weight:500">${p.ditta_nome||'—'}</td>
    <td>${p.tipo_pratica}</td>
    <td style="color:var(--color-text-muted);max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.descrizione||'—'}</td>
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
document.getElementById('filterPratiche').addEventListener('input',filterPratiche);
document.getElementById('filterStato').addEventListener('change',filterPratiche);
function filterPratiche(){
  const q=document.getElementById('filterPratiche').value.toLowerCase();
  const stato=document.getElementById('filterStato').value;
  let f=allPratiche;
  if(q)f=f.filter(p=>(p.tipo_pratica||'').toLowerCase().includes(q)||(p.ditta_nome||'').toLowerCase().includes(q)||(p.descrizione||'').toLowerCase().includes(q));
  if(stato)f=f.filter(p=>p.stato===stato);
  renderPratiche(f);
}

/* DITTE TAB */
let allDitte=[];
async function loadDitte(){
  try{allDitte=await api('/api/ditte');renderDitte(allDitte);}
  catch(e){toast('Errore nel caricamento ditte','error');}
}
function renderDitte(list){
  const grid=document.getElementById('ditteGrid');
  if(!list.length){
    grid.innerHTML=`<div class="empty-state"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg><p>Nessuna ditta presente.<br>Clicca su <strong>Nuova Ditta</strong> per aggiungere il tuo primo cliente.</p></div>`;return;
  }
  grid.innerHTML=list.map(d=>{
    const ini=d.ragione_sociale.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
    return `<div class="ditta-card">
      <div class="ditta-card-header">
        <div style="display:flex;gap:var(--space-3);align-items:center">
          <div class="ditta-avatar">${ini}</div>
          <div><div class="ditta-name">${d.ragione_sociale}</div>
          <div class="ditta-forma">${d.forma_giuridica||''} ${d.settore_ateco?'· '+d.settore_ateco:''}</div></div>
        </div>
        <div class="ditta-card-actions">
          <button class="btn btn-icon btn-ghost" title="Modifica" onclick="editDitta(${d.id})">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn btn-icon btn-ghost" title="Elimina" onclick="deleteDitta(${d.id})" style="color:var(--color-error)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
          </button>
        </div>
      </div>
      <div class="ditta-meta">
        ${d.partita_iva?`<div class="ditta-meta-row"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>P.IVA: ${d.partita_iva}</div>`:''}
        ${d.citta?`<div class="ditta-meta-row"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${d.citta}${d.provincia?' ('+d.provincia.toUpperCase()+')':''}</div>`:''}
        ${d.referente?`<div class="ditta-meta-row"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>${d.referente}</div>`:''}
        ${d.email?`<div class="ditta-meta-row"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>${d.email}</div>`:''}
      </div>
    </div>`;
  }).join('');
}
document.getElementById('filterDitte').addEventListener('input',filterDitte);
document.getElementById('filterForma').addEventListener('change',filterDitte);
function filterDitte(){
  const q=document.getElementById('filterDitte').value.toLowerCase();
  const forma=document.getElementById('filterForma').value;
  let f=allDitte;
  if(q)f=f.filter(d=>d.ragione_sociale.toLowerCase().includes(q)||(d.partita_iva||'').toLowerCase().includes(q)||(d.referente||'').toLowerCase().includes(q)||(d.citta||'').toLowerCase().includes(q));
  if(forma)f=f.filter(d=>d.forma_giuridica===forma);
  renderDitte(f);
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
  document.querySelectorAll('.modal-tab').forEach((t,i) => t.classList.toggle('active', i===0));
  document.querySelectorAll('.modal-tab-panel').forEach((p,i) => p.classList.toggle('active', i===0));
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
        <span style="font-weight:600;font-size:var(--text-sm)">Sede ${sedeIdx+1}</span>
        <button type="button" class="btn btn-icon btn-ghost" style="color:var(--color-error)" onclick="removeSede(${sedeIdx})">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
        </button>
      </div>
      <div class="form-grid">
        <div class="form-field col-span-2">
          <label>Nome / Descrizione Sede</label>
          <input type="text" value="${s.nome||''}" oninput="sedi[${sedeIdx}].nome=this.value" placeholder="es. Magazzino, Filiale Nord..."/>
        </div>
        <div class="form-field col-span-2">
          <label>Indirizzo</label>
          <input type="text" value="${s.indirizzo||''}" oninput="sedi[${sedeIdx}].indirizzo=this.value" placeholder="Via ..."/>
        </div>
        <div class="form-field">
          <label>CAP</label>
          <input type="text" maxlength="5" value="${s.cap||''}" oninput="sedi[${sedeIdx}].cap=this.value" placeholder="80100"/>
        </div>
        <div class="form-field">
          <label>Comune</label>
          <input type="text" value="${s.citta||''}" oninput="sedi[${sedeIdx}].citta=this.value" placeholder="Napoli"/>
        </div>
        <div class="form-field">
          <label>Prov.</label>
          <input type="text" maxlength="2" value="${s.prov||''}" oninput="sedi[${sedeIdx}].prov=this.value" placeholder="NA"/>
        </div>
        <div class="form-field">
          <label>Cod. Catastale</label>
          <input type="text" maxlength="4" value="${s.catastale||''}" oninput="sedi[${sedeIdx}].catastale=this.value" placeholder="F839"/>
        </div>
      </div>
      <div class="sede-nav">
        <button type="button" class="sede-nav-btn" onclick="navSede(-1)" ${sedeIdx===0?'disabled':''}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span class="sede-counter">${sedeIdx+1} / ${sedi.length}</span>
        <button type="button" class="sede-nav-btn" onclick="navSede(1)" ${sedeIdx===sedi.length-1?'disabled':''}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>`;
}
function navSede(dir) {
  sedeIdx = Math.max(0, Math.min(sedi.length-1, sedeIdx+dir));
  renderSedi();
}
function removeSede(i) {
  sedi.splice(i, 1);
  sedeIdx = Math.max(0, sedeIdx-1);
  renderSedi();
}
document.getElementById('btnAddSede').addEventListener('click', () => {
  sedi.push({nome:'',indirizzo:'',cap:'',citta:'',prov:'',catastale:''});
  sedeIdx = sedi.length-1;
  renderSedi();
});

/* ══════════════════════════════════════════════════════════
   INAIL
══════════════════════════════════════════════════════════ */
let inailList = [];
function renderInail() {
  const el = document.getElementById('inailList');
  if (!inailList.length) { el.innerHTML='<div class="list-empty-msg">Nessuna gestione INAIL inserita.</div>'; return; }
  el.innerHTML = inailList.map((g,i) => `
    <div class="list-item">
      <div class="list-item-header">
        <span class="list-item-title">Gestione INAIL #${i+1}</span>
        <button type="button" class="btn btn-icon btn-ghost" style="color:var(--color-error)" onclick="removeInail(${i})">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
        </button>
      </div>
      <div class="list-item-grid">
        <div class="list-item-field"><label>Codice PAT</label>
          <input value="${g.pat||''}" oninput="inailList[${i}].pat=this.value" placeholder="PAT000000000"/></div>
        <div class="list-item-field"><label>Sede INAIL</label>
          <input value="${g.sede||''}" oninput="inailList[${i}].sede=this.value" placeholder="es. Napoli"/></div>
        <div class="list-item-field"><label>Codice ATECO</label>
          <input value="${g.ateco||''}" oninput="inailList[${i}].ateco=this.value" placeholder="es. 47.11"/></div>
        <div class="list-item-field"><label>Sede Lavorativa</label>
          <input value="${g.sedeLav||''}" oninput="inailList[${i}].sedeLav=this.value" placeholder="es. Via Roma 1"/></div>
        <div class="list-item-field full"><label>Note</label>
          <input value="${g.note||''}" oninput="inailList[${i}].note=this.value" placeholder="Note aggiuntive..."/></div>
      </div>
    </div>`).join('');
}
function removeInail(i) { inailList.splice(i,1); renderInail(); }
document.getElementById('btnAddInail').addEventListener('click', () => {
  inailList.push({pat:'',sede:'',ateco:'',sedeLav:'',note:''});
  renderInail();
});

/* ══════════════════════════════════════════════════════════
   INPS
══════════════════════════════════════════════════════════ */
let inpsList = [];
function renderInps() {
  const el = document.getElementById('inpsList');
  if (!inpsList.length) { el.innerHTML='<div class="list-empty-msg">Nessuna gestione INPS inserita.</div>'; return; }
  el.innerHTML = inpsList.map((g,i) => `
    <div class="list-item">
      <div class="list-item-header">
        <span class="list-item-title">Gestione INPS #${i+1}</span>
        <button type="button" class="btn btn-icon btn-ghost" style="color:var(--color-error)" onclick="removeInps(${i})">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
        </button>
      </div>
      <div class="list-item-grid">
        <div class="list-item-field"><label>Matricola INPS</label>
          <input value="${g.matricola||''}" oninput="inpsList[${i}].matricola=this.value" placeholder="1234567890"/></div>
        <div class="list-item-field"><label>Sede INPS</label>
          <input value="${g.sede||''}" oninput="inpsList[${i}].sede=this.value" placeholder="es. Napoli"/></div>
        <div class="list-item-field"><label>CCNL</label>
          <input value="${g.ccnl||''}" oninput="inpsList[${i}].ccnl=this.value" placeholder="es. Commercio"/></div>
        <div class="list-item-field"><label>Codice ATECO</label>
          <input value="${g.ateco||''}" oninput="inpsList[${i}].ateco=this.value" placeholder="es. 47.11"/></div>
        <div class="list-item-field full"><label>Note</label>
          <input value="${g.note||''}" oninput="inpsList[${i}].note=this.value" placeholder="Note aggiuntive..."/></div>
      </div>
    </div>`).join('');
}
function removeInps(i) { inpsList.splice(i,1); renderInps(); }
document.getElementById('btnAddInps').addEventListener('click', () => {
  inpsList.push({matricola:'',sede:'',ccnl:'',ateco:'',note:''});
  renderInps();
});

/* ══════════════════════════════════════════════════════════
   CONTATTI CC
══════════════════════════════════════════════════════════ */
let ccList = [];
function renderCC() {
  const el = document.getElementById('ccList');
  if (!ccList.length) { el.innerHTML='<div class="list-empty-msg">Nessun contatto CC aggiunto.</div>'; return; }
  el.innerHTML = ccList.map((c,i) => `
    <div class="list-item" style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-2) var(--space-3)">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;opacity:0.4"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
      <input type="email" style="flex:1;padding:0 var(--space-2);height:30px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-sm);font-size:var(--text-sm);color:var(--color-text)"
        value="${c.email||''}" oninput="ccList[${i}].email=this.value" placeholder="email@esempio.it"/>
      <input type="text" style="width:160px;padding:0 var(--space-2);height:30px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-sm);font-size:var(--text-sm);color:var(--color-text)"
        value="${c.nome||''}" oninput="ccList[${i}].nome=this.value" placeholder="Nome (opzionale)"/>
      <button type="button" class="btn btn-icon btn-ghost" style="color:var(--color-error);flex-shrink:0" onclick="removeCC(${i})">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
      </button>
    </div>`).join('');
}
function removeCC(i) { ccList.splice(i,1); renderCC(); }
document.getElementById('btnAddCC').addEventListener('click', () => {
  ccList.push({email:'',nome:''});
  renderCC();
});

/* ══════════════════════════════════════════════════════════
   TARIFFARIO
══════════════════════════════════════════════════════════ */
let tariffItems = [];
const TARIFF_BASE = [
  {desc:'Costo Cedolino', prezzo:''},
  {desc:'Assunzione', prezzo:''},
  {desc:'Variazione', prezzo:''},
  {desc:'Cessazione', prezzo:''},
];
function renderTariff() {
  const el = document.getElementById('tariffList');
  if (!tariffItems.length) {
    el.innerHTML='<div class="list-empty-msg">Nessuna voce. Clicca "Tariffario Base" per caricare le voci predefinite.</div>'; return;
  }
  el.innerHTML = `<table class="tariff-table">
    <thead><tr><th>Descrizione</th><th>Prezzo (€)</th><th></th></tr></thead>
    <tbody>${tariffItems.map((v,i)=>`<tr>
      <td><input value="${v.desc||''}" oninput="tariffItems[${i}].desc=this.value" placeholder="Descrizione voce"/></td>
      <td class="tariff-row-price"><input type="number" step="0.01" min="0" value="${v.prezzo||''}" oninput="tariffItems[${i}].prezzo=this.value" placeholder="0.00"/></td>
      <td><button type="button" class="btn btn-icon btn-ghost" style="color:var(--color-error)" onclick="removeTariff(${i})">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
      </button></td>
    </tr>`).join('')}</tbody>
  </table>`;
}
function removeTariff(i) { tariffItems.splice(i,1); renderTariff(); }
document.getElementById('btnTariffBase').addEventListener('click', () => {
  tariffItems = TARIFF_BASE.map(v => ({...v})); renderTariff();
});
document.getElementById('btnAddTariff').addEventListener('click', () => {
  tariffItems.push({desc:'',prezzo:''}); renderTariff();
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
    ['ragione_sociale','codice_fiscale','partita_iva','indirizzo','cap','citta',
     'provincia','cod_catastale','amministratore','cf_amministratore',
     'tel_amministratore','email_amministratore','data_inizio_rapporto',
     'email','pec','telefono'].forEach(f => {
      const el = document.getElementById(f);
      if (el && d[f]) el.value = d[f];
    });
    document.getElementById('cedolino_onnicomprensivo').checked = !!d.cedolino_onnicomprensivo;
    if (d.sedi_json) { try { sedi = JSON.parse(d.sedi_json); sedeIdx=0; } catch(e){} }
    if (d.inail_json) { try { inailList = JSON.parse(d.inail_json); } catch(e){} }
    if (d.inps_json)  { try { inpsList = JSON.parse(d.inps_json);  } catch(e){} }
    if (d.cc_json)    { try { ccList = JSON.parse(d.cc_json);       } catch(e){} }
    if (d.tariff_json){ try { tariffItems = JSON.parse(d.tariff_json); } catch(e){} }
    renderSedi(); renderInail(); renderInps(); renderCC(); renderTariff();
    openModal('modalDitta');
  } catch(e) { toast('Errore nel caricamento ditta', 'error'); }
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
  };
  try {
    const id = document.getElementById('dittaId').value;
    if (id) { await api(`/api/ditte/${id}`, 'PUT', data); toast('Ditta aggiornata'); }
    else     { await api('/api/ditte', 'POST', data); toast('Ditta creata'); }
    closeModal('modalDitta');
    loadDitte(); loadStats();
  } catch(e) { errEl.textContent = e.message; errEl.style.display = 'block'; }
});


/* BINDINGS */
document.getElementById('btnNuovaDitta').addEventListener('click',openDittaModal);
document.getElementById('btnNuovaDitta2').addEventListener('click',openDittaModal);
function openPraticaModal(tipo) {
  if (tipo === 'Assunzione') { openAssunzioneModal(); return; }
  const wip = ['Cessazione','Trasformazione Contratto','Proroga Contratto',
    'Elaborazione Buste Paga','Variazione Retributiva','Conguaglio Fiscale',
    'Comunicazione INPS','Comunicazione INAIL','Gestione CIG','Variazione INAIL',
    'Modello 770','CU - Certificazione Unica','Autoliquidazione INAIL','Altra Pratica'];
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
  document.querySelectorAll('.modal-tab[data-atab]').forEach((t,i) => t.classList.toggle('active', i===0));
  document.querySelectorAll('[id^="atab-"]').forEach((p,i) => p.classList.toggle('active', i===0));
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
document.getElementById('ass_straniero').addEventListener('change', function() {
  document.getElementById('ass_permesso_section').style.display = this.checked ? 'block' : 'none';
});

/* Tipologia contratto → mostra data fine */
const TIPI_TERMINE = ['TD','TD_SOS','TD_PIATT','TD_SOS_PIATT','APP_QUAL','APP_PROF','APP_AF','INT_DET','TIR','LSU','FL','BWE'];
document.getElementById('ass_tipologia_contratto').addEventListener('change', function() {
  document.getElementById('ass_data_fine_wrapper').style.display = TIPI_TERMINE.includes(this.value) ? 'block' : 'none';
});

/* Tipologia orario → mostra retrib PT */
document.getElementById('ass_tipo_orario').addEventListener('change', function() {
  document.getElementById('ass_retrib_pt_wrapper').style.display = ['PTO','PTV','PTM'].includes(this.value) ? 'block' : 'none';
});

/* Cod istruzione → descrizione */
const ISTR_MAP = {
  '10':'Nessun titolo','20':'Licenza Elementare','30':'Licenza Media',
  '40':'Diploma Professionale','50':'Diploma Superiore','60':'Laurea Triennale',
  '70':'Laurea Magistrale','80':'Master / Specializzazione','90':'Dottorato'
};
document.getElementById('ass_cod_istruzione').addEventListener('change', function() {
  document.getElementById('ass_livello_istruzione').value = ISTR_MAP[this.value] || '';
});

/* Azienda select → auto-fill campi */
document.getElementById('ass_ditta_id').addEventListener('change', async function() {
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
    try { inpsList = d.inps_json ? JSON.parse(d.inps_json) : []; } catch(e) {}
    inpsList.forEach((g,i) => {
      const o = document.createElement('option');
      o.value = i;
      o.textContent = g.matricola ? g.matricola + (g.ccnl ? ' — ' + g.ccnl : '') : 'INPS #' + (i+1);
      o.dataset.ateco = g.ateco || ''; o.dataset.ccnl = g.ccnl || '';
      inpsSel.appendChild(o);
    });
    /* INAIL */
    const inailSel = document.getElementById('ass_pat_inail');
    inailSel.innerHTML = '<option value="">-- Seleziona --</option>';
    let inailList = [];
    try { inailList = d.inail_json ? JSON.parse(d.inail_json) : []; } catch(e) {}
    inailList.forEach((g,i) => {
      const o = document.createElement('option');
      o.value = i;
      o.textContent = g.pat ? g.pat + (g.sede ? ' — ' + g.sede : '') : 'INAIL #' + (i+1);
      inailSel.appendChild(o);
    });
    /* Sedi lavorative */
    const sedeSel = document.getElementById('ass_sede_lav_select');
    sedeSel.innerHTML = '<option value="">Sede Legale (default)</option>';
    let sediList = [];
    try { sediList = d.sedi_json ? JSON.parse(d.sedi_json) : []; } catch(e) {}
    sediList.forEach((s,i) => {
      const o = document.createElement('option');
      o.value = i;
      o.textContent = s.nome || 'Sede ' + (i+1);
      o.dataset.indirizzo = s.indirizzo||''; o.dataset.cap = s.cap||'';
      o.dataset.citta = s.citta||''; o.dataset.prov = s.prov||'';
      o.dataset.catastale = s.catastale||'';
      sedeSel.appendChild(o);
    });
  } catch(e) { console.error(e); }
});

/* INPS select → autofill ATECO e CCNL */
document.getElementById('ass_matricola_inps').addEventListener('change', function() {
  const opt = this.options[this.selectedIndex];
  document.getElementById('ass_cod_ateco').value = opt.dataset ? (opt.dataset.ateco || '') : '';
  document.getElementById('ass_ccnl').value = opt.dataset ? (opt.dataset.ccnl || '') : '';
});

/* Sede lavorativa → autofill */
document.getElementById('ass_sede_lav_select').addEventListener('change', function() {
  const opt = this.options[this.selectedIndex];
  if (!opt.dataset) return;
  document.getElementById('ass_indirizzo_lav').value = opt.dataset.indirizzo || '';
  document.getElementById('ass_cap_lav').value = opt.dataset.cap || '';
  document.getElementById('ass_comune_lav').value = opt.dataset.citta || '';
  document.getElementById('ass_prov_lav').value = opt.dataset.prov || '';
  document.getElementById('ass_catastale_lav').value = opt.dataset.catastale || '';
});

function clearAziendaFields() {
  ['ass_cf_azienda','ass_pec_azienda','ass_indirizzo_legale','ass_cap_legale',
   'ass_comune_legale','ass_prov_legale','ass_catastale_legale','ass_cod_ateco','ass_ccnl'].forEach(id => {
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
  ['ass_permesso_section','ass_obbligatoria_section','ass_netto_wrapper',
   'ass_data_fine_wrapper','ass_retrib_pt_wrapper'].forEach(id => {
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
  } catch(e) {}
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

setupDropdown('btnNuovaPratica','dropdownPratica',openPraticaModal);
setupDropdown('btnNuovaPratica2','dropdownPratica2',openPraticaModal);

/* INIT */
loadStats();loadHomePratiche();
