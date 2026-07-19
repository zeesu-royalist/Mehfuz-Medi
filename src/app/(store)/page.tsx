import Link from "next/link";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { PerksStrip } from "@/components/home/perks-strip";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { ProductCard, type ProductCardData } from "@/components/product/product-card";
import { ImageTextSection } from "@/components/home/ImageTextSection";

/** Static category data for the homepage showcase. */
const CATEGORIES = [
  {
    name: "Oversized T-Shirts",
    slug: "oversized-t-shirts",
    image: "https://i.pinimg.com/736x/f5/96/87/f5968740b29320c2bd2a0d8947b6d013.jpg",
  },
  {
    name: "Shirts",
    slug: "shirts",
    image: "https://lh7-us.googleusercontent.com/9PNHc75h5Am2MD4X9SJDZkxmR1OOXwDndKj9n0e9g-X4toRKA8TxlHt4ycUGUENzeuE81c4kvxE0Xn9SYYg-XjqUH9XsHZ6LCQcxVqJlHR9i2yWsQpxpmwnqsZeI2dEgGgjN54Rl5gRuMkaUrwql-z8",
  },
  {
    name: "Polos",
    slug: "polos",
    image: "https://img.magnific.com/free-photo/young-man-trendy-dressed-comes-down-stairs-outside_613910-18396.jpg?semt=ais_hybrid&w=740&q=80",
  },
  {
    name: "Men Pants",
    slug: "men-pants",
    image: "https://manyavar.scene7.com/is/image/manyavar/CTSD1354-382-Lilac-101_20-01-2021-20-46:650x900?&dpr=on,2",
  },
  {
    name: "Men Jeans",
    slug: "men-jeans",
    image: "https://www.azafashions.com/blog/wp-content/uploads/2025/11/banner_01-2.jpg",
  },
  {
    name: "Men Joggers",
    slug: "men-joggers",
    image: "https://images.stockcake.com/public/d/6/9/d6967845-e8d1-4f1e-a3bb-1f34d2ba0dd3_large/fashion-runway-show-stockcake.jpg",
  },
] as const;

export const revalidate = 0; // Live check

export default async function HomePage() {
  const dbNewProducts = await db.product.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: {
      category: { select: { name: true, slug: true } },
      images: { orderBy: { position: "asc" } },
    },
  });

  const dbFeaturedProducts = await db.product.findMany({
    where: { status: "PUBLISHED", isFeatured: true },
    orderBy: { createdAt: "desc" },
    take: 4,
    include: {
      category: { select: { name: true, slug: true } },
      images: { orderBy: { position: "asc" } },
    },
  });

  const newProducts: ProductCardData[] = dbNewProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
    category: p.category,
    images: p.images.map((img) => ({ url: img.url, alt: img.alt })),
    tag: p.tag,
  }));

  const featuredProducts: ProductCardData[] = dbFeaturedProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
    category: p.category,
    images: p.images.map((img) => ({ url: img.url, alt: img.alt })),
    tag: p.tag,
  }));

  return (
    <>
      {/* ── Hero Carousel ── */}
      <HeroCarousel />

      {/* ── Perks Strip ── */}
      <PerksStrip />

      {/* ── NEW IN Section ── */}
      <section className="container py-10 sm:py-14">
        <div className="mb-8 text-center">
          <h2 className="font-display text-3xl tracking-wide text-brand-ink sm:text-4xl">
            NEW IN
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The latest drops — freshly added to the store
          </p>
        </div>

        {/* Product cards or empty state */}
        {newProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {newProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed py-12 text-center bg-white">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-ink">
              No Products Available
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              New arrivals will appear here once added to the database catalogue.
            </p>
          </div>
        )}

        {newProducts.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-sm border-2 border-brand-ink px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-brand-ink transition-colors hover:bg-brand-ink hover:text-white"
            >
              View All Products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </section>

      {/* ── Shop by Category ── */}
      <section className="bg-brand-cream py-10 sm:py-14">
        <div className="container">
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl tracking-wide text-brand-ink sm:text-4xl">
              SHOP BY CATEGORY
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Browse our curated collections
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="group relative flex aspect-[4/3] items-end overflow-hidden rounded-sm p-4 sm:p-6 bg-muted"
              >
                {/* Background Image */}
                {cat.image && (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                )}

                {/* Dark gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-90" />

                <div className="relative z-10">
                  <h3 className="font-display text-lg tracking-wider text-white sm:text-xl lg:text-2xl">
                    {cat.name.toUpperCase()}
                  </h3>
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold tracking-wider text-white/70 transition-colors group-hover:text-white">
                    EXPLORE
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trending Section (Auto-scroll Carousel) ── */}
      <section className="container py-10 sm:py-14">
        <div className="mb-8 text-center">
          <h2 className="font-display text-3xl tracking-wide text-brand-ink sm:text-4xl">
            TRENDING NOW
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            What everyone&#39;s wearing this season
          </p>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="group relative overflow-hidden">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background to-transparent sm:w-16" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background to-transparent sm:w-16" />

            <div className="flex w-max gap-3 sm:gap-4 [animation:trending-scroll_28s_linear_infinite]">
              {[...featuredProducts, ...featuredProducts, ...featuredProducts].map((product, i) => (
                <div
                  key={`${product.id}-${i}`}
                  className="w-32 shrink-0 sm:w-40 lg:w-48"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-dashed py-12 text-center bg-white">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-ink">
              No Featured Products
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Mark products as featured in the admin panel to display them here.
            </p>
          </div>
        )}

        <style>{`
    @keyframes trending-scroll {
      from { transform: translateX(0); }
      to { transform: translateX(-33.3333%); }
    }
  `}</style>
      </section>

      <ImageTextSection />

      {/* ── CTA Banner ── */}
      <section className="relative overflow-hidden bg-brand-ink py-16 sm:py-20">
        {/* Moving background images */}
        <div className="absolute inset-0 z-0">
          <div className="flex h-full w-max [animation:cta-bg-scroll_25s_linear_infinite]">
            {[
              "https://images.unsplash.com/photo-1620336655055-088d06e36bf0?w=800&q=80",
              "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&q=80",
              "https://karnavatiuniversity.edu.in/wp-content/uploads/2025/09/medium-shot-woman-repairing-clothes-scaled.webp",
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzhypj2giTbt_u1-wgjyAIzWHnIEdyDPYGQtDnxQc3OlpiNoMAr0gqnd4&s=10",
              "https://st5.depositphotos.com/62628780/62394/i/450/depositphotos_623945220-stock-photo-laptop-fashion-woman-designer-working.jpg",
            ]
              .flatMap((url) => [url, url, url])
              .map((url, i) => (
                <div
                  key={i}
                  className="h-full w-[220px] shrink-0 sm:w-[280px] lg:w-[340px]"
                >
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                    aria-hidden="true"
                  />
                </div>
              ))}
          </div>
        </div>

        <div className="absolute inset-0 z-10 bg-brand-ink/80" />

        <div className="container relative z-20 text-center">
          <h2 className="font-display text-4xl tracking-wider text-white sm:text-5xl lg:text-6xl">
            OFFICIALLY LICENSED
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/60">
            From Marvel to DC, Disney to anime — we bring your favourite
            fandoms to life with premium quality merchandise.
          </p>
          <Link
            href="/products"
            className="mt-8 inline-flex items-center gap-2 bg-brand-red px-8 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-red/90"
          >
            Shop All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <style>{`
    @keyframes cta-bg-scroll {
      from { transform: translateX(0); }
      to { transform: translateX(-33.3333%); }
    }
  `}</style>
      </section>

      {/* ── Hot Products Section ── */}
      <section className="container py-10 sm:py-14">
        <div className="mb-8 text-center">
          <h2 className="font-display text-3xl tracking-wide text-brand-ink sm:text-4xl">
            OUR HOT PRODUCTS
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            What everyone&#39;s wearing this season
          </p>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed py-12 text-center bg-white">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-ink">
              No Hot Products Found
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add products in your admin dashboard to feature them here.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
