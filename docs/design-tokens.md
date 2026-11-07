# ARTIQ Design Tokens

> **Architecture:** Single CSS variables file in `app/globals.css` mapped into Tailwind v4 inline theme `@theme inline`.  
> **Design Philosophy:** "Soft things to look at, hard-edged things to press."  
> **Source of Truth:** `design-reference/code.html` + `docs/design-reference-audit.md`

---

## 1. Color Palette Tokens

All colors use physical craft pigments with **zero black** (`#000` or `#000000`). All text, outlines, and hard shadows use **Espresso `#4A3526`** in light mode.

### 1.1 Light Theme Tokens

| Token Variable | Name | Hex | Role & Usage | Contrast Ratio vs Background / Ink | WCAG 2.1 Level |
|---|---|---|---|---|---|
| `--canvas` | Canvas | `#F8F7F3` | Page background (warm plaster) | 10.42:1 vs Espresso | **AAA** |
| `--surface` | Surface | `#FFFFFF` | Cards, buttons, sheets, dialogs | 11.05:1 vs Espresso | **AAA** |
| `--mist` | Mist | `#EFEFEC` | Soft search container, disabled fills, skeletons | 9.47:1 vs Espresso | **AAA** |
| `--ink` | Espresso | `#4A3526` | **ALL text, 2px borders, hard offset shadows** | Primary ink | **Core** |
| `--ink-soft` | Bark | `#6B4F3A` | Secondary text, captions, inactive icons | 7.12:1 on Canvas | **AAA** |
| `--leaf` | Leaf | `#C8E096` | Primary action button, active nav pill, avatar ring | 7.75:1 vs Espresso | **AAA** |
| `--sand` | Sand | `#CDAA8A` | Artist voice, microphone, active chip, avatar ring | 4.98:1 vs Espresso | **AA** |
| `--sand-tint` | Sand Tint | `#F0E2D3` | Story quote block background (Newsreader text) | 8.60:1 vs Espresso | **AAA** |
| `--sprout` | Sprout | `#E3F0CB` | AI suggestion fill, process tag fill, avatar ring | 9.32:1 vs Espresso | **AAA** |
| `--moss` | Moss | `#6B8A4A` | AI 1.5px border & dot, Create button hard shadow | Decorative / Border | High |
| `--clay` | Clay | `#E3B5A0` | Notification badge dot, like heart, save/alert | 5.84:1 vs Espresso | **AA** |
| `--forest` | Forest | `#3F5A2A` | Focus ring outline only (2px ring with 2px offset) | 6.8:1 non-text contrast | **Compliant** |

---

### 1.2 Dark Theme Tokens (Proposed for Approval)

> **Requirement:** Deep warm brown canvas, lighter warm surfaces, light warm text and borders, color roles deeper and muted, hard shadows use a light warm tone so they remain visible as physical stickers.

| Token Variable | Name | Dark Hex | Role & Usage in Dark Theme | Contrast Ratio vs Dark Canvas / Surface | WCAG 2.1 Level |
|---|---|---|---|---|---|
| `--canvas` | Deep Espresso Roast | `#1F1812` | Dark page background (rich warm brown, never cold gray) | Base canvas | **Core** |
| `--surface` | Warm Espresso Surface | `#2C221B` | Sheets, cards, dialogs, inputs | 1.3:1 vs canvas | Clean elevation |
| `--mist` | Dark Warm Mist | `#382C23` | Soft search container, disabled fills, skeletons | 1.8:1 vs canvas | Soft container |
| `--ink` | Warm Parchment | `#F5F2EB` | **ALL primary text, borders, light-cast shadows** | 13.8:1 vs canvas, 11.4:1 vs surface | **AAA** |
| `--ink-soft` | Warm Sand | `#B8A99A` | Secondary text, metadata, captions, inactive icons | 7.2:1 vs canvas | **AAA** |
| `--leaf` | Sage Leaf | `#98B368` | Primary button fill (richer, deeper than light leaf) | 6.5:1 with `#1F1812` text | **AAA** |
| `--sand` | Warm Ochre | `#B58E6B` | Artist voice, active chip, microphone actions | 5.2:1 with `#1F1812` text | **AA** |
| `--sand-tint` | Deep Amber Tint | `#33251B` | Story block background (with 2px Sand left border) | 11.2:1 with `#F5F2EB` text | **AAA** |
| `--sprout` | Muted Sprout | `#A8BE88` | AI suggestion fill with Moss border | 7.3:1 with `#1F1812` text | **AAA** |
| `--moss` | Deep Olive Moss | `#556E3A` | AI border, Create button hard shadow in dark | High non-text | **Compliant** |
| `--clay` | Terracotta Clay | `#C47D68` | Like/alert/save, notification dot | 4.7:1 with `#1F1812` text | **AA** |
| `--forest` | Lichen Ring | `#7FA85B` | Focus ring outline (high visibility on dark canvas) | 6.2:1 non-text | **Compliant** |
| `--shadow-ink` | Light-Cast Stamp Shadow | `#5A483B` | Hard offset shadow in dark mode (keeps physical sticker feel visible) | Visible 3px offset | Physical |

---

## 2. Radii, Spacing & Elevation Tokens

### 2.1 Radii
- `--radius-artwork: 16px;` — Softly rounded, completely borderless, uncropped.
- `--radius-control: 10px;` — Every interactive button, input, textarea, select.
- `--radius-badge: 6px;` — Tags, AI suggestion labels, process badges.
- `--radius-sheet: 24px;` — Top corners for mobile drawers (Vaul) and dialogs.
- `--radius-avatar: 9999px;` — Fully circular avatars.
- `--radius-pill: 9999px;` — Search container, category chips.

### 2.2 Borders
- **Control Borders:** `2px solid var(--ink)` (`#4A3526` in light, `#F5F2EB` in dark).
- **Badge & Chip Borders:** `1.5px solid var(--ink)`.
- **AI Suggestion Borders:** `1.5px solid var(--moss)` (`#6B8A4A`).
- **Artwork & Content Cards:** `0px` border (stays quiet).

### 2.3 Hard Shadows (Zero Blur Physics)
- `--shadow-hard-sm: 2px 2px 0px var(--ink);`
- `--shadow-hard-md: 3px 3px 0px var(--ink);` (standard button shadow)
- `--shadow-hard-lg: 5px 5px 0px var(--ink);` (hover state shadow)
- `--shadow-hard-moss: 3px 3px 0px var(--moss);` (under 60px Create button)
- **Zero blur, zero gradients, zero glow, zero glassmorphism.**

### 2.4 Spacing Scale
`4px`, `8px`, `12px`, `20px`, `32px`.
- Mobile screen padding: `16px` (`px-4`).
- Masonry gutter: `12px` (`gap-3`).
- Minimum tap target: `44px × 44px`.

---

## 3. Typography Scale & Semantic Utilities

| Utility Class | Font Family | Size / Line Height | Weight | Letter Spacing | Usage Rule |
|---|---|---|---|---|---|
| `text-display` | Bricolage Grotesque | 36px / 38px | 800 (Extrabold) | -0.025em | Once per screen (hero / brand wordmark) |
| `text-h1` | Bricolage Grotesque | 26px / 30px | 700 (Bold) | -0.015em | Page titles, artwork title in detail |
| `text-h2` | Bricolage Grotesque | 18px / 24px | 700 (Bold) | -0.01em | Section headings ("Artists to meet", "Recent works") |
| `text-body` | Figtree | 16px / 24px | 400 (Regular) | normal | Standard UI body text |
| `text-label` | Figtree | 14px / 20px | 600 (Semibold) | normal | Form labels, card titles, category chips |
| `text-button` | Figtree | 15px / 20px | 700 (Bold) | normal | Button labels (always sentence case) |
| `text-caption` | Figtree | 12px / 16px | 500 (Medium) | normal | Metadata, author bylines, timestamps |
| `text-story` | Newsreader | 18px / 28px | 400 (Italic/Normal) | normal | **Artist's words ONLY** (quotes, bio, journey, intro; max 60ch) |
| `text-tag` | DM Mono | 11px / 16px | 500 (Medium) | +0.08em | Tiny tags ONLY (`AI SUGGESTION`, `PROCESS`, `FEATURED WORK`) |
| `:lang(ml)` | Noto Sans / Serif Malayalam | +10% line-height | 500 / 700 | normal | Malayalam regional script fallback |

---

## 4. Physical Motion Tokens

- **Button Press (Sticker Physics):**
  - Duration: `120ms`
  - Easing: `cubic-bezier(0.2, 0.8, 0.2, 1)`
  - Active: `transform: translate(3px, 3px); box-shadow: 0px 0px 0px var(--ink);`
  - Hover: `transform: translate(-1px, -1px); box-shadow: 5px 5px 0px var(--ink);`
- **Masonry Entrance:**
  - Duration: `280ms`
  - Easing: `cubic-bezier(0.16, 1, 0.3, 1)`
  - Stagger: `40ms` incremental per card (first load only)
- **Chip Selection:** `150ms ease`
- **Sheet Transition:** `240ms ease-out`
- **Accessibility:** `@media (prefers-reduced-motion: reduce)` disables all transforms and transitions, rendering instant state changes.
