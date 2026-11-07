"use client";

import Link from "next/link";
import { useState, useActionState } from "react";
import { signInAction, signInAsDemoAction, signInAsMasterAction } from "@/app/(auth)/actions";
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles, KeyRound, ShieldAlert } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signInAction, null);
  const [masterState, masterFormAction, isMasterPending] = useActionState(signInAsMasterAction, null);
  const [showMasterLogin, setShowMasterLogin] = useState(false);

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 animate-in fade-in duration-300 px-4">
      <div className="bg-surface border-2 border-ink rounded-3xl p-6 sm:p-8 shadow-hard">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink font-display">
            Welcome back
          </h1>
          <p className="text-sm text-ink-soft mt-1.5 font-sans">
            Sign in to manage your portfolio and publish new artworks.
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

        {/* Prominent Try Demo Button */}
        <div className="mb-6 p-5 rounded-2xl bg-sand-tint border-2 border-ink text-center space-y-3 shadow-hard-sm">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-ink uppercase tracking-wider font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Frictionless Demo</span>
          </div>
          <form action={signInAsDemoAction}>
            <button
              type="submit"
              className="btn-hard w-full flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-[10px] bg-sand hover:bg-sand/90 text-ink font-bold text-sm min-h-[48px]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Try demo</span>
            </button>
          </form>
          <p className="text-xs text-ink-soft">
            Instant 1-click login with an empty profile. Experience the AI Identity Interview.
          </p>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-ink/15" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-surface px-3 text-ink-soft font-mono text-[11px] tracking-wider">
              or sign in with email
            </span>
          </div>
        </div>

        <form action={formAction} className="space-y-4">
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
              <span>{isPending ? "Signing in…" : "Sign in"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Master Curator Access Section */}
        <div className="mt-6 pt-6 border-t-2 border-ink/15">
          {!showMasterLogin ? (
            <button
              type="button"
              onClick={() => setShowMasterLogin(true)}
              className="w-full py-2.5 px-4 rounded-[10px] bg-sand-tint border-2 border-ink text-xs font-mono font-bold text-ink uppercase tracking-wider shadow-hard-sm hover:bg-sand transition-colors flex items-center justify-center gap-2 cursor-pointer btn-hard"
            >
              <span>👑 Master Curator Login</span>
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-sand-tint border-2 border-ink space-y-3.5 shadow-hard-sm animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[8px] bg-sand border-2 border-ink flex items-center justify-center text-ink shadow-hard-sm">
                    <KeyRound className="w-3.5 h-3.5 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xs text-ink">
                      Master Curator Access
                    </h3>
                    <p className="font-mono text-[10px] text-ink-soft">
                      Edit or remove any post &amp; profile
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMasterLogin(false)}
                  className="text-xs font-mono text-ink-soft hover:text-ink font-bold cursor-pointer"
                >
                  Hide
                </button>
              </div>

              {masterState?.error && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-clay/20 border-2 border-clay text-ink text-xs flex items-start gap-2 font-medium"
                >
                  <ShieldAlert className="w-4 h-4 text-clay flex-shrink-0 mt-0.5" />
                  <span>{masterState.error}</span>
                </div>
              )}

              <form action={masterFormAction} className="space-y-3">
                <div>
                  <label
                    htmlFor="passcode"
                    className="block text-[10px] font-bold text-ink uppercase tracking-wider font-mono mb-1"
                  >
                    Master Passcode
                  </label>
                  <input
                    id="passcode"
                    name="passcode"
                    type="password"
                    required
                    defaultValue="artiq_master_2026"
                    placeholder="Enter master passcode"
                    className="w-full px-3 py-2.5 rounded-[10px] bg-white border-2 border-ink text-ink text-xs font-mono placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isMasterPending}
                  className="btn-hard w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-[10px] bg-sand hover:bg-sand/90 text-ink font-bold text-xs min-h-[42px] disabled:opacity-50 cursor-pointer"
                >
                  <span>{isMasterPending ? "Authenticating Master…" : "Enter as Master Curator 👑"}</span>
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t-2 border-ink/15 text-center text-xs text-ink-soft">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-ink font-bold underline hover:text-ink/80 transition-colors"
          >
            Create your artist profile
          </Link>
        </div>
      </div>
    </div>
  );
}
