"use client";

import { useTransition, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toggleDbWishlist, checkWishlistStatus } from "@/app/(store)/wishlist/actions";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  className?: string;
  initialIsLiked?: boolean;
}

export function WishlistButton({
  productId,
  className,
  initialIsLiked = false,
}: WishlistButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLiked, setIsLiked] = useState(initialIsLiked);

  // Sync wishlist status on mount/login
  useEffect(() => {
    if (session?.user && !initialIsLiked) {
      checkWishlistStatus(productId).then((status) => setIsLiked(status));
    }
  }, [productId, session, initialIsLiked]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      toast.error("Please log in to add items to your wishlist.");
      router.push("/login");
      return;
    }

    startTransition(async () => {
      // Optimistic update
      setIsLiked((prev) => !prev);

      const res = await toggleDbWishlist(productId);
      if (!res.success) {
        // Rollback on failure
        setIsLiked((prev) => !prev);
        toast.error(res.error || "Failed to update wishlist");
      } else if (res.data) {
        setIsLiked(res.data.isLiked);
        toast.success(
          res.data.isLiked ? "Added to wishlist" : "Removed from wishlist"
        );
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:shadow-md active:scale-95 disabled:opacity-50",
        className
      )}
      aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <Heart
          className={cn(
            "h-4 w-4 transition-colors",
            isLiked
              ? "fill-brand-red text-brand-red"
              : "text-brand-ink group-hover:text-brand-red"
          )}
        />
      )}
    </button>
  );
}
