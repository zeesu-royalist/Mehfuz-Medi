import Image from "next/image";
import Link from "next/link";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import { cn, formatPrice } from "@/lib/utils";

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number | null;
  category: { name: string; slug: string };
  images: { url: string; alt?: string | null }[];
  tag?: string | null;
}

interface ProductCardProps {
  product: ProductCardData;
  className?: string;
  priority?: boolean;
}

export function ProductCard({
  product,
  className,
  priority = false,
}: ProductCardProps) {
  const image = product.images[0];
  const hasDiscount =
    product.discountPrice != null && product.discountPrice < product.price;

  return (
    <article
      className={cn("group relative", className)}
      aria-label={product.name}
    >
      <Link href={`/products/${product.slug}`} className="block">
        {/* Product image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          {image ? (
            <Image
              src={image.url}
              alt={image.alt || product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                No Image
              </span>
            </div>
          )}

          {/* Tag overlay (e.g. "OVERSIZED FIT", "LINEN BLEND") */}
          {product.tag && (
            <span className="absolute left-2 top-2 rounded-[2px] bg-brand-ink/80 px-2 py-1 text-[10px] font-bold uppercase leading-tight tracking-wider text-white backdrop-blur-sm">
              {product.tag}
            </span>
          )}

          {/* Discount badge */}
          {hasDiscount && (
            <span className="absolute right-2 bottom-2 rounded-[2px] bg-brand-red px-1.5 py-0.5 text-[10px] font-bold text-white">
              {Math.round(
                ((product.price - product.discountPrice!) / product.price) * 100
              )}
              % OFF
            </span>
          )}
        </div>

        {/* Product info */}
        <div className="mt-2 space-y-0.5 px-0.5">
          <h3 className="text-sm font-semibold leading-snug text-brand-ink line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground">{product.category.name}</p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-brand-ink">
              {formatPrice(
                hasDiscount ? product.discountPrice! : product.price
              )}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Wishlist heart button */}
      <WishlistButton productId={product.id} className="absolute right-2 top-2 z-10" />
    </article>
  );
}
