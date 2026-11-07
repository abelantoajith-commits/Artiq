import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/demo-session";
import { EditProfileForm } from "@/components/artiq/EditProfileForm";
import { ArrowLeft } from "lucide-react";
import { Artist } from "@/types/art";

export const dynamic = "force-dynamic";

export default async function EditProfilePage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const profile: Artist = {
    id: user.id,
    display_name: user.display_name,
    username: user.username,
    location: user.location || "Kerala, India",
    avatar_url: user.avatar_url || "🎨",
    bio: user.bio || "",
    journey: user.journey || "",
    specialities: user.specialities || [],
  };

  return (
    <div className="max-w-xl mx-auto py-4 sm:py-6 space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          className="p-2 rounded-xl border border-line bg-surface text-ink hover:bg-canvas transition-colors"
          aria-label="Back to profile"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink font-sans">
            Edit profile
          </h1>
          <p className="text-xs text-ink-soft">
            Update your artist identity and cultural background.
          </p>
        </div>
      </div>

      <div className="bg-surface border border-line rounded-3xl p-6 sm:p-8 shadow-sm">
        <EditProfileForm profile={(profile as Artist) || null} />
      </div>
    </div>
  );
}
