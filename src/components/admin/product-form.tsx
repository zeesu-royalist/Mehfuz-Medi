"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductInput } from "@/lib/validators/product";
import { createProduct, updateProduct, uploadImageAction } from "@/app/admin/actions";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Trash2,
  Upload,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  X,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  categories: Category[];
  initialData?: {
    id: string;
    name: string;
    description: string;
    price: number;
    discountPrice?: number | null;
    sku: string;
    stock: number;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    isFeatured: boolean;
    categoryId: string;
    tag?: string | null;
    images: { id?: string; url: string; publicId: string; position: number; alt?: string | null }[];
    variants: { id?: string; size: string; color?: string | null; stock: number; sku: string }[];
  } | null;
}

export function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description,
          price: Number(initialData.price),
          discountPrice: initialData.discountPrice ? Number(initialData.discountPrice) : null,
          sku: initialData.sku,
          stock: initialData.stock,
          status: initialData.status,
          isFeatured: initialData.isFeatured,
          categoryId: initialData.categoryId,
          tag: initialData.tag || "",
          images: initialData.images.map((img) => ({
            url: img.url,
            publicId: img.publicId,
            position: img.position,
            alt: img.alt || "",
          })),
          variants: initialData.variants.map((v) => ({
            size: v.size,
            color: v.color || "",
            stock: v.stock,
            sku: v.sku,
          })),
        }
      : {
          name: "",
          description: "",
          price: 0,
          discountPrice: null,
          sku: "",
          stock: 0,
          status: "DRAFT",
          isFeatured: false,
          categoryId: categories[0]?.id || "",
          tag: "",
          images: [],
          variants: [],
        },
  });

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
    swap: swapImages,
  } = useFieldArray({
    control,
    name: "images",
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
  });

function compressImage(file: File, maxWidth = 1920, maxHeight = 1920, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Failed to process image"));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    let successCount = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        let base64Data: string;
        try {
          base64Data = await compressImage(file);
        } catch {
          base64Data = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        }

        const res = await uploadImageAction(base64Data, "products");
        if (!res.success) {
          toast.error(`Failed to upload ${file.name}: ${res.error}`);
        } else if (res.data) {
          successCount++;
          appendImage({
            url: res.data.url,
            publicId: res.data.publicId,
            position: imageFields.length + i,
            alt: file.name.split(".")[0],
          });
        }
      }
      if (successCount > 0) {
        toast.success(`${successCount} image(s) uploaded successfully.`);
      }
    } catch (err: any) {
      toast.error(err?.message || "An error occurred during upload.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const onSubmit = (data: ProductInput) => {
    startTransition(async () => {
      let res;
      if (initialData) {
        res = await updateProduct(initialData.id, data);
      } else {
        res = await createProduct(data);
      }

      if (res.success) {
        toast.success(
          initialData ? "Product updated successfully" : "Product created successfully"
        );
        router.push("/admin/products");
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-3" noValidate>
      {/* ── Left Column: Form Fields (2 cols) ── */}
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-md border border-border bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-brand-ink border-b pb-2">Product Info</h2>

          <div className="space-y-1.5">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              placeholder="e.g. Spider-Man: Apex Web Oversized T-Shirt"
              {...register("name")}
              disabled={isPending || isSubmitting}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={5}
              placeholder="Provide a detailed description of features, materials, wash-care, fit type, etc."
              {...register("description")}
              disabled={isPending || isSubmitting}
              className="flex w-full rounded-sm border border-border bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                placeholder="1299"
                {...register("price", { valueAsNumber: true })}
                disabled={isPending || isSubmitting}
              />
              {errors.price && (
                <p className="text-xs text-destructive">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="discountPrice">Discount Price (₹, Optional)</Label>
              <Input
                id="discountPrice"
                type="number"
                placeholder="999"
                {...register("discountPrice", {
                  valueAsNumber: true,
                  setValueAs: (v) => (v === "" ? null : Number(v)),
                })}
                disabled={isPending || isSubmitting}
              />
              {errors.discountPrice && (
                <p className="text-xs text-destructive">
                  {errors.discountPrice.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
              <Input
                id="sku"
                placeholder="TSS-SPIDER-APEX-M"
                {...register("sku")}
                disabled={isPending || isSubmitting}
              />
              {errors.sku && (
                <p className="text-xs text-destructive">{errors.sku.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stock">Base Stock (Overall)</Label>
              <Input
                id="stock"
                type="number"
                placeholder="50"
                {...register("stock", { valueAsNumber: true })}
                disabled={isPending || isSubmitting}
              />
              {errors.stock && (
                <p className="text-xs text-destructive">{errors.stock.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Variants section */}
        <div className="rounded-md border border-border bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-lg font-bold text-brand-ink">Product Variants</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendVariant({
                  size: "M",
                  color: "",
                  stock: 10,
                  sku: `${watch("sku") || "SKU"}-${variantFields.length + 1}`,
                })
              }
              disabled={isPending || isSubmitting}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Variant
            </Button>
          </div>

          {variantFields.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">
              No variants defined. Add variants to allow sizing options (e.g. S, M, L, XL).
            </p>
          ) : (
            <div className="space-y-3">
              {variantFields.map((field, idx) => (
                <div key={field.id} className="flex gap-3 items-end border p-3 rounded-md bg-slate-50/50">
                  <div className="w-20 space-y-1">
                    <Label className="text-xs">Size</Label>
                    <Input
                      placeholder="e.g. XL"
                      {...register(`variants.${idx}.size`)}
                      disabled={isPending || isSubmitting}
                      className="h-9 px-2 text-xs"
                    />
                  </div>
                  <div className="w-24 space-y-1">
                    <Label className="text-xs">Color</Label>
                    <Input
                      placeholder="e.g. Red"
                      {...register(`variants.${idx}.color`)}
                      disabled={isPending || isSubmitting}
                      className="h-9 px-2 text-xs"
                    />
                  </div>
                  <div className="w-20 space-y-1">
                    <Label className="text-xs">Stock</Label>
                    <Input
                      type="number"
                      placeholder="10"
                      {...register(`variants.${idx}.stock`, { valueAsNumber: true })}
                      disabled={isPending || isSubmitting}
                      className="h-9 px-2 text-xs"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">SKU</Label>
                    <Input
                      placeholder="SKU-VAR"
                      {...register(`variants.${idx}.sku`)}
                      disabled={isPending || isSubmitting}
                      className="h-9 px-2 text-xs font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVariant(idx)}
                    className="h-9 w-9 border border-destructive/20 text-destructive rounded-md flex items-center justify-center hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right Column: Catalog, Images and Status ── */}
      <div className="space-y-6">
        {/* Status / Publish Card */}
        <div className="rounded-md border border-border bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-md font-bold text-brand-ink border-b pb-2">Publish Settings</h2>

          <div className="space-y-1.5">
            <Label htmlFor="status">Product Status</Label>
            <select
              id="status"
              {...register("status")}
              disabled={isPending || isSubmitting}
              className="flex h-11 w-full rounded-sm border border-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="isFeatured"
              {...register("isFeatured")}
              disabled={isPending || isSubmitting}
              className="h-4 w-4 rounded border-gray-300 text-brand-red focus:ring-brand-red"
            />
            <Label htmlFor="isFeatured" className="cursor-pointer">
              Feature on Homepage
            </Label>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="categoryId">Category</Label>
            <select
              id="categoryId"
              {...register("categoryId")}
              disabled={isPending || isSubmitting}
              className="flex h-11 w-full rounded-sm border border-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-xs text-destructive">{errors.categoryId.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tag">Product Tag (e.g. Fit)</Label>
            <Input
              id="tag"
              placeholder="e.g. OVERSIZED FIT, PREMIUM COTTON"
              {...register("tag")}
              disabled={isPending || isSubmitting}
            />
          </div>

          <div className="pt-2 border-t flex gap-3">
            <Button
              type="submit"
              className="flex-1"
              disabled={isPending || isSubmitting || isUploading}
            >
              {isPending || isSubmitting ? (
                <span className="flex items-center gap-1.5 justify-center">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Saving...
                </span>
              ) : initialData ? (
                "Update Product"
              ) : (
                "Publish Product"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/products")}
            >
              Cancel
            </Button>
          </div>
        </div>

        {/* Media Uploader Card */}
        <div className="rounded-md border border-border bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-md font-bold text-brand-ink border-b pb-2">Product Media</h2>

          <div className="relative border-2 border-dashed rounded-md p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading || isPending || isSubmitting}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-2 text-muted-foreground flex flex-col items-center">
              <Upload className="h-8 w-8 text-brand-ink/50" />
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-ink">
                {isUploading ? "Uploading files..." : "Upload files"}
              </p>
              <p className="text-[10px]">Supports PNG, JPG, JPEG up to 5MB</p>
            </div>
          </div>
          {errors.images && (
            <p className="text-xs text-destructive">{errors.images.message}</p>
          )}

          {/* Uploaded Images List */}
          {imageFields.length > 0 && (
            <div className="space-y-2 pt-2">
              <Label className="text-xs font-bold">Manage Gallery Order</Label>
              <div className="space-y-2">
                {imageFields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="flex gap-3 items-center border p-2 rounded-md bg-white hover:shadow-sm transition-all"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-12 w-9 rounded-sm bg-muted overflow-hidden flex-shrink-0">
                      <img
                        src={field.url}
                        alt="Thumbnail"
                        className="object-cover w-full h-full"
                      />
                    </div>
                    {/* Alt Input */}
                    <div className="flex-1">
                      <input
                        placeholder="Alt text"
                        {...register(`images.${idx}.alt`)}
                        disabled={isPending || isSubmitting}
                        className="w-full text-xs border border-transparent hover:border-border focus:border-border rounded px-1.5 py-1 outline-none"
                      />
                    </div>
                    {/* Move controls */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => idx > 0 && swapImages(idx, idx - 1)}
                        disabled={idx === 0 || isPending}
                        className="p-0.5 hover:bg-slate-100 rounded disabled:opacity-30"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          idx < imageFields.length - 1 && swapImages(idx, idx + 1)
                        }
                        disabled={idx === imageFields.length - 1 || isPending}
                        className="p-0.5 hover:bg-slate-100 rounded disabled:opacity-30"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      disabled={isPending}
                      className="p-1 text-destructive hover:bg-destructive/10 rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
