import { db } from "@/lib/db";
import { ProductDetailView } from "@/components/product/product-detail-view";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const revalidate = 0; // Live check

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await db.product.findUnique({
    where: { slug },
    include: {
      category: {
        select: { name: true, slug: true },
      },
      images: {
        orderBy: { position: "asc" },
      },
      variants: {
        orderBy: { size: "asc" },
      },
    },
  });

  // Guard rails - return 404 if product not found or is in Draft status
  if (!product || product.status === "DRAFT") {
    notFound();
  }

  // 1. Fetch related products in the same category
  let dbRelated = await db.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      status: "PUBLISHED",
    },
    take: 4,
    include: {
      category: {
        select: { name: true, slug: true },
      },
      images: {
        orderBy: { position: "asc" },
        take: 1,
      },
    },
  });

  // 2. If fewer than 4, fill the rest with other published products
  if (dbRelated.length < 4) {
    const skipIds = [product.id, ...dbRelated.map((p) => p.id)];
    const fallbackProducts = await db.product.findMany({
      where: {
        id: { notIn: skipIds },
        status: "PUBLISHED",
      },
      take: 4 - dbRelated.length,
      include: {
        category: {
          select: { name: true, slug: true },
        },
        images: {
          orderBy: { position: "asc" },
          take: 1,
        },
      },
    });
    dbRelated = [...dbRelated, ...fallbackProducts];
  }

  const formattedRelatedProducts = dbRelated.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
    category: p.category,
    images: p.images.map((img) => ({ url: img.url, alt: img.alt })),
    tag: p.tag,
  }));

  const formattedProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: Number(product.price),
    discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
    sku: product.sku,
    stock: product.stock,
    tag: product.tag,
    category: product.category,
    images: product.images,
    variants: product.variants,
  };

  return (
    <div className="container py-8 space-y-6">
      {/* Breadcrumbs Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
        <Link href="/" className="hover:text-brand-ink transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link
          href={`/products?category=${product.category.slug}`}
          className="hover:text-brand-ink transition-colors"
        >
          {product.category.name}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-brand-ink truncate max-w-[200px] sm:max-w-none">
          {product.name}
        </span>
      </nav>

      {/* Main product detail workspace */}
      <ProductDetailView product={formattedProduct} />

      {/* Related Products Section */}
      {formattedRelatedProducts.length > 0 && (
        <div className="pt-12 border-t border-border mt-12 space-y-6">
          <div>
            <h2 className="text-xl font-display tracking-wide text-brand-ink uppercase">
              You May Also Like
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Check out these other styles we think you will love.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {formattedRelatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
