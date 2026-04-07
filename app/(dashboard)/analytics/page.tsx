"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase-browser";
import AnalyticsDashboard from "@/components/dashboard/AnalyticsDashboard";

export default function AnalyticsPage() {
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
          Advanced Analytics
        </h1>
        <p className="text-sm text-gray-500">
          Comprehensive insights into your recruiting performance, source
          effectiveness, conversion rates, and cost optimization
        </p>
      </div>

      {authLoading ? (
        <p className="py-8 text-center text-sm text-gray-500">Loading...</p>
      ) : userId ? (
        <AnalyticsDashboard userId={userId} />
      ) : (
        <p className="py-8 text-center text-sm text-red-600">
          Unable to load user session. Please refresh the page.
        </p>
      )}
    </>
  );
}
