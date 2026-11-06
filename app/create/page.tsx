import Link from "next/link";
import { Camera, Image as ImageIcon, Mic } from "lucide-react";

export default function CreatePage() {
  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          Add to your gallery
        </h1>
        <p className="text-sm text-ink-soft mt-1">
          Share your craft with the world. (Core upload flow launches in Phase 3)
        </p>
      </div>

      <div className="space-y-3">
        {/* Action 1: Photo */}
        <div className="p-4 rounded-xl border border-line bg-surface flex items-center gap-4 opacity-80 hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold text-ink text-sm">Take a photo</h2>
            <p className="text-xs text-ink-soft">Capture using device camera</p>
          </div>
        </div>

        {/* Action 2: Gallery */}
        <div className="p-4 rounded-xl border border-line bg-surface flex items-center gap-4 opacity-80 hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold text-ink text-sm">Upload from gallery</h2>
            <p className="text-xs text-ink-soft">Choose high quality photos</p>
          </div>
        </div>

        {/* Action 3: Voice Story */}
        <div className="p-4 rounded-xl border border-line bg-surface flex items-center gap-4 opacity-80 hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-story/15 flex items-center justify-center text-story">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold text-ink text-sm">Tell your story</h2>
            <p className="text-xs text-ink-soft">Speak in Malayalam or English</p>
          </div>
        </div>
      </div>

      <div className="pt-4 text-center">
        <Link
          href="/"
          className="text-sm text-primary hover:underline font-medium"
        >
          ← Back to Explore
        </Link>
      </div>
    </div>
  );
}
