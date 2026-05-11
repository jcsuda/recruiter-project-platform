"use client";

import { useRouter } from "next/navigation";

const FEATURES = [
  {
    label: "Search",
    title: "Boolean Search Builder",
    description:
      "Type naturally or build precisely. Generate exact Boolean strings for LinkedIn, GitHub, Stack Overflow, Dribbble, and more — one click to run.",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: "AI",
    title: "AI-Powered Intelligence",
    description:
      "Claude AI converts plain English into precision queries, suggests real-time refinements, scores candidates, and surfaces patterns in your saved searches.",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path d="M10 1a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 1zM5.05 3.05a.75.75 0 011.06 0l1.062 1.06A.75.75 0 016.11 5.173L5.05 4.11a.75.75 0 010-1.06zM14.95 3.05a.75.75 0 010 1.06l-1.06 1.062a.75.75 0 01-1.062-1.061l1.061-1.061a.75.75 0 011.06 0zM3 9.25a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H3zM15.5 9.25a.75.75 0 000 1.5H17a.75.75 0 000-1.5h-1.5zM5.05 14.95a.75.75 0 001.06 1.06l1.062-1.06a.75.75 0 00-1.062-1.062L5.05 14.95zM13.888 15.072a.75.75 0 001.061-1.06l-1.06-1.062a.75.75 0 00-1.062 1.061l1.061 1.061zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6z" />
      </svg>
    ),
  },
  {
    label: "Pipeline",
    title: "Full Recruiting Pipeline",
    description:
      "Track requisitions, manage candidate stages, and monitor KPIs and funnel metrics — all in one lightweight tool built for independent practitioners.",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path fillRule="evenodd" d="M1 2.75A.75.75 0 011.75 2h16.5a.75.75 0 010 1.5H1.75A.75.75 0 011 2.75zm0 5A.75.75 0 011.75 7h16.5a.75.75 0 010 1.5H1.75A.75.75 0 011 7.75zm0 5a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H1.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
      </svg>
    ),
  },
] as const;

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07070f] text-white">

      {/* ── Background effects ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Top-center glow */}
        <div className="absolute left-1/2 top-[-10%] h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-brand-500/[0.12] blur-[100px]" />
        {/* Bottom-right accent */}
        <div className="absolute bottom-[-5%] right-[-5%] h-[350px] w-[350px] rounded-full bg-brand-700/[0.08] blur-[80px]" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-100"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        {/* Vignette — fades grid at edges */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#07070f_100%)]" />
      </div>

      {/* ── Nav ── */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 shadow-lg shadow-brand-500/30">
            <span className="text-sm font-bold leading-none text-white">H</span>
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-white/90">HIRELab</span>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <button
            onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            className="text-sm text-gray-400 transition hover:text-white"
          >
            Features
          </button>
          <button
            onClick={() => router.push("/signin")}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm transition hover:bg-white/10 hover:text-white"
          >
            Sign in
          </button>
          <button
            onClick={() => router.push("/signin")}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-500/25 transition hover:bg-brand-400"
          >
            Get Started
          </button>
        </nav>

        {/* Mobile CTA */}
        <button
          onClick={() => router.push("/signin")}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white md:hidden"
        >
          Get Started
        </button>
      </header>

      {/* ── Hero ── */}
      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-14 md:pt-20">

        {/* Badge */}
        <div className="mb-7 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3.5 py-1 text-xs font-medium tracking-wide text-brand-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" />
            Now with Claude AI-powered search
          </span>
        </div>

        {/* Headline */}
        <h1 className="mb-5 text-center text-[2.6rem] font-extrabold leading-[1.12] tracking-tight text-white sm:text-5xl md:text-[3.5rem]">
          Find the right people,{" "}
          <span className="bg-gradient-to-r from-brand-400 via-brand-300 to-pink-200 bg-clip-text text-transparent">
            faster.
          </span>
        </h1>

        <p className="mx-auto mb-9 max-w-lg text-center text-base leading-relaxed text-gray-400 sm:text-lg">
          Natural language to precision Boolean search. Built for sourcers and
          independent recruiters who live in the craft.
        </p>

        {/* CTAs */}
        <div className="mb-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => router.push("/signin")}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-400 hover:shadow-brand-400/30"
          >
            Start for free
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 011.06 0l3.25 3.25a.75.75 0 010 1.06l-3.25 3.25a.75.75 0 01-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-6 py-3 text-sm font-medium text-gray-300 backdrop-blur-sm transition hover:bg-white/[0.08] hover:text-white"
          >
            See how it works
          </button>
        </div>

        {/* Trust signals */}
        <div className="mb-16 flex flex-wrap items-center justify-center gap-5 text-xs text-gray-600">
          {["No seat licensing", "ToS compliant", "Magic link auth", "Built for sourcers"].map((s) => (
            <span key={s} className="flex items-center gap-1.5">
              <span className="text-brand-500">✓</span>
              {s}
            </span>
          ))}
        </div>

        {/* ── Demo card ── */}
        <div className="mx-auto max-w-2xl">
          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] shadow-2xl shadow-black/60 ring-1 ring-inset ring-white/[0.05]">
            {/* Window chrome */}
            <div className="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-500/60" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/60" />
              <span className="h-3 w-3 rounded-full bg-green-500/60" />
              <span className="ml-3 flex-1 text-center text-xs text-gray-600">HIRELab — AI Search</span>
            </div>

            <div className="p-5 sm:p-6">
              {/* Platform tabs (static UI) */}
              <div className="mb-4 flex gap-1 border-b border-white/[0.06] pb-3">
                {["LinkedIn", "GitHub", "Stack Overflow"].map((tab, i) => (
                  <span
                    key={tab}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                      i === 0
                        ? "bg-brand-500/20 text-brand-300"
                        : "text-gray-600"
                    }`}
                  >
                    {tab}
                  </span>
                ))}
              </div>

              {/* NL input */}
              <div className="mb-3">
                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                  Describe the candidate
                </label>
                <div className="flex items-center gap-2.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5">
                  <span className="text-brand-400 text-xs">▸</span>
                  <span className="text-sm text-gray-300">
                    Senior React developer in Austin, 5+ years, not open to relocation
                  </span>
                </div>
              </div>

              {/* Generated output */}
              <div className="rounded-lg border border-brand-500/20 bg-brand-500/[0.06] p-3.5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-brand-400">
                    Generated Boolean
                  </span>
                  <span className="rounded bg-white/[0.05] px-2 py-0.5 text-[10px] text-gray-500">
                    LinkedIn
                  </span>
                </div>
                <p className="font-mono text-xs leading-relaxed text-gray-300">
                  site:linkedin.com/in (&quot;software engineer&quot; OR &quot;frontend developer&quot;) AND (React OR ReactJS) AND &quot;Austin&quot; NOT recruiter NOT contractor
                </p>
              </div>

              {/* Action row */}
              <div className="mt-4 flex items-center gap-2">
                <button className="rounded-md bg-brand-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-brand-500/25 transition hover:bg-brand-400">
                  Copy
                </button>
                <button className="rounded-md border border-white/[0.08] px-3.5 py-1.5 text-xs text-gray-400 transition hover:border-white/20 hover:text-gray-300">
                  Open in Google
                </button>
                <span className="ml-auto text-xs text-gray-600">
                  AI suggestions ready ✦
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Features ── */}
        <section id="features" className="mt-24 scroll-mt-8">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Everything a sourcer actually needs
            </h2>
            <p className="mx-auto max-w-md text-sm text-gray-500">
              No bloat, no seat licensing, no enterprise sales process. Just the
              tools that matter.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 transition hover:border-brand-500/30 hover:bg-white/[0.05]"
              >
                {/* Subtle top glow on hover */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent opacity-0 transition group-hover:opacity-100" />

                <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/15 text-brand-400 ring-1 ring-brand-500/20">
                  {f.icon}
                </div>
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-brand-500/70">
                  {f.label}
                </div>
                <h3 className="mb-2 text-sm font-semibold text-white">{f.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Final CTA ── */}
        <div className="mt-20 flex flex-col items-center text-center">
          <h2 className="mb-4 text-xl font-bold text-white sm:text-2xl">
            Ready to source smarter?
          </h2>
          <button
            onClick={() => router.push("/signin")}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-400"
          >
            Get started — it&apos;s free
          </button>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/[0.05] py-8 text-center">
        <p className="text-xs text-gray-700">
          Built for recruiters and talent sourcers &bull; Fully compliant with
          platform Terms of Service
        </p>
        <p className="mt-1 text-xs text-gray-800">
          &copy; 2026 FunkyFoot Labs. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
