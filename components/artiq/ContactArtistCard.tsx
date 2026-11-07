"use client";

import { Artist } from "@/types/art";
import { MessageCircle, Phone, Mail, MapPin, ExternalLink } from "lucide-react";
import Link from "next/link";
import { ArtistAvatar } from "@/components/artiq/ArtistAvatar";

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
      className={`rounded-[16px] border-2 border-espresso bg-surface p-5 sm:p-6 shadow-hard-sm space-y-4 select-none ${className}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <ArtistAvatar artist={artist} size="md" />
        <div className="min-w-0">
          <h3 className="font-display font-bold text-base text-espresso truncate">
            Contact {artist.display_name}
          </h3>
          <p className="font-body text-xs text-bark mt-0.5 leading-relaxed">
            Connect directly with <strong className="text-espresso font-semibold">{artist.display_name}</strong> to inquire about acquiring this piece, custom commissions, or visiting the studio.
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
                className="h-12 px-4 rounded-[10px] bg-leaf border-2 border-espresso text-espresso font-body font-bold text-xs sm:text-sm shadow-hard-sm btn-hard flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-forest"
              >
                <MessageCircle className="w-4 h-4 stroke-espresso flex-shrink-0" strokeWidth={2} />
                <span>Chat on WhatsApp</span>
              </a>
            )}

            {phone && (
              <a
                href={`tel:${cleanPhone || phone}`}
                className="h-12 px-4 rounded-[10px] bg-surface border-2 border-espresso text-espresso font-body font-bold text-xs sm:text-sm shadow-hard-sm btn-hard flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-forest"
              >
                <Phone className="w-4 h-4 stroke-espresso flex-shrink-0" strokeWidth={2} />
                <span>Call {phone}</span>
              </a>
            )}
          </div>

          {/* Email Button */}
          {email && (
            <a
              href={`mailto:${email}?subject=${emailSubject}&body=${emailBody}`}
              className="h-12 w-full px-4 rounded-[10px] bg-surface border-2 border-espresso text-espresso font-body font-bold text-xs sm:text-sm shadow-hard-sm btn-hard flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-forest"
            >
              <Mail className="w-4 h-4 stroke-espresso flex-shrink-0" strokeWidth={2} />
              <span className="truncate">Email {email}</span>
            </a>
          )}

          {/* Studio Address / Location */}
          {(address || location) && (
            <div className="p-3 rounded-[10px] bg-sand-tint border-2 border-espresso flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-2 min-w-0">
                <MapPin className="w-4 h-4 stroke-espresso flex-shrink-0 mt-0.5" strokeWidth={2} />
                <div className="min-w-0">
                  <span className="font-bold text-espresso block">Studio Location</span>
                  <span className="text-bark block mt-0.5 leading-relaxed">
                    {address || location}
                  </span>
                </div>
              </div>
              {address && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-espresso hover:underline inline-flex items-center gap-1 flex-shrink-0 pt-0.5"
                >
                  <span>Map</span>
                  <ExternalLink className="w-3 h-3 stroke-espresso" />
                </a>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="p-3.5 rounded-[10px] bg-mist border-2 border-espresso/30 text-xs text-bark flex items-center justify-between gap-2">
          <span>This artist hasn&apos;t listed direct contact details yet.</span>
          <Link
            href={
              artist.id === "current_user" ||
              artist.username?.toLowerCase() === "you"
                ? "/profile"
                : `/artist/${artist.username || artist.id}`
            }
            className="text-espresso font-bold hover:underline text-xs"
          >
            Visit Profile ↗
          </Link>
        </div>
      )}
    </section>
  );
}
