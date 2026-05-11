"use client";

import { useState } from "react";
import type { SavedSearch } from "@/lib/types";
import type { SearchInsight } from "@/lib/ai/parsers";

interface SavedSearchInsightsProps {
  searches: SavedSearch[];
}

export default function SavedSearchInsights({
  searches,
}: SavedSearchInsightsProps) {
  const [insights, setInsights] = useState<SearchInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ai/saved-search-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searches: searches.map((s) => ({
            title: s.title,
            source_key: s.source_key,
            params: s.params,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Analysis failed");
      }

      const data = await res.json() as { insights?: SearchInsight[] };
      setInsights(data.insights ?? []);
      setAnalyzed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (searches.length < 2) return null;

  return (
    <div className="mt-4 rounded-lg border border-brand-200 bg-brand-50/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-brand-700">
            AI Pattern Analysis
          </span>
          <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-600">
            Beta
          </span>
        </div>
        {!analyzed && (
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="rounded bg-brand-600 px-3 py-1 text-xs font-medium text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Analyze patterns"}
          </button>
        )}
        {analyzed && (
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="text-xs text-brand-600 hover:text-brand-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        )}
      </div>

      {!analyzed && !loading && (
        <p className="mt-2 text-xs text-gray-500">
          {searches.length} saved searches detected — click to find recurring patterns.
        </p>
      )}

      {loading && (
        <p className="mt-2 text-xs text-gray-400 animate-pulse">
          Analyzing {searches.length} saved searches...
        </p>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}

      {analyzed && insights.length > 0 && (
        <ul className="mt-3 space-y-3">
          {insights.map((insight, i) => (
            <li key={i} className="rounded-md border border-brand-100 bg-white p-3">
              <p className="text-sm font-medium text-gray-900">{insight.pattern}</p>
              <p className="mt-1 text-xs text-brand-700">{insight.suggestion}</p>
            </li>
          ))}
        </ul>
      )}

      {analyzed && insights.length === 0 && (
        <p className="mt-2 text-xs text-gray-500">
          No strong patterns detected yet. Save more searches to improve analysis.
        </p>
      )}
    </div>
  );
}
