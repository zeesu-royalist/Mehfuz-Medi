"use client";

import { useCartStore, type CartItem } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CartView() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const { items, isLoading, fetchCart, updateQuantity, removeItem } = useCartStore();
  const [mounted, setMounted] = useState(false);

  // Sync cart items on mount / login status change
  useEffect(() => {
    setMounted(true);
    fetchCart(isLoggedIn);
  }, [isLoggedIn, fetchCart]);

  if (!mounted) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-red border-t-transparent" />
      </div>
    );
  }

  // Calculate pricing breakdown
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxRate = 0.18; // 18% GST standard
  const taxAmount = subtotal * taxRate;
  const freeShippingThreshold = 999;
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 99;
  const grandTotal = subtotal + taxAmount + shippingFee;

  const handleQtyChange = (item: CartItem, delta: number) => {
    const newQty = item.quantity + delta;
    updateQuantity(item.productId, item.variantId, newQty, isLoggedIn, item.id);
  };

  const handleRemove = (item: CartItem) => {
    removeItem(item.productId, item.variantId, isLoggedIn, item.id);
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-20 bg-white border rounded-md space-y-5 max-w-md mx-auto px-6">
        <div className="mx-auto h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-muted-foreground border">
          <ShoppingBag className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-brand-ink uppercase tracking-wider">
            Your Cart is Empty
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Looks like you haven&#39;t added anything to your cart yet.
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex w-full items-center justify-center h-11 bg-brand-red text-white text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-brand-red/90"
        >
          Explore catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3 items-start">
      {/* ── Left Column: Items List (2 cols) ── */}
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-md border border-border bg-white p-4 sm:p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-brand-ink border-b pb-2">
            Shopping Cart ({items.length} items)
          </h2>

          <div className="divide-y divide-border">
            {items.map((item, idx) => (
              <div
                key={item.id || `${item.productId}-${item.variantId}`}
                className="flex gap-4 py-4 first:pt-0 last:pb-0"
              >
                {/* Thumbnail */}
                <Link
                  href={`/products/${item.slug}`}
                  className="relative h-24 w-20 overflow-hidden rounded-sm bg-muted border shrink-0"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="object-cover w-full h-full"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <Link
                        href={`/products/${item.slug}`}
                        className="font-semibold text-sm hover:text-brand-red transition-colors line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      <span className="font-bold text-sm text-brand-ink">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1 font-semibold">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && <span>Color: {item.color}</span>}
                    </div>
                  </div>

                  {/* Quantity & Delete Controls */}
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center border rounded">
                      <button
                        onClick={() => handleQtyChange(item, -1)}
                        className="p-1.5 hover:bg-slate-100 disabled:opacity-30"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-3.5 text-xs font-bold text-brand-ink select-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQtyChange(item, 1)}
                        className="p-1.5 hover:bg-slate-100"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(item)}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-md transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Column: Order Summary ── */}
      <div className="rounded-md border border-border bg-white p-6 shadow-sm space-y-5">
        <h3 className="text-md font-bold text-brand-ink border-b pb-2 uppercase tracking-wider">
          Order Summary
        </h3>

        <div className="space-y-3 text-xs font-semibold text-brand-ink">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Bag Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">GST Standard (18%)</span>
            <span>{formatPrice(taxAmount)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping Fee</span>
            <span>
              {shippingFee === 0 ? (
                <span className="text-emerald-600 font-bold uppercase">Free</span>
              ) : (
                formatPrice(shippingFee)
              )}
            </span>
          </div>

          {shippingFee > 0 && (
            <p className="text-[10px] text-amber-700 bg-amber-50 rounded p-2 mt-2 leading-relaxed">
              Add **{formatPrice(freeShippingThreshold - subtotal)}** more to unlock free shipping!
            </p>
          )}

          <div className="border-t pt-3 flex justify-between text-sm font-bold border-dashed">
            <span>Grand Total</span>
            <span className="text-brand-red">{formatPrice(grandTotal)}</span>
          </div>
        </div>

        <div className="pt-2">
          <Link href="/checkout" className="w-full">
            <Button className="w-full h-11 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5">
              Proceed to checkout
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2 justify-center text-[10px] text-muted-foreground font-semibold uppercase tracking-wider border-t pt-4">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          100% Safe and Secure Checkout
        </div>
      </div>
    </div>
  );
}
