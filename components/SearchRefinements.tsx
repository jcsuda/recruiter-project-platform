"use client";

import { useState, useEffect, useRef } from "react";
import type { SourceKey } from "@/lib/types";
import type { Refinement } from "@/lib/ai/parsers";

interface SearchRefinementsProps {
  query: string;
  platform: SourceKey;
  onApply: (addition: string) => void;
}

export default function SearchRefinements({
  query,
  platform,
  onApply,
}: SearchRefinementsProps) {
  const [refinements, setRefinements] = useState<Refinement[]>([]);
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const lastQueryRef = useRef<string>("");

  useEffect(() => {
    if (!query || query === lastQueryRef.current) return;

    const timeout = setTimeout(async () => {
      lastQueryRef.current = query;
      setLoading(true);
      setRefinements([]);
      setApplied(new Set());

      try {
        const res = await fetch("/api/ai/suggest-refinements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, platform }),
        });

        if (!res.ok) return;

        const data = await res.json() as { refinements?: Refinement[] };
        if (Array.isArray(data.refinements)) {
          setRefinements(data.refinements);
        }
      } catch {
        // silently skip — refinements are non-critical
      } finally {
        setLoading(false);
      }
    }, 1200);

    return () => clearTimeout(timeout);
  }, [query, platform]);

  const handleApply = (r: Refinement) => {
    onApply(r.addition);
    setApplied((prev) => new Set(prev).add(r.label));
  };

  if (!query) return null;

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          AI Suggestions
        </span>
        {loading && (
          <span className="text-xs text-gray-400 animate-pulse">
            Analyzing...
          </span>
        )}
      </div>

      {!loading && refinements.length === 0 && (
        <p className="text-xs text-gray-400">
          Suggestions will appear after your query is ready.
        </p>
      )}

      {refinements.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {refinements.map((r) => {
            const isApplied = applied.has(r.label);
            return (
              <button
                key={r.label}
                onClick={() => handleApply(r)}
                disabled={isApplied}
                title={r.addition}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  isApplied
                    ? "border-emerald-200 bg-emerald-50 text-emerald-600 cursor-default"
                    : "border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100"
                }`}
              >
                {isApplied ? "✓ " : "+ "}
                {r.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
