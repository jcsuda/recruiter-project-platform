"use client";

import { useState } from "react";
import type { SourceKey, SearchEngine } from "@/lib/types";
import type { NLToBooleanResult } from "@/lib/ai/parsers";
import { useToast } from "./Toast";

interface NaturalLanguageSearchProps {
  activeSource: SourceKey;
  searchEngine: SearchEngine;
}

export default function NaturalLanguageSearch({
  activeSource,
  searchEngine,
}: NaturalLanguageSearchProps) {
  const { toast } = useToast();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NLToBooleanResult | null>(null);
  const [streamingText, setStreamingText] = useState("");

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast("Describe the candidate you're looking for", "warning");
      return;
    }

    setLoading(true);
    setResult(null);
    setStreamingText("");

    try {
      const res = await fetch("/api/ai/natural-language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, platform: activeSource }),
      });

      if (!res.ok || !res.body) {
        throw new Error("Failed to reach AI endpoint");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const event = JSON.parse(line.slice(6)) as Record<string, unknown>;

          if (typeof event.chunk === "string") {
            setStreamingText((prev) => prev + event.chunk);
          } else if (event.done && event.result) {
            setResult(event.result as NLToBooleanResult);
            setStreamingText("");
          } else if (typeof event.error === "string") {
            throw new Error(event.error);
          }
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.booleanString);
      toast("Copied to clipboard", "success");
    } catch {
      toast("Failed to copy", "error");
    }
  };

  const handleOpen = () => {
    if (!result) return;
    const encoded = encodeURIComponent(result.booleanString);
    const baseUrl =
      searchEngine === "bing"
        ? "https://www.bing.com/search?q="
        : "https://www.google.com/search?q=";
    window.open(baseUrl + encoded, "_blank");
  };

  return (
    <div className="card mb-6 border-brand-200 bg-brand-50/30">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-sm font-semibold text-brand-700">
          AI Search Generator
        </span>
        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-600">
          Beta
        </span>
      </div>

      <div className="mb-3">
        <label
          htmlFor="nl-description"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Describe the candidate you&apos;re looking for
        </label>
        <textarea
          id="nl-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Senior React developer in Austin with 5+ years experience, not open to relocation"
          className="input-field min-h-[80px] resize-y"
          disabled={loading}
          rows={3}
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !description.trim()}
        className="btn-primary"
      >
        {loading ? "Generating..." : "Generate with AI"}
      </button>

      {loading && !result && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
          <p className="mb-1 text-xs font-medium text-gray-400">
            Building your Boolean string...
          </p>
          <p className="font-mono text-sm text-gray-600">
            {streamingText || "Thinking..."}
          </p>
        </div>
      )}

      {result && (
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Boolean String
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="rounded bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={handleOpen}
                  className="rounded bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
                >
                  Open Search
                </button>
              </div>
            </div>
            <p className="font-mono text-sm text-emerald-900 break-all">
              {result.booleanString}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Explanation
            </p>
            <p className="text-sm text-gray-700">{result.explanation}</p>
          </div>

          {result.suggestedRefinements.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Suggested Refinements
              </p>
              <ul className="space-y-1.5">
                {result.suggestedRefinements.map((r, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <span className="mt-0.5 shrink-0 text-brand-400">→</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
