# ARTIQ: Product Requirements Document (PRD)

**Tagline:** Every Artist Deserves to Be Seen.
**Context:** Student hackathon MVP. Goal is a working end-to-end flow and a polished demo.
**Source of truth:** the Project Capsule. This PRD does not change any decided feature. It turns them into requirements.

---

## 1. Product summary

ARTIQ is an AI-assisted digital identity, portfolio and discovery platform for traditional and independent artists. An artist photographs their work, AI drafts the listing content, and the artist speaks their story in their own language. Visitors discover artists through artwork, not through follower counts.

## 2. Problem

Talented artists struggle online because they:
- lack the technical skills to build and maintain a portfolio;
- find it hard to write professional descriptions and captions;
- do not know hashtags, keywords or social media marketing;
- cannot easily share the cultural story behind a piece;
- are poorly served by social platforms that are not built around discovering artists.

## 3. Goals and non-goals

### Goals (MVP)
1. An artist can go from sign-up to a published artwork in under 5 minutes.
2. AI drafts title, description, caption, hashtags, keywords and categories from a photo. The artist can edit all of it.
3. An artist can speak instead of type for bio, journey, specialities and artwork story, in Malayalam, English or another supported language.
4. A visitor can browse the gallery and open artwork and artist profiles without signing in.
5. Every phase of the build produces something visible and deployed.

### Non-goals (MVP)
- Training or fine-tuning our own model.
- Comments, advanced recommendations, analytics, custom collections, payments or selling.
- Followers and notifications (listed as Future Development in the capsule).
- A separate voice-navigation system.

## 4. Users and personas

| Persona | Description | Key need |
|---|---|---|
| Artist (primary) | Traditional or independent artist, limited tech and marketing skills, may be more comfortable speaking than typing, possibly in Malayalam | Look professional online with minimal effort |
| Visitor | Art lover, buyer, student or curator | Discover artists and understand the story behind a piece |

## 5. Guiding principles (from the capsule)
- Keep the interface simple. Three bottom buttons only: **Home, Create (+), Profile**.
- Artwork is the visual focus.
- AI assists, never replaces. Everything AI generates is reviewable and editable before publishing.
- **AI must not invent** cultural history, authenticity, inspiration or technique from a photo alone. Artists provide or verify these.
- Preserve the artist's meaning and personality in voice-generated text.
- Do not become a generic Instagram or Pinterest clone.

## 6. Scope and priority

### Must have (Phases 0 to 5)
| ID | Requirement |
|---|---|
| M1 | Onboarding and authentication |
| M2 | Home / Explore gallery (masonry) |
| M3 | Three-button navigation |
| M4 | Artwork image upload (camera or gallery) |
| M5 | AI artwork analysis |
| M6 | AI-generated title and description (plus caption, hashtags, keywords, categories) |
| M7 | Voice-to-Story |
| M8 | Artist profile |
| M9 | Edit profile (with type-or-speak fields) |
| M10 | Artwork publishing |
| M11 | Artwork detail page |

### Should have (Phase 6)
Search, category filters, saved artwork, multilingual UI and translation, shareable artist portfolio link.

### Future
Followers and following, comments, custom collections, recommendations, notifications, artist analytics.

> Likes are in the capsule's artwork details but not in the MVP list. Treat **like** as a small "Should have" add-on that reuses the same pattern as save.

## 7. Functional requirements

### 7.1 Authentication and onboarding (M1)
- Email sign-up and login via Supabase Auth. Optional Google sign-in if time allows.
- First login routes to profile creation: name, username (unique), location, profile photo (optional), then bio.
- Browsing the gallery, artwork pages and artist profiles requires no account.
- Create, Save, Like and Profile prompt for sign-in only when needed.

**Acceptance:** a new user can register, finish profile setup and land on Home. A signed-out user can browse everything public.

### 7.2 Create flow (M4, M5, M6, M10)
The Create (+) button opens three actions:
1. **Take a Photo** (device camera through the file input `capture` attribute).
2. **Upload from Gallery.**
3. **Tell Your Story (Voice).**

Flow after an image is chosen:
1. Client compresses and uploads the image to storage.
2. The server sends the image to the multimodal model with a strict observation-only prompt.
3. UI shows a loading state, then a streamlined **editable draft**:
   - **Artwork title** with 3 AI title suggestions (tap to apply).
   - **"About this artwork"** (Newsreader serif style): pre-filled with AI visual observation and labelled "AI suggestion". Contains an integrated mic button. The artist can type or speak; speaking merges their spoken words and the visual description into one polished text in a single review step ("Use this", Edit, Record again).
   - **Categories**: 5 AI-suggested category chips from the fixed taxonomy with the top match pre-selected, plus a **"+" chip** opening a full category search Drawer (Dialog on desktop). At least one category required.
   - Short caption & hashtags (optional).
4. **Publish**. The artwork appears immediately in Explore and on the artist's profile.
5. Fastest path: Photo $\rightarrow$ Publish (~2 taps when AI draft is good). Voice path: Photo $\rightarrow$ Speak once $\rightarrow$ Use this $\rightarrow$ Publish.

**Acceptance:**
- Draft appears within about 10 seconds on a normal connection, or a clear error with a retry button.
- Every AI field is editable. Publish is disabled until a title and at least one category exist.
- AI-generated fields are labelled "AI suggestion" until the artist edits or accepts them.
- The AI output contains no claims about culture, age, authenticity or technique unless the artist supplied them.

### 7.3 Voice-to-Story (M7, M9)
Used in Edit Profile (bio, journey, specialities) and in Create ("About this artwork").

Flow: tap mic, speak, stop, transcript appears, AI merges spoken words with visual description, artist reviews side-by-side with original transcript and polished text, then taps "Use this", edits or re-records in a single review step.

Rules:
- Artist's spoken words are the source of truth and lead the text in first-person voice. Visual details only support it. If they conflict, the artist wins.
- Do not add facts, cultural origin, age, authenticity or techniques the artist did not say.
- Support multilingual input (Malayalam and Indian English). The artist chooses whether the output stays in the spoken language or is translated to English.
- The raw transcript is always available.
- Voice is a button inside each text field, not a separate navigation area.

**Acceptance:** speaking 30 to 60 seconds in Malayalam or English produces an editable, faithful draft in the chosen output language with one "Use this" action.

### 7.4 Home / Explore (M2, M3)
- Top bar: search icon (opens search in Phase 6), notifications icon top right (placeholder in MVP).
- Horizontally scrollable category chips.
- Featured artists row.
- Masonry artwork grid with trending/featured ordering.
- Infinite scroll or "load more".

### 7.5 Artwork detail (M11)
Image, title, description, artist card (links to profile), artist story, categories and tags, more from this artist, save/like/share actions. Share uses the Web Share API with copy-link fallback.

### 7.6 Artist profile (M8, M9)
Instagram-style layout: photo, name, username, bio, location, specialities, artist story, three-column artwork grid, Edit Profile button (own profile only). Saved artwork and Settings are reached from here. Public profile has a shareable URL.

### 7.7 Search and categories (Should have)
- Search artists, artworks and art forms (Postgres full-text search, no extra service).
- Categories: Modern and Contemporary, Traditional, Handicrafts, Textiles and Weaving, Sculpture and Carving, Digital Art and Illustration.
- Traditional subcategories: Kerala mural, Madhubani, Tanjore, folk art.
- AI suggests categories, artist can change them.

### 7.8 Saved artwork (Should have)
Bookmark from the grid or detail page. View in Profile. Collections are future work.

## 8. Non-functional requirements
- **Performance:** gallery first paint under 2.5 seconds on mobile 4G. Images served resized and lazy-loaded.
- **Accessibility:** keyboard focus visible, alt text on every artwork (from title and description), colour contrast AA, reduced motion respected, tap targets at least 44px.
- **Mobile first:** designed at 390px width, scales up to desktop.
- **Language:** UI supports English and Malayalam. Fonts must render Malayalam correctly.
- **Privacy and safety:** artists own their work. Only the owner can edit or delete. Row Level Security on all tables. API keys only on the server.
- **Reliability:** AI failures never block publishing. The artist can write fields manually.
- **Deployability:** the app must build and run on Vercel (serverless functions). Files go directly from the browser to Supabase Storage, never through API routes (4.5 MB request cap). AI routes must finish within the function time limit or fail gracefully with a retry. See plan.md section 6.
- **Observability:** structured logging with debug mode (see plan.md).

## 9. AI behaviour spec

### 9.1 Artwork analysis output (JSON, validated with zod)
```json
{
  "title_suggestions": ["", "", ""],
  "description": "",
  "caption": "",
  "hashtags": [],
  "keywords": [],
  "suggested_categories": ["traditional", "kerala-mural", "handicrafts", "textiles", "sculpture"],
  "visual_observations": { "colours": [], "subjects": [], "style_notes": "" }
}
```

### 9.2 Prompt rules (non-negotiable)
1. Describe only what is visible: colours, composition, subjects, medium if clearly visible.
2. Select exactly 5 suggested categories, ranked by relevance, strictly from the fixed taxonomy in `lib/categories.ts`.
3. Never state cultural origin, tradition, age, artist intent, authenticity or technique as fact.
4. When merging voice with visual description: the artist's spoken words are the source of truth and lead the text in first-person voice; visual details only support it. If they conflict, the artist's words win. Never add cultural origin or unsaid facts.
5. Return JSON only, matching the schema.

### 9.3 Voice-to-Story prompt rules
1. Input is the transcript, optional visual description, and the target language. Output is a cleaned, structured first-person narrative ("About this artwork").
2. Fix grammar and structure. Do not add facts, names, dates or claims.
3. Keep the speaker's tone.
4. Return both the merged text and a short list of anything unclear for the artist to confirm in a single review step.

## 10. Data model (Supabase / Postgres)

| Table | Key columns |
|---|---|
| `profiles` | id (= auth user id), username (unique), display_name, bio, location, avatar_url, journey, specialities (text[]), preferred_language, created_at |
| `artworks` | id, artist_id → profiles, title, description, caption, image_url, width, height, categories (text[]), hashtags (text[]), keywords (text[]), status (draft/published), ai_generated_fields (jsonb), created_at |
| `categories` | id, name, parent_id (for subcategories) |
| `saves` | user_id, artwork_id, created_at (PK on both) |
| `likes` | user_id, artwork_id, created_at (PK on both) |

Storage buckets: `artworks`, `avatars`.
RLS: public read on published artworks and profiles. Write only where `auth.uid()` equals the owner.
Store image width and height at upload so the masonry grid does not jump while loading.

## 11. Key user flows

**Artist:** open app, register, create profile (type or speak), Create (+), upload photo, AI draft, edit, add story by voice or text, publish, artwork appears in Explore and on profile.
**Visitor:** open Home, browse, search or pick a category, open artwork, read story, visit artist profile, like, save or share.

## 12. Success metrics (for the demo and early pilots)
- Time from sign-up to first published artwork under 5 minutes.
- At least 80% of AI drafts need only light edits (self-reported in testing with a few artists).
- A voice-created bio is accepted with minor or no changes.
- Zero cases of AI inventing cultural facts in test runs.
- Full demo flow runs live without errors.

## 13. Risks and mitigations

| Risk | Mitigation |
|---|---|
| AI hallucinates cultural facts | Strict prompt, observation-only output, artist-confirmed fields, "AI suggestion" labels |
| Malayalam speech recognition accuracy | Show raw transcript, allow edit and re-record, test early in Phase 4, keep typing as fallback |
| API rate limits or downtime during demo | Cache results per image hash, add retry with backoff, prepare seeded demo data and a recorded fallback |
| Large phone photos are slow to upload | Compress client-side before upload |
| Scope creep | Phase gates in plan.md. Nothing from Future enters before Phase 6 is done |
| Secrets leaking | All AI calls through server route handlers, env vars on Vercel, never `NEXT_PUBLIC_` for secrets |

## 14. Open questions
1. Final AI provider: Gemini only, or Gemini for vision plus a separate speech-to-text model? (Decide in Phase 4 after a spike test with Malayalam audio.)
2. Is Google sign-in needed for the demo?
3. Do we pre-seed the gallery with real artists' work? (Recommended. Get permission.)
4. Target languages beyond English and Malayalam?
