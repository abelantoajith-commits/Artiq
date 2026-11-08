"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Edit3, Trash2, AlertTriangle, Loader2, X, Check } from "lucide-react";
import { Artist } from "@/types/art";
import {
  updateArtistProfileByMasterAction,
  deleteArtistProfileByMasterAction,
} from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface MasterArtistModeratorProps {
  artist: Artist;
}

export function MasterArtistModerator({ artist }: MasterArtistModeratorProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [displayName, setDisplayName] = useState(artist.display_name || "");
  const [location, setLocation] = useState(artist.location || "");
  const [phone, setPhone] = useState(artist.phone || "");
  const [email, setEmail] = useState(artist.email || "");
  const [address, setAddress] = useState(artist.address || "");
  const [bio, setBio] = useState(artist.bio || "");
  const [intro, setIntro] = useState(artist.intro || "");
  const [journey, setJourney] = useState(artist.journey || "");
  const [inspiration, setInspiration] = useState(artist.inspiration || "");
  const [specialities, setSpecialities] = useState((artist.specialities || []).join(", "));

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteArtistProfileByMasterAction(artist.username);
      if (res.success) {
        toast.success(`Artist profile @${artist.username} removed.`);
        router.push("/");
      } else {
        toast.error(res.error || "Failed to delete artist profile.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Delete failed: ${msg}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error("Display name is required.");
      return;
    }

    setIsSaving(true);
    const formData = new FormData();
    formData.set("targetUsername", artist.username);
    formData.set("displayName", displayName.trim());
    formData.set("location", location.trim());
    formData.set("phone", phone.trim());
    formData.set("email", email.trim());
    formData.set("address", address.trim());
    formData.set("bio", bio.trim());
    formData.set("intro", intro.trim());
    formData.set("journey", journey.trim());
    formData.set("inspiration", inspiration.trim());
    formData.set("specialities", specialities.trim());

    try {
      const res = await updateArtistProfileByMasterAction(null, formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(`Profile @${artist.username} updated.`);
        setIsEditOpen(false);
        router.refresh();
      }
    } catch (err: unknown) {
      if ((err as Error)?.message?.includes("NEXT_REDIRECT")) {
        toast.success(`Profile @${artist.username} updated.`);
        setIsEditOpen(false);
        return;
      }
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Save failed: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Master Moderation Ribbon */}
      <aside aria-label="Master Curator Controls" className="p-4 rounded-[16px] bg-sand-tint border-2 border-espresso shadow-hard-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-sand border-2 border-espresso flex items-center justify-center text-espresso shadow-hard-sm flex-shrink-0">
            <ShieldCheck className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-bold text-espresso uppercase tracking-wider bg-sand px-2 py-0.5 rounded-[4px] border border-espresso">
                👑 Master Curator
              </span>
              <p className="font-display font-bold text-sm text-espresso">
                Moderating @{artist.username}
              </p>
            </div>
            <p className="font-body text-xs text-bark mt-0.5">
              Full administrator rights: edit any artist field or remove profile.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="btn-hard h-10 px-3.5 rounded-[10px] bg-sand border-2 border-espresso text-espresso font-body font-bold text-xs shadow-hard-sm inline-flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-forest"
          >
            <Edit3 className="w-3.5 h-3.5 stroke-espresso" strokeWidth={2} />
            <span>Edit Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDeleteOpen(true)}
            className="btn-hard h-10 px-3.5 rounded-[10px] bg-clay border-2 border-espresso text-espresso font-body font-bold text-xs shadow-hard-sm inline-flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-forest"
          >
            <Trash2 className="w-3.5 h-3.5 stroke-espresso" strokeWidth={2} />
            <span>Delete Profile</span>
          </button>
        </div>
      </aside>

      {/* Edit Profile Modal */}
      {isEditOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-espresso/50 flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto"
          onClick={() => setIsEditOpen(false)}
        >
          <div
            className="bg-surface border-2 border-espresso rounded-[24px] max-w-lg w-full p-6 space-y-4 shadow-hard-lg animate-in zoom-in-95 duration-150 my-8 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b-2 border-espresso/15">
              <div className="flex items-center gap-2">
                <span className="text-xl">👑</span>
                <div>
                  <h2 className="font-display font-bold text-base text-espresso">
                    Edit Artist Profile (Master)
                  </h2>
                  <p className="font-mono text-[11px] text-bark">@{artist.username}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="w-8 h-8 rounded-[8px] bg-mist border-2 border-espresso flex items-center justify-center text-espresso hover:bg-surface transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2]" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-left max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="block font-mono text-[11px] font-bold text-espresso uppercase tracking-wider mb-1">
                  Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[10px] bg-white border-2 border-espresso text-espresso text-sm font-body focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold text-espresso uppercase tracking-wider mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Kottayam, Kerala"
                  className="w-full px-3.5 py-2.5 rounded-[10px] bg-white border-2 border-espresso text-espresso text-sm font-body focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] font-bold text-espresso uppercase tracking-wider mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[10px] bg-white border-2 border-espresso text-espresso text-sm font-body focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold text-espresso uppercase tracking-wider mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[10px] bg-white border-2 border-espresso text-espresso text-sm font-body focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold text-espresso uppercase tracking-wider mb-1">
                  Studio Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[10px] bg-white border-2 border-espresso text-espresso text-sm font-body focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold text-espresso uppercase tracking-wider mb-1">
                  Bio
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[10px] bg-white border-2 border-espresso text-espresso text-sm font-body focus:outline-none focus:ring-2 focus:ring-forest resize-y"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold text-espresso uppercase tracking-wider mb-1">
                  Portfolio Intro (Serif)
                </label>
                <textarea
                  rows={2}
                  value={intro}
                  onChange={(e) => setIntro(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[10px] bg-white border-2 border-espresso text-espresso text-sm font-body focus:outline-none focus:ring-2 focus:ring-forest resize-y"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold text-espresso uppercase tracking-wider mb-1">
                  Journey / Story (In Artist&apos;s Words)
                </label>
                <textarea
                  rows={3}
                  value={journey}
                  onChange={(e) => setJourney(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[10px] bg-white border-2 border-espresso text-espresso text-sm font-body focus:outline-none focus:ring-2 focus:ring-forest resize-y"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold text-espresso uppercase tracking-wider mb-1">
                  Inspiration
                </label>
                <textarea
                  rows={2}
                  value={inspiration}
                  onChange={(e) => setInspiration(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[10px] bg-white border-2 border-espresso text-espresso text-sm font-body focus:outline-none focus:ring-2 focus:ring-forest resize-y"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold text-espresso uppercase tracking-wider mb-1">
                  Heritage Specialities (comma separated)
                </label>
                <input
                  type="text"
                  value={specialities}
                  onChange={(e) => setSpecialities(e.target.value)}
                  placeholder="Kerala mural, Fresco-secco, Natural pigments"
                  className="w-full px-3.5 py-2.5 rounded-[10px] bg-white border-2 border-espresso text-espresso text-sm font-body focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t-2 border-espresso/15">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSaving}
                  className="gap-1.5"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving…</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Save Profile</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-espresso/50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsDeleteOpen(false)}
        >
          <div
            className="bg-surface border-2 border-espresso rounded-[24px] max-w-sm w-full p-6 space-y-4 shadow-hard-lg animate-in zoom-in-95 duration-150 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[10px] bg-clay border-2 border-espresso flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 stroke-espresso" strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-espresso">
                  Delete Artist Profile?
                </h3>
                <span className="font-mono text-[10px] text-bark uppercase font-bold">
                  👑 Master Curator Action
                </span>
              </div>
            </div>
            <p className="font-body text-xs text-bark leading-relaxed">
              Are you sure you want to permanently delete <strong>@{artist.username}</strong> ({artist.display_name})? This will remove the artist and their profile from the gallery.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsDeleteOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="gap-1.5"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isDeleting ? "Deleting…" : "Yes, Delete Profile"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

