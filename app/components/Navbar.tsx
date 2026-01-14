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
    <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-2xl bg-black/30">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">DA</span>
          </div>
          <h1 className="text-lg font-semibold text-white/90">
            Dev Assets
          </h1>
        </div>

        {!isLoginPage && (
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Dashboard
            </button>

            <button
              onClick={handleLogout}
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
