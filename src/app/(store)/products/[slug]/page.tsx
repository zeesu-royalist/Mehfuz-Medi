import { db } from "@/lib/db";
import { ProductDetailView } from "@/components/product/product-detail-view";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

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

  const formattedProduct = {
    id: product.id,
    name: product.name,
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
    </div>
  );
}
