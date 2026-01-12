"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar() {
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    // initialize theme from localStorage
    const saved = (typeof window !== "undefined" && localStorage.getItem("theme")) as
      | "light"
      | "dark"
      | null;
    const initial = saved ?? "dark";
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  useEffect(() => {
    // apply theme on change with smooth transition
    if (typeof window === "undefined") return;
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.setProperty("transition", "background-color 300ms, color 300ms");
  }, [theme]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-lg bg-white/10 border border-white/10 shadow-inner" />
          <h1 className="text-sm sm:text-base font-semibold tracking-tight">Dev Assets</h1>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-xs sm:text-sm text-white/90 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition"
          >
            Dashboard
          </button>

          <button
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            aria-label="Toggle theme"
            className="relative inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs sm:text-sm shadow-[0_0_20px_rgba(255,255,255,0.08)] hover:bg-white/20 transition"
          >
            <span className="pointer-events-none select-none">
              {theme === "dark" ? "🌙" : "🌞"}
            </span>
            <span className="hidden sm:inline">{theme === "dark" ? "Dark" : "Light"}</span>
          </button>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-white/20 bg-white/10 px-3 sm:px-4 py-1.5 text-xs sm:text-sm hover:bg-white/20 shadow-md shadow-black/20 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
