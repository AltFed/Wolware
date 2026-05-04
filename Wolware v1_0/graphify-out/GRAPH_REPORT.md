# Graph Report - Wolware v1_0  (2026-05-04)

## Corpus Check
- 24 files · ~34,194 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 269 nodes · 529 edges · 14 communities detected
- Extraction: 83% EXTRACTED · 17% INFERRED · 0% AMBIGUOUS · INFERRED: 92 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d68c7ce8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]

## God Nodes (most connected - your core abstractions)
1. `get_db()` - 78 edges
2. `api()` - 30 edges
3. `toast()` - 23 edges
4. `notify_all()` - 16 edges
5. `openModal()` - 15 edges
6. `editDitta()` - 11 edges
7. `loadDitte()` - 10 edges
8. `resetDittaForm()` - 10 edges
9. `renderMacrogruppi()` - 10 edges
10. `_loadDettaglio()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `login()` --calls--> `get_db()`  [INFERRED]
  auth/routes.py → database.py
- `change_password()` --calls--> `get_db()`  [INFERRED]
  auth/routes.py → database.py
- `get_arrotondamenti()` --calls--> `get_db()`  [INFERRED]
  routes/arrotondamenti.py → database.py
- `list_fatture()` --calls--> `get_db()`  [INFERRED]
  routes/fatture.py → database.py
- `aggiorna_fattura()` --calls--> `get_db()`  [INFERRED]
  routes/fatture.py → database.py

## Communities (19 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (48): add_voce_custom(), aggiorna_tariffario(), associa_tariffario(), delete_voce(), get_ditta_tariffario(), Hard sync — sovrascrive tutto, ignora sync_override., reset_override(), sync_tariffario() (+40 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (49): aggiungiVoce(), animateValue(), annullaRinominaTariffario(), annullaVoceInline(), api(), avviaEditVoce(), _dateRange(), deleteArrotDet() (+41 more)

### Community 2 - "Community 2"
Cohesion: 0.1
Nodes (23): archivia_ditta(), create_ditta(), delete_ditta(), get_ditta(), get_ditte(), _json_str(), patch_ditta(), Converte un valore in stringa JSON valida per SQLite.     Gestisce sia il caso i (+15 more)

### Community 3 - "Community 3"
Cohesion: 0.11
Nodes (23): contabilizza_esegui(), contabilizza_preview(), costi_massivi(), costi_massivi_anteprima(), _gestione_attiva(), _gia_contabilizzata(), import_esegui(), import_preview() (+15 more)

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (6): clearAziendaFields(), navSede(), removeSede(), renderSedi(), resetAssunzioneForm(), resetAssunzioneTabs()

### Community 5 - "Community 5"
Cohesion: 0.19
Nodes (12): aggiorna_fattura(), annulla_fattura(), crea_fattura(), _genera_pdf_fattura(), importa_righe(), list_fatture(), _mese_label(), _next_numero() (+4 more)

### Community 6 - "Community 6"
Cohesion: 0.17
Nodes (12): openDittaModal(), removeCC(), removeInail(), removeInps(), removeTariff(), renderCC(), renderDittaVoci(), renderInail() (+4 more)

### Community 7 - "Community 7"
Cohesion: 0.2
Nodes (11): _buildDetAnnoSel(), deleteUser(), openAssunzioneModal(), openCambiaPassword(), openDettaglioCliente(), openEditVoceCustom(), openModal(), openNuovoUtente() (+3 more)

### Community 8 - "Community 8"
Cohesion: 0.25
Nodes (9): anteprima_arrotondamento(), calcola_residuo(), create_arrotondamento(), delete_arrotondamento(), get_arrotondamenti(), Calcola il saldo attuale del cliente:     residuo_iniziale + pratiche (+ IVA su, Calcola il nuovo residuo PRIMA di salvare → per l'anteprima live nel modal., _genera_pdf_sollecito() (+1 more)

### Community 9 - "Community 9"
Cohesion: 0.2
Nodes (10): _aggiornAAnteprimaArrot(), fatRemoveRiga(), formatEur(), _openSollecito(), _renderCcfPreview(), _renderFatRighe(), _round2(), _saveFattura() (+2 more)

### Community 10 - "Community 10"
Cohesion: 0.29
Nodes (7): _buildAnnoSel(), _loadPrevisionale(), _openEstrattoPdf(), _openFattura(), _openPrevisionale(), _renderPrevTabella(), _updateEstPeriodoFields()

### Community 11 - "Community 11"
Cohesion: 0.47
Nodes (6): _applyMeseStyle(), _syncTuttiBtn(), toggleMeseAdd(), toggleMeseEdit(), toggleTuttiAdd(), toggleTuttiEdit()

### Community 13 - "Community 13"
Cohesion: 0.7
Nodes (4): _fetch_pagamenti(), _fetch_pratiche(), genera_estratto(), _genera_pdf_estratto()

## Knowledge Gaps
- **26 isolated node(s):** `Normalizza mesi: accetta lista o JSON string, ritorna lista [1-12] o None.`, `Copia profonda di un tariffario: macrogruppi + voci.`, `Aggiorna SOLO il nome — il tipo è immutabile dopo la creazione.`, `Calcola il saldo attuale del cliente:     residuo_iniziale + pratiche (+ IVA su`, `Calcola il nuovo residuo PRIMA di salvare → per l'anteprima live nel modal.` (+21 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `get_db()` connect `Community 0` to `Community 2`, `Community 3`, `Community 5`, `Community 8`, `Community 12`, `Community 13`?**
  _High betweenness centrality (0.253) - this node is a cross-community bridge._
- **Why does `genera_estratto()` connect `Community 13` to `Community 0`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `notify_all()` connect `Community 2` to `Community 8`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Are the 76 inferred relationships involving `get_db()` (e.g. with `login()` and `change_password()`) actually correct?**
  _`get_db()` has 76 INFERRED edges - model-reasoned connections that need verification._
- **Are the 14 inferred relationships involving `notify_all()` (e.g. with `create_arrotondamento()` and `delete_arrotondamento()`) actually correct?**
  _`notify_all()` has 14 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Normalizza mesi: accetta lista o JSON string, ritorna lista [1-12] o None.`, `Copia profonda di un tariffario: macrogruppi + voci.`, `Aggiorna SOLO il nome — il tipo è immutabile dopo la creazione.` to the rest of the system?**
  _26 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._