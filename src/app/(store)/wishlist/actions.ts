"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type ActionResult<T = any> =
  | { success: true; data?: T }
  | { success: false; error: string };

/**
 * Get current user's DB wishlist.
 */
export async function getDbWishlist(): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Not logged in" };
    }

    const wishlist = await db.wishlist.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                discountPrice: true,
                tag: true,
                images: { orderBy: { position: "asc" }, take: 1 },
                category: { select: { name: true, slug: true } },
              },
            },
          },
        },
      },
    });

    return { success: true, data: wishlist?.items || [] };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch wishlist" };
  }
}

/**
 * Toggle a product in the user's wishlist (adds if missing, deletes if present).
 */
export async function toggleDbWishlist(productId: string): Promise<ActionResult<{ isLiked: boolean }>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Please log in to manage your wishlist." };
    }

    // 1. Get or create wishlist
    let wishlist = await db.wishlist.findUnique({
      where: { userId: session.user.id },
    });

    if (!wishlist) {
      wishlist = await db.wishlist.create({
        data: { userId: session.user.id },
      });
    }

    // 2. Check if item exists in wishlist
    const existing = await db.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    if (existing) {
      await db.wishlistItem.delete({
        where: { id: existing.id },
      });
      revalidatePath("/wishlist");
      return { success: true, data: { isLiked: false } };
    } else {
      await db.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId,
        },
      });
      revalidatePath("/wishlist");
      return { success: true, data: { isLiked: true } };
    }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to modify wishlist" };
  }
}

/**
 * Check if a specific product is currently wishlisted.
 */
export async function checkWishlistStatus(productId: string): Promise<boolean> {
  try {
    const session = await auth();
    if (!session?.user) return false;

    const wishlist = await db.wishlist.findUnique({
      where: { userId: session.user.id },
    });

    if (!wishlist) return false;

    const item = await db.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    return !!item;
  } catch {
    return false;
  }
}
