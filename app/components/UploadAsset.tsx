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
    <div className="backdrop-blur-xl bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Upload Asset</h2>

      <div className="space-y-4">
        <input
          type="file"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          className="block w-full text-sm text-neutral-400
            file:mr-4 file:rounded-lg file:border-0
            file:bg-blue-600 file:px-4 file:py-2
            file:text-sm file:text-white file:font-medium
            hover:file:bg-blue-700 file:cursor-pointer cursor-pointer"
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
          className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {success && (
        <div className="mt-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 p-3 text-sm">
          {success}
        </div>
      )}
      
      {error && (
        <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 p-3 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
