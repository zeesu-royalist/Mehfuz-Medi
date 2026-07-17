"use client";

import { useTransition } from "react";
import { deleteProduct } from "@/app/admin/actions";
import { Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface DeleteProductButtonProps {
  id: string;
  name: string;
}

export function DeleteProductButton({ id, name }: DeleteProductButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    startTransition(async () => {
      const res = await deleteProduct(id);
      if (res.success) {
        toast.success("Product deleted successfully");
      } else {
        toast.error(res.error || "Failed to delete product");
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
      title="Delete Product"
    >
      {isPending ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </button>
  );
}
