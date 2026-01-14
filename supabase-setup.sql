-- Supabase Storage Setup for Dev Assets
-- Run these commands in your Supabase SQL Editor

-- 1. Create the assets bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Create assets table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  public_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS on assets table
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- 4. Storage policies for authenticated users
-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload to their own folder" ON storage.objects
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND
  bucket_id = 'assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to view files in their own folder
CREATE POLICY "Users can view their own files" ON storage.objects
FOR SELECT USING (
  auth.role() = 'authenticated' AND
  bucket_id = 'assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete files in their own folder
CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE USING (
  auth.role() = 'authenticated' AND
  bucket_id = 'assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update files in their own folder
CREATE POLICY "Users can update their own files" ON storage.objects
FOR UPDATE USING (
  auth.role() = 'authenticated' AND
  bucket_id = 'assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Database policies for assets table
-- Users can only see their own assets
CREATE POLICY "Users can view their own assets" ON public.assets
FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own assets
CREATE POLICY "Users can insert their own assets" ON public.assets
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own assets
CREATE POLICY "Users can update their own assets" ON public.assets
FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own assets
CREATE POLICY "Users can delete their own assets" ON public.assets
FOR DELETE USING (auth.uid() = user_id);