"use client";

import { useRouter } from "next/navigation";

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

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-brand-900 via-brand-500 to-brand-300">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
        <div>
          <h1 className="text-2xl font-bold text-white">HIRELab</h1>
          <p className="text-sm text-white/80">Talent sourcing, accelerated.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/signin")}
            className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-brand-600 shadow-sm transition hover:opacity-95"
          >
            Get Started
          </button>
          <button
            onClick={() => {
              const el = document.getElementById("features");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="rounded-md border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white/95 backdrop-blur-sm transition hover:bg-white/20"
          >
            See Features
          </button>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-7xl">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
            {/* Left: content */}
            <div className="text-white">
              <h2 className="mb-4 text-4xl font-extrabold leading-tight sm:text-5xl">
                Find the right people, faster.
              </h2>
              <p className="mb-6 max-w-2xl text-lg text-white/90">
                Natural language to precision Boolean search, built for sourcers and independent recruiters. Run queries, track candidates, and surface insights — all in one lightweight tool.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  onClick={() => router.push("/signin")}
                  className="inline-flex items-center justify-center rounded-md bg-white px-5 py-3 text-sm font-semibold text-brand-600 shadow hover:shadow-md transition"
                >
                  Start Free
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById("features");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center justify-center rounded-md border border-white/30 bg-white/5 px-5 py-3 text-sm font-medium text-white/95 transition hover:bg-white/10"
                >
                  Try a Demo
                </button>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/80">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">Trusted by independent recruiters</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">No seat licensing</span>
              </div>
            </div>

            {/* Right: mock demo card */}
            <div className="relative flex items-center justify-center">
              <div className="w-full max-w-md rounded-2xl bg-white/5 p-6 backdrop-blur-sm ring-1 ring-white/10">
                <div className="mb-3 flex items-center justify-between">
                  <div className="h-3 w-28 rounded-full bg-white/10" />
                  <div className="flex gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-400" />
                    <span className="h-3 w-3 rounded-full bg-yellow-400" />
                    <span className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                </div>

                <div className="rounded-md border border-white/10 bg-gradient-to-b from-white/5 to-white/3 px-4 py-3">
                  <p className="mb-2 text-sm font-medium text-white">Quick demo</p>
                  <div className="mb-2 h-10 w-full rounded bg-white/8 p-2 text-sm text-white/90">"senior React developer Austin -relocation" →</div>
                  <div className="rounded bg-white/10 p-3 text-sm text-white/95">(site:linkedin.com/in OR site:github.com) AND ("React" OR "React.js") AND "Austin"</div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <button className="rounded-md bg-brand-500 px-3 py-2 text-sm font-semibold text-white">Copy</button>
                  <button className="rounded-md border border-white/20 px-3 py-2 text-sm text-white/90">Open in LinkedIn</button>
                </div>
              </div>
            </div>
          </div>

          {/* Features area */}
          <section id="features" className="mt-12">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.title} className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-white">
                  <div className="mb-3 text-3xl">{f.icon}</div>
                  <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-white/85">{f.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-white/70">
        <p>Built for recruiters and talent sourcers • Fully compliant with platform Terms of Service</p>
        <p className="mt-1 text-xs text-white/50">© 2026 FunkyFoot Labs. All rights reserved.</p>
      </footer>
    </div>
  );
}
