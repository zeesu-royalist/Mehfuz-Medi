"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type ActionResult = { success: true } | { success: false; error: string };

/**
 * Cancel an order if it's still pending.
 */
export async function cancelUserOrder(orderId: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Not logged in" };

    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return { success: false, error: "Order not found." };
    }

    if (order.userId !== session.user.id) {
      return { success: false, error: "Unauthorized." };
    }

    if (order.status !== "PENDING") {
      return {
        success: false,
        error: "Only pending orders can be cancelled. Please contact support.",
      };
    }

    // Run cancel transaction to refund stock limits
    await db.$transaction(async (tx) => {
      // Update status
      await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });

      // Retrieve items to restore stock
      const items = await tx.orderItem.findMany({
        where: { orderId },
        include: {
          product: {
            include: { variants: true },
          },
        },
      });

      // Increment stock levels back
      for (const item of items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
    });

    revalidatePath("/account/orders");
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to cancel order" };
  }
}
