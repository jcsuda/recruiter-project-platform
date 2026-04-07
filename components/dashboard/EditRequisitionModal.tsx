"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useToast } from "@/components/Toast";
import type {
  Requisition,
  RequisitionPriority,
  RequisitionStatus,
} from "@/lib/dashboard-types";

interface EditRequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  requisition: Requisition | null;
  onSuccess: () => void;
}

export default function EditRequisitionModal({
  isOpen,
  onClose,
  requisition,
  onSuccess,
}: EditRequisitionModalProps) {
  const supabase = useMemo(() => createClient(), []);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    position_title: "",
    hiring_manager: "",
    department: "",
    location: "",
    priority: "medium" as RequisitionPriority,
    status: "open" as RequisitionStatus,
    target_start_date: "",
    hire_date: "",
    description: "",
  });

  useEffect(() => {
    if (requisition) {
      setFormData({
        position_title: requisition.position_title || "",
        hiring_manager: requisition.hiring_manager || "",
        department: requisition.department || "",
        location: requisition.location || "",
        priority: requisition.priority || "medium",
        status: requisition.status || "open",
        target_start_date: requisition.target_start_date || "",
        hire_date: requisition.hire_date || "",
        description: requisition.description || "",
      });
    }
  }, [requisition]);

  const update = (field: keyof typeof formData, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requisition) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("requisitions")
        .update({
          ...formData,
          target_start_date: formData.target_start_date || null,
          hire_date: formData.hire_date || null,
        })
        .eq("id", requisition.id)
        .eq("user_id", requisition.user_id);

      if (error) throw error;

      toast("Requisition updated successfully!", "success");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update requisition";
      toast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !requisition) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-xl overflow-auto rounded-lg bg-white p-8"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h2 className="mb-1 text-xl font-semibold text-gray-900">
          Edit Requisition
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          Update the details for this position
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Position Title *
            </label>
            <input
              type="text"
              required
              value={formData.position_title}
              onChange={(e) => update("position_title", e.target.value)}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Hiring Manager
              </label>
              <input
                type="text"
                value={formData.hiring_manager}
                onChange={(e) => update("hiring_manager", e.target.value)}
                className="input-field"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => update("department", e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => update("location", e.target.value)}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => update("priority", e.target.value)}
                className="select-field"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => update("status", e.target.value)}
                className="select-field"
              >
                <option value="open">Open</option>
                <option value="interviewing">Interviewing</option>
                <option value="offer_extended">Offer Extended</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Target Start Date
              </label>
              <input
                type="date"
                value={formData.target_start_date}
                onChange={(e) => update("target_start_date", e.target.value)}
                className="input-field"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Hire Date
              </label>
              <input
                type="date"
                value={formData.hire_date}
                onChange={(e) => update("hire_date", e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => update("description", e.target.value)}
              className="input-field min-h-[100px] resize-y"
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
