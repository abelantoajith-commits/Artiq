"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IdentityOutput } from "@/lib/ai/identity";
import { INTERVIEW_QUESTIONS } from "@/lib/identity/questions";
import { publishProfileFromInterviewAction } from "@/app/profile/interview-actions";
import { VoiceButton } from "@/components/artiq/VoiceButton";
import { toast } from "sonner";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  AlertCircle,
  HelpCircle,
  Loader2,
  BookOpen,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

import {
  ArtistAvatar,
  POPULAR_CRAFT_EMOJIS,
  getArtistEmoji,
} from "@/components/artiq/ArtistAvatar";
import { AISuggestionBadge } from "@/components/artiq/Badges";

interface ProfileReviewFormProps {
  initialDraft?: IdentityOutput | null;
  rawAnswers?: Record<string, string>;
}

export function ProfileReviewForm({
  initialDraft,
  rawAnswers: propRawAnswers,
}: ProfileReviewFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Lazy initializer to read initialDraft or sessionStorage
  const [draft] = useState<IdentityOutput | null>(() => {
    if (initialDraft) return initialDraft;
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("artiq_review_draft");
      if (stored) {
        try {
          return JSON.parse(stored) as IdentityOutput;
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  const [rawAnswers] = useState<Record<string, string>>(() => {
    if (propRawAnswers) return propRawAnswers;
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("artiq_review_answers");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return {};
        }
      }
    }
    return {};
  });

  // Section fields state
  const [displayName, setDisplayName] = useState(() => draft?.displayName || "");
  const [avatarUrl, setAvatarUrl] = useState(() => {
    return getArtistEmoji({
      display_name: draft?.displayName,
      specialities: draft?.specialities,
      bio: draft?.bio,
    });
  });
  const [location, setLocation] = useState(() => draft?.location || "");
  const [intro, setIntro] = useState(() => draft?.intro || "");
  const [bio, setBio] = useState(() => draft?.bio || "");
  const [journey, setJourney] = useState(() => draft?.journey || "");
  const [specialities, setSpecialities] = useState<string[]>(() => draft?.specialities || []);
  const [newSpecialityInput, setNewSpecialityInput] = useState("");
  const [inspiration, setInspiration] = useState(() => draft?.inspiration || "");
  const [phone, setPhone] = useState(() => draft?.phone || rawAnswers["contact"] || "");
  const [email, setEmail] = useState(() => draft?.email || "");
  const [address, setAddress] = useState(() => draft?.address || "");

  // AI suggestion badges state (removed once edited or accepted)
  const [isIntroAi, setIsIntroAi] = useState(true);
  const [isBioAi, setIsBioAi] = useState(true);
  const [isJourneyAi, setIsJourneyAi] = useState(true);
  const [isSpecialitiesAi, setIsSpecialitiesAi] = useState(true);
  const [isInspirationAi, setIsInspirationAi] = useState(true);

  // Expanded "What you said" sections
  const [expandedSource, setExpandedSource] = useState<Record<string, boolean>>({});

  // Clarifications / unclear items state
  const [unclearAnswers, setUnclearAnswers] = useState<Record<number, string>>({});

  // Error state
  const [publishError, setPublishError] = useState<string | null>(null);

  const toggleSource = (sectionKey: string) => {
    setExpandedSource((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const handleAddSpeciality = () => {
    const trimmed = newSpecialityInput.trim();
    if (trimmed && !specialities.includes(trimmed)) {
      setSpecialities((prev) => [...prev, trimmed]);
      setNewSpecialityInput("");
      setIsSpecialitiesAi(false);
    }
  };

  const handleRemoveSpeciality = (tag: string) => {
    setSpecialities((prev) => prev.filter((s) => s !== tag));
    setIsSpecialitiesAi(false);
  };

  const getSourceTextsForSection = (sectionKey: string): string[] => {
    if (!draft?.basedOn || !draft.basedOn[sectionKey]) return [];
    const questionIds = draft.basedOn[sectionKey];
    return questionIds
      .map((qId) => {
        const questionObj = INTERVIEW_QUESTIONS.find((q) => q.id === qId);
        const text = rawAnswers[qId];
        if (!text) return null;
        return `${questionObj?.title.en || qId}: "${text}"`;
      })
      .filter(Boolean) as string[];
  };

  const handlePublish = async () => {
    setPublishError(null);
    startTransition(async () => {
      const result = await publishProfileFromInterviewAction({
        displayName: displayName.trim(),
        location: location.trim(),
        intro: intro.trim(),
        bio: bio.trim(),
        journey: journey.trim(),
        specialities,
        inspiration: inspiration.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        avatar_url: avatarUrl,
      });

      if (!result.success) {
        setPublishError(result.error || "Failed to publish profile. Please try again.");
      } else {
        toast.success("Profile published");
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("artiq_review_draft");
          sessionStorage.removeItem("artiq_review_answers");
        }
        router.refresh();
        router.push("/profile");
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-8 animate-in fade-in duration-300 px-4">
      {/* Header */}
      <div className="space-y-2 border-b-2 border-ink/15 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-ink uppercase tracking-wider font-mono">
            Step 2: Review & Publish Portfolio
          </span>
          <AISuggestionBadge />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink font-display">
          Review your creative portfolio
        </h1>
        <p className="text-sm text-ink-soft leading-relaxed font-sans">
          Review your creative portfolio sections below. Your authentic words are the source of truth. You can edit any field before publishing to your profile.
        </p>
      </div>

      {/* Unclear Ambiguities Card */}
      {draft?.unclear && draft.unclear.length > 0 && (
        <div className="p-5 rounded-2xl bg-sand-tint border-2 border-ink space-y-3 shadow-hard-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-ink uppercase tracking-wider font-mono">
            <HelpCircle className="w-4 h-4 stroke-[2]" />
            <span>Points to Clarify (Optional)</span>
          </div>
          <p className="text-xs text-ink-soft font-sans">
            The AI noticed a couple of points that could be clearer. You can answer or disregard:
          </p>
          <div className="space-y-2.5 pt-1">
            {draft.unclear.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <label className="text-xs text-ink font-bold">
                  {item}
                </label>
                <input
                  type="text"
                  placeholder="Your clarification…"
                  value={unclearAnswers[idx] || ""}
                  onChange={(e) =>
                    setUnclearAnswers((prev) => ({ ...prev, [idx]: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-[10px] bg-white border-2 border-ink text-xs text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 0. Artist Details (Name & Location) */}
      <div className="bg-surface border-2 border-ink rounded-3xl p-6 space-y-4 shadow-hard">
        <h2 className="text-base font-bold text-ink font-display">
          Artist Identity & Location
        </h2>

        {/* Suitable Craft Emoji Profile Picture */}
        <div className="p-4 rounded-2xl bg-canvas border-2 border-ink space-y-2.5">
          <label className="block text-xs font-bold text-ink uppercase tracking-wider font-mono">
            Profile Picture (Signature Craft Emoji)
          </label>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <ArtistAvatar emojiOverride={avatarUrl} size="xl" />
            <div className="space-y-1 text-center sm:text-left flex-1">
              <span className="text-xs text-ink-soft block font-sans">
                Tap an emoji that best represents your art tradition:
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1.5 justify-center sm:justify-start">
                {POPULAR_CRAFT_EMOJIS.map(({ emoji, label }) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatarUrl(emoji)}
                    title={label}
                    className={`btn-hard w-10 h-10 rounded-[10px] text-lg flex items-center justify-center border-2 border-ink transition-all ${
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider font-mono mb-1.5">
              Artist / Studio Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Raghavan Master"
              className="w-full px-4 py-2.5 rounded-[10px] bg-white border-2 border-ink text-sm text-ink focus:outline-none focus:ring-2 focus:ring-forest min-h-[48px]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider font-mono mb-1.5">
              Location (Town, State)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Kottayam, Kerala"
              className="w-full px-4 py-2.5 rounded-[10px] bg-white border-2 border-ink text-sm text-ink focus:outline-none focus:ring-2 focus:ring-forest min-h-[48px]"
            />
          </div>
        </div>
      </div>

      {/* 1. Portfolio Introduction */}
      <div className="bg-sand-tint border-2 border-ink rounded-3xl p-6 space-y-4 shadow-hard">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-ink font-display">
              Portfolio Introduction
            </h2>
            {isIntroAi && intro && <AISuggestionBadge />}
          </div>
          <VoiceButton
            context="artist_bio"
            fieldLabel="portfolio intro"
            onAccept={(text) => {
              setIntro(text);
              setIsIntroAi(false);
            }}
          />
        </div>

        <p className="text-xs text-ink-soft font-sans">
          2 to 3 sentences shown prominently at the top of your public gallery profile.
        </p>

        <textarea
          rows={3}
          value={intro}
          onChange={(e) => {
            setIntro(e.target.value);
            setIsIntroAi(false);
          }}
          placeholder="A welcoming summary introducing your creative voice..."
          className="w-full p-3.5 rounded-[10px] bg-white border-2 border-ink text-sm text-ink font-serif leading-relaxed focus:outline-none focus:ring-2 focus:ring-forest"
        />

        {/* Source expander */}
        {getSourceTextsForSection("intro").length > 0 && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => toggleSource("intro")}
              className="text-xs text-ink hover:underline flex items-center gap-1 font-bold font-mono"
            >
              <span>What you said in the interview</span>
              {expandedSource["intro"] ? (
                <ChevronUp className="w-3.5 h-3.5 stroke-[2]" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 stroke-[2]" />
              )}
            </button>
            {expandedSource["intro"] && (
              <div className="mt-2 p-3 rounded-[10px] bg-white text-xs text-ink-soft border-2 border-ink/20 space-y-1 italic font-serif">
                {getSourceTextsForSection("intro").map((t, i) => (
                  <p key={i}>{t}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Key Skills & Traditions (Visual Tags) */}
      <div className="bg-surface border-2 border-ink rounded-3xl p-6 space-y-4 shadow-hard">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-ink font-display">
              Key Skills & Traditions (Visual Tags)
            </h2>
            {isSpecialitiesAi && specialities.length > 0 && <AISuggestionBadge />}
          </div>
        </div>

        <p className="text-xs text-ink-soft font-sans">
          Display the artist&apos;s skills, traditions, and materials as visual tags on your portfolio.
        </p>

        {/* Visual Chips list */}
        <div className="flex flex-wrap gap-2 pt-1">
          {specialities.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-sand-tint border border-ink text-xs font-mono font-bold text-ink uppercase shadow-hard-sm"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveSpeciality(tag)}
                className="text-ink hover:text-clay ml-0.5"
                aria-label={`Remove ${tag}`}
              >
                <X className="w-3.5 h-3.5 stroke-[2]" />
              </button>
            </span>
          ))}
        </div>

        {/* Quick-add suggestions */}
        <div className="pt-2 border-t-2 border-ink/15">
          <span className="text-[11px] font-bold text-ink uppercase tracking-wider font-mono block mb-1.5">
            Suggested visual tags (tap to add):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              "Kerala Mural",
              "Traditional Painting",
              "Natural Pigments",
              "Mythological Art",
              "Fresco-secco",
              "Kasavu Handloom",
              "Lost-wax Bronze",
              "Madhubani Art",
              "Terracotta",
              "Wood Carving",
            ].map((tag) => {
              const alreadyHas = specialities.some(
                (s) => s.toLowerCase() === tag.toLowerCase()
              );
              if (alreadyHas) return null;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSpecialities((prev) => [...prev, tag]);
                    setIsSpecialitiesAi(false);
                  }}
                  className="btn-hard px-2.5 py-1 rounded-[6px] bg-white border border-ink text-[11px] font-mono font-bold text-ink hover:bg-mist transition-all min-h-[30px]"
                >
                  + {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Add custom tag input */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            placeholder="Add custom visual tag (e.g. Natural Resin, Kalamkari)…"
            value={newSpecialityInput}
            onChange={(e) => setNewSpecialityInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddSpeciality();
              }
            }}
            className="flex-1 px-3 py-2 rounded-[10px] bg-white border-2 border-ink text-xs text-ink focus:outline-none focus:ring-2 focus:ring-forest min-h-[44px]"
          />
          <button
            type="button"
            onClick={handleAddSpeciality}
            className="btn-hard flex items-center gap-1 px-4 py-2 rounded-[10px] bg-white border-2 border-ink text-xs font-bold text-ink hover:bg-mist shadow-hard-sm min-h-[44px]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2]" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* 3. Artist Bio */}
      <div className="bg-surface border-2 border-ink rounded-3xl p-6 space-y-4 shadow-hard">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-ink font-display">
              Artist Bio
            </h2>
            {isBioAi && bio && <AISuggestionBadge />}
          </div>
          <VoiceButton
            context="artist_bio"
            fieldLabel="artist bio"
            onAccept={(text) => {
              setBio(text);
              setIsBioAi(false);
            }}
          />
        </div>

        <textarea
          rows={4}
          value={bio}
          onChange={(e) => {
            setBio(e.target.value);
            setIsBioAi(false);
          }}
          placeholder="A short professional introduction about who you are as an artist..."
          className="w-full p-3.5 rounded-[10px] bg-white border-2 border-ink text-sm text-ink leading-relaxed focus:outline-none focus:ring-2 focus:ring-forest"
        />

        {getSourceTextsForSection("bio").length > 0 && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => toggleSource("bio")}
              className="text-xs text-ink hover:underline flex items-center gap-1 font-bold font-mono"
            >
              <span>What you said in the interview</span>
              {expandedSource["bio"] ? (
                <ChevronUp className="w-3.5 h-3.5 stroke-[2]" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 stroke-[2]" />
              )}
            </button>
            {expandedSource["bio"] && (
              <div className="mt-2 p-3 rounded-[10px] bg-canvas text-xs text-ink-soft border-2 border-ink/20 space-y-1 italic font-serif">
                {getSourceTextsForSection("bio").map((t, i) => (
                  <p key={i}>{t}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. My Journey */}
      <div className="bg-sand-tint border-2 border-ink rounded-3xl p-6 space-y-4 shadow-hard">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-ink uppercase tracking-wider font-mono">
              <BookOpen className="w-4 h-4 text-ink" />
              <span>My Art Journey</span>
            </div>
            {isJourneyAi && journey && <AISuggestionBadge />}
          </div>
          <VoiceButton
            context="journey"
            fieldLabel="art journey"
            onAccept={(text) => {
              setJourney(text);
              setIsJourneyAi(false);
            }}
          />
        </div>

        <textarea
          rows={5}
          value={journey}
          onChange={(e) => {
            setJourney(e.target.value);
            setIsJourneyAi(false);
          }}
          placeholder="How did you learn your craft? Who guided you and how long have you been practising?"
          className="w-full p-3.5 rounded-[10px] bg-white border-2 border-ink text-sm text-ink font-serif leading-relaxed italic focus:outline-none focus:ring-2 focus:ring-forest"
        />

        {getSourceTextsForSection("journey").length > 0 && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => toggleSource("journey")}
              className="text-xs text-ink hover:underline flex items-center gap-1 font-bold font-mono"
            >
              <span>What you said in the interview</span>
              {expandedSource["journey"] ? (
                <ChevronUp className="w-3.5 h-3.5 stroke-[2]" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 stroke-[2]" />
              )}
            </button>
            {expandedSource["journey"] && (
              <div className="mt-2 p-3 rounded-[10px] bg-white text-xs text-ink-soft border-2 border-ink/20 space-y-1 italic font-serif">
                {getSourceTextsForSection("journey").map((t, i) => (
                  <p key={i}>{t}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Inspiration */}
      <div className="bg-surface border-2 border-ink rounded-3xl p-6 space-y-4 shadow-hard">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-ink font-display">
              Inspiration
            </h2>
            {isInspirationAi && inspiration && <AISuggestionBadge />}
          </div>
          <VoiceButton
            context="artist_bio"
            fieldLabel="inspiration"
            onAccept={(text) => {
              setInspiration(text);
              setIsInspirationAi(false);
            }}
          />
        </div>

        <textarea
          rows={4}
          value={inspiration}
          onChange={(e) => {
            setInspiration(e.target.value);
            setIsInspirationAi(false);
          }}
          placeholder="What inspires your creations? Nature, temples, folklore, or human emotions?"
          className="w-full p-3.5 rounded-[10px] bg-white border-2 border-ink text-sm text-ink leading-relaxed focus:outline-none focus:ring-2 focus:ring-forest"
        />

        {getSourceTextsForSection("inspiration").length > 0 && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => toggleSource("inspiration")}
              className="text-xs text-ink hover:underline flex items-center gap-1 font-bold font-mono"
            >
              <span>What you said in the interview</span>
              {expandedSource["inspiration"] ? (
                <ChevronUp className="w-3.5 h-3.5 stroke-[2]" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 stroke-[2]" />
              )}
            </button>
            {expandedSource["inspiration"] && (
              <div className="mt-2 p-3 rounded-[10px] bg-white text-xs text-ink-soft border-2 border-ink/20 space-y-1 italic font-serif">
                {getSourceTextsForSection("inspiration").map((t, i) => (
                  <p key={i}>{t}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contact Details Section */}
      <div className="bg-surface border-2 border-ink rounded-3xl p-5 sm:p-6 space-y-4 shadow-hard">
        <div>
          <h2 className="text-base font-bold text-ink font-display">Contact Details for Art Lovers & Collectors</h2>
          <p className="text-xs text-ink-soft mt-0.5 font-sans">
            Allow collectors to contact you directly via phone, WhatsApp, email, or visit your studio.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="contactPhone" className="block text-xs font-bold text-ink uppercase tracking-wider font-mono mb-1.5">
              Phone / WhatsApp Number
            </label>
            <div className="relative">
              <input
                id="contactPhone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 94471 23456"
                className="w-full px-4 py-2.5 pl-10 rounded-[10px] bg-white border-2 border-ink text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-forest min-h-[48px]"
              />
              <Phone className="w-4 h-4 text-ink-soft absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label htmlFor="contactEmail" className="block text-xs font-bold text-ink uppercase tracking-wider font-mono mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                id="contactEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. artist@artiq.gallery"
                className="w-full px-4 py-2.5 pl-10 rounded-[10px] bg-white border-2 border-ink text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-forest min-h-[48px]"
              />
              <Mail className="w-4 h-4 text-ink-soft absolute left-3.5 top-3.5" />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="contactAddress" className="block text-xs font-bold text-ink uppercase tracking-wider font-mono mb-1.5">
            Studio / Workshop Address
          </label>
          <div className="relative">
            <input
              id="contactAddress"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Temple Road, West Gate, Kottayam, Kerala 686001"
              className="w-full px-4 py-2.5 pl-10 rounded-[10px] bg-white border-2 border-ink text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-forest min-h-[48px]"
            />
            <MapPin className="w-4 h-4 text-ink-soft absolute left-3.5 top-3.5" />
          </div>
        </div>
      </div>

      {/* Error alert */}
      {publishError && (
        <div className="p-4 rounded-xl bg-clay/15 border-2 border-clay text-ink text-sm flex items-start gap-2 font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-clay" />
          <span>{publishError}</span>
        </div>
      )}

      {/* Publish Profile Action */}
      <div className="pt-4 border-t-2 border-ink/15 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => router.push("/profile/interview")}
          disabled={isPending}
          className="btn-hard w-full sm:w-auto py-3 px-5 rounded-[10px] border-2 border-ink bg-white text-ink text-sm font-bold hover:bg-mist shadow-hard-sm min-h-[48px]"
        >
          Back to questions
        </button>

        <button
          type="button"
          onClick={handlePublish}
          disabled={isPending}
          className="btn-hard w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-8 rounded-[10px] bg-leaf text-ink text-sm font-bold shadow-hard min-h-[48px]"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-ink" />
              <span>Publishing profile…</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Publish Portfolio</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
