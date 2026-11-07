"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUpAction } from "@/app/(auth)/actions";
import { Lock, Mail, User, AtSign, ArrowRight, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(signUpAction, null);

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 animate-in fade-in duration-300 px-4">
      <div className="bg-surface border-2 border-ink rounded-3xl p-6 sm:p-8 shadow-hard">
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] bg-sprout border-[1.5px] border-moss text-ink text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-moss" />
            <span>Join ARTIQ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink font-display">
            Create your artist profile
          </h1>
          <p className="text-sm text-ink-soft mt-1.5 font-sans">
            Every artist deserves to be seen. Start your digital portfolio in minutes.
          </p>
        </div>

        {state?.error && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-xl bg-clay/15 border-2 border-clay text-ink text-sm flex items-start gap-2.5 font-medium"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-clay" />
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label
              htmlFor="displayName"
              className="block text-xs font-bold text-ink uppercase tracking-wider font-mono mb-1.5"
            >
              Your full name or studio name
            </label>
            <div className="relative">
              <input
                id="displayName"
                name="displayName"
                type="text"
                required
                placeholder="e.g. Radhika Menon"
                className="w-full px-4 py-3 pl-11 rounded-[10px] bg-white border-2 border-ink text-ink text-sm placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2 min-h-[48px]"
              />
              <User className="w-5 h-5 text-ink-soft absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label
              htmlFor="username"
              className="block text-xs font-bold text-ink uppercase tracking-wider font-mono mb-1.5"
            >
              Username (portfolio URL)
            </label>
            <div className="relative">
              <input
                id="username"
                name="username"
                type="text"
                required
                placeholder="radhika_art"
                className="w-full px-4 py-3 pl-11 rounded-[10px] bg-white border-2 border-ink text-ink text-sm placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2 min-h-[48px]"
              />
              <AtSign className="w-5 h-5 text-ink-soft absolute left-3.5 top-3.5" />
            </div>
            <p className="text-[11px] text-ink-soft mt-1.5">
              Your public profile will be at artiq.app/artist/username
            </p>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold text-ink uppercase tracking-wider font-mono mb-1.5"
            >
              Email address
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="artist@example.com"
                className="w-full px-4 py-3 pl-11 rounded-[10px] bg-white border-2 border-ink text-ink text-sm placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2 min-h-[48px]"
              />
              <Mail className="w-5 h-5 text-ink-soft absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold text-ink uppercase tracking-wider font-mono mb-1.5"
            >
              Password (min. 6 characters)
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                minLength={6}
                placeholder="••••••••"
                className="w-full px-4 py-3 pl-11 rounded-[10px] bg-white border-2 border-ink text-ink text-sm placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2 min-h-[48px]"
              />
              <Lock className="w-5 h-5 text-ink-soft absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="btn-hard w-full flex items-center justify-center gap-2 py-3 px-5 rounded-[10px] bg-leaf text-ink font-bold text-sm min-h-[48px] disabled:opacity-50"
            >
              <span>{isPending ? "Creating profile…" : "Create profile"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t-2 border-ink/15 text-center text-xs text-ink-soft">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-ink font-bold underline hover:text-ink/80 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
