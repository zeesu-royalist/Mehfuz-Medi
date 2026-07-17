import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  addToDbCart,
  updateDbCartQty,
  removeFromDbCart,
  getDbCart,
  mergeCarts,
} from "@/app/(store)/cart/actions";

export interface CartItem {
  id?: string; // DB cart item id (if authenticated)
  productId: string;
  variantId: string | null;
  quantity: number;
  name: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  imageUrl: string;
  size: string | null;
  color: string | null;
  stock?: number;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  fetchCart: (isLoggedIn: boolean) => Promise<void>;
  addItem: (item: Omit<CartItem, "quantity">, quantity: number, isLoggedIn: boolean) => Promise<void>;
  removeItem: (productId: string, variantId: string | null, isLoggedIn: boolean, dbItemId?: string) => Promise<void>;
  updateQuantity: (
    productId: string,
    variantId: string | null,
    quantity: number,
    isLoggedIn: boolean,
    dbItemId?: string
  ) => Promise<void>;
  clearCart: () => void;
  mergeLocalCartToDb: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      fetchCart: async (isLoggedIn: boolean) => {
        if (!isLoggedIn) return; // Keep guest items in local storage
        set({ isLoading: true });
        try {
          const res = await getDbCart();
          if (res.success && res.data) {
            const dbItems: CartItem[] = res.data.map((item: any) => ({
              id: item.id,
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              name: item.product.name,
              slug: item.product.slug,
              price: Number(item.product.price),
              discountPrice: item.product.discountPrice
                ? Number(item.product.discountPrice)
                : null,
              imageUrl: item.product.images[0]?.url || "",
              size: item.variant?.size || null,
              color: item.variant?.color || null,
              stock: item.variant?.stock ?? item.product.stock,
            }));
            set({ items: dbItems });
          }
        } catch (err) {
          console.error("Failed to load db cart:", err);
        } finally {
          set({ isLoading: false });
        }
      },

      addItem: async (item, quantity, isLoggedIn) => {
        const currentItems = get().items;
        const existingItemIdx = currentItems.findIndex(
          (i) => i.productId === item.productId && i.variantId === item.variantId
        );

        if (isLoggedIn) {
          set({ isLoading: true });
          const res = await addToDbCart(item.productId, item.variantId, quantity);
          if (res.success) {
            await get().fetchCart(true);
          } else {
            console.error("Failed to sync add to db cart:", res.error);
          }
          set({ isLoading: false });
        } else {
          // Guest local cart logic
          if (existingItemIdx > -1) {
            const updated = [...currentItems];
            updated[existingItemIdx].quantity += quantity;
            set({ items: updated });
          } else {
            set({ items: [...currentItems, { ...item, quantity }] });
          }
        }
      },

      removeItem: async (productId, variantId, isLoggedIn, dbItemId) => {
        if (isLoggedIn && dbItemId) {
          set({ isLoading: true });
          const res = await removeFromDbCart(dbItemId);
          if (res.success) {
            await get().fetchCart(true);
          } else {
            console.error("Failed to remove item from db cart:", res.error);
          }
          set({ isLoading: false });
        } else {
          // Guest local cart remove
          set({
            items: get().items.filter(
              (i) => !(i.productId === productId && i.variantId === variantId)
            ),
          });
        }
      },

      updateQuantity: async (productId, variantId, quantity, isLoggedIn, dbItemId) => {
        if (isLoggedIn && dbItemId) {
          set({ isLoading: true });
          const res = await updateDbCartQty(dbItemId, quantity);
          if (res.success) {
            await get().fetchCart(true);
          } else {
            console.error("Failed to update db cart qty:", res.error);
          }
          set({ isLoading: false });
        } else {
          // Guest local cart update
          if (quantity <= 0) {
            get().removeItem(productId, variantId, false);
            return;
          }
          const updated = get().items.map((i) =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, quantity }
              : i
          );
          set({ items: updated });
        }
      },

      clearCart: () => set({ items: [] }),

      mergeLocalCartToDb: async () => {
        const localItems = get().items;
        if (localItems.length === 0) return;

        set({ isLoading: true });
        const itemsToMerge = localItems.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        }));

        const res = await mergeCarts(itemsToMerge);
        if (res.success) {
          get().clearCart(); // Clear local guest cart items
          await get().fetchCart(true); // Pull newly merged DB items
        }
        set({ isLoading: false });
      },
    }),
    {
      name: "souled_cart_store",
      partialize: (state) => ({ items: state.items }), // Only save guest item list to localStorage
    }
  )
);
