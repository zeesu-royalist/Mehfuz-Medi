"use client";

import { ProductCard, type ProductCardData } from "@/components/product/product-card";
import { Heart } from "lucide-react";
import Link from "next/link";

interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: any;
    discountPrice: any | null;
    tag: string | null;
    images: { url: string; alt?: string | null }[];
    category: { name: string; slug: string };
  };
}

interface WishlistViewProps {
  initialItems: WishlistItem[];
}

export function WishlistView({ initialItems }: WishlistViewProps) {
  if (initialItems.length === 0) {
    return (
      <div className="text-center py-20 bg-white border rounded-md space-y-5 max-w-md mx-auto px-6">
        <div className="mx-auto h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-muted-foreground border">
          <Heart className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-brand-ink uppercase tracking-wider">
            Your Wishlist is Empty
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Tap the heart icon on any product to save it here.
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex w-full items-center justify-center h-11 bg-brand-red text-white text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-brand-red/90"
        >
          Browse products
        </Link>
      </div>
    );
  }

  // Map to the card data format
  const products: ProductCardData[] = initialItems.map((item) => ({
    id: item.product.id,
    name: item.product.name,
    slug: item.product.slug,
    price: Number(item.product.price),
    discountPrice: item.product.discountPrice ? Number(item.product.discountPrice) : null,
    category: item.product.category,
    images: item.product.images,
    tag: item.product.tag,
  }));

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
