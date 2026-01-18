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

  if (isLoginPage) return null;

  return (
    <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-white/5 border-b border-white/10">
      <div className="mx-auto max-w-4xl px-6 h-14 flex items-center justify-between">
        <h1 className="text-base font-semibold text-white">
          Dev Assets
        </h1>

        <button
          onClick={handleLogout}
          className="text-sm text-white/70 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
