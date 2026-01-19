"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type UploadAssetProps = { onUploaded?: () => void };

export default function UploadAsset({ onUploaded }: UploadAssetProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw new Error("Authentication error");
      if (!session) throw new Error("Not authenticated");

      const userId = session.user.id;
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const path = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("assets")
        .upload(path, file, { cacheControl: '3600', upsert: false });
      
      if (uploadError) throw new Error("Upload failed");

      const { data: urlData } = supabase.storage.from("assets").getPublicUrl(path);
      const publicUrl = urlData.publicUrl;

      const { error: insertError } = await supabase.from("assets").insert({
        user_id: userId,
        file_name: file.name,
        file_path: path,
        public_url: publicUrl,
      });
      
      if (insertError) {
        await supabase.storage.from("assets").remove([path]);
        throw new Error("Failed to save asset");
      }

      setSuccess("File uploaded successfully!");
      setFile(null);
      onUploaded?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <h3 className="text-lg font-bold text-white mb-6 tracking-tight">Upload New Asset</h3>
      
      <div className="space-y-6">
        <div className="relative">
          <input
            type="file"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            className="block w-full text-base text-white/70
              file:mr-5 file:rounded-2xl file:border-0
              file:bg-blue-600/80 file:px-6 file:py-3
              file:text-sm file:text-white file:font-semibold
              hover:file:bg-blue-600 file:backdrop-blur-sm
              file:cursor-pointer cursor-pointer file:transition-all file:duration-200
              file:shadow-lg file:shadow-blue-500/20"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setError(null);
              setSuccess(null);
            }}
            disabled={loading}
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className="w-full rounded-2xl bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white font-semibold py-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 text-base shadow-xl shadow-blue-500/20 backdrop-blur-sm"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Uploading...
            </div>
          ) : (
            "Upload File"
          )}
        </button>

        {success && (
          <div className="text-sm text-green-300 bg-green-500/15 border border-green-500/20 rounded-2xl p-4 backdrop-blur-sm font-medium">
            {success}
          </div>
        )}
        
        {error && (
          <div className="text-sm text-red-300 bg-red-500/15 border border-red-500/20 rounded-2xl p-4 backdrop-blur-sm font-medium">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
