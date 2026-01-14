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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw new Error(error.message);
      if (data.user) router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="backdrop-blur-xl bg-neutral-900/50 border border-neutral-800 rounded-xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center mb-4">
              <span className="text-xl font-bold text-white">DA</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-neutral-400 text-sm">Sign in to Dev Assets</p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-lg bg-neutral-800/50 border border-neutral-700 px-4 py-2.5 text-white placeholder-neutral-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                disabled={loading}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg bg-neutral-800/50 border border-neutral-700 px-4 py-2.5 text-white placeholder-neutral-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
