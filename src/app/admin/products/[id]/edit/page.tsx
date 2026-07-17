import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/product-form";
import { notFound } from "next/navigation";

interface AdminEditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const revalidate = 0; // Live lookup

export default async function AdminEditProductPage({
  params,
}: AdminEditProductPageProps) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { position: "asc" } },
        variants: true,
      },
    }),
    db.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!product) {
    notFound();
  }

  const formattedProduct = {
    ...product,
    price: Number(product.price),
    discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-brand-ink">
          Edit Product
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Modify catalogue metadata, stock quantities, and media.
        </p>
      </div>

      <ProductForm categories={categories} initialData={formattedProduct} />
    </div>
  );
}
