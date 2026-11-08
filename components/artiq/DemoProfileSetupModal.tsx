"use client";

import { useState } from "react";
import { User, Mail, Phone, MapPin, AtSign, ArrowRight, X, Loader2, Sparkles } from "lucide-react";
import { startDemoWithProfileAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

interface DemoProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DemoProfileSetupModal({ isOpen, onClose }: DemoProfileSetupModalProps) {
  const [isPending, setIsPending] = useState(false);
  const [displayName, setDisplayName] = useState("Demo Artist");
  const [username, setUsername] = useState("demo_artist");
  const [email, setEmail] = useState("artist@artiq.gallery");
  const [phone, setPhone] = useState("+91 94471 23456");
  const [address, setAddress] = useState("Kottayam, Kerala");

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-espresso/50 flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-surface border-2 border-espresso rounded-[24px] max-w-md w-full p-6 sm:p-7 space-y-5 shadow-hard-lg animate-in zoom-in-95 duration-150 my-8 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-espresso/15">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-[10px] bg-sand border-2 border-espresso flex items-center justify-center text-espresso shadow-hard-sm">
              <Sparkles className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-espresso">
                Complete Your Profile
              </h2>
              <p className="font-mono text-[11px] text-bark uppercase tracking-wider">
                Step 1 of 2: Artist Details
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-[8px] bg-mist border-2 border-espresso flex items-center justify-center text-espresso hover:bg-surface transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        <p className="font-body text-xs text-bark leading-relaxed">
          Enter your name and contact details below. These are saved to your profile and will be omitted from the creative portfolio questions.
        </p>

        {/* Profile Completion Form */}
        <form
          action={startDemoWithProfileAction}
          onSubmit={() => setIsPending(true)}
          className="space-y-3.5 text-left"
        >
          {/* 1. Name */}
          <div>
            <label
              htmlFor="demo_displayName"
              className="block font-mono text-[11px] font-bold text-espresso uppercase tracking-wider mb-1"
            >
              Your Name *
            </label>
            <div className="relative">
              <input
                id="demo_displayName"
                name="displayName"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. K. R. Raghavan"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-[10px] bg-white border-2 border-espresso text-espresso text-sm font-body placeholder:text-bark/50 focus:outline-none focus:ring-2 focus:ring-forest"
              />
              <User className="w-4 h-4 text-bark absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* 2. Username */}
          <div>
            <label
              htmlFor="demo_username"
              className="block font-mono text-[11px] font-bold text-espresso uppercase tracking-wider mb-1"
            >
              Username *
            </label>
            <div className="relative">
              <input
                id="demo_username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. raghavan_murals"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-[10px] bg-white border-2 border-espresso text-espresso text-sm font-mono placeholder:text-bark/50 focus:outline-none focus:ring-2 focus:ring-forest"
              />
              <AtSign className="w-4 h-4 text-bark absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* 3. Email */}
          <div>
            <label
              htmlFor="demo_email"
              className="block font-mono text-[11px] font-bold text-espresso uppercase tracking-wider mb-1"
            >
              Email Address
            </label>
            <div className="relative">
              <input
                id="demo_email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="artist@artiq.gallery"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-[10px] bg-white border-2 border-espresso text-espresso text-sm font-body placeholder:text-bark/50 focus:outline-none focus:ring-2 focus:ring-forest"
              />
              <Mail className="w-4 h-4 text-bark absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* 4. Phone Number */}
          <div>
            <label
              htmlFor="demo_phone"
              className="block font-mono text-[11px] font-bold text-espresso uppercase tracking-wider mb-1"
            >
              Phone Number
            </label>
            <div className="relative">
              <input
                id="demo_phone"
                name="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 94471 23456"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-[10px] bg-white border-2 border-espresso text-espresso text-sm font-body placeholder:text-bark/50 focus:outline-none focus:ring-2 focus:ring-forest"
              />
              <Phone className="w-4 h-4 text-bark absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* 5. Address */}
          <div>
            <label
              htmlFor="demo_address"
              className="block font-mono text-[11px] font-bold text-espresso uppercase tracking-wider mb-1"
            >
              Studio / Workshop Address
            </label>
            <div className="relative">
              <input
                id="demo_address"
                name="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. West Temple Gate, Kottayam, Kerala"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-[10px] bg-white border-2 border-espresso text-espresso text-sm font-body placeholder:text-bark/50 focus:outline-none focus:ring-2 focus:ring-forest"
              />
              <MapPin className="w-4 h-4 text-bark absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isPending}
              className="gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Setting up…</span>
                </>
              ) : (
                <>
                  <span>Continue to Portfolio</span>
                  <ArrowRight className="w-4 h-4 stroke-[2]" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
