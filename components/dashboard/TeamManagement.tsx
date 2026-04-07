"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useToast } from "@/components/Toast";
import type { Team, TeamMember, TeamInviteFormData } from "@/lib/team-types";

interface TeamManagementProps {
  userId: string;
  onRefresh?: () => void;
}

/** Supabase join may include auth-style metadata not on the base TeamMember type */
function getMemberUserExtras(member: TeamMember) {
  return member.user as
    | (NonNullable<TeamMember["user"]> & {
        raw_user_meta_data?: { full_name?: string };
      })
    | undefined;
}

const getRoleBadgeClasses = (role: string) => {
  switch (role) {
    case "owner":
      return "bg-amber-100 text-amber-900";
    case "admin":
      return "bg-blue-100 text-blue-900";
    case "recruiter":
      return "bg-emerald-100 text-emerald-800";
    case "viewer":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getStatusBadgeClasses = (status: string) => {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-800";
    case "pending":
      return "bg-amber-100 text-amber-900";
    case "suspended":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const INVITABLE_ROLES = ["recruiter", "admin", "viewer"] as const;
type InvitableRole = (typeof INVITABLE_ROLES)[number];

function isInvitableRole(value: string): value is InvitableRole {
  return (INVITABLE_ROLES as readonly string[]).includes(value);
}

export default function TeamManagement({
  userId,
}: TeamManagementProps) {
  const supabase = useMemo(() => createClient(), []);
  const { toast } = useToast();
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteForm, setInviteForm] = useState<TeamInviteFormData>({
    email: "",
    role: "recruiter",
    permissions: {},
  });

  const loadTeamData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: teamData } = await supabase
        .from("teams")
        .select("*")
        .eq("owner_id", userId)
        .single();

      if (teamData) {
        setTeam(teamData);

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
          .eq("team_id", teamData.id);

        setMembers(membersData || []);
      } else {
        setTeam(null);
        setMembers([]);
      }
    } catch {
      setTeam(null);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [userId, supabase]); // supabase is stable (useMemo)

  useEffect(() => {
    loadTeamData();
  }, [loadTeamData]);

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team) return;
    try {
      // Check if an invitation for this email already exists on this team
      const { data: existingInvite } = await supabase
        .from("team_invitations")
        .select("id")
        .eq("team_id", team.id)
        .eq("email", inviteForm.email)
        .eq("status", "pending");

      if (existingInvite && existingInvite.length > 0) {
        toast("An invitation has already been sent to this email", "warning");
        return;
      }

      // Record the invitation in the database
      const { error } = await supabase.from("team_invitations").insert({
        team_id: team.id,
        email: inviteForm.email,
        role: inviteForm.role,
        invited_by: userId,
        status: "pending",
      });

      if (error) throw error;

      // NOTE: Actual email delivery requires an email service (e.g. Resend, SendGrid).
      // The invitation is recorded; integrate an email API to send the message.
      toast(
        `Invitation recorded for ${inviteForm.email}. Connect an email service to deliver it.`,
        "info"
      );

      setShowInviteForm(false);
      setInviteForm({
        email: "",
        role: "recruiter",
        permissions: {},
      });
    } catch {
      toast("Failed to send invitation", "error");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="py-8 text-center text-sm text-gray-500">
        Loading team data...
      </div>
    );
  }

  if (!team) {
    return (
      <div className="py-8 text-center text-sm text-gray-500">No team found</div>
    );
  }

  return (
    <div className="card mb-8">
      <div className="mb-8 flex items-center justify-between border-b border-gray-200 pb-4">
        <h2 className="m-0 text-xl font-semibold text-gray-900">Team Management</h2>
        <button
          type="button"
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="btn-primary"
        >
          + Invite Member
        </button>
      </div>

      <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="mb-2 mt-0 text-lg font-semibold text-gray-900">{team.name}</h3>
        {team.description && (
          <p className="mb-4 mt-0 text-sm text-gray-500">{team.description}</p>
        )}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4">
          <div className="card p-4 text-center">
            <div className="mb-1 text-2xl font-semibold text-gray-900">
              {members.length}
            </div>
            <div className="m-0 text-xs text-gray-500">Team Members</div>
          </div>
          <div className="card p-4 text-center">
            <div className="mb-1 text-2xl font-semibold text-gray-900">
              {members.filter((m) => m.status === "active").length}
            </div>
            <div className="m-0 text-xs text-gray-500">Active Members</div>
          </div>
          <div className="card p-4 text-center">
            <div className="mb-1 text-2xl font-semibold text-gray-900">
              {members.filter((m) => m.role === "recruiter").length}
            </div>
            <div className="m-0 text-xs text-gray-500">Recruiters</div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="mb-4 mt-0 text-lg font-semibold text-gray-900">Team Members</h3>
        {members.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">
            No team members yet
          </div>
        ) : (
          members.map((member) => {
            const u = getMemberUserExtras(member);
            const displayName =
              u?.raw_user_meta_data?.full_name || u?.email || "U";
            return (
              <div
                key={member.id}
                className="mb-3 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-500">
                    {getInitials(displayName)}
                  </div>
                  <div className="flex flex-col">
                    <div className="mb-1 text-sm font-medium text-gray-900">
                      {u?.raw_user_meta_data?.full_name || u?.email}
                    </div>
                    <div className="m-0 text-xs text-gray-500">{u?.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`badge uppercase ${getRoleBadgeClasses(member.role)}`}
                  >
                    {member.role}
                  </span>
                  <span
                    className={`badge uppercase ${getStatusBadgeClasses(member.status)}`}
                  >
                    {member.status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showInviteForm && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h4 className="mb-4 mt-0 text-base font-semibold text-gray-900">
            Invite Team Member
          </h4>
          <form onSubmit={handleInviteMember}>
            <div className="mb-4 flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                className="input-field"
                value={inviteForm.email}
                onChange={(e) =>
                  setInviteForm({ ...inviteForm, email: e.target.value })
                }
                required
              />
            </div>
            <div className="mb-4 flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Role</label>
              <select
                className="select-field"
                value={inviteForm.role}
                onChange={(e) => {
                  const value = e.target.value;
                  if (isInvitableRole(value)) {
                    setInviteForm({ ...inviteForm, role: value });
                  }
                }}
              >
                <option value="recruiter">Recruiter</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowInviteForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Send Invitation
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
