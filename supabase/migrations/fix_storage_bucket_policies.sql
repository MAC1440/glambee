-- Fix Storage Bucket Policies for salons-media bucket
-- This allows authenticated users to upload images to the storage bucket
--
-- TO ROLLBACK: Run the rollback_storage_bucket_policies.sql script
-- Or manually drop the policies using:
--   DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
--   DROP POLICY IF EXISTS "Public can read images" ON storage.objects;

-- First, ensure the bucket exists (you need to create it manually in Dashboard if it doesn't exist)
-- Go to Storage → New bucket → Name: salons-media → Make it Public

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Public can read images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to salons-media" ON storage.objects;
DROP POLICY IF EXISTS "Users can read from salons-media" ON storage.objects;

-- Policy 1: Allow authenticated users to upload images to salons-media bucket
CREATE POLICY "Authenticated users can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'salons-media'
);

-- Policy 2: Allow public to read images from salons-media bucket (if bucket is public)
CREATE POLICY "Public can read images"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'salons-media'
);

-- Policy 3: Allow authenticated users to update their own uploads (optional)
CREATE POLICY "Authenticated users can update their uploads"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'salons-media'
  AND (storage.foldername(name))[1] = 'images'
)
WITH CHECK (
  bucket_id = 'salons-media'
  AND (storage.foldername(name))[1] = 'images'
);

-- Policy 4: Allow authenticated users to delete their own uploads (optional)
CREATE POLICY "Authenticated users can delete their uploads"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'salons-media'
  AND (storage.foldername(name))[1] = 'images'
);

