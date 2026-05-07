# Wolware Design System

A practical desktop-software design system, distilled from the **Wolware v1.0** codebase — an Italian cross-platform desktop app for *Consulenti del Lavoro* (Italian labor / payroll consultants) to manage client practices, payroll cycles, billing, and a studio-level cash ledger.

> "Wolware Desktop — Applicazione desktop cross-platform per la gestione delle pratiche del Consulente del Lavoro."
> — *Wolware v1_0/README.md*

The product is one tightly-scoped desktop app; this design system is built around that single product surface.

---

## Index — what's in this folder

| File / Folder | Purpose |
|---|---|
| `README.md` | This file. Brand context, content + visual foundations, iconography. |
| `colors_and_type.css` | All design tokens (CSS custom properties): colors, type scale, spacing, radii, shadows. |
| `SKILL.md` | Agent-skill front-matter so this folder can be loaded as a Claude Code skill. |
| `assets/` | Logos, icons, brand glyphs lifted from the codebase. |
| `fonts/` | (Inter + JetBrains Mono — loaded from Google Fonts; see *Visual Foundations*.) |
| `preview/` | Cards rendered in the project's Design System tab. |
| `ui_kits/wolware-app/` | High-fidelity recreation of the Wolware desktop UI (sidebar, topbar, KPIs, tables, modals, dashboard). |

---

## Sources

- **Codebase:** `Wolware v1_0/` (attached locally) — Python + Flask + pywebview + SQLite. Frontend is a single `templates/index.html` (3,130 lines), backed by `static/css/style.css` (743 lines, all tokens) and `static/js/app.js` (4,929 lines).
- **GitHub:** `AltFed/Wolware` @ `main` — same source.
- No Figma was provided. No slide deck was provided. No marketing site was provided. **One product, one surface.**

---

## Product context

Wolware is a **single-window desktop application** (runs in pywebview, not a browser) used daily by Italian labor consultants to run their practice. It is **not** a SaaS marketing site, not a mobile app, and not a public-facing product. The audience is professional, Italian-speaking, and detail-driven — they live in tables of numbers, dates, and client names.

The app is organised around six top-level tabs:

1. **Home** — Dashboard with KPIs (Ditte Clienti, Pratiche Totali, Aperte, Chiuse) and a feed of recent practices.
2. **Pratiche** — All client practices (Assunzione, Cessazione, Buste Paga, Modello 770, CU, INAIL, INPS, etc.) in a filterable table.
3. **Tariffari** — Reusable price lists / fee schedules organised in macrogroups, applied to clients.
4. **Prima Nota** — Studio-level cash & bank ledger (entrate / uscite / giroconti, account balances, dunning).
5. **Rendiconto** — Annual financial summary (entrate, uscite, differenza, drilldown per macrogroup and client).
6. **Clienti** *(internally `ditte`)* — All clients (legal forms, sedi, INPS/INAIL/CC positions, costs).

Plus an admin "Utenti" tab for user management.

The vibe: **competent, calm, Italian financial software**. Closer to Linear / Notion in chrome and density, but with the *vocabulary* and *information density* of a tax/payroll back-office tool.

---

## CONTENT FUNDAMENTALS

### Language

- **Italian, formal-professional.** All UI copy is Italian. Examples lifted verbatim from the source:
  - Page titles: "Dashboard", "Pratiche", "Tariffari", "Prima Nota Studio", "Rendiconto", "Clienti".
  - Subtitles: *"Benvenuto in Wolware — Gestione Pratiche del Consulente del Lavoro"*, *"Gestisci tutte le pratiche dei tuoi clienti"*, *"Registro movimenti di Cassa e Banche dello studio"*.
  - Empty states: *"Nessuna pratica. Crea la tua prima pratica!"*, *"Nessun cliente attivo."*, *"Seleziona un tariffario dalla lista oppure creane uno nuovo."*

### Tone

- **Direct, second-person informal-professional ("tu" form).** *"Gestisci i tuoi clienti"*, *"i tuoi tariffari"*, *"Cerca cliente, P.IVA, referente…"*, *"Crea la tua prima pratica!"*. The app addresses the user as a peer.
- **No marketing tone, no exclamation-heavy copy.** Single exclamation marks reserved for empty-state nudges only.
- **Domain-specific Italian abbreviations are used freely** without expansion: *P.IVA, CF, EC, CU, INPS, INAIL, CIG, SRL, SPA, SNC, SAS*. The audience knows them.
- **Verbs in imperative for actions:** *"Accedi", "Annulla", "Applica", "Esci", "Esporta", "Duplica Esistente", "Importa Excel", "Contabilizza Costi Fissi"*.

### Casing

- **Title Case for buttons and section titles** ("Nuova Pratica", "Nuovo Tariffario", "Costi Massivi", "Inserimento Costi Variabili").
- **Sentence case for placeholders and helper text** ("Cerca pratica o ditta…", "es. Invio CU 2026").
- **UPPERCASE letter-spaced labels** for column headers and form-section titles (`text-transform: uppercase; letter-spacing: 0.06em`). Used for `.ds-caption`, table `<th>`, and `.form-section-title`.

### Punctuation & micro-copy

- Ellipses (`…`) inside placeholders to signal continuation: *"Cerca cliente, P.IVA, referente…"*.
- Em-dashes (`—`) between brand and tagline: *"Wolware — Gestione Pratiche"*, *"CU - Certificazione Unica"*.
- **No emoji as decoration in body copy.** Emoji *do* appear sporadically inside Prima Nota toolbar buttons (🏦 Banche, 📁 Uscite, 📁 Entrate, 🧾 Fatturazione, 🔄 Giroconto, 📥 Esporta, 📋 empty-state, 📬 Sollecito massivo). This is informal/engineer-driven and feels slightly inconsistent with the otherwise icon-led system — flag it as an open question for the user. (See *Iconography*.)
- **Numeric formatting:** Italian conventions, tabular-nums for money columns, monospace for codes (P.IVA, CF, fattura numbers).

### Vibe

> Calm, dense, professional. Italian back-office software that respects the user's time and expertise. No hand-holding, no celebration animations, no "Hooray, you did it!". Just a green check toast that says **"✓"** and disappears.

---

## VISUAL FOUNDATIONS

### Colors

A **single brand color** (deep teal-green `#1a6f5c`) plus a **categorical palette** (blue / orange / purple / gold / red / green / teal) used as 8 px dots, KPI icon tiles, and badge backgrounds. The categorical palette tags *kinds of work* (Assunzione = blue, Cessazione = red, Paghe = green, INPS = purple, INAIL = teal, CIG = gold, etc.).

- **Primary:** `#1a6f5c` (light) / `#3fb68e` (dark). Used for primary buttons, active nav, focus rings, tabs, links, tariff highlights.
- **Backgrounds:** stacked grays — `#f4f5f7` (page) → `#ffffff` (surface) → `#f9fafb` (subtle inset) → `#f1f3f5` (offset/hover). No gradients, no images.
- **Text ramp:** `#1a1d23` body → `#6b7280` muted → `#9ca3af` faint.
- **Status:** warning `#d97706`, error `#dc2626`, success `#16a34a`, blue `#2563eb`. Each has a tinted `-light` background for badges/toasts.
- **Dark theme is first-class** (mirrors GitHub's dark palette: `#0f1117` bg, `#161b22` surface, `#3fb68e` primary).

### Typography

- **Body:** **Inter** (300–700) — the only sans-serif, used for everything.
- **Mono:** **JetBrains Mono** (400, 500) — codes, IDs, tabular numbers in money columns, fattura numbers.
- **Type scale is fluid** via `clamp()`: `--text-xs` → `--text-xl` (12 → 24 px). No display-display or hero type — the largest in-app text is `--text-xl` (page title).
- **Heading style:** tight tracking (`letter-spacing: -0.02em`) on `h1.page-title`, line-height 1.2.
- **Caps + tracking** for column headers and section labels (`uppercase`, `letter-spacing: 0.06em`, weight 600–700, `--text-xs`).

> **Substitution flag:** Inter and JetBrains Mono are loaded from Google Fonts in the source. No `.ttf` / `.woff2` files are bundled. We've kept the Google Fonts CDN in `colors_and_type.css`. If the user wants a fully offline pack, ask them to drop the `.woff2` files into `fonts/`.

### Spacing

A **4 px base scale** named in `var(--space-N)` from `--space-1` (4 px) to `--space-16` (64 px). Used uniformly for padding, gaps, grid gutters. Rare exceptions use `2px`, `3px` literally for micro-detail (mese-dot, badge inner padding).

### Radii

- `--radius-sm` 6 px — inputs inside tables, small badges
- `--radius-md` 8 px — buttons, inputs, dropdowns, list items
- `--radius-lg` 12 px — cards, sections, table wrappers, KPI cards
- `--radius-xl` 16 px — modals only
- `--radius-full` 9999 px — pill badges, dots, toggle switches

### Shadows / Elevation

A four-step shadow scale, **soft and layered** (multi-layer rgba shadows). No hard borders-as-elevation.

- `--shadow-sm` cards at rest
- `--shadow-md` card hover
- `--shadow-lg` modals, dropdowns, toasts
- `--shadow-xl` modal-xl (full dialogs)

Cards rely on **shadow + 1 px `--color-border` + radius**, not heavy outlines. Borders darken slightly on hover (`border-color: var(--color-primary)`).

### Borders

- **1 px solid `--color-border` (#e2e5e9)** is the default boundary on every card, table, input, modal.
- Dividers (`--color-divider` #eaecef) are even softer — used between rows, between modal-header and modal-body.
- **Focus state:** primary border + 3 px tinted ring via `box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-primary) 15%, transparent)`.

### Backgrounds

- **No imagery.** No hero photos, no illustrations, no gradients. The product is a working tool and the visual canvas is tasteful gray surfaces.
- **No background patterns or textures.** Subtle striping appears only in repeating UI rows.
- **Dark mode** uses dark grays not pure black, with a hint of warm green in the primary.

### Animations

- One easing curve everywhere: `cubic-bezier(0.16, 1, 0.3, 1)` (a confident decel-out). Duration 160 ms — fast, purposeful.
- Three named keyframes: `fadeIn` (120 ms), `slideUp` (200 ms), `slideRight` (200 ms). Used on dropdowns, modals, toasts.
- One special-case loop: `pn-urgente-pulse` (2s ease-in-out, 50% opacity) on overdue dunning flags.
- **No bounces, no springs, no spinners-as-celebration.** Loading states use `—` em-dash skeletons, not animated spinners.

### Hover & press states

- **Hover:** background lightens to `--color-surface-offset`, OR primary lightens (`--color-primary-hover`). Foreground text often goes from `--color-text-muted` to `--color-text` simultaneously.
- **Active / pressed:** `--color-primary-active` (darker than hover). No transform / shrink animations.
- **Card hover:** elevates to `--shadow-md`, border tints to primary.
- **Disabled:** `opacity: 0.6` (buttons), `0.3` (icons), `cursor: not-allowed`.

### Transparency & blur

- **Blur is reserved for modal overlays:** `backdrop-filter: blur(3px)` on `.modal-overlay` over a 45 % black scrim.
- **Color-mix transparency** for focus rings (`color-mix(in oklab, var(--color-primary) 15%, transparent)`).
- **Tinted badges and KPI tiles** use `-light` colors (5–15 % saturation) — these *look* transparent but are flat fills.

### Layout rules

- **Fixed app shell:** 220 px sidebar + 48 px topbar + scrollable main. Body has `overflow: hidden` — only `.main-content` scrolls.
- **Responsive collapse:** sidebar collapses to 56 px (icons only) below 1024 px, hides entirely below 768 px.
- **Tables are first-class.** Wide tables scroll horizontally inside `.table-wrapper`; sticky first columns and sticky headers in `Rendiconto` and `Variabili`.
- **Modals are vertically scrollable**, capped at `90dvh`, slid up on open.

### Cards

The canonical card is:

```
background:    var(--color-surface);
border:        1px solid var(--color-border);
border-radius: var(--radius-lg);
box-shadow:    var(--shadow-sm);
padding:       var(--space-4) var(--space-5);
```

Hover bumps shadow to `--shadow-md` and tints the border primary. KPI cards add a 40 × 40 colored icon tile on the left. Client cards add a 40 × 40 letter avatar.

---

## ICONOGRAPHY

### System

**Inline SVG icons drawn with `stroke="currentColor"`, `stroke-width="2"` (or `2.5` for emphasis), and a 24 × 24 viewBox.** Sizes typically rendered at 13–18 px. Stroke style is **Lucide-like** (rounded line caps in spirit, though the source omits `stroke-linecap` on most). They are not imported from Lucide as a library — they're hand-inlined per use.

This system is consistent enough that **Lucide Icons from CDN is the closest CDN substitute** (same stroke weight, same outline aesthetic, same metaphors for Home/File/Building/Wallet). We've documented this and kept the original SVG snippets so the UI kit can render them inline.

> **Substitution note for agents:** when this design system needs an icon Wolware doesn't have, use **Lucide** (`https://unpkg.com/lucide-static`) at 24 × 24, stroke 2, currentColor. Don't mix in Heroicons, Material, or Phosphor — the visual weight differs and it'll look off.

### Logo

Wolware's mark is itself an inline SVG: **a 28 × 28 rounded square (`rx=7`) filled with `--color-primary`, with a stylised "W" stroke in white** (`d="M6 10l4 8 4-6 4 6 4-8"`). It's reused at 28 px in the sidebar, 32 px on the login screen.

We've copied this into `assets/logo.svg` so it can be referenced without re-typing.

### Emoji

Used **sparingly and inconsistently** as button leading icons in the Prima Nota tab (🏦, 📁, 🧾, 🔄, 📥, 📬) and in toast prefixes (✓, ✕, ℹ rendered as text). Empty states render a single large emoji (📋) at 2 rem with 0.4 opacity.

This is engineer-style decoration, not brand-system iconography. **For new screens, prefer inline SVG over emoji.** Keep emoji only when matching Prima Nota patterns 1:1.

### Unicode glyphs

- `&#x2715;` (✕) — modal close button
- `→`, `←` — "Vedi tutte →" and pagination arrows
- `—` (em-dash) — empty values, separator in tagline
- `•` — middle dots (rare)

### Asset inventory (in `assets/`)

- `logo.svg` — Wolware brand mark (lifted from the codebase HTML).
- `icon-set.svg` — combined sprite of the most-used inline icons (home, file, list, wallet, building, plus, dropdown caret, close, search, lock, sun/moon).
