"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { updateSiteSettings } from "@/app/admin/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw, Save } from "lucide-react";

interface SettingsFormProps {
  initialSettings: Record<string, string>;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      siteName: initialSettings.siteName || "MR.SMEXO",
      supportEmail: initialSettings.supportEmail || "support@souledclone.dev",
      contactNumber: initialSettings.contactNumber || "+91 1800-100-200",
      taxRate: initialSettings.taxRate || "18",
      shippingFee: initialSettings.shippingFee || "99",
      freeShippingThreshold: initialSettings.freeShippingThreshold || "999",
    },
  });

  const onSubmit = (data: Record<string, string>) => {
    startTransition(async () => {
      const res = await updateSiteSettings(data);
      if (res.success) {
        toast.success("Site settings updated successfully.");
      } else {
        toast.error(res.error || "Failed to save settings.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6" noValidate>
      {/* ── Section: General Settings ── */}
      <div className="rounded-md border border-border bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-md font-bold text-brand-ink border-b pb-2">General Info</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="siteName">Site Title</Label>
            <Input
              id="siteName"
              placeholder="MR.SMEXO"
              {...register("siteName")}
              disabled={isPending || isSubmitting}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="supportEmail">Support Email</Label>
            <Input
              id="supportEmail"
              type="email"
              placeholder="support@yoursite.com"
              {...register("supportEmail")}
              disabled={isPending || isSubmitting}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contactNumber">Contact Helpline</Label>
          <Input
            id="contactNumber"
            placeholder="+91 1800-100-200"
            {...register("contactNumber")}
            disabled={isPending || isSubmitting}
          />
        </div>
      </div>

      {/* ── Section: Finance & Fulfillment ── */}
      <div className="rounded-md border border-border bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-md font-bold text-brand-ink border-b pb-2">Pricing & Logistics</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="taxRate">Standard GST / Tax (%)</Label>
            <Input
              id="taxRate"
              type="number"
              placeholder="18"
              {...register("taxRate")}
              disabled={isPending || isSubmitting}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="shippingFee">Shipping Fee (₹)</Label>
            <Input
              id="shippingFee"
              type="number"
              placeholder="99"
              {...register("shippingFee")}
              disabled={isPending || isSubmitting}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="freeShippingThreshold">Free Shipping Limit (₹)</Label>
            <Input
              id="freeShippingThreshold"
              type="number"
              placeholder="999"
              {...register("freeShippingThreshold")}
              disabled={isPending || isSubmitting}
            />
          </div>
        </div>
      </div>

      <div className="flex">
        <Button
          type="submit"
          className="px-6"
          disabled={isPending || isSubmitting}
        >
          {isPending || isSubmitting ? (
            <span className="flex items-center gap-1.5">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Saving Settings...
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Save className="h-4 w-4" />
              Save Settings
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}
