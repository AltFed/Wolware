---
name: wolware-design-system
description: Wolware Design System — design tokens, components, and writing guidelines for Wolware, an Italian desktop app for "Consulente del Lavoro" (labor / payroll consultants) practice management. Use when designing any Wolware product surface: dashboards, practice tables, client cards, Prima Nota cash ledger, Tariffari fee schedules, Rendiconto, modals, forms, or any internal back-office screen for the same audience.
---

# Wolware Design System — agent skill

This folder is a self-contained design system for **Wolware**, distilled from the actual production codebase (`Wolware v1_0/`).

## When to invoke

Invoke this skill whenever the user asks for:

- Any new Wolware screen, tab, modal, or feature.
- Edits or recreations of existing Wolware UI (Pratiche, Clienti, Tariffari, Prima Nota, Rendiconto, Utenti).
- Italian back-office / accounting / payroll software UI in the same family.
- A demo or storyboard for the *Consulente del Lavoro* audience.

## How to use

1. **Read `README.md` first.** It contains the brand context, content fundamentals (tone, casing, Italian micro-copy), visual foundations (color, type, spacing, radii, shadows), and iconography. Do not skip it — Wolware's voice is specific (formal-professional Italian, "tu" form, no marketing tone) and the visual system is opinionated.
2. **Link `colors_and_type.css`** in every HTML file you produce: `<link rel="stylesheet" href="…/colors_and_type.css">`. Every color, font, radius, shadow, and spacing value in the system is exposed there as a CSS custom property. Never hard-code colors or px values that have a token.
3. **Open `ui_kits/wolware-app/index.html`** for composed reference: the desktop app shell (220 px sidebar + 48 px topbar), dashboard with KPIs, Pratiche table, Prima Nota saldi, Clienti card grid, Cadenze indicator, Nuova Ditta modal, dropdowns, toasts, empty state. Copy patterns from here.
4. **Use `assets/logo.svg`** for the brand mark and `assets/icons.svg` for the system icon set. For icons not in the inventory, use **Lucide** at 24×24, stroke 2, currentColor — same family as the inlined SVGs in the source.
5. **Write Italian.** All UI copy is Italian, formal-professional, second-person *tu*. Don't translate to English unless explicitly asked. Domain abbreviations (P.IVA, CF, INPS, INAIL, CIG, SRL, SPA, SAS, SNC, CU) are used unexpanded.

## Conventions to follow

- **Density:** dense, table-driven, calm. Closer to Linear / Notion than to a SaaS landing page. No hero photos, no gradients, no illustrations.
- **Typography:** Inter for everything; JetBrains Mono for codes, IDs, fattura numbers, money columns. Use `font-variant-numeric: tabular-nums` on monetary values.
- **Cards:** white surface + 1 px `--color-border` + `--radius-lg` + `--shadow-sm`. Hover bumps to `--shadow-md` and tints the border to `--color-primary`.
- **Status & category color:** use the categorical palette tokens (`--color-blue/orange/purple/gold/teal` + `-light` pairs) for status badges and 8 px tipo-dots. Don't introduce new hues.
- **Animations:** 160 ms with `cubic-bezier(0.16, 1, 0.3, 1)`. Three named keyframes — `fadeIn`, `slideUp`, `slideRight`. No bounces. No spinners-as-celebration.
- **Modals:** `--radius-xl`, slide up on open, scrim with `backdrop-filter: blur(3px)` over 45% black, primary CTA bottom-right.
- **Empty states:** single 32 px emoji at 0.4 opacity + Italian title + sub + primary CTA. Tone: matter-of-fact.
- **Dark mode is first-class.** Both themes are tokenised; flip via `[data-theme="dark"]` on `<html>`.

## What not to do

- Don't add marketing copy, exclamation-heavy CTAs, hero sections, or testimonials. This is back-office software.
- Don't introduce new fonts, new brand colors, or new shadow scales.
- Don't draw illustrations or stock-photo placeholders. Use icon tiles, letter avatars, or empty-state glyphs.
- Don't replace inline SVG icons with emoji except where the existing Prima Nota toolbar already uses emoji (🏦, 📁, 🧾, 🔄, 📥, 📬). Flag and ask if unsure.
- Don't expand domain abbreviations. The audience knows them.

## Index

| File | What it is |
|---|---|
| `README.md` | Brand, content, visuals, iconography. Read first. |
| `colors_and_type.css` | Tokens. Link in every HTML output. |
| `assets/logo.svg`, `logo-wordmark.svg` | Brand marks. |
| `assets/icons.svg` | Inline SVG icon set. |
| `ui_kits/wolware-app/index.html` | Composed UI reference — open this when designing. |
| `preview/*.html` | Per-token / per-component preview cards (rendered in the Design System tab). |
