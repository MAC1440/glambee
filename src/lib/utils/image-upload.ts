import { supabase } from "@/lib/supabase/client";

/**
 * Normalize storage URL to use production domain
 * Converts local URLs (http://127.0.0.1:54321) to production URLs (https://supabase.invo.zone)
 * Preserves existing production URLs
 * 
 * NOTE: Currently commented out as environment variables handle URL generation correctly.
 * Uncomment if you need to normalize URLs (e.g., for migration or cross-environment compatibility).
 * 
 * @param url - The storage URL from Supabase
 * @returns Normalized URL using production domain
 */
// function normalizeStorageUrl(url: string): string {
//   if (!url) return url;

//   // If URL already starts with https://, it's likely a production URL - preserve it
//   if (url.startsWith("https://")) {
//     return url;
//   }

//   // Get the production Supabase URL from environment variable
//   const productionUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
//   if (!productionUrl) {
//     // If no production URL is set, return as-is
//     return url;
//   }

//   try {
//     // Extract the path from the URL (everything after the domain)
//     // URL format: http://127.0.0.1:54321/storage/v1/object/public/bucket/images/file.jpg
//     // or: https://supabase.invo.zone/storage/v1/object/public/bucket/images/file.jpg
//     const urlObj = new URL(url);
//     const path = urlObj.pathname; // e.g., /storage/v1/object/public/salons-media/images/file.jpg

//     // Construct new URL using production domain
//     const normalizedUrl = `${productionUrl}${path}`;

//     return normalizedUrl;
//   } catch (error) {
//     // If URL parsing fails, return as-is
//     console.warn("Failed to normalize storage URL:", url, error);
//     return url;
//   }
// }

/**
 * Upload an image file to Supabase Storage
 * @param file - The image file to upload
 * @param bucket - The storage bucket name (default: 'salons-media')
 * @param folder - Optional folder path within the bucket (default: 'images')
 * @returns The public URL of the uploaded image
 */
export async function uploadImageToStorage(
  file: File,
  bucket: string = "salons-media",
  folder: string = "images"
): Promise<string> {
  try {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      throw new Error("File must be an image");
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error("Image size must be less than 5MB");
    }

    // Generate unique filename (matching AdminJS format: timestamp_random.ext)
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

    if (error) {
      // If bucket doesn't exist, try to create it (this might fail if user doesn't have permissions)
      if (error.message.includes("Bucket not found")) {
        throw new Error(
          `Storage bucket "${bucket}" not found. Please create it in Supabase dashboard.`
        );
      }
      throw error;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath);

    // NOTE: URL normalization is commented out as environment variables handle this correctly.
    // Supabase client uses NEXT_PUBLIC_SUPABASE_URL, so getPublicUrl() automatically uses the correct domain.
    // Uncomment the line below if you need URL normalization (e.g., for migration purposes).
    // const normalizedUrl = normalizeStorageUrl(publicUrl);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

/**
 * Delete an image from Supabase Storage
 * @param url - The public URL of the image to delete
 * @param bucket - The storage bucket name (default: 'salons-media')
 */
export async function deleteImageFromStorage(
  url: string,
  bucket: string = "salons-media"
): Promise<void> {
  try {
    // Extract file path from URL
    // URL format: https://project.supabase.co/storage/v1/object/public/bucket/images/filename
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");
    const bucketIndex = pathParts.findIndex((part) => part === bucket);
    
    if (bucketIndex === -1) {
      console.warn("Could not extract file path from URL:", url);
      return;
    }

    // Get path after bucket (e.g., "images/filename.ext")
    const filePath = pathParts.slice(bucketIndex + 1).join("/");

    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      console.error("Error deleting image:", error);
      // Don't throw - deletion failure shouldn't block the main operation
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    // Don't throw - deletion failure shouldn't block the main operation
  }
}

