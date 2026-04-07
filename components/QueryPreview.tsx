"use client";

import { BooleanQuery, SearchEngine } from "@/lib/types";
import type { User } from "@supabase/supabase-js";

interface QueryPreviewProps {
  query: BooleanQuery;
  searchEngine: SearchEngine;
  user?: User | null;
  saving?: boolean;
  showSaveInput?: boolean;
  saveSearchName?: string;
  onSaveSearchNameChange?: (name: string) => void;
  onToggleSaveInput?: () => void;
  onSave?: () => void;
}

export default function QueryPreview({
  query,
  searchEngine,
  user,
  saving,
  showSaveInput,
  saveSearchName,
  onSaveSearchNameChange,
  onToggleSaveInput,
  onSave,
}: QueryPreviewProps) {
  const handleOpenInSearch = () => {
    if (query.url) {
      window.open(query.url, "_blank", "noopener,noreferrer");
    }
  };

  const getSearchEngineName = () => {
    switch (searchEngine) {
      case "google":
        return "Google";
      case "bing":
        return "Bing";
      case "twitter":
        return "Twitter";
      default:
        return "Search";
    }
  };

  if (!query.raw) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 py-6 text-center text-sm text-gray-500">
        Fill in the form above to search
      </div>
    );
  }

  return (
    <div className="card text-center">
      <div className="flex flex-col items-center gap-3">
        <button onClick={handleOpenInSearch} className="btn-primary text-base">
          Open in {getSearchEngineName()}
        </button>

        {user && onToggleSaveInput && (
          <>
            {showSaveInput ? (
              <div className="flex w-full max-w-sm items-center gap-2">
                <input
                  type="text"
                  value={saveSearchName}
                  onChange={(e) => onSaveSearchNameChange?.(e.target.value)}
                  placeholder="Name your search..."
                  className="input-field flex-1"
                  onKeyDown={(e) => e.key === "Enter" && onSave?.()}
                />
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="btn-success whitespace-nowrap"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            ) : (
              <button onClick={onToggleSaveInput} className="btn-success">
                Save Search
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
