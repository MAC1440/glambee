# Supabase Storage Bucket Setup for Deal Images

## Quick Setup (2 minutes)

### Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** (left sidebar)
3. Click **New bucket**
4. Enter bucket name: `salons-media`
5. **Important:** Make it **Public** (toggle ON)
   - This allows images to be accessed via public URLs
6. Click **Create bucket**

### Step 2: Set Bucket Policies (Optional but Recommended)

For security, you can set policies to control who can upload:

1. Go to **Storage** → `salons-media` bucket
2. Click **Policies** tab
3. Click **New Policy**

**Upload Policy:**
```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'salons-media');
```

**Read Policy (if bucket is public, this may not be needed):**
```sql
-- Allow public read access
CREATE POLICY "Public can read images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'salons-media');
```

### Step 3: Test

1. Go to your app
2. Try creating a deal with an image
3. The image should upload and display

## That's It!

The bucket is now ready. Images will be automatically uploaded when you create or edit deals.

## Troubleshooting

### Error: "Bucket not found"
- Make sure the bucket name is exactly `salons-media`
- Check that the bucket is created in the correct Supabase project

### Error: "new row violates row-level security policy"
- This is a different issue (deals table RLS, not storage)
- See `docs/RLS_POLICY_DEALS_FIX.md` for the fix

### Images not displaying
- Check that the bucket is set to **Public**
- Verify the image URL is correct in the database

