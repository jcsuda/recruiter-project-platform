"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase-browser";
import TeamManagement from "@/components/dashboard/TeamManagement";

export default function TeamPage() {
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
      setAuthLoading(false);
    });
  }, [supabase]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Team Collaboration
        </h1>
        <p className="text-sm text-gray-500">
          Manage your recruiting team, assign candidates, track approvals, and
          collaborate effectively
        </p>
      </div>

      {authLoading ? (
        <p className="py-8 text-center text-sm text-gray-500">Loading...</p>
      ) : userId ? (
        <TeamManagement userId={userId} />
      ) : (
        <p className="py-8 text-center text-sm text-red-600">
          Unable to load user session. Please refresh the page.
        </p>
      )}
    </>
  );
}
