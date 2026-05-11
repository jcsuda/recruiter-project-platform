"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function SignInPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to send magic link";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#07070f]">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-brand-500/[0.10] blur-[90px]" />
      </div>

      {/* Nav */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center px-6 py-5">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2.5 transition hover:opacity-80"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 shadow-lg shadow-brand-500/30">
            <span className="text-sm font-bold leading-none text-white">H</span>
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-white/90">HIRELab</span>
        </button>
      </header>

      {/* Card */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] shadow-2xl shadow-black/60 ring-1 ring-inset ring-white/[0.04]">
            <div className="p-8">
              <div className="mb-7 text-center">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  {success ? "Check your inbox" : "Sign in to HIRELab"}
                </h1>
                <p className="mt-1.5 text-sm text-gray-500">
                  {success
                    ? "We sent a magic link to your email"
                    : "No password needed — we'll email you a link"}
                </p>
              </div>

              {success ? (
                <>
                  <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] p-4 text-center">
                    <p className="text-sm font-semibold text-emerald-400">
                      Magic link sent!
                    </p>
                    <p className="mt-1 text-xs text-emerald-500/70">
                      Click the link in your email to sign in.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSuccess(false);
                      setEmail("");
                    }}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/[0.07] hover:text-white"
                  >
                    Use a different email
                  </button>
                </>
              ) : (
                <form onSubmit={handleSignIn} className="flex flex-col gap-4">
                  {error && (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/[0.07] px-4 py-3 text-sm text-red-400">
                      {error}
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="email"
                      className="text-xs font-medium text-gray-400"
                    >
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      disabled={loading}
                      className="rounded-lg border border-white/10 bg-white/[0.05] px-3.5 py-2.5 text-sm text-white placeholder-gray-600 transition focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-1 w-full rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/25 transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Sending…" : "Send Magic Link"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {!success && (
            <p className="mt-5 text-center text-xs text-gray-700">
              By signing in you agree to our Terms of Service &amp; Privacy
              Policy.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
