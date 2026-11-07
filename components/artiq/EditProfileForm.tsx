"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { updateProfileAction } from "@/app/(auth)/actions";
import { VoiceButton } from "@/components/artiq/VoiceButton";
import { User, MapPin, BookOpen, AlertCircle, Phone, Mail, Home, Sparkles } from "lucide-react";
import { Artist } from "@/types/art";
import {
  ArtistAvatar,
  POPULAR_CRAFT_EMOJIS,
  isEmoji,
  getArtistEmoji,
} from "@/components/artiq/ArtistAvatar";

interface EditProfileFormProps {
  profile: Artist | null;
}

export function EditProfileForm({ profile }: EditProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, null);

  const [avatarUrl, setAvatarUrl] = useState(
    profile?.avatar_url && isEmoji(profile.avatar_url)
      ? profile.avatar_url
      : getArtistEmoji(profile)
  );
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [location, setLocation] = useState(profile?.location || "");
  const [intro, setIntro] = useState(profile?.intro || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [specialities, setSpecialities] = useState((profile?.specialities || []).join(", "));
  const [journey, setJourney] = useState(profile?.journey || "");
  const [inspiration, setInspiration] = useState(profile?.inspiration || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [email, setEmail] = useState(profile?.email || "");
  const [address, setAddress] = useState(profile?.address || "");

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-clay/15 border-2 border-clay text-ink text-sm flex items-start gap-2.5 font-medium"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-clay" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Craft Emoji Profile Picture */}
      <div className="p-4 rounded-2xl bg-canvas border-2 border-ink space-y-3 shadow-hard-sm">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-ink uppercase tracking-wider font-mono">
            Profile Picture (Craft Emoji)
          </label>
          <span className="text-[11px] text-ink font-bold flex items-center gap-1 font-mono uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Select suitable craft emoji</span>
          </span>
        </div>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="flex flex-col items-center gap-1">
            <ArtistAvatar emojiOverride={avatarUrl} size="2xl" />
            <span className="text-[10px] text-ink-soft font-mono font-bold">Selected</span>
          </div>
          <div className="space-y-1.5 flex-1 w-full text-center sm:text-left">
            <p className="text-xs text-ink-soft font-sans">
              Tap an emoji that best represents your traditional craft, tools, or art style:
            </p>
            <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start">
              {POPULAR_CRAFT_EMOJIS.map(({ emoji, label }) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatarUrl(emoji)}
                  title={label}
                  className={`btn-hard w-10 h-10 rounded-[10px] text-xl flex items-center justify-center border-2 border-ink transition-all ${
                    avatarUrl === emoji
                      ? "bg-sand shadow-hard-sm"
                      : "bg-white shadow-none hover:bg-mist"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
        <input type="hidden" name="avatar_url" value={avatarUrl} />
      </div>

      {/* Display Name */}
      <div>
        <label
          htmlFor="displayName"
          className="block text-xs font-bold text-ink uppercase tracking-wider font-mono mb-1.5"
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
            className="w-full px-4 py-3 pl-11 rounded-[10px] bg-white border-2 border-ink text-ink text-sm placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-forest min-h-[48px]"
          />
          <User className="w-5 h-5 text-ink-soft absolute left-3.5 top-3.5 stroke-[2]" />
        </div>
      </div>

      {/* Location */}
      <div>
        <label
          htmlFor="location"
          className="block text-xs font-bold text-ink uppercase tracking-wider font-mono mb-1.5"
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
            className="w-full px-4 py-3 pl-11 rounded-[10px] bg-white border-2 border-ink text-ink text-sm placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-forest min-h-[48px]"
          />
          <MapPin className="w-5 h-5 text-ink-soft absolute left-3.5 top-3.5 stroke-[2]" />
        </div>
      </div>

      {/* Portfolio Introduction (Top of profile) */}
      <div>
        <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
          <label
            htmlFor="intro"
            className="block text-xs font-bold text-ink uppercase tracking-wider font-mono"
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
          className="w-full px-4 py-3 rounded-[10px] bg-white border-2 border-ink text-ink text-sm font-serif placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-forest leading-relaxed"
        />
      </div>

      {/* Bio (Type or Speak) */}
      <div>
        <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
          <label
            htmlFor="bio"
            className="block text-xs font-bold text-ink uppercase tracking-wider font-mono"
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
          className="w-full px-4 py-3 rounded-[10px] bg-white border-2 border-ink text-ink text-sm placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-forest leading-relaxed"
        />
        <span className="text-[11px] text-ink-soft block text-right mt-1 font-mono">
          Max 500 characters
        </span>
      </div>

      {/* Specialities (Type or Speak) */}
      <div>
        <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
          <label
            htmlFor="specialities"
            className="block text-xs font-bold text-ink uppercase tracking-wider font-mono"
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
          className="w-full px-4 py-3 rounded-[10px] bg-white border-2 border-ink text-ink text-sm placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-forest min-h-[48px]"
        />
        {/* Tappable Speciality Suggestions */}
        <div className="mt-2 space-y-1">
          <span className="text-[11px] font-bold text-ink uppercase tracking-wider font-mono block">
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
                  className={`btn-hard px-2.5 py-1 rounded-[6px] text-[11px] font-mono font-bold transition-all ${
                    isIncluded
                      ? "bg-sand border border-ink text-ink shadow-hard-sm"
                      : "bg-white border border-ink text-ink hover:bg-mist"
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
            className="flex items-center gap-1.5 text-xs font-bold text-ink uppercase tracking-wider font-mono"
          >
            <BookOpen className="w-4 h-4 text-ink" />
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
          className="w-full px-4 py-3 rounded-[10px] bg-white border-2 border-ink text-ink text-sm font-serif leading-relaxed placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-forest"
        />
      </div>

      {/* Inspiration (Type or Speak) */}
      <div>
        <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
          <label
            htmlFor="inspiration"
            className="block text-xs font-bold text-ink uppercase tracking-wider font-mono"
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
          className="w-full px-4 py-3 rounded-[10px] bg-white border-2 border-ink text-ink text-sm leading-relaxed placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-forest"
        />
      </div>

      {/* Contact Details for Collectors */}
      <div className="pt-4 border-t-2 border-ink/15 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-ink uppercase tracking-wider font-mono">
            Contact Details for Collectors
          </h3>
          <p className="text-xs text-ink-soft mt-0.5 font-sans">
            Allow collectors and art enthusiasts to contact you directly via WhatsApp, phone, email, or studio visit.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="phone"
              className="block text-xs font-bold text-ink uppercase tracking-wider font-mono mb-1.5"
            >
              Phone / WhatsApp Number
            </label>
            <div className="relative">
              <input
                id="phone"
                name="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 94471 23456"
                className="w-full px-4 py-3 pl-11 rounded-[10px] bg-white border-2 border-ink text-ink text-sm placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-forest min-h-[48px]"
              />
              <Phone className="w-5 h-5 text-ink-soft absolute left-3.5 top-3.5 stroke-[2]" />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold text-ink uppercase tracking-wider font-mono mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. artist@example.com"
                className="w-full px-4 py-3 pl-11 rounded-[10px] bg-white border-2 border-ink text-ink text-sm placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-forest min-h-[48px]"
              />
              <Mail className="w-5 h-5 text-ink-soft absolute left-3.5 top-3.5 stroke-[2]" />
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="address"
            className="block text-xs font-bold text-ink uppercase tracking-wider font-mono mb-1.5"
          >
            Studio / Workshop Address
          </label>
          <div className="relative">
            <textarea
              id="address"
              name="address"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Studio 4, Temple Road, Kottayam, Kerala 686001"
              className="w-full px-4 py-3 pl-11 rounded-[10px] bg-white border-2 border-ink text-ink text-sm placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-forest leading-relaxed"
            />
            <Home className="w-5 h-5 text-ink-soft absolute left-3.5 top-3.5 stroke-[2]" />
          </div>
          <span className="text-[11px] text-ink-soft block mt-1 font-sans">
            Visible on your artwork pages so visitors can plan a studio visit.
          </span>
        </div>
      </div>

      {/* Save Action */}
      <div className="pt-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="btn-hard flex-1 py-3 px-6 rounded-[10px] bg-leaf text-ink font-bold shadow-hard min-h-[48px] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-forest"
        >
          {isPending ? "Saving changes…" : "Save changes"}
        </button>
        <Link
          href="/profile"
          className="btn-hard py-3 px-5 rounded-[10px] border-2 border-ink bg-white text-ink font-bold hover:bg-mist text-sm min-h-[48px] flex items-center justify-center shadow-hard-sm"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
