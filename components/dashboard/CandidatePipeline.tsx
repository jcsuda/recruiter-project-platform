"use client";

import { useState } from "react";
import type { Candidate, PipelineStage } from "@/lib/dashboard-types";
import EditCandidateModal from "./EditCandidateModal";
import CommunicationHistory from "./CommunicationHistory";
import EmailComposer from "./EmailComposer";

interface CandidatePipelineProps {
  candidates: Candidate[];
  stages: PipelineStage[];
  onRefresh: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-blue-100 text-blue-800",
  rejected: "bg-red-100 text-red-800",
  withdrawn: "bg-gray-100 text-gray-700",
  hired: "bg-green-100 text-green-800",
};

export default function CandidatePipeline({
  candidates,
  stages,
  onRefresh,
}: CandidatePipelineProps) {
  const [stageFilter, setStageFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(
    null
  );
  const [isEmailComposerOpen, setIsEmailComposerOpen] = useState(false);

  const filteredCandidates = candidates.filter((c) => {
    if (stageFilter !== "all" && c.current_stage_id !== stageFilter)
      return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    return true;
  });

  const handleCardClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const handleEditClick = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setIsEditModalOpen(true);
    setIsModalOpen(false);
  };

  const handleEmailClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsEmailComposerOpen(true);
    setIsModalOpen(false);
  };

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Candidate Pipeline
        </h2>
      </div>

      <div className="mb-4 flex gap-2">
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="select-field w-auto"
        >
          <option value="all">All Stages</option>
          {stages.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="select-field w-auto"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="rejected">Rejected</option>
          <option value="withdrawn">Withdrawn</option>
          <option value="hired">Hired</option>
        </select>
      </div>

      {filteredCandidates.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">
          No candidates found matching the current filters.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredCandidates.map((candidate) => {
            const currentStage = stages.find(
              (s) => s.id === candidate.current_stage_id
            );
            return (
              <button
                key={candidate.id}
                type="button"
                className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-6 text-center transition-colors hover:bg-gray-50"
                onClick={() => handleCardClick(candidate)}
              >
                <h3 className="text-base font-semibold text-gray-900">
                  {candidate.name}
                </h3>
                <p className="mt-0.5 text-sm text-gray-500">
                  {candidate.email}
                </p>
                <div className="mt-3">
                  <span
                    className={`badge ${STATUS_STYLES[candidate.status || "active"]}`}
                  >
                    {currentStage?.name || "Unknown Stage"}
                  </span>
                </div>
                <p className="mt-3 text-xs text-gray-400">
                  Click to view details
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {isModalOpen && selectedCandidate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-xl bg-white p-8"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedCandidate.name}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded p-1 text-2xl text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Contact Information
                </h4>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Email:</dt>
                    <dd className="font-medium text-gray-900">
                      {selectedCandidate.email}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Phone:</dt>
                    <dd className="font-medium text-gray-900">
                      {selectedCandidate.phone || "Not provided"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Source:</dt>
                    <dd className="font-medium text-gray-900">
                      {selectedCandidate.source || "Unknown"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Status:</dt>
                    <dd>
                      <span
                        className={`badge ${STATUS_STYLES[selectedCandidate.status || "active"]}`}
                      >
                        {selectedCandidate.status || "active"}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Position &amp; Pipeline
                </h4>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Current Stage:</dt>
                    <dd className="font-medium text-gray-900">
                      {stages.find(
                        (s) => s.id === selectedCandidate.current_stage_id
                      )?.name || "Unknown"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Added:</dt>
                    <dd className="font-medium text-gray-900">
                      {new Date(
                        selectedCandidate.created_at
                      ).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="md:col-span-2">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Notes
                </h4>
                <div className="min-h-[60px] rounded border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                  {selectedCandidate.notes || "No notes available"}
                </div>
              </div>

              <div className="md:col-span-2">
                <CommunicationHistory
                  candidateId={selectedCandidate.id}
                  candidateName={selectedCandidate.name}
                  onRefresh={onRefresh}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn-secondary"
              >
                Close
              </button>
              <button
                onClick={() => handleEmailClick(selectedCandidate)}
                className="btn-success"
              >
                Email
              </button>
              <button
                onClick={() => handleEditClick(selectedCandidate)}
                className="btn-primary"
              >
                Edit Candidate
              </button>
            </div>
          </div>
        </div>
      )}

      <EditCandidateModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingCandidate(null);
        }}
        candidate={editingCandidate}
        stages={stages}
        onSuccess={() => {
          onRefresh();
          setIsEditModalOpen(false);
          setEditingCandidate(null);
        }}
      />

      <EmailComposer
        isOpen={isEmailComposerOpen}
        onClose={() => {
          setIsEmailComposerOpen(false);
          setSelectedCandidate(null);
        }}
        candidateId={selectedCandidate?.id || ""}
        candidateName={selectedCandidate?.name || ""}
        candidateEmail={selectedCandidate?.email || ""}
        onSuccess={() => {
          onRefresh();
          setIsEmailComposerOpen(false);
          setSelectedCandidate(null);
        }}
      />
    </div>
  );
}
