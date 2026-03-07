# GLN Tools — Project Guide

## Overview

**Client:** Global Living Network (globallivingnetwork.com)
**Goal:** Suite of interactive search/assessment tools for international relocation.
**Phase:** Demo prototype for GLN team pitch.

## Tech Stack

- **Framework:** Vite + React
- **Routing:** React Router DOM (`/visa`, `/cost-of-living`, `/destinations`)
- **Styling:** Pure CSS-in-JS (no Tailwind) — editorial luxury aesthetic
- **AI:** Anthropic Claude API (`claude-sonnet-4-20250514`)
- **Fonts:** Cormorant Garant (display) + Outfit (body) via Google Fonts

## Design Tokens

```css
--navy:        #07101F   /* Primary background */
--navy-mid:    #0E1C30   /* Card backgrounds */
--navy-light:  #162540   /* Input/option backgrounds */
--border:      rgba(255,255,255,0.08)
--gold:        #C9A96E   /* Primary accent */
--gold-light:  #E8C98A   /* Hover/highlight gold */
--cream:       #F0EBE1   /* Primary text */
--muted:       rgba(240,235,225,0.45)  /* Secondary text */
--green:       #4CAF82   /* Easy/success */
--amber:       #E8944A   /* Moderate/warning */
--red:         #E05C5C   /* Complex/caution */
```

## Project Structure

```
src/
  tools/
    visa-pathway/VisaPathway.jsx    ← 5-question quiz + AI recs (DONE)
    cost-of-living/                 ← planned
    destinations/                   ← planned
    tax-calculator/                 ← planned (next priority)
  App.jsx                           ← Router shell
  main.jsx
```

## Tool Suite

| Tool | Status | Route |
|---|---|---|
| Visa Pathway Explorer | ✅ Done | `/visa` |
| Destination Match AI | Planned | `/destinations` |
| Cost of Living Translator | Planned | `/cost-of-living` |
| Neighborhood + School Finder | Planned | — |
| Tax Calculator | Planned (next) | `/tax` |

## API Pattern

- Claude API calls go to `https://api.anthropic.com/v1/messages`
- API key must NOT be hardcoded — inject at runtime
- Prompts request pure JSON responses (no markdown)
- Response parsed with `JSON.parse()` after stripping stray backticks

## Key URLs

- **CTA:** https://globallivingnetwork.com/contact-us/
- **Newsletter:** https://globallivingnetwork.com/subscribe/
- **Audience:** High-income families ($200K–$2M+), remote workers, retirees, entrepreneurs

## Conventions

- Each tool is a self-contained component in `src/tools/<tool-name>/`
- Tools should work as standalone iframe embeds for GLN's WordPress site
- Deep navy + warm gold palette across all tools
- Premium/editorial feel for high-income audience
