"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useToast } from "@/components/Toast";
import type {
  CandidateAssignment as CandidateAssignmentRow,
  AssignmentFormData,
  TeamMember,
} from "@/lib/team-types";

interface CandidateAssignmentProps {
  candidateId: string;
  candidateName: string;
  onRefresh?: () => void;
}

function userDisplayName(
  user:
    | { email?: string | null; full_name?: string | null }
    | undefined
    | null
): string | undefined {
  if (!user) return undefined;
  const u = user as {
    email?: string | null;
    full_name?: string | null;
    raw_user_meta_data?: { full_name?: string | null };
  };
  return (
    u.raw_user_meta_data?.full_name ||
    u.full_name ||
    u.email ||
    undefined
  );
}

function getTypeBadgeClass(type: string): string {
  switch (type) {
    case "primary":
      return "bg-blue-100 text-blue-800";
    case "secondary":
      return "bg-purple-100 text-purple-800";
    case "reviewer":
      return "bg-amber-100 text-amber-800";
    case "interviewer":
      return "bg-emerald-100 text-emerald-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function CandidateAssignment({
  candidateId,
  onRefresh,
}: CandidateAssignmentProps) {
  const supabase = useMemo(() => createClient(), []);
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<CandidateAssignmentRow[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<AssignmentFormData>({
    candidate_id: candidateId,
    assigned_to: "",
    assignment_type: "primary",
    notes: "",
  });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: assignmentData } = await supabase
        .from("candidate_assignments")
        .select(
          `
          *,
          assigned_to_user:assigned_to (
            id,
            email,
            raw_user_meta_data
          ),
          assigned_by_user:assigned_by (
            id,
            email,
            raw_user_meta_data
          )
        `
        )
        .eq("candidate_id", candidateId);

      setAssignments(assignmentData || []);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: teamData } = await supabase
          .from("teams")
          .select("id")
          .eq("owner_id", user.id)
          .single();

        if (teamData) {
          const { data: membersData } = await supabase
            .from("team_members")
            .select(
              `
              *,
              user:user_id (
                id,
                email,
                raw_user_meta_data
              )
            `
            )
            .eq("team_id", teamData.id)
            .eq("status", "active");

          setTeamMembers(membersData || []);
        }
      }
    } catch {
      // Silently fail — data will remain empty
    } finally {
      setLoading(false);
    }
  }, [candidateId, supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("candidate_assignments").insert({
        ...formData,
        assigned_by: user.id,
      });

      if (error) throw error;

      setShowForm(false);
      setFormData({
        candidate_id: candidateId,
        assigned_to: "",
        assignment_type: "primary",
        notes: "",
      });
      loadData();
      onRefresh?.();
    } catch {
      toast("Failed to create assignment", "error");
    }
  };

  if (loading) {
    return (
      <div className="py-4 text-center text-sm text-gray-500">
        Loading assignments...
      </div>
    );
  }

  return (
    <div className="card mt-4 border-gray-200 bg-gray-50 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="m-0 text-base font-semibold text-gray-900">
          Team Assignments
        </h4>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="btn-primary px-3 py-1 text-xs"
        >
          + Assign
        </button>
      </div>

      {assignments.length === 0 ? (
        <div className="py-4 text-center text-sm text-gray-500">
          No assignments yet
        </div>
      ) : (
        assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="card mb-2 flex items-center justify-between p-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <div className="mb-1 text-sm font-medium text-gray-900">
                  {userDisplayName(assignment.assigned_to_user)}
                </div>
                <div className="m-0 text-xs text-gray-500">
                  Assigned by {userDisplayName(assignment.assigned_by_user)}
                </div>
                {assignment.notes && (
                  <div className="mt-1 text-xs text-gray-500">
                    {assignment.notes}
                  </div>
                )}
              </div>
            </div>
            <span
              className={`badge uppercase ${getTypeBadgeClass(assignment.assignment_type)}`}
            >
              {assignment.assignment_type}
            </span>
          </div>
        ))
      )}

      {showForm && (
        <div className="card mt-2 p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-4 flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Assign To
              </label>
              <select
                className="select-field"
                value={formData.assigned_to}
                onChange={(e) =>
                  setFormData({ ...formData, assigned_to: e.target.value })
                }
                required
              >
                <option value="">Select team member...</option>
                {teamMembers.map((member) => (
                  <option key={member.user_id} value={member.user_id}>
                    {userDisplayName(member.user)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4 flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Assignment Type
              </label>
              <select
                className="select-field"
                value={formData.assignment_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    assignment_type: e.target.value as AssignmentFormData["assignment_type"],
                  })
                }
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="reviewer">Reviewer</option>
                <option value="interviewer">Interviewer</option>
              </select>
            </div>

            <div className="mb-4 flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Notes (Optional)
              </label>
              <textarea
                className="input-field min-h-[60px] font-[inherit]"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Add any notes about this assignment..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Assign
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
