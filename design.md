# ARTIQ: Design Document

Companion to `prd.md` and `plan.md`.
Stack: **Next.js (App Router) + Tailwind CSS**, mobile first.
Reference for quality and motion: **Awwwards** (awwwards.com), interpreted below.

---

## 1. Design intent

ARTIQ is a gallery wall that introduces you to the person who made each piece. Two audiences share one interface:
- **Artists** with limited tech skills need big targets, plain words and very few choices.
- **Visitors** need the artwork to be the star, with the artist always one tap away.

**The one memorable thing:** the artwork detail page and the story behind it. Artwork is shown large, uncropped and unframed by decoration, and the artist's own words sit right beside it. Everything else stays quiet.

**Why not a Pinterest clone:** the grid is only the entry point. Every card carries the artist's name and art form, and the detail page leads with the story and the artist, not with save counts.

### What "Awwwards-inspired" means for us
We borrow principles, not layouts:
- Confident, large typography as a design element.
- Generous whitespace and a restrained palette so artwork supplies the colour.
- **One** orchestrated moment on the landing screen, not motion everywhere.
- Smooth, purposeful transitions between grid and detail (shared-element feel).
- Cursor and hover details on desktop, tap feedback on mobile.

---

## 2. Component sources

All are copy-paste libraries built on Tailwind (and `motion` where animated). Install only what a screen needs.

| Library | Use it for | Notes |
|---|---|---|
| **shadcn/ui** | The base system: Button, Input, Textarea, Form, Tabs, Dialog, Drawer (vaul), Sheet, Avatar, Badge, Skeleton, Sonner toasts, Dropdown, Command (search) | Default choice for anything functional |
| **Magic UI** | One or two accents: Marquee (landing artwork strip), Shine Border or Border Beam (marks AI-generated content), Typing Animation (AI draft appearing), Blur Fade (single hero reveal) | Use sparingly. Not on every card |
| **Aceternity UI** | Hero and showcase pieces: Parallax Scroll or Layout Grid (featured gallery on landing), Focus Cards, Hero Highlight | Desktop landing only. Keep out of core app flows |
| **21st.dev** | Browse for community variants of common pieces (bottom nav, profile header, upload dropzone, voice recorder UI) and adapt | Check each component's licence and dependencies before copying |

**Rule from plan.md:** reuse before building. If a library component covers 80% of a need, adapt it.

---

## 3. Design tokens

### 3.1 Colour
Direction: a **neutral gallery wall** so artwork supplies the colour, with an accent family taken from the pigments of traditional Kerala mural painting (indigo, turmeric, green, madder red). We avoid a generic cream-and-terracotta look.

| Token | Name | Light | Dark | Role |
|---|---|---|---|---|
| `--canvas` | Gallery white | `#F9F9F7` | `#16171C` | Page background |
| `--surface` | Plaster | `#FFFFFF` | `#1F2127` | Sheets, cards, inputs |
| `--ink` | Ink | `#15171F` | `#ECECE8` | Main text |
| `--ink-soft` | Graphite | `#5B6070` | `#A0A4B2` | Secondary text |
| `--line` | Hairline | `#E4E4DF` | `#2E3139` | Borders, dividers |
| `--primary` | Indigo | `#2E3A87` | `#8E9BFF` | Primary buttons, links, active nav |
| `--story` | Turmeric | `#D99A1E` | `#F0B94A` | Artist story markers, featured, voice recording |
| `--ai` | Verdigris | `#1F7A6A` | `#4FC2AB` | "AI suggestion" labels |
| `--danger` | Madder | `#B23A48` | `#F07080` | Errors, destructive actions, like heart |

Rules:
- Artwork is never tinted, overlaid or cropped to a fixed ratio in the grid. The masonry grid keeps each work's own proportions.
- **Turmeric means story or voice. Verdigris means AI.** Colour carries meaning, not decoration, so artists learn that anything verdigris was suggested by AI and is theirs to change.
- Check text contrast at AA (4.5:1) in both themes. Turmeric is for fills and icons, with Ink text on top, never as small text on white.
- Light theme is the default. Dark theme follows the system setting.

### 3.2 Typography
Two families, clearly distinct:

| Role | Family | Why |
|---|---|---|
| UI and headings | **Figtree** (sans) | Friendly, highly legible at small sizes, clean on cheap phone screens |
| Stories, descriptions, pull quotes | **Newsreader** (serif) | Gives the artist's words a literary, personal voice |
| Malayalam fallback | **Noto Sans Malayalam** (UI) and **Noto Serif Malayalam** (stories) | Correct Malayalam shaping. Test every screen with Malayalam text |

Load through `next/font` with `display: swap`.

Scale (mobile, then desktop), ratio about 1.25:

| Style | Size | Weight | Line height | Use |
|---|---|---|---|---|
| Display | 40 / 72 px | Figtree 700 | 1.05 | Landing headline only |
| H1 | 28 / 40 px | Figtree 700 | 1.15 | Page titles, artwork title |
| H2 | 20 / 24 px | Figtree 600 | 1.25 | Section headings |
| Body | 16 px | Figtree 400 | 1.5 | UI text |
| Story | 18 px | Newsreader 400 | 1.65 | Artist story and descriptions, max 65 characters per line |
| Caption | 13 px | Figtree 500 | 1.4 | Metadata, tags |

Rules: sentence case everywhere. No all-caps labels. Malayalam text gets about 10% more line height.

### 3.3 Shape, spacing, elevation
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64.
- Radius has meaning: artwork images **8px** (small, so the work looks like a framed piece), buttons and inputs **12px**, bottom sheets **24px top corners**, avatars fully round.
- Elevation: use hairline borders first. Shadows only on floating elements (bottom nav, sheets).
- Minimum tap target **44 × 44 px**.

---

## 4. Navigation model

**Mobile (primary):** fixed bottom bar with exactly three buttons.

```
┌──────────────────────────────┐
│                              │
│         screen content       │
│                              │
├──────────────────────────────┤
│   Home      ( + )     Profile│
└──────────────────────────────┘
```

- Home and Profile: icon with a text label under each.
- Create (+): larger, filled Indigo circle, raised slightly above the bar so it is the obvious action.
- Active state: Indigo icon plus label, not colour alone (a small dot or weight change also marks it).
- Respect the iOS home-indicator safe area.

**Desktop:** the same three items in a slim left rail, with Create as a button at the top. No extra items. Search, notifications, saved and settings are reached exactly as in the PRD (Home top bar and Profile).

---

## 5. Screens

### 5.1 Landing (signed-out visitors, desktop and mobile)
The one place to show Awwwards-level craft.

```
┌──────────────────────────────────────────────┐
│ ARTIQ                          Explore  Join │
│                                              │
│   Every artist                ┌────┐ ┌──┐    │
│   deserves                    │art │ │  │    │
│   to be seen.                 │    │ └──┘    │
│                               └────┘ ┌────┐  │
│   [ Explore art ] [ Share your art ] │    │  │
│                                      └────┘  │
└──────────────────────────────────────────────┘
```

- Left-aligned large headline using the tagline. Real artwork in a slowly drifting, offset column on the right (Magic UI Marquee or Aceternity Parallax Scroll).
- **The single orchestrated motion:** artworks settle into place once on load. After that, only scroll-linked parallax and user-triggered hover.
- Below: a short three-step explainer (photo, speak, publish). This content is a real sequence, so numbering is appropriate here.
- Mobile: headline on top, artwork strip below, both buttons stacked full width.
- Respect `prefers-reduced-motion` (static layout, no drift).

### 5.2 Home / Explore

```
┌──────────────────────────────┐
│ ARTIQ                🔍   🔔 │
│ [All][Traditional][Textiles]→│
│ Featured artists  ◯ ◯ ◯ ◯ ◯ →│
│ ┌─────┐ ┌───────┐            │
│ │     │ │       │            │
│ │ art │ │  art  │            │
│ │     │ └───────┘            │
│ └─────┘ ┌─────┐              │
│ Title   │ art │              │
│ Artist  │     │              │
│         └─────┘              │
│   Home      ( + )     Profile│
└──────────────────────────────┘
```

- Two-column masonry on mobile, three to five on desktop.
- Card = artwork + title + artist avatar and name. No heavy overlays. Tap anywhere opens detail.
- Category chips scroll horizontally. Selected chip is filled Indigo.
- Featured artists row: avatar, name, art form.
- Skeleton cards use each work's stored width and height so the grid does not jump.

### 5.3 Create (bottom sheet)
Tapping (+) opens a bottom drawer (shadcn Drawer) with three large, equal-weight actions:

```
┌──────────────────────────────┐
│ Add to your gallery          │
│ ┌──────────────────────────┐ │
│ │ 📷  Take a photo         │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ 🖼  Upload from gallery  │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ 🎙  Tell your story      │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

Each row has an icon, a one-line label and a short helper line. Drawer becomes a centred dialog on desktop.

### 5.4 AI draft and publish
One scrolling form, streamlined to get from photo to publish in as few taps as possible:

1. Image preview at the top (uncropped natural proportions with dimension pill).
2. While analysing: a single clear status ("Looking at your artwork…") with skeleton fields.
3. Draft fields:
   - **Artwork title**: with 3 tappable AI suggestions.
   - **"About this artwork"** (Newsreader serif Story style): pre-filled with the AI visual description and labelled "AI suggestion". Contains an integrated mic button. The artist can type or speak; speaking merges their spoken words and the AI draft into one polished text in a single review step ("Use this", Edit, Record again).
   - **Categories**: 5 AI-suggested category chips from the fixed taxonomy with the top suggestion pre-selected, plus a **"+" chip** opening a bottom Drawer (Dialog on desktop) with full category search. At least one category required.
   - Caption & Hashtags (optional).
4. Sticky bottom bar: **Publish** (primary) and **Save draft**.
5. Fastest path: Photo $\rightarrow$ Publish (~2 taps when the AI draft is good). Voice path: Photo $\rightarrow$ Speak once $\rightarrow$ Use this $\rightarrow$ Publish.

### 5.5 Voice recorder (inside "About this artwork" and profile fields)
- Mic icon button inside the field header. Tap to record.
- Recording state: field border turns turmeric, timer and live waveform animation show, big **Stop** button.
- After stopping: two panels, **What you said** (verbatim transcript) and **Merged "About this artwork"** (verdigris badge), with **Use this**, **Edit** and **Record again** in a single review step.
- Language selector: spoken language (Malayalam or English) and output language.
- Recording and processing have distinct states so the artist never wonders if it is working.

### 5.6 Artwork detail

```
┌──────────────────────────────┐
│ ←                        ⤴   │
│ ┌──────────────────────────┐ │
│ │                          │ │
│ │         artwork          │ │
│ │     (full proportions)   │ │
│ └──────────────────────────┘ │
│ Title                        │
│ ◯ Artist name · Kerala  [Visit]│
│ ♡ Like   🔖 Save   ⤴ Share   │
│ ── Story ──                  │
│ serif text in artist's words │
│ Tags: [Kerala mural] [Natural pigments]│
│ More from this artist →      │
└──────────────────────────────┘
```

- Artwork is never cropped. Tapping it opens a full-screen zoom view.
- The artist's story is the largest text block and uses the serif face.
- Desktop: image on the left (sticky), story and details scrolling on the right.
- Transition from grid to detail uses a shared image transition (motion layout animation), the second of the only two motion highlights in the app.

### 5.7 Profile (Instagram-style & Empty State Onboarding)

**Empty Profile State (First-time or Demo Login):**
```
┌──────────────────────────────┐
│       [Demo mode chip]       │
│             ◯                │
│    (avatar placeholder)      │
│                              │
│    Your profile is empty     │
│  Answer a few questions by   │
│  voice or typing to build    │
│  your artist portfolio.      │
│                              │
│   [ Create your profile ]    │
│       Fill it in myself      │
│                              │
│   [Start over]   [Sign out]  │
└──────────────────────────────┘
```

**Interview Screen (`/profile/interview`):**
- One question per screen with 6 progress dots.
- English & Malayalam language toggle.
- Large question typography in serif with Malayalam translation.
- Textarea with embedded `VoiceButton` for real-time speech-to-text.
- Controls: Back, Skip, Next / "Finish & Build Profile".
- Auto-saves after every answer.

**Review Screen (`/profile/review`):**
- 5 editable cards: Portfolio Introduction, Specialities (tags), Artist Bio, My Art Journey (serif), Inspiration.
- "AI suggestion" badge on each section (cleared on edit/accept).
- Collapsible "What you said" expander linking back to original interview answers.
- "Publish profile" action with success toast and redirect to populated Profile.

**Populated Profile:**
```
┌──────────────────────────────┐
│ username         [Demo mode] │
│ ◯  Name        [Edit profile]│
│    Location      [Start over]│
│ ┌──────────────────────────┐ │
│ │ Portfolio introduction…  │ │
│ └──────────────────────────┘ │
│ Bio text…                    │
│ [Kerala mural] [Natural pig] │
│ ── My art journey ──         │
│ serif text in artist's words │
│ ── Inspiration ──            │
│ [Artworks] [Saved]           │
│ ┌──┐┌──┐┌──┐                 │
│ │  ││  ││  │                 │
│ └──┘└──┘└──┘                 │
│   Home      ( + )     Profile│
└──────────────────────────────┘
```

- Three-column square-cropped grid (this is the one place cropping is acceptable, as in the PRD).
- Saved is a tab inside Profile. Settings gear top right.
- Visitors viewing another artist's empty profile see "This artist hasn't added a profile yet" with no create button.

### 5.8 Edit profile
Each field is plain, with a mic button inside:
- Artist bio, type or speak.
- My art journey, type or speak.
- Art forms and specialities, type or speak.

No separate voice area.

### 5.9 Search (Phase 6)
Command-style full-screen search (shadcn Command). Results grouped: Artists, Artworks, Art forms. Recent searches shown when empty.

---

## 6. Motion

Principle: motion explains a change, or draws attention once. Everything else is still.

| Moment | Treatment |
|---|---|
| Landing load | One staggered settle of artwork (the single orchestrated moment) |
| Grid to detail | Shared image transition |
| Create sheet | Standard drawer slide |
| Recording | Waveform and pulsing mic while active |
| AI draft appears | Fields fill in with a short typing effect (Magic UI Typing Animation), once per draft |
| Publish success | Toast "Published" and the artwork appears in the profile grid |

Not allowed: fade-and-slide on every section, hover lifts on every card, looping decorative animation inside app screens. Respect `prefers-reduced-motion` everywhere.

---

## 7. Writing and voice (UI copy)

- Plain words, active voice, sentence case.
- Name things by what they do for the artist: "Your story", not "Metadata".
- A button name stays the same through the flow: the button says **Publish**, the toast says "Published."
- Errors say what happened and what to do, with no apology:
  - "We couldn't read this photo. Check your connection and try again." [Try again]
- Empty states point to an action:
  - Profile with no art: "No artwork yet." [Add your first piece]
  - Saved: "Nothing saved. Tap the bookmark on any artwork to keep it here."
- AI labels are consistent: **AI suggestion** (before editing). Never "AI generated" in a way that sounds final.
- All strings live in next-intl message files (English and Malayalam).

---

## 8. Accessibility checklist
- Visible keyboard focus ring (2px Indigo, 2px offset) on every interactive element.
- Colour is never the only signal (active nav, AI badge and errors also use text or icons).
- Contrast AA in light and dark.
- Alt text for every artwork: artist's title plus first sentence of the description.
- Voice features always have a typed alternative.
- Screen reader labels on icon-only buttons (mic, like, save, share, search, notifications).
- `prefers-reduced-motion` and `prefers-color-scheme` honoured.
- Test with Malayalam text at 200% font scale.

---

## 9. Responsive rules
- Design at **390px** first, then 768px and 1280px.
- Masonry columns: 2 (mobile), 3 (tablet), 4 to 5 (desktop). Max content width about 1440px.
- Bottom nav on mobile, left rail from 768px up.
- Drawers become dialogs on desktop.
- Images use `next/image` with responsive sizes and blur placeholders from stored dimensions.

---

## 10. Build mapping (which component for which screen)

| Screen / element | Components |
|---|---|
| Bottom nav, top bar | Custom (small) with shadcn Button, lucide icons. Look at 21st.dev for nav variants |
| Category chips | shadcn Badge or ToggleGroup, with horizontal scroll (embla-carousel if needed) |
| Category picker | shadcn Drawer (vaul) on mobile, Dialog on desktop, with shadcn Command for search |
| Masonry grid | CSS columns or `react-masonry-css`, custom `ArtworkCard` |
| Create sheet | shadcn Drawer (vaul) |
| Upload and camera | native file input (`accept="image/*"`, `capture`), plus `react-dropzone` on desktop |
| AI draft form | shadcn Form, Input, Textarea, Badge. Magic UI Shine Border on the AI badge or draft card. Typing Animation for reveal |
| Voice recorder | Custom `VoiceButton` using the browser `MediaRecorder` API. Look at 21st.dev for a waveform or recorder UI to adapt |
| Artwork detail | `motion` shared layout transition, shadcn Avatar, Button |
| Profile | shadcn Avatar, Tabs, Button. Simple CSS grid |
| Landing | Aceternity Parallax Scroll or Magic UI Marquee, Hero Highlight (optional) |
| Toasts | shadcn Sonner |
| Search | shadcn Command |

---

## 11. Design review checklist (before each phase demo)
- Does the artwork remain the visual focus on this screen?
- Is there still only one clear primary action?
- Did we add any navigation beyond the three buttons? (If yes, remove it.)
- Is every AI output editable and labelled?
- Did we use a library component before building a custom one?
- Does it work in Malayalam, in dark mode, at 390px, and with reduced motion?
