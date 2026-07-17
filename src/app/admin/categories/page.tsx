import { db } from "@/lib/db";
import { CategoryWorkspace } from "@/components/admin/category-workspace";

export const revalidate = 0; // Disable static cache for live admin workspace

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: {
      parent: {
        select: { name: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-brand-ink">
          Manage Categories
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Create, edit, or delete catalog categories and subcategories.
        </p>
      </div>

      <CategoryWorkspace categories={categories} />
    </div>
  );
}
