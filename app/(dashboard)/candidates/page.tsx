"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { Candidate, PipelineStage } from "@/lib/dashboard-types";
import CandidatePipeline from "@/components/dashboard/CandidatePipeline";

export default function CandidatesPage() {
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, [supabase]);

  const loadCandidatesData = useCallback(async () => {
    if (!userId) return;
    try {
      const [candRes, stageRes] = await Promise.all([
        supabase.from("candidates").select("*").eq("user_id", userId),
        supabase
          .from("pipeline_stages")
          .select("*")
          .order("order_index"),
      ]);

      setCandidates(candRes.data ?? []);
      setStages(stageRes.data ?? []);
    } catch {
      // Data will remain empty on error
    }
  }, [supabase, userId]);

  useEffect(() => {
    loadCandidatesData();
  }, [loadCandidatesData]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Candidate Pipeline
        </h1>
        <p className="text-sm text-gray-500">
          Detailed view of all candidates in your hiring pipeline with
          engagement tracking, technical assessments, and cultural fit insights
        </p>
      </div>

      <CandidatePipeline
        candidates={candidates}
        stages={stages}
        onRefresh={loadCandidatesData}
      />
    </>
  );
}
