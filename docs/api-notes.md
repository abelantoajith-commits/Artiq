# ARTIQ: API & Package Reference Notes

Official API endpoints and function signatures referenced in code, per Non-Negotiable Rule 2.

| Package / API | Docs link | Endpoint or function | What it does | Used in |
|---|---|---|---|---|
| Next.js App Router | https://nextjs.org/docs/app/building-your-application/routing/route-handlers | `export async function GET(request: NextRequest)` | Server route handler for executing API logic on Vercel | `app/api/health/route.ts` |
| Next.js Response | https://nextjs.org/docs/app/api-reference/functions/next-response#json | `NextResponse.json(body, init)` | Returns JSON payload with headers and HTTP status | `app/api/health/route.ts` |
| Next.js Font | https://nextjs.org/docs/app/building-your-application/optimizing/fonts | `Figtree`, `Newsreader`, `Noto_Sans_Malayalam`, `Noto_Serif_Malayalam` | Zero-layout-shift font optimization and loading | `app/layout.tsx` |
| Next.js Images | https://nextjs.org/docs/app/api-reference/next-config-js/images | `images.remotePatterns` | Whitelists image hostnames for Supabase Storage CDN optimization | `next.config.ts` |
| Pino | https://getpino.io/#/docs/api?id=pinooptions-destination | `pino({ level, redact, transport })` | Configures structured JSON logger with development pretty printer | `lib/logger.ts` |
| Pino | https://getpino.io/#/docs/child-loggers | `logger.child({ module, requestId })` | Creates contextual child logger with inherited properties | `lib/logger.ts`, `app/api/health/route.ts` |
| Zod | https://zod.dev/?id=basic-usage | `z.object().safeParse(data)` | Runtime type schema validation with safe failure reporting | `lib/env.ts` |
| @supabase/ssr | https://supabase.com/docs/guides/auth/server-side/nextjs | `createBrowserClient(url, key)` | Browser-safe Supabase client singleton | `lib/supabase/client.ts` |
| @supabase/ssr | https://supabase.com/docs/guides/auth/server-side/nextjs | `createServerClient(url, key, { cookies })` | Server Supabase client reading and writing auth cookies | `lib/supabase/server.ts` |
| @supabase/supabase-js | https://supabase.com/docs/reference/javascript/select | `supabase.from('profiles').select('id', { count: 'exact', head: true })` | Trivial head ping against Supabase database | `app/api/health/route.ts` |
