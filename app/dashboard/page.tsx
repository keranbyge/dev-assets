"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import UploadAsset from "@/app/components/UploadAsset";

interface Asset {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  mime_type: string | null;
  created_at: string;
}

export default function DashboardPage() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep original session check behavior
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        window.location.href = "/login";
        return;
      }
      setSessionChecked(true);
    };
    checkSession();
  }, []);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("assets")
        .select("id, user_id, file_name, file_path, mime_type, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAssets(data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load assets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionChecked) {
      fetchAssets();
    }
  }, [sessionChecked, fetchAssets]);

  const publicUrlFor = (path: string) =>
    supabase.storage.from("assets").getPublicUrl(path).data.publicUrl;

  const deleteAsset = async (asset: Asset) => {
    // optimistic update
    const prev = assets;
    setAssets((cur) => cur.filter((a) => a.id !== asset.id));
    try {
      const { error: sErr } = await supabase.storage
        .from("assets")
        .remove([asset.file_path]);
      if (sErr) throw sErr;

      const { error: dbErr } = await supabase
        .from("assets")
        .delete()
        .eq("id", asset.id)
        .eq("user_id", asset.user_id);
      if (dbErr) throw dbErr;
    } catch (e) {
      // revert on failure
      setAssets(prev);
      setError(e instanceof Error ? e.message : "Failed to delete asset");
    }
  };

  const handleAfterUpload = () => {
    // Re-fetch to include newly uploaded item
    fetchAssets();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
      </div>

      {/* Upload card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl">
        <div className="p-6">
          <UploadAsset onUploaded={handleAfterUpload} />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 p-4 text-sm">
          {error}
        </div>
      )}

      {/* Assets grid */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your Assets</h2>
          {loading && <span className="text-xs text-gray-400">Loading…</span>}
        </div>
        {assets.length === 0 && !loading ? (
          <p className="text-sm text-gray-400">No assets yet. Upload your first file above.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {assets.map((asset) => {
              const url = publicUrlFor(asset.file_path);
              return (
                <div
                  key={asset.id}
                  className="group rounded-xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden shadow hover:shadow-2xl transition-shadow"
                >
                  <div className="relative aspect-square bg-black/30">
                    {/* Use next/image for optimization; fall back with unoptimized */}
                    <Image
                      src={url}
                      alt={asset.file_name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium truncate" title={asset.file_name}>
                        {asset.file_name}
                      </p>
                      <button
                        onClick={() => deleteAsset(asset)}
                        className="rounded-md border border-red-500/30 text-red-300 text-xs px-2 py-1 hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </div>
                    <a
                      href={url}
                      target="_blank"
                      className="block text-[11px] text-blue-300/90 underline break-all hover:text-blue-200"
                    >
                      {url}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
