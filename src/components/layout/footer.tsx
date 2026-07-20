import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const FOOTER_LINKS = {
  "Customer Service": [
    { label: "Contact Us", href: "/contact" },
    { label: "Track Order", href: "/account/orders" },
    { label: "Return & Refund", href: "/returns" },
    { label: "FAQs", href: "/faqs" },
    { label: "Size Guide", href: "/size-guide" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Terms of Use", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Blog", href: "/blog" },
  ],
  Connect: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Facebook", href: "https://facebook.com" },
    { label: "Twitter / X", href: "https://x.com" },
    { label: "YouTube", href: "https://youtube.com" },
  ],
} as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-brand-ink text-white">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="container flex flex-col items-center gap-4 py-8 sm:flex-row sm:justify-between text-center sm:text-left">
          <div>
            <h3 className="text-lg font-bold tracking-wide">
              STAY IN THE LOOP
            </h3>
            <p className="mt-1 text-sm text-white/60">
              Subscribe for exclusive offers, new launches & more.
            </p>
          </div>
          <form className="flex w-full max-w-sm flex-col gap-2.5 sm:flex-row">
            <input
              type="email"
              placeholder="Enter your email"
              className="h-10 w-full rounded-sm border border-white/20 bg-white/5 px-4 text-sm text-white placeholder:text-white/40 outline-none focus:border-brand-red"
            />
            <button
              type="submit"
              className="h-10 rounded-sm bg-brand-red px-6 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-brand-red/90 sm:w-auto"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Link columns */}
      <div className="container py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Logo + tagline column */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="font-display text-2xl text-brand-red">
              MR.SMEXO
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">
              India&#39;s favourite destination for officially licensed
              merchandise, trendy apparel and pop culture collectibles.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-white/80">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/50 transition-colors hover:text-white"
                      {...(link.href.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <Separator className="bg-white/10" />

      {/* Copyright */}
      <div className="container flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
        <p className="text-xs text-white/40 text-center sm:text-left">
          &copy; {new Date().getFullYear()} MR.SMEXO. All rights
          reserved.
        </p>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-white/40">
          <span>100% Secure Payments</span>
          <span>•</span>
          <span>Easy Returns</span>
          <span>•</span>
          <span>Free Shipping above ₹999</span>
        </div>
      </div>
    </footer>
  );
}
