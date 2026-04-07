"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthModal from "./AuthModal";

const FEATURES = [
  {
    icon: "🔍",
    title: "Boolean Search",
    description:
      "Generate precise search queries for LinkedIn, GitHub, Stack Overflow, and more.",
  },
  {
    icon: "📊",
    title: "Dashboard & Analytics",
    description:
      "Track KPIs, recruiting funnel, and candidate pipeline metrics.",
  },
  {
    icon: "📋",
    title: "Requisition Management",
    description:
      "Manage job openings, hiring managers, and track progress.",
  },
] as const;

export default function LandingPage() {
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-500 to-purple-600">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-white">HIRELab</h1>
          <p className="text-sm text-white/80">
            Your complete talent sourcing solution
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/signin")}
            className="rounded-md border border-white/30 bg-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/30"
          >
            Sign In
          </button>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-brand-600 transition-colors hover:bg-gray-50"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="max-w-3xl text-center text-white">
          <h2 className="mb-4 text-4xl font-bold leading-tight sm:text-5xl">
            HIRELab
          </h2>
          <p className="mb-10 text-lg leading-relaxed text-white/90 sm:text-xl">
            Build powerful Boolean search queries and manage your entire
            recruiting pipeline in one place
          </p>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-white/20 bg-white/10 p-6 text-center backdrop-blur-sm"
              >
                <div className="mb-3 text-4xl">{f.icon}</div>
                <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-white/85">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-white/70">
        <p>
          Built for recruiters and talent sourcers &bull; Fully compliant with
          platform Terms of Service
        </p>
        <p className="mt-1 text-xs text-white/50">
          &copy; 2025 FunkyFoot Labs. All rights reserved.
        </p>
      </footer>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
