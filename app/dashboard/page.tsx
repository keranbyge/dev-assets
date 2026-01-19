"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import UploadAsset from "@/app/components/UploadAsset";

interface Asset {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  public_url?: string | null;
  created_at: string;
}

export default function DashboardPage() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          window.location.href = "/login";
          return;
        }
        setSessionChecked(true);
      } catch (err) {
        window.location.href = "/login";
      }
    };
    checkSession();
  }, []);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error("Authentication required");

      const { data, error } = await supabase
        .from("assets")
        .select("id, user_id, file_name, file_path, public_url, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw new Error("Failed to load assets");
      setAssets(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load assets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionChecked) fetchAssets();
  }, [sessionChecked, fetchAssets]);

  const publicUrlFor = (path: string) =>
    supabase.storage.from("assets").getPublicUrl(path).data.publicUrl;

  const deleteAsset = async (asset: Asset) => {
    const previousAssets = assets;
    setAssets((current) => current.filter((a) => a.id !== asset.id));
    
    try {
      const { error: dbErr } = await supabase
        .from("assets")
        .delete()
        .eq("id", asset.id)
        .eq("user_id", asset.user_id);
      
      if (dbErr) throw new Error("Failed to delete asset");

      await supabase.storage.from("assets").remove([asset.file_path]);
    } catch (err) {
      setAssets(previousAssets);
      setError("Failed to delete asset");
    }
  };

  if (!sessionChecked) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          <span className="text-white/60 text-base font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
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
            <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">Dev Assets</h1>
            <p className="text-base text-white/50 font-medium">Manage and organize your digital assets</p>
          </div>

          {/* Upload Section */}
          <div className="mb-10">
            <div 
              className="rounded-2xl p-8 relative overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent pointer-events-none" />
              <UploadAsset onUploaded={fetchAssets} />
            </div>
          </div>

          {/* Assets Section */}
          <div className="relative">
            <h2 className="text-xl font-bold text-white mb-6 tracking-tight">Your Assets</h2>
            
            {error && (
              <div className="mb-6 text-sm text-red-300 bg-red-500/15 border border-red-500/20 rounded-2xl p-4 backdrop-blur-sm">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white/50 text-base font-medium">Loading assets...</p>
              </div>
            ) : assets.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4 opacity-20">📁</div>
                <p className="text-white text-lg mb-2 font-semibold">No assets yet</p>
                <p className="text-white/50 text-base font-medium">Upload your first file to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {assets.map((asset) => {
                  const url = asset.public_url ?? publicUrlFor(asset.file_path);
                  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(asset.file_name);
                  
                  return (
                    <div
                      key={asset.id}
                      className="rounded-2xl p-5 transition-all duration-200 hover:scale-[1.02] group relative overflow-hidden"
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                      
                      <div className="aspect-square rounded-xl bg-black/20 mb-4 overflow-hidden relative">
                        {isImage ? (
                          <img src={url} alt={asset.file_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-4xl opacity-30">📄</span>
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-sm font-semibold text-white truncate mb-4 relative" title={asset.file_name}>
                        {asset.file_name}
                      </h3>
                      
                      <div className="flex gap-3 relative">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center text-sm bg-blue-600/80 hover:bg-blue-600 text-white rounded-xl px-4 py-2.5 transition-all font-semibold backdrop-blur-sm"
                        >
                          View
                        </a>
                        <button
                          onClick={() => deleteAsset(asset)}
                          className="text-sm bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl px-4 py-2.5 transition-all font-semibold backdrop-blur-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
