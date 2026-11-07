"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction, signInAsDemoAction } from "@/app/(auth)/actions";
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signInAction, null);

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 animate-in fade-in duration-300">
      <div className="bg-surface border border-line rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-ink font-sans">
            Welcome back
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            Sign in to manage your portfolio and publish new artworks.
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

        {/* Prominent Try Demo Button */}
        <div className="mb-6 p-4 rounded-2xl bg-story/10 border border-story/30 text-center space-y-2.5">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-story uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Frictionless Demo</span>
          </div>
          <form action={signInAsDemoAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-xl bg-story hover:opacity-95 text-white font-semibold text-sm transition-all shadow-sm min-h-[44px]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Try demo</span>
            </button>
          </form>
          <p className="text-[11px] text-ink-soft">
            Instant 1-click login with an empty profile. Experience the AI Identity Interview.
          </p>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-line" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-surface px-3 text-ink-soft font-medium">
              or sign in with email
            </span>
          </div>
        </div>

        <form action={formAction} className="space-y-4">
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
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
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
              <span>{isPending ? "Signing in…" : "Sign in"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-line text-center text-xs text-ink-soft">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-primary hover:underline"
          >
            Create an artist profile
          </Link>
        </div>
      </div>
    </div>
  );
}

