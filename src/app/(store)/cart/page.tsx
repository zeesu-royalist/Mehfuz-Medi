import { CartView } from "@/components/cart/cart-view";

export const metadata = { title: "Shopping Cart" };

export default function CartPage() {
  return (
    <div className="container py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-display tracking-wide text-brand-ink uppercase">
          Shopping Cart
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Review your items, quantities, and summary before completing checkout.
        </p>
      </div>

      <CartView />
    </div>
  );
}
