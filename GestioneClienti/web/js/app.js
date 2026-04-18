// ================================================================
// icon() - Helper SVG Lucide per template string dinamici
// ================================================================
function icon(name, size, extraStyle) {
    size = size || 14;
    extraStyle = extraStyle || '';
    var base = 'display:inline-block;vertical-align:-2px;flex-shrink:0;' + extraStyle;
    var svgs = {
        'users':           '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
        'pencil':          '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
        'calendar':        '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>',
        'archive-restore': '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h2"/><path d="M20 8v11a2 2 0 0 0-2 2h-2"/><path d="m9 15 3-3 3 3"/><path d="M12 12v9"/>',
        'archive':         '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
        'refresh-cw':      '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
        'wallet':          '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
        'file-text':       '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><line x1="10" x2="14" y1="13" y2="13"/><line x1="8" x2="16" y1="17" y2="17"/>',
        'landmark':        '<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/>',
        'folder':          '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
        'folder-open':     '<path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/>',
        'send':            '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
        'trash-2':         '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
        'receipt':         '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
        'check-circle':    '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>',
        'x-circle':        '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
        'alert-triangle':  '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
        'info':            '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
        'check':           '<path d="M20 6 9 17l-5-5"/>',
        'x':               '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
        'arrow-up-right':  '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
        'building-2':      '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
        'hard-drive':      '<line x1="22" x2="2" y1="12" y2="12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" x2="6.01" y1="16" y2="16"/><line x1="10" x2="10.01" y1="16" y2="16"/>',
        'lock':            '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
        'key':             '<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>',
        'zap':             '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
        'loader-2':        '<path d="M21 12a9 9 0 1 1-6.219-8.56"/>',
        'bar-chart-2':     '<line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/>',
        'clipboard-list':  '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
        'upload':          '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
        'download':        '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
        'circle':          '<circle cx="12" cy="12" r="10"/>',
        'plus':            '<path d="M5 12h14"/><path d="M12 5v14"/>',
        'minus':           '<path d="M5 12h14"/>',
        'save':            '<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/>',
        'file-down':       '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/>',
        'copy':            '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
        'eye':             '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
        'file-spreadsheet':'<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M8 13h2"/><path d="M14 13h2"/><path d="M8 17h2"/><path d="M14 17h2"/>',
        'arrow-down-circle':'<circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="m8 12 4 4 4-4"/>',
        'arrow-up-circle':  '<circle cx="12" cy="12" r="10"/><path d="m16 12-4-4-4 4"/><path d="M12 16V8"/>'
    };
    var paths = svgs[name] || '<circle cx="12" cy="12" r="10"/>';
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="' + base + '">' + paths + '</svg>';
}

// ==================== SCHEDA CLIENTE CDL - VERSIONE EEL + SQLITE ====================const isElectron = false;

// ==================== TOAST E CONFIRM MODERNI ====================
function showToast(message, type = 'success', duration = 3000) {
    // Crea container se non esiste
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    // Crea toast
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    
    const icons = { success: icon('check-circle',20,'color:#1a7a4a'), error: icon('x-circle',20,'color:#c0392b'), warning: icon('alert-triangle',20,'color:#b45309'), info: icon('info',20,'color:#1e4d8c') };
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    container.appendChild(toast); if(typeof lucide!=="undefined")lucide.createIcons();
    
    // Auto rimuovi
    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function showConfirm(title, message, onConfirm, confirmText = 'Elimina', iconEmoji = '') {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
        <div class="confirm-box">
            <div class="confirm-icon">${icon("trash-2",48)}</div>
            <div class="confirm-title">${title}</div>
            <div class="confirm-message">${message}</div>
            <div class="confirm-buttons">
                <button class="confirm-cancel">Annulla</button>
                <button class="confirm-confirm">${confirmText}</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Focus sul pulsante annulla
    overlay.querySelector('.confirm-cancel').focus();
    
    // Eventi
    overlay.querySelector('.confirm-cancel').onclick = () => overlay.remove();
    overlay.querySelector('.confirm-confirm').onclick = () => {
        overlay.remove();
        if (onConfirm) onConfirm();
    };
    
    // Chiudi con ESC
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            overlay.remove();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
    
    // Chiudi cliccando fuori
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
}

// ==================== MOBILE MENU ====================
function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('show');
    }
}

// Chiudi menu mobile quando si clicca su un nav-item
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                toggleMobileMenu();
            }
        });
    });
});

// Funzione globale per formato euro italiano (€ 1.234,56)
function formatoEuro(num) {
    if (num === null || num === undefined || isNaN(num)) return '€ 0,00';
    return '€ ' + parseFloat(num).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Dati - inizializzati vuoti, verranno caricati da Supabase
let clienti = [];
let movimentiStudio = [];
let bancheStudio = [];
let macrogruppiUscite = [];
let macrogruppiEntrate = [];
let pagamenti = [];
let praticheClienti = {};
let tariffariBase = [];
let contabilizzazioni = {};
let impostazioniStudio = {};
let fattureEmesse = [];
let movimentiFatturati = [];
let abbuoniClienti = {};
let datiCaricati = false;
var ultimiEstrattiConto = {};

var macrogruppiDefault = [
    { id: 1, nome: 'Costi Fissi Mensili', voci: [
        { id: 1001, descrizione: 'Cedolini', prezzo: '', mesi: [0], esenteIva: false }
    ] },
    { id: 2, nome: 'Costi Variabili Mensili Paghe', voci: [
        { id: 2001, descrizione: 'Assunzione', prezzo: '', mesi: [0], esenteIva: false },
        { id: 2002, descrizione: 'Variazione', prezzo: '', mesi: [0], esenteIva: false },
        { id: 2003, descrizione: 'Cessazione', prezzo: '', mesi: [0], esenteIva: false }
    ] },
    { id: 3, nome: 'Costi Fissi Annuali Paghe', voci: [] },
    { id: 4, nome: 'Costi Fissi Annuali Contabilita', voci: [] },
    { id: 5, nome: 'Pratiche a Richiesta', voci: [] },
    { id: 6, nome: 'Costi Variabili Annuali Paghe', voci: [] }
];

var tariffarioCorrenteId = null;

let clienteCorrenteId = null;
let tipoMovimentoCorrente = 'entrata';
let pdfClienteId = null;
var modalConModifiche = false; // Traccia se ci sono modifiche non salvate

// Variabili per anteprima PDF
var anteprimaPdfDoc = null;
var anteprimaPdfNomeFile = '';
var anteprimaPdfPercorso = '';
var anteprimaPdfTipo = ''; // 'estratto', 'previsionale', 'fattura', 'sollecito', 'fatturazione', 'sintetico'
var anteprimaDatiFattura = null; // Dati fattura in attesa di conferma
var anteprimaIncassiFatturazione = []; // ID movimenti da marcare come fatturati al salvataggio
var anteprimaPdfClienteId = null; // Cliente associato al PDF (per estratti conto)

// ==================== NAVIGAZIONE ====================
function navigateTo(pageName) {
    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
    document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
    var page = document.getElementById('page-' + pageName);
    if (page) page.classList.add('active');
    var navItem = document.querySelector('.nav-item[data-page="' + pageName + '"]');
    if (navItem) navItem.classList.add('active');
    if (pageName === 'clienti') caricaClienti();
    if (pageName === 'prima-nota-studio') inizializzaPrimaNotaStudio();
    if (pageName === 'impostazioni') caricaImpostazioniStudio();
    if (pageName === 'rendiconto') inizializzaRendiconto();
    if (pageName === 'tariffario-base') caricaTariffariBase();
}

function apriModal(id) { document.getElementById(id).classList.add('show'); }
function chiudiModal(id) { 
    var modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('show');
        // Rimuovi modal dinamici (costi-massivi) dal DOM
        if (id === 'modal-costi-massivi') {
            modal.remove();
        }
    }
}

// ==================== CLIENTI ====================
function caricaClienti() {
    var grid = document.getElementById('clienti-grid');
    var mostraArchiviati = document.getElementById('mostra-archiviati') && document.getElementById('mostra-archiviati').checked;
    
    // Filtra clienti in base al checkbox archiviati
    var clientiFiltrati = clienti.filter(function(c) {
        if (mostraArchiviati) return true; // Mostra tutti
        return !c.archiviato; // Nascondi archiviati
    });
    
    if (clientiFiltrati.length === 0) {
        grid.innerHTML = '<div class="empty-state"><span class="empty-icon">' + icon('building-2',48,'color:#9aa3b2') + '</span><p>Nessun cliente' + (mostraArchiviati ? '' : ' attivo') + '</p><button class="btn-primary" onclick="apriModalNuovoCliente()" style="margin-top:16px;">+ Aggiungi</button></div>';
        return;
    }
    
    // Ordina clienti alfabeticamente
    var clientiOrdinati = clientiFiltrati.slice().sort(function(a, b) {
        return a.denominazione.toLowerCase().localeCompare(b.denominazione.toLowerCase());
    });
    
    // Anno filtro
    var annoFiltro = parseInt(document.getElementById('filtro-anno-clienti').value) || new Date().getFullYear();
    
    // Mesi abbreviati
    var mesiAbbr = ['G', 'F', 'M', 'A', 'M', 'G', 'L', 'A', 'S', 'O', 'N', 'D'];
    
    var html = '<table class="clienti-table"><thead><tr><th>Denominazione</th><th style="text-align:center;">Costi Fissi / Var. Paghe</th><th style="text-align:right;">Dovuto</th><th style="text-align:right;">Pagato</th><th style="text-align:right;">Residuo</th><th style="text-align:center;">Cadenza</th><th style="text-align:center;">Ultimo E/C</th><th style="text-align:center;">Ultimo Pag.</th></tr></thead><tbody>';
    
    // Mappa cadenze per visualizzazione
    var cadenzaLabels = {
        'mensile': 'Mensile',
        'trimestrale': 'Trim.',
        'quadrimestrale': 'Quadr.',
        'semestrale': 'Sem.',
        'libero': 'Libero'
    };
    
    for (var i = 0; i < clientiOrdinati.length; i++) {
        var c = clientiOrdinati[i];
        var stats = calcolaStatsCliente(c.id);
        var residuoClass = stats.residuo > 0 ? 'negativo' : 'positivo';
        
        // Trova ultimo pagamento
        var ultimoPagamento = trovaUltimoPagamento(c.id);
        var ultimoPagStr = ultimoPagamento ? new Date(ultimoPagamento).toLocaleDateString('it-IT') : '-';
        
        // Trova ultimo estratto conto
        var ultimoEC = ultimiEstrattiConto[c.id];
        var ultimoECStr = ultimoEC ? new Date(ultimoEC).toLocaleDateString('it-IT') : '-';
        
        // Cadenza
        var cadenzaLabel = cadenzaLabels[c.cadenzaPagamenti] || 'Libero';
        
        // Badge archiviato
        var archiviatoBadge = c.archiviato ? ' <span class="badge-archiviato">ARCH.</span>' : '';
        var rowClass = c.archiviato ? 'cliente-row archiviato' : 'cliente-row';
        
        // Calcola indicatori mesi per costi fissi e variabili paghe
        var indicatoriHtml = generaIndicatoriMesi(c.id, annoFiltro, mesiAbbr);
        
        html += '<tr class="' + rowClass + '" onclick="apriDettaglioCliente(' + c.id + ')">' +
            '<td class="cliente-nome-cell"><strong>' + c.denominazione + '</strong>' + archiviatoBadge + '</td>' +
            '<td style="text-align:center;">' + indicatoriHtml + '</td>' +
            '<td style="text-align:right;">' + formatoEuro(stats.dovuto) + '</td>' +
            '<td style="text-align:right;" class="positivo">' + formatoEuro(stats.pagato) + '</td>' +
            '<td style="text-align:right;" class="' + residuoClass + '">' + formatoEuro(Math.abs(stats.residuo)) + '</td>' +
            '<td style="text-align:center;"><span class="badge-cadenza badge-' + (c.cadenzaPagamenti || 'libero') + '">' + cadenzaLabel + '</span></td>' +
            '<td style="text-align:center;">' + ultimoECStr + '</td>' +
            '<td style="text-align:center;">' + ultimoPagStr + '</td>' +
            '</tr>';
    }
    
    html += '</tbody></table>';
    grid.innerHTML = html;
}

// Genera indicatori mesi per costi fissi e variabili paghe
function generaIndicatoriMesi(clienteId, anno, mesiAbbr) {
    var pratiche = praticheClienti[clienteId] || {};
    
    var html = '<div style="display:flex;flex-direction:column;gap:2px;">';
    
    // Riga 1: Costi Fissi
    html += '<div style="display:flex;gap:1px;align-items:center;" title="Costi Fissi">';
    html += '<span style="font-size:8px;font-weight:bold;color:#64748b;width:18px;">CF</span>';
    for (var m = 1; m <= 12; m++) {
        var chiaveMese = anno + '-' + (m < 10 ? '0' : '') + m;
        var praticheMese = pratiche[chiaveMese] || {};
        var hasCostiFissi = (praticheMese._costiFissi && praticheMese._costiFissi.length > 0);
        var colore = hasCostiFissi ? '#22c55e' : '#e2e8f0';
        html += '<span style="width:14px;height:12px;background:' + colore + ';border-radius:2px;font-size:7px;display:flex;align-items:center;justify-content:center;color:' + (hasCostiFissi ? '#fff' : '#94a3b8') + ';">' + mesiAbbr[m-1] + '</span>';
    }
    html += '</div>';
    
    // Riga 2: Variabili Paghe (assunzioni, cessazioni, trasformazioni, ecc.)
    html += '<div style="display:flex;gap:1px;align-items:center;" title="Variabili Paghe">';
    html += '<span style="font-size:8px;font-weight:bold;color:#64748b;width:18px;">VP</span>';
    for (var m = 1; m <= 12; m++) {
        var chiaveMese = anno + '-' + (m < 10 ? '0' : '') + m;
        var praticheMese = pratiche[chiaveMese] || {};
        
        // Controlla se ci sono variabili paghe (tutto tranne _costiFissi e _richieste)
        var hasVariabiliPaghe = false;
        for (var tipo in praticheMese) {
            if (tipo === '_costiFissi' || tipo === '_richieste') continue;
            var val = praticheMese[tipo];
            if (typeof val === 'object' && val.qta > 0) {
                hasVariabiliPaghe = true;
                break;
            } else if (typeof val === 'number' && val > 0) {
                hasVariabiliPaghe = true;
                break;
            }
        }
        
        var colore = hasVariabiliPaghe ? '#22c55e' : '#e2e8f0';
        html += '<span style="width:14px;height:12px;background:' + colore + ';border-radius:2px;font-size:7px;display:flex;align-items:center;justify-content:center;color:' + (hasVariabiliPaghe ? '#fff' : '#94a3b8') + ';">' + mesiAbbr[m-1] + '</span>';
    }
    html += '</div>';
    
    html += '</div>';
    return html;
}

function trovaUltimoPagamento(clienteId) {
    var ultimaData = null;
    for (var i = 0; i < pagamenti.length; i++) {
        var p = pagamenti[i];
        if (p.clienteId === clienteId && p.data) {
            if (!ultimaData || p.data > ultimaData) {
                ultimaData = p.data;
            }
        }
    }
    return ultimaData;
}

function filtraClienti() {
    var q = document.getElementById('search-clienti').value.toLowerCase();
    var rows = document.querySelectorAll('.cliente-row');
    for (var i = 0; i < rows.length; i++) {
        var nome = rows[i].querySelector('.cliente-nome-cell').textContent.toLowerCase();
        rows[i].style.display = nome.indexOf(q) >= 0 ? '' : 'none';
    }
}

function apriModalNuovoCliente() {
    document.getElementById('cliente-denominazione').value = '';
    document.getElementById('cliente-cf').value = '';
    document.getElementById('cliente-telefono').value = '';
    document.getElementById('cliente-email').value = '';
    document.getElementById('cliente-residuo-iniziale').value = '0';
    document.getElementById('cliente-cadenza').value = '';
    document.getElementById('cliente-inizio-paghe').value = '';
    document.getElementById('cliente-inizio-contabilita').value = '';
    // Reset bottoni cadenza
    var cadenzaBtns = document.querySelectorAll('.cadenza-btn');
    for (var i = 0; i < cadenzaBtns.length; i++) cadenzaBtns[i].classList.remove('selected');
    // Popola select tariffari
    var sel = document.getElementById('cliente-tariffario');
    var opt = '<option value="">-- Nessun tariffario --</option>';
    for (var i = 0; i < tariffariBase.length; i++) {
        opt += '<option value="' + tariffariBase[i].id + '">' + tariffariBase[i].nome + '</option>';
    }
    sel.innerHTML = opt;
    apriModal('modal-nuovo-cliente');
}

function selezionaCadenza(cadenza) {
    document.getElementById('cliente-cadenza').value = cadenza;
    var btns = document.querySelectorAll('.cadenza-btn');
    for (var i = 0; i < btns.length; i++) {
        btns[i].classList.remove('selected');
        if (btns[i].getAttribute('data-cadenza') === cadenza) {
            btns[i].classList.add('selected');
        }
    }
}

async function salvaCliente() {
    var denominazione = document.getElementById('cliente-denominazione').value.trim();
    if (!denominazione) { showToast('Inserisci denominazione', 'warning'); return; }
    var tariffarioId = document.getElementById('cliente-tariffario').value;
    var residuoIniziale = parseFloat(document.getElementById('cliente-residuo-iniziale').value) || 0;
    var cadenzaPagamenti = document.getElementById('cliente-cadenza').value || 'libero';
    var inizioPaghe = document.getElementById('cliente-inizio-paghe').value || '';
    var inizioContabilita = document.getElementById('cliente-inizio-contabilita').value || '';
    
    // Trova nome tariffario
    var tariffarioNome = 'Nessuno';
    for (var i = 0; i < tariffariBase.length; i++) {
        if (tariffariBase[i].id === parseInt(tariffarioId)) {
            tariffarioNome = tariffariBase[i].nome;
            break;
        }
    }
    
    var cliente = {
        denominazione: denominazione,
        codiceFiscale: document.getElementById('cliente-cf').value.trim(),
        telefono: document.getElementById('cliente-telefono').value.trim(),
        email: document.getElementById('cliente-email').value.trim(),
        tariffario: copiaVociTariffarioBase(tariffarioId),
        tariffarioBaseId: tariffarioId ? parseInt(tariffarioId) : null,
        tariffarioNome: tariffarioNome,
        residuoIniziale: residuoIniziale,
        cadenzaPagamenti: cadenzaPagamenti,
        inizioPaghe: inizioPaghe,
        inizioContabilita: inizioContabilita,
        finePaghe: '',
        fineContabilita: '',
        storicoTariffari: []
    };
    
    // Salva su Supabase
    var saved = await dbSalvaCliente(cliente);
    if (saved) {
        cliente.id = saved.id;
        clienti.push(cliente);
    }
    
    chiudiModal('modal-nuovo-cliente');
    caricaClienti();
}

function copiaVociTariffarioBase(tariffarioId) {
    var voci = [];
    if (!tariffarioId) return voci;
    var tariffario = null;
    for (var i = 0; i < tariffariBase.length; i++) {
        if (tariffariBase[i].id === parseInt(tariffarioId)) { tariffario = tariffariBase[i]; break; }
    }
    if (!tariffario) return voci;
    for (var i = 0; i < tariffario.macrogruppi.length; i++) {
        var mg = tariffario.macrogruppi[i];
        for (var j = 0; j < mg.voci.length; j++) {
            var v = mg.voci[j];
            voci.push({ 
                id: Date.now() + Math.random(), 
                descrizione: v.descrizione, 
                prezzo: v.prezzo, 
                categoriaId: mg.id, 
                categoriaNome: mg.nome,
                mesi: v.mesi ? v.mesi.slice() : [],
                esenteIva: v.esenteIva || false,
                richiedeAnnoPrecedente: v.richiedeAnnoPrecedente || false
            });
        }
    }
    return voci;
}

function calcolaStatsCliente(clienteId) {
    var cliente = null;
    for (var i = 0; i < clienti.length; i++) { if (clienti[i].id === clienteId) { cliente = clienti[i]; break; } }
    if (!cliente) return { dovuto: 0, pagato: 0, residuo: 0, abbuoni: 0 };
    
    // Usa calcolaStatsPeriodo per avere lo stesso calcolo della scheda cliente
    var annoCorrente = new Date().getFullYear();
    var stats = calcolaStatsPeriodo(cliente, { anno: annoCorrente, mese: 1 }, { anno: annoCorrente, mese: 12 });
    
    var dovuto = stats.residuoPrecedente + stats.totaleConIva;
    var pagato = stats.totalePagamenti;
    
    // Calcola totale abbuoni (positivo = diminuisce residuo)
    var totAbbuoni = 0;
    var abbuoniCliente = abbuoniClienti[clienteId] || [];
    for (var i = 0; i < abbuoniCliente.length; i++) {
        totAbbuoni += parseFloat(abbuoniCliente[i].importo) || 0;
    }
    
    return { dovuto: dovuto, pagato: pagato, abbuoni: totAbbuoni, residuo: dovuto - pagato - totAbbuoni };
}

function calcolaTotalePraticheMese(cliente, praticheMese) {
    var totale = 0;
    for (var tipo in praticheMese) {
        if (tipo === '_richieste' || tipo === '_costiFissi') continue; // Gestito separatamente
        var val = praticheMese[tipo];
        var qta, prezzo;
        // Supporta sia vecchio formato (numero) che nuovo (oggetto con qta e prezzo)
        if (typeof val === 'object') {
            qta = val.qta || 0;
            prezzo = val.prezzo || 0;
        } else {
            qta = parseInt(val) || 0;
            prezzo = calcolaPrezzoPratica(cliente, tipo);
        }
        totale += prezzo * qta;
    }
    // Aggiungi pratiche a richiesta
    var richieste = praticheMese._richieste || [];
    for (var i = 0; i < richieste.length; i++) {
        totale += richieste[i].costo || 0;
    }
    // Aggiungi costi fissi contabilizzati
    var costiFissi = praticheMese._costiFissi || [];
    for (var i = 0; i < costiFissi.length; i++) {
        totale += (costiFissi[i].qta || 1) * (costiFissi[i].prezzo || 0);
    }
    return totale;
}

function calcolaPrezzoPratica(cliente, tipo) {
    var tariffario = cliente ? (cliente.tariffario || []) : [];
    
    // Cerca prima una corrispondenza esatta nel nome
    for (var i = 0; i < tariffario.length; i++) {
        var desc = (tariffario[i].descrizione || '').toLowerCase().trim();
        var tipoLower = tipo.toLowerCase().trim();
        
        // Corrispondenza esatta o la descrizione inizia con il tipo
        if (desc === tipoLower || desc.indexOf(tipoLower) === 0) {
            return parseFloat((tariffario[i].prezzo || '0').toString().replace(',', '.')) || 0;
        }
    }
    
    // Cerca nel macrogruppo "Costi Variabili" o simili
    for (var i = 0; i < tariffario.length; i++) {
        var cat = (tariffario[i].categoriaNome || '').toLowerCase();
        var desc = (tariffario[i].descrizione || '').toLowerCase();
        var tipoLower = tipo.toLowerCase();
        
        // Se è nel macrogruppo variabili/paghe e contiene il tipo
        if ((cat.indexOf('variabil') >= 0 || cat.indexOf('paghe') >= 0) && desc.indexOf(tipoLower) >= 0) {
            return parseFloat((tariffario[i].prezzo || '0').toString().replace(',', '.')) || 0;
        }
    }
    
    // Fallback: cerca ovunque contenga il tipo
    for (var i = 0; i < tariffario.length; i++) {
        if (tariffario[i].descrizione && tariffario[i].descrizione.toLowerCase().indexOf(tipo.toLowerCase()) >= 0) {
            return parseFloat((tariffario[i].prezzo || '0').toString().replace(',', '.')) || 0;
        }
    }
    
    return 0;
}

// ==================== DETTAGLIO CLIENTE ====================
function apriDettaglioCliente(id) {
    clienteCorrenteId = id;
    var cliente = null;
    for (var i = 0; i < clienti.length; i++) { if (clienti[i].id === id) { cliente = clienti[i]; break; } }
    if (!cliente) return;
    document.getElementById('dettaglio-cliente-titolo').textContent = cliente.denominazione + (cliente.archiviato ? ' [ARCHIVIATO]' : '');
    var anno = new Date().getFullYear();
    
    // Formatta date gestione (compatte)
    // "In corso" solo se ha data inizio ma non data fine
    var inizioPagheStr = cliente.inizioPaghe ? new Date(cliente.inizioPaghe).toLocaleDateString('it-IT') : '-';
    var finePagheStr = cliente.inizioPaghe ? (cliente.finePaghe ? new Date(cliente.finePaghe).toLocaleDateString('it-IT') : 'In corso') : '-';
    var inizioContabStr = cliente.inizioContabilita ? new Date(cliente.inizioContabilita).toLocaleDateString('it-IT') : '-';
    var fineContabStr = cliente.inizioContabilita ? (cliente.fineContabilita ? new Date(cliente.fineContabilita).toLocaleDateString('it-IT') : 'In corso') : '-';
    
    // Pulsante archivia/ripristina
    var archiviaBtn = cliente.archiviato ? 
        '<button class="btn-link" style="font-size:11px;color:#16a34a;" onclick="ripristinaCliente(' + id + ')">' + icon('archive-restore', 13) + ' Ripristina</button>' :
        '<button class="btn-link" style="font-size:11px;color:#f59e0b;" onclick="archiviaCliente(' + id + ')">' + icon('archive', 13) + ' Archivia</button>';
    
    document.getElementById('dettaglio-cliente-body').innerHTML = 
        '<div style="display:flex;justify-content:space-between;margin-bottom:16px;gap:16px;flex-wrap:wrap;">' +
        // Info cliente a sinistra
        '<div style="flex:1;min-width:280px;">' +
        '<div style="display:flex;gap:20px;flex-wrap:wrap;font-size:13px;margin-bottom:8px;">' +
        '<span><strong>C.F.:</strong> ' + (cliente.codiceFiscale || '-') + '</span>' +
        '<span><strong>Email:</strong> ' + (cliente.email || '-') + '</span>' +
        '<span><strong>Tel:</strong> ' + (cliente.telefono || '-') + '</span>' +
        '</div>' +
        '<div style="display:flex;gap:16px;font-size:12px;color:#64748b;margin-bottom:6px;">' +
        '<span>' + icon('clipboard-list', 13) + ' Paghe: ' + inizioPagheStr + ' → ' + finePagheStr + '</span>' +
        '<span>' + icon('bar-chart-2', 13) + ' Contab: ' + inizioContabStr + ' → ' + fineContabStr + '</span>' +
        '</div>' +
        '<div style="display:flex;gap:12px;">' +
        '<button class="btn-link" style="font-size:11px;" onclick="apriModalModificaCliente(' + id + ')">' + icon('pencil', 13) + ' Modifica</button>' +
        '<button class="btn-link" style="font-size:11px;" onclick="apriModalModificaDateGestione(' + id + ')">' + icon('calendar', 13) + ' Date</button>' +
        archiviaBtn +
        '<button class="btn-link" style="font-size:11px;color:#dc2626;" onclick="eliminaCliente(' + id + ')">' + icon('trash-2',13) + ' Elimina</button>' +
        '</div>' +
        '</div>' +
        // Controlli a destra
        '<div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end;">' +
        '<select id="dettaglio-anno" class="form-select" style="width:100px;" onchange="aggiornaDettaglioCliente()">' + generaOpzioniAnni(anno) + '</select>' +
        '<button class="btn-primary" onclick="apriModalInserisciPratiche()" style="width:100%;">+ Pratiche</button>' +
        '<div style="display:flex;gap:6px;">' +
        '<button class="btn-secondary" style="padding:8px 12px;font-size:12px;" onclick="apriModalPDFCliente(' + id + ')">' + icon('archive-restore', 13) + ' Estratto</button>' +
        '<button class="btn-secondary" style="padding:8px 12px;font-size:12px;" onclick="apriModalFattura(' + id + ')">' + icon('file-text', 13) + ' Fattura</button>' +
        '<button class="btn-secondary" style="padding:8px 12px;font-size:12px;" onclick="apriModalPrevisionale(' + id + ')">' + icon('bar-chart-2', 13) + ' Previsionale</button>' +
        '</div>' +
        '<button class="btn-secondary" style="padding:8px 12px;font-size:12px;width:100%;" onclick="apriModalAbbuono(' + id + ')">' + icon('wallet', 13) + ' Arrotondamento</button>' +
        '</div></div><div id="dettaglio-content"></div>';
    apriModal('modal-dettaglio-cliente');
    aggiornaDettaglioCliente();
}

async function eliminaCliente(id) {
    if (!confirm('Sei sicuro di voler eliminare questo cliente?\nVerranno eliminate anche tutte le pratiche e i pagamenti associati.')) return;
    
    // Elimina da Supabase
    await dbEliminaCliente(id);
    
    clienti = clienti.filter(function(c) { return c.id !== id; });
    delete praticheClienti[id];
    pagamenti = pagamenti.filter(function(p) { return p.clienteId !== id; });
    
    chiudiModal('modal-dettaglio-cliente');
    caricaClienti();
}

function apriModalModificaDateGestione(clienteId) {
    var cliente = null;
    for (var i = 0; i < clienti.length; i++) { if (clienti[i].id === clienteId) { cliente = clienti[i]; break; } }
    if (!cliente) return;
    
    var html = '<div class="modal-overlay show" id="modal-date-gestione">' +
        '<div class="modal-content" style="max-width:450px;">' +
        '<div class="modal-header"><h2>' + icon('calendar', 13) + ' Date Gestione</h2><button class="modal-close" onclick="chiudiModal(\'modal-date-gestione\')">&times;</button></div>' +
        '<div class="modal-body">' +
        '<h4 style="margin-bottom:12px;color:#3b82f6;">' + icon('clipboard-list', 13) + ' Gestione Paghe</h4>' +
        '<div class="form-row">' +
        '<div class="form-group"><label>Data Inizio</label><input type="date" id="edit-inizio-paghe" class="form-input" value="' + (cliente.inizioPaghe || '') + '"></div>' +
        '<div class="form-group"><label>Data Fine</label><input type="date" id="edit-fine-paghe" class="form-input" value="' + (cliente.finePaghe || '') + '"></div>' +
        '</div>' +
        '<h4 style="margin:20px 0 12px;color:#16a34a;">' + icon('bar-chart-2', 13) + ' Gestione Contabilità</h4>' +
        '<div class="form-row">' +
        '<div class="form-group"><label>Data Inizio</label><input type="date" id="edit-inizio-contabilita" class="form-input" value="' + (cliente.inizioContabilita || '') + '"></div>' +
        '<div class="form-group"><label>Data Fine</label><input type="date" id="edit-fine-contabilita" class="form-input" value="' + (cliente.fineContabilita || '') + '"></div>' +
        '</div>' +
        '</div>' +
        '<div class="modal-footer">' +
        '<button class="btn-secondary" onclick="chiudiModal(\'modal-date-gestione\')">Annulla</button>' +
        '<button class="btn-primary" onclick="salvaDateGestione(' + clienteId + ')">Salva</button>' +
        '</div></div></div>';
    
    document.body.insertAdjacentHTML('beforeend', html);
}

function apriModalModificaCliente(clienteId) {
    var cliente = null;
    for (var i = 0; i < clienti.length; i++) { if (clienti[i].id === clienteId) { cliente = clienti[i]; break; } }
    if (!cliente) return;
    
    // Rimuovi modal precedente se esiste
    var oldModal = document.getElementById('modal-modifica-cliente');
    if (oldModal) oldModal.remove();
    
    // Genera opzioni tariffario
    var tariffarioOpt = '<option value="">-- Nessun tariffario --</option>';
    for (var i = 0; i < tariffariBase.length; i++) {
        var t = tariffariBase[i];
        var selected = cliente.tariffarioBaseId === t.id ? ' selected' : '';
        tariffarioOpt += '<option value="' + t.id + '"' + selected + '>' + t.nome + '</option>';
    }
    
    var cadenzaAttuale = cliente.cadenzaPagamenti || 'libero';
    
    var html = '<div class="modal-overlay show" id="modal-modifica-cliente">' +
        '<div class="modal-content" style="max-width:500px;">' +
        '<div class="modal-header"><h2>' + icon('pencil', 13) + ' Modifica Cliente</h2><button class="modal-close" onclick="chiudiModalModifica()">&times;</button></div>' +
        '<div class="modal-body">' +
        '<div class="form-group"><label>Denominazione *</label><input type="text" id="edit-denominazione" class="form-input" value="' + (cliente.denominazione || '') + '"></div>' +
        '<div class="form-row">' +
        '<div class="form-group"><label>C.F. / P.IVA</label><input type="text" id="edit-cf" class="form-input" value="' + (cliente.codiceFiscale || '') + '"></div>' +
        '<div class="form-group"><label>Telefono</label><input type="text" id="edit-telefono" class="form-input" value="' + (cliente.telefono || '') + '"></div>' +
        '</div>' +
        '<div class="form-group"><label>Email</label><input type="email" id="edit-email" class="form-input" value="' + (cliente.email || '') + '"></div>' +
        '<div class="form-group"><label>Indirizzo</label><input type="text" id="edit-indirizzo" class="form-input" value="' + (cliente.indirizzo || '') + '"></div>' +
        '<div class="form-group"><label>Tariffario</label><select id="edit-tariffario" class="form-select">' + tariffarioOpt + '</select></div>' +
        '<div class="form-group"><label>Cadenza Pagamenti</label>' +
        '<div class="cadenza-btns" id="edit-cadenza-container">' +
        '<button type="button" class="cadenza-btn" data-cadenza="mensile" onclick="selezionaCadenzaEdit(this, \'mensile\')">Mensile</button>' +
        '<button type="button" class="cadenza-btn" data-cadenza="trimestrale" onclick="selezionaCadenzaEdit(this, \'trimestrale\')">Trimestrale</button>' +
        '<button type="button" class="cadenza-btn" data-cadenza="quadrimestrale" onclick="selezionaCadenzaEdit(this, \'quadrimestrale\')">Quadrimestrale</button>' +
        '<button type="button" class="cadenza-btn" data-cadenza="semestrale" onclick="selezionaCadenzaEdit(this, \'semestrale\')">Semestrale</button>' +
        '<button type="button" class="cadenza-btn" data-cadenza="libero" onclick="selezionaCadenzaEdit(this, \'libero\')">Libero</button>' +
        '</div><input type="hidden" id="edit-cadenza" value="' + cadenzaAttuale + '"></div>' +
        '<div class="form-group"><label>Residuo iniziale €</label><input type="number" id="edit-residuo" class="form-input" step="0.01" value="' + (cliente.residuoIniziale || 0) + '"></div>' +
        '</div>' +
        '<div class="modal-footer">' +
        '<button class="btn-secondary" onclick="chiudiModalModifica()">Annulla</button>' +
        '<button class="btn-primary" onclick="salvaModificaCliente(' + clienteId + ')">Salva</button>' +
        '</div></div></div>';
    
    document.body.insertAdjacentHTML('beforeend', html);
    
    // Imposta il bottone attivo per la cadenza corrente
    setTimeout(function() {
        var btns = document.querySelectorAll('#edit-cadenza-container .cadenza-btn');
        for (var i = 0; i < btns.length; i++) {
            if (btns[i].getAttribute('data-cadenza') === cadenzaAttuale) {
                btns[i].classList.add('active');
            }
        }
    }, 50);
}

function chiudiModalModifica() {
    var modal = document.getElementById('modal-modifica-cliente');
    if (modal) modal.remove();
}

function selezionaCadenzaEdit(btn, cadenza) {
    // Rimuovi active da tutti
    var btns = document.querySelectorAll('#edit-cadenza-container .cadenza-btn');
    for (var i = 0; i < btns.length; i++) {
        btns[i].classList.remove('active');
    }
    // Aggiungi active al bottone cliccato
    btn.classList.add('active');
    // Aggiorna valore hidden
    document.getElementById('edit-cadenza').value = cadenza;
}

async function salvaModificaCliente(clienteId) {
    var cliente = null;
    for (var i = 0; i < clienti.length; i++) { if (clienti[i].id === clienteId) { cliente = clienti[i]; break; } }
    if (!cliente) return;
    
    var denominazione = document.getElementById('edit-denominazione').value.trim();
    if (!denominazione) { showToast('Inserisci la denominazione', 'warning'); return; }
    
    cliente.denominazione = denominazione;
    cliente.codiceFiscale = document.getElementById('edit-cf').value.trim();
    cliente.telefono = document.getElementById('edit-telefono').value.trim();
    cliente.email = document.getElementById('edit-email').value.trim();
    cliente.indirizzo = document.getElementById('edit-indirizzo').value.trim();
    cliente.cadenzaPagamenti = document.getElementById('edit-cadenza').value || 'libero';
    cliente.residuoIniziale = parseFloat(document.getElementById('edit-residuo').value) || 0;
    
    // Gestione tariffario
    var tariffarioId = document.getElementById('edit-tariffario').value;
    if (tariffarioId) {
        cliente.tariffarioBaseId = parseInt(tariffarioId);
        var tariffarioScelto = null;
        for (var i = 0; i < tariffariBase.length; i++) {
            if (tariffariBase[i].id === cliente.tariffarioBaseId) { tariffarioScelto = tariffariBase[i]; break; }
        }
        if (tariffarioScelto) {
            cliente.tariffario = JSON.parse(JSON.stringify(tariffarioScelto.voci));
        }
    }
    
    // Salva su Supabase
    await dbSalvaCliente(cliente);
    
    // Chiudi modal
    chiudiModalModifica();
    
    // Aggiorna titolo se esiste
    var titoloEl = document.getElementById('dettaglio-cliente-titolo');
    if (titoloEl) titoloEl.textContent = cliente.denominazione;
    
    // Aggiorna viste
    caricaClienti();
    aggiornaDettaglioCliente();
    
    showToast('Cliente modificato!', 'success');
}

async function salvaDateGestione(clienteId) {
    var cliente = null;
    for (var i = 0; i < clienti.length; i++) { if (clienti[i].id === clienteId) { cliente = clienti[i]; break; } }
    if (!cliente) return;
    
    cliente.inizioPaghe = document.getElementById('edit-inizio-paghe').value || '';
    cliente.finePaghe = document.getElementById('edit-fine-paghe').value || '';
    cliente.inizioContabilita = document.getElementById('edit-inizio-contabilita').value || '';
    cliente.fineContabilita = document.getElementById('edit-fine-contabilita').value || '';
    
    // Salva su Supabase
    await dbSalvaCliente(cliente);
    
    // Rimuovi modal
    var modal = document.getElementById('modal-date-gestione');
    if (modal) modal.remove();
    
    // Aggiorna scheda cliente
    apriDettaglioCliente(clienteId);
}

function generaOpzioniAnni(corrente) {
    var html = '';
    // Anni futuri (+2) e passati (-5)
    for (var a = corrente + 2; a >= corrente - 5; a--) html += '<option value="' + a + '"' + (a === corrente ? ' selected' : '') + '>' + a + '</option>';
    return html;
}

function aggiornaDettaglioCliente() {
    var cliente = null;
    for (var i = 0; i < clienti.length; i++) { if (clienti[i].id === clienteCorrenteId) { cliente = clienti[i]; break; } }
    if (!cliente) return;
    var anno = parseInt(document.getElementById('dettaglio-anno').value) || new Date().getFullYear();
    var stats = calcolaStatsClienteAnnoConIva(clienteCorrenteId, anno);
    
    // Calcola totale abbuoni
    var totaleAbbuoni = 0;
    var abbuoniCliente = abbuoniClienti[clienteCorrenteId] || [];
    for (var i = 0; i < abbuoniCliente.length; i++) {
        totaleAbbuoni += parseFloat(abbuoniCliente[i].importo) || 0;
    }
    
    var residuo = stats.residuoPrecedente + stats.totaleConIva - stats.totalePagamenti - totaleAbbuoni;
    
    var html = '<div class="pn-riepilogo">' +
        '<div class="pn-card"><div class="pn-label">Residuo Anni Prec.</div><div class="pn-value">' + formatoEuro(stats.residuoPrecedente) + '</div></div>' +
        '<div class="pn-card"><div class="pn-label">Imponibile</div><div class="pn-value">' + formatoEuro(stats.totaleImponibile) + '</div></div>' +
        '<div class="pn-card"><div class="pn-label">Esente IVA</div><div class="pn-value">' + formatoEuro(stats.totaleEsente) + '</div></div>' +
        '<div class="pn-card"><div class="pn-label">Totale + IVA</div><div class="pn-value">' + formatoEuro(stats.totaleConIva) + '</div></div>' +
        '<div class="pn-card"><div class="pn-label">Pagamenti</div><div class="pn-value positivo">' + formatoEuro(stats.totalePagamenti) + '</div></div>' +
        (totaleAbbuoni !== 0 ? '<div class="pn-card"><div class="pn-label">Arrotondamenti</div><div class="pn-value ' + (totaleAbbuoni > 0 ? 'positivo' : 'negativo') + '">' + (totaleAbbuoni > 0 ? '-' : '+') + formatoEuro(Math.abs(totaleAbbuoni)) + '</div></div>' : '') +
        '<div class="pn-card finale"><div class="pn-label">Saldo</div><div class="pn-value">' + formatoEuro(Math.abs(residuo)) + ' <span class="badge ' + (residuo > 0 ? 'badge-debito' : 'badge-credito') + '">' + (residuo > 0 ? 'DEBITO' : 'CREDITO') + '</span></div></div>' +
        '</div>';
    
    html += '<h3 style="margin:20px 0 12px;">Pratiche ' + anno + '</h3>' + generaPraticheMesiHtml(clienteCorrenteId, anno);
    html += '<h3 style="margin:20px 0 12px;">' + icon('wallet', 13) + ' Arrotondamenti</h3>' + generaAbbuoniHtml(clienteCorrenteId);
    html += '<h3 style="margin:20px 0 12px;">Pagamenti ' + anno + '</h3>' + generaPagamentiHtml(clienteCorrenteId, anno);
    
    // Box Annotazioni
    html += '<h3 style="margin:20px 0 12px;">Annotazioni</h3>';
    html += '<div class="annotazioni-box">' +
        '<textarea id="cliente-annotazioni" class="form-textarea" rows="4" placeholder="Inserisci annotazioni, note, promemoria per questo cliente..." onchange="salvaAnnotazioni(' + cliente.id + ')">' + (cliente.annotazioni || '') + '</textarea>' +
        '</div>';
    
    // Sezione Tariffario con pulsante cambia
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin:20px 0 12px;">' +
        '<h3 style="margin:0;">Tariffario</h3>' +
        '<button class="btn-secondary" onclick="apriModalCambiaTariffario(' + cliente.id + ')">' + icon('refresh-cw', 13) + ' Cambia Tariffario</button>' +
        '</div>';
    
    // Cronologia cambi tariffario
    if (cliente.storicoTariffari && cliente.storicoTariffari.length > 0) {
        html += '<div class="cronologia-tariffari">' +
            '<div class="cronologia-header">Cronologia Cambi Tariffario</div>';
        for (var i = cliente.storicoTariffari.length - 1; i >= 0; i--) {
            var cambio = cliente.storicoTariffari[i];
            var dataCambio = new Date(cambio.data).toLocaleDateString('it-IT');
            html += '<div class="cronologia-item">' +
                '<span class="cronologia-data">' + dataCambio + '</span>' +
                '<span class="cronologia-desc">Da "<strong>' + (cambio.da || 'Nessuno') + '</strong>" a "<strong>' + cambio.a + '</strong>"</span>' +
                '</div>';
        }
        html += '</div>';
    }
    
    html += generaTariffarioHtml(cliente);
    document.getElementById('dettaglio-content').innerHTML = html;
}

function apriModalCambiaTariffario(clienteId) {
    var cliente = null;
    for (var i = 0; i < clienti.length; i++) { if (clienti[i].id === clienteId) { cliente = clienti[i]; break; } }
    if (!cliente) return;
    
    var tariffarioAttuale = cliente.tariffarioNome || 'Personalizzato';
    
    var opt = '';
    for (var i = 0; i < tariffariBase.length; i++) {
        opt += '<option value="' + tariffariBase[i].id + '">' + tariffariBase[i].nome + '</option>';
    }
    
    document.getElementById('modal-pdf-body').innerHTML = 
        '<p style="margin-bottom:16px;">Tariffario attuale: <strong>' + tariffarioAttuale + '</strong></p>' +
        '<div class="form-group"><label>Nuovo Tariffario</label>' +
        '<select id="nuovo-tariffario" class="form-select">' + opt + '</select></div>' +
        '<div style="background:#fef3c7;border-radius:8px;padding:12px;margin-top:16px;">' +
        '<p style="color:#92400e;font-size:13px;margin:0;">️ <strong>Attenzione:</strong> I costi e le pratiche già inseriti manterranno i prezzi del tariffario precedente. Il nuovo tariffario verrà applicato solo ai nuovi mesi.</p>' +
        '</div>';
    
    document.getElementById('modal-pdf').querySelector('.modal-header h2').textContent = 'Cambia Tariffario';
    document.getElementById('modal-pdf').querySelector('.modal-footer .btn-primary').textContent = 'Conferma Cambio';
    document.getElementById('modal-pdf').querySelector('.modal-footer .btn-primary').setAttribute('onclick', 'confermaCambioTariffario(' + clienteId + ')');
    apriModal('modal-pdf');
}

async function confermaCambioTariffario(clienteId) {
    var nuovoTariffarioId = document.getElementById('nuovo-tariffario').value;
    if (!nuovoTariffarioId) { showToast('Seleziona un tariffario', 'warning'); return; }
    
    var nuovoTariffario = null;
    for (var i = 0; i < tariffariBase.length; i++) {
        if (tariffariBase[i].id === parseInt(nuovoTariffarioId)) {
            nuovoTariffario = tariffariBase[i];
            break;
        }
    }
    if (!nuovoTariffario) { showToast('Tariffario non trovato', 'error'); return; }
    
    // Trova cliente
    var clienteIdx = -1;
    var cliente = null;
    for (var i = 0; i < clienti.length; i++) {
        if (clienti[i].id === clienteId) {
            cliente = clienti[i];
            clienteIdx = i;
            break;
        }
    }
    if (!cliente) return;
    
    // Salva nella cronologia
    if (!cliente.storicoTariffari) cliente.storicoTariffari = [];
    cliente.storicoTariffari.push({
        data: new Date().toISOString(),
        da: cliente.tariffarioNome || 'Nessuno',
        a: nuovoTariffario.nome
    });
    
    // Applica nuovo tariffario
    cliente.tariffarioNome = nuovoTariffario.nome;
    cliente.tariffario = copiaVociTariffarioBase(nuovoTariffarioId);
    
    // Salva su Supabase
    clienti[clienteIdx] = cliente;
    await dbSalvaCliente(cliente);
    
    chiudiModal('modal-pdf');
    showToast('Tariffario cambiato! Da: ' + cliente.storicoTariffari[cliente.storicoTariffari.length - 1].da + ' → ' + nuovoTariffario.nome, 'success', 4000);
    aggiornaDettaglioCliente();
}

async function salvaAnnotazioni(clienteId) {
    var annotazioni = document.getElementById('cliente-annotazioni').value;
    for (var i = 0; i < clienti.length; i++) {
        if (clienti[i].id === clienteId) {
            clienti[i].annotazioni = annotazioni;
            await dbSalvaCliente(clienti[i]);
            break;
        }
    }
}

async function salvaPrezziPratiche(clienteId, tipo, valore) {
    for (var i = 0; i < clienti.length; i++) {
        if (clienti[i].id === clienteId) {
            if (!clienti[i].prezziPratiche) clienti[i].prezziPratiche = {};
            clienti[i].prezziPratiche[tipo] = parseFloat(valore) || 0;
            await dbSalvaCliente(clienti[i]);
            break;
        }
    }
    aggiornaDettaglioCliente();
}

function calcolaStatsClienteAnnoConIva(clienteId, anno) {
    var cliente = null;
    for (var i = 0; i < clienti.length; i++) { if (clienti[i].id === clienteId) { cliente = clienti[i]; break; } }
    if (!cliente) return { residuoPrecedente: 0, totaleImponibile: 0, totaleEsente: 0, totaleConIva: 0, totalePagamenti: 0 };
    
    // Usa calcolaStatsPeriodo per calcolare l'anno completo
    var rangeStart = { anno: anno, mese: 1 };
    var rangeEnd = { anno: anno, mese: 12 };
    
    return calcolaStatsPeriodo(cliente, rangeStart, rangeEnd);
}

function calcolaStatsClienteAnno(clienteId, anno) {
    var cliente = null;
    for (var i = 0; i < clienti.length; i++) { if (clienti[i].id === clienteId) { cliente = clienti[i]; break; } }
    if (!cliente) return { residuoPrecedente: 0, totalePratiche: 0, totalePagamenti: 0 };
    
    // Calcola da costiStorico (costi fissi applicati)
    var costiStorico = cliente.costiStorico || {};
    var totCostiAnno = 0, totCostiPrec = 0;
    
    for (var chiave in costiStorico) {
        var a = parseInt(chiave.split('-')[0]);
        var costi = costiStorico[chiave];
        var totMese = 0;
        for (var i = 0; i < costi.length; i++) totMese += costi[i].totale;
        
        if (a === anno) totCostiAnno += totMese;
        else if (a < anno) totCostiPrec += totMese;
    }
    
    // Aggiungi anche pratiche manuali (assunzioni, cessazioni, ecc.)
    var pratiche = praticheClienti[clienteId] || {};
    var totPraticheAnno = 0, totPratichePrec = 0;
    
    for (var k in pratiche) {
        var a = parseInt(k.split('-')[0]);
        var tot = calcolaTotalePraticheMese(cliente, pratiche[k]);
        if (a === anno) totPraticheAnno += tot;
        else if (a < anno) totPratichePrec += tot;
    }
    
    var totAnno = totCostiAnno + totPraticheAnno;
    var totPrec = totCostiPrec + totPratichePrec;
    
    // Pagamenti
    var pagAnno = 0, pagPrec = 0;
    for (var i = 0; i < pagamenti.length; i++) {
        var p = pagamenti[i];
        if (p.clienteId !== clienteId) continue;
        var a = p.data ? parseInt(p.data.substring(0, 4)) : null;
        var imp = parseFloat(p.importo) || 0;
        if (a === anno) pagAnno += imp;
        else if (a < anno) pagPrec += imp;
    }
    return { residuoPrecedente: totPrec - pagPrec, totalePratiche: totAnno, totalePagamenti: pagAnno };
}

function generaPraticheMesiHtml(clienteId, anno) {
    var pratiche = praticheClienti[clienteId] || {};
    var cliente = null;
    for (var i = 0; i < clienti.length; i++) { if (clienti[i].id === clienteId) { cliente = clienti[i]; break; } }
    var mesi = ['', 'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    
    // Colori per tipo pratica
    var coloriPratiche = {
        'Cedolini': '#3b82f6',     // blu
        'Assunzione': '#16a34a',  // verde
        'Variazione': '#ca8a04',  // giallo/oro
        'Cessazione': '#dc2626',  // rosso
        'A Richiesta': '#7c3aed'  // viola
    };
    
    var html = '';
    for (var m = 12; m >= 1; m--) {
        var chiave = anno + '-' + (m < 10 ? '0' : '') + m;
        var pm = pratiche[chiave];
        if (!pm) continue;
        
        // Verifica se ci sono pratiche (escludi _richieste e _costiFissi dal controllo)
        var hasPratiche = false;
        for (var k in pm) {
            if (k === '_richieste' || k === '_costiFissi') continue;
            var val = pm[k];
            // Supporta sia vecchio formato (numero) che nuovo (oggetto con qta)
            var qta = (typeof val === 'object') ? val.qta : val;
            if (qta > 0) { hasPratiche = true; break; }
        }
        if (pm._richieste && pm._richieste.length > 0) hasPratiche = true;
        if (pm._costiFissi && pm._costiFissi.length > 0) hasPratiche = true;
        if (!hasPratiche) continue;
        
        var tot = calcolaTotalePraticheMese(cliente, pm);
        html += '<div class="mese-card">' +
            '<div class="mese-header" onclick="this.parentElement.classList.toggle(\'expanded\')"><span class="mese-nome">' + mesi[m] + '</span><span class="mese-totale">' + formatoEuro(tot) + '</span></div>' +
            '<div class="mese-content"><table class="pratiche-table"><thead><tr><th style="width:200px;">Tipo</th><th>Dettaglio</th><th style="width:120px;text-align:right;">Importo</th><th style="width:80px;text-align:center;">Azioni</th></tr></thead><tbody>';
        
        // Costi fissi contabilizzati
        var costiFissi = pm._costiFissi || [];
        for (var i = 0; i < costiFissi.length; i++) {
            var cf = costiFissi[i];
            var esenteLabel = cf.esenteIva ? '<span class="badge-esente">ESENTE IVA</span>' : '';
            html += '<tr>' +
                '<td><span style="color:#0891b2;font-weight:600;">Costo Fisso</span> ' + esenteLabel + '</td>' +
                '<td><span style="color:#64748b;">' + cf.descrizione + '</span> - Qta: ' + cf.qta + ' × ' + formatoEuro(cf.prezzo) + '</td>' +
                '<td style="text-align:right;font-weight:600;">' + formatoEuro(cf.qta * cf.prezzo) + '</td>' +
                '<td style="text-align:center;">' +
                '<button class="btn-icon btn-icon-danger" onclick="event.stopPropagation(); eliminaCostoFisso(' + clienteId + ',\'' + chiave + '\',' + i + ')" title="Elimina">' + icon('trash-2',14) + '</button>' +
                '</td></tr>';
        }
        
        // Pratiche standard (Cedolini, Assunzione, Variazione, Cessazione)
        for (var tipo in pm) {
            if (tipo === '_richieste' || tipo === '_costiFissi') continue;
            var val = pm[tipo];
            // Supporta sia vecchio formato (numero) che nuovo (oggetto con qta e prezzo)
            var qta, prezzo;
            if (typeof val === 'object') {
                qta = val.qta || 0;
                prezzo = val.prezzo || 0;
            } else {
                qta = val || 0;
                prezzo = calcolaPrezzoPratica(cliente, tipo); // fallback per dati vecchi
            }
            if (qta <= 0) continue;
            var colore = coloriPratiche[tipo] || '#334155';
            html += '<tr>' +
                '<td style="color:' + colore + ';font-weight:600;">' + tipo + '</td>' +
                '<td style="color:#64748b;">Quantità: ' + qta + ' × ' + formatoEuro(prezzo) + '</td>' +
                '<td style="text-align:right;font-weight:600;">' + formatoEuro(prezzo * qta) + '</td>' +
                '<td style="text-align:center;">' +
                '<button class="btn-icon btn-icon-danger" onclick="event.stopPropagation(); eliminaPratica(' + clienteId + ',\'' + chiave + '\',\'' + tipo + '\')" title="Elimina">' + icon('trash-2',14) + '</button>' +
                '</td></tr>';
        }
        
        // Pratiche a richiesta
        var richieste = pm._richieste || [];
        for (var i = 0; i < richieste.length; i++) {
            var r = richieste[i];
            var dataRichiesta = r.data ? new Date(r.data).toLocaleDateString('it-IT') : '-';
            var esenteLabel = r.esenteIva ? '<span class="badge-esente">ESENTE IVA</span>' : '';
            html += '<tr>' +
                '<td><span style="color:#7c3aed;font-weight:600;">A Richiesta</span> ' + esenteLabel + '</td>' +
                '<td><span style="color:#64748b;">' + dataRichiesta + '</span> - ' + r.descrizione + '</td>' +
                '<td style="text-align:right;font-weight:600;">' + formatoEuro(r.costo) + '</td>' +
                '<td style="text-align:center;">' +
                '<button class="btn-icon btn-icon-danger" onclick="event.stopPropagation(); eliminaRichiesta(' + clienteId + ',\'' + chiave + '\',' + r.id + ')" title="Elimina">' + icon('trash-2',14) + '</button>' +
                '</td></tr>';
        }
        
        html += '</tbody></table></div></div>';
    }
    return html || '<p style="color:#94a3b8;text-align:center;">Nessuna pratica</p>';
}

async function modificaRichiesta(clienteId, chiaveMese, richiestaId) {
    var pratiche = praticheClienti[clienteId] || {};
    var pm = pratiche[chiaveMese] || {};
    var richieste = pm._richieste || [];
    
    var richiesta = null;
    var richiestaIdx = -1;
    for (var i = 0; i < richieste.length; i++) {
        if (richieste[i].id === richiestaId) {
            richiesta = richieste[i];
            richiestaIdx = i;
            break;
        }
    }
    if (!richiesta) return;
    
    var nuovaData = prompt('Data (AAAA-MM-GG):', richiesta.data || '');
    if (nuovaData === null) return;
    
    var nuovaDesc = prompt('Descrizione:', richiesta.descrizione);
    if (nuovaDesc === null) return;
    
    var nuovoCosto = prompt('Costo €:', richiesta.costo);
    if (nuovoCosto === null) return;
    nuovoCosto = parseFloat(nuovoCosto) || 0;
    
    var esente = confirm('Esente IVA? (OK = Sì, Annulla = No)');
    
    if (nuovaDesc.trim() === '' || nuovoCosto <= 0) {
        showToast('Descrizione e costo sono obbligatori', 'warning');
        return;
    }
    
    richieste[richiestaIdx] = {
        id: richiestaId,
        data: nuovaData,
        descrizione: nuovaDesc.trim(),
        costo: nuovoCosto,
        esenteIva: esente
    };
    
    pm._richieste = richieste;
    pratiche[chiaveMese] = pm;
    praticheClienti[clienteId] = pratiche;
    await dbSalvaPraticaCliente(clienteId, chiaveMese, pm);
    aggiornaDettaglioCliente();
}

async function eliminaRichiesta(clienteId, chiaveMese, richiestaId) {
    if (!confirm('Eliminare questa pratica a richiesta?')) return;
    
    var pratiche = praticheClienti[clienteId] || {};
    var pm = pratiche[chiaveMese] || {};
    var richieste = pm._richieste || [];
    
    pm._richieste = richieste.filter(function(r) { return r.id !== richiestaId; });
    
    // Se non ci sono più pratiche, elimina il mese
    var hasPratiche = false;
    for (var k in pm) {
        if (k !== '_richieste' && k !== '_costiFissi' && pm[k] > 0) { hasPratiche = true; break; }
    }
    if (pm._richieste && pm._richieste.length > 0) hasPratiche = true;
    if (pm._costiFissi && pm._costiFissi.length > 0) hasPratiche = true;
    
    if (!hasPratiche) {
        delete pratiche[chiaveMese];
        await dbEliminaPraticaCliente(clienteId, chiaveMese);
    } else {
        pratiche[chiaveMese] = pm;
        await dbSalvaPraticaCliente(clienteId, chiaveMese, pm);
    }
    
    praticheClienti[clienteId] = pratiche;
    aggiornaDettaglioCliente();
}

async function eliminaCostoFisso(clienteId, chiaveMese, indice) {
    if (!confirm('Eliminare questo costo fisso?')) return;
    
    var pratiche = praticheClienti[clienteId] || {};
    var pm = pratiche[chiaveMese] || {};
    var costiFissi = pm._costiFissi || [];
    
    // Salva descrizione voce prima di eliminare
    var descrizioneVoce = costiFissi[indice] ? costiFissi[indice].descrizione : null;
    
    costiFissi.splice(indice, 1);
    pm._costiFissi = costiFissi;
    
    // Rimuovi questa voce specifica dalla lista contabilizzazioni
    if (descrizioneVoce) {
        await rimuoviVoceContabilizzata(clienteId, chiaveMese, descrizioneVoce);
    }
    
    // Se non ci sono più pratiche, elimina il mese
    var hasPratiche = false;
    for (var k in pm) {
        if (k !== '_richieste' && k !== '_costiFissi') {
            var val = pm[k];
            var qta = (typeof val === 'object') ? val.qta : val;
            if (qta > 0) { hasPratiche = true; break; }
        }
    }
    if (pm._richieste && pm._richieste.length > 0) hasPratiche = true;
    if (pm._costiFissi && pm._costiFissi.length > 0) hasPratiche = true;
    
    if (!hasPratiche) {
        delete pratiche[chiaveMese];
        await dbEliminaPraticaCliente(clienteId, chiaveMese);
    } else {
        pratiche[chiaveMese] = pm;
        await dbSalvaPraticaCliente(clienteId, chiaveMese, pm);
    }
    
    praticheClienti[clienteId] = pratiche;
    aggiornaDettaglioCliente();
}

async function modificaQtaPratica(clienteId, chiaveMese, tipo) {
    var pratiche = praticheClienti[clienteId] || {};
    var pm = pratiche[chiaveMese] || {};
    var val = pm[tipo];
    
    // Supporta sia vecchio formato che nuovo
    var qtaAttuale, prezzoAttuale;
    if (typeof val === 'object') {
        qtaAttuale = val.qta || 0;
        prezzoAttuale = val.prezzo || 0;
    } else {
        qtaAttuale = val || 0;
        // Trova cliente per calcolare prezzo
        var cliente = null;
        for (var i = 0; i < clienti.length; i++) {
            if (clienti[i].id === clienteId) { cliente = clienti[i]; break; }
        }
        prezzoAttuale = calcolaPrezzoPratica(cliente, tipo);
    }
    
    var nuovaQta = prompt('Modifica quantità per "' + tipo + '":', qtaAttuale);
    if (nuovaQta === null) return;
    nuovaQta = parseInt(nuovaQta);
    
    if (isNaN(nuovaQta) || nuovaQta < 0) {
        showToast('Quantità non valida', 'warning');
        return;
    }
    
    if (nuovaQta === 0) {
        delete pm[tipo];
    } else {
        // Mantiene il prezzo storicizzato
        pm[tipo] = { qta: nuovaQta, prezzo: prezzoAttuale };
    }
    
    // Se non ci sono più pratiche nel mese, elimina la chiave
    var hasContent = false;
    for (var k in pm) {
        if (k === '_richieste') {
            if (pm._richieste && pm._richieste.length > 0) hasContent = true;
        } else {
            hasContent = true;
        }
        if (hasContent) break;
    }
    
    if (!hasContent) {
        delete pratiche[chiaveMese];
        await dbEliminaPraticaCliente(clienteId, chiaveMese);
    } else {
        pratiche[chiaveMese] = pm;
        await dbSalvaPraticaCliente(clienteId, chiaveMese, pm);
    }
    
    praticheClienti[clienteId] = pratiche;
    aggiornaDettaglioCliente();
}

async function eliminaPratica(clienteId, chiaveMese, tipo) {
    if (!confirm('Eliminare "' + tipo + '" da questo mese?')) return;
    
    var pratiche = praticheClienti[clienteId] || {};
    var pm = pratiche[chiaveMese] || {};
    
    delete pm[tipo];
    
    // Se non ci sono più pratiche nel mese, elimina la chiave
    var hasContent = false;
    for (var k in pm) {
        if (k === '_richieste') {
            if (pm._richieste && pm._richieste.length > 0) hasContent = true;
        } else {
            hasContent = true;
        }
        if (hasContent) break;
    }
    
    if (!hasContent) {
        delete pratiche[chiaveMese];
        await dbEliminaPraticaCliente(clienteId, chiaveMese);
    } else {
        pratiche[chiaveMese] = pm;
        await dbSalvaPraticaCliente(clienteId, chiaveMese, pm);
    }
    
    praticheClienti[clienteId] = pratiche;
    aggiornaDettaglioCliente();
}

// ==================== ARROTONDAMENTI/ARROTONDAMENTI ====================
function generaAbbuoniHtml(clienteId) {
    var abbuoni = abbuoniClienti[clienteId] || [];
    
    if (abbuoni.length === 0) {
        return '<div style="background:white;border-radius:10px;padding:16px;text-align:center;color:#94a3b8;">Nessun arrotondamento registrato</div>';
    }
    
    var html = '<div style="background:white;border-radius:10px;overflow:hidden;">';
    html += '<div style="display:flex;padding:10px 16px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-weight:600;font-size:12px;color:#64748b;">' +
        '<span style="width:100px;">Data</span>' +
        '<span style="flex:1;">Note</span>' +
        '<span style="width:120px;text-align:right;">Importo</span>' +
        '<span style="width:50px;"></span>' +
        '</div>';
    
    var totaleAbbuoni = 0;
    for (var i = 0; i < abbuoni.length; i++) {
        var a = abbuoni[i];
        var importo = parseFloat(a.importo) || 0;
        totaleAbbuoni += importo;
        var colore = importo > 0 ? '#16a34a' : '#dc2626';
        var segno = importo > 0 ? '+' : '';
        
        html += '<div style="display:flex;padding:12px 16px;border-bottom:1px solid #f1f5f9;align-items:center;">' +
            '<span style="width:100px;">' + new Date(a.data).toLocaleDateString('it-IT') + '</span>' +
            '<span style="flex:1;color:#64748b;font-size:13px;">' + (a.note || '-') + '</span>' +
            '<span style="width:120px;text-align:right;color:' + colore + ';font-weight:700;">' + segno + formatoEuro(importo) + '</span>' +
            '<span style="width:50px;text-align:right;"><button class="btn-danger" style="padding:4px 8px;font-size:11px;" onclick="eliminaAbbuono(' + clienteId + ',' + a.id + ')">×</button></span>' +
            '</div>';
    }
    
    // Riga totale
    var coloreTot = totaleAbbuoni > 0 ? '#16a34a' : '#dc2626';
    var segnoTot = totaleAbbuoni > 0 ? '+' : '';
    html += '<div style="display:flex;padding:12px 16px;background:#f8fafc;font-weight:600;">' +
        '<span style="flex:1;">Totale Arrotondamenti</span>' +
        '<span style="width:120px;text-align:right;color:' + coloreTot + ';">' + segnoTot + formatoEuro(totaleAbbuoni) + '</span>' +
        '<span style="width:50px;"></span>' +
        '</div>';
    
    return html + '</div>';
}

function apriModalAbbuono(clienteId) {
    var stats = calcolaStatsCliente(clienteId);
    
    document.getElementById('modal-pdf-body').innerHTML = 
        '<p style="margin-bottom:16px;">Residuo attuale: <strong style="color:' + (stats.residuo > 0 ? '#dc2626' : '#16a34a') + ';">' + formatoEuro(stats.residuo) + '</strong></p>' +
        '<div class="form-group"><label>Data</label>' +
        '<input type="date" id="abbuono-data" class="form-input" value="' + new Date().toISOString().split('T')[0] + '"></div>' +
        '<div class="form-group"><label>Tipo</label>' +
        '<select id="abbuono-tipo" class="form-select" onchange="aggiornaPreviewAbbuono(' + clienteId + ')">' +
        '<option value="positivo">Arrotondamento (diminuisce residuo)</option>' +
        '<option value="negativo">Addebito (aumenta residuo)</option>' +
        '</select></div>' +
        '<div class="form-group"><label>Importo (€)</label>' +
        '<input type="number" id="abbuono-importo" class="form-input" step="0.01" min="0" placeholder="Es. 1.60" onchange="aggiornaPreviewAbbuono(' + clienteId + ')"></div>' +
        '<div class="form-group"><label>Note</label>' +
        '<input type="text" id="abbuono-note" class="form-input" placeholder="Es. Arrot. fattura"></div>' +
        '<div id="abbuono-preview" style="margin-top:16px;padding:12px;background:#f0fdf4;border-radius:8px;display:none;">' +
        '</div>';
    
    document.getElementById('modal-pdf').querySelector('.modal-header h2').textContent = 'Nuovo Arrotondamento';
    document.getElementById('modal-pdf').querySelector('.modal-footer .btn-primary').textContent = 'Salva Arrotondamento';
    document.getElementById('modal-pdf').querySelector('.modal-footer .btn-primary').setAttribute('onclick', 'salvaAbbuono(' + clienteId + ')');
    apriModal('modal-pdf');
}

function aggiornaPreviewAbbuono(clienteId) {
    var tipo = document.getElementById('abbuono-tipo').value;
    var importo = parseFloat(document.getElementById('abbuono-importo').value) || 0;
    
    if (importo <= 0) {
        document.getElementById('abbuono-preview').style.display = 'none';
        return;
    }
    
    var stats = calcolaStatsCliente(clienteId);
    var nuovoResiduo = tipo === 'positivo' ? stats.residuo - importo : stats.residuo + importo;
    
    var bgColor = tipo === 'positivo' ? '#f0fdf4' : '#fef2f2';
    var preview = document.getElementById('abbuono-preview');
    preview.style.display = 'block';
    preview.style.background = bgColor;
    preview.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;">' +
        '<span>Residuo attuale:</span><strong>' + formatoEuro(stats.residuo) + '</strong></div>' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">' +
        '<span>' + (tipo === 'positivo' ? 'Abbuono:' : 'Addebito:') + '</span><strong style="color:' + (tipo === 'positivo' ? '#16a34a' : '#dc2626') + ';">' + (tipo === 'positivo' ? '-' : '+') + formatoEuro(importo) + '</strong></div>' +
        '<hr style="margin:8px 0;border:none;border-top:1px solid #e2e8f0;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;">' +
        '<span><strong>Nuovo residuo:</strong></span><strong style="font-size:1.2em;color:' + (nuovoResiduo > 0 ? '#dc2626' : '#16a34a') + ';">' + formatoEuro(nuovoResiduo) + '</strong></div>';
}

async function salvaAbbuono(clienteId) {
    var data = document.getElementById('abbuono-data').value;
    var tipo = document.getElementById('abbuono-tipo').value;
    var importo = parseFloat(document.getElementById('abbuono-importo').value) || 0;
    var note = document.getElementById('abbuono-note').value.trim();
    
    if (!data || importo <= 0) {
        showToast('Inserisci data e importo valido', 'warning');
        return;
    }
    
    // Importo positivo = diminuisce residuo (abbuono), negativo = aumenta residuo (addebito)
    var importoFinale = tipo === 'positivo' ? importo : -importo;
    
    if (!abbuoniClienti[clienteId]) {
        abbuoniClienti[clienteId] = [];
    }
    
    var arrotondamento = { data: data, importo: importoFinale, note: note };
    var result = await dbSalvaArrotondamento(clienteId, arrotondamento);
    if (result) {
        arrotondamento.id = result.id;
        abbuoniClienti[clienteId].push(arrotondamento);
    }
    
    chiudiModal('modal-pdf');
    aggiornaDettaglioCliente();
    caricaClienti();
}

async function eliminaAbbuono(clienteId, abbuonoId) {
    if (!confirm('Eliminare questo arrotondamento?')) return;
    
    await dbEliminaArrotondamento(abbuonoId);
    var abbuoni = abbuoniClienti[clienteId] || [];
    abbuoniClienti[clienteId] = abbuoni.filter(function(a) { return a.id !== abbuonoId; });
    
    aggiornaDettaglioCliente();
    caricaClienti();
}

function generaPagamentiHtml(clienteId, anno) {
    var pags = [];
    for (var i = 0; i < pagamenti.length; i++) {
        var p = pagamenti[i];
        if (p.clienteId === clienteId && p.data && p.data.indexOf(anno) === 0) pags.push(p);
    }
    if (pags.length === 0) return '<p style="color:#94a3b8;text-align:center;">Nessun pagamento</p>';
    
    var html = '<div style="background:white;border-radius:10px;overflow:hidden;">';
    html += '<div style="display:flex;padding:10px 16px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-weight:600;font-size:12px;color:#64748b;"><span style="width:100px;">Data</span><span style="width:100px;">Metodo</span><span style="flex:1;">Note</span><span style="width:100px;text-align:right;">Importo</span></div>';
    
    for (var i = 0; i < pags.length; i++) {
        var p = pags[i];
        // Trova il metodo di pagamento
        var metodo = 'Cassa';
        if (p.tipologia && p.tipologia.indexOf('banca_') === 0) {
            var bancaId = parseInt(p.tipologia.replace('banca_', ''));
            for (var j = 0; j < bancheStudio.length; j++) {
                if (bancheStudio[j].id === bancaId) {
                    metodo = bancheStudio[j].nome;
                    break;
                }
            }
        } else if (p.tipologia === 'cassa') {
            metodo = 'Cassa';
        }
        
        var note = p.note || p.descrizione || '-';
        
        html += '<div style="display:flex;padding:12px 16px;border-bottom:1px solid #f1f5f9;align-items:center;">' +
            '<span style="width:100px;">' + new Date(p.data).toLocaleDateString('it-IT') + '</span>' +
            '<span style="width:100px;color:#64748b;">' + metodo + '</span>' +
            '<span style="flex:1;color:#64748b;font-size:13px;">' + note + '</span>' +
            '<span style="width:100px;text-align:right;color:#16a34a;font-weight:700;">' + formatoEuro(parseFloat(p.importo)) + '</span>' +
            '</div>';
    }
    return html + '</div>';
}

function generaTariffarioHtml(cliente) {
    var t = cliente.tariffario || [];
    if (t.length === 0) return '<p style="color:#94a3b8;text-align:center;">Nessun tariffario applicato</p>';
    
    var mesiNomi = ['Tutti', 'Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    
    // Raggruppa per categoria
    var perCategoria = {};
    for (var i = 0; i < t.length; i++) {
        var cat = t[i].categoriaNome || 'Altro';
        if (!perCategoria[cat]) perCategoria[cat] = [];
        perCategoria[cat].push(t[i]);
    }
    
    var html = '<div class="tariffario-edit-section">';
    
    for (var cat in perCategoria) {
        html += '<div class="tariffario-edit-header">' + cat + '</div>';
        for (var i = 0; i < perCategoria[cat].length; i++) {
            var v = perCategoria[cat][i];
            var mesiVoce = v.mesi || [];
            var qta = v.quantita !== undefined ? v.quantita : 1;
            var esente = v.esenteIva ? true : false;
            
            // Genera stringa mesi applicati
            var mesiStr = '';
            if (mesiVoce.length === 0) {
                mesiStr = '<span style="color:#94a3b8;font-size:11px;">Nessun mese</span>';
            } else if (mesiVoce.indexOf(0) >= 0) {
                mesiStr = '<span style="color:#16a34a;font-size:11px;">Tutti i mesi</span>';
            } else {
                var nomi = [];
                for (var m = 1; m <= 12; m++) {
                    if (mesiVoce.indexOf(m) >= 0) nomi.push(mesiNomi[m]);
                }
                mesiStr = '<span style="color:#3b82f6;font-size:11px;">' + nomi.join(', ') + '</span>';
            }
            
            // Badge esente
            var esenteBadge = esente ? ' <span class="badge-esente">ESENTE IVA</span>' : '';
            
            html += '<div class="tariffario-edit-row" style="flex-wrap:wrap;">' +
                '<div style="display:flex;gap:12px;width:100%;align-items:center;">' +
                '<span class="tariffario-edit-desc" style="flex:2;">' + v.descrizione + esenteBadge + '</span>' +
                '<div style="width:70px;"><input type="number" value="' + qta + '" min="1" style="width:100%;padding:6px 8px;border:1px solid #e2e8f0;border-radius:6px;text-align:center;" onchange="modificaQtaCliente(' + cliente.id + ',' + v.id + ',this.value)" title="Quantità"></div>' +
                '<div class="tariffario-edit-prezzo"><input type="text" value="' + (v.prezzo || '') + '" onchange="modificaPrezzoCliente(' + cliente.id + ',' + v.id + ',this.value)" placeholder="€" title="Prezzo unitario"></div>' +
                '</div>' +
                '<div style="width:100%;margin-top:4px;">' + mesiStr + '</div>' +
                '</div>';
        }
    }
    html += '</div>';
    
    // Mostra storico costi applicati
    html += generaStoricoCostiHtml(cliente.id);
    
    return html;
}

async function modificaQtaCliente(clienteId, voceId, nuovaQta) {
    for (var i = 0; i < clienti.length; i++) {
        if (clienti[i].id === clienteId) {
            for (var j = 0; j < (clienti[i].tariffario || []).length; j++) {
                if (clienti[i].tariffario[j].id === voceId) {
                    clienti[i].tariffario[j].quantita = parseInt(nuovaQta) || 1;
                    break;
                }
            }
            await dbSalvaCliente(clienti[i]);
            break;
        }
    }
}

async function applicaCostiMese(clienteId) {
    var clienteIdx = -1;
    var cliente = null;
    for (var i = 0; i < clienti.length; i++) { 
        if (clienti[i].id === clienteId) { 
            cliente = clienti[i]; 
            clienteIdx = i;
            break; 
        } 
    }
    if (!cliente) { showToast('Cliente non trovato', 'error'); return; }
    
    var tariffario = cliente.tariffario || [];
    if (tariffario.length === 0) { showToast('Nessuna voce nel tariffario', 'warning'); return; }
    
    var oggi = new Date();
    var mesiNomi = ['', 'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    
    var selAnno = prompt('Anno:', oggi.getFullYear());
    if (!selAnno) return;
    selAnno = parseInt(selAnno);
    
    var selMese = prompt('Mese (1-12):', oggi.getMonth() + 1);
    if (!selMese) return;
    selMese = parseInt(selMese);
    
    if (isNaN(selMese) || selMese < 1 || selMese > 12) { showToast('Mese non valido', 'warning'); return; }
    
    var chiave = selAnno + '-' + (selMese < 10 ? '0' : '') + selMese;
    
    // Inizializza costiStorico se non esiste
    if (!cliente.costiStorico) cliente.costiStorico = {};
    
    // Verifica se già applicato
    if (cliente.costiStorico[chiave] && cliente.costiStorico[chiave].length > 0) {
        if (!confirm('I costi per ' + mesiNomi[selMese] + ' ' + selAnno + ' sono già stati applicati.\nVuoi sovrascriverli?')) return;
    }
    cliente.costiStorico[chiave] = [];
    
    // Applica costi per le voci che hanno questo mese selezionato
    var costiApplicati = 0;
    var totale = 0;
    
    for (var i = 0; i < tariffario.length; i++) {
        var v = tariffario[i];
        var mesiVoce = v.mesi || [];
        
        // Controlla se questa voce si applica a questo mese
        // mesi contiene 0 per "Tutti" oppure i numeri dei mesi 1-12
        var siApplica = false;
        if (mesiVoce.indexOf(0) >= 0) siApplica = true; // "Tutti" selezionato
        else if (mesiVoce.indexOf(selMese) >= 0) siApplica = true; // Mese specifico
        
        if (siApplica) {
            var qta = v.quantita !== undefined ? parseInt(v.quantita) : 1;
            if (qta < 1) qta = 1;
            var prezzoStr = (v.prezzo || '0').toString().replace(',', '.');
            var prezzo = parseFloat(prezzoStr) || 0;
            var tot = qta * prezzo;
            
            cliente.costiStorico[chiave].push({
                id: Date.now() + i,
                voceId: v.id,
                descrizione: v.descrizione,
                categoria: v.categoriaNome || 'Altro',
                quantita: qta,
                prezzoUnitario: prezzo,
                totale: tot,
                esenteIva: v.esenteIva || false,
                dataApplicazione: new Date().toISOString()
            });
            costiApplicati++;
            totale += tot;
        }
    }
    
    if (costiApplicati === 0) {
        showToast('Nessuna voce del tariffario è configurata per ' + mesiNomi[selMese], 'warning');
        delete cliente.costiStorico[chiave];
    } else {
        // Salva il cliente aggiornato
        clienti[clienteIdx] = cliente;
        await dbSalvaCliente(cliente);
        showToast('Applicati ' + costiApplicati + ' costi per ' + mesiNomi[selMese] + ' ' + selAnno + '\n\nTotale: ' + formatoEuro(totale));
    }
    
    aggiornaDettaglioCliente();
}

// ==================== PREVISIONALE ====================
function apriModalPrevisionale(clienteId) {
    pdfClienteId = clienteId;
    var oggi = new Date();
    var anno = oggi.getFullYear();
    var meseCorrente = oggi.getMonth() + 1;
    
    var mesiOpt = '<option value="1">Gennaio</option><option value="2">Febbraio</option><option value="3">Marzo</option>' +
        '<option value="4">Aprile</option><option value="5">Maggio</option><option value="6">Giugno</option>' +
        '<option value="7">Luglio</option><option value="8">Agosto</option><option value="9">Settembre</option>' +
        '<option value="10">Ottobre</option><option value="11">Novembre</option><option value="12">Dicembre</option>';
    
    var html = '<p style="margin-bottom:16px;color:#64748b;">Genera un previsionale dei costi fissi basato sul tariffario del cliente.</p>' +
        '<div class="form-group"><label>Tipo previsionale</label>' +
        '<select id="prev-tipo" class="form-select" onchange="aggiornaPrevOpt()">' +
        '<option value="mese">Mese singolo</option>' +
        '<option value="periodo">Periodo (da...a...)</option>' +
        '<option value="anno" selected>Intero anno</option>' +
        '</select></div>' +
        '<div id="prev-opt">' +
        '<div class="form-group"><label>Anno</label><select id="prev-anno" class="form-select">' + generaOpzioniAnni(anno) + '</select></div>' +
        '</div>';
    
    document.getElementById('modal-pdf-body').innerHTML = html;
    document.getElementById('modal-pdf').querySelector('.modal-header h2').textContent = 'Previsionale';
    document.getElementById('modal-pdf').querySelector('.modal-footer .btn-primary').textContent = 'Genera Previsionale';
    document.getElementById('modal-pdf').querySelector('.modal-footer .btn-primary').setAttribute('onclick', 'generaPrevisionale()');
    apriModal('modal-pdf');
}

function aggiornaPrevOpt() {
    var tipo = document.getElementById('prev-tipo').value;
    var anno = new Date().getFullYear();
    
    var mesiOpt = '<option value="1">Gennaio</option><option value="2">Febbraio</option><option value="3">Marzo</option>' +
        '<option value="4">Aprile</option><option value="5">Maggio</option><option value="6">Giugno</option>' +
        '<option value="7">Luglio</option><option value="8">Agosto</option><option value="9">Settembre</option>' +
        '<option value="10">Ottobre</option><option value="11">Novembre</option><option value="12">Dicembre</option>';
    
    if (tipo === 'anno') {
        document.getElementById('prev-opt').innerHTML = 
            '<div class="form-group"><label>Anno</label><select id="prev-anno" class="form-select">' + generaOpzioniAnni(anno) + '</select></div>';
    } else if (tipo === 'mese') {
        document.getElementById('prev-opt').innerHTML = 
            '<div class="form-row">' +
            '<div class="form-group"><label>Anno</label><select id="prev-anno" class="form-select">' + generaOpzioniAnni(anno) + '</select></div>' +
            '<div class="form-group"><label>Mese</label><select id="prev-mese" class="form-select">' + mesiOpt + '</select></div>' +
            '</div>';
    } else { // periodo
        document.getElementById('prev-opt').innerHTML = 
            '<div class="form-group"><label>Anno</label><select id="prev-anno" class="form-select">' + generaOpzioniAnni(anno) + '</select></div>' +
            '<div class="form-row">' +
            '<div class="form-group"><label>Da mese</label><select id="prev-mese-da" class="form-select">' + mesiOpt + '</select></div>' +
            '<div class="form-group"><label>A mese</label><select id="prev-mese-a" class="form-select">' + mesiOpt.replace('value="12"', 'value="12" selected') + '</select></div>' +
            '</div>';
    }
}

function generaPrevisionale() {
    try {
    var cliente = null;
    for (var i = 0; i < clienti.length; i++) { if (clienti[i].id === pdfClienteId) { cliente = clienti[i]; break; } }
    if (!cliente) { showToast('Cliente non trovato', 'error'); return; }
    
    var tariffario = cliente.tariffario || [];
    if (tariffario.length === 0) { 
        showToast('Nessuna voce nel tariffario del cliente. Per generare un previsionale, il cliente deve avere un tariffario con almeno una voce.', 'warning', 5000); 
        return; 
    }
    
    var tipo = document.getElementById('prev-tipo').value;
    var annoSel = parseInt(document.getElementById('prev-anno').value);
    
    // Gestisci i diversi campi in base al tipo
    var meseSel = 1;
    var meseDa = 1;
    var meseA = 12;
    
    if (tipo === 'mese') {
        var meseEl = document.getElementById('prev-mese');
        meseSel = meseEl ? parseInt(meseEl.value) : 1;
    } else if (tipo === 'periodo') {
        var meseDaEl = document.getElementById('prev-mese-da');
        var meseAEl = document.getElementById('prev-mese-a');
        meseDa = meseDaEl ? parseInt(meseDaEl.value) : 1;
        meseA = meseAEl ? parseInt(meseAEl.value) : 12;
    }
    
    chiudiModal('modal-pdf');
    
    var mesiNomi = ['', 'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    var mesiBrevi = ['', 'Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    var giorniPerMese = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    if ((annoSel % 4 === 0 && annoSel % 100 !== 0) || (annoSel % 400 === 0)) {
        giorniPerMese[2] = 29;
    }
    
    function fmtEuro(num) {
        return '€ ' + parseFloat(num).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    
    // Determina range e labels
    var periodoLabel, periodoBreve, nomeFilePeriodo, dataFinePeriodo;
    var rangeStart, rangeEnd;
    
    if (tipo === 'mese') {
        rangeStart = meseSel;
        rangeEnd = meseSel;
        periodoLabel = mesiNomi[meseSel] + ' ' + annoSel;
        periodoBreve = mesiBrevi[meseSel] + ' ' + annoSel;
        nomeFilePeriodo = mesiNomi[meseSel] + ' ' + annoSel;
        dataFinePeriodo = giorniPerMese[meseSel] + '/' + (meseSel < 10 ? '0' : '') + meseSel + '/' + annoSel;
    } else if (tipo === 'periodo') {
        if (meseDa > meseA) { var tmp = meseDa; meseDa = meseA; meseA = tmp; }
        rangeStart = meseDa;
        rangeEnd = meseA;
        periodoLabel = mesiNomi[meseDa] + ' - ' + mesiNomi[meseA] + ' ' + annoSel;
        periodoBreve = mesiBrevi[meseDa] + '-' + mesiBrevi[meseA] + ' ' + annoSel;
        nomeFilePeriodo = mesiBrevi[meseDa] + '-' + mesiBrevi[meseA] + ' ' + annoSel;
        dataFinePeriodo = giorniPerMese[meseA] + '/' + (meseA < 10 ? '0' : '') + meseA + '/' + annoSel;
    } else { // anno
        rangeStart = 1;
        rangeEnd = 12;
        periodoLabel = 'Anno ' + annoSel;
        periodoBreve = 'Gen-Dic ' + annoSel;
        nomeFilePeriodo = 'Anno ' + annoSel;
        dataFinePeriodo = '31/12/' + annoSel;
    }
    
    // Calcola saldo attuale del cliente (punto di partenza)
    var statsAttuali = calcolaStatsCliente(cliente.id);
    var saldoIniziale = statsAttuali.residuo; // Saldo attuale = punto di partenza
    
    // Calcola previsionale per ogni mese basandosi sul tariffario
    // ESCLUDI i costi già contabilizzati in praticheClienti
    var praticheClienteData = praticheClienti[cliente.id] || {};
    var datiMesi = [];
    var saldoProgressivo = saldoIniziale;
    var totaleImponibilePeriodo = 0;
    var totaleEsentePeriodo = 0;
    
    for (var mese = rangeStart; mese <= rangeEnd; mese++) {
        var chiaveMese = annoSel + '-' + (mese < 10 ? '0' : '') + mese;
        var praticheMese = praticheClienteData[chiaveMese] || {};
        var costiFissiGiaContabilizzati = praticheMese._costiFissi || [];
        
        // Crea una lista delle descrizioni già contabilizzate per questo mese
        var descrizioniGiaFatte = [];
        for (var cf = 0; cf < costiFissiGiaContabilizzati.length; cf++) {
            descrizioniGiaFatte.push(costiFissiGiaContabilizzati[cf].descrizione);
        }
        
        var vociMese = [];
        var imponibileMese = 0;
        var esenteMese = 0;
        
        // Scorre il tariffario e trova le voci applicabili a questo mese
        for (var i = 0; i < tariffario.length; i++) {
            var v = tariffario[i];
            var mesiVoce = v.mesi || [];
            
            // La voce si applica se: mesi contiene 0 (tutti i mesi) oppure contiene questo mese specifico
            var siApplica = mesiVoce.indexOf(0) >= 0 || mesiVoce.indexOf(mese) >= 0;
            
            // Salta se già contabilizzato
            if (descrizioniGiaFatte.indexOf(v.descrizione) >= 0) {
                continue;
            }
            
            if (siApplica) {
                var qta = v.quantita !== undefined ? parseInt(v.quantita) : 1;
                if (qta < 1) qta = 1;
                var prezzo = parseFloat((v.prezzo || '0').toString().replace(',', '.')) || 0;
                var tot = qta * prezzo;
                var esente = v.esenteIva || false;
                
                vociMese.push({
                    descrizione: v.descrizione,
                    categoria: v.categoriaNome || 'Costo Fisso',
                    qta: qta,
                    prezzo: prezzo,
                    totale: tot,
                    esente: esente
                });
                
                if (esente) esenteMese += tot;
                else imponibileMese += tot;
            }
        }
        
        var ivaMese = imponibileMese * 0.22;
        var totaleMese = imponibileMese + ivaMese + esenteMese;
        
        totaleImponibilePeriodo += imponibileMese;
        totaleEsentePeriodo += esenteMese;
        
        var saldoPrecMese = saldoProgressivo;
        saldoProgressivo = saldoProgressivo + totaleMese; // No pagamenti nel previsionale
        
        datiMesi.push({
            mese: mese,
            nomeMese: mesiNomi[mese],
            nomeBreve: mesiBrevi[mese],
            voci: vociMese,
            imponibile: imponibileMese,
            esente: esenteMese,
            iva: ivaMese,
            totaleMese: totaleMese,
            saldoPrecedente: saldoPrecMese,
            saldoFineMese: saldoProgressivo
        });
    }
    
    var ivaTotalePeriodo = totaleImponibilePeriodo * 0.22;
    var totalePeriodo = totaleImponibilePeriodo + ivaTotalePeriodo + totaleEsentePeriodo;
    var saldoFinale = saldoIniziale + totalePeriodo;
    
    // ================== GENERA PDF ==================
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF();
    var pw = doc.internal.pageSize.getWidth();
    var ph = doc.internal.pageSize.getHeight();
    var mL = 20, mR = 20;
    var contentW = pw - mL - mR;
    
    // ================== PAGINA 1: COPERTINA + RIEPILOGO ==================
    
    // Header grigio scuro
    doc.setFillColor(51, 65, 85);
    doc.rect(0, 0, pw, 70, 'F');
    
    // Titolo
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text('PREVISIONALE', pw / 2, 28, { align: 'center' });
    
    // Nome cliente
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text(cliente.denominazione.toUpperCase(), pw / 2, 45, { align: 'center' });
    
    // CF/PIVA
    if (cliente.codiceFiscale) {
        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184);
        doc.text('C.F./P.IVA: ' + cliente.codiceFiscale, pw / 2, 58, { align: 'center' });
    }
    
    // Periodo
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text('Periodo: ' + periodoLabel, pw / 2, 66, { align: 'center' });
    
    var y = 85;
    doc.setTextColor(0, 0, 0);
    
    // Box riepilogo
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(mL, y, contentW, 90, 4, 4, 'FD');
    
    y += 18;
    var colLabel = mL + 12;
    var colValue = pw - mR - 12;
    
    doc.setFontSize(11);
    
    // Saldo attuale (punto di partenza)
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Saldo attuale (punto di partenza)', colLabel, y);
    if (saldoIniziale > 0) { doc.setTextColor(220, 38, 38); } else { doc.setTextColor(22, 163, 74); }
    doc.text(fmtEuro(saldoIniziale), colValue, y, { align: 'right' });
    y += 14;
    
    // Competenze previste periodo
    doc.setTextColor(71, 85, 105);
    doc.text('Competenze previste (' + periodoBreve + ')', colLabel, y);
    doc.setTextColor(15, 23, 42);
    doc.text('+ ' + fmtEuro(totalePeriodo), colValue, y, { align: 'right' });
    y += 14;
    
    // Dettaglio competenze
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('   └ Imponibile: ' + fmtEuro(totaleImponibilePeriodo) + ' + IVA: ' + fmtEuro(ivaTotalePeriodo) + ' + Esente: ' + fmtEuro(totaleEsentePeriodo), colLabel, y);
    y += 14;
    
    // Pagamenti previsti (vuoto)
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text('Pagamenti previsti', colLabel, y);
    doc.setTextColor(100, 116, 139);
    doc.text('(non prevedibili)', colValue, y, { align: 'right' });
    y += 8;
    
    // Linea separatrice
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(colLabel, y, colValue, y);
    y += 14;
    
    // SALDO PREVISTO
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('SALDO PREVISTO AL ' + dataFinePeriodo, colLabel, y);
    
    if (saldoFinale > 0) { doc.setTextColor(220, 38, 38); } else { doc.setTextColor(22, 163, 74); }
    doc.setFontSize(15);
    doc.text(fmtEuro(Math.abs(saldoFinale)), colValue, y, { align: 'right' });
    y += 10;
    
    // Badge
    doc.setFontSize(9);
    if (saldoFinale > 0) {
        doc.setTextColor(220, 38, 38);
        doc.text('DEBITO PREVISTO', colValue, y, { align: 'right' });
    } else if (saldoFinale < 0) {
        doc.setTextColor(22, 163, 74);
        doc.text('CREDITO PREVISTO', colValue, y, { align: 'right' });
    }
    
    // ================== PAGINA 2+: TABELLA DETTAGLIO MESI ==================
    doc.addPage();
    
    // Header pagina dettaglio (grigio)
    doc.setFillColor(51, 65, 85);
    doc.rect(0, 0, pw, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DETTAGLIO PREVISIONALE - ' + periodoLabel.toUpperCase(), pw / 2, 16, { align: 'center' });
    
    y = 35;
    
    // Intestazione tabella
    var colW = [50, 55, 45, 40]; // Mese, Competenze, Pagamenti, Saldo
    var colX = [mL, mL + colW[0], mL + colW[0] + colW[1], mL + colW[0] + colW[1] + colW[2]];
    
    doc.setFillColor(241, 245, 249);
    doc.rect(mL, y, contentW, 10, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text('MESE', colX[0] + 2, y + 7);
    doc.text('COMPETENZE', colX[1] + 2, y + 7);
    doc.text('PAGAMENTI', colX[2] + 2, y + 7);
    doc.text('SALDO PROGR.', colX[3] + 2, y + 7);
    y += 12;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    // Prima riga: Saldo iniziale
    doc.setFillColor(254, 249, 195);
    doc.rect(mL, y, contentW, 8, 'F');
    doc.setTextColor(113, 63, 18);
    doc.text('Saldo attuale', colX[0] + 2, y + 6);
    doc.text('-', colX[1] + 2, y + 6);
    doc.text('-', colX[2] + 2, y + 6);
    doc.text(fmtEuro(saldoIniziale), colX[3] + 2, y + 6);
    y += 10;
    
    // Righe mesi (dal più recente)
    for (var i = datiMesi.length - 1; i >= 0; i--) {
        var dm = datiMesi[i];
        
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        
        // Riga mese
        if (i % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(mL, y, contentW, 8, 'F');
        }
        
        doc.setTextColor(15, 23, 42);
        doc.text(dm.nomeMese + ' ' + annoSel, colX[0] + 2, y + 6);
        
        // Competenze
        if (dm.totaleMese > 0) {
            doc.setTextColor(15, 23, 42);
            doc.text(fmtEuro(dm.totaleMese), colX[1] + 2, y + 6);
        } else {
            doc.setTextColor(148, 163, 184);
            doc.text('-', colX[1] + 2, y + 6);
        }
        
        // Pagamenti (sempre vuoto nel previsionale)
        doc.setTextColor(148, 163, 184);
        doc.text('-', colX[2] + 2, y + 6);
        
        // Saldo progressivo
        var saldo = dm.saldoFineMese;
        if (saldo > 0) { doc.setTextColor(220, 38, 38); } else { doc.setTextColor(22, 163, 74); }
        doc.text(fmtEuro(saldo), colX[3] + 2, y + 6);
        
        y += 10;
    }
    
    // Riga totale (grigio)
    y += 2;
    doc.setFillColor(51, 65, 85);
    doc.rect(mL, y, contentW, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTALE PERIODO', colX[0] + 2, y + 7);
    doc.text(fmtEuro(totalePeriodo), colX[1] + 2, y + 7);
    doc.text('-', colX[2] + 2, y + 7);
    doc.text(fmtEuro(saldoFinale), colX[3] + 2, y + 7);
    
    // Footer su tutte le pagine
    var totalPages = doc.internal.getNumberOfPages();
    for (var p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text('Previsionale - ' + cliente.denominazione + ' - Generato il ' + new Date().toLocaleDateString('it-IT') + ' - Pag. ' + p + '/' + totalPages, pw / 2, ph - 10, { align: 'center' });
    }
    
    // Mostra anteprima invece di salvare direttamente
    var fileName = cliente.denominazione + ' Previsionale ' + nomeFilePeriodo + '.pdf';
    var cartella = cliente.denominazione.replace(/[^a-zA-Z0-9 ]/g, '').trim();
    var percorso = 'schede clienti/' + cartella + '/PREVISIONALI/' + fileName;
    
    mostraAnteprimaPDF(doc, fileName, percorso, 'previsionale', icon('bar-chart-2',14) + ' Anteprima Previsionale');
    
    } catch (err) {
        alert('Errore generazione previsionale: ' + err.message);
        console.error('Errore previsionale:', err);
    }
}

function generaStoricoCostiHtml(clienteId) {
    var cliente = null;
    for (var i = 0; i < clienti.length; i++) { if (clienti[i].id === clienteId) { cliente = clienti[i]; break; } }
    if (!cliente || !cliente.costiStorico) return '';
    
    var anno = parseInt(document.getElementById('dettaglio-anno').value) || new Date().getFullYear();
    var mesiNomi = ['', 'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    
    var html = '<h3 style="margin:24px 0 12px;">' + icon('clipboard-list', 13) + ' Costi Applicati ' + anno + '</h3>';
    var trovati = false;
    
    for (var m = 12; m >= 1; m--) {
        var chiave = anno + '-' + (m < 10 ? '0' : '') + m;
        var costi = cliente.costiStorico[chiave];
        if (!costi || costi.length === 0) continue;
        
        trovati = true;
        var totMese = 0;
        for (var i = 0; i < costi.length; i++) totMese += costi[i].totale;
        
        html += '<div class="mese-card" onclick="this.classList.toggle(\'expanded\')">' +
            '<div class="mese-header"><span class="mese-nome">' + mesiNomi[m] + ' ' + anno + '</span><span class="mese-totale">' + formatoEuro(totMese) + '</span></div>' +
            '<div class="mese-content"><table class="pratiche-table"><thead><tr><th>Descrizione</th><th>Qta</th><th>Prezzo</th><th style="text-align:right;">Totale</th></tr></thead><tbody>';
        
        for (var i = 0; i < costi.length; i++) {
            var c = costi[i];
            html += '<tr><td>' + c.descrizione + '</td><td>' + c.quantita + '</td><td>' + formatoEuro(c.prezzoUnitario) + '</td><td style="text-align:right;">' + formatoEuro(c.totale) + '</td></tr>';
        }
        
        html += '</tbody></table></div></div>';
    }
    
    if (!trovati) {
        html += '<p style="color:#94a3b8;text-align:center;">Nessun costo applicato nel ' + anno + '</p>';
    }
    
    return html;
}

async function modificaPrezzoCliente(clienteId, voceId, nuovoPrezzo) {
    for (var i = 0; i < clienti.length; i++) {
        if (clienti[i].id === clienteId) {
            for (var j = 0; j < (clienti[i].tariffario || []).length; j++) {
                if (clienti[i].tariffario[j].id === voceId) {
                    clienti[i].tariffario[j].prezzo = nuovoPrezzo;
                    break;
                }
            }
            await dbSalvaCliente(clienti[i]);
            break;
        }
    }
}

// ==================== COSTI MASSIVI ====================
function apriCostiMassivi() {
    // Rimuovi modal esistente se presente
    var modalEsistente = document.getElementById('modal-costi-massivi');
    if (modalEsistente) {
        modalEsistente.remove();
    }
    
    var oggi = new Date();
    var mese = oggi.getMonth() + 1;
    var meseStr = mese < 10 ? '0' + mese : '' + mese;
    var anno = oggi.getFullYear();
    
    // Genera opzioni tariffari
    var tariffariOpt = '<option value="">-- Seleziona tariffario --</option>';
    for (var i = 0; i < tariffariBase.length; i++) {
        tariffariOpt += '<option value="' + tariffariBase[i].id + '">' + tariffariBase[i].nome + '</option>';
    }
    
    // Mappa tariffari per nome (usa stringa come chiave per consistenza)
    var tariffariMap = {};
    var tariffariMapByName = {};
    for (var i = 0; i < tariffariBase.length; i++) {
        tariffariMap[String(tariffariBase[i].id)] = tariffariBase[i].nome;
        tariffariMapByName[tariffariBase[i].nome] = tariffariBase[i].nome;
    }
    
    // Genera lista clienti per selezione manuale CON tariffario
    var clientiAttivi = clienti.filter(function(c) { return !c.archiviato; });
    clientiAttivi.sort(function(a, b) { return a.denominazione.toLowerCase().localeCompare(b.denominazione.toLowerCase()); });
    
    var clientiCheckboxHtml = '<div class="clienti-checkbox-grid" style="max-height:250px;overflow-y:auto;border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin-top:8px;">';
    for (var i = 0; i < clientiAttivi.length; i++) {
        var c = clientiAttivi[i];
        var nomeTariffario = 'Nessun tariffario';
        
        // Prima prova con tariffarioBaseId
        if (c.tariffarioBaseId) {
            var tariffarioTrovato = tariffariMap[String(c.tariffarioBaseId)];
            if (tariffarioTrovato) {
                nomeTariffario = tariffarioTrovato;
            }
        }
        // Fallback: usa tariffarioNome se esiste
        else if (c.tariffarioNome && c.tariffarioNome !== 'Nessuno') {
            nomeTariffario = c.tariffarioNome;
        }
        
        clientiCheckboxHtml += '<label class="checkbox-item" style="display:flex;gap:8px;margin-bottom:8px;font-size:13px;align-items:center;">' +
            '<input type="checkbox" class="cliente-massivo-check" value="' + c.id + '" checked>' +
            '<span style="flex:1;">' + c.denominazione + '</span>' +
            '<span style="font-size:11px;color:#64748b;background:#f1f5f9;padding:2px 8px;border-radius:4px;">' + nomeTariffario + '</span>' +
            '</label>';
    }
    clientiCheckboxHtml += '</div>';
    clientiCheckboxHtml += '<div style="margin-top:8px;display:flex;gap:8px;">' +
        '<button type="button" class="btn-link" onclick="selezionaTuttiClientiMassivi(true)">Seleziona tutti</button>' +
        '<button type="button" class="btn-link" onclick="selezionaTuttiClientiMassivi(false)">Deseleziona tutti</button></div>';
    
    var html = '<div class="modal-overlay show" id="modal-costi-massivi">' +
        '<div class="modal-content" style="max-width:600px;">' +
        '<div class="modal-header"><h2>' + icon('wallet', 13) + ' Costi Massivi</h2><button class="modal-close" onclick="chiudiModal(\'modal-costi-massivi\')">&times;</button></div>' +
        '<div class="modal-body">' +
        
        // Sezione definizione costo
        '<div style="background:#f8fafc;padding:16px;border-radius:8px;margin-bottom:16px;">' +
        '<h4 style="margin:0 0 12px;color:#1e293b;">Definizione Costo</h4>' +
        '<div class="form-group"><label>Descrizione *</label><input type="text" id="cm-descrizione" class="form-input" placeholder="Es: Invio CU 2026, Autoliquidazione INAIL..."></div>' +
        '<div class="form-row">' +
        '<div class="form-group"><label>Importo € *</label><input type="number" id="cm-importo" class="form-input" step="0.01" min="0" placeholder="0,00"></div>' +
        '<div class="form-group"><label>Quantità</label><input type="number" id="cm-quantita" class="form-input" value="1" min="1"></div>' +
        '</div>' +
        '<div class="form-row">' +
        '<div class="form-group"><label>Mese</label><select id="cm-mese" class="form-select">' +
        '<option value="01"' + (meseStr === '01' ? ' selected' : '') + '>Gennaio</option>' +
        '<option value="02"' + (meseStr === '02' ? ' selected' : '') + '>Febbraio</option>' +
        '<option value="03"' + (meseStr === '03' ? ' selected' : '') + '>Marzo</option>' +
        '<option value="04"' + (meseStr === '04' ? ' selected' : '') + '>Aprile</option>' +
        '<option value="05"' + (meseStr === '05' ? ' selected' : '') + '>Maggio</option>' +
        '<option value="06"' + (meseStr === '06' ? ' selected' : '') + '>Giugno</option>' +
        '<option value="07"' + (meseStr === '07' ? ' selected' : '') + '>Luglio</option>' +
        '<option value="08"' + (meseStr === '08' ? ' selected' : '') + '>Agosto</option>' +
        '<option value="09"' + (meseStr === '09' ? ' selected' : '') + '>Settembre</option>' +
        '<option value="10"' + (meseStr === '10' ? ' selected' : '') + '>Ottobre</option>' +
        '<option value="11"' + (meseStr === '11' ? ' selected' : '') + '>Novembre</option>' +
        '<option value="12"' + (meseStr === '12' ? ' selected' : '') + '>Dicembre</option>' +
        '</select></div>' +
        '<div class="form-group"><label>Anno</label><select id="cm-anno" class="form-select">' + generaOpzioniAnni(anno) + '</select></div>' +
        '</div>' +
        '<label class="checkbox-label" style="margin-top:8px;"><input type="checkbox" id="cm-esente"> Esente IVA</label>' +
        '</div>' +
        
        // Sezione selezione clienti - SOLO 3 OPZIONI
        '<div style="background:#f0f9ff;padding:16px;border-radius:8px;margin-bottom:16px;">' +
        '<h4 style="margin:0 0 12px;color:#1e293b;">Selezione Clienti</h4>' +
        '<div class="form-group">' +
        '<label><input type="radio" name="cm-tipo-selezione" value="tutti" checked onchange="aggiornaSelezioneClientiMassivi()"> Tutti i clienti attivi (' + clientiAttivi.length + ')</label>' +
        '</div>' +
        '<div class="form-group">' +
        '<label><input type="radio" name="cm-tipo-selezione" value="tariffario" onchange="aggiornaSelezioneClientiMassivi()"> Per tariffario applicato</label>' +
        '<select id="cm-tariffario" class="form-select" style="margin-top:8px;display:none;" onchange="filtraClientiMassiviPerTariffario()">' + tariffariOpt + '</select>' +
        '</div>' +
        '<div class="form-group">' +
        '<label><input type="radio" name="cm-tipo-selezione" value="manuale" onchange="aggiornaSelezioneClientiMassivi()"> Selezione manuale</label>' +
        '<div id="cm-clienti-manuali" style="display:none;">' + clientiCheckboxHtml + '</div>' +
        '</div>' +
        '</div>' +
        
        // Anteprima
        '<div id="cm-anteprima" style="background:#f0fdf4;padding:16px;border-radius:8px;border:1px solid #bbf7d0;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;">' +
        '<span><strong>Clienti selezionati:</strong> <span id="cm-num-clienti">' + clientiAttivi.length + '</span></span>' +
        '<span><strong>Totale:</strong> <span id="cm-totale">€ 0,00</span></span>' +
        '</div></div>' +
        
        '</div>' +
        '<div class="modal-footer">' +
        '<button class="btn-secondary" onclick="chiudiModal(\'modal-costi-massivi\')">Annulla</button>' +
        '<button class="btn-primary" onclick="applicaCostiMassivi()">Applica Costo</button>' +
        '</div></div></div>';
    
    document.body.insertAdjacentHTML('beforeend', html);
}

function aggiornaSelezioneClientiMassivi() {
    var tipo = document.querySelector('input[name="cm-tipo-selezione"]:checked').value;
    
    // Nascondi tutti i dropdown/liste
    document.getElementById('cm-tariffario').style.display = 'none';
    document.getElementById('cm-clienti-manuali').style.display = 'none';
    
    // Mostra quello giusto
    if (tipo === 'tariffario') {
        document.getElementById('cm-tariffario').style.display = 'block';
        filtraClientiMassiviPerTariffario();
    } else if (tipo === 'manuale') {
        document.getElementById('cm-clienti-manuali').style.display = 'block';
        aggiornaAnteprimaCostiMassivi();
    } else {
        // Tutti i clienti
        selezionaTuttiClientiMassivi(true);
        aggiornaAnteprimaCostiMassivi();
    }
}

function filtraClientiMassiviPerTariffario() {
    var tariffarioId = parseInt(document.getElementById('cm-tariffario').value);
    var checkboxes = document.querySelectorAll('.cliente-massivo-check');
    
    for (var i = 0; i < checkboxes.length; i++) {
        var clienteId = parseInt(checkboxes[i].value);
        var cliente = clienti.find(function(c) { return c.id === clienteId; });
        
        if (!tariffarioId || (cliente && cliente.tariffarioBaseId === tariffarioId)) {
            checkboxes[i].checked = true;
        } else {
            checkboxes[i].checked = false;
        }
    }
    
    aggiornaAnteprimaCostiMassivi();
}

function selezionaTuttiClientiMassivi(seleziona) {
    var checkboxes = document.querySelectorAll('.cliente-massivo-check');
    for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = seleziona;
    }
    aggiornaAnteprimaCostiMassivi();
}

function aggiornaAnteprimaCostiMassivi() {
    var checkboxes = document.querySelectorAll('.cliente-massivo-check:checked');
    var numClienti = checkboxes.length;
    var importo = parseFloat(document.getElementById('cm-importo').value) || 0;
    var quantita = parseInt(document.getElementById('cm-quantita').value) || 1;
    var totale = numClienti * importo * quantita;
    
    document.getElementById('cm-num-clienti').textContent = numClienti;
    document.getElementById('cm-totale').textContent = formatoEuro(totale);
}

async function applicaCostiMassivi() {
    var descrizione = document.getElementById('cm-descrizione').value.trim();
    var importo = parseFloat(document.getElementById('cm-importo').value) || 0;
    var quantita = parseInt(document.getElementById('cm-quantita').value) || 1;
    var mese = document.getElementById('cm-mese').value;
    var anno = document.getElementById('cm-anno').value;
    var esente = document.getElementById('cm-esente').checked;
    
    if (!descrizione) {
        showToast('Inserisci una descrizione per il costo', 'warning');
        return;
    }
    if (importo <= 0) {
        showToast('Inserisci un importo valido', 'warning');
        return;
    }
    
    var checkboxes = document.querySelectorAll('.cliente-massivo-check:checked');
    if (checkboxes.length === 0) {
        showToast('Seleziona almeno un cliente', 'warning');
        return;
    }
    
    var chiaveMese = anno + '-' + mese;
    var clientiModificati = 0;
    
    for (var i = 0; i < checkboxes.length; i++) {
        var clienteId = parseInt(checkboxes[i].value);
        
        if (!praticheClienti[clienteId]) {
            praticheClienti[clienteId] = {};
        }
        if (!praticheClienti[clienteId][chiaveMese]) {
            praticheClienti[clienteId][chiaveMese] = {};
        }
        if (!praticheClienti[clienteId][chiaveMese]._costiFissi) {
            praticheClienti[clienteId][chiaveMese]._costiFissi = [];
        }
        
        // Aggiungi il costo
        praticheClienti[clienteId][chiaveMese]._costiFissi.push({
            descrizione: descrizione,
            prezzo: importo,
            qta: quantita,
            esenteIva: esente
        });
        
        // Salva su Supabase
        await dbSalvaPraticaCliente(clienteId, chiaveMese, praticheClienti[clienteId][chiaveMese]);
        
        clientiModificati++;
    }
    
    chiudiModal('modal-costi-massivi');
    
    showToast('Costo applicato a ' + clientiModificati + ' clienti!\n\n' +
        'Descrizione: ' + descrizione + '\n' +
        'Importo: ' + formatoEuro(importo) + ' × ' + quantita + '\n' +
        'Periodo: ' + mese + '/' + anno);
}

// Event listener per aggiornare anteprima quando cambia importo
document.addEventListener('input', function(e) {
    if (e.target.id === 'cm-importo' || e.target.id === 'cm-quantita') {
        aggiornaAnteprimaCostiMassivi();
    }
});

// ==================== INSERISCI PRATICHE ====================
function apriModalInserisciPratiche() {
    var cliente = null;
    for (var i = 0; i < clienti.length; i++) { if (clienti[i].id === clienteCorrenteId) { cliente = clienti[i]; break; } }
    if (!cliente) return;
    var oggi = new Date();
    var mese = (oggi.getMonth() + 1);
    var meseStr = mese < 10 ? '0' + mese : '' + mese;
    
    var vociHtml = '<div class="form-group"><label style="color:#7c3aed;font-weight:600;">A Richiesta</label>' +
        '<div id="richieste-container"></div>' +
        '<button type="button" class="btn-secondary" onclick="aggiungiRichiesta()" style="margin-top:8px;">+ Aggiungi pratica a richiesta</button></div>';
    
    document.getElementById('modal-pratiche-body').innerHTML = 
        '<p style="margin-bottom:16px;color:#64748b;">Cliente: <strong>' + cliente.denominazione + '</strong></p>' +
        '<div class="form-row">' +
        '<div class="form-group"><label>Anno</label><select id="pratiche-anno" class="form-select">' + generaOpzioniAnni(oggi.getFullYear()) + '</select></div>' +
        '<div class="form-group"><label>Mese</label><select id="pratiche-mese" class="form-select">' +
        '<option value="01"' + (meseStr === '01' ? ' selected' : '') + '>Gennaio</option>' +
        '<option value="02"' + (meseStr === '02' ? ' selected' : '') + '>Febbraio</option>' +
        '<option value="03"' + (meseStr === '03' ? ' selected' : '') + '>Marzo</option>' +
        '<option value="04"' + (meseStr === '04' ? ' selected' : '') + '>Aprile</option>' +
        '<option value="05"' + (meseStr === '05' ? ' selected' : '') + '>Maggio</option>' +
        '<option value="06"' + (meseStr === '06' ? ' selected' : '') + '>Giugno</option>' +
        '<option value="07"' + (meseStr === '07' ? ' selected' : '') + '>Luglio</option>' +
        '<option value="08"' + (meseStr === '08' ? ' selected' : '') + '>Agosto</option>' +
        '<option value="09"' + (meseStr === '09' ? ' selected' : '') + '>Settembre</option>' +
        '<option value="10"' + (meseStr === '10' ? ' selected' : '') + '>Ottobre</option>' +
        '<option value="11"' + (meseStr === '11' ? ' selected' : '') + '>Novembre</option>' +
        '<option value="12"' + (meseStr === '12' ? ' selected' : '') + '>Dicembre</option>' +
        '</select></div></div>' + vociHtml;
    apriModal('modal-inserisci-pratiche');
}

var richiesteCounter = 0;

function aggiungiRichiesta() {
    richiesteCounter++;
    var oggi = new Date().toISOString().substring(0, 10);
    var container = document.getElementById('richieste-container');
    var div = document.createElement('div');
    div.className = 'richiesta-row';
    div.id = 'richiesta-' + richiesteCounter;
    div.innerHTML = '<div style="display:flex;gap:8px;margin-bottom:8px;align-items:center;flex-wrap:wrap;">' +
        '<input type="date" class="form-input richiesta-data" value="' + oggi + '" style="width:130px;">' +
        '<input type="text" class="form-input richiesta-desc" placeholder="Descrizione..." style="flex:2;min-width:150px;">' +
        '<input type="number" class="form-input richiesta-costo" placeholder="€ Costo" style="width:90px;" min="0" step="0.01">' +
        '<label style="display:flex;align-items:center;gap:4px;font-size:12px;color:#64748b;white-space:nowrap;"><input type="checkbox" class="richiesta-esente"> Esente IVA</label>' +
        '<button type="button" class="btn-icon btn-icon-danger" onclick="rimuoviRichiesta(' + richiesteCounter + ')">' + icon('trash-2',14) + '</button>' +
        '</div>';
    container.appendChild(div);
}

function rimuoviRichiesta(id) {
    var el = document.getElementById('richiesta-' + id);
    if (el) el.remove();
}

async function salvaPraticheMese() {
    var anno = document.getElementById('pratiche-anno').value;
    var mese = document.getElementById('pratiche-mese').value;
    var chiave = anno + '-' + mese;
    
    // Recupera pratiche esistenti del mese
    if (!praticheClienti[clienteCorrenteId]) praticheClienti[clienteCorrenteId] = {};
    if (!praticheClienti[clienteCorrenteId][chiave]) praticheClienti[clienteCorrenteId][chiave] = {};
    var pmEsistenti = praticheClienti[clienteCorrenteId][chiave];
    
    // Inizializza array richieste se non esiste
    if (!pmEsistenti._richieste) pmEsistenti._richieste = [];
    
    var inputs = document.querySelectorAll('.pratica-qta');
    var aggiunte = 0;
    for (var i = 0; i < inputs.length; i++) {
        var qta = parseInt(inputs[i].value) || 0;
        if (qta > 0) {
            var tipo = inputs[i].getAttribute('data-tipo');
            pmEsistenti[tipo] = (pmEsistenti[tipo] || 0) + qta;
            aggiunte += qta;
        }
    }
    
    // Raccogli pratiche a richiesta
    var richiesteRows = document.querySelectorAll('.richiesta-row');
    for (var i = 0; i < richiesteRows.length; i++) {
        var data = richiesteRows[i].querySelector('.richiesta-data').value;
        var desc = richiesteRows[i].querySelector('.richiesta-desc').value.trim();
        var costo = parseFloat(richiesteRows[i].querySelector('.richiesta-costo').value) || 0;
        var esente = richiesteRows[i].querySelector('.richiesta-esente').checked;
        
        if (desc && costo > 0) {
            pmEsistenti._richieste.push({
                id: Date.now() + i,
                data: data,
                descrizione: desc,
                costo: costo,
                esenteIva: esente
            });
            aggiunte++;
        }
    }
    
    if (aggiunte === 0) { showToast('Inserisci almeno una pratica', 'warning'); return; }
    
    praticheClienti[clienteCorrenteId][chiave] = pmEsistenti;
    await dbSalvaPraticaCliente(clienteCorrenteId, chiave, pmEsistenti);
    chiudiModal('modal-inserisci-pratiche');
    aggiornaDettaglioCliente();
}

// ==================== PRIMA NOTA STUDIO ====================
function inizializzaPrimaNotaStudio() {
    var anno = new Date().getFullYear();
    var opt = '';
    for (var a = anno; a >= anno - 5; a--) opt += '<option value="' + a + '">' + a + '</option>';
    document.getElementById('filtro-anno-studio').innerHTML = opt;
    aggiornaSaldi();
    aggiornaMovimentiStudio();
}

function aggiornaSaldi() {
    var cassa = 0;
    var saldi = {};
    for (var i = 0; i < bancheStudio.length; i++) saldi[bancheStudio[i].id] = bancheStudio[i].saldoIniziale || 0;
    for (var i = 0; i < movimentiStudio.length; i++) {
        var m = movimentiStudio[i];
        var imp = parseFloat(m.importo) || 0;
        
        // Per i giroconti, usa girocontoDir per determinare il segno
        var isEntrata;
        if (m.tipo === 'giroconto') {
            isEntrata = m.girocontoDir === 'entrata';
        } else {
            isEntrata = m.tipo === 'entrata';
        }
        
        if (m.tipologia === 'cassa') {
            cassa += isEntrata ? imp : -imp;
        } else if (m.tipologia && m.tipologia.indexOf('banca_') === 0) {
            var bid = parseInt(m.tipologia.replace('banca_', ''));
            if (saldi[bid] !== undefined) saldi[bid] += isEntrata ? imp : -imp;
        }
    }
    var html = '<div class="saldo-card"><div class="saldo-label">Cassa</div><div class="saldo-value">' + formatoEuro(cassa) + '</div></div>';
    for (var i = 0; i < bancheStudio.length; i++) {
        var b = bancheStudio[i];
        html += '<div class="saldo-card"><div class="saldo-label">' + b.nome + '</div><div class="saldo-value">' + formatoEuro(saldi[b.id] || 0) + '</div></div>';
    }
    document.getElementById('saldi-container').innerHTML = html;
}

function aggiornaMovimentiStudio() {
    var anno = document.getElementById('filtro-anno-studio').value;
    var mese = document.getElementById('filtro-mese-studio').value;
    var tipo = document.getElementById('filtro-tipo-studio').value;
    var movs = [];
    for (var i = 0; i < movimentiStudio.length; i++) {
        var m = movimentiStudio[i];
        if (anno && (!m.data || m.data.indexOf(anno) !== 0)) continue;
        if (mese && (!m.data || m.data.substring(5, 7) !== mese)) continue;
        if (tipo && m.tipo !== tipo) continue;
        movs.push(m);
    }
    movs.sort(function(a, b) { return new Date(b.data) - new Date(a.data); });
    if (movs.length === 0) {
        document.getElementById('movimenti-studio-container').innerHTML = '<div class="empty-state"><span class="empty-icon">' + icon('clipboard-list',48,'color:#9aa3b2') + '</span><p>Nessun movimento</p></div>';
        return;
    }
    var html = '<table class="movimenti-table"><thead><tr><th style="width:30px;"></th><th>Data</th><th>Tipo</th><th>Categoria</th><th>Nome</th><th>Note</th><th>Conto</th><th style="text-align:right;">Importo</th><th></th></tr></thead><tbody>';
    for (var i = 0; i < movs.length; i++) {
        var m = movs[i];
        
        // Gestione classi e label per tipo movimento
        var cls, tipoLabel;
        if (m.tipo === 'giroconto') {
            cls = m.girocontoDir === 'entrata' ? 'mov-giroconto-in' : 'mov-giroconto-out';
            tipoLabel = m.girocontoDir === 'entrata' ? icon('refresh-cw',12) + ' Entrata' : icon('refresh-cw',12) + ' Uscita';
        } else {
            cls = m.tipo === 'entrata' ? 'mov-entrata' : 'mov-uscita';
            tipoLabel = m.tipo === 'entrata' ? 'Entrata' : 'Uscita';
        }
        
        var conto = m.tipologia === 'cassa' ? 'Cassa' : '-';
        for (var j = 0; j < bancheStudio.length; j++) {
            if (m.tipologia === 'banca_' + bancheStudio[j].id) { conto = bancheStudio[j].nome; break; }
        }
        var nome = m.sottovoceNome || '-';
        var note = m.descrizione || '-';
        
        // Se è un pagamento cliente, rendi il nome cliccabile
        var nomeHtml = nome;
        if (m.tipo === 'entrata' && m.macrogruppoId === 'clienti' && m.sottovoceId) {
            nomeHtml = '<span class="cliente-link" onclick="apriDettaglioCliente(' + m.sottovoceId + ')">' + nome + '</span>';
        }
        
        // Colonna flag fatturato (per TUTTE le entrate, ma NON per giroconti)
        var flagHtml = '';
        if (m.tipo === 'entrata') {
            var isFatturato = movimentiFatturati.indexOf(m.id) !== -1;
            var dataMov = new Date(m.data);
            var oggi = new Date();
            var diffGiorni = Math.floor((oggi - dataMov) / (1000 * 60 * 60 * 24));
            
            var iconaHtml, titoloFatt, cursorStyle;
            
            if (isFatturato) {
                // Fatturato - verde
                iconaHtml = icon('check', 16, 'color:#1a7a4a');
                titoloFatt = 'Fatturato - clicca per rimuovere';
                cursorStyle = 'cursor:pointer;color:#22c55e;font-size:18px;';
            } else if (diffGiorni > 7) {
                // Non fatturato e > 7 giorni - giallo/arancione (urgente)
                iconaHtml = '';
                titoloFatt = 'DA FATTURARE URGENTE! Incasso di ' + diffGiorni + ' giorni fa';
                cursorStyle = 'cursor:default;color:#f59e0b;font-size:18px;';
            } else {
                // Non fatturato - grigio chiaro
                iconaHtml = '○';
                titoloFatt = 'Da fatturare';
                cursorStyle = 'cursor:default;color:#cbd5e1;font-size:16px;';
            }
            flagHtml = '<span title="' + titoloFatt + '" style="' + cursorStyle + '" onclick="toggleFatturato(' + m.id + ')">' + iconaHtml + '</span>';
        }
        
        html += '<tr><td style="text-align:center;">' + flagHtml + '</td><td>' + new Date(m.data).toLocaleDateString('it-IT') + '</td><td class="' + cls + '">' + tipoLabel + '</td><td>' + (m.macrogruppoNome || '-') + '</td><td>' + nomeHtml + '</td><td>' + note + '</td><td>' + conto + '</td><td style="text-align:right;" class="' + cls + '">' + formatoEuro(parseFloat(m.importo)) + '</td><td><button class="btn-danger" onclick="eliminaMovimento(' + m.id + ')">×</button></td></tr>';
    }
    html += '</tbody></table>';
    document.getElementById('movimenti-studio-container').innerHTML = html;
}

async function eliminaMovimento(id) {
    if (!confirm('Eliminare?')) return;
    var mov = null;
    for (var i = 0; i < movimentiStudio.length; i++) { if (movimentiStudio[i].id === id) { mov = movimentiStudio[i]; break; } }
    if (mov && mov.tipo === 'entrata' && mov.macrogruppoId === 'clienti') {
        for (var i = 0; i < pagamenti.length; i++) {
            if (pagamenti[i].movimentoStudioId === id) { 
                await dbEliminaPagamento(pagamenti[i].id);
                pagamenti.splice(i, 1); 
                break; 
            }
        }
    }
    // Rimuovi anche dai movimenti fatturati se presente
    var idxFatt = movimentiFatturati.indexOf(id);
    if (idxFatt !== -1) {
        movimentiFatturati.splice(idxFatt, 1);
        await dbSalvaMovimentiFatturati(movimentiFatturati);
    }
    await dbEliminaMovimentoStudio(id);
    movimentiStudio = movimentiStudio.filter(function(m) { return m.id !== id; });
    aggiornaSaldi();
    aggiornaMovimentiStudio();
    aggiornaRendiconto();
}

// ==================== FATTURAZIONE INCASSI ====================
async function toggleFatturato(movId) {
    var idx = movimentiFatturati.indexOf(movId);
    if (idx !== -1) {
        // Rimuovi dalla lista fatturati
        movimentiFatturati.splice(idx, 1);
    } else {
        // Non aggiungere da qui - si aggiunge solo tramite "Prepara Fatturazione"
        return;
    }
    await dbSalvaMovimentiFatturati(movimentiFatturati);
    aggiornaMovimentiStudio();
}

function apriPreparaFatturazione() {
    // Raccogli TUTTE le entrate NON ancora fatturate (non solo clienti)
    var entrateDisponibili = [];
    for (var i = 0; i < movimentiStudio.length; i++) {
        var m = movimentiStudio[i];
        if (m.tipo === 'entrata' && movimentiFatturati.indexOf(m.id) === -1) {
            // Se è un cliente, trova i dati cliente
            var cliente = null;
            var isCliente = (m.macrogruppoId === 'clienti');
            if (isCliente) {
                for (var c = 0; c < clienti.length; c++) {
                    if (clienti[c].id === m.sottovoceId) { cliente = clienti[c]; break; }
                }
            }
            entrateDisponibili.push({
                movimento: m,
                cliente: cliente,
                isCliente: isCliente
            });
        }
    }
    
    // Ordina per data decrescente
    entrateDisponibili.sort(function(a, b) { return new Date(b.movimento.data) - new Date(a.movimento.data); });
    
    if (entrateDisponibili.length === 0) {
        showToast('Nessun incasso da fatturare disponibile', 'warning');
        return;
    }
    
    // Crea HTML per la selezione
    var html = '<div style="max-height: 400px; overflow-y: auto;">';
    html += '<table class="movimenti-table" style="font-size: 13px;"><thead><tr>';
    html += '<th style="width:40px;"><input type="checkbox" id="seleziona-tutti-fatt" onchange="toggleTuttiFatturazione()"></th>';
    html += '<th>Data</th><th>Soggetto</th><th>Categoria</th><th style="text-align:right;">Importo</th>';
    html += '</tr></thead><tbody>';
    
    for (var i = 0; i < entrateDisponibili.length; i++) {
        var e = entrateDisponibili[i];
        var m = e.movimento;
        var cl = e.cliente;
        
        // Determina categoria
        var categoria = '';
        if (e.isCliente) {
            categoria = getTipoCliente(cl);
        } else {
            categoria = m.macrogruppoNome || '-';
        }
        
        html += '<tr>';
        html += '<td style="text-align:center;"><input type="checkbox" class="fatt-check" data-movid="' + m.id + '"></td>';
        html += '<td>' + new Date(m.data).toLocaleDateString('it-IT') + '</td>';
        html += '<td>' + (m.sottovoceNome || '-') + '</td>';
        html += '<td>' + categoria + '</td>';
        html += '<td style="text-align:right;color:#059669;font-weight:bold;">' + formatoEuro(parseFloat(m.importo)) + '</td>';
        html += '</tr>';
    }
    
    html += '</tbody></table></div>';
    html += '<div style="margin-top:15px;padding-top:15px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">';
    html += '<span id="fatt-totale-selezionato" style="font-weight:bold;">Selezionati: 0 - Totale: € 0,00</span>';
    html += '</div>';
    
    document.getElementById('modal-pdf-body').innerHTML = html;
    document.getElementById('modal-pdf').querySelector('.modal-header h2').textContent = 'Fatturazione';
    document.getElementById('modal-pdf').querySelector('.modal-footer .btn-primary').textContent = 'Genera Documento';
    document.getElementById('modal-pdf').querySelector('.modal-footer .btn-primary').setAttribute('onclick', 'generaDocumentoFatturazione()');
    apriModal('modal-pdf');
    
    // Aggiungi listener per aggiornare totale
    setTimeout(function() {
        var checks = document.querySelectorAll('.fatt-check');
        for (var i = 0; i < checks.length; i++) {
            checks[i].addEventListener('change', aggiornaTotaleFatturazione);
        }
    }, 100);
}

function getTipoCliente(cliente) {
    if (!cliente) return '-';
    
    var oggi = new Date();
    var isPaghe = false, isContab = false;
    
    // Verifica Paghe
    if (cliente.inizioPaghe) {
        var inizioP = new Date(cliente.inizioPaghe);
        var fineP = cliente.finePaghe ? new Date(cliente.finePaghe) : null;
        if (inizioP <= oggi && (!fineP || fineP >= oggi)) {
            isPaghe = true;
        }
    }
    
    // Verifica Contabilità
    if (cliente.inizioContabilita) {
        var inizioC = new Date(cliente.inizioContabilita);
        var fineC = cliente.fineContabilita ? new Date(cliente.fineContabilita) : null;
        if (inizioC <= oggi && (!fineC || fineC >= oggi)) {
            isContab = true;
        }
    }
    
    if (isPaghe && isContab) return 'Paghe + Contabilità';
    if (isPaghe) return 'Paghe';
    if (isContab) return 'Contabilità';
    return '-';
}

function haPagheAttive(cliente) {
    if (!cliente || !cliente.inizioPaghe) return false;
    var oggi = new Date();
    var inizioP = new Date(cliente.inizioPaghe);
    var fineP = cliente.finePaghe ? new Date(cliente.finePaghe) : null;
    return inizioP <= oggi && (!fineP || fineP >= oggi);
}

function toggleTuttiFatturazione() {
    var tutti = document.getElementById('seleziona-tutti-fatt').checked;
    var checks = document.querySelectorAll('.fatt-check');
    for (var i = 0; i < checks.length; i++) {
        checks[i].checked = tutti;
    }
    aggiornaTotaleFatturazione();
}

function aggiornaTotaleFatturazione() {
    var checks = document.querySelectorAll('.fatt-check:checked');
    var totale = 0;
    for (var i = 0; i < checks.length; i++) {
        var movId = parseInt(checks[i].getAttribute('data-movid'));
        for (var j = 0; j < movimentiStudio.length; j++) {
            if (movimentiStudio[j].id === movId) {
                totale += parseFloat(movimentiStudio[j].importo) || 0;
                break;
            }
        }
    }
    document.getElementById('fatt-totale-selezionato').innerHTML = 
        'Selezionati: <strong>' + checks.length + '</strong> - Totale: <strong style="color:#059669;">' + formatoEuro(totale) + '</strong>';
}

async function generaDocumentoFatturazione() {
    var checks = document.querySelectorAll('.fatt-check:checked');
    if (checks.length === 0) {
        showToast('Seleziona almeno un incasso da fatturare', 'warning');
        return;
    }
    
    // Raccogli dati selezionati
    var incassiSelezionati = [];
    for (var i = 0; i < checks.length; i++) {
        var movId = parseInt(checks[i].getAttribute('data-movid'));
        for (var j = 0; j < movimentiStudio.length; j++) {
            if (movimentiStudio[j].id === movId) {
                var m = movimentiStudio[j];
                var cliente = null;
                for (var c = 0; c < clienti.length; c++) {
                    if (clienti[c].id === m.sottovoceId) { cliente = clienti[c]; break; }
                }
                incassiSelezionati.push({
                    movId: movId,
                    data: m.data,
                    nomeCliente: m.sottovoceNome || '-',
                    importo: parseFloat(m.importo) || 0,
                    tipoCliente: getTipoCliente(cliente),
                    cliente: cliente
                });
                break;
            }
        }
    }
    
    chiudiModal('modal-pdf');
    
    // Genera PDF
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF('portrait', 'mm', 'a4');
    var pw = 210, ph = 297;
    var mL = 15, mR = 15, mT = 15;
    var contentW = pw - mL - mR;
    
    var fmtEuro = function(v) { return '€ ' + (v || 0).toFixed(2).replace('.', ','); };
    var oggi = new Date();
    var dataDoc = oggi.toLocaleDateString('it-IT');
    
    var y = mT;
    
    // Header
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(mL, y, contentW, 14, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('INCASSI DA FATTURARE', pw / 2, y + 9, { align: 'center' });
    y += 20;
    
    // Data documento
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('Data: ' + dataDoc, mL, y);
    doc.text('Incassi selezionati: ' + incassiSelezionati.length, pw - mR, y, { align: 'right' });
    y += 10;
    
    // Linea
    doc.setDrawColor(200, 200, 200);
    doc.line(mL, y, pw - mR, y);
    y += 8;
    
    // Header tabella
    doc.setFillColor(241, 245, 249);
    doc.rect(mL, y - 2, contentW, 10, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text('DATA INCASSO', mL + 5, y + 5);
    doc.text('CLIENTE', mL + 40, y + 5);
    doc.text('TIPO', mL + 115, y + 5);
    doc.text('IMPORTO', pw - mR - 5, y + 5, { align: 'right' });
    y += 14;
    
    // Righe
    var totaleGenerale = 0;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    for (var i = 0; i < incassiSelezionati.length; i++) {
        var inc = incassiSelezionati[i];
        
        if (i % 2 === 0) {
            doc.setFillColor(250, 250, 252);
            doc.rect(mL, y - 3, contentW, 8, 'F');
        }
        
        doc.setTextColor(51, 65, 85);
        doc.text(new Date(inc.data).toLocaleDateString('it-IT'), mL + 5, y + 2);
        
        // Tronca nome cliente se troppo lungo
        var nomeCliente = inc.nomeCliente;
        if (nomeCliente.length > 35) nomeCliente = nomeCliente.substring(0, 32) + '...';
        doc.text(nomeCliente, mL + 40, y + 2);
        
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(inc.tipoCliente, mL + 115, y + 2);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(5, 150, 105);
        doc.text(fmtEuro(inc.importo), pw - mR - 5, y + 2, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        
        totaleGenerale += inc.importo;
        y += 8;
        
        // Check overflow
        if (y > ph - 40) {
            doc.addPage();
            y = mT + 10;
        }
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text('Documento generato il ' + dataDoc + ' - Ricordati di emettere fattura entro 12 giorni dall\'incasso', pw / 2, ph - 10, { align: 'center' });
    
    // Salva gli ID degli incassi selezionati per marcarli come fatturati al salvataggio
    anteprimaIncassiFatturazione = [];
    for (var i = 0; i < incassiSelezionati.length; i++) {
        anteprimaIncassiFatturazione.push(incassiSelezionati[i].movId);
    }
    
    // Nome file
    var dataFile = oggi.getFullYear() + '-' + String(oggi.getMonth() + 1).padStart(2, '0') + '-' + String(oggi.getDate()).padStart(2, '0');
    var fileName = 'Fatturazione_' + dataFile + '.pdf';
    var percorso = 'FATTURAZIONE/' + fileName;
    
    mostraAnteprimaPDF(doc, fileName, percorso, 'fatturazione', icon('receipt',14) + ' Anteprima Fatturazione');
}

// ==================== REGISTRA MOVIMENTO ====================
function apriRegistraMovimento() {
    tipoMovimentoCorrente = 'entrata';
    apriModal('modal-registra-movimento');
    var btns = document.querySelectorAll('.tab-btn');
    for (var i = 0; i < btns.length; i++) btns[i].classList.remove('active');
    if (btns[0]) btns[0].classList.add('active');
    aggiornaFormMovimento();
}

function cambiaTipoMovimento(tipo) {
    tipoMovimentoCorrente = tipo;
    var btns = document.querySelectorAll('.tab-btn');
    for (var i = 0; i < btns.length; i++) {
        btns[i].classList.toggle('active', (tipo === 'entrata' && i === 0) || (tipo === 'uscita' && i === 1));
    }
    aggiornaFormMovimento();
}

function aggiornaFormMovimento() {
    var optConto = '<option value="cassa">Cassa</option>';
    for (var i = 0; i < bancheStudio.length; i++) {
        optConto += '<option value="banca_' + bancheStudio[i].id + '">' + bancheStudio[i].nome + '</option>';
    }
    var optMg = '<option value="">Seleziona...</option>';
    if (tipoMovimentoCorrente === 'entrata') {
        optMg += '<option value="clienti">Clienti</option>';
        for (var i = 0; i < macrogruppiEntrate.length; i++) {
            optMg += '<option value="' + macrogruppiEntrate[i].id + '">' + macrogruppiEntrate[i].nome + '</option>';
        }
    } else {
        for (var i = 0; i < macrogruppiUscite.length; i++) {
            optMg += '<option value="' + macrogruppiUscite[i].id + '">' + macrogruppiUscite[i].nome + '</option>';
        }
    }
    document.getElementById('form-movimento').innerHTML = 
        '<div class="form-group"><label>Data</label><input type="date" id="mov-data" class="form-input" value="' + new Date().toISOString().split('T')[0] + '"></div>' +
        '<div class="form-group"><label>Conto</label><select id="mov-conto" class="form-select">' + optConto + '</select></div>' +
        '<div class="form-group"><label>Categoria</label><select id="mov-categoria" class="form-select" onchange="aggiornaSottovoci()">' + optMg + '</select></div>' +
        '<div class="form-group"><label>Sottovoce</label><select id="mov-sottovoce" class="form-select"><option value="">Prima seleziona categoria</option></select></div>' +
        '<div class="form-group"><label>Importo €</label><input type="number" id="mov-importo" class="form-input" step="0.01" min="0"></div>' +
        '<div class="form-group"><label>Note</label><input type="text" id="mov-note" class="form-input"></div>';
}

function aggiornaSottovoci() {
    var val = document.getElementById('mov-categoria').value;
    var sel = document.getElementById('mov-sottovoce');
    if (val === 'clienti') {
        var opt = '<option value="">Seleziona cliente...</option>';
        for (var i = 0; i < clienti.length; i++) {
            opt += '<option value="cliente_' + clienti[i].id + '">' + clienti[i].denominazione + '</option>';
        }
        sel.innerHTML = opt;
    } else if (val) {
        var lista = tipoMovimentoCorrente === 'entrata' ? macrogruppiEntrate : macrogruppiUscite;
        var mg = null;
        for (var i = 0; i < lista.length; i++) { if (lista[i].id === parseInt(val)) { mg = lista[i]; break; } }
        if (mg && mg.sottovoci) {
            var opt = '<option value="">Seleziona...</option>';
            for (var i = 0; i < mg.sottovoci.length; i++) {
                opt += '<option value="' + mg.sottovoci[i].id + '">' + mg.sottovoci[i].nome + '</option>';
            }
            sel.innerHTML = opt;
        }
    } else {
        sel.innerHTML = '<option value="">Prima seleziona categoria</option>';
    }
}

async function salvaMovimento() {
    var data = document.getElementById('mov-data').value;
    var conto = document.getElementById('mov-conto').value;
    var catVal = document.getElementById('mov-categoria').value;
    var svVal = document.getElementById('mov-sottovoce').value;
    var importo = parseFloat(document.getElementById('mov-importo').value);
    var note = document.getElementById('mov-note').value.trim();
    if (!data || !conto || !catVal || !svVal || !importo) { showToast('Compila tutti i campi', 'warning'); return; }
    
    // Mostra spinner sul pulsante
    var btnSalva = document.getElementById('btn-salva-movimento');
    if (btnSalva) {
        btnSalva.disabled = true;
        btnSalva.classList.add('btn-loading');
    }
    
    try {
        var mgId, mgNome, svId, svNome;
        if (tipoMovimentoCorrente === 'entrata' && catVal === 'clienti') {
            mgId = 'clienti'; mgNome = 'Clienti';
            svId = parseInt(svVal.replace('cliente_', ''));
        for (var i = 0; i < clienti.length; i++) { if (clienti[i].id === svId) { svNome = clienti[i].denominazione; break; } }
    } else {
        var lista = tipoMovimentoCorrente === 'entrata' ? macrogruppiEntrate : macrogruppiUscite;
        for (var i = 0; i < lista.length; i++) {
            if (lista[i].id === parseInt(catVal)) {
                mgId = lista[i].id; mgNome = lista[i].nome;
                for (var j = 0; j < (lista[i].sottovoci || []).length; j++) {
                    if (lista[i].sottovoci[j].id === parseInt(svVal)) { svId = lista[i].sottovoci[j].id; svNome = lista[i].sottovoci[j].nome; break; }
                }
                break;
            }
        }
    }
    
    var mov = { tipo: tipoMovimentoCorrente, data: data, tipologia: conto, macrogruppoId: mgId, macrogruppoNome: mgNome, sottovoceId: svId, sottovoceNome: svNome, importo: importo, descrizione: note };
    var result = await dbSalvaMovimentoStudio(mov);
    if (result) {
        mov.id = result.id;
        movimentiStudio.push(mov);
    }
    
    if (tipoMovimentoCorrente === 'entrata' && catVal === 'clienti') {
        var mezzo = conto === 'cassa' ? 'Contanti' : 'Bonifico';
        for (var i = 0; i < bancheStudio.length; i++) {
            if (conto === 'banca_' + bancheStudio[i].id) { mezzo = 'Bonifico ' + bancheStudio[i].nome; break; }
        }
        var pag = { clienteId: svId, data: data, importo: importo, mezzo: mezzo, movimentoStudioId: mov.id, tipologia: conto, note: note };
        var pagResult = await dbSalvaPagamento(pag);
        if (pagResult) {
            pag.id = pagResult.id;
            pagamenti.push(pag);
        }
    }
    
    chiudiModal('modal-registra-movimento');
    
    // Imposta i filtri sull'anno e mese del movimento appena salvato
    var annoMov = data.substring(0, 4);
    var meseMov = data.substring(5, 7);
    document.getElementById('filtro-anno-studio').value = annoMov;
    document.getElementById('filtro-mese-studio').value = meseMov;
    
    aggiornaSaldi();
    aggiornaMovimentiStudio();
    aggiornaRendiconto();
    
    showToast('Movimento registrato!', 'success');
    } catch(err) {
        console.error('Errore salva movimento:', err);
        showToast('Errore durante il salvataggio: ' + err.message, 'error');
    } finally {
        if (typeof btnSalva !== 'undefined' && btnSalva) {
            btnSalva.disabled = false;
            btnSalva.classList.remove('btn-loading');
        }
    }
}

// ==================== GIROCONTO ====================
function apriGiroconto() {
    // Imposta data odierna
    document.getElementById('giroconto-data').value = new Date().toISOString().split('T')[0];
    document.getElementById('giroconto-importo').value = '';
    document.getElementById('giroconto-descrizione').value = '';
    
    // Popola select con cassa + banche
    var opzioni = '<option value="">-- Seleziona --</option><option value="cassa">Cassa</option>';
    for (var i = 0; i < bancheStudio.length; i++) {
        opzioni += '<option value="banca_' + bancheStudio[i].id + '">' + bancheStudio[i].nome + '</option>';
    }
    document.getElementById('giroconto-da').innerHTML = opzioni;
    document.getElementById('giroconto-a').innerHTML = opzioni;
    
    apriModal('modal-giroconto');
}

async function salvaGiroconto() {
    var data = document.getElementById('giroconto-data').value;
    var da = document.getElementById('giroconto-da').value;
    var a = document.getElementById('giroconto-a').value;
    var importo = parseFloat(document.getElementById('giroconto-importo').value);
    var descrizione = document.getElementById('giroconto-descrizione').value.trim();
    
    if (!data) { showToast('Inserisci la data', 'warning'); return; }
    if (!da) { showToast('Seleziona il conto di origine', 'warning'); return; }
    if (!a) { showToast('Seleziona il conto di destinazione', 'warning'); return; }
    if (da === a) { showToast('I conti di origine e destinazione devono essere diversi', 'warning'); return; }
    if (!importo || importo <= 0) { showToast('Inserisci un importo valido', 'warning'); return; }
    
    // Trova i nomi dei conti
    var nomeDa = da === 'cassa' ? 'Cassa' : '';
    var nomeA = a === 'cassa' ? 'Cassa' : '';
    for (var i = 0; i < bancheStudio.length; i++) {
        if (da === 'banca_' + bancheStudio[i].id) nomeDa = bancheStudio[i].nome;
        if (a === 'banca_' + bancheStudio[i].id) nomeA = bancheStudio[i].nome;
    }
    
    var descCompleta = 'Giroconto: ' + nomeDa + ' → ' + nomeA;
    if (descrizione) descCompleta += ' (' + descrizione + ')';
    
    // Crea movimento di USCITA dal conto origine
    var movUscita = {
        tipo: 'giroconto',
        data: data,
        tipologia: da,
        macrogruppoId: null,
        macrogruppoNome: 'Giroconto',
        sottovoceId: null,
        sottovoceNome: nomeA,
        importo: importo,
        descrizione: descCompleta,
        girocontoDir: 'uscita'
    };
    
    var resultUscita = await dbSalvaMovimentoStudio(movUscita);
    if (resultUscita) {
        movUscita.id = resultUscita.id;
        movimentiStudio.push(movUscita);
    }
    
    // Crea movimento di ENTRATA nel conto destinazione
    var movEntrata = {
        tipo: 'giroconto',
        data: data,
        tipologia: a,
        macrogruppoId: null,
        macrogruppoNome: 'Giroconto',
        sottovoceId: null,
        sottovoceNome: nomeDa,
        importo: importo,
        descrizione: descCompleta,
        girocontoDir: 'entrata'
    };
    
    var resultEntrata = await dbSalvaMovimentoStudio(movEntrata);
    if (resultEntrata) {
        movEntrata.id = resultEntrata.id;
        movimentiStudio.push(movEntrata);
    }
    
    chiudiModal('modal-giroconto');
    
    // Imposta i filtri sull'anno e mese del giroconto appena salvato
    var annoMov = data.substring(0, 4);
    var meseMov = data.substring(5, 7);
    document.getElementById('filtro-anno-studio').value = annoMov;
    document.getElementById('filtro-mese-studio').value = meseMov;
    
    aggiornaSaldi();
    aggiornaMovimentiStudio();
    aggiornaRendiconto();
    
    showToast('Giroconto registrato!\n\n' + formatoEuro(importo) + ' da ' + nomeDa + ' a ' + nomeA);
}

// ==================== GESTIONE BANCHE ====================
function apriGestioneBanche() { visualizzaBanche(); apriModal('modal-gestione-banche'); }

function visualizzaBanche() {
    var lista = document.getElementById('banche-lista');
    if (bancheStudio.length === 0) { lista.innerHTML = '<p style="text-align:center;color:#94a3b8;">Nessuna banca</p>'; return; }
    var html = '';
    for (var i = 0; i < bancheStudio.length; i++) {
        var b = bancheStudio[i];
        html += '<div class="banca-item"><span style="font-weight:600;">' + b.nome + '</span><div style="display:flex;align-items:center;gap:12px;"><span>Saldo: ' + formatoEuro(b.saldoIniziale || 0) + '</span><button class="btn-danger" onclick="eliminaBanca(' + b.id + ')">×</button></div></div>';
    }
    lista.innerHTML = html;
}

async function aggiungiBanca() {
    var nome = document.getElementById('nuova-banca-nome').value.trim();
    var saldo = parseFloat(document.getElementById('nuova-banca-saldo').value) || 0;
    if (!nome) return;
    var banca = { nome: nome, saldoIniziale: saldo };
    var result = await dbSalvaBancaStudio(banca);
    if (result) {
        banca.id = result.id;
        bancheStudio.push(banca);
    }
    document.getElementById('nuova-banca-nome').value = '';
    document.getElementById('nuova-banca-saldo').value = '';
    visualizzaBanche();
    aggiornaSaldi();
}

async function eliminaBanca(id) {
    if (!confirm('Eliminare?')) return;
    await dbEliminaBancaStudio(id);
    bancheStudio = bancheStudio.filter(function(b) { return b.id !== id; });
    visualizzaBanche();
    aggiornaSaldi();
}

// ==================== GESTIONE MACROGRUPPI USCITE ====================
function apriGestioneUscite() { visualizzaMgUscite(); apriModal('modal-gestione-uscite'); }

function visualizzaMgUscite() {
    var lista = document.getElementById('macrogruppi-uscite-lista');
    if (macrogruppiUscite.length === 0) { lista.innerHTML = '<p style="text-align:center;color:#94a3b8;">Nessun macrogruppo</p>'; return; }
    var html = '';
    for (var i = 0; i < macrogruppiUscite.length; i++) {
        var mg = macrogruppiUscite[i];
        html += '<div class="macrogruppo-card"><div class="macrogruppo-header"><div class="macrogruppo-nome"><input type="text" value="' + mg.nome + '" onchange="modificaMgUscite(' + mg.id + ', this.value)"></div><button class="btn-elimina" onclick="eliminaMgUscite(' + mg.id + ')">×</button></div>';
        html += '<div class="macrogruppo-body"><div class="aggiungi-voce-row"><input type="text" id="nuova-sv-u-' + mg.id + '" class="form-input" placeholder="Nuova sottovoce..."><button class="btn-add" onclick="aggiungiSvUscite(' + mg.id + ')">+</button></div>';
        if (mg.sottovoci) {
            for (var j = 0; j < mg.sottovoci.length; j++) {
                var sv = mg.sottovoci[j];
                html += '<div class="voce-row"><input type="text" class="form-input voce-desc" value="' + sv.nome + '" onchange="modificaSvUscite(' + mg.id + ',' + sv.id + ',this.value)"><button class="btn-elimina" onclick="eliminaSvUscite(' + mg.id + ',' + sv.id + ')">×</button></div>';
            }
        }
        html += '</div></div>';
    }
    lista.innerHTML = html;
}

async function aggiungiMacrogruppoUscite() {
    var nome = document.getElementById('nuovo-mg-uscite').value.trim();
    if (!nome) return;
    var mg = { nome: nome, sottovoci: [] };
    var result = await dbSalvaMacrogruppoUscite(mg);
    if (result) {
        mg.id = result.id;
        macrogruppiUscite.push(mg);
    }
    document.getElementById('nuovo-mg-uscite').value = '';
    visualizzaMgUscite();
}

async function modificaMgUscite(id, nome) {
    for (var i = 0; i < macrogruppiUscite.length; i++) { 
        if (macrogruppiUscite[i].id === id) { 
            macrogruppiUscite[i].nome = nome; 
            await dbSalvaMacrogruppoUscite(macrogruppiUscite[i]);
            break; 
        } 
    }
}

async function eliminaMgUscite(id) {
    if (!confirm('Eliminare?')) return;
    await dbEliminaMacrogruppoUscite(id);
    macrogruppiUscite = macrogruppiUscite.filter(function(m) { return m.id !== id; });
    visualizzaMgUscite();
}

async function aggiungiSvUscite(mgId) {
    var input = document.getElementById('nuova-sv-u-' + mgId);
    var nome = input.value.trim();
    if (!nome) return;
    for (var i = 0; i < macrogruppiUscite.length; i++) {
        if (macrogruppiUscite[i].id === mgId) {
            if (!macrogruppiUscite[i].sottovoci) macrogruppiUscite[i].sottovoci = [];
            macrogruppiUscite[i].sottovoci.push({ id: Date.now(), nome: nome });
            await dbSalvaMacrogruppoUscite(macrogruppiUscite[i]);
            break;
        }
    }
    input.value = '';
    visualizzaMgUscite();
}

async function modificaSvUscite(mgId, svId, nome) {
    for (var i = 0; i < macrogruppiUscite.length; i++) {
        if (macrogruppiUscite[i].id === mgId && macrogruppiUscite[i].sottovoci) {
            for (var j = 0; j < macrogruppiUscite[i].sottovoci.length; j++) {
                if (macrogruppiUscite[i].sottovoci[j].id === svId) { macrogruppiUscite[i].sottovoci[j].nome = nome; break; }
            }
            await dbSalvaMacrogruppoUscite(macrogruppiUscite[i]);
            break;
        }
    }
}

async function eliminaSvUscite(mgId, svId) {
    for (var i = 0; i < macrogruppiUscite.length; i++) {
        if (macrogruppiUscite[i].id === mgId && macrogruppiUscite[i].sottovoci) {
            macrogruppiUscite[i].sottovoci = macrogruppiUscite[i].sottovoci.filter(function(s) { return s.id !== svId; });
            await dbSalvaMacrogruppoUscite(macrogruppiUscite[i]);
            break;
        }
    }
    visualizzaMgUscite();
}

// ==================== GESTIONE MACROGRUPPI ENTRATE ====================
function apriGestioneEntrate() { visualizzaMgEntrate(); apriModal('modal-gestione-entrate'); }

function visualizzaMgEntrate() {
    var lista = document.getElementById('macrogruppi-entrate-lista');
    var html = '<div class="macrogruppo-card"><div class="macrogruppo-header"><span class="macrogruppo-nome">CLIENTI</span></div><div class="macrogruppo-body">';
    if (clienti.length === 0) { html += '<p style="color:#94a3b8;">Nessun cliente</p>'; }
    else { for (var i = 0; i < clienti.length; i++) html += '<div class="voce-row"><span>' + clienti[i].denominazione + '</span></div>'; }
    html += '</div></div>';
    
    for (var i = 0; i < macrogruppiEntrate.length; i++) {
        var mg = macrogruppiEntrate[i];
        html += '<div class="macrogruppo-card"><div class="macrogruppo-header"><div class="macrogruppo-nome"><input type="text" value="' + mg.nome + '" onchange="modificaMgEntrate(' + mg.id + ', this.value)"></div><button class="btn-elimina" onclick="eliminaMgEntrate(' + mg.id + ')">×</button></div>';
        html += '<div class="macrogruppo-body"><div class="aggiungi-voce-row"><input type="text" id="nuova-sv-e-' + mg.id + '" class="form-input" placeholder="Nuova sottovoce..."><button class="btn-add" onclick="aggiungiSvEntrate(' + mg.id + ')">+</button></div>';
        if (mg.sottovoci) {
            for (var j = 0; j < mg.sottovoci.length; j++) {
                var sv = mg.sottovoci[j];
                html += '<div class="voce-row"><input type="text" class="form-input voce-desc" value="' + sv.nome + '" onchange="modificaSvEntrate(' + mg.id + ',' + sv.id + ',this.value)"><button class="btn-elimina" onclick="eliminaSvEntrate(' + mg.id + ',' + sv.id + ')">×</button></div>';
            }
        }
        html += '</div></div>';
    }
    lista.innerHTML = html;
}

async function aggiungiMacrogruppoEntrate() {
    var nome = document.getElementById('nuovo-mg-entrate').value.trim();
    if (!nome) return;
    var mg = { nome: nome, sottovoci: [] };
    var result = await dbSalvaMacrogruppoEntrate(mg);
    if (result) {
        mg.id = result.id;
        macrogruppiEntrate.push(mg);
    }
    document.getElementById('nuovo-mg-entrate').value = '';
    visualizzaMgEntrate();
}

async function modificaMgEntrate(id, nome) {
    for (var i = 0; i < macrogruppiEntrate.length; i++) { 
        if (macrogruppiEntrate[i].id === id) { 
            macrogruppiEntrate[i].nome = nome; 
            await dbSalvaMacrogruppoEntrate(macrogruppiEntrate[i]);
            break; 
        } 
    }
}

async function eliminaMgEntrate(id) {
    if (!confirm('Eliminare?')) return;
    await dbEliminaMacrogruppoEntrate(id);
    macrogruppiEntrate = macrogruppiEntrate.filter(function(m) { return m.id !== id; });
    visualizzaMgEntrate();
}

async function aggiungiSvEntrate(mgId) {
    var input = document.getElementById('nuova-sv-e-' + mgId);
    var nome = input.value.trim();
    if (!nome) return;
    for (var i = 0; i < macrogruppiEntrate.length; i++) {
        if (macrogruppiEntrate[i].id === mgId) {
            if (!macrogruppiEntrate[i].sottovoci) macrogruppiEntrate[i].sottovoci = [];
            macrogruppiEntrate[i].sottovoci.push({ id: Date.now(), nome: nome });
            await dbSalvaMacrogruppoEntrate(macrogruppiEntrate[i]);
            break;
        }
    }
    input.value = '';
    visualizzaMgEntrate();
}

async function modificaSvEntrate(mgId, svId, nome) {
    for (var i = 0; i < macrogruppiEntrate.length; i++) {
        if (macrogruppiEntrate[i].id === mgId && macrogruppiEntrate[i].sottovoci) {
            for (var j = 0; j < macrogruppiEntrate[i].sottovoci.length; j++) {
                if (macrogruppiEntrate[i].sottovoci[j].id === svId) { macrogruppiEntrate[i].sottovoci[j].nome = nome; break; }
            }
            await dbSalvaMacrogruppoEntrate(macrogruppiEntrate[i]);
            break;
        }
    }
}

async function eliminaSvEntrate(mgId, svId) {
    for (var i = 0; i < macrogruppiEntrate.length; i++) {
        if (macrogruppiEntrate[i].id === mgId && macrogruppiEntrate[i].sottovoci) {
            macrogruppiEntrate[i].sottovoci = macrogruppiEntrate[i].sottovoci.filter(function(s) { return s.id !== svId; });
            await dbSalvaMacrogruppoEntrate(macrogruppiEntrate[i]);
            break;
        }
    }
    visualizzaMgEntrate();
}

// ==================== TARIFFARI BASE ====================
function caricaTariffariBase() {
    var container = document.getElementById('tariffari-grid');
    if (tariffariBase.length === 0) {
        container.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><span class="empty-icon">' + icon('bar-chart-2',48,'color:#9aa3b2') + '</span><p>Nessun tariffario creato</p><button class="btn-primary" onclick="apriModalNuovoTariffario()" style="margin-top:16px;">+ Crea Tariffario</button></div>';
        return;
    }
    var html = '';
    for (var i = 0; i < tariffariBase.length; i++) {
        var t = tariffariBase[i];
        var numVoci = 0;
        for (var j = 0; j < t.macrogruppi.length; j++) numVoci += t.macrogruppi[j].voci.length;
        html += '<div class="tariffario-card" onclick="apriModificaTariffario(' + t.id + ')">' +
            '<div class="tariffario-card-nome">' + t.nome + '</div>' +
            '<div class="tariffario-card-info">' + numVoci + ' voci configurate</div>' +
            '</div>';
    }
    container.innerHTML = html;
}

function apriModalNuovoTariffario() {
    tariffarioCorrenteId = null;
    document.getElementById('modal-tariffario-titolo').textContent = 'Nuovo Tariffario';
    document.getElementById('tariffario-nome').value = '';
    document.getElementById('btn-elimina-tariffario').style.display = 'none';
    // Crea macrogruppi vuoti
    var mgTemp = JSON.parse(JSON.stringify(macrogruppiDefault));
    renderMacrogruppiModal(mgTemp);
    apriModal('modal-tariffario');
}

function apriDuplicaTariffario() {
    // Popola select con tariffari esistenti
    var select = document.getElementById('tariffario-da-duplicare');
    var html = '<option value="">-- Seleziona tariffario --</option>';
    for (var i = 0; i < tariffariBase.length; i++) {
        html += '<option value="' + tariffariBase[i].id + '">' + tariffariBase[i].nome + '</option>';
    }
    select.innerHTML = html;
    document.getElementById('nome-tariffario-duplicato').value = '';
    apriModal('modal-duplica-tariffario');
}

function eseguiDuplicaTariffario() {
    var tariffarioId = document.getElementById('tariffario-da-duplicare').value;
    var nuovoNome = document.getElementById('nome-tariffario-duplicato').value.trim();
    
    if (!tariffarioId) { showToast('Seleziona un tariffario da duplicare', 'warning'); return; }
    if (!nuovoNome) { showToast('Inserisci il nome per il nuovo tariffario', 'warning'); return; }
    
    // Trova il tariffario da duplicare
    var tariffarioOriginale = null;
    for (var i = 0; i < tariffariBase.length; i++) {
        if (tariffariBase[i].id === parseInt(tariffarioId)) {
            tariffarioOriginale = tariffariBase[i];
            break;
        }
    }
    if (!tariffarioOriginale) { showToast('Tariffario non trovato', 'error'); return; }
    
    // Chiudi modal duplica
    chiudiModal('modal-duplica-tariffario');
    
    // Apri modal modifica con i dati duplicati
    tariffarioCorrenteId = null; // Nuovo tariffario
    document.getElementById('modal-tariffario-titolo').textContent = 'Nuovo Tariffario (da ' + tariffarioOriginale.nome + ')';
    document.getElementById('tariffario-nome').value = nuovoNome;
    document.getElementById('btn-elimina-tariffario').style.display = 'none';
    
    // Copia profonda dei macrogruppi
    var macrogruppiCopiati = JSON.parse(JSON.stringify(tariffarioOriginale.macrogruppi));
    renderMacrogruppiModal(macrogruppiCopiati);
    apriModal('modal-tariffario');
}

function apriModificaTariffario(id) {
    tariffarioCorrenteId = id;
    var tariffario = null;
    for (var i = 0; i < tariffariBase.length; i++) {
        if (tariffariBase[i].id === id) { tariffario = tariffariBase[i]; break; }
    }
    if (!tariffario) return;
    document.getElementById('modal-tariffario-titolo').textContent = 'Modifica Tariffario';
    document.getElementById('tariffario-nome').value = tariffario.nome;
    document.getElementById('btn-elimina-tariffario').style.display = 'block';
    renderMacrogruppiModal(tariffario.macrogruppi);
    apriModal('modal-tariffario');
}

function renderMacrogruppiModal(macrogruppi) {
    var container = document.getElementById('modal-tariffario-container');
    var mesiLabels = ['T', 'G', 'F', 'M', 'A', 'M', 'G', 'L', 'A', 'S', 'O', 'N', 'D'];
    var mesiTitles = ['Tutti', 'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    var html = '';
    for (var i = 0; i < macrogruppi.length; i++) {
        var mg = macrogruppi[i];
        html += '<div class="macrogruppo-card" data-mg-id="' + mg.id + '">' +
            '<div class="macrogruppo-header"><span class="macrogruppo-nome">' + mg.nome.toUpperCase() + '</span></div>' +
            '<div class="macrogruppo-body">' +
            '<div class="aggiungi-voce-row" style="flex-wrap:wrap;">' +
            '<div style="display:flex;gap:12px;width:100%;margin-bottom:8px;align-items:center;">' +
            '<input type="text" class="form-input voce-desc" placeholder="Descrizione voce..." data-new-desc="' + mg.id + '">' +
            '<input type="text" class="form-input voce-prezzo" placeholder="€" data-new-prezzo="' + mg.id + '">' +
            '<label class="toggle-esente" title="Esente IVA"><input type="checkbox" data-new-esente="' + mg.id + '"><span>Esente</span></label>' +
            '<label class="toggle-anno-prec" title="Richiede gestione anno precedente"><input type="checkbox" data-new-annoprec="' + mg.id + '"><span>Anno Prec.</span></label>' +
            '<button class="btn-add" onclick="aggiungiVoceModal(' + mg.id + ')">+</button>' +
            '</div>' +
            '<div class="voce-mesi" style="width:100%;"><span style="font-size:11px;color:#64748b;margin-right:8px;">Mesi:</span>';
        for (var m = 0; m < mesiLabels.length; m++) {
            html += '<button type="button" class="mese-btn' + (m === 0 ? ' tutti' : '') + '" data-new-mese="' + mg.id + '-' + m + '" title="' + mesiTitles[m] + '" onclick="toggleMeseNuovo(' + mg.id + ',' + m + ')">' + mesiLabels[m] + '</button>';
        }
        html += '</div></div>';
        
        if (mg.voci.length === 0) {
            html += '<p style="color:#94a3b8;text-align:center;padding:10px;">Nessuna voce</p>';
        } else {
            for (var j = 0; j < mg.voci.length; j++) {
                var v = mg.voci[j];
                var mesiVoce = v.mesi || [];
                var esenteChecked = v.esenteIva ? ' checked' : '';
                var annoPrecChecked = v.richiedeAnnoPrecedente ? ' checked' : '';
                html += '<div class="voce-row" data-voce-id="' + v.id + '" style="flex-wrap:wrap;">' +
                    '<div style="display:flex;gap:12px;width:100%;align-items:center;">' +
                    '<input type="text" class="form-input voce-desc" value="' + v.descrizione + '" data-desc="' + mg.id + '-' + v.id + '">' +
                    '<input type="text" class="form-input voce-prezzo" value="' + (v.prezzo || '') + '" placeholder="€" data-prezzo="' + mg.id + '-' + v.id + '">' +
                    '<label class="toggle-esente' + (v.esenteIva ? ' attivo' : '') + '" title="Esente IVA"><input type="checkbox" data-esente="' + mg.id + '-' + v.id + '"' + esenteChecked + ' onchange="toggleEsenteVoce(' + mg.id + ',' + v.id + ',this.checked)"><span>Esente</span></label>' +
                    '<label class="toggle-anno-prec' + (v.richiedeAnnoPrecedente ? ' attivo' : '') + '" title="Richiede gestione anno precedente"><input type="checkbox" data-annoprec="' + mg.id + '-' + v.id + '"' + annoPrecChecked + ' onchange="toggleAnnoPrecVoce(' + mg.id + ',' + v.id + ',this.checked)"><span>Anno Prec.</span></label>' +
                    '<button class="btn-elimina" onclick="eliminaVoceModal(' + mg.id + ',' + v.id + ')">×</button>' +
                    '</div>' +
                    '<div class="voce-mesi" style="width:100%;margin-top:6px;">';
                for (var m = 0; m < mesiLabels.length; m++) {
                    var selected = mesiVoce.indexOf(m) >= 0 ? ' selected' : '';
                    html += '<button type="button" class="mese-btn' + (m === 0 ? ' tutti' : '') + selected + '" data-mese="' + mg.id + '-' + v.id + '-' + m + '" title="' + mesiTitles[m] + '" onclick="toggleMeseVoce(' + mg.id + ',' + v.id + ',' + m + ')">' + mesiLabels[m] + '</button>';
                }
                html += '</div></div>';
            }
        }
        html += '</div></div>';
    }
    container.innerHTML = html;
    container.dataset.macrogruppi = JSON.stringify(macrogruppi);
}

function toggleEsenteVoce(mgId, voceId, checked) {
    var macrogruppi = JSON.parse(document.getElementById('modal-tariffario-container').dataset.macrogruppi);
    for (var i = 0; i < macrogruppi.length; i++) {
        if (macrogruppi[i].id === mgId) {
            for (var j = 0; j < macrogruppi[i].voci.length; j++) {
                if (macrogruppi[i].voci[j].id === voceId) {
                    macrogruppi[i].voci[j].esenteIva = checked;
                    break;
                }
            }
            break;
        }
    }
    document.getElementById('modal-tariffario-container').dataset.macrogruppi = JSON.stringify(macrogruppi);
}

function toggleAnnoPrecVoce(mgId, voceId, checked) {
    var macrogruppi = JSON.parse(document.getElementById('modal-tariffario-container').dataset.macrogruppi);
    for (var i = 0; i < macrogruppi.length; i++) {
        if (macrogruppi[i].id === mgId) {
            for (var j = 0; j < macrogruppi[i].voci.length; j++) {
                if (macrogruppi[i].voci[j].id === voceId) {
                    macrogruppi[i].voci[j].richiedeAnnoPrecedente = checked;
                    break;
                }
            }
            break;
        }
    }
    document.getElementById('modal-tariffario-container').dataset.macrogruppi = JSON.stringify(macrogruppi);
}

function toggleMeseNuovo(mgId, meseIdx) {
    var btn = document.querySelector('[data-new-mese="' + mgId + '-' + meseIdx + '"]');
    if (!btn) return;
    btn.classList.toggle('selected');
    
    // Se "Tutti", seleziona/deseleziona tutti
    if (meseIdx === 0) {
        var sel = btn.classList.contains('selected');
        for (var i = 1; i <= 12; i++) {
            var otherBtn = document.querySelector('[data-new-mese="' + mgId + '-' + i + '"]');
            if (otherBtn) {
                if (sel) otherBtn.classList.add('selected');
                else otherBtn.classList.remove('selected');
            }
        }
    } else {
        // Controlla se tutti 1-12 sono selezionati
        var tuttiSel = true;
        for (var i = 1; i <= 12; i++) {
            var b = document.querySelector('[data-new-mese="' + mgId + '-' + i + '"]');
            if (b && !b.classList.contains('selected')) { tuttiSel = false; break; }
        }
        var btnTutti = document.querySelector('[data-new-mese="' + mgId + '-0"]');
        if (btnTutti) {
            if (tuttiSel) btnTutti.classList.add('selected');
            else btnTutti.classList.remove('selected');
        }
    }
}

function toggleMeseVoce(mgId, voceId, meseIdx) {
    var macrogruppi = JSON.parse(document.getElementById('modal-tariffario-container').dataset.macrogruppi);
    
    for (var i = 0; i < macrogruppi.length; i++) {
        if (macrogruppi[i].id === mgId) {
            for (var j = 0; j < macrogruppi[i].voci.length; j++) {
                var v = macrogruppi[i].voci[j];
                if (v.id === voceId) {
                    if (!v.mesi) v.mesi = [];
                    
                    if (meseIdx === 0) {
                        // Toggle "Tutti"
                        if (v.mesi.indexOf(0) >= 0) {
                            v.mesi = [];
                        } else {
                            v.mesi = [0,1,2,3,4,5,6,7,8,9,10,11,12];
                        }
                    } else {
                        var idx = v.mesi.indexOf(meseIdx);
                        if (idx >= 0) {
                            v.mesi.splice(idx, 1);
                            // Rimuovi anche "Tutti" se presente
                            var idxTutti = v.mesi.indexOf(0);
                            if (idxTutti >= 0) v.mesi.splice(idxTutti, 1);
                        } else {
                            v.mesi.push(meseIdx);
                            // Se tutti 1-12 selezionati, aggiungi anche 0
                            var tuttiSel = true;
                            for (var m = 1; m <= 12; m++) {
                                if (v.mesi.indexOf(m) < 0) { tuttiSel = false; break; }
                            }
                            if (tuttiSel && v.mesi.indexOf(0) < 0) v.mesi.push(0);
                        }
                    }
                    break;
                }
            }
            break;
        }
    }
    
    renderMacrogruppiModal(macrogruppi);
}

function aggiungiVoceModal(mgId) {
    var macrogruppi = JSON.parse(document.getElementById('modal-tariffario-container').dataset.macrogruppi);
    var descInput = document.querySelector('[data-new-desc="' + mgId + '"]');
    var prezzoInput = document.querySelector('[data-new-prezzo="' + mgId + '"]');
    var esenteInput = document.querySelector('[data-new-esente="' + mgId + '"]');
    var annoPrecInput = document.querySelector('[data-new-annoprec="' + mgId + '"]');
    var desc = descInput.value.trim();
    var prezzo = prezzoInput.value.trim();
    var esente = esenteInput ? esenteInput.checked : false;
    var annoPrec = annoPrecInput ? annoPrecInput.checked : false;
    if (!desc) return;
    
    // Raccogli mesi selezionati
    var mesi = [];
    for (var m = 0; m <= 12; m++) {
        var btn = document.querySelector('[data-new-mese="' + mgId + '-' + m + '"]');
        if (btn && btn.classList.contains('selected')) mesi.push(m);
    }
    
    for (var i = 0; i < macrogruppi.length; i++) {
        if (macrogruppi[i].id === mgId) {
            macrogruppi[i].voci.push({ id: Date.now(), descrizione: desc, prezzo: prezzo, mesi: mesi, esenteIva: esente, richiedeAnnoPrecedente: annoPrec });
            break;
        }
    }
    renderMacrogruppiModal(macrogruppi);
}

function eliminaVoceModal(mgId, voceId) {
    var macrogruppi = JSON.parse(document.getElementById('modal-tariffario-container').dataset.macrogruppi);
    for (var i = 0; i < macrogruppi.length; i++) {
        if (macrogruppi[i].id === mgId) {
            macrogruppi[i].voci = macrogruppi[i].voci.filter(function(v) { return v.id !== voceId; });
            break;
        }
    }
    renderMacrogruppiModal(macrogruppi);
}

async function salvaTariffario() {
    var nome = document.getElementById('tariffario-nome').value.trim();
    if (!nome) { showToast('Inserisci il nome del tariffario', 'warning'); return; }
    
    // Leggi macrogruppi dal DOM aggiornando i valori
    var macrogruppi = JSON.parse(document.getElementById('modal-tariffario-container').dataset.macrogruppi);
    for (var i = 0; i < macrogruppi.length; i++) {
        for (var j = 0; j < macrogruppi[i].voci.length; j++) {
            var v = macrogruppi[i].voci[j];
            var descEl = document.querySelector('[data-desc="' + macrogruppi[i].id + '-' + v.id + '"]');
            var prezzoEl = document.querySelector('[data-prezzo="' + macrogruppi[i].id + '-' + v.id + '"]');
            if (descEl) v.descrizione = descEl.value;
            if (prezzoEl) v.prezzo = prezzoEl.value;
        }
    }
    
    if (tariffarioCorrenteId) {
        // Modifica esistente
        for (var i = 0; i < tariffariBase.length; i++) {
            if (tariffariBase[i].id === tariffarioCorrenteId) {
                tariffariBase[i].nome = nome;
                tariffariBase[i].macrogruppi = macrogruppi;
                await dbSalvaTariffarioBase(tariffariBase[i]);
                break;
            }
        }
    } else {
        // Nuovo tariffario
        var nuovoTariffario = { nome: nome, macrogruppi: macrogruppi };
        var result = await dbSalvaTariffarioBase(nuovoTariffario);
        if (result) {
            nuovoTariffario.id = result.id;
            tariffariBase.push(nuovoTariffario);
        }
    }
    
    chiudiModal('modal-tariffario');
    caricaTariffariBase();
}

async function eliminaTariffario() {
    if (!confirm('Eliminare questo tariffario?')) return;
    await dbEliminaTariffarioBase(tariffarioCorrenteId);
    tariffariBase = tariffariBase.filter(function(t) { return t.id !== tariffarioCorrenteId; });
    chiudiModal('modal-tariffario');
    caricaTariffariBase();
}

// ==================== RENDICONTO ====================
function inizializzaRendiconto() {
    var anno = new Date().getFullYear();
    var opt = '';
    for (var a = anno; a >= anno - 5; a--) opt += '<option value="' + a + '">' + a + '</option>';
    document.getElementById('rendiconto-anno').innerHTML = opt;
    aggiornaRendiconto();
}

function aggiornaRendiconto() {
    var anno = parseInt(document.getElementById('rendiconto-anno').value);
    if (!anno) return;
    
    // Controlla se mostrare archiviati
    var mostraArchiviati = document.getElementById('rendiconto-mostra-archiviati') && document.getElementById('rendiconto-mostra-archiviati').checked;
    
    // ========== BOX SALDI (come Prima Nota) ==========
    var cassa = 0;
    var saldi = {};
    // IMPORTANTE: Inizializza con il saldo iniziale di ogni banca
    for (var i = 0; i < bancheStudio.length; i++) {
        saldi[bancheStudio[i].id] = parseFloat(bancheStudio[i].saldoIniziale) || 0;
    }
    for (var i = 0; i < movimentiStudio.length; i++) {
        var m = movimentiStudio[i];
        var imp = parseFloat(m.importo) || 0;
        
        // Per i giroconti, usa girocontoDir per determinare il segno
        var isEntrata;
        if (m.tipo === 'giroconto') {
            isEntrata = m.girocontoDir === 'entrata';
        } else {
            isEntrata = m.tipo === 'entrata';
        }
        
        if (m.tipologia === 'cassa') {
            cassa += isEntrata ? imp : -imp;
        } else if (m.tipologia && m.tipologia.indexOf('banca_') === 0) {
            var bid = parseInt(m.tipologia.replace('banca_', ''));
            if (saldi[bid] !== undefined) saldi[bid] += isEntrata ? imp : -imp;
        }
    }
    var totaleDisponibilita = cassa;
    for (var i = 0; i < bancheStudio.length; i++) {
        totaleDisponibilita += saldi[bancheStudio[i].id] || 0;
    }
    
    var htmlSaldi = '<div class="saldo-card" style="background:linear-gradient(135deg,#0f172a,#1e293b);"><div class="saldo-label" style="color:#94a3b8;">Totale Disponibilità</div><div class="saldo-value" style="color:#22c55e;font-size:1.3em;">' + formatoEuro(totaleDisponibilita) + '</div></div>';
    htmlSaldi += '<div class="saldo-card" style="padding:8px 12px;"><div class="saldo-label" style="font-size:0.7em;">Cassa</div><div class="saldo-value" style="font-size:0.9em;">' + formatoEuro(cassa) + '</div></div>';
    for (var i = 0; i < bancheStudio.length; i++) {
        var b = bancheStudio[i];
        htmlSaldi += '<div class="saldo-card" style="padding:8px 12px;"><div class="saldo-label" style="font-size:0.7em;">' + b.nome + '</div><div class="saldo-value" style="font-size:0.9em;">' + formatoEuro(saldi[b.id] || 0) + '</div></div>';
    }
    document.getElementById('rendiconto-saldi-container').innerHTML = htmlSaldi;
    
    var mesiNomi = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    
    // ========== FILTRA CLIENTI (escludi archiviati se checkbox non attivo) ==========
    var clientiFiltrati = clienti.filter(function(c) {
        return mostraArchiviati || !c.archiviato;
    });
    
    // ========== CATEGORIZZA CLIENTI ==========
    var clientiPaghe = [];
    var clientiContab = [];
    var clientiPagheContab = [];
    var clientiAltro = [];
    
    for (var i = 0; i < clientiFiltrati.length; i++) {
        var c = clientiFiltrati[i];
        var tipo = getTipoCliente(c);
        if (tipo === 'Paghe + Contabilità') {
            clientiPagheContab.push(c);
        } else if (tipo === 'Paghe') {
            clientiPaghe.push(c);
        } else if (tipo === 'Contabilità') {
            clientiContab.push(c);
        } else {
            clientiAltro.push(c);
        }
    }
    
    // Prepara struttura dati: cliente -> mese -> totale
    var entratePerClienteMese = {};
    var totaliEntrateCliente = {};
    var totaliEntrateMese = [0,0,0,0,0,0,0,0,0,0,0,0];
    var grandTotaleEntrate = 0;
    
    // Inizializza per tutti i clienti filtrati
    for (var i = 0; i < clientiFiltrati.length; i++) {
        var c = clientiFiltrati[i];
        entratePerClienteMese[c.id] = [0,0,0,0,0,0,0,0,0,0,0,0];
        totaliEntrateCliente[c.id] = 0;
    }
    
    // Calcola ENTRATE dai pagamenti dei clienti (solo clienti filtrati)
    for (var i = 0; i < pagamenti.length; i++) {
        var p = pagamenti[i];
        if (!p.data) continue;
        var pAnno = parseInt(p.data.substring(0, 4));
        var pMese = parseInt(p.data.substring(5, 7)) - 1; // 0-indexed
        if (pAnno !== anno) continue;
        
        var imp = parseFloat(p.importo) || 0;
        if (p.clienteId && entratePerClienteMese[p.clienteId] !== undefined) {
            entratePerClienteMese[p.clienteId][pMese] += imp;
            totaliEntrateCliente[p.clienteId] += imp;
            totaliEntrateMese[pMese] += imp;
            grandTotaleEntrate += imp;
        }
    }
    
    // Raccogli altre entrate (non clienti)
    var altreEntratePerMacrogruppo = {};
    var totaliAltreEntrateMese = [0,0,0,0,0,0,0,0,0,0,0,0];
    var grandTotaleAltreEntrate = 0;
    
    for (var i = 0; i < movimentiStudio.length; i++) {
        var m = movimentiStudio[i];
        if (!m.data || m.tipo !== 'entrata') continue;
        if (m.macrogruppoId === 'clienti') continue;
        
        var mAnno = parseInt(m.data.substring(0, 4));
        var mMese = parseInt(m.data.substring(5, 7)) - 1;
        if (mAnno !== anno) continue;
        
        var imp = parseFloat(m.importo) || 0;
        var macrogruppoNome = m.macrogruppoNome || 'Altre Entrate';
        var sottovoce = m.sottovoceNome || m.descrizione || 'Altro';
        
        if (!altreEntratePerMacrogruppo[macrogruppoNome]) {
            altreEntratePerMacrogruppo[macrogruppoNome] = {};
        }
        if (!altreEntratePerMacrogruppo[macrogruppoNome][sottovoce]) {
            altreEntratePerMacrogruppo[macrogruppoNome][sottovoce] = { mesi: [0,0,0,0,0,0,0,0,0,0,0,0], totale: 0 };
        }
        
        altreEntratePerMacrogruppo[macrogruppoNome][sottovoce].mesi[mMese] += imp;
        altreEntratePerMacrogruppo[macrogruppoNome][sottovoce].totale += imp;
        totaliAltreEntrateMese[mMese] += imp;
        grandTotaleAltreEntrate += imp;
    }
    
    // Aggiorna totali generali
    for (var m = 0; m < 12; m++) {
        totaliEntrateMese[m] += totaliAltreEntrateMese[m];
    }
    grandTotaleEntrate += grandTotaleAltreEntrate;
    
    // Calcola USCITE dai movimenti studio (solo uscite) - raggruppa per fornitore (sottovoceNome)
    var uscitePerFornitore = {}; // fornitore -> [mesi]
    var totaliUsciteFornitore = {};
    var totaliUsciteMese = [0,0,0,0,0,0,0,0,0,0,0,0];
    var grandTotaleUscite = 0;
    
    for (var i = 0; i < movimentiStudio.length; i++) {
        var m = movimentiStudio[i];
        if (!m.data || m.tipo !== 'uscita') continue;
        var mAnno = parseInt(m.data.substring(0, 4));
        var mMese = parseInt(m.data.substring(5, 7)) - 1;
        if (mAnno !== anno) continue;
        
        var imp = parseFloat(m.importo) || 0;
        var fornitore = m.sottovoceNome || m.descrizione || 'Altro';
        
        if (!uscitePerFornitore[fornitore]) {
            uscitePerFornitore[fornitore] = [0,0,0,0,0,0,0,0,0,0,0,0];
            totaliUsciteFornitore[fornitore] = 0;
        }
        uscitePerFornitore[fornitore][mMese] += imp;
        totaliUsciteFornitore[fornitore] += imp;
        totaliUsciteMese[mMese] += imp;
        grandTotaleUscite += imp;
    }
    
    // Riepilogo
    var diff = grandTotaleEntrate - grandTotaleUscite;
    document.getElementById('rendiconto-riepilogo').innerHTML = '<div class="saldi-container">' +
        '<div class="saldo-card entrate"><div class="saldo-label">Totale Entrate ' + anno + '</div><div class="saldo-value">' + formatoEuro(grandTotaleEntrate) + '</div></div>' +
        '<div class="saldo-card uscite"><div class="saldo-label">Totale Uscite ' + anno + '</div><div class="saldo-value">' + formatoEuro(grandTotaleUscite) + '</div></div>' +
        '<div class="saldo-card"><div class="saldo-label">Differenza</div><div class="saldo-value" style="color:' + (diff >= 0 ? '#16a34a' : '#dc2626') + ';">' + formatoEuro(diff) + '</div></div></div>';
    
    // ========== TABELLA ENTRATE ==========
    var htmlE = '<div class="rendiconto-table-container"><table class="rendiconto-table"><thead><tr><th class="cliente-col">Voce</th>';
    for (var m = 0; m < 12; m++) {
        htmlE += '<th>' + mesiNomi[m] + '</th>';
    }
    htmlE += '<th class="totale-col">TOT. PAGATO</th><th class="totale-col">RESIDUO</th></tr></thead><tbody>';
    
    var totaleResiduiClienti = 0;
    
    // Funzione helper per stampare sezione clienti
    function stampaSezioneClientiVideo(listaClienti, titoloSezione, colore) {
        var clientiConDati = [];
        var subtotalePagato = 0;
        var subtotaleResiduo = 0;
        var subtotaliMese = [0,0,0,0,0,0,0,0,0,0,0,0];
        
        for (var i = 0; i < listaClienti.length; i++) {
            var c = listaClienti[i];
            var stats = calcolaStatsCliente(c.id);
            if (totaliEntrateCliente[c.id] > 0 || stats.residuo !== 0) {
                clientiConDati.push({ cliente: c, stats: stats });
                subtotalePagato += totaliEntrateCliente[c.id] || 0;
                subtotaleResiduo += stats.residuo;
                for (var m = 0; m < 12; m++) {
                    subtotaliMese[m] += entratePerClienteMese[c.id] ? entratePerClienteMese[c.id][m] : 0;
                }
            }
        }
        if (clientiConDati.length === 0) return '';
        
        // Riga titolo con subtotali
        var html = '<tr style="background:' + colore + ';">' +
            '<td class="cliente-col" style="font-weight:bold;">' + titoloSezione + '</td>';
        for (var m = 0; m < 12; m++) {
            html += '<td style="font-weight:bold;color:#059669;">' + (subtotaliMese[m] > 0 ? formatoEuro(subtotaliMese[m]) : '-') + '</td>';
        }
        html += '<td class="totale-col" style="font-weight:bold;color:#059669;">' + formatoEuro(subtotalePagato) + '</td>';
        html += '<td class="totale-col" style="font-weight:bold;color:' + (subtotaleResiduo > 0 ? '#dc2626' : '#16a34a') + ';">' + formatoEuro(subtotaleResiduo) + '</td></tr>';
        
        for (var i = 0; i < clientiConDati.length; i++) {
            var c = clientiConDati[i].cliente;
            var statsC = clientiConDati[i].stats;
            totaleResiduiClienti += statsC.residuo;
            
            html += '<tr><td class="cliente-col cliente-link" onclick="apriDettaglioCliente(' + c.id + ')" style="padding-left:20px;">' + c.denominazione + '</td>';
            for (var m = 0; m < 12; m++) {
                var val = entratePerClienteMese[c.id] ? entratePerClienteMese[c.id][m] : 0;
                html += '<td class="' + (val > 0 ? 'positivo' : '') + '">' + (val > 0 ? formatoEuro(val) : '-') + '</td>';
            }
            html += '<td class="totale-col positivo">' + formatoEuro(totaliEntrateCliente[c.id] || 0) + '</td>';
            html += '<td class="totale-col ' + (statsC.residuo > 0 ? 'negativo' : 'positivo') + '">' + formatoEuro(statsC.residuo) + '</td></tr>';
        }
        return html;
    }
    
    // Stampa sezioni clienti
    htmlE += stampaSezioneClientiVideo(clientiPaghe, 'CLIENTI PAGHE', '#e6ffe6');
    htmlE += stampaSezioneClientiVideo(clientiContab, 'CLIENTI CONTABILITÀ', '#e6f3ff');
    htmlE += stampaSezioneClientiVideo(clientiPagheContab, 'CLIENTI PAGHE + CONTABILITÀ', '#fff5e6');
    htmlE += stampaSezioneClientiVideo(clientiAltro, 'CLIENTI (ALTRO)', '#f5f5f5');
    
    // Stampa altre entrate (non clienti)
    var macrogruppiAltri = Object.keys(altreEntratePerMacrogruppo).sort();
    for (var mgi = 0; mgi < macrogruppiAltri.length; mgi++) {
        var macrogruppoNome = macrogruppiAltri[mgi];
        var sottovoci = altreEntratePerMacrogruppo[macrogruppoNome];
        var sottovoceNomi = Object.keys(sottovoci).sort();
        
        // Calcola subtotale macrogruppo per mese e totale
        var subtotaleMacrogruppo = 0;
        var subtotaliMeseMacro = [0,0,0,0,0,0,0,0,0,0,0,0];
        for (var svi = 0; svi < sottovoceNomi.length; svi++) {
            var datiSv = sottovoci[sottovoceNomi[svi]];
            subtotaleMacrogruppo += datiSv.totale;
            for (var m = 0; m < 12; m++) {
                subtotaliMeseMacro[m] += datiSv.mesi[m];
            }
        }
        
        // Riga titolo con subtotali mensili
        htmlE += '<tr style="background:#d4edff;">' +
            '<td class="cliente-col" style="font-weight:bold;">' + macrogruppoNome.toUpperCase() + '</td>';
        for (var m = 0; m < 12; m++) {
            htmlE += '<td style="font-weight:bold;color:#059669;">' + (subtotaliMeseMacro[m] > 0 ? formatoEuro(subtotaliMeseMacro[m]) : '-') + '</td>';
        }
        htmlE += '<td class="totale-col" style="font-weight:bold;color:#059669;">' + formatoEuro(subtotaleMacrogruppo) + '</td>';
        htmlE += '<td class="totale-col" style="font-weight:bold;">-</td></tr>';
        
        for (var svi = 0; svi < sottovoceNomi.length; svi++) {
            var sottovoce = sottovoceNomi[svi];
            var dati = sottovoci[sottovoce];
            
            htmlE += '<tr><td class="cliente-col" style="padding-left:20px;">' + sottovoce + '</td>';
            for (var m = 0; m < 12; m++) {
                var val = dati.mesi[m];
                htmlE += '<td class="' + (val > 0 ? 'positivo' : '') + '">' + (val > 0 ? formatoEuro(val) : '-') + '</td>';
            }
            htmlE += '<td class="totale-col positivo">' + formatoEuro(dati.totale) + '</td>';
            htmlE += '<td class="totale-col">-</td></tr>';
        }
    }
    
    // Riga totali
    htmlE += '<tr class="totali-row"><td class="cliente-col"><strong>TOTALE ENTRATE</strong></td>';
    for (var m = 0; m < 12; m++) {
        htmlE += '<td class="positivo"><strong>' + (totaliEntrateMese[m] > 0 ? formatoEuro(totaliEntrateMese[m]) : '-') + '</strong></td>';
    }
    htmlE += '<td class="totale-col positivo"><strong>' + formatoEuro(grandTotaleEntrate) + '</strong></td>';
    htmlE += '<td class="totale-col ' + (totaleResiduiClienti > 0 ? 'negativo' : 'positivo') + '"><strong>' + formatoEuro(totaleResiduiClienti) + '</strong></td></tr>';
    
    htmlE += '</tbody></table></div>';
    
    if (grandTotaleEntrate === 0) {
        htmlE = '<p style="padding:16px;color:#94a3b8;text-align:center;background:white;border-radius:10px;">Nessuna entrata nel ' + anno + '</p>';
    }
    document.getElementById('rendiconto-entrate').innerHTML = htmlE;
    
    // ========== TABELLA USCITE ==========
    var htmlU = '<div class="rendiconto-table-container"><table class="rendiconto-table"><thead><tr><th class="cliente-col">Fornitore</th>';
    for (var m = 0; m < 12; m++) {
        htmlU += '<th>' + mesiNomi[m] + '</th>';
    }
    htmlU += '<th class="totale-col">TOTALE</th></tr></thead><tbody>';
    
    // Righe fornitori (ordinate alfabeticamente)
    var fornitoriOrdinati = Object.keys(uscitePerFornitore).sort(function(a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    });
    
    for (var fi = 0; fi < fornitoriOrdinati.length; fi++) {
        var fornitore = fornitoriOrdinati[fi];
        htmlU += '<tr><td class="cliente-col">' + fornitore + '</td>';
        for (var m = 0; m < 12; m++) {
            var val = uscitePerFornitore[fornitore][m];
            htmlU += '<td class="' + (val > 0 ? 'negativo' : '') + '">' + (val > 0 ? formatoEuro(val) : '-') + '</td>';
        }
        htmlU += '<td class="totale-col negativo">' + formatoEuro(totaliUsciteFornitore[fornitore]) + '</td></tr>';
    }
    
    // Riga totali
    htmlU += '<tr class="totali-row"><td class="cliente-col"><strong>TOTALE</strong></td>';
    for (var m = 0; m < 12; m++) {
        htmlU += '<td class="negativo"><strong>' + (totaliUsciteMese[m] > 0 ? formatoEuro(totaliUsciteMese[m]) : '-') + '</strong></td>';
    }
    htmlU += '<td class="totale-col negativo"><strong>' + formatoEuro(grandTotaleUscite) + '</strong></td></tr>';
    
    htmlU += '</tbody></table></div>';
    
    if (grandTotaleUscite === 0) {
        htmlU = '<p style="padding:16px;color:#94a3b8;text-align:center;background:white;border-radius:10px;">Nessuna uscita nel ' + anno + '</p>';
    }
    document.getElementById('rendiconto-uscite').innerHTML = htmlU;
    
    // ========== TABELLA GIROCONTI ==========
    var giroconti = [];
    for (var i = 0; i < movimentiStudio.length; i++) {
        var m = movimentiStudio[i];
        if (m.tipo !== 'giroconto') continue;
        if (!m.data) continue;
        var mAnno = parseInt(m.data.substring(0, 4));
        if (mAnno !== anno) continue;
        // Prendi solo quelli con direzione 'uscita' per non duplicare
        if (m.girocontoDir === 'uscita') {
            giroconti.push(m);
        }
    }
    
    var htmlG = '';
    if (giroconti.length === 0) {
        htmlG = '<p style="padding:16px;color:#94a3b8;text-align:center;background:white;border-radius:10px;">Nessun giroconto nel ' + anno + '</p>';
    } else {
        htmlG = '<div class="rendiconto-table-container"><table class="rendiconto-table"><thead><tr><th>Data</th><th>Da</th><th>A</th><th>Descrizione</th><th style="text-align:right;">Importo</th></tr></thead><tbody>';
        
        // Ordina per data
        giroconti.sort(function(a, b) { return new Date(b.data) - new Date(a.data); });
        
        for (var i = 0; i < giroconti.length; i++) {
            var g = giroconti[i];
            // Trova nome conto origine
            var nomeDa = g.tipologia === 'cassa' ? 'Cassa' : '';
            for (var b = 0; b < bancheStudio.length; b++) {
                if (g.tipologia === 'banca_' + bancheStudio[b].id) { nomeDa = bancheStudio[b].nome; break; }
            }
            // Nome destinazione è in sottovoceNome
            var nomeA = g.sottovoceNome || '-';
            
            htmlG += '<tr>';
            htmlG += '<td>' + new Date(g.data).toLocaleDateString('it-IT') + '</td>';
            htmlG += '<td>' + nomeDa + '</td>';
            htmlG += '<td>' + nomeA + '</td>';
            htmlG += '<td>' + (g.descrizione || '-') + '</td>';
            htmlG += '<td style="text-align:right;color:#8b5cf6;font-weight:600;">' + formatoEuro(parseFloat(g.importo)) + '</td>';
            htmlG += '</tr>';
        }
        htmlG += '</tbody></table></div>';
    }
    document.getElementById('rendiconto-giroconti').innerHTML = htmlG;
}

// ==================== PDF RENDICONTO ====================
async function generaRendicontoPDF() {
    var anno = parseInt(document.getElementById('rendiconto-anno').value);
    var mesiBrevi = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF('landscape', 'mm', 'a4');
    var pw = doc.internal.pageSize.getWidth(); // 297mm
    var ph = doc.internal.pageSize.getHeight(); // 210mm
    var mL = 10, mR = 10, mT = 10;
    var contentW = pw - mL - mR;
    
    function fmtEuro(num) {
        if (!num || num === 0) return '-';
        return '€ ' + parseFloat(num).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    function fmtEuroSempre(num) {
        return '€ ' + parseFloat(num || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    
    // ========== RACCOGLI DATI ENTRATE DIVISE PER CATEGORIA ==========
    
    // Struttura per clienti divisi per tipo
    var clientiPaghe = [];
    var clientiContab = [];
    var clientiPagheContab = [];
    var clientiAltro = []; // Clienti senza date gestione
    
    // Categorizza i clienti
    for (var i = 0; i < clienti.length; i++) {
        var c = clienti[i];
        var tipo = getTipoCliente(c);
        if (tipo === 'Paghe + Contabilità') {
            clientiPagheContab.push(c);
        } else if (tipo === 'Paghe') {
            clientiPaghe.push(c);
        } else if (tipo === 'Contabilità') {
            clientiContab.push(c);
        } else {
            clientiAltro.push(c);
        }
    }
    
    // Entrate per cliente per mese
    var entratePerClienteMese = {};
    var totaliEntrateCliente = {};
    
    // Inizializza per tutti i clienti
    for (var i = 0; i < clienti.length; i++) {
        var c = clienti[i];
        entratePerClienteMese[c.id] = [0,0,0,0,0,0,0,0,0,0,0,0];
        totaliEntrateCliente[c.id] = 0;
    }
    
    // Calcola ENTRATE dai pagamenti (clienti)
    for (var i = 0; i < pagamenti.length; i++) {
        var p = pagamenti[i];
        if (!p.data) continue;
        var pAnno = parseInt(p.data.substring(0, 4));
        var pMese = parseInt(p.data.substring(5, 7)) - 1;
        if (pAnno !== anno) continue;
        
        var imp = parseFloat(p.importo) || 0;
        if (p.clienteId && entratePerClienteMese[p.clienteId]) {
            entratePerClienteMese[p.clienteId][pMese] += imp;
            totaliEntrateCliente[p.clienteId] += imp;
        }
    }
    
    // Raccogli entrate da altri macrogruppi (non clienti)
    var altreEntratePerMacrogruppo = {}; // { macrogruppoNome: { sottovoce: { mesi: [], totale: 0 } } }
    var totaliAltreEntrateMese = [0,0,0,0,0,0,0,0,0,0,0,0];
    var grandTotaleAltreEntrate = 0;
    
    for (var i = 0; i < movimentiStudio.length; i++) {
        var m = movimentiStudio[i];
        if (!m.data || m.tipo !== 'entrata') continue;
        if (m.macrogruppoId === 'clienti') continue; // I clienti sono già gestiti sopra
        
        var mAnno = parseInt(m.data.substring(0, 4));
        var mMese = parseInt(m.data.substring(5, 7)) - 1;
        if (mAnno !== anno) continue;
        
        var imp = parseFloat(m.importo) || 0;
        var macrogruppoNome = m.macrogruppoNome || 'Altre Entrate';
        var sottovoce = m.sottovoceNome || m.descrizione || 'Altro';
        
        if (!altreEntratePerMacrogruppo[macrogruppoNome]) {
            altreEntratePerMacrogruppo[macrogruppoNome] = {};
        }
        if (!altreEntratePerMacrogruppo[macrogruppoNome][sottovoce]) {
            altreEntratePerMacrogruppo[macrogruppoNome][sottovoce] = { mesi: [0,0,0,0,0,0,0,0,0,0,0,0], totale: 0 };
        }
        
        altreEntratePerMacrogruppo[macrogruppoNome][sottovoce].mesi[mMese] += imp;
        altreEntratePerMacrogruppo[macrogruppoNome][sottovoce].totale += imp;
        totaliAltreEntrateMese[mMese] += imp;
        grandTotaleAltreEntrate += imp;
    }
    
    // Calcola totali entrate per categoria clienti
    var totaliEntrateMesePaghe = [0,0,0,0,0,0,0,0,0,0,0,0];
    var totaliEntrateMeseContab = [0,0,0,0,0,0,0,0,0,0,0,0];
    var totaliEntrateMesePagheContab = [0,0,0,0,0,0,0,0,0,0,0,0];
    var totaliEntrateMeseAltro = [0,0,0,0,0,0,0,0,0,0,0,0];
    var grandTotalePaghe = 0, grandTotaleContab = 0, grandTotalePagheContab = 0, grandTotaleAltroClienti = 0;
    
    for (var i = 0; i < clientiPaghe.length; i++) {
        var c = clientiPaghe[i];
        for (var m = 0; m < 12; m++) { totaliEntrateMesePaghe[m] += entratePerClienteMese[c.id][m]; }
        grandTotalePaghe += totaliEntrateCliente[c.id];
    }
    for (var i = 0; i < clientiContab.length; i++) {
        var c = clientiContab[i];
        for (var m = 0; m < 12; m++) { totaliEntrateMeseContab[m] += entratePerClienteMese[c.id][m]; }
        grandTotaleContab += totaliEntrateCliente[c.id];
    }
    for (var i = 0; i < clientiPagheContab.length; i++) {
        var c = clientiPagheContab[i];
        for (var m = 0; m < 12; m++) { totaliEntrateMesePagheContab[m] += entratePerClienteMese[c.id][m]; }
        grandTotalePagheContab += totaliEntrateCliente[c.id];
    }
    for (var i = 0; i < clientiAltro.length; i++) {
        var c = clientiAltro[i];
        for (var m = 0; m < 12; m++) { totaliEntrateMeseAltro[m] += entratePerClienteMese[c.id][m]; }
        grandTotaleAltroClienti += totaliEntrateCliente[c.id];
    }
    
    // Totali generali entrate
    var totaliEntrateMese = [0,0,0,0,0,0,0,0,0,0,0,0];
    for (var m = 0; m < 12; m++) {
        totaliEntrateMese[m] = totaliEntrateMesePaghe[m] + totaliEntrateMeseContab[m] + 
                               totaliEntrateMesePagheContab[m] + totaliEntrateMeseAltro[m] + 
                               totaliAltreEntrateMese[m];
    }
    var grandTotaleEntrate = grandTotalePaghe + grandTotaleContab + grandTotalePagheContab + 
                             grandTotaleAltroClienti + grandTotaleAltreEntrate;
    
    // Calcola USCITE per fornitore
    var uscitePerFornitore = {};
    var totaliUsciteFornitore = {};
    var totaliUsciteMese = [0,0,0,0,0,0,0,0,0,0,0,0];
    var grandTotaleUscite = 0;
    
    for (var i = 0; i < movimentiStudio.length; i++) {
        var m = movimentiStudio[i];
        if (!m.data || m.tipo !== 'uscita') continue;
        var mAnno = parseInt(m.data.substring(0, 4));
        var mMese = parseInt(m.data.substring(5, 7)) - 1;
        if (mAnno !== anno) continue;
        
        var imp = parseFloat(m.importo) || 0;
        var fornitore = m.sottovoceNome || m.descrizione || 'Altro';
        
        if (!uscitePerFornitore[fornitore]) {
            uscitePerFornitore[fornitore] = [0,0,0,0,0,0,0,0,0,0,0,0];
            totaliUsciteFornitore[fornitore] = 0;
        }
        uscitePerFornitore[fornitore][mMese] += imp;
        totaliUsciteFornitore[fornitore] += imp;
        totaliUsciteMese[mMese] += imp;
        grandTotaleUscite += imp;
    }
    
    var diff = grandTotaleEntrate - grandTotaleUscite;
    
    // Calcola residui clienti
    var totaleResiduiClienti = 0;
    var residuiClienti = {};
    for (var i = 0; i < clienti.length; i++) {
        var stats = calcolaStatsCliente(clienti[i].id);
        residuiClienti[clienti[i].id] = stats.residuo;
        totaleResiduiClienti += stats.residuo;
    }
    
    // ========== LAYOUT ==========
    var y = mT;
    var colW = 15; // Larghezza colonne mesi (ridotta)
    var col1W = 50; // Larghezza colonna nome (ridotta)
    var totColW = 22; // Larghezza colonna totale
    var resColW = 20; // Larghezza colonna residuo
    var lineH = 6;
    
    // ========== HEADER ==========
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pw, 16, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RENDICONTO ' + anno, pw / 2, 10, { align: 'center' });
    y = 22;
    
    // ========== BOX RIEPILOGO ==========
    var boxW = 60;
    var boxH = 14;
    var boxStartX = (pw - boxW * 3 - 10) / 2;
    
    // Entrate
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(boxStartX, y, boxW, boxH, 2, 2, 'F');
    doc.setFontSize(7);
    doc.setTextColor(22, 163, 74);
    doc.setFont('helvetica', 'normal');
    doc.text('TOTALE ENTRATE ' + anno, boxStartX + boxW/2, y + 5, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(fmtEuroSempre(grandTotaleEntrate), boxStartX + boxW/2, y + 11, { align: 'center' });
    
    // Uscite
    doc.setFillColor(254, 242, 242);
    doc.roundedRect(boxStartX + boxW + 5, y, boxW, boxH, 2, 2, 'F');
    doc.setFontSize(7);
    doc.setTextColor(220, 38, 38);
    doc.setFont('helvetica', 'normal');
    doc.text('TOTALE USCITE ' + anno, boxStartX + boxW + 5 + boxW/2, y + 5, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(fmtEuroSempre(grandTotaleUscite), boxStartX + boxW + 5 + boxW/2, y + 11, { align: 'center' });
    
    // Differenza
    var colDiff = diff >= 0 ? [240, 253, 244] : [254, 242, 242];
    doc.setFillColor(colDiff[0], colDiff[1], colDiff[2]);
    doc.roundedRect(boxStartX + (boxW + 5) * 2, y, boxW, boxH, 2, 2, 'F');
    doc.setFontSize(7);
    doc.setTextColor(diff >= 0 ? 22 : 220, diff >= 0 ? 163 : 38, diff >= 0 ? 74 : 38);
    doc.setFont('helvetica', 'normal');
    doc.text('DIFFERENZA', boxStartX + (boxW + 5) * 2 + boxW/2, y + 5, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(fmtEuroSempre(diff), boxStartX + (boxW + 5) * 2 + boxW/2, y + 11, { align: 'center' });
    
    y += boxH + 8;
    
    // ========== TABELLA ENTRATE ==========
    doc.setFillColor(22, 163, 74);
    doc.rect(mL, y, contentW, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('DETTAGLIO ENTRATE', mL + 5, y + 5);
    y += 9;
    
    // Header tabella
    doc.setFillColor(240, 253, 244);
    doc.rect(mL, y, contentW, 6, 'F');
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 101, 52);
    doc.text('VOCE', mL + 2, y + 4);
    var xCol = mL + col1W;
    for (var mm = 0; mm < 12; mm++) {
        doc.text(mesiBrevi[mm], xCol + colW/2, y + 4, { align: 'center' });
        xCol += colW;
    }
    doc.text('TOT.PAGATO', xCol + totColW/2, y + 4, { align: 'center' });
    doc.text('RESIDUO', xCol + totColW + resColW/2, y + 4, { align: 'center' });
    y += 7;
    
    var rigaIdx = 0;
    
    // Funzione helper per stampare una sezione clienti
    function stampaSezioneClienti(listaClienti, titoloSezione, coloreSfondo) {
        if (listaClienti.length === 0) return;
        
        // Filtra solo clienti con entrate o residuo
        var clientiConDati = [];
        for (var ii = 0; ii < listaClienti.length; ii++) {
            var cc = listaClienti[ii];
            if (totaliEntrateCliente[cc.id] > 0 || residuiClienti[cc.id] !== 0) {
                clientiConDati.push(cc);
            }
        }
        if (clientiConDati.length === 0) return;
        
        // Titolo sezione
        doc.setFillColor(coloreSfondo[0], coloreSfondo[1], coloreSfondo[2]);
        doc.rect(mL, y - 1, contentW, lineH, 'F');
        doc.setTextColor(51, 65, 85);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6);
        doc.text('▸ ' + titoloSezione, mL + 2, y + 3);
        y += lineH;
        
        doc.setFont('helvetica', 'normal');
        
        for (var ii = 0; ii < clientiConDati.length; ii++) {
            var cc = clientiConDati[ii];
            
            if (y > ph - 25) {
                doc.addPage();
                y = mT + 5;
            }
            
            if (rigaIdx % 2 === 0) {
                doc.setFillColor(250, 255, 250);
                doc.rect(mL, y - 1, contentW, lineH, 'F');
            }
            
            doc.setTextColor(51, 65, 85);
            var nomeC = cc.denominazione.length > 28 ? cc.denominazione.substring(0, 25) + '...' : cc.denominazione;
            doc.text('   ' + nomeC, mL + 2, y + 3);
            
            xCol = mL + col1W;
            for (var mm = 0; mm < 12; mm++) {
                var val = entratePerClienteMese[cc.id][mm];
                doc.setTextColor(val > 0 ? 22 : 180, val > 0 ? 163 : 180, val > 0 ? 74 : 180);
                doc.text(fmtEuro(val), xCol + colW/2, y + 3, { align: 'center' });
                xCol += colW;
            }
            
            doc.setTextColor(22, 163, 74);
            doc.setFont('helvetica', 'bold');
            doc.text(fmtEuroSempre(totaliEntrateCliente[cc.id]), xCol + totColW/2, y + 3, { align: 'center' });
            
            var res = residuiClienti[cc.id];
            doc.setTextColor(res > 0 ? 220 : 22, res > 0 ? 38 : 163, res > 0 ? 38 : 74);
            doc.text(fmtEuroSempre(res), xCol + totColW + resColW/2, y + 3, { align: 'center' });
            doc.setFont('helvetica', 'normal');
            
            y += lineH;
            rigaIdx++;
        }
    }
    
    // Stampa sezioni clienti
    stampaSezioneClienti(clientiPaghe, 'CLIENTI PAGHE', [230, 255, 230]);
    stampaSezioneClienti(clientiContab, 'CLIENTI CONTABILITÀ', [220, 245, 255]);
    stampaSezioneClienti(clientiPagheContab, 'CLIENTI PAGHE + CONTABILITÀ', [255, 245, 220]);
    stampaSezioneClienti(clientiAltro, 'CLIENTI (ALTRO)', [245, 245, 245]);
    
    // Stampa altre entrate (non clienti)
    var macrogruppiAltri = Object.keys(altreEntratePerMacrogruppo).sort();
    for (var mgi = 0; mgi < macrogruppiAltri.length; mgi++) {
        var macrogruppoNome = macrogruppiAltri[mgi];
        var sottovoci = altreEntratePerMacrogruppo[macrogruppoNome];
        var sottovoceNomi = Object.keys(sottovoci).sort();
        
        // Titolo macrogruppo
        doc.setFillColor(200, 230, 255);
        doc.rect(mL, y - 1, contentW, lineH, 'F');
        doc.setTextColor(51, 65, 85);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6);
        doc.text('▸ ' + macrogruppoNome.toUpperCase(), mL + 2, y + 3);
        y += lineH;
        
        doc.setFont('helvetica', 'normal');
        
        for (var svi = 0; svi < sottovoceNomi.length; svi++) {
            var sottovoce = sottovoceNomi[svi];
            var dati = sottovoci[sottovoce];
            
            if (y > ph - 25) {
                doc.addPage();
                y = mT + 5;
            }
            
            if (rigaIdx % 2 === 0) {
                doc.setFillColor(250, 255, 250);
                doc.rect(mL, y - 1, contentW, lineH, 'F');
            }
            
            doc.setTextColor(51, 65, 85);
            var nomeSv = sottovoce.length > 28 ? sottovoce.substring(0, 25) + '...' : sottovoce;
            doc.text('   ' + nomeSv, mL + 2, y + 3);
            
            xCol = mL + col1W;
            for (var mm = 0; mm < 12; mm++) {
                var val = dati.mesi[mm];
                doc.setTextColor(val > 0 ? 22 : 180, val > 0 ? 163 : 180, val > 0 ? 74 : 180);
                doc.text(fmtEuro(val), xCol + colW/2, y + 3, { align: 'center' });
                xCol += colW;
            }
            
            doc.setTextColor(22, 163, 74);
            doc.setFont('helvetica', 'bold');
            doc.text(fmtEuroSempre(dati.totale), xCol + totColW/2, y + 3, { align: 'center' });
            doc.text('-', xCol + totColW + resColW/2, y + 3, { align: 'center' }); // Nessun residuo per non-clienti
            doc.setFont('helvetica', 'normal');
            
            y += lineH;
            rigaIdx++;
        }
    }
    
    // Riga totali entrate
    doc.setFillColor(22, 163, 74);
    doc.rect(mL, y - 1, contentW, lineH + 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTALE ENTRATE', mL + 2, y + 3);
    xCol = mL + col1W;
    for (var mm = 0; mm < 12; mm++) {
        doc.text(fmtEuro(totaliEntrateMese[mm]), xCol + colW/2, y + 3, { align: 'center' });
        xCol += colW;
    }
    doc.text(fmtEuroSempre(grandTotaleEntrate), xCol + totColW/2, y + 3, { align: 'center' });
    doc.text(fmtEuroSempre(totaleResiduiClienti), xCol + totColW + resColW/2, y + 3, { align: 'center' });
    
    y += lineH + 10;
    
    // ========== TABELLA USCITE ==========
    if (y > ph - 50) {
        doc.addPage();
        y = mT + 5;
    }
    
    doc.setFillColor(220, 38, 38);
    doc.rect(mL, y, contentW, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('DETTAGLIO USCITE', mL + 5, y + 5);
    y += 9;
    
    // Header tabella uscite
    doc.setFillColor(254, 242, 242);
    doc.rect(mL, y, contentW, 6, 'F');
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(153, 27, 27);
    doc.text('FORNITORE', mL + 2, y + 4);
    xCol = mL + col1W;
    for (var m = 0; m < 12; m++) {
        doc.text(mesiBrevi[m], xCol + colW/2, y + 4, { align: 'center' });
        xCol += colW;
    }
    doc.text('TOTALE', xCol + totColW/2, y + 4, { align: 'center' });
    y += 7;
    
    // Righe fornitori
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    rigaIdx = 0;
    
    var fornitoriOrdinati = Object.keys(uscitePerFornitore).sort(function(a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    });
    
    for (var fi = 0; fi < fornitoriOrdinati.length; fi++) {
        var fornitore = fornitoriOrdinati[fi];
        
        if (rigaIdx % 2 === 0) {
            doc.setFillColor(255, 250, 250);
            doc.rect(mL, y - 1, contentW, lineH, 'F');
        }
        
        doc.setTextColor(51, 65, 85);
        var nomeF = fornitore.length > 28 ? fornitore.substring(0, 25) + '...' : fornitore;
        doc.text(nomeF, mL + 2, y + 3);
        
        xCol = mL + col1W;
        for (var m = 0; m < 12; m++) {
            var val = uscitePerFornitore[fornitore][m];
            doc.setTextColor(val > 0 ? 220 : 180, val > 0 ? 38 : 180, val > 0 ? 38 : 180);
            doc.text(fmtEuro(val), xCol + colW/2, y + 3, { align: 'center' });
            xCol += colW;
        }
        
        doc.setTextColor(220, 38, 38);
        doc.setFont('helvetica', 'bold');
        doc.text(fmtEuroSempre(totaliUsciteFornitore[fornitore]), xCol + totColW/2, y + 3, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        
        y += lineH;
        rigaIdx++;
        
        if (y > ph - 25) {
            doc.addPage();
            y = mT + 5;
        }
    }
    
    // Riga totali uscite
    doc.setFillColor(220, 38, 38);
    doc.rect(mL, y - 1, contentW, lineH + 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTALE', mL + 2, y + 3);
    xCol = mL + col1W;
    for (var m = 0; m < 12; m++) {
        doc.text(fmtEuro(totaliUsciteMese[m]), xCol + colW/2, y + 3, { align: 'center' });
        xCol += colW;
    }
    doc.text(fmtEuroSempre(grandTotaleUscite), xCol + totColW/2, y + 3, { align: 'center' });
    
    // ========== FOOTER SU TUTTE LE PAGINE ==========
    var totalPages = doc.internal.getNumberOfPages();
    for (var p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.setFont('helvetica', 'normal');
        doc.text('Rendiconto ' + anno + '  |  Pagina ' + p + ' di ' + totalPages + '  |  Generato il ' + new Date().toLocaleDateString('it-IT'), pw / 2, ph - 5, { align: 'center' });
    }
    
    // Mostra anteprima
    var fileName = 'Rendiconto_' + anno + '.pdf';
    var percorso = 'RENDICONTI/' + fileName;
    
    mostraAnteprimaPDF(doc, fileName, percorso, 'rendiconto', icon('bar-chart-2',14) + ' Anteprima Rendiconto ' + anno);
}

// ==================== PDF ====================
function apriModalPDFCliente(clienteId) {
    pdfClienteId = clienteId;
    var anno = new Date().getFullYear();
    var mesiOpt = '<option value="1">Gennaio</option><option value="2">Febbraio</option><option value="3">Marzo</option>' +
        '<option value="4">Aprile</option><option value="5">Maggio</option><option value="6">Giugno</option>' +
        '<option value="7">Luglio</option><option value="8">Agosto</option><option value="9">Settembre</option>' +
        '<option value="10">Ottobre</option><option value="11">Novembre</option><option value="12">Dicembre</option>';
    
    document.getElementById('modal-pdf-body').innerHTML = 
        '<div class="form-group"><label>Formato</label><select id="pdf-formato" class="form-select">' +
        '<option value="completo">' + icon('file-text',13) + ' Estratto Completo (dettagliato, più pagine)</option>' +
        '<option value="sintetico">' + icon('clipboard-list',13) + ' Estratto Sintetico (compatto, 1 pagina)</option>' +
        '</select></div>' +
        '<div class="form-group"><label>Periodo</label><select id="pdf-tipo" class="form-select" onchange="aggiornaPdfOpt()">' +
        '<option value="anno">Intero Anno</option>' +
        '<option value="mese">Mese specifico</option>' +
        '<option value="periodo">Periodo (da mese a mese)</option>' +
        '<option value="sempre">Storico completo</option>' +
        '</select></div>' +
        '<div id="pdf-opt"><div class="form-group"><label>Anno</label><select id="pdf-anno" class="form-select">' + generaOpzioniAnni(anno) + '</select></div></div>' +
        '<div class="form-group" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">' +
        '<label style="display: flex; align-items: center; cursor: pointer; gap: 10px;">' +
        '<input type="checkbox" id="pdf-includi-tariffario" checked style="width: 18px; height: 18px;">' +
        '<span>Includi pagina tariffario nell\'estratto</span>' +
        '</label></div>';
    document.getElementById('modal-pdf').querySelector('.modal-header h2').textContent = 'Scarica PDF Scheda Cliente';
    document.getElementById('modal-pdf').querySelector('.modal-footer .btn-primary').textContent = 'Genera PDF';
    document.getElementById('modal-pdf').querySelector('.modal-footer .btn-primary').setAttribute('onclick', 'generaPDFScelto()');
    apriModal('modal-pdf');
}

function generaPDFScelto() {
    var formato = document.getElementById('pdf-formato').value;
    if (formato === 'sintetico') {
        generaPDFSintetico();
    } else {
        generaPDF();
    }
}

function aggiornaPdfOpt() {
    var tipo = document.getElementById('pdf-tipo').value;
    var anno = new Date().getFullYear();
    var mesiOpt = '<option value="1">Gennaio</option><option value="2">Febbraio</option><option value="3">Marzo</option>' +
        '<option value="4">Aprile</option><option value="5">Maggio</option><option value="6">Giugno</option>' +
        '<option value="7">Luglio</option><option value="8">Agosto</option><option value="9">Settembre</option>' +
        '<option value="10">Ottobre</option><option value="11">Novembre</option><option value="12">Dicembre</option>';
    
    if (tipo === 'anno') {
        document.getElementById('pdf-opt').innerHTML = 
            '<div class="form-group"><label>Anno</label><select id="pdf-anno" class="form-select">' + generaOpzioniAnni(anno) + '</select></div>';
    } else if (tipo === 'mese') {
        document.getElementById('pdf-opt').innerHTML = 
            '<div class="form-row"><div class="form-group"><label>Anno</label><select id="pdf-anno" class="form-select">' + generaOpzioniAnni(anno) + '</select></div>' +
            '<div class="form-group"><label>Mese</label><select id="pdf-mese" class="form-select">' + mesiOpt + '</select></div></div>';
    } else if (tipo === 'periodo') {
        document.getElementById('pdf-opt').innerHTML = 
            '<div class="form-group"><label>Anno</label><select id="pdf-anno" class="form-select">' + generaOpzioniAnni(anno) + '</select></div>' +
            '<div class="form-row"><div class="form-group"><label>Da mese</label><select id="pdf-mese-da" class="form-select">' + mesiOpt + '</select></div>' +
            '<div class="form-group"><label>A mese</label><select id="pdf-mese-a" class="form-select">' + mesiOpt.replace('value="12"', 'value="12" selected') + '</select></div></div>';
    } else {
        document.getElementById('pdf-opt').innerHTML = '<p style="color:#64748b;text-align:center;">Verrà generato lo storico completo di tutti gli anni</p>';
    }
}

async function generaPDF() {
    var cliente = null;
    for (var i = 0; i < clienti.length; i++) { if (clienti[i].id === pdfClienteId) { cliente = clienti[i]; break; } }
    if (!cliente) return;
    
    var tipo = document.getElementById('pdf-tipo').value;
    var annoSel = document.getElementById('pdf-anno') ? parseInt(document.getElementById('pdf-anno').value) : new Date().getFullYear();
    var meseSel = document.getElementById('pdf-mese') ? parseInt(document.getElementById('pdf-mese').value) : null;
    var meseDa = document.getElementById('pdf-mese-da') ? parseInt(document.getElementById('pdf-mese-da').value) : 1;
    var meseA = document.getElementById('pdf-mese-a') ? parseInt(document.getElementById('pdf-mese-a').value) : 12;
    
    chiudiModal('modal-pdf');
    
    var mesiNomi = ['', 'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    var mesiBrevi = ['', 'Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    var giorniPerMese = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    // Verifica anno bisestile
    if ((annoSel % 4 === 0 && annoSel % 100 !== 0) || (annoSel % 400 === 0)) {
        giorniPerMese[2] = 29;
    }
    
    // Funzione formato euro italiano
    function fmtEuro(num) {
        var formatted = parseFloat(num).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return '€ ' + formatted;
    }
    
    var periodoLabel, periodoBreve, nomeFile, dataFinePeriodo;
    var rangeStart, rangeEnd;
    var mostraResiduoPeriodoPrec = false;
    var labelPeriodoPrec = '';
    
    if (tipo === 'sempre') {
        periodoLabel = 'Anno ' + annoSel;
        periodoBreve = 'Gen-Dic ' + annoSel;
        nomeFile = 'Storico';
        rangeStart = { anno: annoSel, mese: 1 };
        rangeEnd = { anno: annoSel, mese: 12 };
        dataFinePeriodo = '31/12/' + annoSel;
    } else if (tipo === 'mese') {
        periodoLabel = mesiNomi[meseSel] + ' ' + annoSel;
        periodoBreve = mesiBrevi[meseSel] + ' ' + annoSel;
        nomeFile = mesiNomi[meseSel] + ' ' + annoSel;
        rangeStart = { anno: annoSel, mese: meseSel };
        rangeEnd = { anno: annoSel, mese: meseSel };
        dataFinePeriodo = giorniPerMese[meseSel] + '/' + (meseSel < 10 ? '0' : '') + meseSel + '/' + annoSel;
        if (meseSel > 1) {
            mostraResiduoPeriodoPrec = true;
            labelPeriodoPrec = 'Gen-' + mesiBrevi[meseSel - 1] + ' ' + annoSel;
        }
    } else if (tipo === 'periodo') {
        if (meseDa > meseA) { var tmp = meseDa; meseDa = meseA; meseA = tmp; }
        periodoLabel = mesiNomi[meseDa] + ' - ' + mesiNomi[meseA] + ' ' + annoSel;
        periodoBreve = mesiBrevi[meseDa] + '-' + mesiBrevi[meseA] + ' ' + annoSel;
        nomeFile = mesiBrevi[meseDa] + '-' + mesiBrevi[meseA] + ' ' + annoSel;
        rangeStart = { anno: annoSel, mese: meseDa };
        rangeEnd = { anno: annoSel, mese: meseA };
        dataFinePeriodo = giorniPerMese[meseA] + '/' + (meseA < 10 ? '0' : '') + meseA + '/' + annoSel;
        if (meseDa > 1) {
            mostraResiduoPeriodoPrec = true;
            labelPeriodoPrec = 'Gen-' + mesiBrevi[meseDa - 1] + ' ' + annoSel;
        }
    } else { // anno
        periodoLabel = 'Anno ' + annoSel;
        periodoBreve = 'Gen-Dic ' + annoSel;
        nomeFile = 'Anno ' + annoSel;
        rangeStart = { anno: annoSel, mese: 1 };
        rangeEnd = { anno: annoSel, mese: 12 };
        dataFinePeriodo = '31/12/' + annoSel;
    }
    
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF();
    var pw = doc.internal.pageSize.getWidth();
    var ph = doc.internal.pageSize.getHeight();
    
    // Margini
    var mL = 20;
    var mR = 20;
    var contentW = pw - mL - mR;
    
    // Calcola stats
    var stats = calcolaStatsPeriodo(cliente, rangeStart, rangeEnd);
    var ivaImponibile = stats.totaleImponibile * 0.22;
    var totalePeriodo = stats.totaleImponibile + ivaImponibile + stats.totaleEsente;
    
    // Calcola residuo periodo precedente (se necessario)
    var residuoPeriodoPrec = 0;
    if (mostraResiduoPeriodoPrec) {
        var statsPeriodoPrec = calcolaStatsPeriodo(cliente, { anno: annoSel, mese: 1 }, { anno: annoSel, mese: rangeStart.mese - 1 });
        var ivaPeriodoPrec = statsPeriodoPrec.totaleImponibile * 0.22;
        var totalePeriodoPrec = statsPeriodoPrec.totaleImponibile + ivaPeriodoPrec + statsPeriodoPrec.totaleEsente;
        residuoPeriodoPrec = totalePeriodoPrec - statsPeriodoPrec.totalePagamenti;
    }
    
    // Calcola totale abbuoni
    var totaleAbbuoni = 0;
    var abbuoniCliente = abbuoniClienti[cliente.id] || [];
    for (var i = 0; i < abbuoniCliente.length; i++) {
        totaleAbbuoni += parseFloat(abbuoniCliente[i].importo) || 0;
    }
    
    var saldoAttuale = stats.residuoPrecedente + residuoPeriodoPrec + totalePeriodo - stats.totalePagamenti - totaleAbbuoni;
    
    // Pre-calcola dati mesi
    var praticheClienteData = praticheClienti[cliente.id] || {};
    var datiMesi = [];
    var saldoProgressivo = stats.residuoPrecedente + residuoPeriodoPrec;
    
    for (var mese = rangeStart.mese; mese <= rangeEnd.mese; mese++) {
        var chiaveMeseData = annoSel + '-' + (mese < 10 ? '0' : '') + mese;
        var praticheMese = praticheClienteData[chiaveMeseData] || {};
        
        var imponibileMese = 0, esenteMese = 0;
        var vociMese = [];
        
        // Costi fissi
        var costiFissi = praticheMese._costiFissi || [];
        for (var i = 0; i < costiFissi.length; i++) {
            var cf = costiFissi[i];
            var totCf = (cf.qta || 1) * (cf.prezzo || 0);
            vociMese.push({ desc: cf.descrizione, qta: cf.qta || 1, prezzo: cf.prezzo || 0, totale: totCf, esente: cf.esenteIva });
            if (cf.esenteIva) esenteMese += totCf; else imponibileMese += totCf;
        }
        
        // Pratiche variabili
        for (var tipoPratica in praticheMese) {
            if (tipoPratica === '_richieste' || tipoPratica === '_costiFissi') continue;
            var val = praticheMese[tipoPratica];
            var qta, prezzo;
            if (typeof val === 'object') { qta = val.qta || 0; prezzo = val.prezzo || 0; }
            else { qta = val || 0; prezzo = calcolaPrezzoPratica(cliente, tipoPratica); }
            if (qta > 0) {
                var totP = qta * prezzo;
                vociMese.push({ desc: tipoPratica, qta: qta, prezzo: prezzo, totale: totP, esente: false });
                imponibileMese += totP;
            }
        }
        
        // Richieste
        var richieste = praticheMese._richieste || [];
        for (var i = 0; i < richieste.length; i++) {
            var r = richieste[i];
            vociMese.push({ desc: r.descrizione, qta: 1, prezzo: r.costo, totale: r.costo, esente: r.esenteIva });
            if (r.esenteIva) esenteMese += r.costo; else imponibileMese += r.costo;
        }
        
        var ivaMese = imponibileMese * 0.22;
        var totaleMese = imponibileMese + ivaMese + esenteMese;
        
        // Pagamenti mese
        var pagamentiMese = [];
        var totalePagMese = 0;
        for (var i = 0; i < pagamenti.length; i++) {
            var p = pagamenti[i];
            if (p.clienteId !== cliente.id) continue;
            if (p.data && p.data.substring(0, 7) === chiaveMeseData.substring(0, 7)) {
                pagamentiMese.push(p);
                totalePagMese += parseFloat(p.importo) || 0;
            }
        }
        
        var saldoPrecMese = saldoProgressivo;
        saldoProgressivo = saldoProgressivo + totaleMese - totalePagMese;
        
        datiMesi.push({
            mese: mese,
            nomeMese: mesiNomi[mese],
            nomeBreve: mesiBrevi[mese],
            voci: vociMese,
            imponibile: imponibileMese,
            esente: esenteMese,
            iva: ivaMese,
            totaleMese: totaleMese,
            pagamenti: pagamentiMese,
            totalePagamenti: totalePagMese,
            saldoPrecedente: saldoPrecMese,
            saldoFineMese: saldoProgressivo
        });
    }
    
    // ================== PAGINA 1: COPERTINA + RIEPILOGO ==================
    
    // Header scuro
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pw, 70, 'F');
    
    // Titolo
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text('ESTRATTO CONTO', pw / 2, 28, { align: 'center' });
    
    // Nome cliente
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text(cliente.denominazione.toUpperCase(), pw / 2, 45, { align: 'center' });
    
    // CF/PIVA
    if (cliente.codiceFiscale) {
        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184);
        doc.text('C.F./P.IVA: ' + cliente.codiceFiscale, pw / 2, 58, { align: 'center' });
    }
    
    // Periodo
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text('Periodo: ' + periodoLabel, pw / 2, 66, { align: 'center' });
    
    var y = 85;
    doc.setTextColor(0, 0, 0);
    
    // Calcola altezza box in base alle righe
    var righeBox = mostraResiduoPeriodoPrec ? 5 : 4;
    var altezzaBox = 30 + (righeBox * 16);
    
    // Box riepilogo
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(mL, y, contentW, altezzaBox, 4, 4, 'FD');
    
    y += 18;
    var colLabel = mL + 12;
    var colValue = pw - mR - 12;
    
    doc.setFontSize(11);
    
    // Residuo anni precedenti
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Residuo anni precedenti', colLabel, y);
    doc.setTextColor(15, 23, 42);
    doc.text(fmtEuro(stats.residuoPrecedente), colValue, y, { align: 'right' });
    y += 14;
    
    // Residuo periodo precedente (se necessario)
    if (mostraResiduoPeriodoPrec) {
        doc.setTextColor(71, 85, 105);
        doc.text('Residuo periodo precedente (' + labelPeriodoPrec + ')', colLabel, y);
        doc.setTextColor(15, 23, 42);
        doc.text(fmtEuro(residuoPeriodoPrec), colValue, y, { align: 'right' });
        y += 14;
    }
    
    // Competenze periodo
    doc.setTextColor(71, 85, 105);
    doc.text('Competenze periodo (' + periodoBreve + ')', colLabel, y);
    doc.setTextColor(15, 23, 42);
    doc.text(fmtEuro(totalePeriodo), colValue, y, { align: 'right' });
    y += 14;
    
    // Pagamenti ricevuti
    doc.setTextColor(71, 85, 105);
    doc.text('Pagamenti ricevuti (al ' + dataFinePeriodo + ')', colLabel, y);
    doc.setTextColor(22, 163, 74);
    doc.text('- ' + fmtEuro(stats.totalePagamenti), colValue, y, { align: 'right' });
    y += 14;
    
    // Arrotondamenti (se presenti)
    if (totaleAbbuoni !== 0) {
        doc.setTextColor(71, 85, 105);
        doc.text('Arrotondamenti', colLabel, y);
        if (totaleAbbuoni > 0) {
            doc.setTextColor(22, 163, 74);
            doc.text('- ' + fmtEuro(totaleAbbuoni), colValue, y, { align: 'right' });
        } else {
            doc.setTextColor(220, 38, 38);
            doc.text('+ ' + fmtEuro(Math.abs(totaleAbbuoni)), colValue, y, { align: 'right' });
        }
        y += 8;
    } else {
        y -= 6; // Recupera spazio se non ci sono abbuoni
    }
    
    // Linea separatrice
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(colLabel, y, colValue, y);
    y += 14;
    
    // SALDO ATTUALE
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('SALDO ATTUALE', colLabel, y);
    
    if (saldoAttuale > 0) {
        doc.setTextColor(220, 38, 38);
    } else if (saldoAttuale < 0) {
        doc.setTextColor(22, 163, 74);
    } else {
        doc.setTextColor(15, 23, 42);
    }
    doc.setFontSize(15);
    doc.text(fmtEuro(Math.abs(saldoAttuale)), colValue, y, { align: 'right' });
    y += 10;
    
    doc.setFontSize(10);
    var statoTesto = saldoAttuale > 0 ? 'DA PAGARE' : (saldoAttuale < 0 ? 'A CREDITO' : 'SALDATO');
    doc.text(statoTesto, colValue, y, { align: 'right' });
    
    y += 25;
    
    // Dettaglio competenze
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Dettaglio: Imponibile ' + fmtEuro(stats.totaleImponibile) + ' + IVA 22% ' + fmtEuro(ivaImponibile) + ' + Esente ' + fmtEuro(stats.totaleEsente), pw / 2, y, { align: 'center' });
    
    // ================== PAGINA 2: TABELLA SINTETICA ==================
    doc.addPage();
    y = 25;
    
    // Titolo
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(mL, y, contentW, 12, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RIEPILOGO MOVIMENTI', pw / 2, y + 8, { align: 'center' });
    y += 22;
    
    // Saldo iniziale
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    var saldoInizialeLabel = mostraResiduoPeriodoPrec ? 'Saldo iniziale periodo (residuo anni prec. + periodo prec.)' : 'Saldo iniziale (residuo anni precedenti)';
    doc.text(saldoInizialeLabel + ': ' + fmtEuro(stats.residuoPrecedente + residuoPeriodoPrec), mL, y);
    y += 12;
    
    // Intestazione tabella
    doc.setFillColor(241, 245, 249);
    doc.rect(mL, y, contentW, 10, 'F');
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('MESE', mL + 5, y + 7);
    doc.text('COMPETENZE', mL + 55, y + 7, { align: 'center' });
    doc.text('PAGAMENTI', mL + 100, y + 7, { align: 'center' });
    doc.text('SALDO PROGR.', pw - mR - 5, y + 7, { align: 'right' });
    y += 12;
    
    // Linea sotto intestazione
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(mL, y, pw - mR, y);
    y += 2;
    
    // Righe mesi
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    var totCompetenze = 0, totPagamenti = 0;
    
    for (var i = 0; i < datiMesi.length; i++) {
        var dm = datiMesi[i];
        y += 8;
        
        doc.setTextColor(15, 23, 42);
        doc.text(dm.nomeMese, mL + 5, y);
        doc.text(fmtEuro(dm.totaleMese), mL + 55, y, { align: 'center' });
        
        // Formatta pagamenti con date, metodo e note
        var pagamentiStr = '-';
        if (dm.pagamenti && dm.pagamenti.length > 0) {
            var pagParts = [];
            for (var pi = 0; pi < dm.pagamenti.length; pi++) {
                var p = dm.pagamenti[pi];
                var dataP = p.data ? new Date(p.data).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }) : '';
                
                // Determina metodo pagamento
                var metodo = '';
                if (p.mezzo === 'cassa' || p.tipologia === 'cassa') {
                    metodo = 'Contanti';
                } else if (p.mezzo && p.mezzo.indexOf('banca_') === 0) {
                    metodo = 'Bonifico';
                } else if (p.tipologia && p.tipologia.indexOf('banca_') === 0) {
                    metodo = 'Bonifico';
                }
                
                var partStr = fmtEuro(parseFloat(p.importo));
                if (dataP) partStr += ' (' + dataP + ')';
                if (metodo) partStr += ' ' + metodo;
                if (p.note) partStr += ' - ' + p.note;
                
                pagParts.push(partStr);
            }
            pagamentiStr = pagParts.join(', ');
        }
        
        if (dm.totalePagamenti > 0) {
            doc.setTextColor(22, 163, 74);
        } else {
            doc.setTextColor(148, 163, 184);
        }
        
        // Se il testo è troppo lungo, usa font più piccolo
        var pagFontSize = 9;
        if (pagamentiStr.length > 25) pagFontSize = 7;
        if (pagamentiStr.length > 40) pagFontSize = 6;
        doc.setFontSize(pagFontSize);
        doc.text(pagamentiStr, mL + 100, y, { align: 'center' });
        doc.setFontSize(9);
        
        // Colore saldo
        if (dm.saldoFineMese > 0) {
            doc.setTextColor(220, 38, 38);
        } else if (dm.saldoFineMese < 0) {
            doc.setTextColor(22, 163, 74);
        } else {
            doc.setTextColor(15, 23, 42);
        }
        doc.text(fmtEuro(dm.saldoFineMese), pw - mR - 5, y, { align: 'right' });
        
        totCompetenze += dm.totaleMese;
        totPagamenti += dm.totalePagamenti;
        
        // Linea sottile
        y += 4;
        doc.setDrawColor(241, 245, 249);
        doc.line(mL, y, pw - mR, y);
    }
    
    // Riga totali
    y += 10;
    doc.setFillColor(241, 245, 249);
    doc.rect(mL, y - 5, contentW, 12, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('TOTALE', mL + 5, y + 2);
    doc.text(fmtEuro(totCompetenze), mL + 55, y + 2, { align: 'center' });
    doc.setTextColor(22, 163, 74);
    doc.text(fmtEuro(totPagamenti), mL + 100, y + 2, { align: 'center' });
    
    // Saldo finale
    y += 20;
    doc.setFillColor(saldoAttuale > 0 ? 254 : 240, saldoAttuale > 0 ? 242 : 253, saldoAttuale > 0 ? 242 : 244);
    doc.roundedRect(mL + 40, y, contentW - 80, 16, 3, 3, 'F');
    doc.setTextColor(saldoAttuale > 0 ? 220 : 22, saldoAttuale > 0 ? 38 : 163, saldoAttuale > 0 ? 38 : 74);
    doc.setFontSize(12);
    doc.text('SALDO FINALE: ' + fmtEuro(saldoAttuale) + ' ' + statoTesto, pw / 2, y + 11, { align: 'center' });
    
    // ================== PAGINE SUCCESSIVE: DETTAGLIO COMPETENZE ==================
    doc.addPage();
    y = 25;
    
    // Titolo
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(mL, y, contentW, 12, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DETTAGLIO COMPETENZE', pw / 2, y + 8, { align: 'center' });
    y += 20;
    
    // Mostra dettaglio mesi (dal più recente al meno recente)
    for (var mi = datiMesi.length - 1; mi >= 0; mi--) {
        var dm = datiMesi[mi];
        
        // Salta mesi senza attività
        if (dm.voci.length === 0 && dm.pagamenti.length === 0) continue;
        
        // Calcola altezza necessaria per questo mese
        var altezzaMese = 45 + (dm.voci.length * 7) + (dm.pagamenti.length > 0 ? 20 : 0);
        
        // Nuova pagina se non c'è spazio
        if (y + altezzaMese > 270) {
            doc.addPage();
            y = 25;
        }
        
        // Header mese
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(mL, y, contentW, 10, 2, 2, 'F');
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(dm.nomeMese.toUpperCase() + ' ' + annoSel, mL + 5, y + 7);
        doc.text('Totale: ' + fmtEuro(dm.totaleMese), pw - mR - 5, y + 7, { align: 'right' });
        y += 14;
        
        // Voci
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        
        for (var vi = 0; vi < dm.voci.length; vi++) {
            var v = dm.voci[vi];
            var descText = v.desc + (v.esente ? ' (es.)' : '');
            doc.text(descText.substring(0, 45), mL + 5, y);
            doc.text(v.qta + ' × ' + fmtEuro(v.prezzo), mL + 110, y, { align: 'right' });
            doc.setTextColor(15, 23, 42);
            doc.text(fmtEuro(v.totale), pw - mR - 5, y, { align: 'right' });
            doc.setTextColor(71, 85, 105);
            y += 6;
        }
        
        // Subtotali
        y += 2;
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('Imponibile ' + fmtEuro(dm.imponibile) + ' + IVA ' + fmtEuro(dm.iva) + (dm.esente > 0 ? ' + Esente ' + fmtEuro(dm.esente) : ''), pw - mR - 5, y, { align: 'right' });
        y += 8;
        
        // Pagamenti (se presenti)
        if (dm.pagamenti.length > 0) {
            doc.setTextColor(22, 163, 74);
            doc.setFont('helvetica', 'normal');
            var pagStr = 'Pagamenti: ';
            for (var pi = 0; pi < dm.pagamenti.length; pi++) {
                var p = dm.pagamenti[pi];
                var dataP = p.data ? new Date(p.data).toLocaleDateString('it-IT') : '-';
                pagStr += dataP + ' ' + fmtEuro(parseFloat(p.importo));
                if (pi < dm.pagamenti.length - 1) pagStr += ', ';
            }
            doc.text(pagStr, mL + 5, y);
            y += 8;
        }
        
        // Saldo fine mese con data
        var ultimoGiorno = giorniPerMese[dm.mese];
        var meseStr = dm.mese < 10 ? '0' + dm.mese : dm.mese;
        var dataSaldo = ultimoGiorno + '/' + meseStr + '/' + annoSel;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(dm.saldoFineMese > 0 ? 220 : 22, dm.saldoFineMese > 0 ? 38 : 163, dm.saldoFineMese > 0 ? 38 : 74);
        doc.text('Saldo al ' + dataSaldo + ': ' + fmtEuro(dm.saldoFineMese), pw - mR - 5, y, { align: 'right' });
        
        y += 15;
    }
    
    // Mostra saldo iniziale alla fine (residuo anni precedenti + eventuale residuo periodo precedente)
    var saldoIniziale = stats.residuoPrecedente + residuoPeriodoPrec;
    
    // Nuova pagina se non c'è spazio
    if (y + 20 > 270) {
        doc.addPage();
        y = 25;
    }
    
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(mL, y, contentW, 14, 2, 2, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    var labelSaldoIniz = mostraResiduoPeriodoPrec ? 'SALDO INIZIALE (Residuo anni prec. + ' + labelPeriodoPrec + ')' : 'SALDO INIZIALE (Residuo anni precedenti)';
    doc.text(labelSaldoIniz, mL + 5, y + 9);
    doc.setTextColor(saldoIniziale > 0 ? 220 : (saldoIniziale < 0 ? 22 : 15), saldoIniziale > 0 ? 38 : (saldoIniziale < 0 ? 163 : 23), saldoIniziale > 0 ? 38 : (saldoIniziale < 0 ? 74 : 42));
    doc.text(fmtEuro(saldoIniziale), pw - mR - 5, y + 9, { align: 'right' });
    y += 20;
    
    // ================== ULTIMA PAGINA: TARIFFARIO (opzionale) ==================
    var includiTariffario = document.getElementById('pdf-includi-tariffario') ? document.getElementById('pdf-includi-tariffario').checked : true;
    
    if (includiTariffario) {
        doc.addPage();
        y = 25;
        
        // Header
        doc.setFillColor(15, 23, 42);
        doc.roundedRect(mL, y, contentW, 12, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('TARIFFARIO APPLICATO', pw / 2, y + 8, { align: 'center' });
        y += 22;
        
        var tariffario = cliente.tariffario || [];
        var mesiNomiCompleti = ['Tutti i mesi', 'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
        
        // Raggruppa voci per categoria usando categoriaNome dal tariffario cliente
        var categorieMap = {};
        var categorieOrdine = [];
        
        for (var t = 0; t < tariffario.length; t++) {
            var voce = tariffario[t];
            if (parseFloat(voce.prezzo) <= 0) continue; // Salta voci senza prezzo
            
            var catNome = voce.categoriaNome || 'Altro';
            if (!categorieMap[catNome]) {
                categorieMap[catNome] = [];
                categorieOrdine.push(catNome);
            }
            categorieMap[catNome].push(voce);
        }
        
        if (categorieOrdine.length > 0) {
            // Mostra per categoria
            for (var c = 0; c < categorieOrdine.length; c++) {
                var catNome = categorieOrdine[c];
                var vociCategoria = categorieMap[catNome];
                
                // Check overflow prima della categoria
                if (y > 255) {
                    doc.addPage();
                    y = 25;
                }
                
                // Intestazione categoria
                doc.setFillColor(241, 245, 249);
                doc.rect(mL, y - 2, contentW, 10, 'F');
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(51, 65, 85);
                doc.text(catNome.toUpperCase(), mL + 10, y + 5);
                y += 14;
                
                // Voci della categoria
                for (var v = 0; v < vociCategoria.length; v++) {
                    var voce = vociCategoria[v];
                    
                    if (y > 270) { doc.addPage(); y = 25; }
                    
                    doc.setFontSize(9);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(15, 23, 42);
                    doc.text(voce.descrizione, mL + 15, y);
                    
                    // Mesi di applicazione
                    var mesiStr = '';
                    if (voce.mesi && voce.mesi.length > 0) {
                        if (voce.mesi[0] === 0 || voce.mesi.length === 12) {
                            mesiStr = 'Tutti i mesi';
                        } else {
                            var nomiMesi = [];
                            for (var m = 0; m < voce.mesi.length; m++) {
                                nomiMesi.push(mesiNomiCompleti[voce.mesi[m]] || '');
                            }
                            mesiStr = nomiMesi.join(', ');
                        }
                    }
                    doc.setFontSize(7);
                    doc.setTextColor(100, 116, 139);
                    doc.text(mesiStr, mL + 95, y);
                    
                    // Prezzo
                    doc.setFontSize(9);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(15, 23, 42);
                    var prezzoStr = fmtEuro(parseFloat(voce.prezzo) || 0);
                    if (voce.esenteIva) prezzoStr += ' (es.)';
                    doc.text(prezzoStr, pw - mR - 10, y, { align: 'right' });
                    
                    y += 8;
                    
                    // Linea sottile
                    doc.setDrawColor(241, 245, 249);
                    doc.line(mL + 15, y - 3, pw - mR - 10, y - 3);
                }
                
                y += 8; // Spazio tra categorie
            }
        } else {
            // Nessuna voce con prezzo
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(148, 163, 184);
            doc.text('Nessun tariffario applicato', pw / 2, y, { align: 'center' });
        }
    }
    
    // ================== FOOTER SU TUTTE LE PAGINE ==================
    var totalPages = doc.internal.getNumberOfPages();
    for (var p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(cliente.denominazione + '  |  ' + periodoLabel + '  |  Pagina ' + p + ' di ' + totalPages, pw / 2, ph - 10, { align: 'center' });
    }
    
    // Mostra anteprima invece di salvare direttamente
    var fileName = cliente.denominazione + ' Estratto ' + nomeFile + '.pdf';
    var cartella = cliente.denominazione.replace(/[^a-zA-Z0-9 ]/g, '');
    var percorso = 'schede clienti/' + cartella + '/ESTRATTI CONTO/' + fileName;
    
    mostraAnteprimaPDF(doc, fileName, percorso, 'estratto', icon('eye',14) + ' Anteprima Estratto Conto', pdfClienteId);
}

// ==================== ESTRATTO SINTETICO (2 PAGINE) ====================
async function generaPDFSintetico() {
    var cliente = null;
    for (var i = 0; i < clienti.length; i++) { if (clienti[i].id === pdfClienteId) { cliente = clienti[i]; break; } }
    if (!cliente) return;
    
    var tipo = document.getElementById('pdf-tipo').value;
    var annoSel = document.getElementById('pdf-anno') ? parseInt(document.getElementById('pdf-anno').value) : new Date().getFullYear();
    var meseSel = document.getElementById('pdf-mese') ? parseInt(document.getElementById('pdf-mese').value) : null;
    var meseDa = document.getElementById('pdf-mese-da') ? parseInt(document.getElementById('pdf-mese-da').value) : 1;
    var meseA = document.getElementById('pdf-mese-a') ? parseInt(document.getElementById('pdf-mese-a').value) : 12;
    
    chiudiModal('modal-pdf');
    
    var mesiNomi = ['', 'Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    var mesiCompleti = ['', 'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    
    // Determina range
    var rangeStart = null, rangeEnd = null, nomeFile = '', periodoLabel = '';
    if (tipo === 'anno') {
        rangeStart = { anno: annoSel, mese: 1 };
        rangeEnd = { anno: annoSel, mese: 12 };
        nomeFile = annoSel.toString();
        periodoLabel = 'Anno ' + annoSel;
    } else if (tipo === 'mese') {
        rangeStart = { anno: annoSel, mese: meseSel };
        rangeEnd = { anno: annoSel, mese: meseSel };
        nomeFile = mesiCompleti[meseSel] + ' ' + annoSel;
        periodoLabel = mesiCompleti[meseSel] + ' ' + annoSel;
    } else if (tipo === 'periodo') {
        rangeStart = { anno: annoSel, mese: meseDa };
        rangeEnd = { anno: annoSel, mese: meseA };
        nomeFile = mesiCompleti[meseDa] + '-' + mesiCompleti[meseA] + ' ' + annoSel;
        periodoLabel = mesiCompleti[meseDa] + ' - ' + mesiCompleti[meseA] + ' ' + annoSel;
    } else {
        nomeFile = 'Storico Completo';
        periodoLabel = 'Storico Completo';
    }
    
    // Calcola statistiche come l'estratto completo
    var stats = calcolaStatsPeriodo(cliente, rangeStart, rangeEnd);
    var saldoIniziale = stats.residuoPrecedente || 0;
    
    // Setup PDF - Formato A4 VERTICALE (portrait)
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF('portrait', 'mm', 'a4');
    var pw = doc.internal.pageSize.getWidth(); // 210mm
    var ph = doc.internal.pageSize.getHeight(); // 297mm
    var mL = 15, mR = 15, mT = 15;
    var contentW = pw - mL - mR;
    
    var fmtEuro = function(v) { return '€ ' + (v || 0).toFixed(2).replace('.', ','); };
    
    // ========== PRE-CALCOLA TUTTI I DATI ==========
    var praticheClienteManuali = praticheClienti[cliente.id] || {};
    var tariffario = cliente.tariffario || [];
    
    var totaleCompetenze = 0;
    var totalePagamentiCalc = 0;
    var datiMesiCalc = [];
    
    // Per STORICO COMPLETO, raccogli TUTTI i mesi con dati
    var isStoricoCompleto = (tipo === 'storico' || (!rangeStart && !rangeEnd));
    var annoCorrente = new Date().getFullYear();
    
    if (isStoricoCompleto) {
        // Per storico completo, il saldo iniziale è il residuoIniziale del cliente
        saldoIniziale = cliente.residuoIniziale || 0;
        
        // Raccogli TUTTE le chiavi anno-mese presenti (tutti gli anni)
        var tuttiMesi = [];
        for (var chiave in praticheClienteManuali) {
            if (chiave.match(/^\d{4}-\d{1,2}$/)) {
                var parts = chiave.split('-');
                tuttiMesi.push({ anno: parseInt(parts[0]), mese: parseInt(parts[1]), chiave: chiave });
            }
        }
        // Ordina per anno e mese
        tuttiMesi.sort(function(a, b) {
            if (a.anno !== b.anno) return a.anno - b.anno;
            return a.mese - b.mese;
        });
        
        // Elabora ogni mese
        for (var tm = 0; tm < tuttiMesi.length; tm++) {
            var meseInfo = tuttiMesi[tm];
            var praticheMese = praticheClienteManuali[meseInfo.chiave] || {};
            
            var vociMese = [];
            var imponibileMese = 0, esenteMese = 0;
            
            // Costi fissi
            var costiFissi = praticheMese._costiFissi || [];
            for (var i = 0; i < costiFissi.length; i++) {
                var cf = costiFissi[i];
                var totCf = (cf.qta || 1) * (cf.prezzo || 0);
                var descCf = cf.descrizione + (cf.qta > 1 ? ' x' + cf.qta : '');
                if (cf.esenteIva) {
                    vociMese.push({ desc: descCf, imponibile: 0, iva: 0, esente: totCf, totale: totCf });
                    esenteMese += totCf;
                } else {
                    var ivaCf = totCf * 0.22;
                    vociMese.push({ desc: descCf, imponibile: totCf, iva: ivaCf, esente: 0, totale: totCf + ivaCf });
                    imponibileMese += totCf;
                }
            }
            
            // Pratiche standard
            for (var tipoPrat in praticheMese) {
                if (tipoPrat === '_richieste' || tipoPrat === '_costiFissi') continue;
                var val = praticheMese[tipoPrat];
                var qta = (typeof val === 'object') ? val.qta : val;
                var prezzo = (typeof val === 'object') ? val.prezzo : calcolaPrezzoPratica(cliente, tipoPrat);
                if (qta > 0) {
                    var totP = qta * prezzo;
                    var descP = tipoPrat + (qta > 1 ? ' x' + qta : '');
                    var ivaP = totP * 0.22;
                    vociMese.push({ desc: descP, imponibile: totP, iva: ivaP, esente: 0, totale: totP + ivaP });
                    imponibileMese += totP;
                }
            }
            
            // Richieste
            var richieste = praticheMese._richieste || [];
            for (var i = 0; i < richieste.length; i++) {
                var r = richieste[i];
                if (r.esenteIva) {
                    vociMese.push({ desc: r.descrizione, imponibile: 0, iva: 0, esente: r.costo, totale: r.costo });
                    esenteMese += r.costo;
                } else {
                    var ivaR = r.costo * 0.22;
                    vociMese.push({ desc: r.descrizione, imponibile: r.costo, iva: ivaR, esente: 0, totale: r.costo + ivaR });
                    imponibileMese += r.costo;
                }
            }
            
            var ivaMese = imponibileMese * 0.22;
            var totaleMese = imponibileMese + ivaMese + esenteMese;
            
            if (vociMese.length > 0) {
                totaleCompetenze += totaleMese;
                datiMesiCalc.push({
                    tipo: 'mese',
                    mese: meseInfo.mese,
                    anno: meseInfo.anno,
                    dataSort: meseInfo.anno * 10000 + meseInfo.mese * 100 + 99,
                    voci: vociMese,
                    totale: totaleMese
                });
            }
        }
        
        // Raccogli TUTTI i pagamenti del cliente
        var pagamentiPeriodo = [];
        for (var i = 0; i < pagamenti.length; i++) {
            var p = pagamenti[i];
            if (p.clienteId !== cliente.id) continue;
            var dataP = new Date(p.data);
            var annoP = dataP.getFullYear();
            var meseP = dataP.getMonth() + 1;
            var giornoP = dataP.getDate();
            
            var importoP = parseFloat(p.importo) || 0;
            totalePagamentiCalc += importoP;
            
            // Determina metodo pagamento
            var metodoPag = 'Bonifico';
            if (p.mezzo === 'cassa' || p.tipologia === 'cassa') {
                metodoPag = 'Contanti';
            }
            var descPag = metodoPag;
            if (p.note) descPag += ' - ' + p.note;
            
            pagamentiPeriodo.push({
                tipo: 'pagamento',
                data: p.data,
                dataSort: annoP * 10000 + meseP * 100 + giornoP,
                giorno: giornoP,
                mese: meseP,
                anno: annoP,
                dataFormattata: giornoP + '/' + (meseP < 10 ? '0' : '') + meseP + '/' + annoP,
                metodo: descPag,
                importo: importoP
            });
        }
        
        // Per storico, imposta variabili
        var annoInizio = annoCorrente;
        var meseInizio = 1;
        var meseFine = 12;
        
    } else {
        // Logica normale per anno/mese/periodo
        var annoInizio = rangeStart ? rangeStart.anno : new Date().getFullYear();
        var meseInizio = rangeStart ? rangeStart.mese : 1;
        var meseFine = rangeEnd ? rangeEnd.mese : 12;
        var pagamentiPeriodo = [];
        
        for (var mese = meseInizio; mese <= meseFine; mese++) {
            var chiaveConZero = annoInizio + '-' + (mese < 10 ? '0' : '') + mese;
            var chiaveSenzaZero = annoInizio + '-' + mese;
            var praticheMese = praticheClienteManuali[chiaveConZero] || praticheClienteManuali[chiaveSenzaZero] || {};
        var praticheMese = praticheClienteManuali[chiaveConZero] || praticheClienteManuali[chiaveSenzaZero] || {};
        
        var vociMese = []; // Array di oggetti { desc, imponibile, iva, esente, totale }
        var imponibileMese = 0, esenteMese = 0;
        
        // Costi fissi
        var costiFissi = praticheMese._costiFissi || [];
        for (var i = 0; i < costiFissi.length; i++) {
            var cf = costiFissi[i];
            var totCf = (cf.qta || 1) * (cf.prezzo || 0);
            var descCf = cf.descrizione + (cf.qta > 1 ? ' x' + cf.qta : '');
            if (cf.esenteIva) {
                vociMese.push({ desc: descCf, imponibile: 0, iva: 0, esente: totCf, totale: totCf });
                esenteMese += totCf;
            } else {
                var ivaCf = totCf * 0.22;
                vociMese.push({ desc: descCf, imponibile: totCf, iva: ivaCf, esente: 0, totale: totCf + ivaCf });
                imponibileMese += totCf;
            }
        }
        
        // Pratiche standard
        for (var tipoPrat in praticheMese) {
            if (tipoPrat === '_richieste' || tipoPrat === '_costiFissi') continue;
            var val = praticheMese[tipoPrat];
            var qta = (typeof val === 'object') ? val.qta : val;
            var prezzo = (typeof val === 'object') ? val.prezzo : calcolaPrezzoPratica(cliente, tipoPrat);
            if (qta > 0) {
                var totP = qta * prezzo;
                var descP = tipoPrat + (qta > 1 ? ' x' + qta : '');
                var ivaP = totP * 0.22;
                vociMese.push({ desc: descP, imponibile: totP, iva: ivaP, esente: 0, totale: totP + ivaP });
                imponibileMese += totP;
            }
        }
        
        // Richieste
        var richieste = praticheMese._richieste || [];
        for (var i = 0; i < richieste.length; i++) {
            var r = richieste[i];
            if (r.esenteIva) {
                vociMese.push({ desc: r.descrizione, imponibile: 0, iva: 0, esente: r.costo, totale: r.costo });
                esenteMese += r.costo;
            } else {
                var ivaR = r.costo * 0.22;
                vociMese.push({ desc: r.descrizione, imponibile: r.costo, iva: ivaR, esente: 0, totale: r.costo + ivaR });
                imponibileMese += r.costo;
            }
        }
        
        var ivaMese = imponibileMese * 0.22;
        var totaleMese = imponibileMese + ivaMese + esenteMese;
        
        if (vociMese.length > 0) {
            totaleCompetenze += totaleMese;
            datiMesiCalc.push({
                tipo: 'mese',
                mese: mese,
                anno: annoInizio,
                dataSort: annoInizio * 10000 + mese * 100 + 99, // Fine mese per ordinamento
                voci: vociMese,
                totale: totaleMese
            });
        }
    }
    
        // Raccogli pagamenti del periodo
        for (var i = 0; i < pagamenti.length; i++) {
            var p = pagamenti[i];
            if (p.clienteId !== cliente.id) continue;
            var dataP = new Date(p.data);
            var annoP = dataP.getFullYear();
            var meseP = dataP.getMonth() + 1;
            var giornoP = dataP.getDate();
            
            // Verifica se nel periodo
            if (annoP === annoInizio && meseP >= meseInizio && meseP <= meseFine) {
                var importoP = parseFloat(p.importo) || 0;
                totalePagamentiCalc += importoP;
                
                // Determina metodo pagamento
                var metodoPag = 'Bonifico';
                if (p.mezzo === 'cassa' || p.tipologia === 'cassa') {
                    metodoPag = 'Contanti';
                }
                var descPag = metodoPag;
                if (p.note) descPag += ' - ' + p.note;
                
                pagamentiPeriodo.push({
                    tipo: 'pagamento',
                    data: p.data,
                    dataSort: annoP * 10000 + meseP * 100 + giornoP,
                    giorno: giornoP,
                    mese: meseP,
                    anno: annoP,
                    dataFormattata: giornoP + '/' + (meseP < 10 ? '0' : '') + meseP + '/' + annoP,
                    metodo: descPag,
                    importo: importoP
                });
            }
        }
    } // Fine else (non storico)
    
    // Unisci mesi e pagamenti in un unico array
    var eventiOrdinati = datiMesiCalc.concat(pagamentiPeriodo);
    
    // Ordina per dataSort decrescente
    eventiOrdinati.sort(function(a, b) {
        return b.dataSort - a.dataSort;
    });
    
    // ========== CALCOLA DOVUTO PRECEDENTE E PAGAMENTI TOTALI ==========
    var dovutoPrecedente = 0;
    var pagamentiTotali = 0;
    
    if (!isStoricoCompleto) {
        // Calcola dovuto dei mesi PRIMA del periodo selezionato (stesso anno)
        for (var m = 1; m < meseInizio; m++) {
            var chiaveConZeroPrec = annoInizio + '-' + (m < 10 ? '0' : '') + m;
            var chiaveSenzaZeroPrec = annoInizio + '-' + m;
            var praticheMesePrec = praticheClienteManuali[chiaveConZeroPrec] || praticheClienteManuali[chiaveSenzaZeroPrec] || {};
        
        var imponibilePrec = 0, esentePrec = 0;
        
        // Costi fissi
        var costiFissiPrec = praticheMesePrec._costiFissi || [];
        for (var i = 0; i < costiFissiPrec.length; i++) {
            var cf = costiFissiPrec[i];
            var totCf = (cf.qta || 1) * (cf.prezzo || 0);
            if (cf.esenteIva) esentePrec += totCf; else imponibilePrec += totCf;
        }
        
        // Pratiche standard
        for (var tipoPrat in praticheMesePrec) {
            if (tipoPrat === '_richieste' || tipoPrat === '_costiFissi') continue;
            var val = praticheMesePrec[tipoPrat];
            var qtaPrec = (typeof val === 'object') ? val.qta : val;
            var prezzoPrec = (typeof val === 'object') ? val.prezzo : calcolaPrezzoPratica(cliente, tipoPrat);
            if (qtaPrec > 0) imponibilePrec += qtaPrec * prezzoPrec;
        }
        
        // Richieste
        var richiestePrec = praticheMesePrec._richieste || [];
        for (var i = 0; i < richiestePrec.length; i++) {
            var r = richiestePrec[i];
            if (r.esenteIva) esentePrec += r.costo; else imponibilePrec += r.costo;
        }
        
        dovutoPrecedente += imponibilePrec * 1.22 + esentePrec;
    }
    
        // Calcola TUTTI i pagamenti dell'anno (non solo del periodo)
        for (var i = 0; i < pagamenti.length; i++) {
            var p = pagamenti[i];
            if (p.clienteId !== cliente.id) continue;
            var dataPag = new Date(p.data);
            var annoPag = dataPag.getFullYear();
            if (annoPag === annoInizio) {
                pagamentiTotali += parseFloat(p.importo) || 0;
            }
        }
    } else {
        // Per storico completo: pagamenti totali già calcolati
        pagamentiTotali = totalePagamentiCalc;
    }
    
    // Calcola totale abbuoni
    var totaleAbbuoniSint = 0;
    var abbuoniClienteSint = abbuoniClienti[cliente.id] || [];
    for (var i = 0; i < abbuoniClienteSint.length; i++) {
        totaleAbbuoniSint += parseFloat(abbuoniClienteSint[i].importo) || 0;
    }
    
    // Ricalcola saldo finale corretto (includendo abbuoni)
    var saldoFinale = saldoIniziale + dovutoPrecedente + totaleCompetenze - pagamentiTotali - totaleAbbuoniSint;
    
    // ==================== PAGINA 1: ESTRATTO CONTO ====================
    var y = mT;
    
    // ========== HEADER ==========
    // Titolo a sinistra
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('ESTRATTO CONTO', mL, y + 5);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(periodoLabel, mL, y + 11);
    
    // Cliente (destra)
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(cliente.denominazione, pw - mR, y + 5, { align: 'right' });
    
    // Info gestione cliente
    var infoGestione = [];
    if (cliente.inizioPaghe) {
        var dataPaghe = new Date(cliente.inizioPaghe);
        infoGestione.push('Cliente Paghe dal ' + dataPaghe.toLocaleDateString('it-IT'));
    }
    if (cliente.inizioContabilita) {
        var dataContab = new Date(cliente.inizioContabilita);
        infoGestione.push('Cliente Contabilità dal ' + dataContab.toLocaleDateString('it-IT'));
    }
    if (infoGestione.length > 0) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(infoGestione.join(' | '), pw - mR, y + 11, { align: 'right' });
    }
    
    y += 16;
    doc.setDrawColor(200, 200, 200);
    doc.line(mL, y, pw - mR, y);
    y += 6;
    
    // ========== BOX RIEPILOGO ==========
    var boxH = 14;
    var mostraDovutoPrec = (tipo === 'mese' || tipo === 'periodo');
    var mostraAbbuoni = (totaleAbbuoniSint !== 0);
    var numBox = 4 + (mostraDovutoPrec ? 1 : 0) + (mostraAbbuoni ? 1 : 0);
    var boxGap = 3;
    var boxW = (contentW - (boxGap * (numBox - 1))) / numBox;
    var boxX = mL;
    
    // Box 1: Residuo Anni Prec.
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(boxX, y, boxW, boxH, 2, 2, 'F');
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('RESIDUO ANNI PREC.', boxX + boxW/2, y + 5, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(saldoIniziale > 0 ? 220 : 22, saldoIniziale > 0 ? 38 : 163, saldoIniziale > 0 ? 38 : 74);
    doc.text(fmtEuro(saldoIniziale), boxX + boxW/2, y + 11, { align: 'center' });
    boxX += boxW + boxGap;
    
    // Box 2: Dovuto Precedente (solo per mese/periodo)
    if (mostraDovutoPrec) {
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(boxX, y, boxW, boxH, 2, 2, 'F');
        doc.setFontSize(6);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        // Mostra periodo precedente tra parentesi
        var labelDovutoPrec = 'DOVUTO PREC.';
        if (meseInizio > 1) {
            if (meseInizio === 2) {
                labelDovutoPrec = 'DOVUTO PREC. (' + mesiNomi[1] + ')';
            } else {
                labelDovutoPrec = 'DOVUTO PREC. (' + mesiNomi[1] + '-' + mesiNomi[meseInizio - 1] + ')';
            }
        }
        doc.text(labelDovutoPrec, boxX + boxW/2, y + 5, { align: 'center' });
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(fmtEuro(dovutoPrecedente), boxX + boxW/2, y + 11, { align: 'center' });
        boxX += boxW + boxGap;
    }
    
    // Box 3: Dovuto Periodo
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(boxX, y, boxW, boxH, 2, 2, 'F');
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('DOVUTO PERIODO', boxX + boxW/2, y + 5, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(fmtEuro(totaleCompetenze), boxX + boxW/2, y + 11, { align: 'center' });
    boxX += boxW + boxGap;
    
    // Box 4: Pagamenti (tutti)
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(boxX, y, boxW, boxH, 2, 2, 'F');
    doc.setFontSize(6);
    doc.setTextColor(22, 163, 74);
    doc.setFont('helvetica', 'normal');
    doc.text('PAGAMENTI', boxX + boxW/2, y + 5, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('- ' + fmtEuro(pagamentiTotali), boxX + boxW/2, y + 11, { align: 'center' });
    boxX += boxW + boxGap;
    
    // Box Abbuoni (se presenti)
    if (mostraAbbuoni) {
        var colAbbuono = totaleAbbuoniSint > 0 ? [240, 253, 244] : [254, 242, 242];
        doc.setFillColor(colAbbuono[0], colAbbuono[1], colAbbuono[2]);
        doc.roundedRect(boxX, y, boxW, boxH, 2, 2, 'F');
        doc.setFontSize(6);
        doc.setTextColor(totaleAbbuoniSint > 0 ? 22 : 220, totaleAbbuoniSint > 0 ? 163 : 38, totaleAbbuoniSint > 0 ? 74 : 38);
        doc.setFont('helvetica', 'normal');
        doc.text('ARROTONDAMENTI', boxX + boxW/2, y + 5, { align: 'center' });
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        var segnoAbb = totaleAbbuoniSint > 0 ? '- ' : '+ ';
        doc.text(segnoAbb + fmtEuro(Math.abs(totaleAbbuoniSint)), boxX + boxW/2, y + 11, { align: 'center' });
        boxX += boxW + boxGap;
    }
    
    // Box 5: Saldo Attuale
    var colSaldo = saldoFinale > 0 ? [254, 242, 242] : [240, 253, 244];
    doc.setFillColor(colSaldo[0], colSaldo[1], colSaldo[2]);
    doc.roundedRect(boxX, y, boxW, boxH, 2, 2, 'F');
    doc.setFontSize(6);
    doc.setTextColor(saldoFinale > 0 ? 220 : 22, saldoFinale > 0 ? 38 : 163, saldoFinale > 0 ? 38 : 74);
    doc.setFont('helvetica', 'normal');
    doc.text('SALDO ATTUALE', boxX + boxW/2, y + 5, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(fmtEuro(saldoFinale), boxX + boxW/2, y + 11, { align: 'center' });
    
    y += boxH + 6;
    
    // ========== VERIFICA SE MESE SINGOLO O PERIODO ==========
    var isMeseSingolo = (tipo === 'mese');
    var isPeriodo = (tipo === 'periodo');
    var mostraDettaglioMesi = (isMeseSingolo || isPeriodo);
    
    // Calcola ultimo giorno del mese per il titolo prospetto
    var giorniPerMese = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if ((annoInizio % 4 === 0 && annoInizio % 100 !== 0) || (annoInizio % 400 === 0)) {
        giorniPerMese[2] = 29;
    }
    
    if (mostraDettaglioMesi) {
        // ==================== MESE/PERIODO: DETTAGLIO PER OGNI MESE + PROGRESSIVI ====================
        
        var ultimoMesePeriodo = isPeriodo ? meseA : meseSel;
        var primoMesePeriodo = isPeriodo ? meseDa : meseSel;
        var ultimoGiornoMese = giorniPerMese[ultimoMesePeriodo];
        var dataUltimoGiorno = ultimoGiornoMese + '/' + (ultimoMesePeriodo < 10 ? '0' : '') + ultimoMesePeriodo + '/' + annoInizio;
        
        // Per ogni mese del periodo, stampa il dettaglio competenze
        for (var meseIdx = primoMesePeriodo; meseIdx <= ultimoMesePeriodo; meseIdx++) {
            // Trova i dati del mese corrente
            var meseCorrente = null;
            for (var d = 0; d < datiMesiCalc.length; d++) {
                if (datiMesiCalc[d].mese === meseIdx) {
                    meseCorrente = datiMesiCalc[d];
                    break;
                }
            }
            
            // ========== DETTAGLIO COMPETENZE DEL MESE ==========
            doc.setFillColor(15, 23, 42);
            doc.rect(mL, y, contentW, 8, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text('DETTAGLIO COMPETENZE ' + mesiCompleti[meseIdx].toUpperCase() + ' ' + annoInizio, pw/2, y + 5.5, { align: 'center' });
            y += 10;
            
            if (meseCorrente && meseCorrente.voci.length > 0) {
                // Header tabella dettaglio con nuove colonne
                doc.setFillColor(241, 245, 249);
                doc.rect(mL, y, contentW, 7, 'F');
                doc.setTextColor(71, 85, 105);
                doc.setFontSize(7);
                doc.setFont('helvetica', 'bold');
                doc.text('DESCRIZIONE', mL + 5, y + 5);
                doc.text('QTA', mL + 85, y + 5, { align: 'center' });
                doc.text('PREZZO', mL + 110, y + 5, { align: 'center' });
                doc.text('IVA', mL + 140, y + 5, { align: 'center' });
                doc.text('DOVUTO', pw - mR - 5, y + 5, { align: 'right' });
                y += 9;
            
                var lineH = 6;
                var totImponibile = 0, totEsente = 0, totIva = 0;
                
                // Righe voci dettaglio
                for (var v = 0; v < meseCorrente.voci.length; v++) {
                    var voce = meseCorrente.voci[v];
                    
                    if (v % 2 === 0) {
                        doc.setFillColor(250, 250, 252);
                        doc.rect(mL, y - 1, contentW, lineH, 'F');
                    }
                    
                    doc.setFontSize(7);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(51, 65, 85);
                    
                    // Estrai qta dal nome se presente (es. "Cedolini x3")
                    var descParts = voce.desc.split(' x');
                    var descNome = descParts[0];
                    var qta = descParts.length > 1 ? parseInt(descParts[1]) : 1;
                    var prezzoUnitario = voce.imponibile > 0 ? voce.imponibile / qta : voce.esente / qta;
                    
                    doc.text(descNome, mL + 5, y + 3.5);
                    doc.text(qta.toString(), mL + 85, y + 3.5, { align: 'center' });
                    doc.text(fmtEuro(prezzoUnitario), mL + 110, y + 3.5, { align: 'center' });
                    
                    if (voce.esente > 0) {
                        // Esente IVA
                        doc.setTextColor(100, 116, 139);
                        doc.text('Esente', mL + 140, y + 3.5, { align: 'center' });
                        doc.setTextColor(51, 65, 85);
                        doc.text(fmtEuro(voce.esente), pw - mR - 5, y + 3.5, { align: 'right' });
                        totEsente += voce.esente;
                    } else {
                        // Con IVA
                        doc.text(fmtEuro(voce.iva), mL + 140, y + 3.5, { align: 'center' });
                        doc.text(fmtEuro(voce.totale), pw - mR - 5, y + 3.5, { align: 'right' });
                        totImponibile += voce.imponibile;
                        totIva += voce.iva;
                    }
                    
                    y += lineH;
                    
                    // Check overflow pagina
                    if (y > ph - 35) {
                        doc.addPage();
                        y = mT + 5;
                    }
                }
                
                // Linea separatore
                y += 2;
                doc.setDrawColor(200, 200, 200);
                doc.line(mL, y, pw - mR, y);
                y += 5;
                
                // Totali
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(71, 85, 105);
                
                doc.text('Totale Imponibile:', mL + 100, y);
                doc.setFont('helvetica', 'bold');
                doc.text(fmtEuro(totImponibile), pw - mR - 5, y, { align: 'right' });
                y += 6;
                
                doc.setFont('helvetica', 'normal');
                doc.text('IVA 22%:', mL + 100, y);
                doc.setFont('helvetica', 'bold');
                doc.text(fmtEuro(totIva), pw - mR - 5, y, { align: 'right' });
                y += 6;
                
                if (totEsente > 0) {
                    doc.setFont('helvetica', 'normal');
                    doc.text('Esente IVA:', mL + 100, y);
                    doc.setFont('helvetica', 'bold');
                    doc.text(fmtEuro(totEsente), pw - mR - 5, y, { align: 'right' });
                    y += 6;
                }
                
                // Totale competenze mese
                doc.setFillColor(241, 245, 249);
                doc.rect(mL + 95, y - 2, contentW - 95, 8, 'F');
                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(15, 23, 42);
                doc.text('TOTALE COMPETENZE ' + mesiNomi[meseIdx].toUpperCase() + ':', mL + 100, y + 4);
                doc.text(fmtEuro(meseCorrente.totale), pw - mR - 5, y + 4, { align: 'right' });
                y += 12;
            } else {
                // Nessuna competenza nel mese
                doc.setFillColor(248, 250, 252);
                doc.rect(mL, y, contentW, 20, 'F');
                doc.setFontSize(10);
                doc.setFont('helvetica', 'italic');
                doc.setTextColor(148, 163, 184);
                doc.text('Nessuna competenza registrata nel mese', pw/2, y + 12, { align: 'center' });
                y += 25;
            }
            
            // Check overflow pagina tra mesi
            if (y > ph - 50 && meseIdx < ultimoMesePeriodo) {
                doc.addPage();
                y = mT + 5;
            }
        }
        
        // ========== SEZIONE 2: DETTAGLIO SALDO PROGRESSIVO ==========
        // Raccogli eventi FINO AL mese finale del periodo (incluso)
        var eventiProgressivo = [];
        
        // Aggiungi tutti i mesi del periodo che hanno voci
        for (var d = 0; d < datiMesiCalc.length; d++) {
            if (datiMesiCalc[d].mese <= ultimoMesePeriodo) {
                eventiProgressivo.push({
                    tipo: 'mese',
                    mese: datiMesiCalc[d].mese,
                    anno: annoInizio,
                    dataSort: annoInizio * 10000 + datiMesiCalc[d].mese * 100 + 99,
                    voci: datiMesiCalc[d].voci,
                    totale: datiMesiCalc[d].totale
                });
            }
        }
        
        // Mesi precedenti al periodo (se non già inclusi)
        for (var m = 1; m < primoMesePeriodo; m++) {
            var chiaveConZero = annoInizio + '-' + (m < 10 ? '0' : '') + m;
            var chiaveSenzaZero = annoInizio + '-' + m;
            var praticheMese = praticheClienteManuali[chiaveConZero] || praticheClienteManuali[chiaveSenzaZero] || {};
            
            var vociPrec = [];
            var imponibilePrec = 0, esentePrec = 0;
            
            // Costi fissi
            var costiFissi = praticheMese._costiFissi || [];
            for (var i = 0; i < costiFissi.length; i++) {
                var cf = costiFissi[i];
                var totCf = (cf.qta || 1) * (cf.prezzo || 0);
                var descCf = cf.descrizione + (cf.qta > 1 ? ' x' + cf.qta : '');
                if (cf.esenteIva) {
                    vociPrec.push({ desc: descCf, imponibile: 0, iva: 0, esente: totCf, totale: totCf });
                    esentePrec += totCf;
                } else {
                    var ivaCf = totCf * 0.22;
                    vociPrec.push({ desc: descCf, imponibile: totCf, iva: ivaCf, esente: 0, totale: totCf + ivaCf });
                    imponibilePrec += totCf;
                }
            }
            
            // Pratiche standard
            for (var tipoPrat in praticheMese) {
                if (tipoPrat === '_richieste' || tipoPrat === '_costiFissi') continue;
                var val = praticheMese[tipoPrat];
                var qta = (typeof val === 'object') ? val.qta : val;
                var prezzo = (typeof val === 'object') ? val.prezzo : calcolaPrezzoPratica(cliente, tipoPrat);
                if (qta > 0) {
                    var totP = qta * prezzo;
                    var descP = tipoPrat + (qta > 1 ? ' x' + qta : '');
                    var ivaP = totP * 0.22;
                    vociPrec.push({ desc: descP, imponibile: totP, iva: ivaP, esente: 0, totale: totP + ivaP });
                    imponibilePrec += totP;
                }
            }
            
            // Richieste
            var richieste = praticheMese._richieste || [];
            for (var i = 0; i < richieste.length; i++) {
                var r = richieste[i];
                if (r.esenteIva) {
                    vociPrec.push({ desc: r.descrizione, imponibile: 0, iva: 0, esente: r.costo, totale: r.costo });
                    esentePrec += r.costo;
                } else {
                    var ivaR = r.costo * 0.22;
                    vociPrec.push({ desc: r.descrizione, imponibile: r.costo, iva: ivaR, esente: 0, totale: r.costo + ivaR });
                    imponibilePrec += r.costo;
                }
            }
            
            var ivaPrec = imponibilePrec * 0.22;
            var totalePrec = imponibilePrec + ivaPrec + esentePrec;
            
            if (vociPrec.length > 0) {
                eventiProgressivo.push({
                    tipo: 'mese',
                    mese: m,
                    anno: annoInizio,
                    dataSort: annoInizio * 10000 + m * 100 + 99,
                    voci: vociPrec,
                    totale: totalePrec
                });
            }
        }
        
        // Pagamenti FINO al mese finale del periodo (incluso)
        for (var i = 0; i < pagamenti.length; i++) {
            var p = pagamenti[i];
            if (p.clienteId !== cliente.id) continue;
            var dataP = new Date(p.data);
            var annoP = dataP.getFullYear();
            var meseP = dataP.getMonth() + 1;
            var giornoP = dataP.getDate();
            
            if (annoP === annoInizio && meseP <= ultimoMesePeriodo) {
                var importoP = parseFloat(p.importo) || 0;
                
                // Determina metodo pagamento
                var metodoPag = 'Bonifico';
                if (p.mezzo === 'cassa' || p.tipologia === 'cassa') {
                    metodoPag = 'Contanti';
                }
                var descPag = metodoPag;
                if (p.note) descPag += ' - ' + p.note;
                
                eventiProgressivo.push({
                    tipo: 'pagamento',
                    data: p.data,
                    dataSort: annoP * 10000 + meseP * 100 + giornoP,
                    giorno: giornoP,
                    mese: meseP,
                    anno: annoP,
                    dataFormattata: giornoP + '/' + (meseP < 10 ? '0' : '') + meseP + '/' + annoP,
                    metodo: descPag,
                    importo: importoP
                });
            }
        }
        
        // Intestazione prospetto con data ultimo giorno
        doc.setFillColor(15, 23, 42);
        doc.rect(mL, y, contentW, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('DETTAGLIO SALDO PROGRESSIVO AL ' + dataUltimoGiorno, pw/2, y + 5.5, { align: 'center' });
        y += 10;
        
        // Header tabella progressivi
        doc.setFillColor(241, 245, 249);
        doc.rect(mL, y, contentW, 7, 'F');
        doc.setTextColor(71, 85, 105);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('PERIODO', mL + 5, y + 5);
        doc.text('DESCRIZIONE', mL + 35, y + 5);
        doc.text('IMPORTO', mL + 125, y + 5, { align: 'center' });
        doc.text('SALDO PROGR.', pw - mR - 5, y + 5, { align: 'right' });
        y += 9;
        
        // Ordina e calcola saldi
        eventiProgressivo.sort(function(a, b) { return a.dataSort - b.dataSort; });
        var saldoTempPrec = saldoIniziale;
        for (var i = 0; i < eventiProgressivo.length; i++) {
            var ev = eventiProgressivo[i];
            if (ev.tipo === 'mese') {
                saldoTempPrec += ev.totale;
            } else {
                saldoTempPrec -= ev.importo;
            }
            ev.saldoProgressivo = saldoTempPrec;
        }
        
        // Ordina decrescente per stampa
        eventiProgressivo.sort(function(a, b) { return b.dataSort - a.dataSort; });
        
        lineH = 5;
        var rigaIdx = 0;
        
        for (var ev = 0; ev < eventiProgressivo.length; ev++) {
            var evento = eventiProgressivo[ev];
            
            if (evento.tipo === 'mese') {
                var numVoci = evento.voci.length;
                var altezzaBlocco = numVoci * lineH;
                
                if (rigaIdx % 2 === 0) {
                    doc.setFillColor(248, 250, 252);
                    doc.rect(mL, y - 1, contentW, altezzaBlocco + 2, 'F');
                }
                
                doc.setFontSize(7);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(51, 65, 85);
                doc.text(mesiNomi[evento.mese] + ' ' + evento.anno, mL + 5, y + 3.5);
                
                for (var v = 0; v < numVoci; v++) {
                    var voce = evento.voci[v];
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(71, 85, 105);
                    doc.setFontSize(6);
                    
                    var descVoce;
                    if (voce.esente > 0) {
                        descVoce = voce.desc + ' ' + fmtEuro(voce.esente) + ' (es.)';
                    } else {
                        descVoce = voce.desc + ' ' + fmtEuro(voce.imponibile) + ' + IVA ' + fmtEuro(voce.iva);
                    }
                    if (descVoce.length > 55) descVoce = descVoce.substring(0, 52) + '...';
                    doc.text('• ' + descVoce, mL + 35, y + 3.5);
                    
                    if (v === numVoci - 1) {
                        doc.setFontSize(7);
                        doc.setFont('helvetica', 'bold');
                        doc.setTextColor(15, 23, 42);
                        doc.text(fmtEuro(evento.totale), mL + 125, y + 3.5, { align: 'center' });
                        
                        var sp = evento.saldoProgressivo;
                        doc.setTextColor(sp > 0 ? 220 : 22, sp > 0 ? 38 : 163, sp > 0 ? 38 : 74);
                        doc.text(fmtEuro(sp), pw - mR - 5, y + 3.5, { align: 'right' });
                    }
                    
                    y += lineH;
                    if (y > ph - 25) { doc.addPage(); y = mT + 5; }
                }
                
                doc.setDrawColor(220, 220, 220);
                doc.line(mL, y, pw - mR, y);
                y += 2;
                rigaIdx++;
                
            } else {
                // Riga pagamento verde
                doc.setFillColor(220, 252, 231);
                doc.rect(mL, y - 1, contentW, lineH + 2, 'F');
                
                doc.setFontSize(7);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(22, 101, 52);
                doc.text(evento.dataFormattata, mL + 5, y + 3.5);
                
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(6);
                doc.text(evento.metodo, mL + 35, y + 3.5);
                
                doc.setFontSize(7);
                doc.setFont('helvetica', 'bold');
                doc.text('- ' + fmtEuro(evento.importo), mL + 125, y + 3.5, { align: 'center' });
                
                var sp = evento.saldoProgressivo;
                doc.setTextColor(sp > 0 ? 220 : 22, sp > 0 ? 38 : 163, sp > 0 ? 38 : 74);
                doc.text(fmtEuro(sp), pw - mR - 5, y + 3.5, { align: 'right' });
                
                y += lineH + 2;
                doc.setDrawColor(220, 220, 220);
                doc.line(mL, y, pw - mR, y);
                y += 2;
                rigaIdx++;
            }
            
            if (y > ph - 25) { doc.addPage(); y = mT + 5; }
        }
        
        // Riga Residuo
        doc.setFillColor(241, 245, 249);
        doc.rect(mL, y - 1, contentW, lineH + 2, 'F');
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(51, 65, 85);
        doc.text('Residuo Anni Prec.', mL + 5, y + 3.5);
        doc.setTextColor(saldoIniziale > 0 ? 220 : 22, saldoIniziale > 0 ? 38 : 163, saldoIniziale > 0 ? 38 : 74);
        doc.text(fmtEuro(saldoIniziale), pw - mR - 5, y + 3.5, { align: 'right' });
        y += lineH + 5;
        
    } else {
        // ==================== ANNO/PERIODO: PROSPETTO SINTETICO NORMALE ====================
        
        // ========== TABELLA PRINCIPALE ==========
        doc.setFillColor(15, 23, 42);
        doc.rect(mL, y, contentW, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        
        var col1 = mL + 3;
        var col2 = mL + 30;
        var col3 = mL + 130;
        var col4 = pw - mR - 3;
        
        doc.text('PERIODO', col1, y + 5.5);
        doc.text('DESCRIZIONE', col2, y + 5.5);
        doc.text('IMPORTO', col3, y + 5.5, { align: 'center' });
        doc.text('SALDO PROGR.', col4, y + 5.5, { align: 'right' });
        y += 10;
        
        var lineH = 5;
        
        // Calcola saldi progressivi
        eventiOrdinati.sort(function(a, b) { return a.dataSort - b.dataSort; });
        
        var saldoTemp = saldoIniziale;
        for (var i = 0; i < eventiOrdinati.length; i++) {
            var ev = eventiOrdinati[i];
            if (ev.tipo === 'mese') {
                saldoTemp += ev.totale;
            } else {
                saldoTemp -= ev.importo;
            }
            ev.saldoProgressivo = saldoTemp;
        }
        
        eventiOrdinati.sort(function(a, b) { return b.dataSort - a.dataSort; });
        
        var rigaIndex = 0;
        for (var ev = 0; ev < eventiOrdinati.length; ev++) {
            var evento = eventiOrdinati[ev];
            
            if (evento.tipo === 'mese') {
                var numVoci = evento.voci.length;
                var altezzaBlocco = numVoci * lineH;
                
                if (rigaIndex % 2 === 0) {
                    doc.setFillColor(248, 250, 252);
                    doc.rect(mL, y - 1, contentW, altezzaBlocco + 2, 'F');
                }
                
                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(51, 65, 85);
                doc.text(mesiNomi[evento.mese] + ' ' + evento.anno, col1, y + 3.5);
                
                for (var v = 0; v < numVoci; v++) {
                    var voce = evento.voci[v];
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(71, 85, 105);
                    doc.setFontSize(6.5);
                    
                    var descVoce;
                    if (voce.esente > 0) {
                        descVoce = voce.desc + ' ' + fmtEuro(voce.esente) + ' (esente IVA)';
                    } else {
                        descVoce = voce.desc + ' ' + fmtEuro(voce.imponibile) + ' + IVA ' + fmtEuro(voce.iva);
                    }
                    if (descVoce.length > 60) descVoce = descVoce.substring(0, 57) + '...';
                    doc.text('• ' + descVoce, col2, y + 3.5);
                    
                    if (v === numVoci - 1) {
                        doc.setFontSize(8);
                        doc.setFont('helvetica', 'bold');
                        doc.setTextColor(15, 23, 42);
                        doc.text(fmtEuro(evento.totale), col3, y + 3.5, { align: 'center' });
                        
                        var sp = evento.saldoProgressivo;
                        doc.setTextColor(sp > 0 ? 220 : 22, sp > 0 ? 38 : 163, sp > 0 ? 38 : 74);
                        doc.text(fmtEuro(sp), col4, y + 3.5, { align: 'right' });
                    }
                    
                    y += lineH;
                    if (y > ph - 25) { doc.addPage(); y = mT + 5; }
                }
                
                doc.setDrawColor(220, 220, 220);
                doc.line(mL, y, pw - mR, y);
                y += 2;
                rigaIndex++;
                
            } else {
                doc.setFillColor(220, 252, 231);
                doc.rect(mL, y - 1, contentW, lineH + 2, 'F');
                
                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(22, 101, 52);
                doc.text(evento.dataFormattata, col1, y + 3.5);
                
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(7);
                doc.text(evento.metodo, col2, y + 3.5);
                
                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.text('- ' + fmtEuro(evento.importo), col3, y + 3.5, { align: 'center' });
                
                var sp = evento.saldoProgressivo;
                doc.setTextColor(sp > 0 ? 220 : 22, sp > 0 ? 38 : 163, sp > 0 ? 38 : 74);
                doc.text(fmtEuro(sp), col4, y + 3.5, { align: 'right' });
                
                y += lineH + 2;
                doc.setDrawColor(220, 220, 220);
                doc.line(mL, y, pw - mR, y);
                y += 2;
                rigaIndex++;
            }
            
            if (y > ph - 25) { doc.addPage(); y = mT + 5; }
        }
        
        // Riga Residuo
        doc.setFillColor(241, 245, 249);
        doc.rect(mL, y - 1, contentW, lineH + 2, 'F');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(51, 65, 85);
        doc.text('Residuo Anni Prec.', col1, y + 3.5);
        doc.setTextColor(saldoIniziale > 0 ? 220 : 22, saldoIniziale > 0 ? 38 : 163, saldoIniziale > 0 ? 38 : 74);
        doc.text(fmtEuro(saldoIniziale), col4, y + 3.5, { align: 'right' });
        y += lineH + 5;
    }
    
    // ==================== PAGINA TARIFFARIO (opzionale) ====================
    var includiTariffario = document.getElementById('pdf-includi-tariffario') ? document.getElementById('pdf-includi-tariffario').checked : true;
    
    if (includiTariffario) {
        doc.addPage();
        y = mT;
        
        // Header pagina tariffario
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('TARIFFARIO APPLICATO', pw / 2, y + 5, { align: 'center' });
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(cliente.denominazione, pw / 2, y + 11, { align: 'center' });
        
        y += 18;
        doc.setDrawColor(200, 200, 200);
        doc.line(mL, y, pw - mR, y);
        y += 8;
        
        var mesiNomiCompleti = ['Tutti i mesi', 'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
        
        // Raggruppa voci per categoria usando categoriaNome dal tariffario cliente
        var categorieMap = {};
        var categorieOrdine = [];
        
        for (var t = 0; t < tariffario.length; t++) {
            var voce = tariffario[t];
            if (parseFloat(voce.prezzo) <= 0) continue; // Salta voci senza prezzo
            
            var catNome = voce.categoriaNome || 'Altro';
            if (!categorieMap[catNome]) {
                categorieMap[catNome] = [];
                categorieOrdine.push(catNome);
            }
            categorieMap[catNome].push(voce);
        }
        
        if (categorieOrdine.length > 0) {
            // Mostra per categoria
            for (var c = 0; c < categorieOrdine.length; c++) {
                var catNome = categorieOrdine[c];
                var vociCategoria = categorieMap[catNome];
                
                // Intestazione categoria
                doc.setFillColor(241, 245, 249);
                doc.rect(mL, y - 2, contentW, 8, 'F');
                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(51, 65, 85);
                doc.text(catNome.toUpperCase(), mL + 5, y + 3);
                y += 10;
                
                // Voci della categoria
                for (var v = 0; v < vociCategoria.length; v++) {
                    var voce = vociCategoria[v];
                    
                    if (v % 2 === 0) {
                        doc.setFillColor(250, 250, 252);
                        doc.rect(mL, y - 2, contentW, 7, 'F');
                    }
                    
                    doc.setFontSize(7);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(51, 65, 85);
                    doc.text(voce.descrizione, mL + 8, y + 2);
                    
                    // Mesi di applicazione
                    var mesiStr = '';
                    if (voce.mesi && voce.mesi.length > 0) {
                        if (voce.mesi[0] === 0 || voce.mesi.length === 12) {
                            mesiStr = 'Tutti i mesi';
                        } else {
                            var nomiMesi = [];
                            for (var m = 0; m < voce.mesi.length; m++) {
                                nomiMesi.push(mesiNomiCompleti[voce.mesi[m]] || '');
                            }
                            mesiStr = nomiMesi.join(', ');
                        }
                    }
                    doc.setFontSize(6);
                    doc.setTextColor(100, 116, 139);
                    doc.text(mesiStr, mL + 90, y + 2);
                    
                    // Prezzo
                    doc.setFontSize(7);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(15, 23, 42);
                    var prezzoStr = fmtEuro(parseFloat(voce.prezzo) || 0);
                    if (voce.esenteIva) prezzoStr += ' (es.)';
                    doc.text(prezzoStr, pw - mR - 5, y + 2, { align: 'right' });
                    
                    y += 7;
                    
                    // Check overflow
                    if (y > ph - 25) {
                        doc.addPage();
                        y = mT + 5;
                    }
                }
                
                y += 5; // Spazio tra categorie
            }
        } else if (tariffario.length === 0) {
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(148, 163, 184);
            doc.text('Nessun tariffario applicato', pw / 2, y + 10, { align: 'center' });
        }
    }
    
    // ========== FOOTER SU TUTTE LE PAGINE ==========
    var totalPages = doc.internal.getNumberOfPages();
    for (var p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFontSize(6);
        doc.setTextColor(148, 163, 184);
        doc.setFont('helvetica', 'normal');
        doc.text(cliente.denominazione + '  |  ' + periodoLabel + '  |  Pag. ' + p + '/' + totalPages + '  |  ' + new Date().toLocaleDateString('it-IT'), pw / 2, ph - 5, { align: 'center' });
    }
    
    // Mostra anteprima
    var fileName = cliente.denominazione + ' Estratto Sintetico ' + nomeFile + '.pdf';
    var cartella = cliente.denominazione.replace(/[^a-zA-Z0-9 ]/g, '');
    var percorso = 'schede clienti/' + cartella + '/ESTRATTI CONTO/' + fileName;
    
    mostraAnteprimaPDF(doc, fileName, percorso, 'sintetico', icon('clipboard-list',14) + ' Anteprima Estratto Sintetico', pdfClienteId);
}

function calcolaStatsPeriodo(cliente, rangeStart, rangeEnd) {
    var residuoIniziale = cliente.residuoIniziale || 0;
    var tariffario = cliente.tariffario || [];
    var praticheClienteManuali = praticheClienti[cliente.id] || {};
    
    var imponibilePeriodo = 0, esentePeriodo = 0;
    var imponibilePrec = 0, esentePrec = 0;
    var pagPeriodo = 0, pagPrec = 0;
    
    // Determina l'anno di riferimento
    var annoRiferimento = rangeEnd ? rangeEnd.anno : new Date().getFullYear();
    
    // Scansiona TUTTE le pratiche manuali per separare quelle dell'anno corrente da quelle precedenti
    for (var chiaveMese in praticheClienteManuali) {
        var annoMese = parseInt(chiaveMese.split('-')[0]);
        var meseMese = parseInt(chiaveMese.split('-')[1]);
        var praticheMeseObj = praticheClienteManuali[chiaveMese];
        
        var isAnnoCorrente = (annoMese === annoRiferimento);
        var isAnnoPrecedente = (annoMese < annoRiferimento);
        var nelPeriodo = false;
        
        if (isAnnoCorrente) {
            if (rangeStart === null) {
                nelPeriodo = true;
            } else if (meseMese >= rangeStart.mese && meseMese <= rangeEnd.mese) {
                nelPeriodo = true;
            }
        }
        
        for (var tipoPratica in praticheMeseObj) {
            if (tipoPratica === '_richieste') {
                var richieste = praticheMeseObj._richieste || [];
                for (var i = 0; i < richieste.length; i++) {
                    var costoRichiesta = richieste[i].costo || 0;
                    var esenteRichiesta = richieste[i].esenteIva || false;
                    
                    if (isAnnoPrecedente) {
                        // Pratiche anni precedenti → vanno nel residuo
                        if (esenteRichiesta) esentePrec += costoRichiesta;
                        else imponibilePrec += costoRichiesta;
                    } else if (nelPeriodo) {
                        // Pratiche del periodo corrente
                        if (esenteRichiesta) esentePeriodo += costoRichiesta;
                        else imponibilePeriodo += costoRichiesta;
                    }
                }
            } else if (tipoPratica === '_costiFissi') {
                // Costi fissi contabilizzati
                var costiFissi = praticheMeseObj._costiFissi || [];
                for (var i = 0; i < costiFissi.length; i++) {
                    var cf = costiFissi[i];
                    var costoCf = (cf.qta || 1) * (cf.prezzo || 0);
                    var esenteCf = cf.esenteIva || false;
                    
                    if (isAnnoPrecedente) {
                        if (esenteCf) esentePrec += costoCf;
                        else imponibilePrec += costoCf;
                    } else if (nelPeriodo) {
                        if (esenteCf) esentePeriodo += costoCf;
                        else imponibilePeriodo += costoCf;
                    }
                }
            } else {
                // Supporta sia vecchio formato (numero) che nuovo (oggetto con qta e prezzo)
                var val = praticheMeseObj[tipoPratica];
                var qta, prezzoPratica;
                if (typeof val === 'object') {
                    qta = val.qta || 0;
                    prezzoPratica = val.prezzo || 0;
                } else {
                    qta = val || 0;
                    prezzoPratica = calcolaPrezzoPratica(cliente, tipoPratica);
                }
                
                if (qta > 0) {
                    var totPratica = prezzoPratica * qta;
                    
                    if (isAnnoPrecedente) {
                        imponibilePrec += totPratica;
                    } else if (nelPeriodo) {
                        imponibilePeriodo += totPratica;
                    }
                }
            }
        }
    }
    
    // I costi fissi vengono conteggiati SOLO quando contabilizzati manualmente
    // (sono già inclusi sopra nei _costiFissi)
    
    // Calcola pagamenti - separa anno corrente da precedenti
    for (var i = 0; i < pagamenti.length; i++) {
        var p = pagamenti[i];
        if (p.clienteId !== cliente.id) continue;
        var pAnno = p.data ? parseInt(p.data.substring(0, 4)) : null;
        var pMese = p.data ? parseInt(p.data.substring(5, 7)) : null;
        var imp = parseFloat(p.importo) || 0;
        
        if (pAnno < annoRiferimento) {
            // Pagamenti anni precedenti
            pagPrec += imp;
        } else if (pAnno === annoRiferimento) {
            if (rangeStart === null) {
                pagPeriodo += imp;
            } else if (pMese >= rangeStart.mese && pMese <= rangeEnd.mese) {
                pagPeriodo += imp;
            }
        }
    }
    
    // Residuo precedente = residuo iniziale + costi anni precedenti (con IVA) - pagamenti anni precedenti
    var totaleConIvaPrec = (imponibilePrec * 1.22) + esentePrec;
    var residuoPrecedente = residuoIniziale + totaleConIvaPrec - pagPrec;
    
    var totaleConIvaPeriodo = (imponibilePeriodo * 1.22) + esentePeriodo;
    
    return {
        residuoPrecedente: residuoPrecedente,
        totaleImponibile: imponibilePeriodo,
        totaleEsente: esentePeriodo,
        totaleConIva: totaleConIvaPeriodo,
        totalePagamenti: pagPeriodo
    };
}

// ==================== VARIABILI PAGHE ====================
function apriVariabiliPaghe() {
    if (clienti.length === 0) {
        showToast('Nessun cliente presente. Aggiungi almeno un cliente prima', 'warning');
        return;
    }
    
    // Popola select anno
    var anno = new Date().getFullYear();
    var optAnno = '';
    for (var a = anno; a >= anno - 5; a--) {
        optAnno += '<option value="' + a + '">' + a + '</option>';
    }
    document.getElementById('vp-anno').innerHTML = optAnno;
    
    // Seleziona mese corrente
    var meseCorrente = new Date().getMonth() + 1;
    var meseStr = meseCorrente < 10 ? '0' + meseCorrente : '' + meseCorrente;
    document.getElementById('vp-mese').value = meseStr;
    
    // Genera tabella
    generaTabellaVariabiliPaghe();
    
    apriModal('modal-variabili-paghe');
}

function generaTabellaVariabiliPaghe() {
    // Ordina clienti alfabeticamente ed escludi archiviati
    var clientiOrdinati = clienti.filter(function(c) {
        return !c.archiviato;
    }).sort(function(a, b) {
        return a.denominazione.toLowerCase().localeCompare(b.denominazione.toLowerCase());
    });
    
    // Ottieni mese corrente selezionato
    var meseSelezionato = parseInt(document.getElementById('vp-mese').value);
    
    // Trova TUTTE le voci Costi Variabili Annuali Paghe attive per questo mese (da tutti i tariffari)
    var vociVAP = []; // { id, descrizione, prezzo, esenteIva }
    for (var t = 0; t < tariffariBase.length; t++) {
        var tariffario = tariffariBase[t];
        for (var mg = 0; mg < tariffario.macrogruppi.length; mg++) {
            if (tariffario.macrogruppi[mg].id === 6) { // Costi Variabili Annuali Paghe
                var voci = tariffario.macrogruppi[mg].voci || [];
                for (var v = 0; v < voci.length; v++) {
                    var voce = voci[v];
                    var mesiVoce = voce.mesi || [];
                    // Verifica se questo mese è abilitato (0 = tutti, oppure mese specifico)
                    var meseAbilitato = mesiVoce.indexOf(0) >= 0 || mesiVoce.indexOf(meseSelezionato) >= 0;
                    if (meseAbilitato) {
                        // Evita duplicati (stessa descrizione)
                        var giàPresente = false;
                        for (var x = 0; x < vociVAP.length; x++) {
                            if (vociVAP[x].descrizione === voce.descrizione) { giàPresente = true; break; }
                        }
                        if (!giàPresente) {
                            vociVAP.push({
                                id: voce.id,
                                descrizione: voce.descrizione,
                                prezzo: voce.prezzo,
                                esenteIva: voce.esenteIva
                            });
                        }
                    }
                }
            }
        }
    }
    
    // Funzione helper per verificare se un cliente ha una specifica voce VAP nel suo tariffario
    function clienteHaVoceVAP(cliente, descrizioneVoce, meseSelez) {
        // Cerca nel tariffario copiato del cliente (cliente.tariffario)
        var tariffarioCliente = cliente.tariffario || [];
        
        for (var v = 0; v < tariffarioCliente.length; v++) {
            var voce = tariffarioCliente[v];
            // Cerca voci con categoriaId === 6 (Costi Variabili Annuali Paghe)
            if (voce.categoriaId === 6 && voce.descrizione === descrizioneVoce) {
                // Verifica che il mese sia abilitato
                var mesiVoce = voce.mesi || [];
                var meseAbilitato = mesiVoce.indexOf(0) >= 0 || mesiVoce.indexOf(meseSelez) >= 0;
                if (meseAbilitato) {
                    return { presente: true, prezzo: voce.prezzo, esenteIva: voce.esenteIva };
                }
            }
        }
        return false;
    }
    
    var html = '<table class="vp-table">';
    html += '<thead><tr>';
    html += '<th class="vp-cliente-col">Cliente</th>';
    html += '<th class="vp-col-ced">N° CED</th>';
    html += '<th class="vp-col-a">A</th>';
    html += '<th class="vp-col-v">V</th>';
    html += '<th class="vp-col-c">C</th>';
    
    // Aggiungi colonne per Costi Variabili Annuali Paghe
    for (var v = 0; v < vociVAP.length; v++) {
        // Abbrevia descrizione per header (max 8 caratteri)
        var abbr = vociVAP[v].descrizione.substring(0, 8);
        html += '<th class="vp-col-vap" title="' + vociVAP[v].descrizione + '">' + abbr + '</th>';
    }
    
    html += '</tr></thead><tbody>';
    
    for (var i = 0; i < clientiOrdinati.length; i++) {
        var c = clientiOrdinati[i];
        
        html += '<tr data-cliente-id="' + c.id + '">';
        html += '<td class="vp-cliente-col">' + c.denominazione + '</td>';
        html += '<td class="vp-col-ced"><input type="number" class="vp-input vp-input-ced" min="0" value="0"></td>';
        html += '<td class="vp-col-a"><input type="number" class="vp-input vp-input-a" min="0" value="0"></td>';
        html += '<td class="vp-col-v"><input type="number" class="vp-input vp-input-v" min="0" value="0"></td>';
        html += '<td class="vp-col-c"><input type="number" class="vp-input vp-input-c" min="0" value="0"></td>';
        
        // Aggiungi celle per Costi Variabili Annuali Paghe
        for (var v = 0; v < vociVAP.length; v++) {
            var infoVoce = clienteHaVoceVAP(c, vociVAP[v].descrizione, meseSelezionato);
            if (infoVoce) {
                // Cliente ha questa voce nel suo tariffario → casella compilabile
                html += '<td class="vp-col-vap"><input type="number" class="vp-input vp-input-vap" data-vap-id="' + vociVAP[v].id + '" data-vap-desc="' + vociVAP[v].descrizione + '" data-vap-prezzo="' + (infoVoce.prezzo || 0) + '" data-vap-esente="' + (infoVoce.esenteIva ? '1' : '0') + '" min="0" value="0"></td>';
            } else {
                // Cliente NON ha questa voce → casella sbarrata
                html += '<td class="vp-col-vap vp-cell-sbarrata"><span class="vp-sbarrato">&times;</span></td>';
            }
        }
        
        html += '</tr>';
    }
    
    html += '</tbody></table>';
    document.getElementById('vp-tabella-container').innerHTML = html;
}

async function caricaVariabiliSuSchedaCliente() {
    var anno = document.getElementById('vp-anno').value;
    var mese = document.getElementById('vp-mese').value;
    var chiave = anno + '-' + mese;
    
    var righe = document.querySelectorAll('.vp-table tbody tr');
    var caricati = 0;
    
    for (var i = 0; i < righe.length; i++) {
        var riga = righe[i];
        var clienteId = parseInt(riga.getAttribute('data-cliente-id'));
        
        // Trova il cliente per ottenere i prezzi dal tariffario
        var cliente = null;
        for (var j = 0; j < clienti.length; j++) {
            if (clienti[j].id === clienteId) { cliente = clienti[j]; break; }
        }
        
        var cedolini = parseInt(riga.querySelector('.vp-input-ced').value) || 0;
        var assunzioni = parseInt(riga.querySelector('.vp-input-a').value) || 0;
        var variazioni = parseInt(riga.querySelector('.vp-input-v').value) || 0;
        var cessazioni = parseInt(riga.querySelector('.vp-input-c').value) || 0;
        
        // Raccogli anche i Costi Variabili Annuali Paghe
        var vociVAP = [];
        var inputsVAP = riga.querySelectorAll('.vp-input-vap');
        for (var v = 0; v < inputsVAP.length; v++) {
            var inp = inputsVAP[v];
            var qta = parseInt(inp.value) || 0;
            if (qta > 0 && !inp.disabled) {
                vociVAP.push({
                    descrizione: inp.getAttribute('data-vap-desc'),
                    qta: qta,
                    prezzo: parseFloat(inp.getAttribute('data-vap-prezzo')) || 0,
                    esenteIva: inp.getAttribute('data-vap-esente') === '1'
                });
            }
        }
        
        var haDati = cedolini > 0 || assunzioni > 0 || variazioni > 0 || cessazioni > 0 || vociVAP.length > 0;
        
        if (haDati) {
            // Inizializza struttura se necessario
            if (!praticheClienti[clienteId]) praticheClienti[clienteId] = {};
            if (!praticheClienti[clienteId][chiave]) praticheClienti[clienteId][chiave] = {};
            
            var pm = praticheClienti[clienteId][chiave];
            
            // Funzione helper per aggiungere pratica con prezzo storicizzato
            function aggiungiPraticaStoricizzata(pmObj, nomePratica, qtaDaAggiungere, prezzoAttuale, esenteIva) {
                var esistente = pmObj[nomePratica];
                if (esistente && typeof esistente === 'object') {
                    // Nuovo formato: somma quantità, mantieni prezzo originale
                    esistente.qta += qtaDaAggiungere;
                } else if (esistente && typeof esistente === 'number') {
                    // Vecchio formato: converti e somma
                    pmObj[nomePratica] = { qta: esistente + qtaDaAggiungere, prezzo: prezzoAttuale, esenteIva: esenteIva || false };
                } else {
                    // Non esiste: crea nuovo
                    pmObj[nomePratica] = { qta: qtaDaAggiungere, prezzo: prezzoAttuale, esenteIva: esenteIva || false };
                }
            }
            
            // Aggiungi le pratiche standard con prezzo storicizzato
            if (cedolini > 0) {
                var prezzoCed = calcolaPrezzoPratica(cliente, 'Cedolini');
                aggiungiPraticaStoricizzata(pm, 'Cedolini', cedolini, prezzoCed);
                caricati += cedolini;
            }
            if (assunzioni > 0) {
                var prezzoAss = calcolaPrezzoPratica(cliente, 'Assunzione');
                aggiungiPraticaStoricizzata(pm, 'Assunzione', assunzioni, prezzoAss);
                caricati += assunzioni;
            }
            if (variazioni > 0) {
                var prezzoVar = calcolaPrezzoPratica(cliente, 'Variazione');
                aggiungiPraticaStoricizzata(pm, 'Variazione', variazioni, prezzoVar);
                caricati += variazioni;
            }
            if (cessazioni > 0) {
                var prezzoCes = calcolaPrezzoPratica(cliente, 'Cessazione');
                aggiungiPraticaStoricizzata(pm, 'Cessazione', cessazioni, prezzoCes);
                caricati += cessazioni;
            }
            
            // Aggiungi Costi Variabili Annuali Paghe
            for (var v = 0; v < vociVAP.length; v++) {
                var voce = vociVAP[v];
                aggiungiPraticaStoricizzata(pm, voce.descrizione, voce.qta, voce.prezzo, voce.esenteIva);
                caricati += voce.qta;
            }
            
            praticheClienti[clienteId][chiave] = pm;
            
            // Salva su Supabase
            await dbSalvaPraticaCliente(clienteId, chiave, pm);
        }
    }
    
    if (caricati === 0) {
        showToast('Nessuna pratica da caricare. Inserisci almeno un valore', 'warning');
        return;
    }
    
    // Messaggio conferma
    var mesiNomi = ['', 'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    var meseNome = mesiNomi[parseInt(mese)];
    alert('Caricate ' + caricati + ' voci per ' + meseNome + ' ' + anno);
    
    chiudiModal('modal-variabili-paghe');
    caricaClienti();
}

// ==================== CONTABILIZZA COSTI FISSI ====================
function apriContabilizzaCostiFissi() {
    if (clienti.length === 0) {
        showToast('Nessun cliente presente. Aggiungi almeno un cliente prima', 'warning');
        return;
    }
    
    // Popola select anno
    var anno = new Date().getFullYear();
    var optAnno = '';
    for (var a = anno; a >= anno - 5; a--) {
        optAnno += '<option value="' + a + '">' + a + '</option>';
    }
    document.getElementById('cf-anno').innerHTML = optAnno;
    
    // Seleziona mese corrente
    var meseCorrente = new Date().getMonth() + 1;
    var meseStr = meseCorrente < 10 ? '0' + meseCorrente : '' + meseCorrente;
    document.getElementById('cf-mese-da').value = meseStr;
    document.getElementById('cf-mese-a').value = meseStr;
    
    // Popola select clienti (ordinati alfabeticamente)
    var clientiOrdinati = clienti.slice().sort(function(a, b) {
        return a.denominazione.toLowerCase().localeCompare(b.denominazione.toLowerCase());
    });
    var optClienti = '<option value="">-- Tutti i clienti --</option>';
    for (var i = 0; i < clientiOrdinati.length; i++) {
        optClienti += '<option value="' + clientiOrdinati[i].id + '">' + clientiOrdinati[i].denominazione + '</option>';
    }
    document.getElementById('cf-cliente').innerHTML = optClienti;
    
    // Genera anteprima
    aggiornaAnteprimaCostiFissi();
    
    apriModal('modal-contabilizza-costi');
}

function aggiornaAnteprimaCostiFissi() {
    var anno = document.getElementById('cf-anno').value;
    var meseDa = parseInt(document.getElementById('cf-mese-da').value);
    var meseA = parseInt(document.getElementById('cf-mese-a').value);
    var clienteSelezionato = document.getElementById('cf-cliente').value;
    
    if (meseA < meseDa) {
        document.getElementById('cf-anteprima-container').innerHTML = '<p style="color:#dc2626;text-align:center;">Il mese finale deve essere uguale o successivo al mese iniziale.</p>';
        return;
    }
    
    var mesiNomi = ['', 'Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    
    // Voci da escludere (gestite da Variabili Paghe)
    var vociEscluse = ['cedolini', 'assunzione', 'variazione', 'cessazione'];
    
    // Clienti da processare
    var clientiDaProcessare = [];
    if (clienteSelezionato) {
        for (var i = 0; i < clienti.length; i++) {
            if (clienti[i].id === parseInt(clienteSelezionato)) {
                clientiDaProcessare.push(clienti[i]);
                break;
            }
        }
    } else {
        clientiDaProcessare = clienti.slice().sort(function(a, b) {
            return a.denominazione.toLowerCase().localeCompare(b.denominazione.toLowerCase());
        });
    }
    
    var html = '<table class="cf-table"><thead><tr><th>Cliente</th><th>Voce</th><th>Mese</th><th style="text-align:center;">Qta</th><th style="text-align:right;">Prezzo</th><th style="text-align:right;">Totale</th><th style="text-align:center;">Stato</th></tr></thead><tbody>';
    
    var grandTotale = 0;
    var vociDaContabilizzare = 0;
    var vociGiaContabilizzate = 0;
    
    for (var ci = 0; ci < clientiDaProcessare.length; ci++) {
        var cliente = clientiDaProcessare[ci];
        var tariffario = cliente.tariffario || [];
        var contabCliente = contabilizzazioni[cliente.id] || [];
        
        for (var mese = meseDa; mese <= meseA; mese++) {
            var chiaveMese = anno + '-' + (mese < 10 ? '0' : '') + mese;
            
            for (var vi = 0; vi < tariffario.length; vi++) {
                var voce = tariffario[vi];
                var descLower = (voce.descrizione || '').toLowerCase();
                
                // Salta voci escluse
                var esclusa = false;
                for (var e = 0; e < vociEscluse.length; e++) {
                    if (descLower.indexOf(vociEscluse[e]) >= 0) { esclusa = true; break; }
                }
                if (esclusa) continue;
                
                // Verifica se la voce si applica a questo mese
                var mesiVoce = voce.mesi || [];
                var siApplica = mesiVoce.indexOf(0) >= 0 || mesiVoce.indexOf(mese) >= 0;
                if (!siApplica) continue;
                
                // Controlla flag "Richiede anno precedente"
                var annoPrecedente = parseInt(anno) - 1;
                if (voce.richiedeAnnoPrecedente) {
                    var clienteAttivoAnnoPrecedente = verificaClienteAttivoAnno(cliente, annoPrecedente);
                    if (!clienteAttivoAnnoPrecedente) {
                        continue; // Salta questa voce - cliente non attivo anno precedente
                    }
                }
                
                var qta = voce.quantita !== undefined ? parseInt(voce.quantita) : 1;
                if (qta < 1) qta = 1;
                var prezzo = parseFloat((voce.prezzo || '0').toString().replace(',', '.')) || 0;
                var totale = qta * prezzo;
                
                // Verifica se questa specifica voce è già contabilizzata
                var voceGiaContabilizzata = isVoceContabilizzata(contabCliente, chiaveMese, voce.descrizione);
                
                var statoClass = voceGiaContabilizzata ? 'stato-contabilizzato' : 'stato-da-fare';
                var statoText = voceGiaContabilizzata ? icon('check', 14, 'color:#1a7a4a') + ' Già contabilizzato' : 'Da contabilizzare';
                
                if (voceGiaContabilizzata) {
                    vociGiaContabilizzate++;
                } else {
                    vociDaContabilizzare++;
                    grandTotale += totale;
                }
                
                html += '<tr class="' + (voceGiaContabilizzata ? 'riga-contabilizzata' : '') + '">' +
                    '<td>' + cliente.denominazione + '</td>' +
                    '<td>' + voce.descrizione + '</td>' +
                    '<td>' + mesiNomi[mese] + ' ' + anno + '</td>' +
                    '<td style="text-align:center;">' + qta + '</td>' +
                    '<td style="text-align:right;">' + formatoEuro(prezzo) + '</td>' +
                    '<td style="text-align:right;">' + formatoEuro(totale) + '</td>' +
                    '<td style="text-align:center;"><span class="' + statoClass + '">' + statoText + '</span></td>' +
                    '</tr>';
            }
        }
    }
    
    html += '</tbody></table>';
    
    // Riepilogo
    var riepilogoHtml = '<div class="cf-riepilogo">' +
        '<div class="cf-stat"><span class="cf-stat-label">Voci da contabilizzare:</span><span class="cf-stat-value">' + vociDaContabilizzare + '</span></div>' +
        '<div class="cf-stat"><span class="cf-stat-label">Già contabilizzate:</span><span class="cf-stat-value">' + vociGiaContabilizzate + '</span></div>' +
        '<div class="cf-stat"><span class="cf-stat-label">Totale da contabilizzare:</span><span class="cf-stat-value positivo">' + formatoEuro(grandTotale) + '</span></div>' +
        '</div>';
    
    if (vociDaContabilizzare === 0 && vociGiaContabilizzate === 0) {
        document.getElementById('cf-anteprima-container').innerHTML = '<p style="color:#94a3b8;text-align:center;">Nessuna voce da contabilizzare per il periodo selezionato.</p>';
    } else {
        document.getElementById('cf-anteprima-container').innerHTML = riepilogoHtml + '<div class="cf-table-container">' + html + '</div>';
    }
}

async function eseguiContabilizzazione() {
    var anno = document.getElementById('cf-anno').value;
    var meseDa = parseInt(document.getElementById('cf-mese-da').value);
    var meseA = parseInt(document.getElementById('cf-mese-a').value);
    var clienteSelezionato = document.getElementById('cf-cliente').value;
    
    if (meseA < meseDa) {
        showToast('Il mese finale deve essere uguale o successivo al mese iniziale', 'warning');
        return;
    }
    
    // Voci da escludere
    var vociEscluse = ['cedolini', 'assunzione', 'variazione', 'cessazione'];
    
    // Clienti da processare
    var clientiDaProcessare = [];
    if (clienteSelezionato) {
        for (var i = 0; i < clienti.length; i++) {
            if (clienti[i].id === parseInt(clienteSelezionato)) {
                clientiDaProcessare.push(clienti[i]);
                break;
            }
        }
    } else {
        clientiDaProcessare = clienti.slice();
    }
    
    var vociContabilizzate = 0;
    var vociGiaFatte = 0;
    
    for (var ci = 0; ci < clientiDaProcessare.length; ci++) {
        var cliente = clientiDaProcessare[ci];
        var tariffario = cliente.tariffario || [];
        
        if (!contabilizzazioni[cliente.id]) contabilizzazioni[cliente.id] = [];
        var contabCliente = contabilizzazioni[cliente.id];
        
        for (var mese = meseDa; mese <= meseA; mese++) {
            var chiaveMese = anno + '-' + (mese < 10 ? '0' : '') + mese;
            
            // Inizializza pratiche per questo mese se non esiste
            if (!praticheClienti[cliente.id]) praticheClienti[cliente.id] = {};
            if (!praticheClienti[cliente.id][chiaveMese]) praticheClienti[cliente.id][chiaveMese] = {};
            var pm = praticheClienti[cliente.id][chiaveMese];
            if (!pm._costiFissi) pm._costiFissi = [];
            
            for (var vi = 0; vi < tariffario.length; vi++) {
                var voce = tariffario[vi];
                var descLower = (voce.descrizione || '').toLowerCase();
                
                // Salta voci escluse
                var esclusa = false;
                for (var e = 0; e < vociEscluse.length; e++) {
                    if (descLower.indexOf(vociEscluse[e]) >= 0) { esclusa = true; break; }
                }
                if (esclusa) continue;
                
                // Verifica se la voce si applica a questo mese
                var mesiVoce = voce.mesi || [];
                var siApplica = mesiVoce.indexOf(0) >= 0 || mesiVoce.indexOf(mese) >= 0;
                if (!siApplica) continue;
                
                // Controlla flag "Richiede anno precedente"
                var annoPrecedente = parseInt(anno) - 1;
                if (voce.richiedeAnnoPrecedente) {
                    var clienteAttivoAnnoPrecedente = verificaClienteAttivoAnno(cliente, annoPrecedente);
                    if (!clienteAttivoAnnoPrecedente) {
                        continue; // Salta questa voce - cliente non attivo anno precedente
                    }
                }
                
                // Verifica se questa specifica voce è già contabilizzata
                if (isVoceContabilizzata(contabCliente, chiaveMese, voce.descrizione)) {
                    vociGiaFatte++;
                    continue;
                }
                
                var qta = voce.quantita !== undefined ? parseInt(voce.quantita) : 1;
                if (qta < 1) qta = 1;
                var prezzo = parseFloat((voce.prezzo || '0').toString().replace(',', '.')) || 0;
                var esente = voce.esenteIva || false;
                
                // Aggiungi voce ai costi fissi
                pm._costiFissi.push({
                    id: Date.now() + Math.random(),
                    descrizione: voce.descrizione,
                    qta: qta,
                    prezzo: prezzo,
                    esenteIva: esente
                });
                
                // Segna voce come contabilizzata
                contabCliente.push({ mese: chiaveMese, voce: voce.descrizione });
                
                vociContabilizzate++;
            }
            
            praticheClienti[cliente.id][chiaveMese] = pm;
        }
        
        contabilizzazioni[cliente.id] = contabCliente;
    }
    
    // Salva
    // Salva su Supabase
    for (var clienteId in praticheClienti) {
        for (var chiave in praticheClienti[clienteId]) {
            await dbSalvaPraticaCliente(parseInt(clienteId), chiave, praticheClienti[clienteId][chiave]);
        }
    }
    await dbSalvaContabilizzazioni(contabilizzazioni);
    
    if (vociContabilizzate === 0) {
        alert('Nessuna nuova voce da contabilizzare.\n\nLe voci selezionate sono già state contabilizzate.\nPer modificare o aggiungere voci, vai nella scheda del singolo cliente.');
    } else {
        alert('Contabilizzazione completata!\n\nVoci contabilizzate: ' + vociContabilizzate + '\nVoci già contabilizzate (saltate): ' + vociGiaFatte);
    }
    
    chiudiModal('modal-contabilizza-costi');
    caricaClienti();
}

// Funzione helper per verificare se una voce è già contabilizzata
function isVoceContabilizzata(contabCliente, chiaveMese, descrizioneVoce) {
    for (var i = 0; i < contabCliente.length; i++) {
        var c = contabCliente[i];
        // Supporta sia vecchio formato (stringa) che nuovo (oggetto)
        if (typeof c === 'object') {
            if (c.mese === chiaveMese && c.voce === descrizioneVoce) {
                return true;
            }
        } else if (typeof c === 'string') {
            // Vecchio formato: era per mese intero, considera tutto contabilizzato
            if (c === chiaveMese) {
                return true;
            }
        }
    }
    return false;
}

// Funzione per verificare se un cliente era attivo in un determinato anno
function verificaClienteAttivoAnno(cliente, anno) {
    // Verifica se il cliente era attivo (anche solo per un giorno) nell'anno specificato
    // Il cliente era attivo se aveva gestione Paghe O Contabilità in quell'anno
    // 
    // Esempi:
    // - Inizio: 2024, Fine: 2026 (cessato Maggio) → attivo nel 2024, 2025, 2026
    // - Inizio: 2026, Fine: null (in corso) → attivo dal 2026 in poi
    // - Inizio: 2020, Fine: 2024 → attivo dal 2020 al 2024, NON attivo nel 2025
    
    // Gestione Paghe
    var attivoPerPaghe = false;
    if (cliente.inizioPaghe) {
        var inizioPagheAnno = parseInt(cliente.inizioPaghe.substring(0, 4));
        var finePagheAnno = cliente.finePaghe ? parseInt(cliente.finePaghe.substring(0, 4)) : 9999; // Se non c'è fine, è ancora attivo
        attivoPerPaghe = (inizioPagheAnno <= anno && finePagheAnno >= anno);
    }
    
    // Gestione Contabilità
    var attivoPerContab = false;
    if (cliente.inizioContabilita) {
        var inizioContabAnno = parseInt(cliente.inizioContabilita.substring(0, 4));
        var fineContabAnno = cliente.fineContabilita ? parseInt(cliente.fineContabilita.substring(0, 4)) : 9999;
        attivoPerContab = (inizioContabAnno <= anno && fineContabAnno >= anno);
    }
    
    return attivoPerPaghe || attivoPerContab;
}

// Funzione per rimuovere una voce dalla lista contabilizzazioni
async function rimuoviVoceContabilizzata(clienteId, chiaveMese, descrizioneVoce) {
    if (!contabilizzazioni[clienteId]) return;
    
    contabilizzazioni[clienteId] = contabilizzazioni[clienteId].filter(function(c) {
        if (typeof c === 'object') {
            return !(c.mese === chiaveMese && c.voce === descrizioneVoce);
        }
        return true; // mantieni vecchio formato
    });
    
    await dbSalvaContabilizzazioni(contabilizzazioni);
}

// Init
document.addEventListener('DOMContentLoaded', function() { 
    // Inizializza filtro anno clienti
    var selectAnnoClienti = document.getElementById('filtro-anno-clienti');
    if (selectAnnoClienti) {
        var annoCorrente = new Date().getFullYear();
        var optAnni = '';
        for (var a = annoCorrente; a >= annoCorrente - 5; a--) {
            optAnni += '<option value="' + a + '"' + (a === annoCorrente ? ' selected' : '') + '>' + a + '</option>';
        }
        selectAnnoClienti.innerHTML = optAnni;
    }
    caricaClienti(); 
});

// ==================== SCADENZARIO / HOME ====================
function aggiornaScadenzario() {
    var oggi = new Date();
    var totDaIncassare = 0, totScaduto = 0, tot30gg = 0, tot60gg = 0;
    var clientiScaduti = [], prossimeScadenze = [];
    var numScaduti = 0, num30gg = 0, num60gg = 0;
    
    for (var i = 0; i < clienti.length; i++) {
        var c = clienti[i];
        var stats = calcolaStatisticheCliente(c);
        var residuo = stats.residuo;
        
        if (residuo <= 0) continue; // Cliente in regola o a credito
        
        totDaIncassare += residuo;
        
        // Calcola data scadenza in base alla cadenza
        var dataScadenza = calcolaDataScadenza(c);
        
        if (!dataScadenza) {
            // Cadenza libera, nessuna scadenza automatica
            continue;
        }
        
        var giorniRitardo = Math.floor((oggi - dataScadenza) / (1000 * 60 * 60 * 24));
        
        if (giorniRitardo > 0) {
            // Scaduto
            totScaduto += residuo;
            numScaduti++;
            clientiScaduti.push({
                cliente: c,
                residuo: residuo,
                giorniRitardo: giorniRitardo,
                dataScadenza: dataScadenza
            });
        } else if (giorniRitardo >= -30) {
            // Scade entro 30 giorni
            tot30gg += residuo;
            num30gg++;
            prossimeScadenze.push({
                cliente: c,
                residuo: residuo,
                giorniMancanti: -giorniRitardo,
                dataScadenza: dataScadenza
            });
        } else if (giorniRitardo >= -60) {
            // Scade entro 60 giorni
            tot60gg += residuo;
            num60gg++;
            prossimeScadenze.push({
                cliente: c,
                residuo: residuo,
                giorniMancanti: -giorniRitardo,
                dataScadenza: dataScadenza
            });
        }
    }
    
    // Cards riepilogo
    var cardsHtml = 
        '<div class="scadenzario-card"><div class="card-value">' + formatoEuro(totDaIncassare) + '</div><div class="card-label">Totale da Incassare</div><div class="card-sub">' + clienti.filter(function(c) { return calcolaStatisticheCliente(c).residuo > 0; }).length + ' clienti</div></div>' +
        '<div class="scadenzario-card scaduto"><div class="card-value">' + formatoEuro(totScaduto) + '</div><div class="card-label">Scaduto</div><div class="card-sub">' + numScaduti + ' clienti</div></div>' +
        '<div class="scadenzario-card warning"><div class="card-value">' + formatoEuro(tot30gg) + '</div><div class="card-label">Scade entro 30gg</div><div class="card-sub">' + num30gg + ' clienti</div></div>' +
        '<div class="scadenzario-card ok"><div class="card-value">' + formatoEuro(tot60gg) + '</div><div class="card-label">Scade entro 60gg</div><div class="card-sub">' + num60gg + ' clienti</div></div>';
    
    document.getElementById('scadenzario-cards').innerHTML = cardsHtml;
    
    // Tabella clienti scaduti
    var scadutiHtml = '';
    if (clientiScaduti.length === 0) {
        scadutiHtml = '<p style="color:#64748b;text-align:center;padding:20px;">Nessun pagamento scaduto</p>';
    } else {
        clientiScaduti.sort(function(a, b) { return b.giorniRitardo - a.giorniRitardo; });
        scadutiHtml = '<table class="scadenzario-table"><thead><tr><th>Cliente</th><th>Scaduto da</th><th>Importo</th><th>Azione</th></tr></thead><tbody>';
        for (var i = 0; i < clientiScaduti.length; i++) {
            var s = clientiScaduti[i];
            var badgeClass = s.giorniRitardo > 30 ? 'scaduto-grave' : 'scaduto';
            scadutiHtml += '<tr>' +
                '<td><span class="cliente-link" onclick="apriDettaglioCliente(' + s.cliente.id + ')">' + s.cliente.denominazione + '</span></td>' +
                '<td><span class="badge-scadenza ' + badgeClass + '">' + s.giorniRitardo + ' giorni</span></td>' +
                '<td style="font-weight:600;color:#dc2626;">' + formatoEuro(s.residuo) + '</td>' +
                '<td><button class="btn-sollecita" onclick="apriSollecito(' + s.cliente.id + ')">' + icon('send', 13) + ' Sollecita</button></td>' +
                '</tr>';
        }
        scadutiHtml += '</tbody></table>';
    }
    document.getElementById('clienti-scaduti-container').innerHTML = scadutiHtml;
    
    // Tabella prossime scadenze
    var prossimeHtml = '';
    if (prossimeScadenze.length === 0) {
        prossimeHtml = '<p style="color:#64748b;text-align:center;padding:20px;">Nessuna scadenza nei prossimi 60 giorni</p>';
    } else {
        prossimeScadenze.sort(function(a, b) { return a.giorniMancanti - b.giorniMancanti; });
        prossimeHtml = '<table class="scadenzario-table"><thead><tr><th>Cliente</th><th>Cadenza</th><th>Scadenza</th><th>Importo Previsto</th></tr></thead><tbody>';
        for (var i = 0; i < prossimeScadenze.length; i++) {
            var p = prossimeScadenze[i];
            var cadenzaLabel = p.cliente.cadenzaPagamenti ? p.cliente.cadenzaPagamenti.charAt(0).toUpperCase() + p.cliente.cadenzaPagamenti.slice(1) : 'N/D';
            var badgeClass = p.giorniMancanti <= 7 ? 'in-scadenza' : 'ok';
            prossimeHtml += '<tr>' +
                '<td><span class="cliente-link" onclick="apriDettaglioCliente(' + p.cliente.id + ')">' + p.cliente.denominazione + '</span></td>' +
                '<td>' + cadenzaLabel + '</td>' +
                '<td><span class="badge-scadenza ' + badgeClass + '">' + p.dataScadenza.toLocaleDateString('it-IT') + '</span></td>' +
                '<td style="font-weight:600;">' + formatoEuro(p.residuo) + '</td>' +
                '</tr>';
        }
        prossimeHtml += '</tbody></table>';
    }
    document.getElementById('prossime-scadenze-container').innerHTML = prossimeHtml;
}

function calcolaDataScadenza(cliente) {
    var cadenza = cliente.cadenzaPagamenti;
    if (!cadenza || cadenza === 'libero') return null;
    
    var oggi = new Date();
    var anno = oggi.getFullYear();
    var mese = oggi.getMonth(); // 0-based
    
    // Trova ultimo periodo di competenza
    var meseCompetenza, annoCompetenza;
    
    if (cadenza === 'mensile') {
        // Scadenza: fine mese successivo
        meseCompetenza = mese - 1;
        annoCompetenza = anno;
        if (meseCompetenza < 0) { meseCompetenza = 11; annoCompetenza--; }
        // Scadenza fine mese successivo
        var meseScadenza = meseCompetenza + 1;
        var annoScadenza = annoCompetenza;
        if (meseScadenza > 11) { meseScadenza = 0; annoScadenza++; }
        return new Date(annoScadenza, meseScadenza + 1, 0); // Ultimo giorno del mese
    } else if (cadenza === 'trimestrale') {
        // Trimestri: Gen-Mar, Apr-Giu, Lug-Set, Ott-Dic
        var trimestre = Math.floor(mese / 3);
        var trimestrePrec = trimestre - 1;
        annoCompetenza = anno;
        if (trimestrePrec < 0) { trimestrePrec = 3; annoCompetenza--; }
        // Scadenza: fine mese dopo il trimestre (Apr, Lug, Ott, Gen)
        var mesiScadenza = [3, 6, 9, 0]; // Aprile, Luglio, Ottobre, Gennaio
        var meseScadenza = mesiScadenza[trimestrePrec];
        var annoScadenza = annoCompetenza;
        if (meseScadenza === 0) annoScadenza++;
        return new Date(annoScadenza, meseScadenza + 1, 0);
    } else if (cadenza === 'quadrimestrale') {
        // Quadrimestri: Gen-Apr, Mag-Ago, Set-Dic
        var quad = Math.floor(mese / 4);
        var quadPrec = quad - 1;
        annoCompetenza = anno;
        if (quadPrec < 0) { quadPrec = 2; annoCompetenza--; }
        var mesiScadenza = [4, 8, 0]; // Maggio, Settembre, Gennaio
        var meseScadenza = mesiScadenza[quadPrec];
        var annoScadenza = annoCompetenza;
        if (meseScadenza === 0) annoScadenza++;
        return new Date(annoScadenza, meseScadenza + 1, 0);
    } else if (cadenza === 'semestrale') {
        // Semestri: Gen-Giu, Lug-Dic
        var sem = mese < 6 ? 0 : 1;
        var semPrec = sem - 1;
        annoCompetenza = anno;
        if (semPrec < 0) { semPrec = 1; annoCompetenza--; }
        var mesiScadenza = [6, 0]; // Luglio, Gennaio
        var meseScadenza = mesiScadenza[semPrec];
        var annoScadenza = annoCompetenza;
        if (meseScadenza === 0) annoScadenza++;
        return new Date(annoScadenza, meseScadenza + 1, 0);
    }
    
    return null;
}

// ==================== IMPOSTAZIONI STUDIO ====================
function caricaImpostazioniStudio() {
    document.getElementById('studio-ragione-sociale').value = impostazioniStudio.ragioneSociale || '';
    document.getElementById('studio-piva').value = impostazioniStudio.piva || '';
    document.getElementById('studio-cf').value = impostazioniStudio.codiceFiscale || '';
    document.getElementById('studio-indirizzo').value = impostazioniStudio.indirizzo || '';
    document.getElementById('studio-telefono').value = impostazioniStudio.telefono || '';
    document.getElementById('studio-email').value = impostazioniStudio.email || '';
    document.getElementById('studio-pec').value = impostazioniStudio.pec || '';
    document.getElementById('studio-banca').value = impostazioniStudio.banca || '';
    document.getElementById('studio-iban').value = impostazioniStudio.iban || '';
    document.getElementById('studio-prossimo-numero').value = impostazioniStudio.prossimoNumeroFattura || 1;
    document.getElementById('studio-anno-fatture').value = impostazioniStudio.annoFatture || new Date().getFullYear();
    document.getElementById('studio-sezionale').value = impostazioniStudio.sezionale || '';
    
    // Carica sezione password
    caricaSezionePassword();
    
    // Carica info ultimo backup
    aggiornaInfoBackup();
    
    // Carica info percorso dati
    aggiornaInfoPercorso();
}

async function salvaImpostazioniStudio() {
    // Salva password se modificata
    if (!salvaPassword()) return;
    
    var oldHash = impostazioniStudio.passwordHash; // Mantieni hash esistente
    var oldId = impostazioniStudio.id; // Mantieni ID
    
    impostazioniStudio = {
        id: oldId,
        ragioneSociale: document.getElementById('studio-ragione-sociale').value.trim(),
        piva: document.getElementById('studio-piva').value.trim(),
        codiceFiscale: document.getElementById('studio-cf').value.trim(),
        indirizzo: document.getElementById('studio-indirizzo').value.trim(),
        telefono: document.getElementById('studio-telefono').value.trim(),
        email: document.getElementById('studio-email').value.trim(),
        pec: document.getElementById('studio-pec').value.trim(),
        banca: document.getElementById('studio-banca').value.trim(),
        iban: document.getElementById('studio-iban').value.trim(),
        prossimoNumeroFattura: parseInt(document.getElementById('studio-prossimo-numero').value) || 1,
        annoFatture: parseInt(document.getElementById('studio-anno-fatture').value) || new Date().getFullYear(),
        sezionale: document.getElementById('studio-sezionale').value.trim()
    };
    
    // Ripristina o aggiorna password hash
    var nuovaPwd = document.getElementById('nuova-password').value;
    if (nuovaPwd) {
        impostazioniStudio.passwordHash = hashPassword(nuovaPwd);
    } else if (oldHash) {
        impostazioniStudio.passwordHash = oldHash;
    }
    
    await dbSalvaImpostazioniStudio(impostazioniStudio);
    caricaSezionePassword();
    showToast('Impostazioni salvate!', 'success');
}

// ==================== SOLLECITO ====================
function apriSollecito(clienteId) {
    var cliente = null;
    for (var i = 0; i < clienti.length; i++) {
        if (clienti[i].id === clienteId) { cliente = clienti[i]; break; }
    }
    if (!cliente) return;
    
    var stats = calcolaStatisticheCliente(cliente);
    
    var html = '<div class="sollecito-preview">' +
        '<p><strong>Cliente:</strong> ' + cliente.denominazione + '</p>' +
        '<p><strong>Importo dovuto:</strong> <span style="color:#dc2626;font-weight:600;">' + formatoEuro(stats.residuo) + '</span></p>' +
        '<hr style="margin:16px 0;">' +
        '<p style="color:#64748b;font-size:13px;">Verrà generato un PDF di sollecito pagamento con i dati del tuo studio e l\'importo dovuto dal cliente.</p>' +
        '</div>';
    
    document.getElementById('modal-sollecito-body').innerHTML = html;
    document.getElementById('modal-sollecito-body').setAttribute('data-cliente-id', clienteId);
    apriModal('modal-sollecito');
}

async function generaSollecitoPDF() {
    var clienteId = parseInt(document.getElementById('modal-sollecito-body').getAttribute('data-cliente-id'));
    var cliente = null;
    for (var i = 0; i < clienti.length; i++) {
        if (clienti[i].id === clienteId) { cliente = clienti[i]; break; }
    }
    if (!cliente) return;
    
    chiudiModal('modal-sollecito');
    
    var stats = calcolaStatisticheCliente(cliente);
    var studio = impostazioniStudio;
    
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF();
    var pw = doc.internal.pageSize.getWidth();
    
    // Header studio
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(studio.ragioneSociale || 'Studio', 20, 25);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(studio.indirizzo || '', 20, 32);
    doc.text('P.IVA: ' + (studio.piva || '') + '  -  Tel: ' + (studio.telefono || ''), 20, 38);
    
    // Data
    doc.text('Data: ' + new Date().toLocaleDateString('it-IT'), pw - 20, 25, { align: 'right' });
    
    // Titolo
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38);
    doc.text('SOLLECITO DI PAGAMENTO', pw / 2, 60, { align: 'center' });
    
    // Destinatario
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Spett.le', 20, 80);
    doc.text(cliente.denominazione, 20, 88);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    if (cliente.indirizzo) doc.text(cliente.indirizzo, 20, 95);
    if (cliente.codiceFiscale) doc.text('C.F./P.IVA: ' + cliente.codiceFiscale, 20, 102);
    
    // Corpo lettera
    var y = 120;
    doc.setFontSize(11);
    doc.text('Con la presente siamo a sollecitare il pagamento delle competenze ancora insolute', 20, y);
    y += 8;
    doc.text('relative ai nostri servizi professionali.', 20, y);
    y += 20;
    
    // Importo
    doc.setFillColor(254, 242, 242);
    doc.roundedRect(20, y, pw - 40, 30, 4, 4, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Importo dovuto:', 30, y + 12);
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(18);
    doc.text(formatoEuro(stats.residuo), pw - 30, y + 20, { align: 'right' });
    
    y += 50;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Vi preghiamo di provvedere al pagamento tramite bonifico bancario:', 20, y);
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('IBAN: ' + (studio.iban || 'N/D'), 20, y);
    
    y += 20;
    doc.setFont('helvetica', 'normal');
    doc.text('Restando a disposizione per eventuali chiarimenti, porgiamo cordiali saluti.', 20, y);
    
    y += 30;
    doc.text(studio.ragioneSociale || 'Lo Studio', 20, y);
    
    // Mostra anteprima invece di salvare direttamente
    var fileName = 'Sollecito ' + cliente.denominazione + ' ' + new Date().toLocaleDateString('it-IT').replace(/\//g, '-') + '.pdf';
    var cartella = cliente.denominazione.replace(/[^a-zA-Z0-9 ]/g, '');
    var percorso = 'schede clienti/' + cartella + '/SOLLECITI/' + fileName;
    
    mostraAnteprimaPDF(doc, fileName, percorso, 'sollecito', icon('send',14) + ' Anteprima Sollecito');
}

// ==================== FATTURAZIONE ====================
var fatturaClienteId = null;

function apriModalFattura(clienteId) {
    fatturaClienteId = clienteId;
    var cliente = null;
    for (var i = 0; i < clienti.length; i++) {
        if (clienti[i].id === clienteId) { cliente = clienti[i]; break; }
    }
    if (!cliente) return;
    
    var anno = new Date().getFullYear();
    var mese = new Date().getMonth() + 1;
    
    var mesiOpt = '';
    var mesiNomi = ['', 'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    for (var m = 1; m <= 12; m++) {
        mesiOpt += '<option value="' + m + '"' + (m === mese - 1 ? ' selected' : '') + '>' + mesiNomi[m] + '</option>';
    }
    
    var html = '<div class="form-group">' +
        '<label>Periodo di riferimento</label>' +
        '<div class="form-row">' +
        '<select id="fattura-mese-da" class="form-select" onchange="aggiornaAnteprimaFattura()">' + mesiOpt + '</select>' +
        '<select id="fattura-mese-a" class="form-select" onchange="aggiornaAnteprimaFattura()">' + mesiOpt.replace('value="' + (mese - 1) + '"', 'value="' + (mese - 1) + '" selected') + '</select>' +
        '<select id="fattura-anno" class="form-select" onchange="aggiornaAnteprimaFattura()"><option value="' + anno + '">' + anno + '</option><option value="' + (anno - 1) + '">' + (anno - 1) + '</option></select>' +
        '</div></div>' +
        '<div id="fattura-suggerimento"></div>' +
        '<div class="form-group" style="margin-top:16px;padding:16px;background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;">' +
        '<label style="font-size:14px;font-weight:600;color:#166534;">' + icon('wallet',14,'color:#166534;margin-right:5px') + ' Importo Fattura (personalizzabile)</label>' +
        '<div class="form-row" style="margin-top:12px;">' +
        '<div class="form-group" style="margin-bottom:0;">' +
        '<label style="font-size:12px;">Imponibile €</label>' +
        '<input type="number" id="fattura-imponibile" class="form-input" step="0.01" min="0" onchange="ricalcolaTotaleFattura()">' +
        '</div>' +
        '<div class="form-group" style="margin-bottom:0;">' +
        '<label style="font-size:12px;">Esente IVA €</label>' +
        '<input type="number" id="fattura-esente" class="form-input" step="0.01" min="0" value="0" onchange="ricalcolaTotaleFattura()">' +
        '</div>' +
        '</div>' +
        '<div id="fattura-totale-calc" style="margin-top:12px;font-size:14px;"></div>' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Descrizione in fattura</label>' +
        '<input type="text" id="fattura-descrizione" class="form-input" placeholder="Es: Competenze professionali, Consulenza, ecc.">' +
        '</div>' +
        '<div id="fattura-anteprima"></div>' +
        '<div class="fatture-storico"><h4>Storico Fatture</h4><div id="fatture-storico-list"></div></div>';
    
    document.getElementById('modal-fattura-body').innerHTML = html;
    aggiornaAnteprimaFattura();
    aggiornaStoricoFatture(clienteId);
    apriModal('modal-fattura');
}

function aggiornaAnteprimaFattura() {
    var cliente = null;
    for (var i = 0; i < clienti.length; i++) {
        if (clienti[i].id === fatturaClienteId) { cliente = clienti[i]; break; }
    }
    if (!cliente) return;
    
    var meseDa = parseInt(document.getElementById('fattura-mese-da').value);
    var meseA = parseInt(document.getElementById('fattura-mese-a').value);
    var anno = parseInt(document.getElementById('fattura-anno').value);
    
    if (meseDa > meseA) { var tmp = meseDa; meseDa = meseA; meseA = tmp; }
    
    var stats = calcolaStatsPeriodo(cliente, { anno: anno, mese: meseDa }, { anno: anno, mese: meseA });
    var iva = stats.totaleImponibile * 0.22;
    var totale = stats.totaleImponibile + iva + stats.totaleEsente;
    
    var mesiNomi = ['', 'Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    var mesiNomiFull = ['', 'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    var periodoLabel = meseDa === meseA ? mesiNomiFull[meseDa] + ' ' + anno : mesiNomiFull[meseDa] + ' - ' + mesiNomiFull[meseA] + ' ' + anno;
    
    // Mostra suggerimento basato sulle competenze calcolate
    var suggerimentoHtml = '<div style="background:#f8fafc;padding:12px;border-radius:8px;margin-bottom:16px;">' +
        '<p style="font-size:12px;color:#64748b;margin-bottom:8px;">' + icon('bar-chart-2',12,'margin-right:4px;vertical-align:-2px') + ' Competenze calcolate per il periodo:</p>' +
        '<p style="font-size:13px;"><strong>Imponibile:</strong> ' + formatoEuro(stats.totaleImponibile) + ' | <strong>Esente:</strong> ' + formatoEuro(stats.totaleEsente) + ' | <strong>Totale (con IVA):</strong> ' + formatoEuro(totale) + '</p>' +
        '<button type="button" class="btn-secondary" style="margin-top:8px;padding:6px 12px;font-size:12px;" onclick="usaImportoSuggerito()">' + icon('archive-restore', 13) + ' Usa questi importi</button>' +
        '</div>';
    
    document.getElementById('fattura-suggerimento').innerHTML = suggerimentoHtml;
    
    // Precompila con importi suggeriti solo se i campi sono vuoti
    var impInput = document.getElementById('fattura-imponibile');
    var eseInput = document.getElementById('fattura-esente');
    if (!impInput.value || impInput.value === '0') {
        impInput.value = stats.totaleImponibile.toFixed(2);
        eseInput.value = stats.totaleEsente.toFixed(2);
    }
    
    // Precompila descrizione
    var descInput = document.getElementById('fattura-descrizione');
    if (!descInput.value) {
        descInput.value = 'Competenze professionali - ' + periodoLabel;
    }
    
    ricalcolaTotaleFattura();
}

function usaImportoSuggerito() {
    var cliente = null;
    for (var i = 0; i < clienti.length; i++) {
        if (clienti[i].id === fatturaClienteId) { cliente = clienti[i]; break; }
    }
    if (!cliente) return;
    
    var meseDa = parseInt(document.getElementById('fattura-mese-da').value);
    var meseA = parseInt(document.getElementById('fattura-mese-a').value);
    var anno = parseInt(document.getElementById('fattura-anno').value);
    if (meseDa > meseA) { var tmp = meseDa; meseDa = meseA; meseA = tmp; }
    
    var stats = calcolaStatsPeriodo(cliente, { anno: anno, mese: meseDa }, { anno: anno, mese: meseA });
    
    document.getElementById('fattura-imponibile').value = stats.totaleImponibile.toFixed(2);
    document.getElementById('fattura-esente').value = stats.totaleEsente.toFixed(2);
    
    ricalcolaTotaleFattura();
}

function ricalcolaTotaleFattura() {
    var imponibile = parseFloat(document.getElementById('fattura-imponibile').value) || 0;
    var esente = parseFloat(document.getElementById('fattura-esente').value) || 0;
    var iva = imponibile * 0.22;
    var totale = imponibile + iva + esente;
    
    var prossimoNumero = impostazioniStudio.prossimoNumeroFattura || 1;
    var annoFatture = impostazioniStudio.annoFatture || new Date().getFullYear();
    var sezionale = impostazioniStudio.sezionale ? impostazioniStudio.sezionale + '/' : '';
    var numeroFattura = sezionale + prossimoNumero + '/' + annoFatture;
    
    var html = '<div style="padding:12px;background:#eff6ff;border-radius:8px;border:1px solid #bfdbfe;">' +
        '<p style="font-size:12px;color:#1e40af;margin-bottom:8px;"><strong>Fattura Proforma N° ' + numeroFattura + '</strong></p>' +
        '<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;"><span>Imponibile:</span><span>' + formatoEuro(imponibile) + '</span></div>' +
        '<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;"><span>IVA 22%:</span><span>' + formatoEuro(iva) + '</span></div>';
    
    if (esente > 0) {
        html += '<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;"><span>Esente IVA:</span><span>' + formatoEuro(esente) + '</span></div>';
    }
    
    html += '<div style="display:flex;justify-content:space-between;font-size:16px;font-weight:700;margin-top:8px;padding-top:8px;border-top:2px solid #1e40af;color:#1e40af;"><span>TOTALE:</span><span>' + formatoEuro(totale) + '</span></div></div>';
    
    document.getElementById('fattura-totale-calc').innerHTML = html;
    document.getElementById('fattura-anteprima').innerHTML = '';
}

function aggiornaStoricoFatture(clienteId) {
    var fatture = fattureEmesse.filter(function(f) { return f.clienteId === clienteId; });
    
    if (fatture.length === 0) {
        document.getElementById('fatture-storico-list').innerHTML = '<p style="color:#64748b;font-size:13px;">Nessuna fattura proforma emessa</p>';
        return;
    }
    
    fatture.sort(function(a, b) { return new Date(b.data) - new Date(a.data); });
    
    var html = '<table class="fatture-table"><thead><tr><th>N°</th><th>Data</th><th>Periodo</th><th>Totale</th><th></th></tr></thead><tbody>';
    for (var i = 0; i < fatture.length; i++) {
        var f = fatture[i];
        html += '<tr><td>' + f.numero + '</td><td>' + new Date(f.data).toLocaleDateString('it-IT') + '</td><td>' + f.periodo + '</td><td>' + formatoEuro(f.totale) + '</td>' +
            '<td><button class="btn-danger" style="padding:4px 8px;font-size:11px;" onclick="annullaFattura(' + f.id + ')">' + icon('x',13) + ' Annulla</button></td></tr>';
    }
    html += '</tbody></table>';
    
    document.getElementById('fatture-storico-list').innerHTML = html;
}

async function annullaFattura(fatturaId) {
    if (!confirm('Sei sicuro di voler annullare questa fattura proforma?\n\nNota: il file PDF nella cartella dovrà essere eliminato manualmente.')) return;
    
    await dbEliminaFatturaEmessa(fatturaId);
    fattureEmesse = fattureEmesse.filter(function(f) { return f.id !== fatturaId; });
    
    aggiornaStoricoFatture(fatturaClienteId);
    showToast('Fattura proforma annullata!', 'success');
}

async function generaFatturaPDF() {
    var cliente = null;
    for (var i = 0; i < clienti.length; i++) {
        if (clienti[i].id === fatturaClienteId) { cliente = clienti[i]; break; }
    }
    if (!cliente) return;
    
    var meseDa = parseInt(document.getElementById('fattura-mese-da').value);
    var meseA = parseInt(document.getElementById('fattura-mese-a').value);
    var anno = parseInt(document.getElementById('fattura-anno').value);
    if (meseDa > meseA) { var tmp = meseDa; meseDa = meseA; meseA = tmp; }
    
    // Usa importi personalizzati inseriti dall'utente
    var imponibile = parseFloat(document.getElementById('fattura-imponibile').value) || 0;
    var esente = parseFloat(document.getElementById('fattura-esente').value) || 0;
    var iva = imponibile * 0.22;
    var totale = imponibile + iva + esente;
    
    // Descrizione personalizzata
    var descrizione = document.getElementById('fattura-descrizione').value.trim() || 'Competenze professionali';
    
    var mesiNomi = ['', 'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    var periodoLabel = meseDa === meseA ? mesiNomi[meseDa] + ' ' + anno : mesiNomi[meseDa] + ' - ' + mesiNomi[meseA] + ' ' + anno;
    
    var prossimoNumero = impostazioniStudio.prossimoNumeroFattura || 1;
    var annoFatture = impostazioniStudio.annoFatture || anno;
    var sezionale = impostazioniStudio.sezionale ? impostazioniStudio.sezionale + '/' : '';
    var numeroFattura = sezionale + prossimoNumero + '/' + annoFatture;
    
    var studio = impostazioniStudio;
    
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF();
    var pw = doc.internal.pageSize.getWidth();
    var mL = 20, mR = 20;
    
    // Header studio
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pw, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(studio.ragioneSociale || 'Studio', mL, 20);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(studio.indirizzo || '', mL, 28);
    doc.text('P.IVA: ' + (studio.piva || '') + '  |  Tel: ' + (studio.telefono || '') + '  |  Email: ' + (studio.email || ''), mL, 35);
    
    // Numero fattura e data
    doc.setTextColor(0, 0, 0);
    var y = 60;
    
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(mL, y, pw - mL - mR, 25, 3, 3, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('FATTURA PROFORMA N° ' + numeroFattura, mL + 10, y + 10);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Data: ' + new Date().toLocaleDateString('it-IT'), mL + 10, y + 18);
    doc.text('Periodo: ' + periodoLabel, pw - mR - 10, y + 14, { align: 'right' });
    
    y += 35;
    
    // Dati cliente
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENTE:', mL, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(cliente.denominazione, mL, y + 8);
    doc.setFontSize(9);
    if (cliente.indirizzo) doc.text(cliente.indirizzo, mL, y + 15);
    if (cliente.codiceFiscale) doc.text('C.F./P.IVA: ' + cliente.codiceFiscale, mL, y + 22);
    
    y += 35;
    
    // Dettaglio competenze
    doc.setFillColor(241, 245, 249);
    doc.rect(mL, y, pw - mL - mR, 10, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIZIONE', mL + 5, y + 7);
    doc.text('IMPORTO', pw - mR - 5, y + 7, { align: 'right' });
    y += 14;
    
    // Voci - usa descrizione personalizzata
    doc.setFont('helvetica', 'normal');
    doc.text(descrizione, mL + 5, y);
    doc.text(formatoEuro(imponibile + esente), pw - mR - 5, y, { align: 'right' });
    y += 20;
    
    // Totali
    doc.setDrawColor(200, 200, 200);
    doc.line(mL + 80, y, pw - mR, y);
    y += 8;
    
    doc.text('Imponibile', mL + 80, y);
    doc.text(formatoEuro(imponibile), pw - mR - 5, y, { align: 'right' });
    y += 7;
    
    doc.text('IVA 22%', mL + 80, y);
    doc.text(formatoEuro(iva), pw - mR - 5, y, { align: 'right' });
    y += 7;
    
    if (esente > 0) {
        doc.text('Esente IVA', mL + 80, y);
        doc.text(formatoEuro(esente), pw - mR - 5, y, { align: 'right' });
        y += 7;
    }
    
    y += 5;
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(mL + 80, y, pw - mL - mR - 80, 12, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('TOTALE FATTURA', mL + 85, y + 8);
    doc.text(formatoEuro(totale), pw - mR - 10, y + 8, { align: 'right' });
    
    // Dati pagamento
    y += 30;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('MODALITÀ DI PAGAMENTO:', mL, y);
    doc.setFont('helvetica', 'normal');
    doc.text('Bonifico bancario', mL, y + 7);
    doc.text('IBAN: ' + (studio.iban || 'N/D'), mL, y + 14);
    doc.text('Banca: ' + (studio.banca || ''), mL, y + 21);
    
    // Aggiorna prossimo numero (solo temporaneo, confermato al salvataggio)
    var nuovoNumero = prossimoNumero + 1;
    
    chiudiModal('modal-fattura');
    
    // Prepara dati fattura per salvataggio
    var datiNuovaFattura = {
        id: Date.now(),
        clienteId: cliente.id,
        numero: numeroFattura,
        data: new Date().toISOString().substring(0, 10),
        periodo: periodo,
        descrizione: descrizione,
        imponibile: imponibile,
        iva: ivaVal,
        esente: esente,
        totale: totale,
        prossimoNumero: nuovoNumero
    };
    
    // Mostra anteprima invece di salvare direttamente
    var fileName = cliente.denominazione + ' Fattura Proforma ' + numeroFattura.replace(/\//g, '-') + '.pdf';
    var cartella = cliente.denominazione.replace(/[^a-zA-Z0-9 ]/g, '');
    var percorso = 'schede clienti/' + cartella + '/FATTURE PROFORMA/' + fileName;
    
    // Salva dati fattura temporanei per conferma
    anteprimaDatiFattura = datiNuovaFattura;
    
    mostraAnteprimaPDF(doc, fileName, percorso, 'fattura', icon('file-text',14) + ' Anteprima Fattura Proforma');
}

// ==================== RICERCA GLOBALE ====================
function apriRicercaGlobale() {
    document.getElementById('ricerca-globale-overlay').style.display = 'flex';
    document.getElementById('ricerca-globale-input').value = '';
    document.getElementById('ricerca-globale-risultati').innerHTML = '';
    setTimeout(function() {
        document.getElementById('ricerca-globale-input').focus();
    }, 100);
}

function chiudiRicercaGlobale() {
    document.getElementById('ricerca-globale-overlay').style.display = 'none';
}

function eseguiRicercaGlobale() {
    var query = document.getElementById('ricerca-globale-input').value.toLowerCase().trim();
    var risultati = [];
    
    if (query.length < 2) {
        document.getElementById('ricerca-globale-risultati').innerHTML = '<div style="padding:20px;color:#64748b;text-align:center;">Digita almeno 2 caratteri...</div>';
        return;
    }
    
    // Cerca nei clienti
    for (var i = 0; i < clienti.length; i++) {
        var c = clienti[i];
        if (c.denominazione.toLowerCase().includes(query) || 
            (c.codiceFiscale && c.codiceFiscale.toLowerCase().includes(query)) ||
            (c.email && c.email.toLowerCase().includes(query))) {
            risultati.push({
                tipo: 'cliente',
                icon: icon('building-2',20,'color:#64748b'),
                titolo: c.denominazione,
                desc: c.codiceFiscale || c.email || '',
                id: c.id,
                archiviato: c.archiviato
            });
        }
    }
    
    // Cerca nelle fatture
    for (var i = 0; i < fattureEmesse.length; i++) {
        var f = fattureEmesse[i];
        var cliente = clienti.find(function(c) { return c.id === f.clienteId; });
        var nomeCliente = cliente ? cliente.denominazione : 'Cliente eliminato';
        if (f.numero.toLowerCase().includes(query) || nomeCliente.toLowerCase().includes(query)) {
            risultati.push({
                tipo: 'fattura',
                icon: icon('file-text',16,'color:#64748b'),
                titolo: 'Fattura ' + f.numero,
                desc: nomeCliente + ' - ' + formatoEuro(f.totale),
                id: f.clienteId
            });
        }
    }
    
    // Cerca nei movimenti Prima Nota
    for (var i = 0; i < movimentiStudio.length; i++) {
        var m = movimentiStudio[i];
        if ((m.descrizione && m.descrizione.toLowerCase().includes(query)) ||
            (m.fornitore && m.fornitore.toLowerCase().includes(query))) {
            risultati.push({
                tipo: 'movimento',
                icon: m.tipo === 'entrata' ? icon('wallet', 14) : icon('upload', 14),
                titolo: m.descrizione || m.fornitore || 'Movimento',
                desc: formatoEuro(m.importo) + ' - ' + new Date(m.data).toLocaleDateString('it-IT'),
                id: m.id
            });
        }
    }
    
    // Mostra risultati
    if (risultati.length === 0) {
        document.getElementById('ricerca-globale-risultati').innerHTML = '<div style="padding:20px;color:#64748b;text-align:center;">Nessun risultato trovato</div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < Math.min(risultati.length, 10); i++) {
        var r = risultati[i];
        var onclick = '';
        if (r.tipo === 'cliente') onclick = 'chiudiRicercaGlobale(); apriDettaglioCliente(' + r.id + ');';
        else if (r.tipo === 'fattura') onclick = 'chiudiRicercaGlobale(); apriDettaglioCliente(' + r.id + ');';
        else if (r.tipo === 'movimento') onclick = 'chiudiRicercaGlobale(); navigateTo(\'prima-nota-studio\');';
        
        html += '<div class="ricerca-risultato" onclick="' + onclick + '">' +
            '<span class="ricerca-risultato-icon">' + r.icon + '</span>' +
            '<div class="ricerca-risultato-testo">' +
            '<div class="ricerca-risultato-titolo">' + r.titolo + (r.archiviato ? ' <span class="badge-archiviato">ARCHIVIATO</span>' : '') + '</div>' +
            '<div class="ricerca-risultato-desc">' + r.desc + '</div>' +
            '</div>' +
            '<span class="ricerca-risultato-tipo">' + r.tipo + '</span>' +
            '</div>';
    }
    
    if (risultati.length > 10) {
        html += '<div style="padding:12px;text-align:center;color:#64748b;font-size:12px;">...e altri ' + (risultati.length - 10) + ' risultati</div>';
    }
    
    document.getElementById('ricerca-globale-risultati').innerHTML = html;
}

// ==================== TEMA SCURO ====================
// ==================== GESTIONE PASSWORD ====================
function verificaPasswordAvvio() {
    // Se c'è una password impostata, mostra il modal login
    if (impostazioniStudio.passwordHash) {
        document.getElementById('modal-login').style.display = 'flex';
        document.getElementById('login-password').focus();
    }
}

function verificaPassword() {
    var pwd = document.getElementById('login-password').value;
    var hash = hashPassword(pwd);
    
    if (hash === impostazioniStudio.passwordHash) {
        document.getElementById('modal-login').style.display = 'none';
        document.getElementById('login-password').value = '';
        document.getElementById('login-errore').style.display = 'none';
    } else {
        document.getElementById('login-errore').style.display = 'block';
        document.getElementById('login-password').value = '';
        document.getElementById('login-password').focus();
    }
}

function hashPassword(pwd) {
    // Hash semplice (per uso locale, non per sicurezza critica)
    var hash = 0;
    for (var i = 0; i < pwd.length; i++) {
        var char = pwd.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return 'h' + Math.abs(hash).toString(16);
}

function caricaSezionePassword() {
    var container = document.getElementById('sezione-password');
    if (!container) return;
    
    var html = '';
    
    if (impostazioniStudio.passwordHash) {
        // Password già impostata
        html = '<p style="color:#22c55e;margin-bottom:16px;">Password attiva</p>' +
            '<div class="form-group">' +
            '<label>Nuova Password (lascia vuoto per mantenere)</label>' +
            '<input type="password" id="nuova-password" class="form-input" placeholder="Nuova password">' +
            '</div>' +
            '<div class="form-group">' +
            '<label>Conferma Nuova Password</label>' +
            '<input type="password" id="conferma-password" class="form-input" placeholder="Conferma password">' +
            '</div>' +
            '<button class="btn-secondary" onclick="rimuoviPassword()" style="margin-top:8px;">' + icon('trash-2',13) + ' Rimuovi Password</button>';
    } else {
        // Nessuna password
        html = '<p style="color:#64748b;margin-bottom:16px;">Nessuna password impostata. L\'app è accessibile a tutti.</p>' +
            '<div class="form-group">' +
            '<label>Imposta Password</label>' +
            '<input type="password" id="nuova-password" class="form-input" placeholder="Password">' +
            '</div>' +
            '<div class="form-group">' +
            '<label>Conferma Password</label>' +
            '<input type="password" id="conferma-password" class="form-input" placeholder="Conferma password">' +
            '</div>';
    }
    
    container.innerHTML = html;
}

function salvaPassword() {
    var nuova = document.getElementById('nuova-password').value;
    var conferma = document.getElementById('conferma-password').value;
    
    if (!nuova) return true; // Nessuna modifica
    
    if (nuova !== conferma) {
        showToast('Le password non coincidono!', 'error');
        return false;
    }
    
    if (nuova.length < 4) {
        showToast('La password deve essere di almeno 4 caratteri!', 'error');
        return false;
    }
    
    impostazioniStudio.passwordHash = hashPassword(nuova);
    return true;
}

function rimuoviPassword() {
    if (!confirm('Vuoi rimuovere la password?\n\nL\'app sarà accessibile senza autenticazione.')) return;
    
    delete impostazioniStudio.passwordHash;
    caricaSezionePassword();
    showToast('Password rimossa!', 'success');
}

// ==================== GESTIONE PERCORSO DATI ====================
function aggiornaInfoPercorso() {
    var container = document.getElementById('percorso-dati-info');
    if (!container) return;
    
    if (isElectron && window.electronAPI && window.electronAPI.getBasePath) {
        window.electronAPI.getBasePath().then(function(result) {
            if (result.success) {
                container.innerHTML = '<div style="background:#f1f5f9;padding:12px;border-radius:8px;word-break:break-all;">' +
                    '<span style="color:#64748b;font-size:12px;">Percorso attuale:</span><br>' +
                    '<strong style="color:#1e293b;font-size:13px;">' + result.path + '</strong>' +
                    '</div>';
            } else {
                container.innerHTML = '<p style="color:#f59e0b;">️ Impossibile ottenere il percorso</p>';
            }
        });
    } else {
        container.innerHTML = '<p style="color:#64748b;font-size:13px;">ℹ️ Funzione disponibile solo nell\'app desktop Electron.<br>Nel browser i file vengono scaricati nella cartella Download.</p>';
    }
}

function apriCartellaDati() {
    if (isElectron && window.electronAPI && window.electronAPI.openFolder) {
        window.electronAPI.openFolder('').then(function(result) {
            if (!result.success) {
                showToast('Impossibile aprire la cartella:\n' + (result.error || 'Errore sconosciuto'));
            }
        });
    } else {
        showToast('Funzione disponibile solo nell\'app desktop Electron.');
    }
}

function cambiaPercorsoDati() {
    if (isElectron && window.electronAPI && window.electronAPI.changeBasePath) {
        window.electronAPI.changeBasePath().then(function(result) {
            if (result.success) {
                aggiornaInfoPercorso();
                showToast('Percorso aggiornato!\n\nNuovo percorso:\n' + result.path + '\n\nLe cartelle "schede clienti" e "backup" sono state create automaticamente.');
            } else if (!result.canceled) {
                showToast('Errore nel cambio percorso:\n' + (result.error || 'Errore sconosciuto'));
            }
        });
    } else {
        showToast('Funzione disponibile solo nell\'app desktop Electron.');
    }
}

// ==================== BACKUP & RIPRISTINO ====================
function eseguiBackup() {
    var dataOra = new Date();
    var timestamp = dataOra.toISOString().replace(/[:.]/g, '-').substring(0, 19);
    var dataLeggibile = dataOra.toLocaleDateString('it-IT') + ' ' + dataOra.toLocaleTimeString('it-IT');
    
    var backup = {
        versione: '2.1',
        dataBackup: dataOra.toISOString(),
        dataLeggibile: dataLeggibile,
        dati: {
            clienti: clienti,
            pagamenti: pagamenti,
            praticheClienti: praticheClienti,
            tariffariBase: tariffariBase,
            movimentiStudio: movimentiStudio,
            bancheStudio: bancheStudio,
            macrogruppiUscite: macrogruppiUscite,
            macrogruppiEntrate: macrogruppiEntrate,
            fattureEmesse: fattureEmesse,
            contabilizzazioni: contabilizzazioni,
            impostazioniStudio: impostazioniStudio
        },
        statistiche: {
            numClienti: clienti.length,
            numPagamenti: pagamenti.length,
            numMovimenti: movimentiStudio.length,
            numFatture: fattureEmesse.length,
            numTariffari: tariffariBase.length
        }
    };
    
    var json = JSON.stringify(backup, null, 2);
    var nomeFile = 'Backup_' + timestamp + '.json';
    
    if (isElectron && window.electronAPI) {
        // Salva in WOLWARE/backup/
        try {
            var base64 = btoa(unescape(encodeURIComponent(json)));
            var percorso = 'backup/' + nomeFile;
            window.electronAPI.saveFile(percorso, base64, 'base64').then(function(result) {
                if (result.success) {
                    // Salva data ultimo backup
                    impostazioniStudio.ultimoBackup = dataOra.toISOString();
                    aggiornaInfoBackup();
                    showToast('Backup completato!\n\nFile salvato in:\nWOLWARE/' + percorso + '\n\nContenuto:\n• ' + clienti.length + ' clienti\n• ' + pagamenti.length + ' pagamenti\n• ' + movimentiStudio.length + ' movimenti\n• ' + fattureEmesse.length + ' fatture');
                } else {
                    // Fallback download
                    downloadBackup(json, nomeFile);
                }
            });
        } catch (e) {
            downloadBackup(json, nomeFile);
        }
    } else {
        downloadBackup(json, nomeFile);
    }
}

function downloadBackup(json, nomeFile) {
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = nomeFile;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Salva data ultimo backup
    impostazioniStudio.ultimoBackup = new Date().toISOString();
    aggiornaInfoBackup();
    
    showToast('Backup scaricato!\n\nConserva il file in un posto sicuro.\n\nContenuto:\n• ' + clienti.length + ' clienti\n• ' + pagamenti.length + ' pagamenti\n• ' + movimentiStudio.length + ' movimenti\n• ' + fattureEmesse.length + ' fatture');
}

function aggiornaInfoBackup() {
    var container = document.getElementById('backup-ultimo-info');
    if (!container) return;
    
    if (impostazioniStudio.ultimoBackup) {
        var data = new Date(impostazioniStudio.ultimoBackup);
        container.innerHTML = '<p style="color:#22c55e;font-size:13px;">Ultimo backup: <strong>' + 
            data.toLocaleDateString('it-IT') + '</strong> alle <strong>' + 
            data.toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'}) + '</strong></p>';
    } else {
        container.innerHTML = '<p style="color:#f59e0b;font-size:13px;">️ Nessun backup effettuato</p>';
    }
}

function apriRipristino() {
    document.getElementById('backup-file-input').click();
}

function caricaFileBackup(event) {
    var file = event.target.files[0];
    if (!file) return;
    
    var reader = new FileReader();
    reader.onload = function(e) {
        try {
            var backup = JSON.parse(e.target.result);
            
            // Verifica struttura backup
            if (!backup.dati || !backup.versione) {
                showToast('File non valido!\n\nIl file selezionato non è un backup valido.');
                return;
            }
            
            // Mostra anteprima
            var stats = backup.statistiche || {};
            var dataBackup = backup.dataLeggibile || 'Data sconosciuta';
            
            var msg = 'ANTEPRIMA BACKUP\n\n' +
                'Data: ' + dataBackup + '\n' +
                'Versione: ' + backup.versione + '\n\n' +
                'Contenuto:\n' +
                '• ' + (stats.numClienti || backup.dati.clienti?.length || 0) + ' clienti\n' +
                '• ' + (stats.numPagamenti || backup.dati.pagamenti?.length || 0) + ' pagamenti\n' +
                '• ' + (stats.numMovimenti || backup.dati.movimentiStudio?.length || 0) + ' movimenti\n' +
                '• ' + (stats.numFatture || backup.dati.fattureEmesse?.length || 0) + ' fatture\n' +
                '• ' + (stats.numTariffari || backup.dati.tariffariBase?.length || 0) + ' tariffari\n\n' +
                '️ ATTENZIONE: Questa operazione SOVRASCRIVERÀ tutti i dati attuali!\n\n' +
                'Vuoi procedere con il ripristino?';
            
            if (confirm(msg)) {
                eseguiRipristino(backup);
            }
        } catch (err) {
            showToast('Errore lettura file!\n\n' + err.message);
        }
    };
    reader.readAsText(file);
    
    // Reset input per permettere di ricaricare lo stesso file
    event.target.value = '';
}

async function eseguiRipristino(backup) {
    try {
        var dati = backup.dati;
        
        if (!confirm('️ ATTENZIONE!\n\nIl ripristino sovrascriverà TUTTI i dati attuali su Supabase.\n\nSei sicuro di voler procedere?')) {
            return;
        }
        
        // Mostra loading
        document.getElementById('loading-screen').style.display = 'flex';
        document.getElementById('loading-text').textContent = 'Ripristino in corso...';
        
        // Ripristina tutti i dati in memoria
        if (dati.clienti) clienti = dati.clienti;
        if (dati.pagamenti) pagamenti = dati.pagamenti;
        if (dati.praticheClienti) praticheClienti = dati.praticheClienti;
        if (dati.tariffariBase) tariffariBase = dati.tariffariBase;
        if (dati.movimentiStudio) movimentiStudio = dati.movimentiStudio;
        if (dati.bancheStudio) bancheStudio = dati.bancheStudio;
        if (dati.macrogruppiUscite) macrogruppiUscite = dati.macrogruppiUscite;
        if (dati.macrogruppiEntrate) macrogruppiEntrate = dati.macrogruppiEntrate;
        if (dati.fattureEmesse) fattureEmesse = dati.fattureEmesse;
        if (dati.contabilizzazioni) contabilizzazioni = dati.contabilizzazioni;
        if (dati.abbuoniClienti) abbuoniClienti = dati.abbuoniClienti;
        if (dati.movimentiFatturati) movimentiFatturati = dati.movimentiFatturati;
        if (dati.ultimiEstrattiConto) ultimiEstrattiConto = dati.ultimiEstrattiConto;
        
        if (dati.impostazioniStudio) {
            var passwordCorrente = impostazioniStudio.passwordHash;
            impostazioniStudio = dati.impostazioniStudio;
            if (passwordCorrente) {
                impostazioniStudio.passwordHash = passwordCorrente;
            }
        }
        
        // Salva tutto su Supabase
        for (var i = 0; i < clienti.length; i++) {
            await dbSalvaCliente(clienti[i]);
        }
        for (var i = 0; i < pagamenti.length; i++) {
            await dbSalvaPagamento(pagamenti[i]);
        }
        for (var i = 0; i < movimentiStudio.length; i++) {
            await dbSalvaMovimentoStudio(movimentiStudio[i]);
        }
        for (var i = 0; i < tariffariBase.length; i++) {
            await dbSalvaTariffarioBase(tariffariBase[i]);
        }
        for (var i = 0; i < bancheStudio.length; i++) {
            await dbSalvaBancaStudio(bancheStudio[i]);
        }
        for (var i = 0; i < macrogruppiEntrate.length; i++) {
            await dbSalvaMacrogruppoEntrate(macrogruppiEntrate[i]);
        }
        for (var i = 0; i < macrogruppiUscite.length; i++) {
            await dbSalvaMacrogruppoUscite(macrogruppiUscite[i]);
        }
        for (var i = 0; i < fattureEmesse.length; i++) {
            await dbSalvaFatturaEmessa(fattureEmesse[i]);
        }
        for (var clienteId in praticheClienti) {
            for (var chiave in praticheClienti[clienteId]) {
                await dbSalvaPraticaCliente(parseInt(clienteId), chiave, praticheClienti[clienteId][chiave]);
            }
        }
        for (var clienteId in abbuoniClienti) {
            var arr = abbuoniClienti[clienteId];
            for (var i = 0; i < arr.length; i++) {
                await dbSalvaArrotondamento(parseInt(clienteId), arr[i]);
            }
        }
        await dbSalvaContabilizzazioni(contabilizzazioni);
        await dbSalvaMovimentiFatturati(movimentiFatturati);
        await dbSalvaImpostazioniStudio(impostazioniStudio);
        
        document.getElementById('loading-screen').style.display = 'none';
        
        showToast('Ripristino completato!\n\nTutti i dati sono stati ripristinati e salvati su Supabase.\n\nLa pagina verrà ricaricata.');
        
        location.reload();
        
    } catch (err) {
        document.getElementById('loading-screen').style.display = 'none';
        showToast('Errore durante il ripristino!\n\n' + err.message);
    }
}

// ==================== ARCHIVIAZIONE CLIENTI ====================
async function archiviaCliente(clienteId) {
    var cliente = clienti.find(function(c) { return c.id === clienteId; });
    if (!cliente) return;
    
    if (!confirm('Vuoi archiviare il cliente "' + cliente.denominazione + '"?\n\nIl cliente non apparirà più nella lista principale ma resterà accessibile tramite il filtro "Mostra archiviati".')) return;
    
    cliente.archiviato = true;
    await dbSalvaCliente(cliente);
    
    chiudiModal('modal-dettaglio-cliente');
    caricaClienti();
    showToast('Cliente archiviato!', 'success');
}

async function ripristinaCliente(clienteId) {
    var cliente = clienti.find(function(c) { return c.id === clienteId; });
    if (!cliente) return;
    
    cliente.archiviato = false;
    await dbSalvaCliente(cliente);
    
    chiudiModal('modal-dettaglio-cliente');
    caricaClienti();
    showToast('Cliente ripristinato!', 'success');
}

// ==================== ANTEPRIMA PDF ====================
function mostraAnteprimaPDF(doc, nomeFile, percorso, tipo, titolo, clienteId) {
    // Salva riferimenti
    anteprimaPdfDoc = doc;
    anteprimaPdfNomeFile = nomeFile;
    anteprimaPdfPercorso = percorso;
    anteprimaPdfTipo = tipo;
    anteprimaPdfClienteId = clienteId || null;
    
    // Imposta titolo
    document.getElementById('anteprima-pdf-titolo').textContent = titolo;
    
    // Genera URL del PDF per anteprima
    var pdfDataUri = doc.output('datauristring');
    
    // Mostra nell'iframe
    var iframe = document.getElementById('anteprima-pdf-iframe');
    iframe.src = pdfDataUri;
    
    // Mostra modal
    document.getElementById('modal-anteprima-pdf').style.display = 'flex';
}

function chiudiAnteprimaPDF() {
    document.getElementById('modal-anteprima-pdf').style.display = 'none';
    
    // Pulisci iframe
    document.getElementById('anteprima-pdf-iframe').src = '';
    
    // Reset variabili
    anteprimaPdfDoc = null;
    anteprimaPdfNomeFile = '';
    anteprimaPdfPercorso = '';
    anteprimaPdfTipo = '';
    anteprimaDatiFattura = null;
    anteprimaPdfClienteId = null;
}

async function salvaAnteprimaPDF() {
    if (!anteprimaPdfDoc) {
        showToast('Errore: nessun PDF da salvare', 'error');
        return;
    }
    
    var doc = anteprimaPdfDoc;
    var fileName = anteprimaPdfNomeFile;
    var percorso = anteprimaPdfPercorso;
    var tipo = anteprimaPdfTipo;
    
    // Se è un estratto conto (completo o sintetico), salva la data
    if ((tipo === 'estratto' || tipo === 'sintetico') && anteprimaPdfClienteId) {
        var oggi = new Date().toISOString().split('T')[0];
        ultimiEstrattiConto[anteprimaPdfClienteId] = oggi;
        await dbSalvaUltimoEstrattoConto(anteprimaPdfClienteId, oggi);
    }
    
    // Se è una fattura, salva anche i dati della fattura
    if (tipo === 'fattura' && anteprimaDatiFattura) {
        var fattura = {
            id: anteprimaDatiFattura.id,
            clienteId: anteprimaDatiFattura.clienteId,
            numero: anteprimaDatiFattura.numero,
            data: anteprimaDatiFattura.data,
            periodo: anteprimaDatiFattura.periodo,
            descrizione: anteprimaDatiFattura.descrizione,
            imponibile: anteprimaDatiFattura.imponibile,
            iva: anteprimaDatiFattura.iva,
            esente: anteprimaDatiFattura.esente,
            totale: anteprimaDatiFattura.totale
        };
        var result = await dbSalvaFatturaEmessa(fattura);
        if (result) {
            fattura.id = result.id;
            fattureEmesse.push(fattura);
        }
        
        // Aggiorna prossimo numero fattura
        impostazioniStudio.prossimoNumeroFattura = anteprimaDatiFattura.prossimoNumero;
        await dbSalvaImpostazioniStudio(impostazioniStudio);
    }
    
    // Se è una fatturazione incassi, marca i movimenti come fatturati
    if (tipo === 'fatturazione' && anteprimaIncassiFatturazione.length > 0) {
        for (var i = 0; i < anteprimaIncassiFatturazione.length; i++) {
            if (movimentiFatturati.indexOf(anteprimaIncassiFatturazione[i]) === -1) {
                movimentiFatturati.push(anteprimaIncassiFatturazione[i]);
            }
        }
        await dbSalvaMovimentiFatturati(movimentiFatturati);
        aggiornaMovimentiStudio();
    }
    
    // Salva il PDF
    if (isElectron && window.electronAPI) {
        try {
            var pdfBase64 = doc.output('datauristring').split(',')[1];
            var result = await window.electronAPI.saveFile(percorso, pdfBase64, 'base64');
            
            if (result.success) {
                chiudiAnteprimaPDF();
                
                // Messaggio specifico per tipo
                if (tipo === 'fattura' && anteprimaDatiFattura) {
                    showToast('Fattura Proforma salvata!\n\nN° ' + anteprimaDatiFattura.numero + '\nTotale: ' + formatoEuro(anteprimaDatiFattura.totale) + '\n\nWOLWARE/' + percorso);
                } else {
                    showToast('PDF salvato!\n\nWOLWARE/' + percorso);
                }
            } else {
                // Fallback: download diretto
                doc.save(fileName);
                chiudiAnteprimaPDF();
                showToast('PDF scaricato!', 'success');
            }
        } catch (e) {
            doc.save(fileName);
            chiudiAnteprimaPDF();
            showToast('PDF scaricato!', 'success');
        }
    } else {
        // Browser: download diretto
        doc.save(fileName);
        chiudiAnteprimaPDF();
        showToast('PDF scaricato!', 'success');
    }
}

// ==================== VALIDAZIONE P.IVA / CF ====================
function validaCodiceFiscale(cf) {
    if (!cf) return true; // Campo opzionale
    cf = cf.toUpperCase().trim();
    // P.IVA: 11 cifre
    if (/^\d{11}$/.test(cf)) return true;
    // CF persona fisica: 16 caratteri alfanumerici
    if (/^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/.test(cf)) return true;
    // CF persona giuridica: 11 cifre (come P.IVA)
    return false;
}

// ==================== TASTI RAPIDI ====================
document.addEventListener('keydown', function(e) {
    // ESC - Chiudi modal o ricerca
    if (e.key === 'Escape') {
        var ricerca = document.getElementById('ricerca-globale-overlay');
        if (ricerca && ricerca.style.display !== 'none') {
            chiudiRicercaGlobale();
            return;
        }
        // Chiudi modal aperti
        var modals = document.querySelectorAll('.modal-overlay.show');
        if (modals.length > 0) {
            var ultimoModal = modals[modals.length - 1];
            if (modalConModifiche) {
                if (confirm('Ci sono modifiche non salvate. Vuoi chiudere comunque?')) {
                    ultimoModal.classList.remove('show');
                    modalConModifiche = false;
                }
            } else {
                ultimoModal.classList.remove('show');
            }
        }
    }
    
    // Ctrl+F - Ricerca globale
    if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        apriRicercaGlobale();
    }
    
    // Ctrl+N - Nuovo cliente
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        apriModalNuovoCliente();
    }
});

// Click fuori dalla ricerca globale per chiudere
document.addEventListener('click', function(e) {
    var overlay = document.getElementById('ricerca-globale-overlay');
    if (overlay && overlay.style.display !== 'none' && e.target === overlay) {
        chiudiRicercaGlobale();
    }
});

// ==================== CONFERMA CHIUSURA MODAL ====================
function marcaModificheModal() {
    modalConModifiche = true;
}

// Aggiorna init per caricare clienti e verifica password
document.addEventListener('DOMContentLoaded', async function() {
    // Prima controlla se l'utente è già loggato
    var isLoggedIn = await checkSessioneIniziale();
    
    if (!isLoggedIn) {
        // Non loggato: mostra schermata login (già visibile)
        return;
    }
    
    // Utente loggato: carica i dati
    await caricaDatiApp();
});

async function caricaDatiApp() {
    // Mostra loading overlay
    var loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading-overlay';
    loadingDiv.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;background:#f8fafc;position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;"><div style="font-size:48px;margin-bottom:20px;">⏳</div><h2 style="color:#1e293b;margin:0;">Caricamento dati...</h2><p style="color:#64748b;margin-top:8px;">Connessione al database in corso</p></div>';
    document.body.appendChild(loadingDiv);
    
    try {
        // Carica tutti i dati da Supabase
        var dati = await dbCaricaTutto();
        
        // Assegna alle variabili globali
        clienti = dati.clienti || [];
        pagamenti = dati.pagamenti || [];
        movimentiStudio = dati.movimentiStudio || [];
        tariffariBase = dati.tariffariBase || [];
        praticheClienti = dati.praticheClienti || {};
        bancheStudio = dati.bancheStudio || [];
        macrogruppiEntrate = dati.macrogruppiEntrate || [];
        macrogruppiUscite = dati.macrogruppiUscite || [];
        impostazioniStudio = dati.impostazioniStudio || {};
        fattureEmesse = dati.fattureEmesse || [];
        movimentiFatturati = dati.movimentiFatturati || [];
        abbuoniClienti = dati.abbuoniClienti || {};
        ultimiEstrattiConto = dati.ultimiEstrattiConto || {};
        
        datiCaricati = true;
        console.log('Dati caricati dal DB locale:', { clienti: clienti.length, pagamenti: pagamenti.length });
        
        // Rimuovi loading overlay
        document.body.removeChild(loadingDiv);
        
        setTimeout(function() {
            caricaClienti();
            if (typeof inizializzaPrimaNotaStudio === 'function') inizializzaPrimaNotaStudio();
            if (typeof inizializzaRendiconto === 'function') inizializzaRendiconto();
            if (typeof caricaTariffariBase === 'function') caricaTariffariBase();
            if (typeof caricaSezioneImpostazioni === 'function') caricaSezioneImpostazioni();
        }, 100);
        
    } catch (error) {
        console.error('Errore caricamento dati:', error);
        loadingDiv.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;background:#f8fafc;position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;"><div style="font-size:48px;margin-bottom:20px;"></div><h2 style="color:#dc2626;margin:0;">Errore di connessione</h2><p style="color:#64748b;margin-top:8px;">Impossibile connettersi al database</p><button onclick="location.reload()" style="margin-top:20px;padding:12px 24px;background:#3b82f6;color:white;border:none;border-radius:8px;cursor:pointer;font-size:16px;">' + icon('refresh-cw', 13) + ' Riprova</button></div>';
    }
}

// ==================== IMPORT CLIENTI DA EXCEL ====================
var clientiDaImportare = [];

function apriImportClienti() {
    // Reset
    document.getElementById('file-import-clienti').value = '';
    document.getElementById('anteprima-import').innerHTML = '';
    document.getElementById('btn-esegui-import').disabled = true;
    clientiDaImportare = [];
    
    // Popola select tariffari
    var select = document.getElementById('import-tariffario');
    var html = '<option value="">-- Nessun tariffario (da assegnare dopo) --</option>';
    for (var i = 0; i < tariffariBase.length; i++) {
        html += '<option value="' + tariffariBase[i].id + '">' + tariffariBase[i].nome + '</option>';
    }
    select.innerHTML = html;
    
    apriModal('modal-import-clienti');
}

function scaricaTemplateClienti() {
    // Crea template Excel dinamicamente
    var wb = XLSX.utils.book_new();
    
    // Header
    var headers = [
        'denominazione', 'codice_fiscale', 'email', 'telefono', 'indirizzo',
        'residuo_iniziale', 'cadenza_pagamenti', 'inizio_paghe', 'fine_paghe',
        'inizio_contabilita', 'fine_contabilita', 'annotazioni'
    ];
    
    // Riga esempio
    var esempio = [
        'Rossi Mario SRL', '01234567890', 'info@rossimario.it', '02 12345678',
        'Via Roma 1, 20100 Milano (MI)', '0', 'mensile', '2024-01-01', '', '', '', 'Cliente storico'
    ];
    
    var data = [headers, esempio];
    var ws = XLSX.utils.aoa_to_sheet(data);
    
    // Larghezza colonne
    ws['!cols'] = [
        {wch: 35}, {wch: 18}, {wch: 28}, {wch: 16}, {wch: 40},
        {wch: 15}, {wch: 18}, {wch: 15}, {wch: 15}, {wch: 18}, {wch: 18}, {wch: 35}
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Clienti');
    XLSX.writeFile(wb, 'template_import_clienti.xlsx');
}

function anteprimaImportClienti() {
    var fileInput = document.getElementById('file-import-clienti');
    var anteprima = document.getElementById('anteprima-import');
    var btnImport = document.getElementById('btn-esegui-import');
    
    if (!fileInput.files || !fileInput.files[0]) {
        anteprima.innerHTML = '';
        btnImport.disabled = true;
        return;
    }
    
    var file = fileInput.files[0];
    var reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            var data = new Uint8Array(e.target.result);
            var workbook = XLSX.read(data, { type: 'array' });
            var sheetName = workbook.SheetNames[0];
            var sheet = workbook.Sheets[sheetName];
            var json = XLSX.utils.sheet_to_json(sheet);
            
            if (json.length === 0) {
                anteprima.innerHTML = '<p style="color:#dc2626;">️ Il file è vuoto o non ha il formato corretto</p>';
                btnImport.disabled = true;
                return;
            }
            
            // Valida e prepara clienti
            clientiDaImportare = [];
            var errori = [];
            
            for (var i = 0; i < json.length; i++) {
                var row = json[i];
                var denominazione = (row.denominazione || row['Nome/Ragione Sociale *'] || '').toString().trim();
                
                if (!denominazione) {
                    errori.push('Riga ' + (i + 2) + ': denominazione mancante');
                    continue;
                }
                
                // Verifica se esiste già
                var esiste = false;
                for (var c = 0; c < clienti.length; c++) {
                    if (clienti[c].denominazione.toLowerCase() === denominazione.toLowerCase()) {
                        esiste = true;
                        errori.push('Riga ' + (i + 2) + ': "' + denominazione + '" esiste già');
                        break;
                    }
                }
                if (esiste) continue;
                
                clientiDaImportare.push({
                    denominazione: denominazione,
                    codiceFiscale: (row.codice_fiscale || row['Codice Fiscale / P.IVA'] || '').toString().trim(),
                    email: (row.email || row['Email'] || '').toString().trim(),
                    telefono: (row.telefono || row['Telefono'] || '').toString().trim(),
                    indirizzo: (row.indirizzo || row['Indirizzo'] || '').toString().trim(),
                    residuoIniziale: parseFloat(row.residuo_iniziale || row['Residuo Iniziale (€)'] || 0) || 0,
                    cadenzaPagamenti: (row.cadenza_pagamenti || row['Cadenza Pagamenti'] || 'mensile').toString().trim().toLowerCase(),
                    inizioPaghe: formatDataImport(row.inizio_paghe || row['Inizio Paghe (YYYY-MM-DD)']),
                    finePaghe: formatDataImport(row.fine_paghe || row['Fine Paghe (YYYY-MM-DD)']),
                    inizioContabilita: formatDataImport(row.inizio_contabilita || row['Inizio Contabilità (YYYY-MM-DD)']),
                    fineContabilita: formatDataImport(row.fine_contabilita || row['Fine Contabilità (YYYY-MM-DD)']),
                    annotazioni: (row.annotazioni || row['Note'] || '').toString().trim()
                });
            }
            
            // Mostra anteprima
            var html = '<div style="background:#f8fafc;border-radius:8px;padding:16px;">';
            html += '<p style="margin:0 0 10px 0;"><strong>' + clientiDaImportare.length + ' clienti pronti per l\'import</strong></p>';
            
            if (errori.length > 0) {
                html += '<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:10px;margin-bottom:10px;">';
                html += '<p style="margin:0 0 5px 0;color:#dc2626;font-weight:bold;">️ ' + errori.length + ' righe ignorate:</p>';
                html += '<ul style="margin:0;padding-left:20px;color:#991b1b;font-size:12px;">';
                for (var e = 0; e < Math.min(errori.length, 5); e++) {
                    html += '<li>' + errori[e] + '</li>';
                }
                if (errori.length > 5) html += '<li>...e altri ' + (errori.length - 5) + '</li>';
                html += '</ul></div>';
            }
            
            if (clientiDaImportare.length > 0) {
                html += '<table style="width:100%;font-size:12px;border-collapse:collapse;">';
                html += '<thead><tr style="background:#e2e8f0;"><th style="padding:6px;text-align:left;">Denominazione</th><th style="padding:6px;text-align:left;">CF/P.IVA</th><th style="padding:6px;text-align:left;">Email</th></tr></thead><tbody>';
                for (var j = 0; j < Math.min(clientiDaImportare.length, 10); j++) {
                    var cl = clientiDaImportare[j];
                    html += '<tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:6px;">' + cl.denominazione + '</td><td style="padding:6px;">' + (cl.codiceFiscale || '-') + '</td><td style="padding:6px;">' + (cl.email || '-') + '</td></tr>';
                }
                if (clientiDaImportare.length > 10) {
                    html += '<tr><td colspan="3" style="padding:6px;color:#64748b;text-align:center;">...e altri ' + (clientiDaImportare.length - 10) + ' clienti</td></tr>';
                }
                html += '</tbody></table>';
            }
            html += '</div>';
            
            anteprima.innerHTML = html;
            btnImport.disabled = clientiDaImportare.length === 0;
            
        } catch (err) {
            console.error('Errore lettura file:', err);
            anteprima.innerHTML = '<p style="color:#dc2626;">️ Errore nella lettura del file: ' + err.message + '</p>';
            btnImport.disabled = true;
        }
    };
    
    reader.readAsArrayBuffer(file);
}

function formatDataImport(val) {
    if (!val) return null;
    var str = val.toString().trim();
    if (!str) return null;
    // Se è un numero (Excel date serial)
    if (!isNaN(str)) {
        var date = XLSX.SSF.parse_date_code(parseFloat(str));
        if (date) {
            return date.y + '-' + String(date.m).padStart(2, '0') + '-' + String(date.d).padStart(2, '0');
        }
    }
    // Altrimenti restituisci come stringa
    return str;
}

async function eseguiImportClienti() {
    if (clientiDaImportare.length === 0) return;
    
    var tariffarioId = document.getElementById('import-tariffario').value;
    var tariffario = null;
    var tariffarioNome = null;
    var vociTariffario = [];
    
    if (tariffarioId) {
        for (var t = 0; t < tariffariBase.length; t++) {
            if (tariffariBase[t].id === parseInt(tariffarioId)) {
                tariffario = tariffariBase[t];
                tariffarioNome = tariffario.nome;
                vociTariffario = copiaVociTariffarioBase(tariffarioId);
                break;
            }
        }
    }
    
    var btn = document.getElementById('btn-esegui-import');
    btn.disabled = true;
    btn.textContent = 'Importazione in corso...';
    
    var importati = 0;
    var errori = 0;
    
    for (var i = 0; i < clientiDaImportare.length; i++) {
        var c = clientiDaImportare[i];
        
        var nuovoCliente = {
            denominazione: c.denominazione,
            codiceFiscale: c.codiceFiscale,
            email: c.email,
            telefono: c.telefono,
            indirizzo: c.indirizzo,
            tariffario: vociTariffario,
            tariffarioBaseId: tariffarioId ? parseInt(tariffarioId) : null,
            tariffarioNome: tariffarioNome,
            cadenzaPagamenti: c.cadenzaPagamenti || 'mensile',
            residuoIniziale: c.residuoIniziale || 0,
            inizioPaghe: c.inizioPaghe,
            finePaghe: c.finePaghe,
            inizioContabilita: c.inizioContabilita,
            fineContabilita: c.fineContabilita,
            annotazioni: c.annotazioni,
            archiviato: false,
            storicoTariffari: tariffarioNome ? [{ data: new Date().toISOString(), da: null, a: tariffarioNome }] : []
        };
        
        try {
            var saved = await dbSalvaCliente(nuovoCliente);
            if (saved) {
                nuovoCliente.id = saved.id;
                clienti.push(nuovoCliente);
                importati++;
            } else {
                errori++;
            }
        } catch (err) {
            console.error('Errore import cliente:', c.denominazione, err);
            errori++;
        }
        
        // Aggiorna progresso
        btn.textContent = 'Importazione... ' + (i + 1) + '/' + clientiDaImportare.length;
    }
    
    chiudiModal('modal-import-clienti');
    caricaClienti();
    
    showToast('Importazione completata!\n\n' + importati + ' clienti importati' + (errori > 0 ? '\n' + errori + ' errori' : ''));
}

// ── Registra tutte le funzioni reali (sovrascrive gli stub del guard) ──────
if (typeof window._registerAppFunctions === "function") {
    window._registerAppFunctions({
        aggiornaAnteprimaCostiFissi: typeof aggiornaAnteprimaCostiFissi !== "undefined" ? aggiornaAnteprimaCostiFissi : undefined,
        aggiornaAnteprimaCostiMassivi: typeof aggiornaAnteprimaCostiMassivi !== "undefined" ? aggiornaAnteprimaCostiMassivi : undefined,
        aggiornaAnteprimaFattura: typeof aggiornaAnteprimaFattura !== "undefined" ? aggiornaAnteprimaFattura : undefined,
        aggiornaDettaglioCliente: typeof aggiornaDettaglioCliente !== "undefined" ? aggiornaDettaglioCliente : undefined,
        aggiornaFormMovimento: typeof aggiornaFormMovimento !== "undefined" ? aggiornaFormMovimento : undefined,
        aggiornaInfoBackup: typeof aggiornaInfoBackup !== "undefined" ? aggiornaInfoBackup : undefined,
        aggiornaInfoPercorso: typeof aggiornaInfoPercorso !== "undefined" ? aggiornaInfoPercorso : undefined,
        aggiornaMovimentiStudio: typeof aggiornaMovimentiStudio !== "undefined" ? aggiornaMovimentiStudio : undefined,
        aggiornaPdfOpt: typeof aggiornaPdfOpt !== "undefined" ? aggiornaPdfOpt : undefined,
        aggiornaPrevOpt: typeof aggiornaPrevOpt !== "undefined" ? aggiornaPrevOpt : undefined,
        aggiornaPreviewAbbuono: typeof aggiornaPreviewAbbuono !== "undefined" ? aggiornaPreviewAbbuono : undefined,
        aggiornaRendiconto: typeof aggiornaRendiconto !== "undefined" ? aggiornaRendiconto : undefined,
        aggiornaSaldi: typeof aggiornaSaldi !== "undefined" ? aggiornaSaldi : undefined,
        aggiornaScadenzario: typeof aggiornaScadenzario !== "undefined" ? aggiornaScadenzario : undefined,
        aggiornaSelezioneClientiMassivi: typeof aggiornaSelezioneClientiMassivi !== "undefined" ? aggiornaSelezioneClientiMassivi : undefined,
        aggiornaSottovoci: typeof aggiornaSottovoci !== "undefined" ? aggiornaSottovoci : undefined,
        aggiornaStoricoFatture: typeof aggiornaStoricoFatture !== "undefined" ? aggiornaStoricoFatture : undefined,
        aggiornaTotaleFatturazione: typeof aggiornaTotaleFatturazione !== "undefined" ? aggiornaTotaleFatturazione : undefined,
        aggiungiBanca: typeof aggiungiBanca !== "undefined" ? aggiungiBanca : undefined,
        aggiungiMacrogruppoEntrate: typeof aggiungiMacrogruppoEntrate !== "undefined" ? aggiungiMacrogruppoEntrate : undefined,
        aggiungiMacrogruppoUscite: typeof aggiungiMacrogruppoUscite !== "undefined" ? aggiungiMacrogruppoUscite : undefined,
        aggiungiRichiesta: typeof aggiungiRichiesta !== "undefined" ? aggiungiRichiesta : undefined,
        aggiungiSvEntrate: typeof aggiungiSvEntrate !== "undefined" ? aggiungiSvEntrate : undefined,
        aggiungiSvUscite: typeof aggiungiSvUscite !== "undefined" ? aggiungiSvUscite : undefined,
        aggiungiVoceModal: typeof aggiungiVoceModal !== "undefined" ? aggiungiVoceModal : undefined,
        annullaFattura: typeof annullaFattura !== "undefined" ? annullaFattura : undefined,
        anteprimaImportClienti: typeof anteprimaImportClienti !== "undefined" ? anteprimaImportClienti : undefined,
        applicaCostiMassivi: typeof applicaCostiMassivi !== "undefined" ? applicaCostiMassivi : undefined,
        applicaCostiMese: typeof applicaCostiMese !== "undefined" ? applicaCostiMese : undefined,
        apriCartellaDati: typeof apriCartellaDati !== "undefined" ? apriCartellaDati : undefined,
        apriContabilizzaCostiFissi: typeof apriContabilizzaCostiFissi !== "undefined" ? apriContabilizzaCostiFissi : undefined,
        apriCostiMassivi: typeof apriCostiMassivi !== "undefined" ? apriCostiMassivi : undefined,
        apriDettaglioCliente: typeof apriDettaglioCliente !== "undefined" ? apriDettaglioCliente : undefined,
        apriDuplicaTariffario: typeof apriDuplicaTariffario !== "undefined" ? apriDuplicaTariffario : undefined,
        apriGestioneBanche: typeof apriGestioneBanche !== "undefined" ? apriGestioneBanche : undefined,
        apriGestioneEntrate: typeof apriGestioneEntrate !== "undefined" ? apriGestioneEntrate : undefined,
        apriGestioneUscite: typeof apriGestioneUscite !== "undefined" ? apriGestioneUscite : undefined,
        apriGiroconto: typeof apriGiroconto !== "undefined" ? apriGiroconto : undefined,
        apriImportClienti: typeof apriImportClienti !== "undefined" ? apriImportClienti : undefined,
        apriModal: typeof apriModal !== "undefined" ? apriModal : undefined,
        apriModalAbbuono: typeof apriModalAbbuono !== "undefined" ? apriModalAbbuono : undefined,
        apriModalCambiaTariffario: typeof apriModalCambiaTariffario !== "undefined" ? apriModalCambiaTariffario : undefined,
        apriModalFattura: typeof apriModalFattura !== "undefined" ? apriModalFattura : undefined,
        apriModalInserisciPratiche: typeof apriModalInserisciPratiche !== "undefined" ? apriModalInserisciPratiche : undefined,
        apriModalModificaCliente: typeof apriModalModificaCliente !== "undefined" ? apriModalModificaCliente : undefined,
        apriModalModificaDateGestione: typeof apriModalModificaDateGestione !== "undefined" ? apriModalModificaDateGestione : undefined,
        apriModalNuovoCliente: typeof apriModalNuovoCliente !== "undefined" ? apriModalNuovoCliente : undefined,
        apriModalNuovoTariffario: typeof apriModalNuovoTariffario !== "undefined" ? apriModalNuovoTariffario : undefined,
        apriModalPDFCliente: typeof apriModalPDFCliente !== "undefined" ? apriModalPDFCliente : undefined,
        apriModalPrevisionale: typeof apriModalPrevisionale !== "undefined" ? apriModalPrevisionale : undefined,
        apriModificaTariffario: typeof apriModificaTariffario !== "undefined" ? apriModificaTariffario : undefined,
        apriPreparaFatturazione: typeof apriPreparaFatturazione !== "undefined" ? apriPreparaFatturazione : undefined,
        apriRegistraMovimento: typeof apriRegistraMovimento !== "undefined" ? apriRegistraMovimento : undefined,
        apriRicercaGlobale: typeof apriRicercaGlobale !== "undefined" ? apriRicercaGlobale : undefined,
        apriRipristino: typeof apriRipristino !== "undefined" ? apriRipristino : undefined,
        apriSollecito: typeof apriSollecito !== "undefined" ? apriSollecito : undefined,
        apriVariabiliPaghe: typeof apriVariabiliPaghe !== "undefined" ? apriVariabiliPaghe : undefined,
        archiviaCliente: typeof archiviaCliente !== "undefined" ? archiviaCliente : undefined,
        calcolaDataScadenza: typeof calcolaDataScadenza !== "undefined" ? calcolaDataScadenza : undefined,
        calcolaPrezzoPratica: typeof calcolaPrezzoPratica !== "undefined" ? calcolaPrezzoPratica : undefined,
        calcolaStatsCliente: typeof calcolaStatsCliente !== "undefined" ? calcolaStatsCliente : undefined,
        calcolaStatsClienteAnno: typeof calcolaStatsClienteAnno !== "undefined" ? calcolaStatsClienteAnno : undefined,
        calcolaStatsClienteAnnoConIva: typeof calcolaStatsClienteAnnoConIva !== "undefined" ? calcolaStatsClienteAnnoConIva : undefined,
        calcolaStatsPeriodo: typeof calcolaStatsPeriodo !== "undefined" ? calcolaStatsPeriodo : undefined,
        calcolaTotalePraticheMese: typeof calcolaTotalePraticheMese !== "undefined" ? calcolaTotalePraticheMese : undefined,
        cambiaPercorsoDati: typeof cambiaPercorsoDati !== "undefined" ? cambiaPercorsoDati : undefined,
        cambiaTipoMovimento: typeof cambiaTipoMovimento !== "undefined" ? cambiaTipoMovimento : undefined,
        caricaClienti: typeof caricaClienti !== "undefined" ? caricaClienti : undefined,
        caricaDatiApp: typeof caricaDatiApp !== "undefined" ? caricaDatiApp : undefined,
        caricaFileBackup: typeof caricaFileBackup !== "undefined" ? caricaFileBackup : undefined,
        caricaImpostazioniStudio: typeof caricaImpostazioniStudio !== "undefined" ? caricaImpostazioniStudio : undefined,
        caricaSezionePassword: typeof caricaSezionePassword !== "undefined" ? caricaSezionePassword : undefined,
        caricaTariffariBase: typeof caricaTariffariBase !== "undefined" ? caricaTariffariBase : undefined,
        caricaVariabiliSuSchedaCliente: typeof caricaVariabiliSuSchedaCliente !== "undefined" ? caricaVariabiliSuSchedaCliente : undefined,
        chiudiAnteprimaPDF: typeof chiudiAnteprimaPDF !== "undefined" ? chiudiAnteprimaPDF : undefined,
        chiudiModal: typeof chiudiModal !== "undefined" ? chiudiModal : undefined,
        chiudiModalModifica: typeof chiudiModalModifica !== "undefined" ? chiudiModalModifica : undefined,
        chiudiRicercaGlobale: typeof chiudiRicercaGlobale !== "undefined" ? chiudiRicercaGlobale : undefined,
        confermaCambioTariffario: typeof confermaCambioTariffario !== "undefined" ? confermaCambioTariffario : undefined,
        copiaVociTariffarioBase: typeof copiaVociTariffarioBase !== "undefined" ? copiaVociTariffarioBase : undefined,
        downloadBackup: typeof downloadBackup !== "undefined" ? downloadBackup : undefined,
        eliminaAbbuono: typeof eliminaAbbuono !== "undefined" ? eliminaAbbuono : undefined,
        eliminaBanca: typeof eliminaBanca !== "undefined" ? eliminaBanca : undefined,
        eliminaCliente: typeof eliminaCliente !== "undefined" ? eliminaCliente : undefined,
        eliminaCostoFisso: typeof eliminaCostoFisso !== "undefined" ? eliminaCostoFisso : undefined,
        eliminaMgEntrate: typeof eliminaMgEntrate !== "undefined" ? eliminaMgEntrate : undefined,
        eliminaMgUscite: typeof eliminaMgUscite !== "undefined" ? eliminaMgUscite : undefined,
        eliminaMovimento: typeof eliminaMovimento !== "undefined" ? eliminaMovimento : undefined,
        eliminaPratica: typeof eliminaPratica !== "undefined" ? eliminaPratica : undefined,
        eliminaRichiesta: typeof eliminaRichiesta !== "undefined" ? eliminaRichiesta : undefined,
        eliminaSvEntrate: typeof eliminaSvEntrate !== "undefined" ? eliminaSvEntrate : undefined,
        eliminaSvUscite: typeof eliminaSvUscite !== "undefined" ? eliminaSvUscite : undefined,
        eliminaTariffario: typeof eliminaTariffario !== "undefined" ? eliminaTariffario : undefined,
        eliminaVoceModal: typeof eliminaVoceModal !== "undefined" ? eliminaVoceModal : undefined,
        eseguiBackup: typeof eseguiBackup !== "undefined" ? eseguiBackup : undefined,
        eseguiContabilizzazione: typeof eseguiContabilizzazione !== "undefined" ? eseguiContabilizzazione : undefined,
        eseguiDuplicaTariffario: typeof eseguiDuplicaTariffario !== "undefined" ? eseguiDuplicaTariffario : undefined,
        eseguiImportClienti: typeof eseguiImportClienti !== "undefined" ? eseguiImportClienti : undefined,
        eseguiRicercaGlobale: typeof eseguiRicercaGlobale !== "undefined" ? eseguiRicercaGlobale : undefined,
        eseguiRipristino: typeof eseguiRipristino !== "undefined" ? eseguiRipristino : undefined,
        filtraClienti: typeof filtraClienti !== "undefined" ? filtraClienti : undefined,
        filtraClientiMassiviPerTariffario: typeof filtraClientiMassiviPerTariffario !== "undefined" ? filtraClientiMassiviPerTariffario : undefined,
        formatDataImport: typeof formatDataImport !== "undefined" ? formatDataImport : undefined,
        formatoEuro: typeof formatoEuro !== "undefined" ? formatoEuro : undefined,
        generaAbbuoniHtml: typeof generaAbbuoniHtml !== "undefined" ? generaAbbuoniHtml : undefined,
        generaDocumentoFatturazione: typeof generaDocumentoFatturazione !== "undefined" ? generaDocumentoFatturazione : undefined,
        generaFatturaPDF: typeof generaFatturaPDF !== "undefined" ? generaFatturaPDF : undefined,
        generaIndicatoriMesi: typeof generaIndicatoriMesi !== "undefined" ? generaIndicatoriMesi : undefined,
        generaOpzioniAnni: typeof generaOpzioniAnni !== "undefined" ? generaOpzioniAnni : undefined,
        generaPDF: typeof generaPDF !== "undefined" ? generaPDF : undefined,
        generaPDFScelto: typeof generaPDFScelto !== "undefined" ? generaPDFScelto : undefined,
        generaPDFSintetico: typeof generaPDFSintetico !== "undefined" ? generaPDFSintetico : undefined,
        generaPagamentiHtml: typeof generaPagamentiHtml !== "undefined" ? generaPagamentiHtml : undefined,
        generaPraticheMesiHtml: typeof generaPraticheMesiHtml !== "undefined" ? generaPraticheMesiHtml : undefined,
        generaPrevisionale: typeof generaPrevisionale !== "undefined" ? generaPrevisionale : undefined,
        generaRendicontoPDF: typeof generaRendicontoPDF !== "undefined" ? generaRendicontoPDF : undefined,
        generaSollecitoPDF: typeof generaSollecitoPDF !== "undefined" ? generaSollecitoPDF : undefined,
        generaStoricoCostiHtml: typeof generaStoricoCostiHtml !== "undefined" ? generaStoricoCostiHtml : undefined,
        generaTabellaVariabiliPaghe: typeof generaTabellaVariabiliPaghe !== "undefined" ? generaTabellaVariabiliPaghe : undefined,
        generaTariffarioHtml: typeof generaTariffarioHtml !== "undefined" ? generaTariffarioHtml : undefined,
        getTipoCliente: typeof getTipoCliente !== "undefined" ? getTipoCliente : undefined,
        haPagheAttive: typeof haPagheAttive !== "undefined" ? haPagheAttive : undefined,
        hashPassword: typeof hashPassword !== "undefined" ? hashPassword : undefined,
        inizializzaPrimaNotaStudio: typeof inizializzaPrimaNotaStudio !== "undefined" ? inizializzaPrimaNotaStudio : undefined,
        inizializzaRendiconto: typeof inizializzaRendiconto !== "undefined" ? inizializzaRendiconto : undefined,
        isVoceContabilizzata: typeof isVoceContabilizzata !== "undefined" ? isVoceContabilizzata : undefined,
        marcaModificheModal: typeof marcaModificheModal !== "undefined" ? marcaModificheModal : undefined,
        modificaMgEntrate: typeof modificaMgEntrate !== "undefined" ? modificaMgEntrate : undefined,
        modificaMgUscite: typeof modificaMgUscite !== "undefined" ? modificaMgUscite : undefined,
        modificaPrezzoCliente: typeof modificaPrezzoCliente !== "undefined" ? modificaPrezzoCliente : undefined,
        modificaQtaCliente: typeof modificaQtaCliente !== "undefined" ? modificaQtaCliente : undefined,
        modificaQtaPratica: typeof modificaQtaPratica !== "undefined" ? modificaQtaPratica : undefined,
        modificaRichiesta: typeof modificaRichiesta !== "undefined" ? modificaRichiesta : undefined,
        modificaSvEntrate: typeof modificaSvEntrate !== "undefined" ? modificaSvEntrate : undefined,
        modificaSvUscite: typeof modificaSvUscite !== "undefined" ? modificaSvUscite : undefined,
        mostraAnteprimaPDF: typeof mostraAnteprimaPDF !== "undefined" ? mostraAnteprimaPDF : undefined,
        navigateTo: typeof navigateTo !== "undefined" ? navigateTo : undefined,
        renderMacrogruppiModal: typeof renderMacrogruppiModal !== "undefined" ? renderMacrogruppiModal : undefined,
        ricalcolaTotaleFattura: typeof ricalcolaTotaleFattura !== "undefined" ? ricalcolaTotaleFattura : undefined,
        rimuoviPassword: typeof rimuoviPassword !== "undefined" ? rimuoviPassword : undefined,
        rimuoviRichiesta: typeof rimuoviRichiesta !== "undefined" ? rimuoviRichiesta : undefined,
        rimuoviVoceContabilizzata: typeof rimuoviVoceContabilizzata !== "undefined" ? rimuoviVoceContabilizzata : undefined,
        ripristinaCliente: typeof ripristinaCliente !== "undefined" ? ripristinaCliente : undefined,
        salvaAbbuono: typeof salvaAbbuono !== "undefined" ? salvaAbbuono : undefined,
        salvaAnnotazioni: typeof salvaAnnotazioni !== "undefined" ? salvaAnnotazioni : undefined,
        salvaAnteprimaPDF: typeof salvaAnteprimaPDF !== "undefined" ? salvaAnteprimaPDF : undefined,
        salvaCliente: typeof salvaCliente !== "undefined" ? salvaCliente : undefined,
        salvaDateGestione: typeof salvaDateGestione !== "undefined" ? salvaDateGestione : undefined,
        salvaGiroconto: typeof salvaGiroconto !== "undefined" ? salvaGiroconto : undefined,
        salvaImpostazioniStudio: typeof salvaImpostazioniStudio !== "undefined" ? salvaImpostazioniStudio : undefined,
        salvaModificaCliente: typeof salvaModificaCliente !== "undefined" ? salvaModificaCliente : undefined,
        salvaMovimento: typeof salvaMovimento !== "undefined" ? salvaMovimento : undefined,
        salvaPassword: typeof salvaPassword !== "undefined" ? salvaPassword : undefined,
        salvaPraticheMese: typeof salvaPraticheMese !== "undefined" ? salvaPraticheMese : undefined,
        salvaPrezziPratiche: typeof salvaPrezziPratiche !== "undefined" ? salvaPrezziPratiche : undefined,
        salvaTariffario: typeof salvaTariffario !== "undefined" ? salvaTariffario : undefined,
        scaricaTemplateClienti: typeof scaricaTemplateClienti !== "undefined" ? scaricaTemplateClienti : undefined,
        selezionaCadenza: typeof selezionaCadenza !== "undefined" ? selezionaCadenza : undefined,
        selezionaCadenzaEdit: typeof selezionaCadenzaEdit !== "undefined" ? selezionaCadenzaEdit : undefined,
        selezionaTuttiClientiMassivi: typeof selezionaTuttiClientiMassivi !== "undefined" ? selezionaTuttiClientiMassivi : undefined,
        showConfirm: typeof showConfirm !== "undefined" ? showConfirm : undefined,
        showToast: typeof showToast !== "undefined" ? showToast : undefined,
        toggleAnnoPrecVoce: typeof toggleAnnoPrecVoce !== "undefined" ? toggleAnnoPrecVoce : undefined,
        toggleEsenteVoce: typeof toggleEsenteVoce !== "undefined" ? toggleEsenteVoce : undefined,
        toggleFatturato: typeof toggleFatturato !== "undefined" ? toggleFatturato : undefined,
        toggleMeseNuovo: typeof toggleMeseNuovo !== "undefined" ? toggleMeseNuovo : undefined,
        toggleMeseVoce: typeof toggleMeseVoce !== "undefined" ? toggleMeseVoce : undefined,
        toggleMobileMenu: typeof toggleMobileMenu !== "undefined" ? toggleMobileMenu : undefined,
        toggleTuttiFatturazione: typeof toggleTuttiFatturazione !== "undefined" ? toggleTuttiFatturazione : undefined,
        trovaUltimoPagamento: typeof trovaUltimoPagamento !== "undefined" ? trovaUltimoPagamento : undefined,
        usaImportoSuggerito: typeof usaImportoSuggerito !== "undefined" ? usaImportoSuggerito : undefined,
        validaCodiceFiscale: typeof validaCodiceFiscale !== "undefined" ? validaCodiceFiscale : undefined,
        verificaClienteAttivoAnno: typeof verificaClienteAttivoAnno !== "undefined" ? verificaClienteAttivoAnno : undefined,
        verificaPassword: typeof verificaPassword !== "undefined" ? verificaPassword : undefined,
        verificaPasswordAvvio: typeof verificaPasswordAvvio !== "undefined" ? verificaPasswordAvvio : undefined,
        visualizzaBanche: typeof visualizzaBanche !== "undefined" ? visualizzaBanche : undefined,
        visualizzaMgEntrate: typeof visualizzaMgEntrate !== "undefined" ? visualizzaMgEntrate : undefined,
        visualizzaMgUscite: typeof visualizzaMgUscite !== "undefined" ? visualizzaMgUscite : undefined,
    });
}

// Assicura che chiudiModal e apriModal siano globali
if (typeof chiudiModal === "function") window.chiudiModal = chiudiModal;
if (typeof apriModal === "function") window.apriModal = apriModal;