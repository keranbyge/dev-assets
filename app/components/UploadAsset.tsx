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
      if (sessionError) throw new Error("Authentication error: " + sessionError.message);
      if (!session) throw new Error("Not authenticated. Please log in.");

      const userId = session.user.id;
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const path = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("assets")
        .upload(path, file, { cacheControl: '3600', upsert: false });
      
      if (uploadError) throw new Error("Upload failed: " + uploadError.message);

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
        throw new Error("Database error: " + insertError.message);
      }

      setSuccess("File uploaded successfully!");
      setFile(null);
      onUploaded?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-base font-semibold text-white/90 mb-4">Upload Asset</h3>
      
      <div className="space-y-3">
        <input
          type="file"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          className="block w-full text-sm text-white/70
            file:mr-4 file:rounded-lg file:border-0
            file:bg-gradient-to-r file:from-blue-500 file:to-blue-600
            file:px-4 file:py-2 file:text-sm file:text-white file:font-medium
            file:shadow-lg file:shadow-blue-500/20
            hover:file:from-blue-600 hover:file:to-blue-700
            file:cursor-pointer cursor-pointer file:transition-all"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setError(null);
            setSuccess(null);
          }}
          disabled={loading}
        />

        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2.5 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {loading ? "Uploading..." : "Upload File"}
        </button>

        {success && (
          <p className="text-green-400 text-xs">{success}</p>
        )}
        
        {error && (
          <p className="text-red-400 text-xs">{error}</p>
        )}
      </div>
    </div>
  );
}
