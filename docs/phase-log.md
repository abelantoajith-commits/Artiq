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


---

## Phase 4: Voice-to-Story

- **Status:** Completed
- **Date:** 2026-11-06
- **Tagline:** Every Artist Deserves to Be Seen.

### 1. What was built
- **Speech Spike & Architecture:**
  - Implemented hybrid speech input: client-side Web Speech API (`SpeechRecognition`) provides streaming zero-latency speech recognition in Malayalam (`ml-IN`) and Indian English (`en-IN`).
  - Added multimodal audio transcription endpoint at `/api/ai/transcribe` utilizing Gemini 2.5 Flash for audio buffer processing.
- **Faithful Story Polishing:**
  - Created `/api/ai/story` route handler configured with `export const maxDuration = 60;`, Pino logging with request IDs, and Zod schema validation.
  - Enforced Non-Negotiable Rule 6 (Faithful Rewrite): Preserves the first-person voice and meaning, removes pauses/repetitions, and strictly forbids inventing dates, names, or unsaid facts.
  - Generates faithful translations between Malayalam and English based on the artist's preference.
- **VoiceButton Component (`components/artiq/VoiceButton.tsx`):**
  - Integrated directly inside text fields without cluttering global navigation.
  - Active recording state: Turmeric border (`border-story`), live countdown timer (capped at 2 minutes), animated bouncing sound-wave bars, and big red Stop button.
  - Spoken and target language toggles: Malayalam (മലയാളം) and English.
  - Side-by-side review interface: "What you said" (verbatim transcript) next to "Polished version" (verdigris AI suggestion badge).
  - Actions: "Use this story", "Edit", and "Record again".
- **Integrated Across App Flows:**
  - In `components/artiq/CreateDraftForm.tsx`: "Your Story" textarea equipped with VoiceButton.
  - In `app/create/page.tsx`: Activated third action "Tell your story (Voice)" allowing voice-first artwork creation.
  - In `components/artiq/EditProfileForm.tsx`: Integrated VoiceButton into Artist Bio, Specialities & Art Forms, and My Art Journey.

### 2. Demo & Test Checklist
- [x] `npm run lint` passes with 0 errors and 0 warnings.
- [x] `npm run build` compiles all dynamic and static routes cleanly.
- [x] Microphone recording captures audio with live waveform animation and timer.
- [x] Speaking in Malayalam produces Malayalam transcript and faithful polished output.
- [x] Output language can be translated to English while maintaining first-person tone.
- [x] Verified zero unsaid facts or dates are added by the AI rewrite.
- [x] Voice stories can be used directly in Edit Profile and Create Artwork flows.


---

## Create Flow UX Streamlining (UX Change Request)

- **Status:** Completed
- **Date:** 2026-11-07
- **Tagline:** Every Artist Deserves to Be Seen.

### 1. What was built
- **Merged "Visual Description" and "Story" into ONE field:**
  - Replaced separate Description and "Your story" fields on Create flow with a single "About this artwork" textarea styled in Newsreader serif with an integrated mic button.
  - Automatically pre-filled with the AI's visual observation upon photo analysis, tagged with an "AI suggestion" badge. Editing or accepting immediately clears the badge.
  - Artist can speak via mic: transcript and AI visual description are merged in a single step into polished first-person text. Reviewed with one primary "Use this" button plus "Edit" and "Record again".
  - Strictly enforced Product Safety Rule 6: Spoken words lead in first-person voice. AI visual details only support. Artist wins any conflict. Never adds unsaid cultural origin, tradition, age, authenticity, technique, facts, names, or dates.
  - Extended `/api/ai/story` to handle `{ transcript, visualDescription, targetLanguage }` with `artworkTextMergeSchema`.
  - Updated artwork detail modal and page (`app/artwork/[id]/page.tsx`) to show this unified text under "About this artwork" in Newsreader serif.
- **Removed 3 Fields from Create Flow:**
  - Removed `art_form`, `materials`, and `technique` from the create-artwork form, `publishArtworkSchema` in `app/create/actions.ts`, and artwork detail modal/page.
  - Kept "Art forms and specialities" intact in `EditProfileForm` on the artist's profile.
  - Enhanced search in `HomeGallery` to index `title`, `description` (About text), `categories` (IDs and labels), `keywords`, `hashtags`, and artist's `display_name` + `specialities`.
- **Categories: 5 Suggestions + "+" Drawer:**
  - Centralized fixed taxonomy in `lib/categories.ts` (`CATEGORY_TAXONOMY`, `VALID_CATEGORY_IDS`, `DEFAULT_SUGGESTED_CATEGORIES`).
  - Multimodal AI analysis now returns exactly 5 suggested category IDs from the taxonomy. Top suggestion is pre-selected.
  - Added "+" chip opening a mobile Drawer (desktop Dialog) via `CategoryPickerDrawer` using `vaul` and `cmdk` with full category list, search box, and Traditional Art subcategory grouping.
  - At least one category required to publish.
- **Database Migration:**
  - Created `supabase/migrations/20261107_merge_story_streamline_artworks.sql`: Merges existing `story` into `description` (`story || E'\n\n' || description`), drops `art_form`, `technique`, `materials`, `story`, and keeps `categories text[]`.
  - Migrated all 20 artworks in `data/seed-data.json`.
  - Updated TypeScript interface `Artwork` in `types/art.ts`.
- **Docs:**
  - Updated `prd.md`, `design.md`, `plan.md`, `docs/api-notes.md`, and `docs/phase-log.md`.

### 2. Demo & Test Checklist
- [x] `npm run build` compiles all dynamic and static routes cleanly in ~2s.
- [x] Picking a photo displays only: Image, Title (with 3 suggestions), "About this artwork" (with mic), 5 category chips + "+", and Publish.
- [x] 2-tap fast path verified: Photo -> Publish.
- [x] Voice path verified: Photo -> Mic -> Speak -> "Use this" -> Publish.
- [x] Search across Home gallery matches title, About text, category labels, and artist specialities.


---

## Phase 4.5: Demo Login, Empty Profile Onboarding & AI Identity Builder

- **Status:** Completed
- **Date:** 2026-11-07
- **Tagline:** Every Artist Deserves to Be Seen.

### 1. What was built
- **Demo Login (`signInAsDemoAction`):**
  - Integrated Supabase anonymous authentication (`supabase.auth.signInAnonymously()`) with automatic `@supabase/ssr` cookie persistence.
  - Prominent "Try demo" button on login screen (`app/(auth)/login/page.tsx`) with zero forms, logging in instantly and redirecting to Home `/`.
  - Database trigger and fallback upsert automatically provisions a demo profile row with empty identity fields, `is_demo = true`, and placeholder handle (`Demo artist 4b21`).
  - Added honest "Demo mode" chip on the profile, plus "Start over" action (`resetDemoProfileAction`) clearing fields and answers for repeated demo rehearsals.
  - Added cleanup SQL snippet in migration and docs for deleting demo users older than 24 hours.
- **Empty Profile State (`app/profile/page.tsx`):**
  - Detects when an artist has no bio, journey, inspiration, intro, and specialities.
  - Shows avatar placeholder, "Your profile is empty", primary CTA "Create your profile" (navigates to `/profile/interview`), and secondary link "Fill it in myself" (navigates to `/profile/edit`).
  - Visitors viewing another artist's empty profile see "This artist hasn't added a profile yet" without any create button.
- **AI Identity Interview (`/profile/interview`):**
  - 6 fixed questions in `lib/identity/questions.ts` with English & Malayalam text.
  - Question-by-question layout with progress dots, Back, Skip, Next, and bilingual language selector.
  - Voice-to-text directly embedded via `VoiceButton` with speech recognition in Malayalam and English.
  - Auto-saving after every answer to `profile_interview_answers` (with owner-only RLS), preventing loss of progress on page refresh.
- **AI Identity Builder (`/api/ai/identity`):**
  - Configured with `export const maxDuration = 60;`, structured Pino logging, and Gemini 2.5 Flash model cascade.
  - Returns structured JSON validated with Zod: `{ intro, bio, journey, specialities, inspiration, missing, unclear, basedOn }`.
  - Enforced Non-Negotiable Rule 6: Spoken answers are the sole source of truth in first-person voice. Zero invented facts, dates, awards, or cultural claims.
  - Resilient fallback (`createRawIdentityFallback`): If Gemini fails or times out, maps raw answers directly so the artist is never blocked.
- **Review & Publish Screen (`/profile/review`):**
  - 5 editable sections with "AI suggestion" badges, mic buttons to re-speak, and collapsible "What you said" source expanders.
  - Clarification inputs for any ambiguous items in `unclear`.
  - "Publish profile" action updates `profiles` and navigates to the populated Profile tab with a success toast.

### 2. Demo & Test Checklist
- [x] `npm run build` compiles with zero errors and zero warnings.
- [x] Tap "Try demo" on login screen logs in anonymously and lands on Home.
- [x] Tapping Profile tab reveals the empty profile state with "Create your profile" button.
- [x] Interview navigates through 6 questions, auto-saving each answer.
- [x] Voice and typing both work seamlessly; refresh retains saved answers.
- [x] AI Identity Builder outputs structured profile matching the Zod schema with zero unsaid facts.
- [x] Review screen allows editing, re-speaking, and publishing to profile.
- [x] "Start over" button clears demo data and resets the interview.
