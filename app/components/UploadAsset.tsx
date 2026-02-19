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

    console.log("Starting upload for:", file.name);
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Step 1: Check session
      console.log("Step 1: Checking session...");
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw new Error(`Authentication error: ${sessionError.message}`);
      }
      
      if (!session) {
        console.error("No session found");
        throw new Error("Not authenticated. Please log in again.");
      }

      console.log("Session valid, user ID:", session.user.id);

      // Step 2: Prepare file path
      const userId = session.user.id;
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const path = `${userId}/${fileName}`;
      
      console.log("Step 2: Uploading to path:", path);

      // Step 3: Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("assets")
        .upload(path, file, { 
          cacheControl: "3600", 
          upsert: false 
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log("Step 3: Upload successful:", uploadData);

      // Step 4: Get public URL
      const { data: urlData } = supabase.storage.from("assets").getPublicUrl(path);
      const publicUrl = urlData.publicUrl;
      console.log("Step 4: Public URL:", publicUrl);

      // Step 5: Insert into database
      console.log("Step 5: Inserting into database...");
      const { data: insertData, error: insertError } = await supabase
        .from("assets")
        .insert({
          user_id: userId,
          file_name: file.name,
          file_path: path,
          public_url: publicUrl,
        })
        .select();

      if (insertError) {
        console.error("Database insert error:", insertError);
        // Cleanup uploaded file
        await supabase.storage.from("assets").remove([path]).catch((e) => {
          console.error("Cleanup error:", e);
        });
        throw new Error(`Failed to save asset: ${insertError.message}`);
      }

      console.log("Step 5: Database insert successful:", insertData);

      setSuccess("File uploaded successfully!");
      setFile(null);
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
      if (onUploaded) {
        console.log("Refreshing assets list...");
        setTimeout(() => onUploaded(), 500);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      console.error("Upload error:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log("Upload process completed");
    }
  };

  return (
    <div>
      <h3 className="text-base font-semibold text-white mb-4">Upload Asset</h3>

      <div className="space-y-4">
        <input
          type="file"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          className="block w-full text-sm text-white/70
            file:mr-4 file:rounded-xl file:border-0
            file:bg-blue-600 file:px-4 file:py-2.5
            file:text-sm file:text-white file:font-medium
            hover:file:bg-blue-700
            file:cursor-pointer cursor-pointer file:transition-all"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0] || null;
            setFile(selectedFile);
            setError(null);
            setSuccess(null);
            if (selectedFile) {
              console.log("File selected:", selectedFile.name, selectedFile.size, "bytes");
            }
          }}
          disabled={loading}
        />

        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Uploading..." : "Upload File"}
        </button>

        {success && (
          <div className="text-sm text-green-300 bg-green-500/10 rounded-xl p-3 border border-green-500/20">
            ✓ {success}
          </div>
        )}

        {error && (
          <div className="text-sm text-red-300 bg-red-500/10 rounded-xl p-3 border border-red-500/20">
            ✗ {error}
          </div>
        )}
      </div>
    </div>
  );
}
