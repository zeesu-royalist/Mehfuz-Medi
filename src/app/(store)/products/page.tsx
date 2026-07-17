import { db } from "@/lib/db";
import { ProductCard, type ProductCardData } from "@/components/product/product-card";
import { Input } from "@/components/ui/input";
import { SortDropdown } from "@/components/product/sort-dropdown";
import Link from "next/link";
import { Search } from "lucide-react";

interface ProductsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
  }>;
}

export const revalidate = 0; // Live catalog browse

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const categorySlug = params.category || "";
  const sort = params.sort || "newest";

  // 1. Fetch categories for filter pills
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

  // 2. Build filters
  const whereClause: any = {
    status: "PUBLISHED",
  };

  if (query) {
    whereClause.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { sku: { contains: query, mode: "insensitive" } },
    ];
  }

  if (categorySlug) {
    whereClause.category = { slug: categorySlug };
  }

  // 3. Build sorting
  let orderByClause: any = { createdAt: "desc" };
  if (sort === "price-asc") orderByClause = { price: "asc" };
  if (sort === "price-desc") orderByClause = { price: "desc" };
  if (sort === "featured") orderByClause = { isFeatured: "desc" };

  // 4. Fetch matching products
  const dbProducts = await db.product.findMany({
    where: whereClause,
    orderBy: orderByClause,
    include: {
      category: {
        select: { name: true, slug: true },
      },
      images: {
        orderBy: { position: "asc" },
      },
    },
  });

  const products: ProductCardData[] = dbProducts.map((prod) => ({
    id: prod.id,
    name: prod.name,
    slug: prod.slug,
    price: Number(prod.price),
    discountPrice: prod.discountPrice ? Number(prod.discountPrice) : null,
    category: prod.category,
    images: prod.images,
    tag: prod.tag,
  }));

  return (
    <div className="container py-8 space-y-6">
      {/* Search and Filters Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-ink uppercase tracking-wide">
            {categorySlug
              ? categories.find((c) => c.slug === categorySlug)?.name || "Category"
              : query
              ? `Search Results for "${query}"`
              : "Shop the Collection"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Showing {products.length} products
          </p>
        </div>

        {/* Search Input & Sort Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <form
            action="/products"
            className="relative flex items-center w-full sm:w-60"
          >
            {categorySlug && (
              <input type="hidden" name="category" value={categorySlug} />
            )}
            {sort && <input type="hidden" name="sort" value={sort} />}
            <Input
              name="q"
              defaultValue={query}
              placeholder="Search items..."
              className="h-10 pl-9 text-xs"
            />
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          </form>

          <form action="/products" className="w-full sm:w-auto">
            {query && <input type="hidden" name="q" value={query} />}
            {categorySlug && (
              <input type="hidden" name="category" value={categorySlug} />
            )}
            <SortDropdown currentSort={sort} />
          </form>
        </div>
      </div>

      {/* Category Pills (Horizontal Scroll) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Link
          href={`/products${query ? `?q=${query}` : ""}`}
          className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all border ${
            !categorySlug
              ? "bg-brand-ink text-white border-brand-ink"
              : "bg-white text-brand-ink border-border hover:bg-slate-50"
          }`}
        >
          All Items
        </Link>
        {categories.map((cat) => {
          const isActive = categorySlug === cat.slug;
          const urlParams = new URLSearchParams();
          if (query) urlParams.set("q", query);
          urlParams.set("category", cat.slug);
          if (sort) urlParams.set("sort", sort);

          return (
            <Link
              key={cat.id}
              href={`/products?${urlParams.toString()}`}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all border ${
                isActive
                  ? "bg-brand-ink text-white border-brand-ink"
                  : "bg-white text-brand-ink border-border hover:bg-slate-50"
              }`}
            >
              {cat.name}
            </Link>
          );
        })}
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-md bg-white">
          <p className="text-sm font-semibold text-brand-ink uppercase tracking-wider">
            No Products Found
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your search query or filter settings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {products.map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={idx < 4}
            />
          ))}
        </div>
      )}
    </div>
  );
}
