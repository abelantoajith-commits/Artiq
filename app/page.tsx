import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Welcome */}
      <section className="bg-surface border border-line rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ai/10 text-ai text-xs font-medium mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Phase 0: Foundation Active</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink font-sans">
          ARTIQ
        </h1>
        <p className="text-lg text-ink-soft mt-1 font-serif">
          Every Artist Deserves to Be Seen.
        </p>

        {/* Malayalam Font Check */}
        <div className="mt-4 p-4 rounded-xl bg-canvas border border-line">
          <p className="text-sm text-ink-soft">Malayalam typography test:</p>
          <p className="text-base text-ink font-sans mt-1">
            ഓരോ കലാകാരനും കാണപ്പെടാൻ അർഹതയുണ്ട്.
          </p>
          <p className="text-sm text-ink-soft font-serif mt-1">
            പരമ്പരാഗതവും സ്വതന്ത്രവുമായ കലാകാരന്മാരുടെ കഥകൾ ലോകത്തോട് പങ്കുവെക്കൂ.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/create"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-95 transition-opacity"
          >
            <span>Create Artwork</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="/api/health"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-line bg-surface text-ink hover:bg-canvas transition-colors font-medium text-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-ai" />
            <span>Check /api/health</span>
          </a>
        </div>
      </section>

      {/* Design System & Token Verification Card */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-ink">
          Design Tokens & Palette
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl border border-line bg-surface">
            <div className="w-6 h-6 rounded-md bg-primary mb-2" />
            <p className="text-xs font-semibold text-ink">Primary Indigo</p>
            <p className="text-[11px] text-ink-soft">#2E3A87</p>
          </div>
          <div className="p-4 rounded-xl border border-line bg-surface">
            <div className="w-6 h-6 rounded-md bg-story mb-2" />
            <p className="text-xs font-semibold text-ink">Story Turmeric</p>
            <p className="text-[11px] text-ink-soft">#D99A1E</p>
          </div>
          <div className="p-4 rounded-xl border border-line bg-surface">
            <div className="w-6 h-6 rounded-md bg-ai mb-2" />
            <p className="text-xs font-semibold text-ink">AI Verdigris</p>
            <p className="text-[11px] text-ink-soft">#1F7A6A</p>
          </div>
          <div className="p-4 rounded-xl border border-line bg-surface">
            <div className="w-6 h-6 rounded-md bg-danger mb-2" />
            <p className="text-xs font-semibold text-ink">Danger Madder</p>
            <p className="text-[11px] text-ink-soft">#B23A48</p>
          </div>
        </div>
      </section>
    </div>
  );
}
