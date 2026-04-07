"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useToast } from "@/components/Toast";
import type { SearchTemplate, AdvancedSearchFilters } from "@/lib/ai-types";

interface AdvancedSearchProps {
  userId: string;
  onSearchResults?: (results: Record<string, unknown>[]) => void;
}

export default function AdvancedSearch({
  userId,
  onSearchResults,
}: AdvancedSearchProps) {
  const supabase = useMemo(() => createClient(), []);
  const { toast } = useToast();
  const [filters, setFilters] = useState<AdvancedSearchFilters>({});
  const [templates, setTemplates] = useState<SearchTemplate[]>([]);
  const [searchResults, setSearchResults] = useState<Record<string, unknown>[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");

  const loadTemplates = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("search_templates")
        .select("*")
        .eq("user_id", userId)
        .order("usage_count", { ascending: false });

      setTemplates(data || []);
    } catch {
      // Templates unavailable; keep empty list
    }
  }, [userId, supabase]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  // Escape PostgREST filter-injection characters from skill values
  const escapePostgREST = (s: string) => s.replace(/[,().]/g, "");
  // Escape PostgreSQL LIKE pattern special characters
  const escapeLike = (s: string) => s.replace(/%/g, "\\%").replace(/_/g, "\\_");

  const handleSearch = async () => {
    setSearching(true);
    try {
      let query = supabase
        .from("candidates")
        .select("*")
        .eq("user_id", userId);

      if (filters.skills && filters.skills.length > 0) {
        query = query.or(
          filters.skills
            .map((skill) => `notes.ilike.%${escapePostgREST(skill)}%`)
            .join(",")
        );
      }

      if (filters.experience_years) {
        // Experience filter requires experience data on candidates; skipped for now
      }

      if (filters.location?.city) {
        query = query.ilike("notes", `%${escapeLike(filters.location.city)}%`);
      }

      if (filters.source && filters.source.length > 0) {
        query = query.in("source", filters.source);
      }

      const { data, error } = await query;

      if (error) throw error;

      setSearchResults(data || []);
      onSearchResults?.(data || []);

      await supabase.from("search_analytics").insert({
        user_id: userId,
        search_query: JSON.stringify(filters),
        search_filters: filters,
        results_count: data?.length || 0,
        search_source: "advanced_search",
      });
    } catch (error: unknown) {
      toast(
        error instanceof Error ? error.message : "Search failed",
        "error"
      );
    } finally {
      setSearching(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast("Please enter a template name", "warning");
      return;
    }

    try {
      const { error } = await supabase.from("search_templates").insert({
        user_id: userId,
        name: templateName,
        description: "Advanced search template",
        search_criteria: filters,
        is_public: false,
      });

      if (error) throw error;

      setShowSaveTemplate(false);
      setTemplateName("");
      loadTemplates();
      toast("Template saved successfully", "success");
    } catch (error: unknown) {
      toast(
        error instanceof Error ? error.message : "Failed to save template",
        "error"
      );
    }
  };

  const handleLoadTemplate = (template: SearchTemplate) => {
    setFilters(template.search_criteria as AdvancedSearchFilters);

    // Fire-and-forget usage count update; errors are non-critical
    void supabase
      .from("search_templates")
      .update({ usage_count: template.usage_count + 1 })
      .eq("id", template.id);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchResults([]);
  };

  return (
    <div className="card mb-8">
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h2 className="mb-2 text-2xl font-semibold text-gray-900">
          Advanced Search
        </h2>
        <p className="m-0 text-sm text-gray-500">
          Use advanced filters to find the perfect candidates with AI-powered
          matching
        </p>
      </div>

      <div className="mb-8 grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Skills</label>
          <textarea
            className="input-field min-h-[80px] font-[inherit]"
            placeholder="Enter skills separated by commas (e.g., React, TypeScript, Node.js)"
            value={filters.skills?.join(", ") || ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                skills: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Years of Experience
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              className="input-field min-w-0 flex-1"
              placeholder="Min"
              value={filters.experience_years?.min ?? ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  experience_years: {
                    ...filters.experience_years,
                    min: parseInt(e.target.value, 10) || undefined,
                  },
                } as AdvancedSearchFilters)
              }
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              className="input-field min-w-0 flex-1"
              placeholder="Max"
              value={filters.experience_years?.max ?? ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  experience_years: {
                    ...filters.experience_years,
                    max: parseInt(e.target.value, 10) || undefined,
                  },
                } as AdvancedSearchFilters)
              }
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            className="input-field"
            placeholder="City, State, Country"
            value={filters.location?.city || ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                location: {
                  ...filters.location,
                  city: e.target.value,
                },
              })
            }
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="m-0 h-4 w-4 rounded border-gray-300"
              checked={filters.location?.remote || false}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  location: {
                    ...filters.location,
                    remote: e.target.checked,
                  },
                })
              }
            />
            <label className="m-0 text-sm text-gray-700">Remote OK</label>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Source</label>
          <div className="flex flex-col gap-2">
            {[
              "LinkedIn",
              "GitHub",
              "Stack Overflow",
              "Dribbble",
              "Indeed",
              "Referral",
            ].map((source) => (
              <div key={source} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="m-0 h-4 w-4 rounded border-gray-300"
                  checked={filters.source?.includes(source) || false}
                  onChange={(e) => {
                    const currentSources = filters.source || [];
                    if (e.target.checked) {
                      setFilters({
                        ...filters,
                        source: [...currentSources, source],
                      });
                    } else {
                      setFilters({
                        ...filters,
                        source: currentSources.filter((s) => s !== source),
                      });
                    }
                  }}
                />
                <label className="m-0 text-sm text-gray-700">{source}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Education</label>
          <select
            className="select-field"
            value={filters.education?.degree || ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                education: {
                  ...filters.education,
                  degree: e.target.value,
                },
              })
            }
          >
            <option value="">Any Degree</option>
            <option value="high_school">High School</option>
            <option value="bachelors">Bachelor&apos;s</option>
            <option value="masters">Master&apos;s</option>
            <option value="phd">PhD</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Availability
          </label>
          <select
            className="select-field"
            value={filters.availability || ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                availability: e.target.value,
              })
            }
          >
            <option value="">Any</option>
            <option value="immediate">Immediate</option>
            <option value="2_weeks">2 Weeks</option>
            <option value="1_month">1 Month</option>
            <option value="2_months">2+ Months</option>
          </select>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-end gap-4">
        <button
          type="button"
          onClick={handleClearFilters}
          className="btn-secondary"
        >
          Clear Filters
        </button>
        <button
          type="button"
          onClick={() => setShowSaveTemplate(true)}
          className="btn-secondary"
        >
          Save Template
        </button>
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="btn-primary"
        >
          {searching ? "Searching..." : "Search Candidates"}
        </button>
      </div>

      {showSaveTemplate && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50">
          <div
            className="card min-w-[min(100%,400px)] max-w-[calc(100%-2rem)]"
            role="dialog"
            aria-labelledby="save-template-title"
          >
            <h3
              id="save-template-title"
              className="mb-4 mt-0 text-lg font-semibold"
            >
              Save Search Template
            </h3>
            <input
              type="text"
              className="input-field"
              placeholder="Template name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
            <div className="mt-4 flex flex-wrap justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowSaveTemplate(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTemplate}
                className="btn-primary"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {templates.length > 0 && (
        <div className="mt-8 border-t border-gray-200 pt-8">
          <h3 className="mb-4 mt-0 text-lg font-semibold">
            Saved Search Templates
          </h3>
          <div className="mt-4 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(250px,1fr))]">
            {templates.map((template) => (
              <div
                key={template.id}
                className="card cursor-pointer transition-colors hover:bg-gray-50"
                onClick={() => handleLoadTemplate(template)}
              >
                <div className="mb-2 text-sm font-semibold text-gray-900">
                  {template.name}
                </div>
                <div className="mb-2 text-xs text-gray-500">
                  {template.description}
                </div>
                <span className="badge bg-gray-100 text-gray-600">
                  Used {template.usage_count} times
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="mt-8 border-t border-gray-200 pt-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="m-0 text-lg font-semibold">Search Results</h3>
            <p className="m-0 text-sm text-gray-500">
              {searchResults.length} candidates found
            </p>
          </div>
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(250px,1fr))]">
            {searchResults.map((candidate, index) => (
              <div key={String(candidate.id ?? index)} className="card">
                <div className="mb-2 text-sm font-semibold text-gray-900">
                  {String(candidate.name ?? "")}
                </div>
                <div className="mb-2 text-xs text-gray-500">
                  {String(candidate.email ?? "")}
                </div>
                <span className="badge bg-gray-100 text-gray-600">
                  Source: {String(candidate.source ?? "Unknown")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
