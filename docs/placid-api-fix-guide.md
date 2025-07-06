# Placid API Integration Fix Guide

## 🚨 Problem Description

Placid API is failing to fetch images from Supabase storage with errors like:

```
"Error in fetching URL: https://nurdldgqxseunotmygzn.supabase.co/storage/v1/object/public/content-assets/enterprise/1407/generated-image-0-0.png\""
```

## 🔍 Root Causes

1. **Extra quotes in URLs** - URLs contain trailing quotes that break HTTP requests
2. **Storage permissions** - Bucket may not be publicly accessible
3. **Inconsistent URL construction** - Different workflows build URLs differently
4. **Double slashes** - Path construction errors causing malformed URLs

## ✅ Solutions

### 1. Fix Supabase Storage Configuration

Run the SQL script `scripts/fix-supabase-storage-urls.sql`:

```sql
-- Make content-assets bucket public
UPDATE storage.buckets
SET public = true
WHERE name = 'content-assets';

-- Set proper RLS policies
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'content-assets');
```

### 2. Update N8N Workflow URL Generation

Replace the URL generation code in your n8n workflows with:

```javascript
// ✅ CLEAN URL GENERATION
function generateCleanStorageURL(
  executionId,
  filename,
  subfolder = "enterprise"
) {
  const bucketName = "content-assets";
  const baseUrl = "https://nurdldgqxseunotmygzn.supabase.co";

  // Clean filename (remove quotes)
  const cleanFilename = filename.replace(/['"]/g, "").trim();

  // Build clean path
  const filePath = `${subfolder}/${executionId}/${cleanFilename}`;

  // Generate public URL
  return `${baseUrl}/storage/v1/object/public/${bucketName}/${filePath}`;
}
```

### 3. Validate URLs Before Sending to Placid

```javascript
function validatePlacidURL(url) {
  const hasExtraQuotes = url.includes('"');
  const hasDoubleSlashes = url.includes("//storage");
  const hasProperDomain = url.startsWith(
    "https://nurdldgqxseunotmygzn.supabase.co"
  );

  return !hasExtraQuotes && !hasDoubleSlashes && hasProperDomain;
}
```

## 🔧 Workflow-Specific Fixes

### PostBuilder Workflow

- Update "Generate Enterprise URL" node
- Clean filename generation
- Add URL validation

### CarouselBuilder Workflow

- Fix slide-specific filename generation
- Handle multiple image uploads properly
- Validate each slide URL

### StoryBuilder Workflow

- Consistent story image URL format
- Remove timeline/random suffixes causing conflicts

## 🧪 Testing

1. **Single Image Test**: Test PostBuilder with one image first
2. **Multiple Images**: Test CarouselBuilder with 3-5 slides
3. **Validation**: Check that all URLs return 200 status
4. **Placid Integration**: Verify Placid can fetch all URLs

## 📊 Monitoring

Check the `content_assets` table for:

- URLs containing quotes (`%"%`)
- URLs with double slashes (`%//%`)
- Error URLs (`%error%`)

```sql
SELECT file_url, created_at
FROM content_assets
WHERE file_url LIKE '%error%'
   OR file_url LIKE '%"%'
   OR file_url LIKE '%//%'
ORDER BY created_at DESC;
```

## 🎯 Expected Results

After implementing these fixes:

- ✅ All Placid API requests should succeed
- ✅ No more "Error in fetching URL" messages
- ✅ Clean, consistent URL formatting
- ✅ Improved reliability for image generation workflows

## 🚀 Quick Fix Checklist

- [ ] Run storage configuration SQL script
- [ ] Update n8n workflow URL generation functions
- [ ] Add URL validation to critical nodes
- [ ] Test with single image workflow
- [ ] Monitor Placid API response success rate
- [ ] Clean up existing invalid URLs in database
