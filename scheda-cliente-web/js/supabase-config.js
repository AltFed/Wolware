// Configurazione Supabase
const SUPABASE_URL = 'https://ckbfnutvmhlwmcjjypwd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrYmZudXR2bWhsd21jamp5cHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDE2MjUsImV4cCI6MjA5MDI3NzYyNX0.Fdt3y2NgWvS8NX2e5ME0bokv_MYTOk9uv87EJXJa6z4';

// Inizializza client Supabase v2
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==================== AUTENTICAZIONE ====================

async function authLogin(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });
    if (error) {
        console.error('Errore login:', error);
        return { success: false, error: error.message };
    }
    return { success: true, user: data.user };
}

async function authLogout() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
        console.error('Errore logout:', error);
        return false;
    }
    return true;
}

async function authGetSession() {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error || !data.session) {
        return null;
    }
    return data.session;
}

async function authGetUser() {
    const { data, error } = await supabaseClient.auth.getUser();
    if (error || !data.user) {
        return null;
    }
    return data.user;
}

// ==================== FUNZIONI DATABASE ====================

// CLIENTI
async function dbCaricaClienti() {
    const { data, error } = await supabaseClient.from('clienti').select('*').order('denominazione');
    if (error) { console.error('Errore caricamento clienti:', error); return []; }
    return data.map(c => ({
        id: c.id,
        denominazione: c.denominazione,
        codiceFiscale: c.codice_fiscale,
        email: c.email,
        telefono: c.telefono,
        indirizzo: c.indirizzo,
        tariffario: c.tariffario || [],
        tariffarioBaseId: c.tariffario_base_id,
        tariffarioNome: c.tariffario_nome,
        cadenzaPagamenti: c.cadenza_pagamenti,
        residuoIniziale: parseFloat(c.residuo_iniziale) || 0,
        inizioPaghe: c.inizio_paghe,
        finePaghe: c.fine_paghe,
        inizioContabilita: c.inizio_contabilita,
        fineContabilita: c.fine_contabilita,
        annotazioni: c.annotazioni,
        archiviato: c.archiviato,
        storicoTariffari: c.storico_tariffari || []
    }));
}

async function dbSalvaCliente(cliente) {
    const record = {
        denominazione: cliente.denominazione,
        codice_fiscale: cliente.codiceFiscale,
        email: cliente.email,
        telefono: cliente.telefono,
        indirizzo: cliente.indirizzo,
        tariffario: cliente.tariffario,
        tariffario_base_id: cliente.tariffarioBaseId,
        tariffario_nome: cliente.tariffarioNome,
        cadenza_pagamenti: cliente.cadenzaPagamenti,
        residuo_iniziale: cliente.residuoIniziale,
        inizio_paghe: cliente.inizioPaghe || null,
        fine_paghe: cliente.finePaghe || null,
        inizio_contabilita: cliente.inizioContabilita || null,
        fine_contabilita: cliente.fineContabilita || null,
        annotazioni: cliente.annotazioni,
        archiviato: cliente.archiviato,
        storico_tariffari: cliente.storicoTariffari
    };
    
    if (cliente.id && typeof cliente.id === 'number' && cliente.id > 0) {
        const { data, error } = await supabaseClient.from('clienti').update(record).eq('id', cliente.id).select();
        if (error) { console.error('Errore aggiornamento cliente:', error); return null; }
        return data[0];
    } else {
        const { data, error } = await supabaseClient.from('clienti').insert(record).select();
        if (error) { console.error('Errore inserimento cliente:', error); return null; }
        return data[0];
    }
}

async function dbEliminaCliente(id) {
    const { error } = await supabaseClient.from('clienti').delete().eq('id', id);
    if (error) { console.error('Errore eliminazione cliente:', error); return false; }
    return true;
}

// PAGAMENTI
async function dbCaricaPagamenti() {
    const { data, error } = await supabaseClient.from('pagamenti').select('*').order('data', { ascending: false });
    if (error) { console.error('Errore caricamento pagamenti:', error); return []; }
    return data.map(p => ({
        id: p.id,
        clienteId: p.cliente_id,
        data: p.data,
        importo: parseFloat(p.importo) || 0,
        mezzo: p.mezzo,
        movimentoStudioId: p.movimento_studio_id,
        tipologia: p.tipologia,
        note: p.note
    }));
}

async function dbSalvaPagamento(pagamento) {
    const record = {
        cliente_id: pagamento.clienteId,
        data: pagamento.data,
        importo: pagamento.importo,
        mezzo: pagamento.mezzo,
        movimento_studio_id: pagamento.movimentoStudioId,
        tipologia: pagamento.tipologia,
        note: pagamento.note
    };
    
    if (pagamento.id && typeof pagamento.id === 'number' && pagamento.id > 0) {
        const { data, error } = await supabaseClient.from('pagamenti').update(record).eq('id', pagamento.id).select();
        if (error) { console.error('Errore aggiornamento pagamento:', error); return null; }
        return data[0];
    } else {
        const { data, error } = await supabaseClient.from('pagamenti').insert(record).select();
        if (error) { console.error('Errore inserimento pagamento:', error); return null; }
        return data[0];
    }
}

async function dbEliminaPagamento(id) {
    const { error } = await supabaseClient.from('pagamenti').delete().eq('id', id);
    if (error) { console.error('Errore eliminazione pagamento:', error); return false; }
    return true;
}

// MOVIMENTI STUDIO
async function dbCaricaMovimentiStudio() {
    const { data, error } = await supabaseClient.from('movimenti_studio').select('*').order('data', { ascending: false });
    if (error) { console.error('Errore caricamento movimenti:', error); return []; }
    return data.map(m => ({
        id: m.id,
        tipo: m.tipo,
        data: m.data,
        tipologia: m.tipologia,
        // Se macrogruppo_nome è "Clienti" e macrogruppo_id è null, è un pagamento cliente
        macrogruppoId: (m.macrogruppo_nome === 'Clienti' && !m.macrogruppo_id) ? 'clienti' : (parseInt(m.macrogruppo_id) || null),
        macrogruppoNome: m.macrogruppo_nome,
        sottovoceId: parseInt(m.sottovoce_id) || null,
        sottovoceNome: m.sottovoce_nome,
        importo: parseFloat(m.importo) || 0,
        descrizione: m.descrizione,
        girocontoDir: m.giroconto_dir || null
    }));
}

async function dbSalvaMovimentoStudio(movimento) {
    // macrogruppoId può essere "clienti" (stringa) o un numero
    // Per "clienti" salviamo null in macrogruppo_id, il nome "Clienti" identifica il tipo
    let mgId = null;
    if (movimento.macrogruppoId !== 'clienti' && movimento.macrogruppoId !== null && movimento.macrogruppoId !== undefined) {
        mgId = parseInt(movimento.macrogruppoId) || null;
    }
    
    const record = {
        tipo: movimento.tipo,
        data: movimento.data,
        tipologia: movimento.tipologia,
        macrogruppo_id: mgId,
        macrogruppo_nome: movimento.macrogruppoNome,
        sottovoce_id: movimento.sottovoceId !== null ? parseInt(movimento.sottovoceId) : null,
        sottovoce_nome: movimento.sottovoceNome,
        importo: movimento.importo,
        descrizione: movimento.descrizione,
        giroconto_dir: movimento.girocontoDir || null
    };
    
    if (movimento.id && typeof movimento.id === 'number' && movimento.id > 0) {
        const { data, error } = await supabaseClient.from('movimenti_studio').update(record).eq('id', movimento.id).select();
        if (error) { console.error('Errore aggiornamento movimento:', error); return null; }
        return data[0];
    } else {
        const { data, error } = await supabaseClient.from('movimenti_studio').insert(record).select();
        if (error) { console.error('Errore inserimento movimento:', error); return null; }
        return data[0];
    }
}

async function dbEliminaMovimentoStudio(id) {
    const { error } = await supabaseClient.from('movimenti_studio').delete().eq('id', id);
    if (error) { console.error('Errore eliminazione movimento:', error); return false; }
    return true;
}

// TARIFFARI BASE
async function dbCaricaTariffariBase() {
    const { data, error } = await supabaseClient.from('tariffari_base').select('*').order('nome');
    if (error) { console.error('Errore caricamento tariffari:', error); return []; }
    return data.map(t => ({
        id: t.id,
        nome: t.nome,
        macrogruppi: t.macrogruppi || []
    }));
}

async function dbSalvaTariffarioBase(tariffario) {
    const record = {
        nome: tariffario.nome,
        macrogruppi: tariffario.macrogruppi
    };
    
    if (tariffario.id && typeof tariffario.id === 'number' && tariffario.id > 0) {
        const { data, error } = await supabaseClient.from('tariffari_base').update(record).eq('id', tariffario.id).select();
        if (error) { console.error('Errore aggiornamento tariffario:', error); return null; }
        return data[0];
    } else {
        const { data, error } = await supabaseClient.from('tariffari_base').insert(record).select();
        if (error) { console.error('Errore inserimento tariffario:', error); return null; }
        return data[0];
    }
}

async function dbEliminaTariffarioBase(id) {
    const { error } = await supabaseClient.from('tariffari_base').delete().eq('id', id);
    if (error) { console.error('Errore eliminazione tariffario:', error); return false; }
    return true;
}

// PRATICHE CLIENTI
async function dbCaricaPraticheClienti() {
    const { data, error } = await supabaseClient.from('pratiche_clienti').select('*');
    if (error) { console.error('Errore caricamento pratiche:', error); return {}; }
    
    var result = {};
    for (var i = 0; i < data.length; i++) {
        var p = data[i];
        if (!result[p.cliente_id]) result[p.cliente_id] = {};
        result[p.cliente_id][p.mese] = p.pratiche || {};
    }
    return result;
}

async function dbSalvaPraticaCliente(clienteId, mese, pratiche) {
    const { data: existing } = await supabaseClient.from('pratiche_clienti')
        .select('id').eq('cliente_id', clienteId).eq('mese', mese).single();
    
    if (existing) {
        const { error } = await supabaseClient.from('pratiche_clienti')
            .update({ pratiche: pratiche }).eq('id', existing.id);
        if (error) console.error('Errore aggiornamento pratica:', error);
    } else {
        const { error } = await supabaseClient.from('pratiche_clienti')
            .insert({ cliente_id: clienteId, mese: mese, pratiche: pratiche });
        if (error) console.error('Errore inserimento pratica:', error);
    }
}

// BANCHE STUDIO
async function dbCaricaBancheStudio() {
    const { data, error } = await supabaseClient.from('banche_studio').select('*').order('nome');
    if (error) { console.error('Errore caricamento banche:', error); return []; }
    return data.map(b => ({
        id: b.id,
        nome: b.nome,
        saldoIniziale: parseFloat(b.saldo_iniziale) || 0
    }));
}

async function dbSalvaBancaStudio(banca) {
    const record = { nome: banca.nome, saldo_iniziale: banca.saldoIniziale };
    
    if (banca.id && typeof banca.id === 'number' && banca.id > 0) {
        const { data, error } = await supabaseClient.from('banche_studio').update(record).eq('id', banca.id).select();
        if (error) { console.error('Errore aggiornamento banca:', error); return null; }
        return data[0];
    } else {
        const { data, error } = await supabaseClient.from('banche_studio').insert(record).select();
        if (error) { console.error('Errore inserimento banca:', error); return null; }
        return data[0];
    }
}

async function dbEliminaBancaStudio(id) {
    const { error } = await supabaseClient.from('banche_studio').delete().eq('id', id);
    if (error) { console.error('Errore eliminazione banca:', error); return false; }
    return true;
}

// MACROGRUPPI ENTRATE
async function dbCaricaMacrogruppiEntrate() {
    const { data, error } = await supabaseClient.from('macrogruppi_entrate').select('*').order('nome');
    if (error) { console.error('Errore caricamento macrogruppi entrate:', error); return []; }
    return data.map(m => ({
        id: m.id,
        nome: m.nome,
        sottovoci: m.sottovoci || []
    }));
}

async function dbSalvaMacrogruppoEntrate(mg) {
    const record = { nome: mg.nome, sottovoci: mg.sottovoci };
    
    if (mg.id && typeof mg.id === 'number' && mg.id > 0) {
        const { data, error } = await supabaseClient.from('macrogruppi_entrate').update(record).eq('id', mg.id).select();
        if (error) { console.error('Errore aggiornamento mg entrate:', error); return null; }
        return data[0];
    } else {
        const { data, error } = await supabaseClient.from('macrogruppi_entrate').insert(record).select();
        if (error) { console.error('Errore inserimento mg entrate:', error); return null; }
        return data[0];
    }
}

async function dbEliminaMacrogruppoEntrate(id) {
    const { error } = await supabaseClient.from('macrogruppi_entrate').delete().eq('id', id);
    if (error) { console.error('Errore eliminazione mg entrate:', error); return false; }
    return true;
}

// MACROGRUPPI USCITE
async function dbCaricaMacrogruppiUscite() {
    const { data, error } = await supabaseClient.from('macrogruppi_uscite').select('*').order('nome');
    if (error) { console.error('Errore caricamento macrogruppi uscite:', error); return []; }
    return data.map(m => ({
        id: m.id,
        nome: m.nome,
        sottovoci: m.sottovoci || []
    }));
}

async function dbSalvaMacrogruppoUscite(mg) {
    const record = { nome: mg.nome, sottovoci: mg.sottovoci };
    
    if (mg.id && typeof mg.id === 'number' && mg.id > 0) {
        const { data, error } = await supabaseClient.from('macrogruppi_uscite').update(record).eq('id', mg.id).select();
        if (error) { console.error('Errore aggiornamento mg uscite:', error); return null; }
        return data[0];
    } else {
        const { data, error } = await supabaseClient.from('macrogruppi_uscite').insert(record).select();
        if (error) { console.error('Errore inserimento mg uscite:', error); return null; }
        return data[0];
    }
}

async function dbEliminaMacrogruppoUscite(id) {
    const { error } = await supabaseClient.from('macrogruppi_uscite').delete().eq('id', id);
    if (error) { console.error('Errore eliminazione mg uscite:', error); return false; }
    return true;
}

// IMPOSTAZIONI STUDIO
async function dbCaricaImpostazioniStudio() {
    const { data, error } = await supabaseClient.from('impostazioni_studio').select('*').limit(1).single();
    if (error || !data) {
        return {
            ragioneSociale: '', piva: '', codiceFiscale: '', indirizzo: '',
            telefono: '', email: '', pec: '', banca: '', iban: '',
            prossimoNumeroFattura: 1, annoFatture: new Date().getFullYear(), sezionale: '',
            passwordHash: '', ultimoBackup: null
        };
    }
    return {
        id: data.id,
        ragioneSociale: data.ragione_sociale || '',
        piva: data.piva || '',
        codiceFiscale: data.codice_fiscale || '',
        indirizzo: data.indirizzo || '',
        telefono: data.telefono || '',
        email: data.email || '',
        pec: data.pec || '',
        banca: data.banca || '',
        iban: data.iban || '',
        prossimoNumeroFattura: data.prossimo_numero_fattura || 1,
        annoFatture: data.anno_fatture || new Date().getFullYear(),
        sezionale: data.sezionale || '',
        passwordHash: data.password_hash || '',
        ultimoBackup: data.ultimo_backup
    };
}

async function dbSalvaImpostazioniStudio(impostazioni) {
    const record = {
        ragione_sociale: impostazioni.ragioneSociale,
        piva: impostazioni.piva,
        codice_fiscale: impostazioni.codiceFiscale,
        indirizzo: impostazioni.indirizzo,
        telefono: impostazioni.telefono,
        email: impostazioni.email,
        pec: impostazioni.pec,
        banca: impostazioni.banca,
        iban: impostazioni.iban,
        prossimo_numero_fattura: impostazioni.prossimoNumeroFattura,
        anno_fatture: impostazioni.annoFatture,
        sezionale: impostazioni.sezionale,
        password_hash: impostazioni.passwordHash,
        ultimo_backup: impostazioni.ultimoBackup
    };
    
    if (impostazioni.id) {
        const { error } = await supabaseClient.from('impostazioni_studio').update(record).eq('id', impostazioni.id);
        if (error) console.error('Errore aggiornamento impostazioni:', error);
    } else {
        const { data, error } = await supabaseClient.from('impostazioni_studio').insert(record).select();
        if (error) console.error('Errore inserimento impostazioni:', error);
        else if (data && data[0]) impostazioni.id = data[0].id;
    }
}

// FATTURE EMESSE
async function dbCaricaFattureEmesse() {
    const { data, error } = await supabaseClient.from('fatture_emesse').select('*').order('data', { ascending: false });
    if (error) { console.error('Errore caricamento fatture:', error); return []; }
    return data.map(f => ({
        id: f.id,
        numero: f.numero,
        data: f.data,
        clienteId: f.cliente_id,
        clienteDenominazione: f.cliente_denominazione,
        imponibile: parseFloat(f.imponibile) || 0,
        iva: parseFloat(f.iva) || 0,
        totale: parseFloat(f.totale) || 0
    }));
}

async function dbSalvaFatturaEmessa(fattura) {
    const record = {
        numero: fattura.numero,
        data: fattura.data,
        cliente_id: fattura.clienteId,
        cliente_denominazione: fattura.clienteDenominazione,
        imponibile: fattura.imponibile,
        iva: fattura.iva,
        totale: fattura.totale
    };
    
    const { data, error } = await supabaseClient.from('fatture_emesse').insert(record).select();
    if (error) { console.error('Errore inserimento fattura:', error); return null; }
    return data[0];
}

// MOVIMENTI FATTURATI
async function dbCaricaMovimentiFatturati() {
    const { data, error } = await supabaseClient.from('movimenti_fatturati').select('movimento_id');
    if (error) { console.error('Errore caricamento movimenti fatturati:', error); return []; }
    return data.map(m => m.movimento_id);
}

async function dbSalvaMovimentoFatturato(movimentoId, fatturaId) {
    const { error } = await supabaseClient.from('movimenti_fatturati').insert({ movimento_id: movimentoId, fattura_id: fatturaId });
    if (error) console.error('Errore inserimento movimento fatturato:', error);
}

// ARROTONDAMENTI
async function dbCaricaArrotondamenti() {
    const { data, error } = await supabaseClient.from('arrotondamenti').select('*').order('data', { ascending: false });
    if (error) { console.error('Errore caricamento arrotondamenti:', error); return {}; }
    
    var result = {};
    for (var i = 0; i < data.length; i++) {
        var a = data[i];
        if (!result[a.cliente_id]) result[a.cliente_id] = [];
        result[a.cliente_id].push({
            id: a.id,
            data: a.data,
            importo: parseFloat(a.importo) || 0,
            note: a.note
        });
    }
    return result;
}

async function dbSalvaArrotondamento(clienteId, arrotondamento) {
    const record = {
        cliente_id: clienteId,
        data: arrotondamento.data,
        importo: arrotondamento.importo,
        note: arrotondamento.note
    };
    
    const { data, error } = await supabaseClient.from('arrotondamenti').insert(record).select();
    if (error) { console.error('Errore inserimento arrotondamento:', error); return null; }
    return data[0];
}

async function dbEliminaArrotondamento(id) {
    const { error } = await supabaseClient.from('arrotondamenti').delete().eq('id', id);
    if (error) { console.error('Errore eliminazione arrotondamento:', error); return false; }
    return true;
}

// ULTIMI ESTRATTI CONTO
async function dbCaricaUltimiEstrattiConto() {
    const { data, error } = await supabaseClient.from('ultimi_estratti_conto').select('*');
    if (error) { console.error('Errore caricamento ultimi EC:', error); return {}; }
    
    var result = {};
    for (var i = 0; i < data.length; i++) {
        result[data[i].cliente_id] = data[i].data;
    }
    return result;
}

async function dbSalvaUltimoEstrattoConto(clienteId, data) {
    const { data: existing } = await supabaseClient.from('ultimi_estratti_conto')
        .select('id').eq('cliente_id', clienteId).single();
    
    if (existing) {
        const { error } = await supabaseClient.from('ultimi_estratti_conto')
            .update({ data: data }).eq('id', existing.id);
        if (error) console.error('Errore aggiornamento ultimo EC:', error);
    } else {
        const { error } = await supabaseClient.from('ultimi_estratti_conto')
            .insert({ cliente_id: clienteId, data: data });
        if (error) console.error('Errore inserimento ultimo EC:', error);
    }
}

// CONTABILIZZAZIONI
async function dbCaricaContabilizzazioni() {
    const { data, error } = await supabaseClient.from('contabilizzazioni').select('*');
    if (error) { console.error('Errore caricamento contabilizzazioni:', error); return {}; }
    
    // Raggruppa per cliente_id
    const result = {};
    for (var i = 0; i < data.length; i++) {
        var c = data[i];
        if (!result[c.cliente_id]) result[c.cliente_id] = [];
        result[c.cliente_id].push({ mese: c.mese, voce: c.voce });
    }
    return result;
}

// CARICAMENTO INIZIALE COMPLETO
async function dbCaricaTutto() {
    console.log('Caricamento dati da Supabase...');
    
    const [
        clientiData,
        pagamentiData,
        movimentiData,
        tariffariData,
        praticheData,
        bancheData,
        mgEntrateData,
        mgUsciteData,
        impostazioniData,
        fattureData,
        movFatturatiData,
        arrotondamentiData,
        ultimiECData,
        contabilizzazioniData
    ] = await Promise.all([
        dbCaricaClienti(),
        dbCaricaPagamenti(),
        dbCaricaMovimentiStudio(),
        dbCaricaTariffariBase(),
        dbCaricaPraticheClienti(),
        dbCaricaBancheStudio(),
        dbCaricaMacrogruppiEntrate(),
        dbCaricaMacrogruppiUscite(),
        dbCaricaImpostazioniStudio(),
        dbCaricaFattureEmesse(),
        dbCaricaMovimentiFatturati(),
        dbCaricaArrotondamenti(),
        dbCaricaUltimiEstrattiConto(),
        dbCaricaContabilizzazioni()
    ]);
    
    console.log('Dati caricati:', {
        clienti: clientiData.length,
        pagamenti: pagamentiData.length,
        movimenti: movimentiData.length,
        tariffari: tariffariData.length
    });
    
    return {
        clienti: clientiData,
        pagamenti: pagamentiData,
        movimentiStudio: movimentiData,
        tariffariBase: tariffariData,
        praticheClienti: praticheData,
        bancheStudio: bancheData,
        macrogruppiEntrate: mgEntrateData,
        macrogruppiUscite: mgUsciteData,
        impostazioniStudio: impostazioniData,
        fattureEmesse: fattureData,
        movimentiFatturati: movFatturatiData,
        abbuoniClienti: arrotondamentiData,
        ultimiEstrattiConto: ultimiECData,
        contabilizzazioni: contabilizzazioniData
    };
}

// ==================== SINCRONIZZAZIONE AUTOMATICA ====================
// Queste funzioni vengono chiamate dopo ogni modifica per sincronizzare con Supabase

// Debounce per evitare troppe chiamate
var syncTimeout = null;
var pendingSync = {};

function schedulaSync(tipo) {
    pendingSync[tipo] = true;
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(eseguiSync, 500);
}

async function eseguiSync() {
    if (pendingSync.clienti) {
        // Sync completo clienti non necessario, vengono salvati singolarmente
        pendingSync.clienti = false;
    }
    if (pendingSync.pagamenti) {
        pendingSync.pagamenti = false;
    }
    if (pendingSync.movimenti) {
        pendingSync.movimenti = false;
    }
    if (pendingSync.pratiche) {
        pendingSync.pratiche = false;
    }
    if (pendingSync.tariffari) {
        pendingSync.tariffari = false;
    }
    if (pendingSync.banche) {
        pendingSync.banche = false;
    }
    if (pendingSync.impostazioni) {
        await dbSalvaImpostazioniStudio(impostazioniStudio);
        pendingSync.impostazioni = false;
    }
}

// Funzioni wrapper per sostituire localStorage.setItem
async function salvaClientiDB() {
    // I clienti vengono salvati singolarmente, questa è solo per compatibilità
    schedulaSync('clienti');
}

async function salvaPagamentiDB() {
    schedulaSync('pagamenti');
}

async function salvaMovimentiStudioDB() {
    schedulaSync('movimenti');
}

async function salvaPraticheClientiDB() {
    schedulaSync('pratiche');
}

async function salvaTariffariBaseDB() {
    schedulaSync('tariffari');
}

async function salvaBancheStudioDB() {
    schedulaSync('banche');
}

async function salvaImpostazioniStudioDB() {
    schedulaSync('impostazioni');
}

async function salvaMacrogruppiEntrateDB() {
    // Implementato singolarmente
}

async function salvaMacrogruppiUsciteDB() {
    // Implementato singolarmente
}

// ==================== WRAPPER SALVATAGGIO ====================
// Queste funzioni sostituiscono localStorage.setItem

async function salvaClientiDB() {
    // Salva tutti i clienti modificati - per ora usiamo update batch
    // In futuro ottimizzare salvando solo quelli modificati
    for (var i = 0; i < clienti.length; i++) {
        if (clienti[i]._modified) {
            await dbSalvaCliente(clienti[i]);
            delete clienti[i]._modified;
        }
    }
}

async function salvaPagamentiDB() {
    // I pagamenti vengono salvati singolarmente quando creati
}

async function salvaMovimentiStudioDB() {
    // I movimenti vengono salvati singolarmente quando creati
}

async function salvaTariffariBaseDB() {
    // I tariffari vengono salvati singolarmente
}

async function salvaPraticheClientiDB(clienteId, mese) {
    if (clienteId && mese && praticheClienti[clienteId] && praticheClienti[clienteId][mese]) {
        await dbSalvaPraticaCliente(clienteId, mese, praticheClienti[clienteId][mese]);
    }
}

async function salvaBancheStudioDB() {
    // Le banche vengono salvate singolarmente
}

async function salvaMacrogruppiEntrateDB() {
    // Salvati singolarmente
}

async function salvaMacrogruppiUsciteDB() {
    // Salvati singolarmente
}

async function salvaImpostazioniStudioDB() {
    await dbSalvaImpostazioniStudio(impostazioniStudio);
}

async function salvaAbbuoniClientiDB(clienteId) {
    // Gli arrotondamenti vengono salvati singolarmente
}

async function salvaUltimiEstrattiContoDB(clienteId, data) {
    await dbSalvaUltimoEstrattoConto(clienteId, data);
}

async function salvaMovimentiFatturatiDB(movimentoId, fatturaId) {
    await dbSalvaMovimentoFatturato(movimentoId, fatturaId);
}

// ==================== FUNZIONI MANCANTI ====================

// Elimina pratica cliente
async function dbEliminaPraticaCliente(clienteId, mese) {
    const { error } = await supabase
        .from('pratiche_clienti')
        .delete()
        .eq('cliente_id', clienteId)
        .eq('mese', mese);
    if (error) console.error('Errore eliminazione pratica:', error);
}

// Elimina fattura emessa
async function dbEliminaFatturaEmessa(id) {
    const { error } = await supabaseClient.from('fatture_emesse').delete().eq('id', id);
    if (error) console.error('Errore eliminazione fattura:', error);
}

// Salva contabilizzazioni (oggetto { clienteId: [array voci] })
async function dbSalvaContabilizzazioni(contabilizzazioni) {
    // Elimina tutte le contabilizzazioni esistenti e reinserisce
    const { error: delError } = await supabaseClient.from('contabilizzazioni').delete().neq('id', 0);
    if (delError) console.error('Errore eliminazione contabilizzazioni:', delError);
    
    const records = [];
    for (var clienteId in contabilizzazioni) {
        var voci = contabilizzazioni[clienteId];
        for (var i = 0; i < voci.length; i++) {
            var v = voci[i];
            records.push({
                cliente_id: parseInt(clienteId),
                mese: typeof v === 'object' ? v.mese : v,
                voce: typeof v === 'object' ? v.voce : null
            });
        }
    }
    
    if (records.length > 0) {
        const { error } = await supabaseClient.from('contabilizzazioni').insert(records);
        if (error) console.error('Errore salvataggio contabilizzazioni:', error);
    }
}

// Salva movimenti fatturati (array di ID movimenti)
async function dbSalvaMovimentiFatturati(movimentiFatturati) {
    // Elimina tutti e reinserisce
    const { error: delError } = await supabaseClient.from('movimenti_fatturati').delete().neq('id', 0);
    if (delError) console.error('Errore eliminazione movimenti fatturati:', delError);
    
    if (movimentiFatturati.length > 0) {
        const records = movimentiFatturati.map(movId => ({ movimento_id: movId }));
        const { error } = await supabaseClient.from('movimenti_fatturati').insert(records);
        if (error) console.error('Errore salvataggio movimenti fatturati:', error);
    }
}
