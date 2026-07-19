import { create } from "zustand";
import { getDbWishlist, toggleDbWishlist } from "@/app/(store)/wishlist/actions";

interface WishlistState {
  wishlistProductIds: string[];
  isLoading: boolean;
  fetchWishlist: (isLoggedIn: boolean) => Promise<void>;
  toggleWishlist: (
    productId: string,
    isLoggedIn: boolean
  ) => Promise<{ success: boolean; isLiked?: boolean; error?: string }>;
  isWishlisted: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlistProductIds: [],
  isLoading: false,

  fetchWishlist: async (isLoggedIn: boolean) => {
    if (!isLoggedIn) {
      set({ wishlistProductIds: [] });
      return;
    }
    set({ isLoading: true });
    try {
      const res = await getDbWishlist();
      if (res.success && Array.isArray(res.data)) {
        const ids: string[] = res.data
          .map((item: any) => item.productId || item.product?.id)
          .filter((id): id is string => Boolean(id));
        set({ wishlistProductIds: ids });
      }
    } catch (err) {
      console.error("Failed to load wishlist:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  toggleWishlist: async (productId: string, isLoggedIn: boolean) => {
    if (!isLoggedIn) {
      return { success: false, error: "Please log in to manage your wishlist." };
    }

    const currentIds = get().wishlistProductIds;
    const isCurrentlyLiked = currentIds.includes(productId);

    // Optimistic update
    const updatedIds = isCurrentlyLiked
      ? currentIds.filter((id) => id !== productId)
      : [...currentIds, productId];

    set({ wishlistProductIds: updatedIds });

    try {
      const res = await toggleDbWishlist(productId);
      if (res.success) {
        const serverIsLiked = res.data?.isLiked ?? !isCurrentlyLiked;
        const latestIds = get().wishlistProductIds;
        if (serverIsLiked && !latestIds.includes(productId)) {
          set({ wishlistProductIds: [...latestIds, productId] });
        } else if (!serverIsLiked && latestIds.includes(productId)) {
          set({ wishlistProductIds: latestIds.filter((id) => id !== productId) });
        }
        return { success: true, isLiked: serverIsLiked };
      } else {
        // Rollback on failure
        set({ wishlistProductIds: currentIds });
        return { success: false, error: res.error || "Failed to update wishlist" };
      }
    } catch (err: any) {
      // Rollback on exception
      set({ wishlistProductIds: currentIds });
      return { success: false, error: err.message || "Failed to update wishlist" };
    }
  },

  isWishlisted: (productId: string) => {
    return get().wishlistProductIds.includes(productId);
  },

  clearWishlist: () => set({ wishlistProductIds: [] }),
}));
