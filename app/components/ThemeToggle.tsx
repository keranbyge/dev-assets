"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "dark";
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
    return "light";
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("theme", theme);
    } catch {}
    setMounted(true);
  }, [theme]);

  const apply = (next: "light" | "dark") => {
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {}
    setTheme(next);
  };

  if (!mounted) {
    // Placeholder to avoid mismatch before mount
    return (
      <div className="h-8 w-16 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      aria-label="Toggle theme"
      onClick={() => apply(isDark ? "light" : "dark")}
      className="relative inline-flex h-8 w-16 items-center justify-between rounded-full border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/10 backdrop-blur px-1 transition-colors"
    >
      {/* Sun icon (light) */}
      <span
        className={
          "text-[13px] transition-all duration-300 " +
          (isDark ? "text-black/30 dark:text-white/40 scale-90" : "text-amber-500 drop-shadow scale-110")
        }
      >
        ☀️
      </span>
      {/* Moon icon (dark) */}
      <span
        className={
          "text-[13px] transition-all duration-300 " +
          (isDark ? "text-indigo-400 drop-shadow scale-110" : "text-black/30 dark:text-white/40 scale-90")
        }
      >
        🌙
      </span>
      {/* Sliding thumb */}
      <span
        className={
          "absolute inset-y-1 left-1 w-7 rounded-full bg-black/5 dark:bg-white/10 shadow-sm transition-transform duration-300 will-change-transform " +
          (isDark ? "translate-x-7" : "translate-x-0")
        }
      />
    </button>
  );
}
