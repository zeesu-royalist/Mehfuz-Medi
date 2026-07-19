import { v2 as cloudinary } from "cloudinary";

const isConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Uploads an image to Cloudinary
 * @param fileStr - Base64 encoded image string or data URL
 * @param folder - Cloudinary folder name (e.g., 'products', 'categories')
 */
export async function uploadImage(
  fileStr: string,
  folder: string
): Promise<{ publicId: string; url: string }> {
  if (!isConfigured) {
    throw new Error(
      "Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are missing from environment variables."
    );
  }

  try {
    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      folder: `souled-clone/${folder}`,
      resource_type: "image",
    });

    return {
      publicId: uploadResponse.public_id,
      url: uploadResponse.secure_url,
    };
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    throw new Error(error.message || "Failed to upload image to Cloudinary");
  }
}

/**
 * Deletes an image from Cloudinary
 * @param publicId - Cloudinary public ID of the image
 */
export async function deleteImage(publicId: string): Promise<{ success: boolean }> {
  if (!isConfigured) {
    return { success: true };
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return { success: result.result === "ok" };
  } catch (error: any) {
    console.error("Cloudinary delete error:", error);
    throw new Error(error.message || "Failed to delete image from Cloudinary");
  }
}
