"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, type CategoryInput } from "@/lib/validators/category";
import { createCategory, updateCategory, deleteCategory } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Edit2, Trash2, Plus, RefreshCw } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  parentId: string | null;
  parent?: { name: string } | null;
}

interface CategoryWorkspaceProps {
  categories: Category[];
}

export function CategoryWorkspace({ categories }: CategoryWorkspaceProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      parentId: "",
      image: "",
    },
  });

  const onSubmit = async (data: CategoryInput) => {
    // Standardize empty string parentId to null
    const payload = {
      ...data,
      parentId: data.parentId === "" ? null : data.parentId,
    };

    startTransition(async () => {
      let result;
      if (editingId) {
        result = await updateCategory(editingId, payload);
      } else {
        result = await createCategory(payload);
      }

      if (result.success) {
        toast.success(
          editingId ? "Category updated successfully" : "Category created successfully"
        );
        reset();
        setEditingId(null);
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setValue("name", category.name);
    setValue("parentId", category.parentId || "");
    setValue("image", category.image || "");
  };

  const handleCancel = () => {
    setEditingId(null);
    reset();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    startTransition(async () => {
      const result = await deleteCategory(id);
      if (result.success) {
        toast.success("Category deleted successfully");
        if (editingId === id) handleCancel();
      } else {
        toast.error(result.error);
      }
    });
  };

  // Potential parent categories (exclude the one currently being edited to prevent self-parenting cycles)
  const parentOptions = categories.filter((c) => c.id !== editingId && !c.parentId);

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* ── Left Side: Category List (takes 2 columns) ── */}
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-md border border-border bg-white shadow-sm">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-md font-bold text-brand-ink">Existing Categories</h2>
            <span className="text-xs text-muted-foreground">
              Total: {categories.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-brand-ink">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b">
                <tr>
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-6 py-3.5">Slug</th>
                  <th className="px-6 py-3.5">Parent Category</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {categories.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-sm text-muted-foreground"
                    >
                      No categories found. Create one on the right.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-semibold">{cat.name}</td>
                      <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                        {cat.slug}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {cat.parent ? cat.parent.name : "None (Root)"}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-brand-ink hover:bg-slate-100 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Right Side: Create/Edit Form ── */}
      <div>
        <div className="rounded-md border border-border bg-white p-6 shadow-sm sticky top-24">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-brand-ink">
              {editingId ? "Edit Category" : "Create Category"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {editingId
                ? "Modify category details and click save changes."
                : "Fill in details to add a new category."}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                placeholder="e.g. Shirts, Oversized"
                {...register("name")}
                disabled={isPending || isSubmitting}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="parentId">Parent Category (Optional)</Label>
              <select
                id="parentId"
                {...register("parentId")}
                disabled={isPending || isSubmitting}
                className="flex h-11 w-full rounded-sm border border-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">None (Top level category)</option>
                {parentOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
              {errors.parentId && (
                <p className="text-xs text-destructive">{errors.parentId.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="image">Image URL (Optional)</Label>
              <Input
                id="image"
                placeholder="https://..."
                {...register("image")}
                disabled={isPending || isSubmitting}
              />
              {errors.image && (
                <p className="text-xs text-destructive">{errors.image.message}</p>
              )}
            </div>

            <div className="pt-2 flex gap-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={isPending || isSubmitting}
              >
                {isPending || isSubmitting ? (
                  <span className="flex items-center gap-1.5 justify-center">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Saving...
                  </span>
                ) : editingId ? (
                  "Save Changes"
                ) : (
                  <span className="flex items-center gap-1.5 justify-center">
                    <Plus className="h-4 w-4" />
                    Create
                  </span>
                )}
              </Button>

              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isPending || isSubmitting}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
