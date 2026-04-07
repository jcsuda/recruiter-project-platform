"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

export default function DashboardHeader() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">HIRELab</h1>
          <p className="hidden text-sm text-gray-500 sm:block">
            Build searches, track requisitions, and manage your pipeline
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {loading ? (
            <span className="text-sm text-gray-400">Loading...</span>
          ) : user ? (
            <>
              <span className="text-sm text-gray-700">{user.email}</span>
              <button onClick={handleSignOut} className="btn-secondary text-sm">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push("/signin")}
                className="btn-primary text-sm"
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
