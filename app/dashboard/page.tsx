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
      <div className="min-h-screen pt-14 flex items-center justify-center">
        <div className="text-white/50 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-14 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div 
          className="rounded-2xl p-8 shadow-2xl"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Dev Assets</h1>
            <p className="text-sm text-white/60">Manage your digital assets</p>
          </div>

          {/* Upload Section */}
          <div className="mb-8">
            <div 
              className="rounded-xl p-6"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <UploadAsset onUploaded={fetchAssets} />
            </div>
          </div>

          {/* Assets Section */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Your Assets</h2>
            
            {error && (
              <div className="mb-4 text-sm text-red-400">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-8 text-white/50 text-sm">Loading...</div>
            ) : assets.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3 opacity-30">📁</div>
                <p className="text-white text-sm mb-1">No assets yet</p>
                <p className="text-white/60 text-xs">Upload your first file to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {assets.map((asset) => {
                  const url = asset.public_url ?? publicUrlFor(asset.file_path);
                  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(asset.file_name);
                  
                  return (
                    <div
                      key={asset.id}
                      className="rounded-xl p-4 transition-all hover:scale-105"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <div className="aspect-square rounded-lg bg-black/30 mb-3 overflow-hidden">
                        {isImage ? (
                          <img src={url} alt={asset.file_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-3xl opacity-40">📄</span>
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-sm font-medium text-white truncate mb-3" title={asset.file_name}>
                        {asset.file_name}
                      </h3>
                      
                      <div className="flex gap-2">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 transition-all font-medium"
                        >
                          View
                        </a>
                        <button
                          onClick={() => deleteAsset(asset)}
                          className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg px-3 py-2 transition-all font-medium"
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
