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
    <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-white/4 border-b border-white/8">
      <div className="mx-auto max-w-5xl px-8 h-16 flex items-center justify-between">
        <h1 className="text-lg font-bold text-white tracking-tight">
          Dev Assets
        </h1>

        <button
          onClick={handleLogout}
          className="text-sm text-white/60 hover:text-white transition-all duration-200 px-4 py-2 rounded-xl hover:bg-white/8 font-semibold backdrop-blur-sm"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
