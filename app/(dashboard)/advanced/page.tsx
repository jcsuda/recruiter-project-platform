"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase-browser";
import AICandidateMatching from "@/components/dashboard/AICandidateMatching";
import AdvancedSearch from "@/components/dashboard/AdvancedSearch";

const FEATURES = [
  {
    icon: "🤖",
    title: "AI Candidate Matching",
    description:
      "Intelligent candidate scoring and ranking based on skills, experience, and cultural fit",
    status: "Available" as const,
  },
  {
    icon: "🔍",
    title: "Advanced Search",
    description:
      "Multi-criteria search with saved templates and intelligent filtering",
    status: "Available" as const,
  },
  {
    icon: "📝",
    title: "Custom Fields",
    description:
      "Create custom candidate fields and dynamic forms for your specific needs",
    status: "Coming Soon" as const,
  },
  {
    icon: "🔗",
    title: "Integrations",
    description:
      "Connect with ATS systems, job boards, and other recruiting tools",
    status: "In Development" as const,
  },
  {
    icon: "📱",
    title: "Mobile Optimization",
    description:
      "Fully responsive design with mobile-specific features and touch optimization",
    status: "Available" as const,
  },
  {
    icon: "💡",
    title: "AI Insights",
    description:
      "Get AI-powered recommendations and insights to optimize your recruiting process",
    status: "Coming Soon" as const,
  },
] as const;

const STATUS_STYLES = {
  Available: "bg-green-100 text-green-800",
  "Coming Soon": "bg-amber-100 text-amber-800",
  "In Development": "bg-blue-100 text-blue-800",
} as const;

export default function AdvancedPage() {
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
      setAuthLoading(false);
    });
  }, [supabase]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Advanced Features
        </h1>
        <p className="text-sm text-gray-500">
          AI-powered matching, advanced search capabilities, and cutting-edge
          recruiting tools
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="card text-center"
          >
            <div className="mb-3 text-4xl">{feature.icon}</div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              {feature.title}
            </h3>
            <p className="mb-4 text-sm text-gray-500">{feature.description}</p>
            <span
              className={`badge ${STATUS_STYLES[feature.status]}`}
            >
              {feature.status}
            </span>
          </div>
        ))}
      </div>

      {authLoading ? (
        <p className="py-8 text-center text-sm text-gray-500">Loading...</p>
      ) : userId ? (
        <>
          <AICandidateMatching userId={userId} onRefresh={() => {}} />
          <AdvancedSearch userId={userId} onSearchResults={() => {}} />
        </>
      ) : (
        <p className="py-8 text-center text-sm text-red-600">
          Unable to load user session. Please refresh the page.
        </p>
      )}
    </>
  );
}
