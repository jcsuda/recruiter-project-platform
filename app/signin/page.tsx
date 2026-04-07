"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function SignInPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to sign in";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-500 to-purple-600">
      <header className="mx-auto flex w-full max-w-7xl items-center px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-white">HIRELab</h1>
          <p className="text-sm text-white/80">
            Your complete talent sourcing solution
          </p>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-xl">
          <h2 className="mb-1 text-center text-2xl font-bold text-gray-900">
            Sign In
          </h2>
          <p className="mb-8 text-center text-sm text-gray-500">
            Welcome back! Sign in to access your recruiting dashboard.
          </p>

          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="input-field"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-2"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <button
            onClick={() => router.push("/")}
            className="mt-4 block w-full text-center text-sm text-brand-600 underline transition-colors hover:text-brand-700"
          >
            Don&apos;t have an account? Sign up here
          </button>
        </div>
      </main>
    </div>
  );
}
