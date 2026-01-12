"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <main className="relative min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      {/* Centered glass card */}
      <div className="relative w-full max-w-md rounded-2xl border border-white/15 bg-white/10 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.45)] ring-1 ring-white/5 p-8">
        {/* glow accents */}
        <div className="pointer-events-none absolute -inset-px rounded-2xl shadow-[0_0_80px_rgba(59,130,246,0.25)]" />

        {/* Header */}
        <h1 className="text-3xl font-semibold text-white text-center tracking-tight">
          Dev Assets
        </h1>
        <p className="text-sm text-gray-300 text-center mt-2">Sign in to continue</p>

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Inputs */}
        <div className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-white placeholder-white/60 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-white placeholder-white/60 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-xl bg-blue-500 text-white font-medium py-3 shadow-[0_10px_30px_rgba(59,130,246,0.35)] hover:shadow-[0_12px_36px_rgba(59,130,246,0.45)] active:scale-[0.99] transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-400 text-center mt-6">Secure • Fast • Modern</p>
      </div>
    </main>
  );
}
