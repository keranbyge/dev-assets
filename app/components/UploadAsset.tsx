"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

type UploadAssetProps = { onUploaded?: () => void };
export default function UploadAsset({ onUploaded }: UploadAssetProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [filePath, setFilePath] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Get session for user id
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const userId = session.user.id;

      // Required path: assets/{userId}/{filename} (bucket is 'assets', path is '{userId}/{filename}')
      const path = `${userId}/${file.name}`;

      // Upload to Supabase Storage (allow overwrite to avoid duplicate errors)
      const { error: uploadError } = await supabase.storage
        .from("assets")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      // Get public URL and insert DB record
      const { data } = supabase.storage.from("assets").getPublicUrl(path);
      const publicUrl = data.publicUrl;

      const { error: insertError } = await supabase.from("assets").insert({
        user_id: userId,
        file_name: file.name,
        file_path: path,
        public_url: publicUrl,
      });
      if (insertError) throw insertError;

      setPublicUrl(publicUrl);
      setFilePath(path);
      setSuccess("Uploaded successfully");

      onUploaded?.();
    } catch (err) {
      setSuccess(null);
      if (err instanceof Error) {
        setError(`Upload failed: ${err.message}`);
      } else {
        setError("Upload failed: Unknown error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!filePath) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Remove from storage
      const { error: sErr } = await supabase.storage
        .from("assets")
        .remove([filePath]);
      if (sErr) throw sErr;

      // Remove from DB
      const { error: dbErr } = await supabase
        .from("assets")
        .delete()
        .eq("user_id", session.user.id)
        .eq("file_path", filePath);
      if (dbErr) throw dbErr;

      setPublicUrl(null);
      setFilePath(null);
      setFile(null);
      setSuccess("Deleted successfully");

      onUploaded?.();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Delete failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
      <h2 className="text-lg font-semibold mb-4">Upload Asset</h2>

      <input
        type="file"
        className="block w-full text-sm text-gray-300
        file:mr-4 file:rounded-lg file:border-0
        file:bg-white/10 file:px-4 file:py-2
        file:text-sm file:text-white hover:file:bg-white/20"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      <button
        onClick={handleUpload}
        disabled={loading || !file}
        className="mt-4 w-full rounded-lg bg-white text-black py-2 text-sm font-medium hover:bg-gray-200 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading && (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
        )}
        {loading ? "Uploading..." : "Upload"}
      </button>

      {success && <p className="mt-3 text-sm text-green-400">{success}</p>}
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {publicUrl && (
        <div className="mt-6 space-y-4">
          <Image
            src={publicUrl}
            alt="Uploaded asset"
            width={300}
            height={300}
            className="rounded-xl border border-white/10"
          />

          <a
            href={publicUrl}
            target="_blank"
            className="block text-xs text-blue-400 underline break-all"
          >
            {publicUrl}
          </a>

          <button
            onClick={handleDelete}
            className="flex w-full items-center justify-center rounded-lg border border-red-500/30 text-red-400 py-2 text-sm hover:bg-red-500/10 transition"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
