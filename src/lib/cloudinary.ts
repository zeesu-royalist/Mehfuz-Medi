import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary only if the credentials are present
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
} else {
  console.warn(
    "Cloudinary credentials are not set in environment variables. Falling back to Mock mode."
  );
}

/**
 * Uploads an image to Cloudinary (or returns a mock URL if credentials are not configured)
 * @param fileStr - Base64 encoded image string or data URL
 * @param folder - Cloudinary folder name (e.g., 'products', 'categories')
 */
export async function uploadImage(
  fileStr: string,
  folder: string
): Promise<{ publicId: string; url: string }> {
  if (!isConfigured) {
    // Generate a random mock public ID and use a placeholder image URL
    const mockId = `mock_${Math.random().toString(36).substring(7)}`;
    return {
      publicId: mockId,
      url: `https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop`,
    };
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
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image to Cloudinary");
  }
}

/**
 * Deletes an image from Cloudinary (or returns success in mock mode)
 * @param publicId - Cloudinary public ID of the image
 */
export async function deleteImage(publicId: string): Promise<{ success: boolean }> {
  if (!isConfigured || publicId.startsWith("mock_")) {
    return { success: true };
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return { success: result.result === "ok" };
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error("Failed to delete image from Cloudinary");
  }
}
