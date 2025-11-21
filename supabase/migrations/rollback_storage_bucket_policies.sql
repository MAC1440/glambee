-- Rollback script for storage bucket policies
-- This will remove the policies created by fix_storage_bucket_policies.sql

-- Drop the Storage policies
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Public can read images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to salons-media" ON storage.objects;
DROP POLICY IF EXISTS "Users can read from salons-media" ON storage.objects;

