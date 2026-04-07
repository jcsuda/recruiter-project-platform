"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase-browser";
import type {
  Requisition,
  Candidate,
  PipelineStage,
  KPIData,
  FunnelData,
} from "@/lib/dashboard-types";
import KPICards from "@/components/dashboard/KPICards";
import RequisitionList from "@/components/dashboard/RequisitionList";
import RecruitingFunnel from "@/components/dashboard/RecruitingFunnel";
import AddRequisitionModal from "@/components/dashboard/AddRequisitionModal";
import EditRequisitionModal from "@/components/dashboard/EditRequisitionModal";

export default function DashboardPage() {
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRequisition, setEditingRequisition] =
    useState<Requisition | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, [supabase]);

  const loadDashboardData = useCallback(async () => {
    if (!userId) return;
    try {
      const [reqRes, candRes, stageRes] = await Promise.all([
        supabase
          .from("requisitions")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
        supabase.from("candidates").select("*").eq("user_id", userId),
        supabase
          .from("pipeline_stages")
          .select("*")
          .order("order_index"),
      ]);

      setRequisitions(reqRes.data ?? []);
      setCandidates(candRes.data ?? []);
      setStages(stageRes.data ?? []);
    } catch {
      // Data will remain empty on error
    }
  }, [supabase, userId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const calculateKPIs = (): KPIData => {
    const closedReqs = requisitions.filter((r) => r.status === "closed");
    const timeToFill =
      closedReqs.length > 0
        ? Math.round(
            closedReqs.reduce((sum, req) => {
              const created = new Date(req.created_at).getTime();
              const updated = new Date(req.updated_at).getTime();
              return sum + (updated - created) / (1000 * 60 * 60 * 24);
            }, 0) / closedReqs.length
          )
        : 0;

    const hiredCandidates = candidates.filter(
      (c) => c.status === "hired"
    ).length;
    const offersExtended = candidates.filter((c) => {
      const offerStage = stages.find((s) => s.name === "Offers Extended");
      return c.current_stage_id === offerStage?.id || c.status === "hired";
    }).length;

    const offerAcceptanceRate =
      offersExtended > 0
        ? Math.round((hiredCandidates / offersExtended) * 100)
        : 0;

    return {
      timeToFill,
      openRequisitions: requisitions.filter((r) => r.status === "open").length,
      offerAcceptanceRate,
      totalCandidates: candidates.length,
    };
  };

  const kpiData = calculateKPIs();

  const funnelData: FunnelData[] = stages.map((stage, index) => {
    const count = candidates.filter(
      (c) => c.current_stage_id === stage.id
    ).length;
    const prevStageCount =
      index > 0
        ? candidates.filter(
            (c) => c.current_stage_id === stages[index - 1].id
          ).length
        : count;

    const conversionRate =
      prevStageCount > 0 ? (count / prevStageCount) * 100 : 0;

    return {
      stage: stage.name,
      count,
      conversionRate: index > 0 ? conversionRate : undefined,
    };
  });

  const rejectedCount = candidates.filter(
    (c) => c.status === "rejected"
  ).length;
  const withdrawnCount = candidates.filter(
    (c) => c.status === "withdrawn"
  ).length;

  const handleEditRequisition = (id: string) => {
    const requisition = requisitions.find((r) => r.id === id);
    if (requisition) {
      setEditingRequisition(requisition);
      setIsEditModalOpen(true);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Recruiting Analytics
        </h2>
        <p className="text-sm text-gray-500">
          Track your recruiting performance and pipeline metrics
        </p>
      </div>

      <KPICards data={kpiData} />

      <hr className="my-8 border-gray-200" />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Requisition Management
          </h2>
          <p className="text-sm text-gray-500">
            Manage your open positions and hiring pipeline
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary"
        >
          + Add Requisition
        </button>
      </div>

      <RequisitionList
        requisitions={requisitions}
        onEdit={handleEditRequisition}
      />

      <hr className="my-8 border-gray-200" />

      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Recruiting Funnel
        </h2>
        <p className="text-sm text-gray-500">
          Track candidate progression through your hiring pipeline
        </p>
      </div>

      <RecruitingFunnel
        data={funnelData}
        rejectedCount={rejectedCount}
        withdrawnCount={withdrawnCount}
      />

      <AddRequisitionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadDashboardData}
      />

      <EditRequisitionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingRequisition(null);
        }}
        requisition={editingRequisition}
        onSuccess={loadDashboardData}
      />
    </>
  );
}
