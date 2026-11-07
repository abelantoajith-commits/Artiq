"use client"

import { notFound } from "next/navigation"
import * as React from "react"
import Image from "next/image"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import {
  Bell,
  Search,
  Plus,
  Sun,
  Moon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer"
import {
  AISuggestionBadge,
  ProcessBadge,
  FeaturedBadge,
  StoryTag,
} from "@/components/artiq/Badges"
import { ArtistAvatar } from "@/components/artiq/ArtistAvatar"
import { StoryBlock } from "@/components/artiq/StoryBlock"
import { FeatureCard } from "@/components/artiq/FeatureCard"
import { Artwork } from "@/types/art"

const emptySubscribe = () => () => {}

export default function DesignSystemPage() {
  // Gate: dev-only route excluded from production
  if (process.env.NODE_ENV === "production") {
    notFound()
  }

  const { theme, setTheme } = useTheme()
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
  const [selectedChip, setSelectedChip] = React.useState("All")
  const [searchVal, setSearchVal] = React.useState("")

  const sampleArtwork: Artwork = {
    id: "demo_feat_1",
    artist_id: "anjali_1",
    title: "Temple Lamp with Sesame Oil",
    description:
      "Every lamp I paint carries the warm sesame oil smell of our family temple in Thrissur. The natural vermilion and yellow ochre pigments are ground by hand on wet river stone.",
    caption:
      "Every lamp I paint carries the warm sesame oil smell of our family temple in Thrissur.",
    image_url:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80",
    width: 800,
    height: 1000,
    categories: ["traditional", "kerala-mural"],
    hashtags: ["keralamural", "naturalpigments", "templeart"],
    status: "published",
    created_at: new Date().toISOString(),
    artist: {
      id: "anjali_1",
      display_name: "Anjali Menon",
      username: "anjali",
      location: "Thrissur, Kerala",
      avatar_url:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      bio: "Master of traditional Kerala mural techniques using five sacred natural pigments.",
      journey: "Trained under temple muralists in Guruvayur for 14 years.",
      specialities: ["Kerala mural", "Fresco-secco", "Natural pigments"],
      phone: "+91 94470 12345",
      email: "anjali@keralamural.org",
      preferred_language: "ml",
    },
  }

  const sampleCardArtwork: Artwork = {
    id: "demo_card_1",
    artist_id: "kavitha_1",
    title: "Kasavu Border Study in Ivory & Gold",
    description: "Hand-spun cotton warp with pure zari motifs inspired by monsoon foliage.",
    caption: "The gold thread breathes with the Kerala monsoon dampness.",
    image_url:
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80",
    width: 600,
    height: 800,
    categories: ["textiles", "handicrafts"],
    hashtags: ["kasavu", "weaving", "kerala"],
    status: "published",
    created_at: new Date().toISOString(),
    artist: {
      id: "kavitha_1",
      display_name: "Kavitha K.",
      username: "kavitha",
      location: "Balaramapuram, Kerala",
      avatar_url: "",
      bio: "Fifth generation pit-loom weaver specializing in fine Kasavu borders.",
      journey: "Weaving at the family loom since childhood.",
      specialities: ["Handloom", "Kasavu", "Zari weaving"],
      preferred_language: "ml",
    },
  }

  return (
    <div className="space-y-16 py-6 max-w-5xl mx-auto pb-32">
      {/* 1. Spec Header & Mode Switcher */}
      <header className="p-6 rounded-[16px] bg-surface border-2 border-espresso shadow-hard flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <span className="font-display font-extrabold text-[32px] text-espresso tracking-tight">
              artiq
            </span>
            <span className="font-mono text-[11px] uppercase px-2 py-0.5 rounded-[4px] border border-espresso bg-leaf text-espresso tracking-widest font-bold">
              CRAFT SYSTEM
            </span>
            <span className="font-mono text-[11px] text-bark uppercase">
              GATE 2 PREVIEW
            </span>
          </div>
          <p className="font-serif italic text-lg text-bark">
            &ldquo;Soft things to look at, hard-edged things to press.&rdquo;
          </p>
          <p className="text-xs text-bark max-w-xl">
            Earth palette with zero black. Espresso (#4A3526) replaces black for all ink, borders, and shadows. Physical sticker controls, quiet natural artwork.
          </p>
        </div>

        {/* Theme Toggle Button */}
        {mounted && (
          <Button
            variant="secondary"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex-shrink-0"
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-4 h-4 text-espresso" />
                <span>Switch to Light Theme</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-espresso" />
                <span>Switch to Dark Theme</span>
              </>
            )}
          </Button>
        )}
      </header>

      {/* 2. Color Swatches Token Matrix */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-espresso pb-2">
          <h2 className="text-h2 text-espresso">Color Swatches (AA/AAA Contrast Verified)</h2>
          <span className="font-mono text-xs text-bark">12 CRAFT TOKENS</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { name: "Canvas", hex: "#F8F7F3", dark: "#1F1812", bg: "bg-canvas", role: "Page Background", border: "border-espresso" },
            { name: "Surface", hex: "#FFFFFF", dark: "#2C221B", bg: "bg-surface", role: "Cards & Sheets", border: "border-espresso" },
            { name: "Mist", hex: "#EFEFEC", dark: "#382C23", bg: "bg-mist", role: "Soft Search Container", border: "border-espresso/40" },
            { name: "Espresso", hex: "#4A3526", dark: "#F5F2EB", bg: "bg-espresso", role: "Ink, 2px Borders, Shadows", border: "border-espresso", textWhite: true },
            { name: "Bark", hex: "#6B4F3A", dark: "#B8A99A", bg: "bg-bark", role: "Secondary Text, Captions", border: "border-espresso", textWhite: true },
            { name: "Leaf", hex: "#C8E096", dark: "#98B368", bg: "bg-leaf", role: "Primary Action Fill", border: "border-espresso" },
            { name: "Sand", hex: "#CDAA8A", dark: "#B58E6B", bg: "bg-sand", role: "Artist Voice, Active Chip", border: "border-espresso" },
            { name: "Sand-Tint", hex: "#F0E2D3", dark: "#33251B", bg: "bg-sand-tint", role: "Story Quote Background", border: "border-espresso" },
            { name: "Sprout", hex: "#E3F0CB", dark: "#A8BE88", bg: "bg-sprout", role: "AI Suggestion Badge", border: "border-moss" },
            { name: "Moss", hex: "#6B8A4A", dark: "#556E3A", bg: "bg-moss", role: "AI Border, Create Shadow", border: "border-espresso", textWhite: true },
            { name: "Clay", hex: "#E3B5A0", dark: "#C47D68", bg: "bg-clay", role: "Notification Dot, Like/Save", border: "border-espresso" },
            { name: "Forest", hex: "#3F5A2A", dark: "#7FA85B", bg: "bg-forest", role: "Focus Ring Outline", border: "border-espresso", textWhite: true },
          ].map((c) => (
            <div
              key={c.name}
              className="p-3 rounded-[10px] bg-surface border-2 border-espresso shadow-hard-sm flex flex-col gap-2"
            >
              <div
                className={`w-full h-12 rounded-[6px] border-2 ${c.border} ${c.bg} flex items-center justify-center font-mono text-[10px] font-bold ${
                  c.textWhite ? "text-canvas" : "text-espresso"
                }`}
              >
                {c.hex}
              </div>
              <div>
                <p className="font-body font-bold text-xs text-espresso">{c.name}</p>
                <p className="font-mono text-[10px] text-bark">{c.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Typography Scale & Malayalam Regional Specimen */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-espresso pb-2">
          <h2 className="text-h2 text-espresso">Typography Hierarchy & Regional Fallback</h2>
          <span className="font-mono text-xs text-bark">NEXT/FONT ZERO SHIFT</span>
        </div>

        <div className="p-6 rounded-[16px] bg-surface border-2 border-espresso shadow-hard space-y-6">
          <div className="space-y-1">
            <span className="font-mono text-[10px] text-bark uppercase">1. TEXT-DISPLAY (BRICOLAGE 36/38 800)</span>
            <p className="text-display text-espresso">artiq — craft market</p>
          </div>

          <div className="space-y-1">
            <span className="font-mono text-[10px] text-bark uppercase">2. TEXT-H1 (BRICOLAGE 26/30 700)</span>
            <p className="text-h1 text-espresso">Temple Lamp with Sesame Oil</p>
          </div>

          <div className="space-y-1">
            <span className="font-mono text-[10px] text-bark uppercase">3. TEXT-H2 (BRICOLAGE 18/24 700)</span>
            <p className="text-h2 text-espresso">Artists in Kerala &amp; Beyond</p>
          </div>

          <div className="space-y-1">
            <span className="font-mono text-[10px] text-bark uppercase">4. TEXT-BODY (FIGTREE 16/24 400)</span>
            <p className="text-body text-espresso max-w-2xl">
              Visitors discover artists through their living work, not through follower counts or algorithm tricks. Every craft object is documented with respect to the artisan who created it.
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-mono text-[10px] text-bark uppercase">5. TEXT-LABEL &amp; TEXT-BUTTON (FIGTREE 14/20 600 &amp; 15/20 700)</span>
            <div className="flex items-center gap-4">
              <span className="text-label text-espresso">Category Label: Kerala mural</span>
              <span className="text-button text-espresso bg-leaf px-3 py-1 rounded-[6px] border border-espresso">
                Button Label: Publish Artwork
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="font-mono text-[10px] text-bark uppercase">6. TEXT-STORY (NEWSREADER 18/28 400 ITALIC — ARTIST&apos;S WORDS ONLY)</span>
            <p className="text-story text-espresso italic">
              &ldquo;The red ochre comes from the iron-rich stones beside the temple stream. We grind it with neem gum so the fresco endures the monsoons.&rdquo;
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-mono text-[10px] text-bark uppercase">7. TEXT-TAG (DM MONO 11/16 500 +0.08EM)</span>
            <div className="flex items-center gap-3">
              <span className="text-tag text-espresso bg-sprout px-2 py-0.5 rounded border border-moss">
                AI SUGGESTION
              </span>
              <span className="text-tag text-espresso bg-sprout px-2 py-0.5 rounded border border-moss">
                PROCESS
              </span>
              <span className="text-tag text-espresso bg-sand px-2 py-0.5 rounded border border-espresso">
                FEATURED WORK
              </span>
            </div>
          </div>

          <div className="space-y-1.5 pt-4 border-t border-espresso/20">
            <span className="font-mono text-[10px] text-bark uppercase">
              8. REGIONAL SCRIPT: NOTO SANS &amp; SERIF MALAYALAM (+10% LINE HEIGHT)
            </span>
            <p lang="ml" className="font-sans text-base text-espresso leading-relaxed">
              കല എന്നത് ഒരു ആത്മാവിന്റെ പ്രാർത്ഥനയാണ്. ഗുരുവായൂരിലെ ക്ഷേത്ര ചുമർചിത്രങ്ങളുടെ തനിമ നിലനിർത്താൻ പ്രകൃതിദത്ത ചായക്കൂട്ടുകൾ ഉപയോഗിക്കുന്നു.
            </p>
            <p lang="ml" className="font-serif italic text-lg text-bark leading-relaxed">
              &ldquo;ഓരോ മൺപാത്രത്തിലും എന്റെ അമ്മയുടെയും മുത്തശ്ശിയുടെയും വിരലടയാളങ്ങളുണ്ട്.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* 4. Physical Sticker Button State Matrix */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-espresso pb-2">
          <h2 className="text-h2 text-espresso">Button State Demonstration (Tactile Sticker Physics)</h2>
          <span className="font-mono text-xs text-bark">TAP TO FEEL PRESS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-[12px] bg-surface border-2 border-espresso shadow-hard-sm space-y-2">
            <span className="font-mono text-[10px] text-bark uppercase">1. DEFAULT (LEAF #C8E096)</span>
            <Button variant="primary" className="w-full">
              Publish Artwork
            </Button>
          </div>

          <div className="p-4 rounded-[12px] bg-surface border-2 border-espresso shadow-hard-sm space-y-2">
            <span className="font-mono text-[10px] text-bark uppercase">2. HOVER (5PX SHADOW EXPANDS)</span>
            <Button
              variant="primary"
              className="w-full -translate-x-[1px] -translate-y-[1px] shadow-hard-lg"
            >
              Publish Artwork
            </Button>
          </div>

          <div className="p-4 rounded-[12px] bg-surface border-2 border-espresso shadow-hard-sm space-y-2">
            <span className="font-mono text-[10px] text-bark uppercase">3. PRESSED (0 SHADOW COLLAPSES)</span>
            <Button
              variant="primary"
              className="w-full translate-x-[3px] translate-y-[3px] shadow-none"
            >
              Publish Artwork
            </Button>
          </div>

          <div className="p-4 rounded-[12px] bg-surface border-2 border-espresso shadow-hard-sm space-y-2">
            <span className="font-mono text-[10px] text-bark uppercase">4. DISABLED (MIST FILL)</span>
            <Button variant="primary" disabled className="w-full">
              Fill Required Fields
            </Button>
          </div>

          <div className="p-4 rounded-[12px] bg-surface border-2 border-espresso shadow-hard-sm space-y-2">
            <span className="font-mono text-[10px] text-bark uppercase">5. LOADING (3 BOUNCING DOTS)</span>
            <Button variant="story" isLoading className="w-full">
              Analyzing Artwork
            </Button>
          </div>

          <div className="p-4 rounded-[12px] bg-surface border-2 border-espresso shadow-hard-sm space-y-2">
            <span className="font-mono text-[10px] text-bark uppercase">6. FOCUS (FOREST #3F5A2A RING)</span>
            <Button
              variant="secondary"
              className="w-full ring-2 ring-forest ring-offset-2"
            >
              Explore Artworks
            </Button>
          </div>
        </div>

        {/* All Variant Colors */}
        <div className="p-5 rounded-[16px] bg-surface border-2 border-espresso shadow-hard space-y-3">
          <h3 className="font-display font-bold text-sm text-espresso uppercase tracking-wider">
            All Variant Palettes
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary (Leaf)</Button>
            <Button variant="secondary">Secondary (White)</Button>
            <Button variant="story">Story (Sand)</Button>
            <Button variant="ai">AI (Sprout + Moss)</Button>
            <Button variant="danger">Danger (Clay)</Button>
            <Button variant="inverse">Inverse (Espresso)</Button>
            <Button variant="ghost">Ghost (Mist Hover)</Button>
            <Button size="icon" variant="secondary" aria-label="Notifications">
              <Bell className="w-5 h-5 stroke-espresso" />
            </Button>
          </div>
        </div>
      </section>

      {/* 5. Inputs, Search Pill, & Category Chips */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-espresso pb-2">
          <h2 className="text-h2 text-espresso">Form Inputs &amp; Category Filters</h2>
          <span className="font-mono text-xs text-bark">SOFT SEARCH • HARD CONTROLS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-[16px] bg-surface border-2 border-espresso shadow-hard">
          <div className="space-y-4">
            <div>
              <label className="text-label text-espresso block mb-1.5">
                Artwork Title (White, 2px Espresso Border, 10px Radius)
              </label>
              <Input
                placeholder="e.g. Kasavu Border Study in Ivory & Gold"
                defaultValue="Temple Lamp with Sesame Oil"
              />
            </div>

            <div>
              <label className="text-label text-espresso block mb-1.5">
                Spoken Story / Notes (Textarea)
              </label>
              <Textarea
                placeholder="Describe the cultural story, technique, or inspiration..."
                defaultValue="The natural vermilion and yellow ochre pigments are ground by hand on wet river stone."
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-label text-espresso block mb-1.5">
                Home Search Pill (Soft Mist Container, 48px, Zero Border, Zero Shadow)
              </label>
              <div className="w-full h-[48px] rounded-full bg-mist px-4 flex items-center gap-3">
                <Search className="w-5 h-5 stroke-bark flex-shrink-0" strokeWidth={2} />
                <input
                  type="text"
                  placeholder="Search artists, art, Kerala mural..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full bg-transparent text-sm text-espresso placeholder-bark outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-label text-espresso block mb-1.5">
                Category Chips (White 1.5px border • Selected Sand fill + 2px shadow)
              </label>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {["All", "Traditional", "Kerala mural", "Textiles", "Sculpture", "Handicrafts"].map(
                  (chip) => {
                    const isSelected = selectedChip === chip
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setSelectedChip(chip)}
                        className={`px-4 py-1.5 rounded-full font-body text-sm border-[1.5px] border-espresso transition-all cursor-pointer ${
                          isSelected
                            ? "bg-sand font-bold text-espresso shadow-[2px_2px_0px_var(--shadow-ink)]"
                            : "bg-surface font-semibold text-espresso hover:bg-mist"
                        }`}
                      >
                        {chip}
                      </button>
                    )
                  }
                )}
                {/* Plus Chip */}
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-full font-body font-bold text-sm border-[1.5px] border-espresso bg-surface text-espresso hover:bg-mist transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 stroke-espresso" strokeWidth={2.5} />
                  <span>More</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Badges & Avatar System */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-espresso pb-2">
          <h2 className="text-h2 text-espresso">Signature Badges &amp; Colored Avatar Rings</h2>
          <span className="font-mono text-xs text-bark">ZERO EMOJI UI • HASH RINGS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-[16px] bg-surface border-2 border-espresso shadow-hard">
          <div className="space-y-4">
            <h3 className="font-display font-bold text-sm text-espresso uppercase tracking-wider">
              Badges
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <AISuggestionBadge />
              <ProcessBadge />
              <FeaturedBadge />
              <StoryTag />
            </div>
            <p className="text-xs text-bark">
              Used strictly to identify AI suggestions, creative process stages, and authentic artist words.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-display font-bold text-sm text-espresso uppercase tracking-wider">
              Avatars (2px Espresso Border + Hash Ring)
            </h3>
            <div className="flex items-center gap-4">
              <ArtistAvatar
                artist={{ display_name: "Anjali Menon", id: "user_leaf" }}
                size="lg"
                ringOverride="leaf"
              />
              <ArtistAvatar
                artist={{ display_name: "Madhavan N.", id: "user_sand" }}
                size="lg"
                ringOverride="sand"
              />
              <ArtistAvatar
                artist={{ display_name: "Sunita Devi", id: "user_sprout" }}
                size="lg"
                ringOverride="sprout"
              />
              <ArtistAvatar
                artist={{ display_name: "Kavitha K.", id: "user_clay" }}
                size="lg"
                ringOverride="clay"
              />
            </div>
            <p className="text-xs text-bark">
              Four earth rings (Leaf, Sand, Sprout, Clay) assigned deterministically via user ID hash.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Asymmetric Feature Card & Quiet Artwork Card */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-espresso pb-2">
          <h2 className="text-h2 text-espresso">Feature Card &amp; Quiet Artwork Presentation</h2>
          <span className="font-mono text-xs text-bark">16PX RADIUS • BORDERLESS ART</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Feature Card */}
          <div className="space-y-2">
            <span className="font-mono text-[11px] font-bold text-bark uppercase">
              1. Full-Width Feature Card (4:5 Ratio + Sand-Tint Quote Block)
            </span>
            <FeatureCard artwork={sampleArtwork} />
          </div>

          {/* Quiet Artwork Card */}
          <div className="space-y-2">
            <span className="font-mono text-[11px] font-bold text-bark uppercase">
              2. Masonry Artwork Card (Zero Card Border • Quiet Presentation)
            </span>
            <div className="max-w-[340px] space-y-2">
              <div className="relative w-full aspect-[3/4] rounded-[16px] overflow-hidden bg-mist">
                <Image
                  src={sampleCardArtwork.image_url!}
                  alt={sampleCardArtwork.title}
                  fill
                  sizes="340px"
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute top-2 left-2">
                  <ProcessBadge />
                </div>
              </div>
              <div>
                <h3 className="font-body font-semibold text-[13px] leading-tight text-espresso line-clamp-1">
                  {sampleCardArtwork.title}
                </h3>
                <div className="mt-1 flex items-center gap-1.5">
                  <ArtistAvatar artist={sampleCardArtwork.artist} size="xs" ringOverride="sand" />
                  <span className="font-body text-[12px] text-bark">
                    {sampleCardArtwork.artist?.display_name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Story Block Specimen */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-espresso pb-2">
          <h2 className="text-h2 text-espresso">Artist Story Block</h2>
          <span className="font-mono text-xs text-bark">NEWSREADER ON SAND-TINT</span>
        </div>

        <StoryBlock
          quote="The natural vermilion and yellow ochre pigments are ground by hand on wet river stone. They breathe with the humidity and deepen with age."
          artist={sampleArtwork.artist!}
        >
          <Button size="sm" variant="secondary">
            View Journey
          </Button>
        </StoryBlock>
      </section>

      {/* 9. Interactive Modals: Toasts & Drawer */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-espresso pb-2">
          <h2 className="text-h2 text-espresso">Interactive Overlays: Toast &amp; Bottom Drawer</h2>
          <span className="font-mono text-xs text-bark">PHYSICAL STICKER MODALS</span>
        </div>

        <div className="p-6 rounded-[16px] bg-surface border-2 border-espresso shadow-hard flex flex-wrap items-center gap-4">
          <Button
            variant="story"
            onClick={() =>
              toast("Artwork Published!", {
                description: "Your listing is now live on Explore with AI tags applied.",
                action: {
                  label: "View Post",
                  onClick: () => console.log("Toast clicked"),
                },
              })
            }
          >
            Trigger Sonner Toast
          </Button>

          <Drawer>
            <DrawerTrigger
              render={
                <Button variant="secondary">Open Craft Drawer (24px Top Radius)</Button>
              }
            />
            <DrawerContent>
              <div className="max-w-md mx-auto p-6 space-y-4">
                <DrawerHeader className="px-0 pt-0">
                  <DrawerTitle className="text-h1 text-espresso">
                    Choose Craft Categories
                  </DrawerTitle>
                  <DrawerDescription className="text-body text-bark">
                    Select authentic art forms for your artwork listing.
                  </DrawerDescription>
                </DrawerHeader>

                <div className="flex flex-wrap gap-2 py-3">
                  {[
                    "Kerala Mural",
                    "Madhubani Painting",
                    "Kasavu Weaving",
                    "Bronze Bell Metal",
                    "Terracotta Pottery",
                    "Teak Woodcraft",
                  ].map((cat) => (
                    <span
                      key={cat}
                      className="px-3 py-1.5 rounded-full bg-surface border-2 border-espresso text-espresso text-xs font-bold shadow-hard-sm"
                    >
                      {cat}
                    </span>
                  ))}
                </div>

                <DrawerClose
                  render={
                    <Button variant="primary" className="w-full">
                      Done Selecting
                    </Button>
                  }
                />
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </section>

      {/* 10. Direct Comparison with Reference Screen Asset */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-espresso pb-2">
          <h2 className="text-h2 text-espresso">Pixel Comparison with Stitch Reference</h2>
          <span className="font-mono text-xs text-bark">GROUND TRUTH ASSET</span>
        </div>

        <div className="p-6 rounded-[16px] bg-surface border-2 border-espresso shadow-hard space-y-4">
          <p className="text-xs text-bark">
            The exported reference image (<code className="font-mono text-espresso">design-reference/screen.png</code>) is embedded below directly to verify identical color hex codes, sticker shadows, 16px artwork radii, and font hierarchies.
          </p>
          <div className="relative w-full aspect-square max-w-2xl mx-auto rounded-[16px] overflow-hidden border-2 border-espresso shadow-hard-sm bg-mist">
            <Image
              src="/design-reference/screen.png"
              alt="Stitch Reference Screen Specimen"
              fill
              sizes="(max-width: 768px) 100vw, 700px"
              className="object-contain"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
