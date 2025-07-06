-- Fix Supabase Storage URL Issues for Placid API
-- Run this script to ensure proper storage bucket permissions

-- 1. Check current storage bucket configuration
SELECT 
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE name = 'content-assets';

-- 2. Create content-assets bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'content-assets',
  'content-assets', 
  true,  -- Make public for Placid API access
  52428800, -- 50MB limit
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'];

-- 3. Set up proper RLS policies for public read access
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
CREATE POLICY "Allow public read access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'content-assets');

-- 4. Allow authenticated users to upload
DROP POLICY IF EXISTS "Allow authenticated upload" ON storage.objects;
CREATE POLICY "Allow authenticated upload" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'content-assets' AND auth.role() = 'authenticated');

-- 5. Allow authenticated users to update their own files
DROP POLICY IF EXISTS "Allow authenticated update" ON storage.objects;
CREATE POLICY "Allow authenticated update" 
ON storage.objects FOR UPDATE 
WITH CHECK (bucket_id = 'content-assets' AND auth.role() = 'authenticated');

-- 6. Check for orphaned content_assets records with invalid URLs
UPDATE content_assets 
SET file_url = REPLACE(file_url, '"', '')
WHERE file_url LIKE '%"%';

-- 7. Fix any URLs with double slashes or incorrect formatting
UPDATE content_assets 
SET file_url = REGEXP_REPLACE(
  file_url, 
  'https://nurdldgqxseunotmygzn\.supabase\.co/storage/v1/object/public/content-assets/content-assets/', 
  'https://nurdldgqxseunotmygzn.supabase.co/storage/v1/object/public/content-assets/', 
  'g'
);

-- 8. Create an index for faster URL lookups
CREATE INDEX IF NOT EXISTS content_assets_file_url_idx ON content_assets(file_url);

-- 9. Show current content_assets with potentially problematic URLs
SELECT 
  id,
  workflow_id,
  execution_id,
  asset_type,
  file_url,
  created_at
FROM content_assets 
WHERE file_url LIKE '%error%' 
   OR file_url LIKE '%"%' 
   OR file_url LIKE '%//%'
ORDER BY created_at DESC 
LIMIT 20; 