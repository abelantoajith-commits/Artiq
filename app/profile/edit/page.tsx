import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditProfileForm } from "@/components/artiq/EditProfileForm";
import { ArrowLeft } from "lucide-react";
import { Artist } from "@/types/art";

export const dynamic = "force-dynamic";

export default async function EditProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

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
