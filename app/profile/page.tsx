import Link from "next/link";
import { User, Settings, Grid3X3, Bookmark } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Header Profile Info */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-ink">Profile</h1>
        <button
          aria-label="Settings"
          className="p-2 rounded-xl text-ink-soft hover:text-ink hover:bg-surface border border-transparent hover:border-line transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-4 p-4 rounded-2xl border border-line bg-surface">
        <div className="w-16 h-16 rounded-full bg-line flex items-center justify-center text-ink-soft">
          <User className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-ink">Artist Profile</h2>
          <p className="text-xs text-ink-soft">@artist · Kerala, India</p>
          <p className="text-xs text-ink-soft mt-1">
            Authentication and user profiles active in Phase 2.
          </p>
        </div>
      </div>

      {/* Tabs Placeholder */}
      <div className="border-b border-line flex gap-6 px-2">
        <button className="flex items-center gap-2 pb-3 border-b-2 border-primary text-primary font-semibold text-sm">
          <Grid3X3 className="w-4 h-4" />
          <span>Artworks</span>
        </button>
        <button className="flex items-center gap-2 pb-3 text-ink-soft font-normal text-sm hover:text-ink">
          <Bookmark className="w-4 h-4" />
          <span>Saved</span>
        </button>
      </div>

      <div className="text-center py-12 border border-dashed border-line rounded-2xl">
        <p className="text-sm text-ink-soft">No artworks yet</p>
        <Link
          href="/create"
          className="mt-3 inline-flex items-center text-xs font-semibold text-primary hover:underline"
        >
          Add your first piece →
        </Link>
      </div>
    </div>
  );
}
