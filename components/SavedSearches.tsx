"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase-browser";
import { SavedSearch, SearchParams, SourceKey } from "@/lib/types";
import { useToast } from "./Toast";
import ConfirmDialog from "./ConfirmDialog";

interface SavedSearchesProps {
  onLoad?: (
    sourceKey: SourceKey,
    params: SearchParams,
    includeInput: string,
    excludeInput: string
  ) => void;
}

export default function SavedSearches({ onLoad }: SavedSearchesProps) {
  const supabase = useMemo(() => createClient(), []);
  const { toast } = useToast();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
    };
    init();
  }, [supabase.auth]);

  const loadSearches = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("saved_searches")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSearches(data ?? []);
    } catch {
      toast("Failed to load saved searches", "error");
    } finally {
      setLoading(false);
    }
  }, [userId, supabase]); // toast is intentionally excluded: it's stable and including it risks loops

  useEffect(() => {
    loadSearches();
  }, [loadSearches]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase
        .from("saved_searches")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;
      setSearches((prev) => prev.filter((s) => s.id !== deleteId));
      toast("Search deleted", "success");
    } catch {
      toast("Failed to delete search", "error");
    } finally {
      setDeleteId(null);
    }
  };

  const handleLoad = (search: SavedSearch) => {
    if (!onLoad) return;
    const savedParams = search.params as Record<string, unknown>;
    const includeInput =
      (savedParams.includeInput as string) ||
      (Array.isArray(savedParams.include)
        ? (savedParams.include as string[]).join(", ")
        : "");
    const excludeInput =
      (savedParams.excludeInput as string) ||
      (Array.isArray(savedParams.exclude)
        ? (savedParams.exclude as string[]).join(", ")
        : "");

    onLoad(
      search.source_key,
      search.params,
      includeInput,
      excludeInput
    );
  };

  if (!userId) {
    return (
      <div className="card mt-6">
        <div className="rounded-md border border-blue-300 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Sign in to save and manage your searches
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card mt-6">
        <p className="text-center text-sm text-gray-500">
          Loading saved searches...
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="card mt-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Saved Searches
        </h3>

        {searches.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            No saved searches yet. Fill out the form and click &quot;Save
            Search&quot; to save your first search.
          </p>
        ) : (
          <div className="space-y-2">
            {searches.map((search) => (
              <div
                key={search.id}
                className="flex items-center justify-between rounded-md bg-gray-50 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {search.title}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {search.source_key} &bull;{" "}
                    {new Date(search.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="ml-4 flex gap-2">
                  <button
                    onClick={() => handleLoad(search)}
                    className="text-sm font-medium text-brand-600 hover:text-brand-700"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => setDeleteId(search.id)}
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete search"
        message="Are you sure you want to delete this saved search? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}
