"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type ActionResult<T = any> =
  | { success: true; data?: T }
  | { success: false; error: string };

/**
 * Get the current user's DB cart. Creates one if it doesn't exist.
 */
export async function getDbCart(): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Not logged in" };
    }

    let cart = await db.cart.findUnique({
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
                images: { orderBy: { position: "asc" }, take: 1 },
              },
            },
            variant: {
              select: { id: true, size: true, color: true, stock: true },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await db.cart.create({
        data: { userId: session.user.id },
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
                  images: { orderBy: { position: "asc" }, take: 1 },
                },
              },
              variant: {
                select: { id: true, size: true, color: true, stock: true },
              },
            },
          },
        },
      });
    }

    const serializedItems = cart.items.map((item) => ({
      ...item,
      product: {
        ...item.product,
        price: Number(item.product.price),
        discountPrice: item.product.discountPrice
          ? Number(item.product.discountPrice)
          : null,
      },
    }));

    return { success: true, data: serializedItems };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch cart" };
  }
}

/**
 * Add an item to the user's DB cart.
 */
export async function addToDbCart(
  productId: string,
  variantId: string | null,
  quantity: number
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Not logged in" };
    }

    // 1. Ensure user has a cart
    let cart = await db.cart.findUnique({
      where: { userId: session.user.id },
    });

    if (!cart) {
      cart = await db.cart.create({
        data: { userId: session.user.id },
      });
    }

    // 2. Check if item already exists in cart
    const existing = await db.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId,
      },
    });

    if (existing) {
      await db.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      await db.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId,
          quantity,
        },
      });
    }

    revalidatePath("/cart");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to add to cart" };
  }
}

/**
 * Update the quantity of a DB cart item.
 */
export async function updateDbCartQty(
  itemId: string,
  quantity: number
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Not logged in" };
    }

    if (quantity <= 0) {
      await db.cartItem.delete({ where: { id: itemId } });
    } else {
      await db.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });
    }

    revalidatePath("/cart");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update quantity" };
  }
}

/**
 * Remove an item from the user's DB cart.
 */
export async function removeFromDbCart(itemId: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Not logged in" };
    }

    await db.cartItem.delete({ where: { id: itemId } });

    revalidatePath("/cart");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to remove item" };
  }
}

/**
 * Merge local guest cart items into the DB cart on login.
 */
export async function mergeCarts(
  localItems: { productId: string; variantId: string | null; quantity: number }[]
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Not logged in" };
    }

    let cart = await db.cart.findUnique({
      where: { userId: session.user.id },
    });

    if (!cart) {
      cart = await db.cart.create({
        data: { userId: session.user.id },
      });
    }

    // Merge each item sequentially
    for (const item of localItems) {
      const existing = await db.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId: item.productId,
          variantId: item.variantId,
        },
      });

      if (existing) {
        await db.cartItem.update({
          where: { id: existing.id },
          data: { quantity: Math.max(existing.quantity, item.quantity) },
        });
      } else {
        await db.cartItem.create({
          data: {
            cartId: cart.id,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          },
        });
      }
    }

    revalidatePath("/cart");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to merge carts" };
  }
}
