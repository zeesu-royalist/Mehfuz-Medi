import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CancelOrderButton } from "@/components/cart/cancel-order-button";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ChevronRight, ClipboardList } from "lucide-react";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
  {
    variants: {
      status: {
        PENDING: "bg-amber-100 text-amber-800",
        CONFIRMED: "bg-blue-100 text-blue-800",
        SHIPPED: "bg-indigo-100 text-indigo-800",
        DELIVERED: "bg-emerald-100 text-emerald-800",
        CANCELLED: "bg-rose-100 text-rose-800",
      },
    },
    defaultVariants: {
      status: "PENDING",
    },
  }
);

export const metadata = { title: "My Orders" };

export const revalidate = 0; // Live check

export default async function CustomerOrdersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/account/orders");
  }

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      address: true,
      items: {
        include: {
          product: {
            select: {
              slug: true,
              images: { orderBy: { position: "asc" }, take: 1 },
            },
          },
          variant: {
            select: { size: true },
          },
        },
      },
    },
  });

  return (
    <div className="container max-w-4xl py-10 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
        <Link href="/" className="hover:text-brand-ink">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/account" className="hover:text-brand-ink">
          My Account
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-brand-ink">Orders</span>
      </nav>

      <div>
        <h1 className="text-3xl font-display tracking-wide text-brand-ink uppercase">
          My Orders
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Track and review your purchases and fulfillment statuses.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white border rounded-md space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-muted-foreground border">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-md font-bold text-brand-ink uppercase tracking-wider">
              No Orders Found
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              You haven&#39;t placed any orders with us yet.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center justify-center h-10 px-6 bg-brand-red text-white text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-brand-red/90 transition-colors"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-md border border-border bg-white shadow-sm overflow-hidden"
            >
              {/* Order Card Header */}
              <div className="bg-slate-50/70 border-b border-border px-5 py-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
                  <div>
                    <p className="text-muted-foreground font-semibold uppercase tracking-wider">
                      Order Placed
                    </p>
                    <p className="font-bold text-brand-ink mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-semibold uppercase tracking-wider">
                      Total
                    </p>
                    <p className="font-bold text-brand-red mt-0.5">
                      {formatPrice(Number(order.total))}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-semibold uppercase tracking-wider">
                      Ship To
                    </p>
                    <p className="font-bold text-brand-ink mt-0.5 truncate max-w-[150px]">
                      {order.address.fullName}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-semibold uppercase tracking-wider">
                      Order No
                    </p>
                    <p className="font-mono font-bold text-brand-ink mt-0.5">
                      #{order.orderNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={statusBadgeVariants({ status: order.status })}>
                    {order.status}
                  </span>
                  {order.status === "PENDING" && (
                    <CancelOrderButton
                      orderId={order.id}
                      orderNumber={order.orderNumber}
                    />
                  )}
                </div>
              </div>

              {/* Order Card Body */}
              <div className="divide-y divide-border px-5">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4 items-center">
                    {/* Thumbnail */}
                    <div className="h-16 w-12 rounded-sm bg-muted overflow-hidden border shrink-0">
                      {item.product?.images[0]?.url ? (
                        <img
                          src={item.product.images[0].url}
                          alt={item.nameSnapshot}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-slate-100" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      {item.product ? (
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="font-semibold text-sm hover:text-brand-red transition-colors line-clamp-1"
                        >
                          {item.nameSnapshot}
                        </Link>
                      ) : (
                        <p className="font-semibold text-sm text-brand-ink">
                          {item.nameSnapshot}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground font-bold mt-1 uppercase tracking-wider">
                        Qty: {item.quantity} {item.variant?.size && `| Size: ${item.variant.size}`}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-brand-ink">
                        {formatPrice(Number(item.priceSnapshot) * item.quantity)}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                        {formatPrice(Number(item.priceSnapshot))} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Card Footer */}
              <div className="bg-slate-50/20 border-t px-5 py-3.5 text-xs text-muted-foreground font-semibold">
                <span className="text-brand-ink font-bold uppercase tracking-wider">
                  Shipping Address:
                </span>{" "}
                {order.address.fullName}, {order.address.line1}
                {order.address.line2 && `, ${order.address.line2}`}, {order.address.city},{" "}
                {order.address.state} - {order.address.pincode} | Tel: {order.address.phone}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
