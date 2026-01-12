"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();

    // 🔴 FORCE FULL RELOAD (this fixes layout cache issue)
    window.location.href = "/login";
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-black text-white border-b border-white/10">
      <h1 className="text-lg font-semibold">Dev Assets</h1>

      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm text-white/90 hover:text-white"
        >
          Dashboard
        </button>

        <button
          onClick={handleLogout}
          className="rounded-lg border border-white/20 px-4 py-1.5 text-sm hover:bg-white/10 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
