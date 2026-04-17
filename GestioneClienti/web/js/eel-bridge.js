/**
 * eel-bridge.js
 * Adattatore: sostituisce tutte le chiamate Supabase con chiamate eel.
 * Viene caricato PRIMA di app.js e sovrascrive le funzioni db* usate dall'app.
 *
 * CONVENZIONE NOMI:
 *   JS camelCase  →  Python snake_case
 *   dbCaricaClienti()  →  eel.db_carica_clienti()()
 *
 * Le funzioni eel ritornano Promise, quindi l'app JS può continuare ad usare
 * await senza modifiche.
 *
 * AUTH ─────────────────────────────────────────────────────────────────────
 */

// ── Auth ──────────────────────────────────────────────────────────────────────
async function authLogin(email, password) {
    // Email ignorata in locale, si usa solo la password
    const res = await eel.auth_login(password)();
    if (res.success) return { success: true, user: { email: email || 'utente locale' } };
    return { success: false, error: res.error };
}

async function authLogout() {
    return await eel.auth_logout()();
}

async function authGetSession() {
    const active = await eel.auth_check_session()();
    return active ? { user: { email: 'locale' } } : null;
}

async function authGetUser() {
    const active = await eel.auth_check_session()();
    return active ? { email: 'locale' } : null;
}

// ── Clienti ───────────────────────────────────────────────────────────────────
async function dbCaricaClienti()          { return await eel.db_carica_clienti()(); }
async function dbSalvaCliente(c)          { return await eel.db_salva_cliente(c)(); }
async function dbEliminaCliente(id)       { return await eel.db_elimina_cliente(id)(); }

// ── Pagamenti ─────────────────────────────────────────────────────────────────
async function dbCaricaPagamenti()        { return await eel.db_carica_pagamenti()(); }
async function dbSalvaPagamento(p)        { return await eel.db_salva_pagamento(p)(); }
async function dbEliminaPagamento(id)     { return await eel.db_elimina_pagamento(id)(); }

// ── Movimenti Studio ──────────────────────────────────────────────────────────
async function dbCaricaMovimentiStudio()  { return await eel.db_carica_movimenti_studio()(); }
async function dbSalvaMovimentoStudio(m)  { return await eel.db_salva_movimento_studio(m)(); }
async function dbEliminaMovimentoStudio(id){ return await eel.db_elimina_movimento_studio(id)(); }

// ── Banche Studio ─────────────────────────────────────────────────────────────
async function dbCaricaBancheStudio()     { return await eel.db_carica_banche_studio()(); }
async function dbSalvaBancaStudio(b)      { return await eel.db_salva_banca_studio(b)(); }
async function dbEliminaBancaStudio(id)   { return await eel.db_elimina_banca_studio(id)(); }

// ── Macrogruppi Entrate ───────────────────────────────────────────────────────
async function dbCaricaMacrogruppiEntrate()       { return await eel.db_carica_macrogruppi_entrate()(); }
async function dbSalvaMacrogruppoEntrate(mg)      { return await eel.db_salva_macrogruppo_entrate(mg)(); }
async function dbEliminaMacrogruppoEntrate(id)    { return await eel.db_elimina_macrogruppo_entrate(id)(); }

// ── Macrogruppi Uscite ────────────────────────────────────────────────────────
async function dbCaricaMacrogruppiUscite()        { return await eel.db_carica_macrogruppi_uscite()(); }
async function dbSalvaMacrogruppoUscite(mg)       { return await eel.db_salva_macrogruppo_uscite(mg)(); }
async function dbEliminaMacrogruppoUscite(id)     { return await eel.db_elimina_macrogruppo_uscite(id)(); }

// ── Tariffari Base ────────────────────────────────────────────────────────────
async function dbCaricaTariffariBase()    { return await eel.db_carica_tariffari_base()(); }
async function dbSalvaTariffarioBase(t)   { return await eel.db_salva_tariffario_base(t)(); }
async function dbEliminaTariffarioBase(id){ return await eel.db_elimina_tariffario_base(id)(); }

// ── Pratiche Clienti ──────────────────────────────────────────────────────────
async function dbCaricaPraticheClienti()          { return await eel.db_carica_pratiche_clienti()(); }
async function dbSalvaPraticaCliente(cId,m,p)     { return await eel.db_salva_pratica_cliente(cId,m,p)(); }
async function dbEliminaPraticaCliente(cId,m)     { return await eel.db_elimina_pratica_cliente(cId,m)(); }

// ── Arrotondamenti ────────────────────────────────────────────────────────────
async function dbCaricaArrotondamenti()           { return await eel.db_carica_arrotondamenti()(); }
async function dbSalvaArrotondamento(cId,a)       { return await eel.db_salva_arrotondamento(cId,a)(); }
async function dbEliminaArrotondamento(id)        { return await eel.db_elimina_arrotondamento(id)(); }

// ── Ultimi Estratti Conto ─────────────────────────────────────────────────────
async function dbCaricaUltimiEstrattiConto()      { return await eel.db_carica_ultimi_estratti_conto()(); }
async function dbSalvaUltimoEstrattoContoLocal(cId,d){ return await eel.db_salva_ultimo_estratto_conto(cId,d)(); }
// Compatibilità: vecchio nome con 2 argomenti
async function dbSalvaUltimoEstrattoContoFn(...args){ return await dbSalvaUltimoEstrattoContoLocal(...args); }

// ── Contabilizzazioni ─────────────────────────────────────────────────────────
async function dbCaricaContabilizzazioni()        { return await eel.db_carica_contabilizzazioni()(); }
async function dbSalvaContabilizzazioni(c)        { return await eel.db_salva_contabilizzazioni(c)(); }

// ── Impostazioni Studio ───────────────────────────────────────────────────────
async function dbCaricaImpostazioniStudio()       { return await eel.db_carica_impostazioni_studio()(); }
async function dbSalvaImpostazioniStudio(s)       { return await eel.db_salva_impostazioni_studio(s)(); }

// ── Fatture Emesse ────────────────────────────────────────────────────────────
async function dbCaricaFattureEmesse()            { return await eel.db_carica_fatture_emesse()(); }
async function dbSalvaFatturaEmessa(f)            { return await eel.db_salva_fattura_emessa(f)(); }
async function dbEliminaFatturaEmessa(id)         { return await eel.db_elimina_fattura_emessa(id)(); }

// ── Movimenti Fatturati ───────────────────────────────────────────────────────
async function dbCaricaMovimentiFatturati()       { return await eel.db_carica_movimenti_fatturati()(); }
async function dbSalvaMovimentiFatturati(ids)     { return await eel.db_salva_movimenti_fatturati(ids)(); }
async function dbSalvaMovimentoFatturato(mId,fId) { return await eel.db_salva_movimento_fatturato(mId,fId)(); }

// ── Carica Tutto (equivalente dbCaricaTutto di Supabase) ──────────────────────
async function dbCaricaTutto() {
    const [
        clientiData, pagamentiData, movimentiData, tariffariData,
        praticheData, bancheData, mgEntrateData, mgUsciteData,
        impostazioniData, fattureData, movFatturatiData,
        arrotondamentiData, ultimiECData, contabilizzazioniData
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
        dbCaricaContabilizzazioni(),
    ]);
    return {
        clienti:             clientiData      || [],
        pagamenti:           pagamentiData    || [],
        movimentiStudio:     movimentiData    || [],
        tariffariBase:       tariffariData    || [],
        praticheClienti:     praticheData     || {},
        bancheStudio:        bancheData       || [],
        macrogruppiEntrate:  mgEntrateData    || [],
        macrogruppiUscite:   mgUsciteData     || [],
        impostazioniStudio:  impostazioniData || {},
        fattureEmesse:       fattureData      || [],
        movimentiFatturati:  movFatturatiData || [],
        abbuoniClienti:      arrotondamentiData || {},
        ultimiEstrattiConto: ultimiECData     || {},
        contabilizzazioni:   contabilizzazioniData || {},
    };
}

// ── PDF / Reports (delega a Python) ──────────────────────────────────────────
async function generaFatturaPDF(dati)               { return await eel.genera_fattura_pdf(dati)(); }
async function generaSollecitoPDFPy(dati)           { return await eel.genera_sollecito_pdf(dati)(); }
async function generaRendicontoPDFPy(dati)          { return await eel.genera_rendiconto_pdf(dati)(); }
async function generaDocumentoFatturazionePy(dati)  { return await eel.genera_documento_fatturazione_pdf(dati)(); }
async function apriPDF(path)                        { return await eel.apri_pdf(path)(); }
async function getPDFBase64(path)                   { return await eel.get_pdf_as_base64(path)(); }

// ── Impostazioni/File system ──────────────────────────────────────────────────
async function apriCartellaDati()   { return await eel.apri_cartella_dati()(); }
async function scegliCartella()     { return await eel.scegli_cartella()(); }
async function scegliFileBackup()   { return await eel.scegli_file_backup()(); }
async function caricaBackupFile(p)  { return await eel.carica_backup(p)(); }
async function eseguiBackupPy(d)    { return await eel.esegui_backup(d)(); }
async function cambiaPercorsoDatiPy(p){ return await eel.set_data_dir(p)(); }
async function getDataDir()         { return await eel.get_data_dir()(); }

// ── Imposta password ──────────────────────────────────────────────────────────
async function authSetPassword(pwd) { return await eel.auth_set_password(pwd)(); }

console.log('[eel-bridge] Caricato. Tutte le funzioni db* usano eel.');
