"use client";

import { useState, useMemo, useEffect } from "react";
import {
  SearchParams,
  SourceKey,
  SearchEngine,
  EducationLevel,
  OpenToWorkStatus,
} from "@/lib/types";
import { SOURCE_LIST } from "@/lib/sources";
import { generateBooleanQuery, parseArrayInput } from "@/lib/builder";
import { createClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import QueryPreview from "./QueryPreview";
import SavedSearches from "./SavedSearches";
import { useToast } from "./Toast";

export default function SearchBuilder() {
  const supabase = createClient();
  const { toast } = useToast();

  const [activeSource, setActiveSource] = useState<SourceKey>("linkedin");
  const [searchEngine, setSearchEngine] = useState<SearchEngine>("google");
  const [params, setParams] = useState<SearchParams>({
    role: "",
    include: [],
    exclude: [],
    location: "",
    education: undefined,
    employer: "",
    openToWork: undefined,
  });

  const [includeInput, setIncludeInput] = useState("");
  const [excludeInput, setExcludeInput] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSaveSearch = async () => {
    if (!user) {
      toast("Please sign in to save searches", "warning");
      return;
    }

    if (!saveSearchName.trim()) {
      toast("Please enter a name for this search", "warning");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("saved_searches").insert({
        user_id: user.id,
        source_key: activeSource,
        title: saveSearchName.trim(),
        params: { ...params, includeInput, excludeInput },
      });

      if (error) throw error;
      toast("Search saved successfully!", "success");
      setSaveSearchName("");
      setShowSaveInput(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save search";
      toast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const query = useMemo(() => {
    try {
      return generateBooleanQuery(activeSource, params, searchEngine);
    } catch {
      return { raw: "", encoded: "", url: "" };
    }
  }, [activeSource, params, searchEngine]);

  const handleIncludeChange = (value: string) => {
    setIncludeInput(value);
    setParams((prev) => ({ ...prev, include: parseArrayInput(value) }));
  };

  const handleExcludeChange = (value: string) => {
    setExcludeInput(value);
    setParams((prev) => ({ ...prev, exclude: parseArrayInput(value) }));
  };

  const handleLoadSearch = (
    sourceKey: SourceKey,
    searchParams: SearchParams,
    includeStr: string,
    excludeStr: string
  ) => {
    setActiveSource(sourceKey);
    setParams(searchParams);
    setIncludeInput(includeStr);
    setExcludeInput(excludeStr);
  };

  const isLinkedIn = activeSource === "linkedin";
  const isStackOverflow = activeSource === "stackoverflow";

  return (
    <div>
      {/* Source Tabs */}
      <div className="mb-6 overflow-x-auto border-b border-gray-200">
        <div className="flex gap-1">
          {SOURCE_LIST.map((source) => (
            <button
              key={source.key}
              onClick={() => setActiveSource(source.key)}
              className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeSource === source.key
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {source.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="card mb-6">
        <div className="mb-4">
          <label htmlFor="role" className="mb-1 block text-sm font-medium text-gray-700">
            {isStackOverflow ? "Search Query" : "Role/Title"}
          </label>
          <input
            id="role"
            type="text"
            value={params.role || ""}
            onChange={(e) =>
              setParams((prev) => ({ ...prev, role: e.target.value }))
            }
            placeholder={
              isStackOverflow
                ? "e.g., javascript async await"
                : "e.g., Software Engineer, Product Manager"
            }
            className="input-field"
          />
          {isStackOverflow && (
            <p className="mt-1 text-xs text-gray-500">
              Search for questions, tags, or topics on Stack Overflow
            </p>
          )}
        </div>

        {!isStackOverflow && (
          <div className="mb-4">
            <label htmlFor="include" className="mb-1 block text-sm font-medium text-gray-700">
              Include (comma-separated)
            </label>
            <input
              id="include"
              type="text"
              value={includeInput}
              onChange={(e) => handleIncludeChange(e.target.value)}
              placeholder="e.g., React, TypeScript, Node.js"
              className="input-field"
            />
            <p className="mt-1 text-xs text-gray-500">
              Skills or keywords to include (combined with AND)
            </p>
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="exclude" className="mb-1 block text-sm font-medium text-gray-700">
            Exclude (comma-separated)
          </label>
          <input
            id="exclude"
            type="text"
            value={excludeInput}
            onChange={(e) => handleExcludeChange(e.target.value)}
            placeholder="e.g., recruiter, HR"
            className="input-field"
          />
          <p className="mt-1 text-xs text-gray-500">
            Keywords to exclude from results
          </p>
        </div>

        {!isStackOverflow && (
          <div className="mb-4">
            <label htmlFor="location" className="mb-1 block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              id="location"
              type="text"
              value={params.location || ""}
              onChange={(e) =>
                setParams((prev) => ({ ...prev, location: e.target.value }))
              }
              placeholder="e.g., Austin, San Francisco, Remote"
              className="input-field"
            />
          </div>
        )}

        {isLinkedIn && (
          <>
            <div className="mb-4">
              <label htmlFor="education" className="mb-1 block text-sm font-medium text-gray-700">
                Education
              </label>
              <select
                id="education"
                value={params.education || ""}
                onChange={(e) =>
                  setParams((prev) => ({
                    ...prev,
                    education:
                      (e.target.value as EducationLevel) || undefined,
                  }))
                }
                className="select-field"
              >
                <option value="">—</option>
                <option value="bachelors">Bachelors</option>
                <option value="masters">Masters</option>
                <option value="doctoral">Doctoral</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="employer" className="mb-1 block text-sm font-medium text-gray-700">
                Current Employer
              </label>
              <input
                id="employer"
                type="text"
                value={params.employer || ""}
                onChange={(e) =>
                  setParams((prev) => ({
                    ...prev,
                    employer: e.target.value,
                  }))
                }
                placeholder="e.g., Google, Microsoft"
                className="input-field"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="openToWork" className="mb-1 block text-sm font-medium text-gray-700">
                LinkedIn Status
              </label>
              <select
                id="openToWork"
                value={params.openToWork || ""}
                onChange={(e) =>
                  setParams((prev) => ({
                    ...prev,
                    openToWork:
                      (e.target.value as OpenToWorkStatus) || undefined,
                  }))
                }
                className="select-field"
              >
                <option value="">—</option>
                <option value="opentowork">
                  #OpenToWork (Seeking opportunities)
                </option>
                <option value="hiring">#Hiring (Actively hiring)</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Filter by LinkedIn status hashtags
              </p>
            </div>
          </>
        )}

        <div className="mb-0">
          <label htmlFor="engine" className="mb-1 block text-sm font-medium text-gray-700">
            Search Engine
          </label>
          <select
            id="engine"
            value={searchEngine}
            onChange={(e) =>
              setSearchEngine(e.target.value as SearchEngine)
            }
            className="select-field"
          >
            <option value="google">Google</option>
            <option value="bing">Bing</option>
            {activeSource === "twitter" && (
              <option value="twitter">Twitter</option>
            )}
          </select>
        </div>
      </div>

      {/* Query Preview */}
      <QueryPreview
        query={query}
        searchEngine={searchEngine}
        user={user}
        saving={saving}
        showSaveInput={showSaveInput}
        saveSearchName={saveSearchName}
        onSaveSearchNameChange={setSaveSearchName}
        onToggleSaveInput={() => setShowSaveInput(!showSaveInput)}
        onSave={handleSaveSearch}
      />

      {/* Saved Searches */}
      <SavedSearches onLoad={handleLoadSearch} />
    </div>
  );
}
