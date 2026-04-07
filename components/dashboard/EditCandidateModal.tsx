"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useToast } from "@/components/Toast";
import type { Candidate, PipelineStage } from "@/lib/dashboard-types";

interface EditCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
  stages: PipelineStage[];
  onSuccess: () => void;
}

export default function EditCandidateModal({
  isOpen,
  onClose,
  candidate,
  stages,
  onSuccess,
}: EditCandidateModalProps) {
  const supabase = useMemo(() => createClient(), []);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    source: "",
    current_stage_id: "",
    status: "active",
    notes: "",
  });

  useEffect(() => {
    if (candidate) {
      setFormData({
        name: candidate.name || "",
        email: candidate.email || "",
        phone: candidate.phone || "",
        source: candidate.source || "",
        current_stage_id: candidate.current_stage_id || "",
        status: candidate.status || "active",
        notes: candidate.notes || "",
      });
    }
  }, [candidate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidate) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("candidates")
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          source: formData.source || null,
          current_stage_id: formData.current_stage_id,
          status: formData.status,
          notes: formData.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", candidate.id)
        .eq("user_id", candidate.user_id);

      if (error) throw error;
      toast("Candidate updated successfully!", "success");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update candidate";
      toast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !candidate) return null;

  return (
    <div
      className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-xl overflow-auto rounded-xl bg-white p-8"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h2 className="mb-6 border-b border-gray-200 pb-4 text-xl font-semibold text-gray-900">
          Edit Candidate
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="input-field"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="input-field"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Source
              </label>
              <select
                value={formData.source}
                onChange={(e) =>
                  setFormData({ ...formData, source: e.target.value })
                }
                className="select-field"
              >
                <option value="">Select source</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="GitHub">GitHub</option>
                <option value="Indeed">Indeed</option>
                <option value="Referral">Referral</option>
                <option value="Career Site">Career Site</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Status *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="select-field"
              >
                <option value="active">Active</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Pipeline Stage *
            </label>
            <select
              required
              value={formData.current_stage_id}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  current_stage_id: e.target.value,
                })
              }
              className="select-field"
            >
              <option value="">Select stage</option>
              {stages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="input-field min-h-[100px] resize-y"
              placeholder="Add any notes about this candidate..."
            />
          </div>

          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
