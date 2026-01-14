"use client";

import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/login");
    }
  };

  const isLoginPage = pathname === "/login";

  return (
    <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-[#0a0e1a]/80 border-b border-neutral-800">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">DA</span>
          </div>
          <h1 className="text-base font-semibold text-white">
            Dev Assets
          </h1>
        </div>

        {!isLoginPage && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-neutral-400 hover:text-white transition"
            >
              Dashboard
            </button>

            <button
              onClick={handleLogout}
              className="text-sm text-neutral-400 hover:text-white transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
