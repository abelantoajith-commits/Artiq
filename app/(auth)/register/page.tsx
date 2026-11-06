"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUpAction } from "@/app/(auth)/actions";
import { Lock, Mail, User, AtSign, ArrowRight, AlertCircle, Sparkles } from "lucide-react";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(signUpAction, null);

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 animate-in fade-in duration-300">
      <div className="bg-surface border border-line rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Join ARTIQ</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink font-sans">
            Create your artist profile
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            Every artist deserves to be seen. Start your digital portfolio in minutes.
          </p>
        </div>

        {state?.error && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label
              htmlFor="displayName"
              className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5"
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
                className="w-full px-4 py-3 pl-11 rounded-xl bg-canvas border border-line text-ink text-sm placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
              />
              <User className="w-5 h-5 text-ink-soft absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label
              htmlFor="username"
              className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5"
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
                className="w-full px-4 py-3 pl-11 rounded-xl bg-canvas border border-line text-ink text-sm placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
              />
              <AtSign className="w-5 h-5 text-ink-soft absolute left-3.5 top-3" />
            </div>
            <p className="text-[11px] text-ink-soft mt-1">
              Your public profile will be at artiq.app/artist/username
            </p>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5"
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
                className="w-full px-4 py-3 pl-11 rounded-xl bg-canvas border border-line text-ink text-sm placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
              />
              <Mail className="w-5 h-5 text-ink-soft absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5"
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
                className="w-full px-4 py-3 pl-11 rounded-xl bg-canvas border border-line text-ink text-sm placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
              />
              <Lock className="w-5 h-5 text-ink-soft absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-primary text-primary-foreground font-medium shadow-sm hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <span>{isPending ? "Creating profile…" : "Create profile"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-line text-center text-xs text-ink-soft">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

