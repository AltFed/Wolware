// ══════════════════════════════════════════════════════════════════
// Modulo PrimaNota — Blocco 1
// Gestisce: saldi, filtri, tabella movimenti, clienti da sollecitare
// Da includere in app.js oppure come script separato
// ══════════════════════════════════════════════════════════════════

const PrimaNota = (() => {

  // ── Stato locale ────────────────────────────────────────────────
  let _movimenti = [];
  let _filtroAnno = '';
  let _filtroMese = '0';
  let _filtroTipo = 'tutti';
  let _filtroCerca = '';
  let _sollecitiEspansi = false;
  let _debounceTimer = null;

  // ── Riferimenti DOM ─────────────────────────────────────────────
  const $ = id => document.getElementById(id);

  // ── Init ────────────────────────────────────────────────────────
  async function init() {
    await _caricaAnni();
    await _caricaSaldi();
    await _caricaSolleciti();
    await _caricaMovimenti();
    _bindFiltri();
    _bindSolleciti();
  }

  // ── Carica anni disponibili per il filtro ───────────────────────
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
    } catch (e) {
      console.error('PrimaNota: errore carica anni', e);
    }
  }

  // ── Carica e renderizza card saldi ──────────────────────────────
  async function _caricaSaldi() {
    try {
      const saldi = await fetch('/api/prima-nota/saldi').then(r => r.json());
      const row = $('pnSaldiRow');
      row.innerHTML = '';
      saldi.forEach(s => {
        const card = document.createElement('div');
        card.className = 'pn-saldo-card' + (s.saldo < 0 ? ' pn-saldo-negativo' : '');
        card.innerHTML = `
          <span class="pn-saldo-label">${escHtml(s.nome)}</span>
          <span class="pn-saldo-value">${_formatEur(s.saldo)}</span>
        `;
        row.appendChild(card);
      });
    } catch (e) {
      console.error('PrimaNota: errore carica saldi', e);
    }
  }

  // ── Carica clienti da sollecitare ───────────────────────────────
  async function _caricaSolleciti() {
    try {
      const clienti = await fetch('/api/prima-nota/clienti-da-sollecitare').then(r => r.json());
      const block = $('pnSollecitiBlock');
      const badge = $('pnSollecitiCount');
      const tbody = $('pnSollecitiBody');

      if (clienti.length === 0) {
        block.style.display = 'none';
        return;
      }

      block.style.display = 'block';
      badge.textContent = clienti.length;

      tbody.innerHTML = clienti.map(c => `
        <tr>
          <td><strong>${escHtml(c.ragione_sociale)}</strong></td>
          <td class="col-money" style="color:var(--color-error);font-weight:600">${_formatEur(c.residuo)}</td>
          <td>${c.ultimo_pagamento ? _formatData(c.ultimo_pagamento) : '—'}</td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="PrimaNota.apriSollecito(${c.id})">
              📬
            </button>
          </td>
        </tr>
      `).join('');
    } catch (e) {
      console.error('PrimaNota: errore carica solleciti', e);
    }
  }

  // ── Carica movimenti con filtri attuali ─────────────────────────
  async function _caricaMovimenti() {
    const params = new URLSearchParams();
    if (_filtroAnno) params.set('anno', _filtroAnno);
    if (_filtroMese && _filtroMese !== '0') params.set('mese', _filtroMese);
    if (_filtroTipo && _filtroTipo !== 'tutti') params.set('tipo', _filtroTipo);
    if (_filtroCerca) params.set('cerca', _filtroCerca);

    try {
      _movimenti = await fetch(`/api/prima-nota/movimenti?${params}`).then(r => r.json());
      _renderMovimenti(_movimenti);
    } catch (e) {
      console.error('PrimaNota: errore carica movimenti', e);
    }
  }

  // ── Renderizza tabella movimenti ────────────────────────────────
  function _renderMovimenti(movimenti) {
    const tbody = $('pnMovimentiBody');
    if (!movimenti || movimenti.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="empty-row">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="1.5" opacity="0.25" style="margin-bottom:var(--space-2)">
              <rect x="2" y="5" width="20" height="14" rx="2"/>
              <line x1="2" y1="10" x2="22" y2="10"/>
            </svg>
            <br>Nessun movimento
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = movimenti.map(m => {
      const flagHtml = _renderFlag(m);
      const tipoHtml = _renderTipo(m);
      const nomeHtml = _renderNome(m);
      const importoHtml = `<span class="${m.tipo === 'entrata' ? 'pn-importo-entrata' : m.tipo === 'uscita' ? 'pn-importo-uscita' : 'pn-importo-giroconto'}">${_formatEur(m.importo)}</span>`;
      const dataFmt = _formatData(m.data);
      const categoria = escHtml(m.macrogruppo_nome || '—');
      const note = escHtml(m.descrizione || '—');
      const conto = escHtml(_formatConto(m.tipologia));

      return `<tr data-id="${m.id}">
        <td class="pn-col-flag">${flagHtml}</td>
        <td>${dataFmt}</td>
        <td>${tipoHtml}</td>
        <td>${categoria}</td>
        <td>${nomeHtml}</td>
        <td class="pn-col-note">${note}</td>
        <td>${conto}</td>
        <td class="col-money">${importoHtml}</td>
        <td class="col-actions">
          <button class="btn-icon pn-btn-elimina" title="Elimina" onclick="PrimaNota.eliminaMovimento(${m.id}, ${m.tipo === 'giroconto' ? 'true' : 'false'})">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </td>
      </tr>`;
    }).join('');
  }

  // ── Render flag fatturato ───────────────────────────────────────
  function _renderFlag(m) {
    if (m.tipo !== 'entrata') return '<span class="pn-flag-empty"></span>';
    if (m.flag === 'fatturato') {
      return `<button class="pn-flag pn-flag-v" title="Fatturato — clicca per rimuovere"
        onclick="PrimaNota.rimuoviFatturato(${m.id})">✓</button>`;
    } else if (m.flag === 'urgente') {
      const giorni = m.data ? Math.floor((Date.now() - new Date(m.data)) / 86400000) : 0;
      return `<span class="pn-flag pn-flag-urgente" title="DA FATTURARE URGENTE! Incasso di ${giorni} giorni fa">!</span>`;
    } else {
      return `<span class="pn-flag pn-flag-da-fatturare" title="Da fatturare">○</span>`;
    }
  }

  // ── Render tipo ─────────────────────────────────────────────────
  function _renderTipo(m) {
    if (m.tipo === 'entrata') return '<span class="badge-tipo badge-entrata">Entrata</span>';
    if (m.tipo === 'uscita')  return '<span class="badge-tipo badge-uscita">Uscita</span>';
    const dir = m.giroconto_dir === 'entrata' ? '↓' : '↑';
    return `<span class="badge-tipo badge-giroconto">Giro ${dir}</span>`;
  }

  // ── Render nome (cliccabile per clienti) ────────────────────────
  function _renderNome(m) {
    const nome = escHtml(m.nome_display || m.sottovoce_nome || '—');
    if (m.tipo === 'entrata' && m.macrogruppo_id === 'clienti' && m.sottovoce_id) {
      return `<button class="btn-link pn-nome-cliente" onclick="apriDettaglioCliente(${m.sottovoce_id})">${nome}</button>`;
    }
    return nome;
  }

  // ── Formato conto ───────────────────────────────────────────────
  function _formatConto(tipologia) {
    if (!tipologia) return '—';
    if (tipologia === 'cassa') return 'Cassa';
    if (tipologia.startsWith('banca_')) {
      // Recupera nome dalla card saldi già renderizzata
      const bancaId = tipologia.split('_')[1];
      const card = document.querySelector(`[data-banca-id="${bancaId}"]`);
      return card ? card.dataset.bancaNome : tipologia;
    }
    return tipologia;
  }

  // ── Bind filtri con debounce ────────────────────────────────────
  function _bindFiltri() {
    $('pnFiltroAnno').addEventListener('change', e => {
      _filtroAnno = e.target.value;
      _caricaMovimenti();
    });
    $('pnFiltroMese').addEventListener('change', e => {
      _filtroMese = e.target.value;
      _caricaMovimenti();
    });
    $('pnFiltroTipo').addEventListener('change', e => {
      _filtroTipo = e.target.value;
      _caricaMovimenti();
    });
    $('pnFiltroCerca').addEventListener('input', e => {
      clearTimeout(_debounceTimer);
      _debounceTimer = setTimeout(() => {
        _filtroCerca = e.target.value.trim();
        _caricaMovimenti();
      }, 300);
    });
  }

  // ── Bind toggle sezione solleciti ───────────────────────────────
  function _bindSolleciti() {
    $('pnSollecitiToggle').addEventListener('click', () => {
      _sollecitiEspansi = !_sollecitiEspansi;
      $('pnSollecitiContent').style.display = _sollecitiEspansi ? 'block' : 'none';
      $('pnSollecitiChevron').style.transform = _sollecitiEspansi ? 'rotate(180deg)' : 'rotate(0deg)';
    });
  }

  // ── Elimina movimento (con gestione giroconto) ──────────────────
  async function eliminaMovimento(id, isGiroconto) {
    const msg = isGiroconto
      ? 'Stai eliminando un giroconto: verranno rimossi entrambi i movimenti collegati. Procedere?'
      : 'Eliminare questo movimento?';
    if (!confirm(msg)) return;

    try {
      const res = await fetch(`/api/prima-nota/movimenti/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) {
        await _caricaSaldi();
        await _caricaMovimenti();
        await _caricaSolleciti();
        showToast('Movimento eliminato', 'success');
      } else {
        showToast(data.error || 'Errore eliminazione', 'error');
      }
    } catch (e) {
      showToast('Errore di rete', 'error');
    }
  }

  // ── Rimuovi flag fatturato ──────────────────────────────────────
  async function rimuoviFatturato(id) {
    if (!confirm('Rimuovere il flag fatturato da questo movimento?')) return;
    try {
      const res = await fetch(`/api/prima-nota/movimenti/${id}/rimuovi-fatturato`, { method: 'PATCH' });
      const data = await res.json();
      if (data.ok) {
        await _caricaMovimenti();
        showToast('Flag fatturato rimosso', 'success');
      }
    } catch (e) {
      showToast('Errore di rete', 'error');
    }
  }

  // ── Apri sollecito per un cliente ──────────────────────────────
  function apriSollecito(ditteId) {
    // Deleghiamo alla funzione esistente in app.js per i solleciti
    if (typeof openModalSollecito === 'function') {
      openModalSollecito(ditteId);
    } else {
      // Fallback: apri modal sollecito generico
      const el = document.getElementById('modalSollecito');
      if (el) openModal('modalSollecito');
    }
  }

  // ── Utilità ─────────────────────────────────────────────────────
  function _formatEur(val) {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(val || 0);
  }

  function _formatData(dateStr) {
    if (!dateStr) return '—';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y.slice(2)}`;
  }

  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Refresh pubblico (chiamabile da altri moduli dopo un nuovo mov.) ──
  async function refresh() {
    await _caricaSaldi();
    await _caricaMovimenti();
    await _caricaSolleciti();
  }

  // ── Esposto pubblicamente ───────────────────────────────────────
  return { init, refresh, eliminaMovimento, rimuoviFatturato, apriSollecito };

})();

// ── Auto-init quando si entra nel tab prima-nota ─────────────────
// Aggiungere questo nel listener di switchTab in app.js:
//
//   case 'prima-nota':
//     PrimaNota.init();
//     break;
//
// Oppure, se si usa l'event delegation già presente:
//   document.querySelectorAll('[data-tab]').forEach(el => {
//     el.addEventListener('click', () => {
//       if (el.dataset.tab === 'prima-nota') PrimaNota.init();
//     });
//   });
