"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Heart, Share2, Truck, Info, ChevronDown, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cart-store";

interface Variant {
  id: string;
  size: string;
  color: string | null;
  stock: number;
  sku: string;
}

interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  position: number;
}

interface ProductDetailViewProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    discountPrice: number | null;
    sku: string;
    stock: number;
    tag: string | null;
    category: { name: string; slug: string };
    images: ProductImage[];
    variants: Variant[];
  };
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const { addItem, isLoading } = useCartStore();

  const [activeImage, setActiveImage] = useState(product.images[0]?.url || "");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState("");
  const [pincodeChecked, setPincodeChecked] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>("details");

  const hasDiscount =
    product.discountPrice != null && product.discountPrice < product.price;
  const currentPrice = hasDiscount ? product.discountPrice! : product.price;

  // Filter out sizes and check their stock
  const sizes = product.variants.map((v) => ({
    size: v.size,
    inStock: v.stock > 0,
    id: v.id,
  }));

  const handleAddToCart = async () => {
    if (sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size first!");
      return;
    }

    const selectedVariant = product.variants.find((v) => v.size === selectedSize);
    const variantId = selectedVariant ? selectedVariant.id : null;
    const variantColor = selectedVariant ? selectedVariant.color : null;
    const variantStock = selectedVariant ? selectedVariant.stock : product.stock;

    try {
      await addItem(
        {
          productId: product.id,
          variantId,
          name: product.name,
          slug: product.slug,
          price: product.price,
          discountPrice: product.discountPrice,
          imageUrl: product.images[0]?.url || "",
          size: selectedSize,
          color: variantColor,
          stock: variantStock,
        },
        quantity,
        isLoggedIn
      );
      toast.success(`Added ${quantity} item(s) to your cart.`);
    } catch (err: any) {
      console.error("Failed to add item to cart:", err);
      toast.error("Failed to add item to cart. Please try again.");
    }
  };

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode.trim() || pincode.length < 6) {
      toast.error("Please enter a valid 6-digit pincode.");
      return;
    }
    setPincodeChecked(true);
    toast.success("Delivery is available for this pincode!");
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      {/* ── Left Column: Media Gallery ── */}
      <div className="space-y-4">
        {/* Main large display image */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted rounded-sm border border-border">
          {activeImage ? (
            <img
              src={activeImage}
              alt={product.name}
              className="object-cover w-full h-full transition-all duration-300"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-xs uppercase font-semibold">
              No product images
            </div>
          )}

          {/* Product Tag Badge */}
          {product.tag && (
            <span className="absolute left-4 top-4 rounded-[2px] bg-brand-ink/85 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-sm shadow-sm">
              {product.tag}
            </span>
          )}
        </div>

        {/* Clickable gallery thumbnails list */}
        {product.images.length > 1 && (
          <div className="flex gap-2.5 overflow-x-auto pb-1.5">
            {product.images.map((img) => (
              <button
                key={img.id}
                onClick={() => setActiveImage(img.url)}
                className={`relative aspect-[3/4] w-20 overflow-hidden rounded-sm border bg-muted transition-all shrink-0 ${
                  activeImage === img.url
                    ? "border-brand-red ring-2 ring-brand-red/10"
                    : "border-border hover:border-brand-ink"
                }`}
              >
                <img
                  src={img.url}
                  alt={img.alt || "Thumbnail"}
                  className="object-cover w-full h-full"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Right Column: Configuration & Purchase Details ── */}
      <div className="space-y-6">
        {/* Headings */}
        <div>
          <h1 className="text-2xl font-bold text-brand-ink tracking-tight sm:text-3xl">
            {product.name}
          </h1>
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mt-1.5">
            {product.category.name}
          </p>
        </div>

        {/* Pricing */}
        <div className="border-y border-border py-4 space-y-1">
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-brand-ink">
              {formatPrice(currentPrice)}
            </span>
            {hasDiscount && (
              <span className="text-base text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            )}
            {hasDiscount && (
              <span className="text-xs font-bold text-brand-red uppercase bg-brand-red/5 px-2 py-0.5 rounded">
                Save {Math.round(((product.price - currentPrice) / product.price) * 100)}%
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
            Price incl. of all taxes
          </p>
        </div>

        {/* Size Selection */}
        {sizes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
              <span>Select Size</span>
              <button className="text-brand-red hover:underline decoration-brand-red font-bold">
                Size Chart
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {sizes.map((s) => (
                <button
                  key={s.id}
                  onClick={() => s.inStock && setSelectedSize(s.size)}
                  disabled={!s.inStock}
                  className={`flex h-11 items-center justify-center rounded-sm border text-sm font-semibold uppercase tracking-wider transition-all ${
                    selectedSize === s.size
                      ? "border-brand-ink bg-brand-ink text-white ring-1 ring-brand-ink"
                      : s.inStock
                      ? "border-border bg-white text-brand-ink hover:border-brand-ink"
                      : "border-border bg-slate-50 text-muted-foreground/45 cursor-not-allowed line-through"
                  }`}
                >
                  {s.size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity and Actions */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Qty
              </span>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="flex h-11 w-16 rounded-sm border border-border bg-white px-2 py-2 text-sm focus:ring-1 focus:ring-ring focus:outline-none font-semibold text-center"
              >
                {Array.from({ length: Math.min(10, product.stock || 1) }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {String(i + 1).padStart(2, "0")}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <span className="text-[10px] text-transparent select-none">Buy</span>
              <Button
                onClick={handleAddToCart}
                disabled={isLoading}
                className="w-full h-11 font-bold text-sm tracking-wider uppercase"
              >
                {isLoading ? "Adding..." : "Add To Cart"}
              </Button>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-transparent select-none">Heart</span>
              <WishlistButton
                productId={product.id}
                className="h-11 w-11 rounded-sm border border-border bg-white"
              />
            </div>
          </div>
        </div>

        {/* Pincode & Delivery Checker */}
        <div className="rounded-sm border border-border p-4 bg-slate-50/50 space-y-3">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-brand-ink/80" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-ink">
              Check Delivery Options
            </span>
          </div>

          <form onSubmit={handlePincodeCheck} className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              placeholder="Enter Pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
              className="flex-1 h-10 px-3 rounded-sm border border-border bg-white text-xs outline-none focus:border-brand-ink transition-colors font-medium"
            />
            <button
              type="submit"
              className="h-10 px-5 bg-brand-ink text-white text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-brand-ink/90 transition-colors"
            >
              Check
            </button>
          </form>

          {pincodeChecked && (
            <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <Check className="h-3.5 w-3.5" />
              Standard Delivery in 3-5 business days. Cash on delivery eligible.
            </p>
          )}
        </div>

        {/* Collapsible Product Details Accordion */}
        <div className="border border-border rounded-sm bg-white overflow-hidden divide-y divide-border">
          {/* Details Section */}
          <div className="overflow-hidden">
            <button
              onClick={() =>
                setActiveAccordion(activeAccordion === "details" ? null : "details")
              }
              className="w-full flex items-center justify-between px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-brand-ink bg-slate-50/50 hover:bg-slate-50 transition-colors"
            >
              <span>Product Specifications</span>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                  activeAccordion === "details" ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={`transition-all duration-300 ease-in-out ${
                activeAccordion === "details" ? "max-h-96" : "max-h-0"
              }`}
            >
              <div className="p-4 text-xs leading-relaxed text-muted-foreground space-y-2 border-t font-medium">
                <p className="text-brand-ink font-bold uppercase tracking-wider">Description</p>
                <p className="whitespace-pre-line">{product.description}</p>
                <p className="text-brand-ink font-bold uppercase tracking-wider pt-2">SKU Reference</p>
                <p className="font-mono">{product.sku}</p>
              </div>
            </div>
          </div>

          {/* Delivery & Return Policy Section */}
          <div className="overflow-hidden">
            <button
              onClick={() =>
                setActiveAccordion(activeAccordion === "policy" ? null : "policy")
              }
              className="w-full flex items-center justify-between px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-brand-ink bg-slate-50/50 hover:bg-slate-50 transition-colors"
            >
              <span>Returns & Exchange Policy</span>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                  activeAccordion === "policy" ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={`transition-all duration-300 ease-in-out ${
                activeAccordion === "policy" ? "max-h-96" : "max-h-0"
              }`}
            >
              <div className="p-4 text-xs leading-relaxed text-muted-foreground space-y-2 border-t font-medium">
                <p>
                  Easy returns or exchanges within **30 days** of delivery. No questions asked.
                </p>
                <p>
                  Please ensure items are unused, unwashed, and have original tags intact.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
