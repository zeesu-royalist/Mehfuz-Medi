import { z } from "zod";

export const productVariantSchema = z.object({
  id: z.string().optional(),
  size: z.string().min(1, "Size is required"),
  color: z.string().optional().nullable(),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  sku: z.string().min(3, "SKU must be at least 3 characters"),
});

export const productImageSchema = z.object({
  id: z.string().optional(),
  url: z.string().url("Must be a valid URL"),
  publicId: z.string().min(1, "Public ID is required"),
  position: z.number().int().default(0),
  alt: z.string().optional().nullable(),
});

export const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be greater than zero"),
  discountPrice: z.number().nonnegative().optional().nullable(),
  sku: z.string().min(3, "SKU must be at least 3 characters"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  isFeatured: z.boolean().default(false),
  categoryId: z.string().min(1, "Category is required"),
  tag: z.string().optional().nullable(),
  images: z.array(productImageSchema).min(1, "At least one image is required"),
  variants: z.array(productVariantSchema).default([]),
});

export type ProductInput = z.infer<typeof productSchema>;
export type ProductVariantInput = z.infer<typeof productVariantSchema>;
export type ProductImageInput = z.infer<typeof productImageSchema>;
