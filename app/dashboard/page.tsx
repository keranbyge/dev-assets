"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        setError("Authentication error. Please log in again.");
        setLoading(false);
        return;
      }
      
      if (!sessionData?.session) {
        router.push("/login");
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("assets")
        .select("id, user_id, file_name, file_path, public_url, created_at")
        .eq("user_id", sessionData.session.user.id)
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Database error:", fetchError);
        setError("Failed to load assets. Please refresh the page.");
        setAssets([]);
      } else {
        setAssets(data || []);
      }
      
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred. Please refresh the page.");
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const publicUrlFor = (path: string) => {
    try {
      if (!path) return "";
      return supabase.storage.from("assets").getPublicUrl(path).data.publicUrl;
    } catch (err) {
      console.error("Error generating public URL:", err);
      return "";
    }
  };

  const deleteAsset = async (asset: Asset) => {
    const previousAssets = assets;
    setAssets((current) => current.filter((a) => a.id !== asset.id));
    
    try {
      const { error: dbErr } = await supabase
        .from("assets")
        .delete()
        .eq("id", asset.id)
        .eq("user_id", asset.user_id);
      
      if (dbErr) {
        console.error("Delete error:", dbErr);
        throw dbErr;
      }

      await supabase.storage.from("assets").remove([asset.file_path]).catch((err) => {
        console.warn("Storage delete warning:", err);
      });
    } catch (err) {
      console.error("Delete failed:", err);
      setAssets(previousAssets);
      setError("Failed to delete asset");
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="glass-strong rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Dev Assets</h1>
            <p className="text-white/60 text-sm">Manage your digital assets</p>
          </div>

          <div className="mb-8">
            <div className="glass rounded-2xl p-6">
              <UploadAsset onUploaded={fetchAssets} />
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Your Assets</h2>
            
            {error && (
              <div className="mb-4 text-sm text-red-300 bg-red-500/10 rounded-xl p-3 border border-red-500/20">
                <strong>Error:</strong> {error}
                <button
                  onClick={() => {
                    setError(null);
                    fetchAssets();
                  }}
                  className="ml-2 underline hover:text-red-200"
                >
                  Retry
                </button>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-white/60 text-sm">Loading assets...</p>
              </div>
            ) : assets.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3 opacity-30">📁</div>
                <p className="text-white text-sm mb-1">No assets yet</p>
                <p className="text-white/60 text-xs">Upload your first file to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {assets.map((asset) => {
                  const url = asset.public_url || publicUrlFor(asset.file_path);
                  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(asset.file_name || "");
                  
                  return (
                    <div
                      key={asset.id}
                      className="bg-white/5 rounded-xl p-4 border border-white/10 transition-all hover:bg-white/10"
                    >
                      <div className="aspect-square rounded-lg bg-black/30 mb-3 overflow-hidden">
                        {isImage && url ? (
                          <img 
                            src={url} 
                            alt={asset.file_name || "Asset"} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-3xl opacity-40">📄</span>
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-sm font-medium text-white truncate mb-3" title={asset.file_name || ""}>
                        {asset.file_name || "Untitled"}
                      </h3>
                      
                      <div className="flex gap-2">
                        {url && (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 transition-all font-medium"
                          >
                            View
                          </a>
                        )}
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
