"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { categorySchema, type CategoryInput } from "@/lib/validators/category";
import { productSchema, type ProductInput } from "@/lib/validators/product";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

type ActionResult<T = any> =
  | { success: true; data?: T }
  | { success: false; error: string };

/**
 * Helper to ensure the request is from a logged-in Admin
 */
async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized. Admin access required.");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function createCategory(
  input: CategoryInput
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = categorySchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const { name, parentId, image } = parsed.data;
    const slug = slugify(name);

    // Check if slug already exists
    const existing = await db.category.findUnique({ where: { slug } });
    if (existing) {
      return { success: false, error: "A category with this name or slug already exists." };
    }

    const category = await db.category.create({
      data: {
        name,
        slug,
        parentId,
        image,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true, data: category };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create category" };
  }
}

export async function updateCategory(
  id: string,
  input: CategoryInput
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = categorySchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const { name, parentId, image } = parsed.data;
    const slug = slugify(name);

    // Check if another category has the same slug
    const existing = await db.category.findFirst({
      where: { slug, id: { not: id } },
    });
    if (existing) {
      return { success: false, error: "Another category with this name already exists." };
    }

    const category = await db.category.update({
      where: { id },
      data: {
        name,
        slug,
        parentId,
        image,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true, data: category };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update category" };
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    
    // Check if category has subcategories
    const hasChildren = await db.category.findFirst({ where: { parentId: id } });
    if (hasChildren) {
      return {
        success: false,
        error: "Cannot delete category that contains subcategories. Delete subcategories first.",
      };
    }

    // Check if category has products
    const hasProducts = await db.product.findFirst({ where: { categoryId: id } });
    if (hasProducts) {
      return {
        success: false,
        error: "Cannot delete category linked to products. Reassign or delete products first.",
      };
    }

    await db.category.delete({ where: { id } });

    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete category" };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function createProduct(input: ProductInput): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = productSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const data = parsed.data;
    const slug = slugify(data.name);

    const existing = await db.product.findUnique({ where: { slug } });
    if (existing) {
      return { success: false, error: "A product with this name already exists." };
    }

    const existingSku = await db.product.findUnique({ where: { sku: data.sku } });
    if (existingSku) {
      return { success: false, error: "Product SKU must be unique." };
    }

    const product = await db.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        price: data.price,
        discountPrice: data.discountPrice,
        sku: data.sku,
        stock: data.stock,
        status: data.status,
        isFeatured: data.isFeatured,
        categoryId: data.categoryId,
        tag: data.tag,
        images: {
          createMany: {
            data: data.images.map((img) => ({
              url: img.url,
              publicId: img.publicId,
              position: img.position,
              alt: img.alt,
            })),
          },
        },
        variants: {
          createMany: {
            data: data.variants.map((v) => ({
              size: v.size,
              color: v.color,
              stock: v.stock,
              sku: v.sku,
            })),
          },
        },
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/");
    revalidatePath("/products");
    return { success: true, data: product };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create product" };
  }
}

export async function updateProduct(
  id: string,
  input: ProductInput
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = productSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const data = parsed.data;
    const slug = slugify(data.name);

    // Verify slug unique
    const existing = await db.product.findFirst({
      where: { slug, id: { not: id } },
    });
    if (existing) {
      return { success: false, error: "Another product with this name already exists." };
    }

    // Update using transaction to replace images and variants
    const updatedProduct = await db.$transaction(async (tx) => {
      // 1. Delete all old images and variants
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.productVariant.deleteMany({ where: { productId: id } });

      // 2. Update product and recreate images & variants
      return tx.product.update({
        where: { id },
        data: {
          name: data.name,
          slug,
          description: data.description,
          price: data.price,
          discountPrice: data.discountPrice,
          sku: data.sku,
          stock: data.stock,
          status: data.status,
          isFeatured: data.isFeatured,
          categoryId: data.categoryId,
          tag: data.tag,
          images: {
            createMany: {
              data: data.images.map((img) => ({
                url: img.url,
                publicId: img.publicId,
                position: img.position,
                alt: img.alt,
              })),
            },
          },
          variants: {
            createMany: {
              data: data.variants.map((v) => ({
                size: v.size,
                color: v.color,
                stock: v.stock,
                sku: v.sku,
              })),
            },
          },
        },
      });
    });

    revalidatePath("/admin/products");
    revalidatePath(`/products/${slug}`);
    revalidatePath("/");
    revalidatePath("/products");
    return { success: true, data: updatedProduct };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update product" };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    
    // First, let's find the images to delete from Cloudinary
    const product = await db.product.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!product) {
      return { success: false, error: "Product not found." };
    }

    // Delete from DB (images and variants will cascade delete if relations are set to cascade)
    // Wait, let's confirm schema cascade deletion for images and variants
    await db.product.delete({ where: { id } });

    // Try deleting images from Cloudinary in the background
    // (Import from src/lib/cloudinary inside server code only)
    const { deleteImage } = await import("@/lib/cloudinary");
    for (const image of product.images) {
      try {
        await deleteImage(image.publicId);
      } catch (err) {
        console.error(`Failed to delete Cloudinary image: ${image.publicId}`, err);
      }
    }

    revalidatePath("/admin/products");
    revalidatePath("/");
    revalidatePath("/products");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete product" };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// USER & SETTING ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function updateUserRole(
  userId: string,
  role: "ADMIN" | "CLIENT"
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const session = await auth();
    if (session?.user.id === userId) {
      return { success: false, error: "You cannot change your own role." };
    }

    await db.user.update({
      where: { id: userId },
      data: { role },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update user role" };
  }
}

export async function toggleBlockUser(userId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const session = await auth();
    if (session?.user.id === userId) {
      return { success: false, error: "You cannot block yourself." };
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, error: "User not found." };

    await db.user.update({
      where: { id: userId },
      data: { isBlocked: !user.isBlocked },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to toggle block status" };
  }
}

export async function deleteUser(userId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const session = await auth();
    if (session?.user.id === userId) {
      return { success: false, error: "You cannot delete your own account." };
    }

    await db.user.delete({ where: { id: userId } });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete user" };
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED"
): Promise<ActionResult> {
  try {
    await requireAdmin();
    await db.order.update({
      where: { id: orderId },
      data: { status },
    });

    revalidatePath("/admin/orders");
    revalidatePath("/account/orders");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update order status" };
  }
}

export async function updateSiteSettings(
  settings: Record<string, string>
): Promise<ActionResult> {
  try {
    await requireAdmin();
    await db.$transaction(
      Object.entries(settings).map(([key, value]) =>
        db.siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
      )
    );

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update settings" };
  }
}

export async function uploadImageAction(
  base64Str: string,
  folder: string
): Promise<ActionResult<{ publicId: string; url: string }>> {
  try {
    await requireAdmin();
    const { uploadImage } = await import("@/lib/cloudinary");
    const result = await uploadImage(base64Str, folder);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to upload image" };
  }
}
