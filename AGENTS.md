<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# ARTIQ Project Rules

## Rule 8: Craft Design Tokens & Reference Rules
1. **Source of Truth**: All UI styling must strictly match `design-reference/` (`screen.png` and `code.html`) and `docs/design-tokens.md`.
2. **Design Point of View**: "Soft things to look at, hard-edged things to press." Calm earthy surfaces (`#F8F7F3` Canvas) and softly rounded artwork (`16px` radius) stay quiet. Every interactive control looks like a physical sticker: 2px Espresso outline (`#4A3526`), flat colour fill, hard offset shadow (`3px 3px 0 #4A3526`), and presses down (`translate(3px, 3px)` with 0 shadow) when tapped.
3. **Zero Black Rule**: Black (`#000`, `#000000`, near-black) is strictly forbidden. Espresso `#4A3526` must be used everywhere for all text, borders, and hard shadows.
4. **No Gradients, Blur, or Glassmorphism**: No `bg-gradient`, `backdrop-blur`, blurred blobs, or glowing shadows. All surfaces are opaque and tangible.
5. **Color Roles**: Leaf `#C8E096` (Primary action), Sand `#CDAA8A` (Story, Mic, Categories), Sprout `#E3F0CB` + Moss `#6B8A4A` (AI suggestions), Clay `#E3B5A0` (Like, Save, Delete), Mist `#EFEFEC` (Quiet containers & search pill).
6. **Typography**: Headings use Bricolage Grotesque (700, 800), body uses Figtree (400-700), stories and artist quotes use Newsreader (400 italic), badges/tags use DM Mono (500 uppercase). Malayalam fallbacks use Noto Sans/Serif Malayalam with `:lang(ml)` +10% line height.
7. **Build Guard**: Always run `npm run lint` and `npm run build` before finishing. Never bypass `scripts/lint-design-tokens.mjs`.

