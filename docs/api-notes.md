# ARTIQ: API & Package Reference Notes

Official API endpoints and function signatures referenced in code, per Non-Negotiable Rule 2.

| Package / API | Docs link | Endpoint or function | What it does | Used in |
|---|---|---|---|---|
| Next.js App Router | https://nextjs.org/docs/app/building-your-application/routing/route-handlers | `export async function GET(request: NextRequest)` | Server route handler for executing API logic on Vercel | `app/api/health/route.ts` |
| Next.js Response | https://nextjs.org/docs/app/api-reference/functions/next-response#json | `NextResponse.json(body, init)` | Returns JSON payload with headers and HTTP status | `app/api/health/route.ts` |
| Next.js Font | https://nextjs.org/docs/app/building-your-application/optimizing/fonts | `Figtree`, `Newsreader`, `Noto_Sans_Malayalam`, `Noto_Serif_Malayalam` | Zero-layout-shift font optimization and loading | `app/layout.tsx` |
| Next.js Images | https://nextjs.org/docs/app/api-reference/next-config-js/images | `images.remotePatterns` | Whitelists image hostnames for Supabase Storage CDN optimization | `next.config.ts` |
| Next.js Image Component | https://nextjs.org/docs/app/api-reference/components/image | `<Image src width height alt sizes priority />` | Aspect-ratio preserving, responsive lazy-loaded images without layout shift | `components/artiq/ArtworkCard.tsx`, `FeaturedArtistsRow.tsx`, `ArtworkDetailModal.tsx` |
| next-themes | https://github.com/pacocoursey/next-themes | `ThemeProvider`, `useTheme()` | Zero-flash theme provider synchronizing dark and light tokens | `components/artiq/ThemeProvider.tsx`, `TopBar.tsx`, `app/layout.tsx` |
| Pino | https://getpino.io/#/docs/api?id=pinooptions-destination | `pino({ level, redact, transport })` | Configures structured JSON logger with development pretty printer | `lib/logger.ts` |
| Pino | https://getpino.io/#/docs/child-loggers | `logger.child({ module, requestId })` | Creates contextual child logger with inherited properties | `lib/logger.ts`, `app/api/health/route.ts`, `app/(auth)/actions.ts` |
| Zod | https://zod.dev/?id=basic-usage | `z.object().safeParse(data)` | Runtime type schema validation with safe failure reporting | `lib/env.ts`, `app/(auth)/actions.ts` |
| @supabase/ssr | https://supabase.com/docs/guides/auth/server-side/nextjs | `createBrowserClient(url, key)` | Browser-safe Supabase client singleton | `lib/supabase/client.ts` |
| @supabase/ssr | https://supabase.com/docs/guides/auth/server-side/nextjs | `createServerClient(url, key, { cookies })` | Server Supabase client reading and writing auth cookies | `lib/supabase/server.ts`, `lib/supabase/middleware.ts` |
| Supabase Auth | https://supabase.com/docs/reference/javascript/auth-signup | `supabase.auth.signUp({ email, password, options })` | Registers new user with metadata in Supabase Auth | `app/(auth)/actions.ts` |
| Supabase Auth | https://supabase.com/docs/reference/javascript/auth-signinwithpassword | `supabase.auth.signInWithPassword({ email, password })` | Authenticates existing user with password credentials | `app/(auth)/actions.ts` |
| Supabase Auth | https://supabase.com/docs/reference/javascript/auth-signout | `supabase.auth.signOut()` | Clears auth session and cookies | `app/(auth)/actions.ts` |
| Supabase Auth | https://supabase.com/docs/reference/javascript/auth-getuser | `supabase.auth.getUser()` | Securely validates session JWT against Supabase server | `lib/supabase/middleware.ts`, `app/profile/page.tsx` |
| Supabase PostgREST | https://supabase.com/docs/reference/javascript/select | `supabase.from('artworks').select('*, artist:profiles(*)')` | Relational join querying published artworks with artist profiles | `app/page.tsx`, `app/profile/page.tsx` |
| Supabase PostgREST | https://supabase.com/docs/reference/javascript/update | `supabase.from('profiles').update(data).eq('id', user.id)` | RLS-enforced profile update for authenticated owner | `app/(auth)/actions.ts` |
| Google Gemini API | https://ai.google.dev/gemini-api/docs/multimodal | `ai.models.generateContent({ model, contents, config })` | Multimodal AI visual analysis returning structured JSON drafts | `lib/ai/gemini.ts`, `app/api/ai/analyze/route.ts` |
| browser-image-compression | https://github.com/Donaldcwl/browser-image-compression | `imageCompression(file, options)` | Fast client-side image compression prior to direct upload | `lib/storage/upload.ts` |
| Supabase Storage | https://supabase.com/docs/reference/javascript/storage-from-upload | `supabase.storage.from('artworks').upload(path, file)` | Direct client upload to cloud bucket honoring Vercel 4.5 MB cap | `lib/storage/upload.ts` |
| Supabase Storage | https://supabase.com/docs/reference/javascript/storage-from-getpublicurl | `supabase.storage.from('artworks').getPublicUrl(path)` | Retrieves public CDN URL for uploaded artwork | `lib/storage/upload.ts` |
