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


---

## Phase 2: Auth, Database and Profiles

- **Status:** Completed
- **Date:** 2026-11-06
- **Tagline:** Every Artist Deserves to Be Seen.

### 1. What was built
- Created full SQL schema migration in `supabase/migrations/20261106_phase2_schema.sql` covering `profiles`, `artworks`, `categories`, `saves`, `likes`, foreign keys, cascade rules, indexes, and storage buckets (`artworks`, `avatars`).
- Configured PostgreSQL Row Level Security (RLS) on all tables: public read on published artworks/profiles, owner-only update/delete enforced by `auth.uid() = id`.
- Built automatic user provisioning trigger `handle_new_user()` in Postgres creating a `profiles` row upon `auth.users` registration.
- Configured Supabase session middleware in `middleware.ts` and `lib/supabase/middleware.ts` for cookie refresh and token synchronization.
- Created `app/(auth)/actions.ts` with Zod validation and Pino logging for `signUpAction`, `signInAction`, `signOutAction`, and `updateProfileAction`. Credentials and tokens are redacted.
- Built accessible authentication screens with AA contrast and ≥44px tap targets: `app/(auth)/login/page.tsx` and `app/(auth)/register/page.tsx`.
- Built authenticated artist profile at `app/profile/page.tsx`:
  - Signed-out state: clear value proposition inviting visitors to sign up or log in.
  - Signed-in state: avatar, display name, username, bio, location, specialties chips, art journey in Newsreader serif, Instagram-style 3-column square artwork grid, saved count, and logout.
- Built profile editing screen at `app/profile/edit/page.tsx` allowing artists to update their name, location, bio, specialities, and story journey.
- Built public artist portfolio at `app/artist/[username]/page.tsx` shareable with art lovers without requiring sign-in.
- Converted `app/page.tsx` to a Server Component connecting directly to Supabase PostgREST queries with seamless seed data fallback.

### 2. Decisions Made
- Server Actions handle form mutations with `revalidatePath` to keep client cache in sync without manual refetches.
- Graceful fallback: If Supabase has no data or is pending cloud migration, `app/page.tsx` seamlessly falls back to `seed-data.json`, ensuring the app never shows a blank screen.

### 3. Demo & Test Checklist
- [x] `npm run lint` passes with 0 errors and 0 warnings.
- [x] `npm run build` compiles all dynamic and static routes cleanly.
- [x] `/register` creates a user and auto-generates profile.
- [x] `/login` authenticates and routes to `/profile`.
- [x] `/profile` displays the 3-column square grid, bio, and journey.
- [x] `/profile/edit` saves updates with RLS protection.
- [x] Public artist route `/artist/[username]` opens without authentication.
- [x] RLS ensures only the profile owner can edit their record.


---

## Phase 3: Upload, AI Analysis and Publish (The Core Loop)

- **Status:** Completed
- **Date:** 2026-11-06
- **Tagline:** Every Artist Deserves to Be Seen.

### 1. What was built
- Built client-side image compression and direct-to-storage upload in `lib/storage/upload.ts` using `browser-image-compression`, enforcing the 4.5 MB Vercel Serverless Function payload limit.
- Extracted intrinsic artwork `width` and `height` before compression, storing exact proportions in Postgres so the masonry gallery and detail page never experience layout shift.
- Built `/api/ai/analyze` route handler configured with `export const maxDuration = 60;`, Pino structured logging with request IDs, and in-memory hash caching.
- Integrated official `@google/genai` SDK using `gemini-2.5-flash` with strict visual observation system prompt and Zod schema validation:
  - Generates 3 title suggestions, visual description, caption, hashtags, and category matches.
  - Strictly prohibits hallucinating cultural origin, authenticity, or history from photos alone (Rule 6).
  - Provides a safe observation baseline fallback so API outages or rate limits never block an artist from publishing.
- Built the interactive Create experience in `app/create/page.tsx`:
  - 3 equal-weight actions: "Take a Photo" (camera `capture="environment"`), "Upload from Gallery", and "Tell Your Story (Voice)" (badged for Phase 4).
  - Real-time progress and visual loading state with verdigris styling ("Looking at your artwork…").
- Built `components/artiq/CreateDraftForm.tsx`:
  - Uncropped preview with natural aspect ratio.
  - 3 tappable AI title suggestions (one-tap selection).
  - Editable description and caption with verdigris "AI suggestion" badges that clear upon user edit.
  - "Your Story" section in Turmeric Newsreader serif typography.
  - "Details Only You Know" section (Art Form, Technique, Materials) intentionally left blank for authentic artist entry.
  - Sticky bottom actions bar with "Publish to Gallery" and "Save draft".
- Implemented `publishArtworkAction` in `app/create/actions.ts` saving published works to the Supabase `artworks` table and revalidating cache paths.
- Built the permanent artwork detail view in `app/artwork/[id]/page.tsx` displaying the uncropped artwork, the artist's story in Newsreader serif, technique, materials, and artist card.

### 2. Vercel & Safety Compliance
- **Vercel 4.5 MB Limit:** Upheld by direct client-to-Supabase Storage upload; `/api/ai/analyze` receives only the file path/URL.
- **Serverless Timeouts:** `export const maxDuration = 60;` declared on `/api/ai/analyze`.
- **AI Content Safety:** AI describes strictly visual elements; cultural origin, authenticity, and history remain exclusively artist-provided.

### 3. Demo & Test Checklist
- [x] `npm run lint` passes with 0 errors and 0 warnings.
- [x] `npm run build` compiles all dynamic and static routes cleanly.
- [x] Camera and gallery upload triggers image compression and direct Supabase upload.
- [x] `/api/ai/analyze` returns structured observation-only JSON draft with 3 title suggestions.
- [x] Every draft field is editable, and editing clears the "AI suggestion" badge.
- [x] Publishing inserts row into `artworks` and redirects to `/artwork/[id]`.
- [x] Artwork immediately appears in the Home masonry grid and on the artist's profile.
