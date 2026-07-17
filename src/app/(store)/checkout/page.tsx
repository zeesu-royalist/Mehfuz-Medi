import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/cart/checkout-form";

export const metadata = { title: "Secure Checkout" };

export const revalidate = 0; // Live check

export default async function CheckoutPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/checkout");
  }

  // Fetch addresses and cart concurrently
  const [addresses, cart] = await Promise.all([
    db.address.findMany({
      where: { userId: session.user.id },
      orderBy: { isDefault: "desc" },
    }),
    db.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                discountPrice: true,
                images: { orderBy: { position: "asc" }, take: 1 },
              },
            },
            variant: {
              select: { size: true },
            },
          },
        },
      },
    }),
  ]);

  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  const formattedItems = cart.items.map((item) => {
    const hasDiscount =
      item.product.discountPrice != null &&
      Number(item.product.discountPrice) < Number(item.product.price);
    return {
      productId: item.productId,
      quantity: item.quantity,
      name: item.product.name,
      price: hasDiscount ? Number(item.product.discountPrice!) : Number(item.product.price),
      imageUrl: item.product.images[0]?.url || "",
      size: item.variant?.size || null,
    };
  });

  return (
    <div className="container py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-display tracking-wide text-brand-ink uppercase">
          Secure Checkout
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Complete your order by choosing your delivery address and placing order.
        </p>
      </div>

      <CheckoutForm initialAddresses={addresses} cartItems={formattedItems} />
    </div>
  );
}
