"use client";

import { Artist } from "@/types/art";
import { MessageCircle, Phone, Mail, MapPin, ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";

interface ContactArtistCardProps {
  artist?: Artist | null;
  artworkTitle?: string;
  className?: string;
}

export function ContactArtistCard({
  artist,
  artworkTitle = "this artwork",
  className = "",
}: ContactArtistCardProps) {
  if (!artist) {
    return null;
  }

  const phone = artist.phone?.trim();
  const email = artist.email?.trim();
  const address = artist.address?.trim();
  const location = artist.location?.trim();

  // Clean phone number for WhatsApp wa.me links (digits only)
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, "") : "";

  const whatsappMessage = encodeURIComponent(
    `Hello ${artist.display_name || "Artist"}, I saw your artwork "${artworkTitle}" on ARTIQ and would love to inquire about it.`
  );

  const emailSubject = encodeURIComponent(`Inquiry regarding "${artworkTitle}" on ARTIQ`);
  const emailBody = encodeURIComponent(
    `Hello ${artist.display_name || "Artist"},\n\nI am interested in inquiring about your artwork "${artworkTitle}" featured on ARTIQ.\n\nCould you please share details on availability, pricing, or custom commissions?\n\nWarm regards,`
  );

  const hasAnyContact = Boolean(phone || email || address || location);

  return (
    <section
      aria-label="Contact the Artist"
      className={`rounded-2xl border border-line bg-surface/80 p-5 sm:p-6 shadow-sm space-y-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-ink tracking-tight">
              Contact the Artist
            </h3>
          </div>
          <p className="text-xs text-ink-soft mt-1 leading-relaxed">
            Connect directly with <strong className="text-ink font-semibold">{artist.display_name}</strong> to inquire about acquiring this piece, commissioning custom work, or scheduling a studio visit.
          </p>
        </div>
      </div>

      {hasAnyContact ? (
        <div className="space-y-3 pt-1">
          {/* Action Buttons: WhatsApp & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {phone && cleanPhone && (
              <a
                href={`https://wa.me/${cleanPhone}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm shadow-sm transition-all min-h-[44px] active:scale-[0.98]"
              >
                <MessageCircle className="w-4 h-4 flex-shrink-0" />
                <span>Chat on WhatsApp</span>
              </a>
            )}

            {phone && (
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-line bg-canvas hover:bg-surface text-ink font-medium text-xs sm:text-sm transition-colors min-h-[44px] active:scale-[0.98]"
              >
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Call {phone}</span>
              </a>
            )}

            {email && (
              <a
                href={`mailto:${email}?subject=${emailSubject}&body=${emailBody}`}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-line bg-canvas hover:bg-surface text-ink font-medium text-xs sm:text-sm transition-colors min-h-[44px] active:scale-[0.98] ${
                  !phone ? "sm:col-span-2" : ""
                }`}
              >
                <Mail className="w-4 h-4 text-story flex-shrink-0" />
                <span className="truncate">Email {email}</span>
              </a>
            )}
          </div>

          {/* Studio Address / Location */}
          {(address || location) && (
            <div className="pt-2 border-t border-line/60 flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-2 text-ink-soft">
                <MapPin className="w-4 h-4 text-ink-soft flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-ink block">
                    {address ? "Studio Address" : "Location"}
                  </span>
                  <p className="text-ink-soft leading-relaxed mt-0.5">
                    {address || location}
                  </p>
                </div>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  address || location || ""
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline flex-shrink-0 pt-0.5"
              >
                <span>View Map</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-canvas border border-line text-xs text-ink-soft flex items-center justify-between gap-2">
          <span>This artist hasn&apos;t listed direct contact details yet.</span>
          <Link
            href={`/artist/${artist.username || artist.id}`}
            className="text-primary font-medium hover:underline text-xs"
          >
            Visit Profile
          </Link>
        </div>
      )}
    </section>
  );
}
