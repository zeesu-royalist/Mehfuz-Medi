"use client";

import { useTransition } from "react";
import { cancelUserOrder } from "@/app/(store)/account/orders/actions";
import { toast } from "sonner";
import { XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CancelOrderButtonProps {
  orderId: string;
  orderNumber: string;
}

export function CancelOrderButton({ orderId, orderNumber }: CancelOrderButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleCancel = () => {
    if (!confirm(`Are you sure you want to cancel order #${orderNumber}?`)) return;

    startTransition(async () => {
      const res = await cancelUserOrder(orderId);
      if (res.success) {
        toast.success("Order cancelled successfully.");
      } else {
        toast.error(res.error || "Failed to cancel order.");
      }
    });
  };

  return (
    <Button
      variant="outline"
      onClick={handleCancel}
      disabled={isPending}
      className="text-xs h-8 border-destructive/25 text-destructive hover:bg-destructive/10 uppercase font-bold"
    >
      {isPending ? (
        <>
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          Cancelling...
        </>
      ) : (
        <>
          <XCircle className="mr-1.5 h-3.5 w-3.5" />
          Cancel Order
        </>
      )}
    </Button>
  );
}
