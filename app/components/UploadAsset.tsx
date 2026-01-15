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
    <div>
      <label className="block text-sm font-medium text-white mb-3">Upload Asset</label>
      
      <div className="space-y-3">
        <div className="relative">
          <input
            type="file"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            className="block w-full text-xs text-neutral-400
              file:mr-3 file:rounded-xl file:border-0
              file:bg-blue-600 file:px-4 file:py-2.5
              file:text-xs file:text-white file:font-medium
              hover:file:bg-blue-700
              file:cursor-pointer cursor-pointer file:transition-all"
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
          className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {loading ? "Uploading..." : "Upload File"}
        </button>

        {success && (
          <p className="text-xs text-green-400">{success}</p>
        )}
        
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
      </div>
    </div>
  );
}
