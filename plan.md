# ARTIQ: Build Plan

Companion to `prd.md` (what we build) and `design.md` (how it looks).
This file covers **how we build it**: working rules, stack, phases, logging and deployment.

---

## 1. Working rules (apply to every phase)

### Rule 1: Reuse open source, don't rebuild
- Before writing any feature, ask: "Is there a maintained open source library for this?"
- Prefer libraries over custom code. Prefer existing AI APIs over training anything.
- Every AI prompt we write for code generation must include this line:

> **"Maximise use of well-maintained open source libraries. Do not write custom code for anything a library already solves. List the libraries you chose and why."**

### Rule 2: Read the docs for every package, then give the endpoint to the code
For each package or API:
1. Open the official docs.
2. Find the exact **function or endpoint** we will use.
3. Write one line on what it does.
4. Paste the endpoint or function signature into the AI coding prompt, so code is generated from the real docs and not from guesses.
5. Record it in `docs/api-notes.md` (template below).

**`docs/api-notes.md` template**

| Package / API | Docs link | Endpoint or function | What it does | Used in |
|---|---|---|---|---|
| Supabase JS | (paste) | `supabase.auth.signUp()`, `signInWithPassword()` | Email sign-up and login | `/login` |
| Supabase JS | (paste) | `supabase.storage.from(bucket).upload()` | Upload image file | Create flow |
| Supabase JS | (paste) | `supabase.from('artworks').select()` / `.insert()` | Read and write rows through PostgREST | Gallery, publish |
| Gemini API | (paste) | `POST /v1beta/models/{model}:generateContent` | Send image or audio plus prompt, get text or JSON | `/api/ai/analyze`, `/api/ai/story` |
| Next.js | (paste) | Route Handlers (`app/api/.../route.ts`) | Server endpoints, keep secrets off the client | All `/api/*` |
| pino | (paste) | `pino()`, `logger.child()` | Structured logging | `lib/logger.ts` |

> The rows above are starting points from our current understanding. **Verify each one against the live docs before coding.** Model names, parameters and limits change.

### Rule 3: Logger first
Logging is built in Phase 0, before any feature. See section 5.

### Rule 4: Phases with visible outcomes
Every phase ends with something we can open on a phone, deployed to a preview URL. If a phase has nothing to show, it is split or merged.

### Rule 5: Deploy from day one
The very first commit is deployed. See section 6.

---

## 2. Stack decisions

| Layer | Choice | Why |
|---|---|---|
| Web app | **Next.js (App Router) + TypeScript** | Decided. One codebase for UI and API |
| Styling | **Tailwind CSS** | Required by shadcn/ui and the other component libraries |
| Components | **shadcn/ui** base, plus **Magic UI**, **Aceternity UI**, and ideas from **21st.dev** | See `design.md` |
| Backend | **Next.js Route Handlers** (no separate server) | Avoids running and deploying two services. Fewer moving parts for a student team |
| Database, Auth, Storage | **Supabase** | Postgres, auth, file storage and RLS in one service |
| AI vision and text | **Gemini API** (multimodal) | Image analysis and story polishing from one provider |
| Speech to text | Spike in Phase 4: Gemini audio input vs open source Whisper (for example through a hosted endpoint) vs browser Web Speech API | Pick by Malayalam accuracy |
| Validation | **zod** | Validate AI JSON and form input |
| Forms | **react-hook-form** with zod resolver | Standard shadcn pairing |
| Data fetching | **TanStack Query** | Caching, loading and error states |
| Logging | **pino** (server), small wrapper over `console` (client) | See section 5 |
| i18n | **next-intl** | English and Malayalam UI |
| Images | **browser-image-compression**, `next/image` | Smaller uploads, responsive display |
| Masonry | CSS columns first. **react-masonry-css** if we need ordering control | Avoid heavy custom layout code |
| Drawer, toasts, icons | **vaul** (via shadcn Drawer), **sonner**, **lucide-react** | Mobile-friendly bottom sheet for Create |
| Motion | **motion** (Framer Motion) | Used by Magic UI and Aceternity |
| Hosting | **Vercel** (app) + **Supabase Cloud** (data) | Required target. Free tiers, preview URL per branch. See section 6 for Vercel rules |
| Testing | Manual test checklist per phase, **Playwright** smoke test if time allows | Keep realistic |

---

## 3. Repository layout

```
artiq/
├─ app/
│  ├─ (public)/            # Home, artwork/[id], artist/[username]
│  ├─ (auth)/              # login, register
│  ├─ create/              # three-action Create sheet and flows
│  ├─ profile/             # own profile, edit, saved, settings
│  └─ api/
│     ├─ ai/analyze/route.ts
│     ├─ ai/story/route.ts
│     ├─ ai/transcribe/route.ts
│     └─ health/route.ts
├─ components/
│  ├─ ui/                  # shadcn/ui and copied Magic UI / Aceternity components
│  └─ artiq/               # ArtworkCard, MasonryGrid, VoiceButton, BottomNav...
├─ lib/
│  ├─ logger.ts
│  ├─ supabase/            # browser and server clients
│  ├─ ai/                  # gemini client, prompts, zod schemas
│  └─ env.ts               # validated env vars
├─ docs/
│  ├─ api-notes.md
│  └─ phase-log.md         # what was done per phase, demo link, issues
├─ prd.md  plan.md  design.md
└─ .env.example
```

---

## 4. Phases

Each phase lists **tasks**, the **visible outcome**, and a **done check**. Team size and timeline are unknown, so effort is in relative size (S, M, L). Adjust once we know our days.

### Phase 0: Foundation and first deploy (S)
**Tasks**
- Create repo, Next.js + TypeScript + Tailwind, install shadcn/ui.
- Set up ESLint, Prettier, `.env.example`, validated `lib/env.ts`.
- Build `lib/logger.ts` (section 5) and `/api/health`.
- Create Supabase project, connect to Vercel, add env vars and auth redirect URLs.
- Set the Vercel function region next to the Supabase region. Check Fluid compute and function limits.
- Deploy.

**Visible outcome:** a live URL showing the ARTIQ name, tagline and three-button bottom nav shell. `/api/health` returns OK, and logs appear in Vercel with request IDs.
**Done check:** the deployed link opens on a phone. Debug logs switch on with `LOG_LEVEL=debug`. The Vercel-ready checklist in section 6 passes, and Fluid compute and function limits are noted in `phase-log.md`.

### Phase 1: Design system and static Home (M)
**Tasks**
- Implement design tokens, fonts (including Malayalam), dark and light themes from `design.md`.
- Build `BottomNav` (Home, Create +, Profile), `TopBar`, `CategoryChips`, `ArtworkCard`, `MasonryGrid`.
- Create seed data JSON with about 20 artworks and 5 artists (with permission or placeholder images).

**Visible outcome:** Home looks like the real product, masonry grid of seeded artwork, scrollable categories, working navigation between the three tabs.
**Done check:** looks right at 390px and desktop. Lighthouse accessibility score checked.

### Phase 2: Auth, database and profiles (M)
**Tasks**
- Supabase schema and RLS from the PRD, migrations in the repo.
- Register, login, logout. Profile setup screen.
- Profile page (three-column grid) and Edit Profile (typing only for now).
- Move Home from seed JSON to database reads.

**Visible outcome:** a person registers on the live site, builds a profile, and sees it at `/artist/username`.
**Done check:** RLS verified: user A cannot edit user B's profile.

### Phase 3: Upload, AI analysis and publish (L). The core loop
**Tasks**
- Create sheet with three actions (voice action shows "coming next" for now).
- Image pick, compress, upload to Supabase Storage, save width and height.
- `/api/ai/analyze`: Gemini call with strict observation prompt, 3 title suggestions, 5 ranked taxonomy categories, and zod-validated JSON output.
- Streamlined editable draft screen: title (with 3 suggestions), "About this artwork", 5 category chips with top pre-selected + "+" drawer search, optional caption/tags. Publish. Artwork detail page.
- Removed separate art form, technique, and materials fields to minimize artist taps.
- Retry and error handling. Cache result by image hash.

**Visible outcome:** upload a photo, watch AI draft the listing, edit it, publish, and see it in Explore and on the profile. Fastest path: 2 taps from photo to published. **This is the minimum demo.**
**Done check:** 10 different test artworks produce usable drafts and none invents cultural facts.

### Phase 4: Voice-to-Story (L)
**Tasks**
- 1 day spike first: test Malayalam and English audio on the candidate speech options. Pick one and note the decision in `phase-log.md`.
- `VoiceButton` component (record, stop, waveform, timer).
- `/api/ai/transcribe` and `/api/ai/story` with the faithful-rewrite and merged-narrative prompt.
- Merged "About this artwork": speaking merges transcript + AI visual description into one polished narrative with one review step ("Use this", Edit, Record again). Spoken words are the source of truth and lead the text; visual details only support.
- Add the voice button to Edit Profile (bio, journey, specialities) and the "About this artwork" field. Enable "Tell Your Story (Voice)" in Create.

**Visible outcome:** an artist speaks in Malayalam, gets a polished English or Malayalam bio and artwork story, and publishes it.
**Done check:** at least 3 people record real samples. Faithfulness reviewed by a native speaker.

### Phase 4.5: Demo Login, Empty Profile Onboarding & AI Identity Builder (M)
**Tasks**
- Supabase anonymous sign-in (`signInAnonymously`) with prominent 1-click "Try demo" button on login screen.
- Auto-provisioning demo profile row with empty identity fields, `is_demo = true`, and placeholder handle.
- Empty Profile State on `/profile`: displays avatar placeholder, "Your profile is empty", "Create your profile" (initiating interview), and "Fill it in myself".
- Honest "Demo mode" chip on profile with "Start over" action that resets demo fields and interview answers.
- 6-question step-by-step interview in English & Malayalam (`/profile/interview`) with embedded `VoiceButton` and auto-saving to `profile_interview_answers`.
- `/api/ai/identity` route calling Gemini with strict first-person narrative formatting, zero invented facts/dates, and structured output.
- `/profile/review` screen: 5 editable sections with "AI suggestion" badges, source expanders ("What you said"), and "Publish profile" action.

**Visible outcome:** Tap "Try demo" on login, land on Home, open Profile, see the empty state, tap "Create your profile", answer the questions by voice or typing, watch Gemini build a structured profile, review it, and publish.
**Done check:** Full interview path completed with voice in Malayalam and English. Zero invented facts verified against 3 test answer sets. Owner-only RLS verified on `profile_interview_answers`.

### Phase 5: Polish and demo-ready (M)
**Tasks**
- Awwwards-inspired landing and motion pass (one hero moment, see `design.md`).
- Loading skeletons, empty states, error states, toasts.
- Seed real content, final copy, favicon, share cards (Open Graph image for artwork and artist pages).
- Edit and delete artwork. Account settings and language preference.
- Demo script and fallback recording.

**Visible outcome:** the full demo runs smoothly start to finish on production.
**Done check:** two full rehearsals with no live fixes.

> **Hackathon cut line:** Phases 0 to 5 are the MVP. If time is short, protect Phase 3 and 4 and trim Phase 5.

### Phase 6: Should-haves (M, only if time allows)
Search (Postgres full-text), category filters, saved artwork, likes, multilingual UI strings, shareable portfolio link.
**Visible outcome:** search bar returns artists and artworks. Heart and bookmark work.

### Future (post-hackathon)
Followers, notifications, comments, collections, recommendations, analytics.

---

## 5. Logger plan

**Goal:** at any moment we can see which function ran, how long it took, and why it failed.

### Server (`lib/logger.ts`, pino)
- Levels: `trace`, `debug`, `info`, `warn`, `error`. Controlled by `LOG_LEVEL` (default `info` in production, `debug` in development).
- Pretty output locally with `pino-pretty`. JSON in production so Vercel logs are searchable.
- A **child logger per module**: `const log = logger.child({ module: 'ai.analyze' })`.
- A **request ID** (`x-request-id`) attached to every API log line.
- **Redact** secrets and personal data: authorization headers, API keys, emails in debug dumps.

### What we log
| Event | Level | Fields |
|---|---|---|
| Route handler start and end | info | route, requestId, userId, durationMs, status |
| Function entry and exit in important flows | debug | function, inputs summary (sizes, ids, never raw secrets), outputs summary |
| Supabase call | debug | table or bucket, operation, rowCount, durationMs |
| AI call | info | model, task, input size, latency, success or failure |
| AI raw response | debug | response length and a truncated preview |
| Validation failure (zod) | warn | route, issues |
| Caught error | error | message, stack, requestId |

### Client
A tiny wrapper (`logger.debug/info/warn/error`) over `console`, enabled by `NEXT_PUBLIC_LOG_LEVEL`. Add a visible debug toggle in dev builds (for example `?debug=1`) that prints upload progress, recording state and API timings.

### Example

```ts
// lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  redact: ['req.headers.authorization', '*.apiKey', '*.password'],
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
});
```

```ts
// app/api/ai/analyze/route.ts (shape only)
const log = logger.child({ module: 'ai.analyze', requestId });
log.info({ imageBytes }, 'analyze: start');
const t0 = Date.now();
// ... call Gemini
log.debug({ preview: text.slice(0, 200) }, 'analyze: raw model response');
log.info({ durationMs: Date.now() - t0 }, 'analyze: done');
```

**Rule:** every new route handler and every external call gets logs before it is merged.

---

## 6. Vercel compatibility rules (the app must deploy on Vercel)

Vercel runs our API routes as serverless functions, so some things that work on a laptop fail there. These rules are mandatory from Phase 0.

| Constraint on Vercel | What we do |
|---|---|
| **Request and response bodies are capped at 4.5 MB.** Larger requests fail with `413 FUNCTION_PAYLOAD_TOO_LARGE`, and local testing never shows it | **Never send images or audio through our own API routes.** The browser uploads files **directly to Supabase Storage**. The route handler then receives only the file path or a short-lived signed URL and passes that to the AI. Compress images client-side as well |
| **Functions have a time limit** (`maxDuration`). Defaults and maximums depend on the plan and whether Fluid compute is enabled. Older projects without Fluid compute have a 10 second default on Hobby and a 60 second maximum | Check the project's Fluid compute setting in Phase 0 and note the limits in `phase-log.md`. Set `export const maxDuration = 60;` in the AI route files, and keep each AI call well under the limit. Show a progress state in the UI and add a retry button |
| **No persistent local disk.** Only `/tmp` is writable and it is wiped on cold starts | No file writes. Store everything in Supabase. Use in-memory handling for short-lived data |
| **Function bundle size limit** (250 MB uncompressed) | Avoid heavy server-side packages (for example no image-processing binaries on the server). Resize in the browser |
| **Cold starts and no long-lived state** | No in-memory caches we depend on. Cache AI results in the database (by image hash) |
| **Env vars are set per environment in Vercel** | `.env.example` lists every variable. `lib/env.ts` validates them at startup and fails with a clear log line |
| **Logs go to Vercel's log stream** | Use JSON logs in production. Use `pino-pretty` only in development, never in the production bundle |
| **Region latency** | Pick the Vercel function region closest to the Supabase region (for example Mumbai for both), set once in Vercel project settings |
| **Image optimisation needs allowed hosts** | Add the Supabase Storage host to `images.remotePatterns` in `next.config.ts` |
| **Auth redirect URLs** | Add production and preview URLs to Supabase Auth settings, or login fails on Vercel only |

### Vercel-ready checklist (run at the end of every phase)
- [ ] `npm run build` passes locally with no type or lint errors, and `npm run start` works.
- [ ] No route accepts a file body. Uploads go straight to Supabase Storage.
- [ ] Every AI route sets `maxDuration` and handles timeouts and retries.
- [ ] No `fs` writes outside `/tmp`. No server memory used as storage.
- [ ] All env vars exist in Vercel (Production and Preview). No secrets use `NEXT_PUBLIC_`.
- [ ] `images.remotePatterns` includes the Supabase host.
- [ ] Preview URL tested on a real phone, including login and upload.
- [ ] `/api/health` returns OK on the deployed URL.
- [ ] Logs for the new feature show up in Vercel's log stream.

### Direct-upload flow (replaces "send image to our API")
1. Browser compresses the image (`browser-image-compression`, target well under 1 MB).
2. Browser uploads to a Supabase Storage bucket using the signed-in session (RLS limits writes to the user's own folder).
3. Browser calls `POST /api/ai/analyze` with only `{ imagePath }` (a few bytes).
4. The server creates a signed URL or downloads the file from Storage, calls Gemini, validates with zod and returns JSON.
5. The same pattern is used for voice: upload the audio clip to Storage, then call `/api/ai/transcribe` with `{ audioPath }`. Cap recordings at a length that keeps the file small (for example 2 minutes).

> Docs to read before building this (record in `docs/api-notes.md`): Vercel "Functions limitations", Vercel "Configuring maximum duration", Supabase Storage "createSignedUrl" and "upload", and the Gemini docs on image and audio input.

---

## 7. Deployment plan (from the start)

| Item | Decision |
|---|---|
| App hosting | Vercel, connected to the GitHub repo |
| Database, auth, storage | Supabase Cloud project. A second project for staging only if time allows. Otherwise one project with careful migrations |
| Branching | `main` is production. Feature branches get automatic Vercel preview URLs |
| Environments | `.env.local` for development. Vercel env vars for preview and production |
| Secrets | `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` only on the server. Only the Supabase URL and anon key are `NEXT_PUBLIC_` |
| Migrations | SQL files in `supabase/migrations`, applied with the Supabase CLI |
| Auth redirects | Add the Vercel production and preview URLs to Supabase Auth settings in Phase 0 |
| Health check | `/api/health` checks the app and a trivial Supabase query |
| Cost and limits | Check free-tier and API rate limits for Vercel, Supabase and Gemini in Phase 0. Note them in `phase-log.md` |
| Release routine | End of each phase: merge to `main`, check on a real phone, write the link and a screenshot in `phase-log.md` |
| Demo safety | Seed data in production, API retry with backoff, recorded fallback video, a spare API key if the provider allows |

---

## 8. AI coding prompt template

Use this when asking an AI assistant to write code:

```
Context: ARTIQ, Next.js (App Router) + TypeScript + Tailwind + Supabase. See prd.md and design.md.
Task: <one small task>

Rules:
- Maximise use of well-maintained open source libraries. Do not write custom code for anything a library already solves. List the libraries you chose and why.
- Use ONLY the endpoints/functions pasted below (from the official docs). If you need something else, tell me and I will paste its docs.
- Add pino logging: info for start/end with duration, debug for inputs/outputs summary, error for failures. Redact secrets.
- Validate inputs and AI output with zod.
- Must deploy on Vercel: no file or body over 4.5 MB through API routes (browser uploads directly to Supabase Storage), set `maxDuration` on AI routes, no writes outside /tmp, no secrets in NEXT_PUBLIC_ vars.
- Keep it simple for a student hackathon team. No over-engineering.

Docs excerpt (endpoint + what it does):
<paste here>

Output: the files to create or change, and a short test checklist.
```

---

## 9. Team workflow
- Keep tasks small (half a day or less) and tracked on a simple board: Todo, Doing, Done.
- Suggested split: one person on UI and design system, one on Supabase and auth, one on AI routes and prompts, one on demo content and testing. Merge the roles if the team is smaller.
- Daily 10-minute sync. Update `docs/phase-log.md` at the end of every phase.
