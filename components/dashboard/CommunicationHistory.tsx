"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase-browser";
import type {
  Communication,
  FollowUp,
  Interview,
} from "@/lib/communication-types";

interface CommunicationHistoryProps {
  candidateId: string;
  candidateName: string;
  onRefresh?: () => void;
}

const TYPE_BADGE: Record<string, string> = {
  email: "bg-blue-100 text-blue-800",
  phone: "bg-green-100 text-green-800",
  meeting: "bg-amber-100 text-amber-800",
  note: "bg-purple-100 text-purple-800",
  reminder: "bg-red-100 text-red-800",
};

const STATUS_BADGE: Record<string, string> = {
  sent: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  replied: "bg-green-100 text-green-800",
  completed: "bg-green-100 text-green-800",
  opened: "bg-amber-100 text-amber-800",
  failed: "bg-red-100 text-red-800",
  scheduled: "bg-purple-100 text-purple-800",
  pending: "bg-amber-100 text-amber-800",
  cancelled: "bg-gray-100 text-gray-700",
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CommunicationHistory({
  candidateId,
}: CommunicationHistoryProps) {
  const supabase = useMemo(() => createClient(), []);
  const [activeTab, setActiveTab] = useState<
    "communications" | "followups" | "interviews"
  >("communications");
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      if (activeTab === "communications") {
        const { data, error } = await supabase
          .from("communications")
          .select("*")
          .eq("candidate_id", candidateId)
          .order("created_at", { ascending: false });
        if (error) throw error;
        setCommunications(data ?? []);
      } else if (activeTab === "followups") {
        const { data, error } = await supabase
          .from("follow_ups")
          .select("*")
          .eq("candidate_id", candidateId)
          .order("due_date", { ascending: true });
        if (error) throw error;
        setFollowUps(data ?? []);
      } else {
        const { data, error } = await supabase
          .from("interviews")
          .select("*")
          .eq("candidate_id", candidateId)
          .order("scheduled_at", { ascending: false });
        if (error) throw error;
        setInterviews(data ?? []);
      }
    } catch {
      setFetchError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, candidateId, supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const tabClass = (isActive: boolean) =>
    `border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
      isActive
        ? "border-brand-600 text-brand-600"
        : "border-transparent text-gray-500 hover:text-gray-700"
    }`;

  return (
    <div className="mt-4 rounded-lg bg-gray-50 p-4">
      <h3 className="mb-4 text-base font-semibold text-gray-900">
        Communication History
      </h3>

      <div className="mb-4 flex gap-2 border-b border-gray-200">
        <button
          type="button"
          className={tabClass(activeTab === "communications")}
          onClick={() => setActiveTab("communications")}
        >
          Communications ({communications.length})
        </button>
        <button
          type="button"
          className={tabClass(activeTab === "followups")}
          onClick={() => setActiveTab("followups")}
        >
          Follow-ups ({followUps.length})
        </button>
        <button
          type="button"
          className={tabClass(activeTab === "interviews")}
          onClick={() => setActiveTab("interviews")}
        >
          Interviews ({interviews.length})
        </button>
      </div>

      <div className="max-h-[400px] min-h-[120px] overflow-y-auto">
        {loading ? (
          <p className="py-4 text-center text-sm text-gray-500">Loading...</p>
        ) : fetchError ? (
          <p className="py-4 text-center text-sm text-red-600">{fetchError}</p>
        ) : activeTab === "communications" ? (
          communications.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              No communications yet
            </p>
          ) : (
            communications.map((c) => (
              <div
                key={c.id}
                className="mb-2 rounded-md border border-gray-200 bg-white p-3"
              >
                <div className="mb-1 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-gray-900">
                      {c.subject || `${c.type} ${c.direction}`}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      {formatDate(c.created_at)}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <span
                      className={`badge uppercase ${TYPE_BADGE[c.type] ?? "bg-gray-100 text-gray-700"}`}
                    >
                      {c.type}
                    </span>
                    <span
                      className={`badge uppercase ${STATUS_BADGE[c.status] ?? "bg-gray-100 text-gray-700"}`}
                    >
                      {c.status}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{c.content}</p>
              </div>
            ))
          )
        ) : activeTab === "followups" ? (
          followUps.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              No follow-ups scheduled
            </p>
          ) : (
            followUps.map((f) => (
              <div
                key={f.id}
                className="mb-2 rounded-md border border-gray-200 bg-white p-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-gray-900">
                      {f.title}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      Due: {formatDate(f.due_date)}
                    </span>
                  </div>
                  <span
                    className={`badge uppercase ${STATUS_BADGE[f.status] ?? "bg-gray-100 text-gray-700"}`}
                  >
                    {f.status}
                  </span>
                </div>
                {f.description && (
                  <p className="mt-1 text-sm text-gray-700">{f.description}</p>
                )}
              </div>
            ))
          )
        ) : interviews.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            No interviews scheduled
          </p>
        ) : (
          interviews.map((i) => (
            <div
              key={i.id}
              className="mb-2 rounded-md border border-gray-200 bg-white p-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-gray-900">
                    {i.title}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    {formatDate(i.scheduled_at)} &bull; {i.duration_minutes}min
                  </span>
                </div>
                <span
                  className={`badge uppercase ${STATUS_BADGE[i.status] ?? "bg-gray-100 text-gray-700"}`}
                >
                  {i.status}
                </span>
              </div>
              {i.location && (
                <p className="mt-1 text-xs text-gray-500">
                  Location: {i.location}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
