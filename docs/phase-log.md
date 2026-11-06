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
