import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { Plus, Edit2, ShoppingBag } from "lucide-react";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
  {
    variants: {
      status: {
        DRAFT: "bg-slate-100 text-slate-800",
        PUBLISHED: "bg-emerald-100 text-emerald-800",
        ARCHIVED: "bg-rose-100 text-rose-800",
      },
    },
    defaultVariants: {
      status: "DRAFT",
    },
  }
);

export const revalidate = 0; // Live database sync

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: {
        select: { name: true },
      },
      images: {
        orderBy: { position: "asc" },
        take: 1,
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-ink">
            Products Dashboard
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Manage your catalogue, stock levels, variants, and listing status.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-1.5 rounded-sm bg-brand-red px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-red/90 transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          Add Product
        </Link>
      </div>

      <div className="rounded-md border border-border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-brand-ink">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b">
              <tr>
                <th className="px-6 py-3.5 w-16">Item</th>
                <th className="px-6 py-3.5">Product Details</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Price</th>
                <th className="px-6 py-3.5">Stock</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm text-muted-foreground"
                  >
                    No products added yet. Click &quot;Add Product&quot; to begin.
                  </td>
                </tr>
              ) : (
                products.map((prod) => {
                  const thumbnail = prod.images[0]?.url;
                  const discountPrice = prod.discountPrice
                    ? Number(prod.discountPrice)
                    : null;
                  const hasDiscount =
                    discountPrice != null && discountPrice < Number(prod.price);

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/50">
                      {/* Thumbnail */}
                      <td className="px-6 py-4">
                        <div className="relative h-12 w-9 rounded-sm bg-muted overflow-hidden border border-border flex items-center justify-center">
                          {thumbnail ? (
                            <img
                              src={thumbnail}
                              alt={prod.name}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </td>

                      {/* Info */}
                      <td className="px-6 py-4">
                        <p className="font-semibold text-brand-ink line-clamp-1">
                          {prod.name}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          SKU: {prod.sku}
                        </p>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 text-muted-foreground">
                        {prod.category.name}
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold">
                            {formatPrice(
                              hasDiscount ? discountPrice! : Number(prod.price)
                            )}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatPrice(Number(prod.price))}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-4 font-semibold text-xs">
                        {prod.stock} items
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={statusBadgeVariants({
                            status: prod.status,
                          })}
                        >
                          {prod.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        <Link
                          href={`/admin/products/${prod.id}/edit`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-brand-ink hover:bg-slate-100 transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>
                        <DeleteProductButton id={prod.id} name={prod.name} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
