"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { updateProfileAction } from "@/app/(auth)/actions";
import { VoiceButton } from "@/components/artiq/VoiceButton";
import { User, MapPin, BookOpen, AlertCircle } from "lucide-react";
import { Artist } from "@/types/art";

interface EditProfileFormProps {
  profile: Artist | null;
}

export function EditProfileForm({ profile }: EditProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, null);

  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [location, setLocation] = useState(profile?.location || "");
  const [intro, setIntro] = useState(profile?.intro || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [specialities, setSpecialities] = useState((profile?.specialities || []).join(", "));
  const [journey, setJourney] = useState(profile?.journey || "");
  const [inspiration, setInspiration] = useState(profile?.inspiration || "");

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Display Name */}
      <div>
        <label
          htmlFor="displayName"
          className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5"
        >
          Display name
        </label>
        <div className="relative">
          <input
            id="displayName"
            name="displayName"
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name or studio name"
            className="w-full px-4 py-3 pl-11 rounded-xl bg-canvas border border-line text-ink text-sm placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
          />
          <User className="w-5 h-5 text-ink-soft absolute left-3.5 top-3" />
        </div>
      </div>

      {/* Location */}
      <div>
        <label
          htmlFor="location"
          className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5"
        >
          Location / Region
        </label>
        <div className="relative">
          <input
            id="location"
            name="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Thrissur, Kerala"
            className="w-full px-4 py-3 pl-11 rounded-xl bg-canvas border border-line text-ink text-sm placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
          />
          <MapPin className="w-5 h-5 text-ink-soft absolute left-3.5 top-3" />
        </div>
      </div>

      {/* Portfolio Introduction (Top of profile) */}
      <div>
        <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
          <label
            htmlFor="intro"
            className="block text-xs font-semibold text-ink uppercase tracking-wider"
          >
            Portfolio Introduction
          </label>
          <VoiceButton
            context="artist_bio"
            fieldLabel="portfolio intro"
            onAccept={(spokenIntro) => setIntro(spokenIntro)}
          />
        </div>
        <textarea
          id="intro"
          name="intro"
          rows={2}
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
          placeholder="2 to 3 sentences welcoming visitors at the top of your profile…"
          className="w-full px-4 py-3 rounded-xl bg-canvas border border-line text-ink text-sm placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
        />
      </div>

      {/* Bio (Type or Speak) */}
      <div>
        <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
          <label
            htmlFor="bio"
            className="block text-xs font-semibold text-ink uppercase tracking-wider"
          >
            Artist bio (Type or Speak)
          </label>
          <VoiceButton
            context="artist_bio"
            fieldLabel="bio"
            onAccept={(spokenBio) => setBio(spokenBio)}
          />
        </div>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell visitors about your passion, tradition, and craft…"
          className="w-full px-4 py-3 rounded-xl bg-canvas border border-line text-ink text-sm placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
        />
        <span className="text-[11px] text-ink-soft block text-right mt-1">
          Max 500 characters
        </span>
      </div>

      {/* Specialities (Type or Speak) */}
      <div>
        <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
          <label
            htmlFor="specialities"
            className="block text-xs font-semibold text-ink uppercase tracking-wider"
          >
            Specialities & Art Forms (Type or Speak)
          </label>
          <VoiceButton
            context="specialities"
            fieldLabel="specialities"
            onAccept={(spokenSpec) => setSpecialities(spokenSpec)}
          />
        </div>
        <input
          id="specialities"
          name="specialities"
          type="text"
          value={specialities}
          onChange={(e) => setSpecialities(e.target.value)}
          placeholder="e.g. Kerala mural, Natural pigments, Temple frescoes"
          className="w-full px-4 py-3 rounded-xl bg-canvas border border-line text-ink text-sm placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
        />
        {/* Tappable Speciality Suggestions */}
        <div className="mt-2 space-y-1">
          <span className="text-[11px] font-medium text-ink-soft block">
            Tap to add to your specialities:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              "Kerala Mural",
              "Kasavu Handloom",
              "Lost-wax Bronze",
              "Madhubani Art",
              "Terracotta",
              "Natural Pigments",
              "Wood Carving",
              "Temple Frescoes",
            ].map((spec) => {
              const isIncluded = specialities.toLowerCase().includes(spec.toLowerCase());
              return (
                <button
                  key={spec}
                  type="button"
                  onClick={() => {
                    if (isIncluded) {
                      const filtered = specialities
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s.toLowerCase() !== spec.toLowerCase())
                        .join(", ");
                      setSpecialities(filtered);
                    } else {
                      setSpecialities((prev) => (prev ? `${prev}, ${spec}` : spec));
                    }
                  }}
                  className={`px-2 py-0.5 rounded-md text-[11px] transition-all ${
                    isIncluded
                      ? "bg-primary text-primary-foreground font-medium"
                      : "bg-canvas border border-line hover:border-primary/40 text-ink-soft hover:text-ink"
                  }`}
                >
                  {isIncluded ? "✓ " : "+ "}
                  {spec}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Art Journey (Type or Speak) */}
      <div>
        <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
          <label
            htmlFor="journey"
            className="flex items-center gap-1.5 text-xs font-semibold text-story uppercase tracking-wider"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>My art journey (Type or Speak)</span>
          </label>
          <VoiceButton
            context="journey"
            fieldLabel="art journey"
            onAccept={(spokenJourney) => setJourney(spokenJourney)}
          />
        </div>
        <textarea
          id="journey"
          name="journey"
          rows={4}
          value={journey}
          onChange={(e) => setJourney(e.target.value)}
          placeholder="Share the story of how you learned your craft, the ancestors who guided you, or the philosophy behind your creations…"
          className="w-full px-4 py-3 rounded-xl bg-canvas border border-line text-ink text-sm font-serif leading-relaxed placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Inspiration (Type or Speak) */}
      <div>
        <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
          <label
            htmlFor="inspiration"
            className="block text-xs font-semibold text-ink uppercase tracking-wider"
          >
            Inspiration (Type or Speak)
          </label>
          <VoiceButton
            context="artist_bio"
            fieldLabel="inspiration"
            onAccept={(spokenInsp) => setInspiration(spokenInsp)}
          />
        </div>
        <textarea
          id="inspiration"
          name="inspiration"
          rows={3}
          value={inspiration}
          onChange={(e) => setInspiration(e.target.value)}
          placeholder="What inspires your creations? Nature, temples, folklore, or human emotions?…"
          className="w-full px-4 py-3 rounded-xl bg-canvas border border-line text-ink text-sm leading-relaxed placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Save Action */}
      <div className="pt-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 py-3 px-6 rounded-xl bg-primary text-primary-foreground font-medium shadow-sm hover:opacity-95 transition-all min-h-[44px] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          {isPending ? "Saving changes…" : "Save changes"}
        </button>
        <Link
          href="/profile"
          className="py-3 px-5 rounded-xl border border-line bg-canvas text-ink hover:bg-surface text-sm font-medium transition-colors min-h-[44px] flex items-center justify-center"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
