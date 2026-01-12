"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardPage() {
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      // 🔒 If no session, kick user to login
      if (!data.session) {
        window.location.href = "/login";
      }
    };

    checkSession();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-gray-600">
        Welcome! You are successfully logged in.
      </p>
    </div>
  );
}
