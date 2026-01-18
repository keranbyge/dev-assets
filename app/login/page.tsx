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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div 
          className="rounded-2xl p-8 shadow-2xl"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="mx-auto w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mb-4">
              <span className="text-white font-bold text-lg">DA</span>
            </div>
            <h1 className="text-xl font-semibold text-white mb-1">Login</h1>
            <p className="text-sm text-white/60">Sign in to continue</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 text-sm text-red-400 text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email"
                className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
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
              <input
                type="password"
                placeholder="Password"
                className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
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
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
