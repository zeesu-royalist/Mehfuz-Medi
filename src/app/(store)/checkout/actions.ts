"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type ActionResult<T = any> =
  | { success: true; data?: T }
  | { success: false; error: string };

export interface AddressInput {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

/**
 * Get user's addresses.
 */
export async function getAddresses(): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Not logged in" };

    const addresses = await db.address.findMany({
      where: { userId: session.user.id },
      orderBy: { isDefault: "desc" },
    });

    return { success: true, data: addresses };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch addresses" };
  }
}

/**
 * Create a new address.
 */
export async function createAddress(input: AddressInput): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Not logged in" };

    // If setting as default, unset previous default
    if (input.isDefault) {
      await db.address.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await db.address.create({
      data: {
        userId: session.user.id,
        fullName: input.fullName,
        phone: input.phone,
        line1: input.line1,
        line2: input.line2,
        city: input.city,
        state: input.state,
        pincode: input.pincode,
        isDefault: input.isDefault || false,
      },
    });

    revalidatePath("/checkout");
    revalidatePath("/account/addresses");
    return { success: true, data: address };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create address" };
  }
}

/**
 * Place a new order using a safe transaction.
 */
export async function placeOrder(addressId: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Not logged in" };

    // 1. Fetch user's cart
    const cart = await db.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return { success: false, error: "Your cart is empty." };
    }

    // 2. Validate stock levels for all items before placing the order
    for (const item of cart.items) {
      if (item.variant) {
        if (item.variant.stock < item.quantity) {
          return {
            success: false,
            error: `Insufficient stock for ${item.product.name} (Size: ${item.variant.size}). Only ${item.variant.stock} left.`,
          };
        }
      } else {
        if (item.product.stock < item.quantity) {
          return {
            success: false,
            error: `Insufficient stock for ${item.product.name}. Only ${item.product.stock} left.`,
          };
        }
      }
    }

    // 3. Calculate order costs
    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );
    const taxRate = 0.18; // 18% GST
    const tax = subtotal * taxRate;
    const shipping = subtotal >= 999 ? 0 : 99;
    const total = subtotal + tax + shipping;

    const orderNumber = `TSS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 4. Run transaction
    const order = await db.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session.user.id,
          subtotal,
          tax,
          shipping,
          total,
          addressId,
          status: "PENDING",
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              nameSnapshot: item.product.name,
              priceSnapshot: item.product.price,
              quantity: item.quantity,
            })),
          },
        },
      });

      // Decrement stock levels
      for (const item of cart.items) {
        if (item.variant) {
          await tx.productVariant.update({
            where: { id: item.variantId! },
            data: { stock: { decrement: item.quantity } },
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      // Empty the cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    revalidatePath("/cart");
    revalidatePath("/account/orders");
    return { success: true, data: order };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to place order" };
  }
}
