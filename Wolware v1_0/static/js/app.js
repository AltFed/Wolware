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

/* FORM DITTA */
function resetDittaForm(){
  document.getElementById('dittaId').value='';
  ['ragione_sociale','partita_iva','codice_fiscale','settore_ateco','codice_ateco',
   'indirizzo','citta','cap','provincia','telefono','email','pec','referente','data_inizio_rapporto','note_ditta'].forEach(id=>{
    const el=document.getElementById(id);if(el)el.value='';
  });
  document.getElementById('forma_giuridica').value='';
  document.getElementById('formDittaError').style.display='none';
  document.getElementById('modalDittaTitle').textContent='Nuova Ditta';
}
function openDittaModal(){resetDittaForm();openModal('modalDitta');}
async function editDitta(id){
  try{
    const d=await api(`/api/ditte/${id}`);
    resetDittaForm();
    document.getElementById('dittaId').value=d.id;
    document.getElementById('modalDittaTitle').textContent='Modifica Ditta';
    ['ragione_sociale','partita_iva','codice_fiscale','forma_giuridica','settore_ateco','codice_ateco',
     'indirizzo','citta','cap','provincia','telefono','email','pec','referente','data_inizio_rapporto'].forEach(f=>{
      const el=document.getElementById(f);if(el&&d[f])el.value=d[f];
    });
    document.getElementById('note_ditta').value=d.note||'';
    openModal('modalDitta');
  }catch(e){toast('Errore nel caricamento ditta','error');}
}
document.getElementById('btnSaveDitta').addEventListener('click',async()=>{
  const errEl=document.getElementById('formDittaError');errEl.style.display='none';
  const data={
    ragione_sociale:document.getElementById('ragione_sociale').value.trim(),
    partita_iva:document.getElementById('partita_iva').value.trim(),
    codice_fiscale:document.getElementById('codice_fiscale').value.trim(),
    forma_giuridica:document.getElementById('forma_giuridica').value,
    settore_ateco:document.getElementById('settore_ateco').value.trim(),
    codice_ateco:document.getElementById('codice_ateco').value.trim(),
    indirizzo:document.getElementById('indirizzo').value.trim(),
    citta:document.getElementById('citta').value.trim(),
    cap:document.getElementById('cap').value.trim(),
    provincia:document.getElementById('provincia').value.trim().toUpperCase(),
    telefono:document.getElementById('telefono').value.trim(),
    email:document.getElementById('email').value.trim(),
    pec:document.getElementById('pec').value.trim(),
    referente:document.getElementById('referente').value.trim(),
    data_inizio_rapporto:document.getElementById('data_inizio_rapporto').value,
    note:document.getElementById('note_ditta').value.trim()
  };
  if(!data.ragione_sociale){errEl.textContent='La Ragione Sociale è obbligatoria.';errEl.style.display='block';return;}
  try{
    const id=document.getElementById('dittaId').value;
    if(id){await api(`/api/ditte/${id}`,'PUT',data);toast('Ditta aggiornata con successo');}
    else{await api('/api/ditte','POST',data);toast('Ditta creata con successo');}
    closeModal('modalDitta');loadDitte();loadStats();
  }catch(e){errEl.textContent=e.message;errEl.style.display='block';}
});
async function deleteDitta(id){
  if(!confirm('Sei sicuro di voler eliminare questa ditta?'))return;
  try{await api(`/api/ditte/${id}`,'DELETE');toast('Ditta eliminata');loadDitte();loadStats();}
  catch(e){toast('Errore nell\'eliminazione','error');}
}

/* FORM PRATICA */
async function populateDitteSelect(){
  try{
    const ditte=await api('/api/ditte');
    const sel=document.getElementById('pratica_ditta_id');
    sel.innerHTML='<option value="">-- Seleziona ditta --</option>'+ditte.map(d=>`<option value="${d.id}">${d.ragione_sociale}</option>`).join('');
  }catch(e){console.error(e);}
}
function resetPraticaForm(){
  document.getElementById('praticaId').value='';
  document.getElementById('tipo_pratica').value='';
  document.getElementById('pratica_ditta_id').value='';
  document.getElementById('descrizione_pratica').value='';
  document.getElementById('stato_pratica').value='Aperta';
  document.getElementById('priorita_pratica').value='Normale';
  document.getElementById('data_apertura').value=new Date().toISOString().split('T')[0];
  document.getElementById('data_scadenza').value='';
  document.getElementById('note_pratica').value='';
  document.getElementById('formPraticaError').style.display='none';
  document.getElementById('modalPraticaTitle').textContent='Nuova Pratica';
}
async function openPraticaModal(tipo){
  resetPraticaForm();await populateDitteSelect();
  document.getElementById('tipo_pratica').value=tipo;
  document.getElementById('modalPraticaTitle').textContent=`Nuova Pratica: ${tipo}`;
  openModal('modalPratica');
}
async function editPratica(id){
  resetPraticaForm();await populateDitteSelect();
  const pratica=allPratiche.find(p=>p.id===id);if(!pratica)return;
  document.getElementById('praticaId').value=pratica.id;
  document.getElementById('modalPraticaTitle').textContent='Modifica Pratica';
  document.getElementById('tipo_pratica').value=pratica.tipo_pratica;
  document.getElementById('pratica_ditta_id').value=pratica.ditta_id||'';
  document.getElementById('descrizione_pratica').value=pratica.descrizione||'';
  document.getElementById('stato_pratica').value=pratica.stato;
  document.getElementById('priorita_pratica').value=pratica.priorita;
  document.getElementById('data_apertura').value=pratica.data_apertura||'';
  document.getElementById('data_scadenza').value=pratica.data_scadenza||'';
  document.getElementById('note_pratica').value=pratica.note||'';
  openModal('modalPratica');
}
document.getElementById('btnSavePratica').addEventListener('click',async()=>{
  const errEl=document.getElementById('formPraticaError');errEl.style.display='none';
  const data={
    tipo_pratica:document.getElementById('tipo_pratica').value,
    ditta_id:document.getElementById('pratica_ditta_id').value||null,
    descrizione:document.getElementById('descrizione_pratica').value.trim(),
    stato:document.getElementById('stato_pratica').value,
    priorita:document.getElementById('priorita_pratica').value,
    data_apertura:document.getElementById('data_apertura').value,
    data_scadenza:document.getElementById('data_scadenza').value||null,
    note:document.getElementById('note_pratica').value.trim()
  };
  if(!data.tipo_pratica){errEl.textContent='Il tipo pratica è obbligatorio.';errEl.style.display='block';return;}
  try{
    const id=document.getElementById('praticaId').value;
    if(id){await api(`/api/pratiche/${id}`,'PUT',data);toast('Pratica aggiornata con successo');}
    else{await api('/api/pratiche','POST',data);toast('Pratica creata con successo');}
    closeModal('modalPratica');loadPratiche();loadStats();loadHomePratiche();
  }catch(e){errEl.textContent=e.message;errEl.style.display='block';}
});
async function deletePratica(id){
  if(!confirm('Sei sicuro di voler eliminare questa pratica?'))return;
  try{
    await api(`/api/pratiche/${id}`,'DELETE');toast('Pratica eliminata');
    allPratiche=allPratiche.filter(p=>p.id!==id);renderPratiche(allPratiche);
    loadStats();loadHomePratiche();
  }catch(e){toast('Errore nell\'eliminazione','error');}
}

/* BINDINGS */
document.getElementById('btnNuovaDitta').addEventListener('click',openDittaModal);
document.getElementById('btnNuovaDitta2').addEventListener('click',openDittaModal);
setupDropdown('btnNuovaPratica','dropdownPratica',openPraticaModal);
setupDropdown('btnNuovaPratica2','dropdownPratica2',openPraticaModal);

/* INIT */
loadStats();loadHomePratiche();
