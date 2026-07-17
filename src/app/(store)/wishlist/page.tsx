import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { WishlistView } from "@/components/wishlist/wishlist-view";

export const metadata = { title: "My Wishlist" };

export const revalidate = 0; // Live check

export default async function WishlistPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/wishlist");
  }

  const wishlist = await db.wishlist.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              discountPrice: true,
              tag: true,
              images: { orderBy: { position: "asc" }, take: 1 },
              category: { select: { name: true, slug: true } },
            },
          },
        },
      },
    },
  });

  return (
    <div className="container py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-display tracking-wide text-brand-ink uppercase">
          My Wishlist
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          View your saved merchandise and fandom items.
        </p>
      </div>

      <WishlistView initialItems={wishlist?.items || []} />
    </div>
  );
}
