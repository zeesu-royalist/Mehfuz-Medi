"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/app/admin/actions";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

interface OrderStatusSelectorProps {
  orderId: string;
  currentStatus: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
}

export function OrderStatusSelector({
  orderId,
  currentStatus,
}: OrderStatusSelectorProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: typeof currentStatus) => {
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, newStatus);
      if (res.success) {
        toast.success("Order status updated successfully");
      } else {
        toast.error(res.error || "Failed to update status");
      }
    });
  };

  return (
    <div className="flex items-center gap-1.5 justify-end">
      {isPending && <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />}
      <select
        value={currentStatus}
        onChange={(e) => handleStatusChange(e.target.value as typeof currentStatus)}
        disabled={isPending}
        className="text-xs h-8 rounded border border-border bg-white px-2 focus:ring-1 focus:ring-ring focus:outline-none font-semibold"
      >
        <option value="PENDING">Pending</option>
        <option value="CONFIRMED">Confirmed</option>
        <option value="SHIPPED">Shipped</option>
        <option value="DELIVERED">Delivered</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
    </div>
  );
}
