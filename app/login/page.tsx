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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div 
          className="rounded-3xl p-10 shadow-2xl relative overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          
          {/* Header */}
          <div className="text-center mb-10 relative">
            <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20">
              <span className="text-white font-bold text-2xl tracking-tight">DA</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
            <p className="text-base text-white/50 font-medium">Sign in to your account</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-8 text-sm text-red-300 text-center bg-red-500/15 border border-red-500/20 rounded-2xl p-4 backdrop-blur-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6 relative">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-white/90 mb-3">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                className="w-full rounded-2xl bg-white/8 border border-white/15 px-5 py-4 text-white placeholder-white/40 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/15 outline-none transition-all duration-200 text-base backdrop-blur-sm"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between mb-3">
                <label htmlFor="password" className="text-sm font-semibold text-white/90">
                  Password
                </label>
                <button
                  type="button"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="w-full rounded-2xl bg-white/8 border border-white/15 px-5 py-4 text-white placeholder-white/40 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/15 outline-none transition-all duration-200 text-base backdrop-blur-sm"
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
              className="w-full mt-8 rounded-2xl bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white font-semibold py-4 shadow-xl shadow-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 text-base"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 text-center relative">
            <div className="flex items-center justify-center gap-2 text-xs text-white/30 font-medium">
              <div className="w-2 h-2 rounded-full bg-green-400/60" />
              <span>Secure & Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
