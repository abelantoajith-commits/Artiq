# ARTIQ: Phase Log

Continuous log of phase deliverables, deployment status, architecture decisions, and demo walkthroughs.

---

## Phase 0: Foundation and First Deploy

- **Status:** Completed
- **Date:** 2026-11-06
- **Tagline:** Every Artist Deserves to Be Seen.

### 1. What was built
- Initialized Next.js 16 (App Router) + TypeScript + Tailwind CSS with ESLint and Prettier.
- Configured shadcn/ui base with clean token mapping in `app/globals.css`.
- Configured Google Fonts via `next/font/google`: Figtree (UI), Newsreader (Serif story), and Malayalam fallbacks (Noto Sans Malayalam, Noto Serif Malayalam).
- Configured `.env.example`, `.env.local`, and strictly-validated `lib/env.ts` using Zod (including security guards preventing server secret exposure under `NEXT_PUBLIC_`).
- Implemented structured logging in `lib/logger.ts` with Pino (child logger support, redaction of sensitive credentials, development `pino-pretty`, production JSON) and a lightweight browser logger in `lib/client-logger.ts`.
- Configured Supabase browser and server clients in `lib/supabase/` using `@supabase/ssr`.
- Built `/api/health` route handler reporting application status, uptime, duration in milliseconds, and a Supabase ping with request ID tracking.
- Built the mobile-first App Shell with fixed 3-button navigation (`Home`, raised Indigo `Create (+)`, `Profile`) and desktop left rail matching `design.md`.
- Placeholder screens implemented for `/` (Home), `/create` (Create sheet preview), and `/profile` (Profile preview).
- Configured `next.config.ts` with `images.remotePatterns` for Supabase Storage domains.
- Documented verified API endpoints in `docs/api-notes.md`.

### 2. Vercel & Runtime Limits Noted
- **Payload Limit:** 4.5 MB request/response body cap on Vercel Serverless Functions. Direct-to-Supabase client upload will be used in Phase 3.
- **Function Execution Time (`maxDuration`):**
  - Hobby default is 10s (max 60s without Fluid compute).
  - Vercel Fluid Compute allows extended executions (up to 300s on Pro / Fluid).
  - For AI endpoints in Phase 3 & 4, `export const maxDuration = 60;` will be configured, with retry logic and client progress reporting.
- **Stateless Environment:** Local disk writes strictly prohibited (only `/tmp` if ephemeral). State persisted solely in Supabase.

### 3. Decisions Made
- Next.js App Router route handlers are used for all backend endpoints without an auxiliary Node server.
- Pino logger is kept server-side to avoid bundling Node.js stream internals to the browser; a lightweight custom wrapper `clientLogger` is provided for client components.
- Default light palette with Kerala mural-inspired pigment accents (Indigo `--primary`, Turmeric `--story`, Verdigris `--ai`, Madder `--danger`).

### 4. Demo & Test Checklist
- [x] `npm run build` passes with zero type or lint errors.
- [x] App shell renders at 390px mobile viewport with fixed 3-button bottom bar and minimum 44px tap targets.
- [x] Desktop viewport renders slim left rail navigation.
- [x] `/api/health` returns status 200 with request ID, duration, and Supabase connectivity check.
- [x] Pino log output formats with request ID and redaction.

### 5. Known Issues / Next Phase Handoff
- Supabase tables will be created in Phase 2 migrations (`profiles`, `artworks`, `categories`, `saves`, `likes`).
- Phase 1 will implement the static Home masonry grid, category chips, and seed data.



---

## Phase 1: Design System and Static Home

- **Status:** Completed
- **Date:** 2026-11-06
- **Tagline:** Every Artist Deserves to Be Seen.

### 1. What was built
- Implemented full design tokens and color palette from `design.md`: Canvas, Surface, Ink, Primary Indigo, Story Turmeric, AI Verdigris, and Danger Madder.
- Built zero-flash Dark/Light theme switching with `next-themes` and `ThemeProvider` in `app/layout.tsx`.
- Created comprehensive seed dataset in `data/seed-data.json` with 5 authentic artists (Kerala mural, Kasavu handloom, Lost-wax bronze, Madhubani folk art, and Malabar terracotta) and 20 detailed artworks with preserved dimensions and stories.
- Created `components/artiq/TopBar.tsx`: ARTIQ branding, search trigger, notification placeholder, and theme toggle.
- Created `components/artiq/CategoryChips.tsx`: Horizontally scrollable chip filter matching PRD categories with 44px min tap targets.
- Created `components/artiq/FeaturedArtistsRow.tsx`: Horizontally scrollable avatars, names, and specialties with active filter selection.
- Created `components/artiq/ArtworkCard.tsx`: Aspect-ratio preserving card with `next/image`, story indicator badge in turmeric, and like/save/share actions.
- Created `components/artiq/MasonryGrid.tsx`: Responsive column-balanced masonry layout (2 columns at 390px mobile, 3 on tablet, 4 on desktop) without layout shifts.
- Created `components/artiq/ArtworkDetailModal.tsx`: Uncropped artwork zoom dialog displaying the artist's story in Newsreader serif typography, materials, technique, and profile card.
- Updated `app/page.tsx` with dynamic category filtering, artist filtering, and "Load More" pagination.

### 2. Decisions Made
- Column heights in `MasonryGrid` are calculated using `height / width` aspect ratios, greedily inserting cards into the shortest column. This prevents visual imbalance without external masonry layout libraries.
- The artwork is never cropped in the masonry gallery or the detail modal. Only profile grids allow square crops per PRD.

### 3. Demo & Test Checklist
- [x] `npm run lint` passes with 0 errors and 0 warnings.
- [x] `npm run build` compiles static pages with 0 errors.
- [x] 2-column layout renders cleanly at 390px mobile width with 44px tap targets.
- [x] Desktop left rail and 4-column layout render on large screens.
- [x] Tapping any artwork opens the uncropped detail modal with the artist's story in Newsreader serif.
- [x] Category filtering and artist filtering work instantaneously.
- [x] Dark mode toggles cleanly and preserves contrast.
