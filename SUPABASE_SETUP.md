# Supabase Storage Setup - REQUIRED

## The upload is failing because the storage bucket needs to be configured properly.

### Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `dinkllbvkwwxvlttgkww`
3. Go to **Storage** in the left sidebar
4. Click **New bucket**
5. Name: `assets`
6. Make it **Public** (check the box)
7. Click **Create bucket**

### Step 2: Set Storage Policies

Go to **Storage** > **Policies** and add these policies:

#### Policy 1: Allow authenticated users to upload
```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);
```

#### Policy 2: Allow authenticated users to read their own files
```sql
CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);
```

#### Policy 3: Allow public reads (optional, for public URLs)
```sql
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'assets');
```

#### Policy 4: Allow authenticated users to delete their own files
```sql
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### Step 3: Verify Database Table

Make sure the `assets` table exists with proper RLS policies:

```sql
-- Create table if not exists
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  public_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own assets
CREATE POLICY "Users can insert own assets"
ON public.assets FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own assets
CREATE POLICY "Users can view own assets"
ON public.assets FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can delete their own assets
CREATE POLICY "Users can delete own assets"
ON public.assets FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

### Step 4: Test Upload

1. Clear browser cache and cookies
2. Log out and log back in
3. Try uploading a file
4. Check browser console for detailed logs

### Common Issues:

**"Authentication error"**
- Session expired - log out and log back in
- Check if user is properly authenticated

**"Upload failed: new row violates row-level security policy"**
- RLS policies not set correctly
- Run the SQL policies above

**"Upload failed: Bucket not found"**
- Storage bucket "assets" doesn't exist
- Create it in Supabase Dashboard

**"Failed to fetch"**
- Network issue or CORS problem
- Check Supabase project URL is correct
- Verify API keys are correct

### After Setup:

Run the app:
```bash
npm run dev
```

The upload should now work properly with detailed console logs showing each step.
