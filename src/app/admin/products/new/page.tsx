import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/product-form";

export const revalidate = 0; // Fresh category drop-downs

export default async function AdminNewProductPage() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-brand-ink">
          New Product
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Publish a new item, images, and sizing variants to the catalogue.
        </p>
      </div>

      <ProductForm categories={categories} initialData={null} />
    </div>
  );
}
