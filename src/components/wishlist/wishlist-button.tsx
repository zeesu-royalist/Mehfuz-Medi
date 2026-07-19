"use client";

import { useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useWishlistStore } from "@/store/wishlist-store";
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
  const { isWishlisted, toggleWishlist } = useWishlistStore();

  const isLoggedIn = !!session?.user;
  const isLiked = initialIsLiked || isWishlisted(productId);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      toast.error("Please log in to add items to your wishlist.");
      router.push("/login");
      return;
    }

    startTransition(async () => {
      const res = await toggleWishlist(productId, true);
      if (!res.success) {
        toast.error(res.error || "Failed to update wishlist");
      } else if (res.isLiked !== undefined) {
        toast.success(
          res.isLiked ? "Added to wishlist" : "Removed from wishlist"
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
