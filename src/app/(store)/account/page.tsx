import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProfileView } from "@/components/cart/profile-view";
import Link from "next/link";
import { ChevronRight, Settings, ShoppingBag, FolderHeart } from "lucide-react";

export const metadata = { title: "My Profile" };

export const revalidate = 0; // Live check

export default async function AccountProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/account");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container max-w-4xl py-10 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
        <Link href="/" className="hover:text-brand-ink">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-brand-ink">My Account</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-display tracking-wide text-brand-ink uppercase">
            My Account
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your personal profile, addresses, and track order histories.
          </p>
        </div>

        {/* Short cut links */}
        <div className="flex gap-2">
          <Link
            href="/account/orders"
            className="inline-flex h-9 px-4 items-center gap-1 text-xs font-bold uppercase tracking-wider rounded border border-border bg-white text-brand-ink hover:bg-slate-50"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Orders
          </Link>
          <Link
            href="/wishlist"
            className="inline-flex h-9 px-4 items-center gap-1 text-xs font-bold uppercase tracking-wider rounded border border-border bg-white text-brand-ink hover:bg-slate-50"
          >
            <FolderHeart className="h-3.5 w-3.5" /> Wishlist
          </Link>
        </div>
      </div>

      <ProfileView user={user} />
    </div>
  );
}
