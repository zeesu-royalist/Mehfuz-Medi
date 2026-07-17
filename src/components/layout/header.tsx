"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cart-store";
import {
  Menu,
  Search,
  User,
  Heart,
  ShoppingBag,
  LogOut,
  Package,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/categories/men", label: "MEN" },
  { href: "/categories/women", label: "WOMEN" },
  { href: "/categories/sneakers", label: "SNEAKERS" },
] as const;

const MOBILE_NAV_SECTIONS = [
  {
    title: "Shop",
    links: [
      { href: "/categories/men", label: "Men" },
      { href: "/categories/women", label: "Women" },
      { href: "/categories/sneakers", label: "Sneakers" },
      { href: "/products", label: "All Products" },
    ],
  },
  {
    title: "Categories",
    links: [
      { href: "/categories/t-shirts", label: "T-Shirts" },
      { href: "/categories/oversized-t-shirts", label: "Oversized T-Shirts" },
      { href: "/categories/shirts", label: "Shirts" },
      { href: "/categories/polos", label: "Polos" },
      { href: "/categories/men-pants", label: "Men Pants" },
      { href: "/categories/men-jeans", label: "Men Jeans" },
      { href: "/categories/men-joggers", label: "Men Joggers" },
    ],
  },
] as const;

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  const { items, fetchCart, mergeLocalCartToDb } = useCartStore();
  const isLoggedIn = !!session?.user;

  useEffect(() => {
    setMounted(true);
    if (isLoggedIn) {
      mergeLocalCartToDb().then(() => fetchCart(true));
    } else {
      fetchCart(false);
    }
  }, [isLoggedIn, fetchCart, mergeLocalCartToDb]);

  const cartCount = mounted ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    window.location.href = `/products?q=${encodeURIComponent(searchQuery.trim())}`;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-white">
      <div className="container relative flex h-14 items-center justify-between sm:h-16">
        {/* ── Left: Hamburger + Logo ── */}
        <div className="flex items-center gap-4 lg:gap-6">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger
              className="flex items-center justify-center lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5 text-brand-ink" />
            </SheetTrigger>

            <SheetContent side="left" className="w-80 overflow-y-auto p-0">
              <SheetHeader className="border-b px-6 py-4">
                <SheetTitle>
                  <Link
                    href="/"
                    onClick={() => setMobileNavOpen(false)}
                    className="font-display text-2xl text-brand-red"
                  >
                    Mehfuz Medi
                  </Link>
                </SheetTitle>
              </SheetHeader>

              <nav className="px-6 py-4">
                {MOBILE_NAV_SECTIONS.map((section) => (
                  <div key={section.title} className="mb-6">
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {section.title}
                    </p>
                    <ul className="space-y-1">
                      {section.links.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            onClick={() => setMobileNavOpen(false)}
                            className={cn(
                              "flex items-center justify-between rounded-md px-2 py-2.5 text-sm font-medium text-brand-ink transition-colors hover:bg-muted",
                              pathname === link.href && "text-brand-red"
                            )}
                          >
                            {link.label}
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {/* Auth section in mobile nav */}
                <div className="border-t pt-4">
                  {session?.user ? (
                    <div className="space-y-1">
                      <Link
                        href="/account"
                        onClick={() => setMobileNavOpen(false)}
                        className="flex items-center gap-3 rounded-md px-2 py-2.5 text-sm font-medium text-brand-ink hover:bg-muted"
                      >
                        <User className="h-4 w-4" />
                        My Account
                      </Link>
                      <Link
                        href="/account/orders"
                        onClick={() => setMobileNavOpen(false)}
                        className="flex items-center gap-3 rounded-md px-2 py-2.5 text-sm font-medium text-brand-ink hover:bg-muted"
                      >
                        <Package className="h-4 w-4" />
                        My Orders
                      </Link>
                      <button
                        onClick={() => {
                          setMobileNavOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-sm font-medium text-brand-ink hover:bg-muted"
                      >
                        <LogOut className="h-4 w-4" />
                        Log Out
                      </button>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setMobileNavOpen(false)}
                      className="flex items-center gap-3 rounded-md px-2 py-2.5 text-sm font-semibold text-brand-red hover:bg-muted"
                    >
                      <User className="h-4 w-4" />
                      Log In / Sign Up
                    </Link>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo on the left side */}
          <Link href="/" className="flex-shrink-0">
            <span className="font-display text-xl text-brand-red sm:text-2xl lg:text-3xl">
              Mehfuz Medi
            </span>
          </Link>
        </div>

        {/* ── Center: Desktop navigation links (Categories) ── */}
        <nav className="hidden items-center gap-6 lg:flex absolute left-1/2 -translate-x-1/2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "border-b-2 border-transparent pb-0.5 text-sm font-bold tracking-wide text-brand-ink transition-colors hover:text-brand-red",
                pathname.startsWith(link.href) &&
                  "border-brand-red text-brand-ink"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>



        {/* ── Right: Search + Icons ── */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Desktop search bar */}
          <form
            onSubmit={handleSearch}
            className="hidden items-center gap-1.5 rounded-full border border-border bg-muted/30 px-4 py-2 transition-colors focus-within:border-brand-ink focus-within:ring-1 focus-within:ring-brand-ink md:flex"
          >
            <input
              type="text"
              placeholder="What are you looking for?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-36 bg-transparent text-sm outline-none placeholder:text-muted-foreground lg:w-48"
            />
            <button type="submit" aria-label="Search">
              <Search className="h-4 w-4 text-muted-foreground transition-colors hover:text-brand-ink" />
            </button>
          </form>

          {/* Mobile search icon */}
          <Link
            href="/products"
            className="flex items-center justify-center rounded-full p-1.5 transition-colors hover:bg-muted md:hidden"
            aria-label="Search products"
          >
            <Search className="h-5 w-5 text-brand-ink" />
          </Link>

          {/* User account */}
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center justify-center rounded-full p-1.5 transition-colors hover:bg-muted"
                  aria-label="Account menu"
                >
                  <User className="h-5 w-5 text-brand-ink" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-medium leading-none">
                    {session.user.name}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {session.user.email}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {session.user.role === "ADMIN" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/account">
                    <User className="mr-2 h-4 w-4" />
                    My Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/orders">
                    <Package className="mr-2 h-4 w-4" />
                    My Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/login"
              className="flex items-center justify-center rounded-full p-1.5 transition-colors hover:bg-muted"
              aria-label="Log in"
            >
              <User className="h-5 w-5 text-brand-ink" />
            </Link>
          )}

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="relative flex items-center justify-center rounded-full p-1.5 transition-colors hover:bg-muted"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5 text-brand-ink" />
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative flex items-center justify-center rounded-full p-1.5 transition-colors hover:bg-muted"
            aria-label="Shopping cart"
          >
            <ShoppingBag className="h-5 w-5 text-brand-ink" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-red text-[9px] font-bold text-white ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
