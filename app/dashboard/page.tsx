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

      if (error) throw new Error(error.message);
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
      
      if (dbErr) throw new Error(dbErr.message);

      await supabase.storage.from("assets").remove([asset.file_path]);
    } catch (err) {
      setAssets(previousAssets);
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  if (!sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-neutral-400 mt-1">Manage your assets</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <UploadAsset onUploaded={fetchAssets} />
          </div>

          <div className="lg:col-span-2">
            <div className="backdrop-blur-xl bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-white">Your Assets</h2>
                  <p className="text-sm text-neutral-400 mt-1">
                    {assets.length} {assets.length === 1 ? 'file' : 'files'}
                  </p>
                </div>
                {loading && <div className="text-sm text-neutral-400">Loading...</div>}
              </div>

              {error && (
                <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 p-4 text-sm">
                  {error}
                </div>
              )}

              {assets.length === 0 && !loading ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📁</div>
                  <p className="text-neutral-400">No assets yet. Upload your first file.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {assets.map((asset) => {
                    const url = asset.public_url ?? publicUrlFor(asset.file_path);
                    const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(asset.file_name);
                    
                    return (
                      <div
                        key={asset.id}
                        className="group bg-neutral-800/50 border border-neutral-700 rounded-lg overflow-hidden hover:border-neutral-600 transition"
                      >
                        <div className="relative aspect-video bg-neutral-900">
                          {isImage ? (
                            <img
                              src={url}
                              alt={asset.file_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <span className="text-4xl">📄</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4">
                          <h3 className="font-medium text-white truncate mb-2" title={asset.file_name}>
                            {asset.file_name}
                          </h3>
                          <div className="flex gap-2">
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 text-center text-sm bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-1.5 transition"
                            >
                              View
                            </a>
                            <button
                              onClick={() => deleteAsset(asset)}
                              className="text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded px-3 py-1.5 transition"
                            >
                              Delete
                            </button>
                          </div>
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
    </div>
  );
}
