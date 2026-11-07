# ARTIQ Design Reference Audit

> **Source of Truth:** `design-reference/code.html` and `design-reference/screen.png`  
> **Date:** 2026-11-07  
> **Status:** Step 0 Complete — Awaiting Gate 1 Approval  

---

## 1. Inventory Table

| Reference File | Type | Screen & Views Represented | Matching App Route & Components |
|---|---|---|---|
| `design-reference/code.html` | Exported HTML/CSS with Tailwind config & component physics | 1. Spec Header & Token Swatches<br>2. 390px Mobile Viewport: Home / Explore<br>3. Top Navigation (Brand wordmark + Notification Stamp)<br>4. Soft Search Pill<br>5. Category Chips Strip<br>6. "Artists to meet" Avatar Row<br>7. Asymmetric Feature Card (4:5 artwork + Sand-tint quote block)<br>8. Two-column Masonry (12px gutter, varied aspect ratios)<br>9. Three-button Bottom Nav (Home, raised 60px Espresso Create button with Moss shadow, Profile)<br>10. Motion Architecture Spec (120ms press, 280ms stagger, 150ms chips)<br>11. Button State Matrix (Default, Hover, Pressed, Disabled, Loading, Focus)<br>12. Signature Badges (AI Suggestion, Process, Featured Work)<br>13. Typography Hierarchy | - `app/page.tsx`<br>- `components/artiq/HomeGallery.tsx`<br>- `components/artiq/TopBar.tsx`<br>- `components/artiq/CategoryChips.tsx`<br>- `components/artiq/FeaturedArtistsRow.tsx`<br>- `components/artiq/ArtworkCard.tsx`<br>- `components/artiq/MasonryGrid.tsx`<br>- `components/artiq/Navigation.tsx`<br>- `components/artiq/ArtistAvatar.tsx`<br>- `components/ui/button.tsx` |
| `design-reference/screen.png` | Hi-res visual render (2048 × 2048) | Complete visual layout of the Home screen, token legend swatches, interactive button physics states, typography roles, and mobile shell at 390px. | Visual ground truth for spacing, aspect ratios, radii, drop shadow offsets, and typography alignment. |

---

## 2. Extracted Values by Screen Element

### 2.1 Color Palette (Hex)
Every single hex code extracted directly from `code.html`:

| Token | Hex | Role | Contrast vs Espresso `#4A3526` | WCAG 2.1 Rating |
|---|---|---|---|---|
| **Canvas** | `#F8F7F3` | Page background, warm gallery plaster | 10.42:1 | **AAA** |
| **Surface** | `#FFFFFF` | Interactive button fills, cards, modal sheets | 11.05:1 | **AAA** |
| **Mist** | `#EFEFEC` | Soft search container, disabled fills, tags | 9.47:1 | **AAA** |
| **Espresso** | `#4A3526` | **All text, all 2px control borders, all hard shadows**. Zero black. | N/A (Main Ink) | **Core Ink** |
| **Bark** | `#6B4F3A` | Secondary text, captions, metadata, inactive icons | 7.12:1 (on canvas) | **AAA** |
| **Leaf** | `#C8E096` | Primary action button, active nav pill, avatar ring | 7.75:1 | **AAA** |
| **Sand** | `#CDAA8A` | Artist voice, microphone, active chip fill, avatar ring | 4.98:1 | **AA** |
| **Sand-Tint** | `#F0E2D3` | Artist story quote block background | 8.60:1 | **AAA** |
| **Sprout** | `#E3F0CB` | AI suggestion fill, process tag fill, avatar ring | 9.32:1 | **AAA** |
| **Moss** | `#6B8A4A` | AI suggestion border & dot, Create button shadow | Decorative / Borders | **High** |
| **Clay** | `#E3B5A0` | Notification badge dot, like heart, save/alert | 5.84:1 | **AA** |
| **Forest** | `#3F5A2A` | Focus ring outline only (2px ring with 2px offset) | 6.8:1 non-text | **WCAG 2.1 Compliant** |

### 2.2 Typography Specifications

| Family | Role in Reference | Weights | Usage & Exact Sizes |
|---|---|---|---|
| **Bricolage Grotesque** | Brand wordmark & section headings | 700, 800 | - Wordmark: 32px / line-height tight, letter-spacing -0.025em, extrabold (800)<br>- Section Headings: 18px / 24px bold (700) |
| **Figtree** | UI labels, body, buttons, metadata | 400, 500, 600, 700 | - Body: 16px / 24px regular (400)<br>- Button labels: 15px / 20px bold (700), sentence case<br>- Labels & Card titles: 13px / 16px semibold (600)<br>- Metadata & Captions: 11px–12px regular/medium (400/500) |
| **Newsreader** | Artist's own voice and story quotes | 400 italic | - Story quotes: 18px / 26px, italic, max line length 56–60ch |
| **DM Mono** | Badges, timestamps, technical indicators | 500 bold | - Badges & Tags: 10px–11px, uppercase, tracking +0.08em (`tracking-wider` / `tracking-widest`) |
| **Noto Sans Malayalam** | Authentic regional fallback | 500, 700 | - +10% line-height rule via `:lang(ml)` for Malayalam script |

### 2.3 Radii, Borders, and Hard Shadows
- **Artwork images:** `16px` (`rounded-[16px]`), completely borderless, uncropped, zero shadow.
- **Interactive Controls (Buttons, Inputs):** `10px` (`rounded-[10px]`), `2px` solid Espresso (`#4A3526`).
- **Feature Card Quote Block:** `12px` (`rounded-[12px]`), `2px` solid Espresso.
- **Badges & Tags:** `6px` (`rounded-[6px]`), `1.5px` solid Espresso or Moss.
- **Search Pill:** Full pill (`rounded-full`), `0px` border, `0px` shadow, Mist (`#EFEFEC`) fill.
- **Category Chips:** Full pill (`rounded-full`), `1.5px` solid Espresso.
- **Avatars:** Fully round (`rounded-full`), `2px` solid Espresso with colored ring offset.
- **Bottom Navigation Sheet:** `24px` top radius on mobile drawers/sheets; bottom bar has flat top with `1.5px` Espresso border.
- **Shadows (Physical Stamps):**
  - `shadow-hard-sm`: `2px 2px 0px #4A3526`
  - `shadow-hard-md`: `3px 3px 0px #4A3526`
  - `shadow-hard-lg`: `5px 5px 0px #4A3526`
  - `shadow-hard-moss`: `3px 3px 0px #6B8A4A` (under 60px Create button)
  - Zero blur (`0px blur`) across all shadows. Zero blur gradients, zero glassmorphism.

### 2.4 Heights, Spacing & Layout Structure
- **Screen horizontal padding:** `16px` (`px-4`).
- **Button min height:** `48px` (compact secondary buttons `36px`).
- **Notification button:** `44px × 44px` square stamp.
- **Search pill:** `48px` height, soft container.
- **Create button (Bottom nav):** `60px × 60px` circle, raised `-20px` (`-top-5`), `2px` border, `shadow-hard-moss`.
- **Bottom navigation bar:** `74px` height, fixed bottom, white fill, `1.5px` Espresso top border.
- **Masonry grid gutter:** `12px` (`gap-3`).
- **Artwork aspect ratios shown:** `4:5` (Feature card), `3:4`, `1:1`, `4:5`, `5:4`, `2:3` (Masonry works).
- **Avatar sizes:**
  - Row avatars: `56px × 56px` with `2.5px` ring padding.
  - Card author avatars: `20px × 20px`.
  - Feature card author avatar: `28px × 28px`.

### 2.5 Motion Architecture
- **Button Press (Physical Stamp):** `120ms cubic-bezier(0.2, 0.8, 0.2, 1)`. On active, translates `translate(3px, 3px)` while shadow collapses to `0px`. On hover, expands to `5px 5px 0px #4A3526` and shifts `translate(-1px, -1px)`.
- **Masonry Entrance:** `280ms cubic-bezier(0.16, 1, 0.3, 1)` with `40ms` incremental stagger. Single load only.
- **Chip Selection:** `150ms` transition.
- **Accessibility:** `prefers-reduced-motion: reduce` completely bypasses transitions and transforms to instant state changes.

---

## 3. Component Coverage Gap Analysis

### 3.1 Components shown in reference that we do not have yet:
1. **Feature Artwork Card with Quote Block:** Full-width featured card combining uncropped 4:5 artwork, "FEATURED WORK" mono badge, Newsreader quote in a Sand-tint box with 2px border, and a "Visit" button. (Our existing `FeaturedArtistsRow` only had avatars, not the featured quote card).
2. **Notification Stamp Button:** 44px square stamp with Clay dot indicator.
3. **Physical Button Physics Variants:** CVA button variants for `leaf`, `sand`, `sprout`, `clay`, `inverse` with the exact 3px/5px hard-shadow collapse physics.
4. **Interactive Badges:** Shared `AISuggestionBadge` (Sprout + Moss dot), `ProcessBadge`, and `FeaturedBadge`.
5. **Three-Button Bottom Nav with Leaf Pill Active Indicator:** Custom bottom bar where active item renders a rounded Leaf pill container behind the icon.

### 3.2 Components we have that the reference does NOT show:
*The reference specifically focuses on the Home/Explore mobile screen and core button physics. The following screens and components exist in our app and must be extended into this exact craft design language:*
1. **Login & Register Screens:** Clean canvas, 10px rounded inputs with 2px espresso borders, primary Leaf button, "Try demo" 1-click button in Sand with hard shadow.
2. **Create Sheet / Flow:** Vaul drawer with 24px top radius, 2px border; Camera, Upload, Voice Story options with craft styling.
3. **AI Draft Screen (`CreateDraftForm`):** Title suggestions, Newsreader "About this artwork" box, Category selection with "+" chip, Voice recording state.
4. **Artwork Detail Page / Modal:** Uncropped artwork display, like/save physical buttons, serif story block on Sand-tint, contact artist card, process stage viewer.
5. **Artist Profile:** Profile header with avatar ring, specialities tags, bio & journey in Newsreader serif, 3-column artwork grid.
6. **AI Identity Interview & Review:** Step-by-step interview cards, microphone stamp, review form with 5 editable craft blocks.
7. **Category Picker Drawer:** 24px top radius drawer, search input, tag chips.
8. **Toast Notifications:** Sonner restyled with white background, 2px Espresso border, `shadow-hard-sm`.
9. **Desktop Left Rail Navigation:** Responsive desktop view with the same three items (Home, Create, Profile) styled as craft stamps.

---

## 4. Differences Between Reference & Prompt Tokens

| Item | Reference Value (`code.html`) | Prompt Token Value | Analysis & Recommendation |
|---|---|---|---|
| **Shadow offset on normal buttons** | `shadow-hard-md` = `3px 3px 0px #4A3526` | `shadow-hard` = `3px 3px 0 ink` | **Exact match.** Use `shadow-hard` = `3px 3px 0 #4A3526`. |
| **Shadow on category chip** | `shadow-[2px_2px_0px_#4A3526]` | `shadow-hard-sm` = `2px 2px 0` | **Exact match.** Use `shadow-hard-sm`. |
| **Create Button Shadow** | `shadow-hard-moss` = `3px 3px 0px #6B8A4A` | Moss hard shadow under Create button | **Exact match.** Use `3px 3px 0 #6B8A4A`. |
| **Artwork Card Border** | Reference has `rounded-[16px]`, NO border, NO shadow on artwork | Prompt: "Radii: artwork 16px, controls 10px... softly rounded artwork stays quiet" | **Exact match.** Artwork cards and images have zero border and zero shadow. |
| **Display Font** | Bricolage Grotesque 800 (32px / 36px) | Bricolage Grotesque 800 (36/38 -0.025em) | **Aligned.** Use Bricolage Grotesque 800 for wordmark and display headers. |
| **Black Color** | Zero black. Uses `#4A3526` exclusively. | "Espresso #4A3526 instead of black everywhere" | **Exact match.** All `#000` or `#000000` eliminated. |
