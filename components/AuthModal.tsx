"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
          data: { name: name || undefined },
        },
      });

      if (error) throw error;

      setSuccess(true);
      setEmail("");
      setName("");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to send magic link. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError("");
    setEmail("");
    setName("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <div className="mb-6 text-center">
          <h2 id="auth-modal-title" className="text-2xl font-bold text-gray-900">
            Welcome!
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {success
              ? "Check your email for the magic link"
              : "Sign in or create a new account to get started"}
          </p>
        </div>

        {success ? (
          <>
            <div className="mb-4 rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-center">
              <h3 className="mb-1 font-semibold text-emerald-800">
                ✓ Email Sent!
              </h3>
              <p className="text-sm text-emerald-700">
                We&apos;ve sent a magic link to your email. Click the link to
                sign in or complete your registration.
              </p>
            </div>
            <button onClick={handleClose} className="btn-primary w-full">
              Got it!
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="auth-name"
                className="text-sm font-semibold text-gray-700"
              >
                Full Name (Optional)
              </label>
              <input
                id="auth-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="John Doe"
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                This helps us personalize your experience
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="auth-email"
                className="text-sm font-semibold text-gray-700"
              >
                Email Address *
              </label>
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                We&apos;ll send you a magic link &mdash; no password needed!
              </p>
            </div>

            <button
              type="submit"
              className="btn-primary mt-1"
              disabled={loading}
            >
              {loading ? "Sending..." : "Continue with Email"}
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
