import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import {
  DollarSign,
  ShoppingBag,
  ShoppingCart,
  Users,
} from "lucide-react";
import Link from "next/link";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Status badge variants
const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider",
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

export const revalidate = 0; // Disable static cache for live admin metrics

export default async function AdminDashboardPage() {
  // 1. Fetch metrics
  const [totalProducts, totalOrders, totalUsers, ordersForRevenue] =
    await Promise.all([
      db.product.count(),
      db.order.count(),
      db.user.count({ where: { role: "CLIENT" } }),
      db.order.findMany({
        where: {
          status: {
            in: ["CONFIRMED", "SHIPPED", "DELIVERED"],
          },
        },
        select: { total: true },
      }),
    ]);

  const revenue = ordersForRevenue.reduce(
    (sum, order) => sum + Number(order.total),
    0
  );

  // 2. Fetch 5 recent orders
  const recentOrders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  });

  const cards = [
    {
      label: "Total Revenue",
      value: formatPrice(revenue),
      icon: DollarSign,
      colorClass: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Total Orders",
      value: totalOrders.toString(),
      icon: ShoppingCart,
      colorClass: "text-blue-600 bg-blue-50",
    },
    {
      label: "Products",
      value: totalProducts.toString(),
      icon: ShoppingBag,
      colorClass: "text-amber-600 bg-amber-50",
    },
    {
      label: "Active Customers",
      value: totalUsers.toString(),
      icon: Users,
      colorClass: "text-violet-600 bg-violet-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-brand-ink">
          Dashboard Overview
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Real-time metrics and summaries for The Souled Store.
        </p>
      </div>

      {/* Grid of stats cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="flex items-center gap-4 rounded-md border border-border bg-white p-6 shadow-sm"
          >
            <div className={cn("rounded-md p-3", card.colorClass)}>
              <card.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {card.label}
              </p>
              <p className="text-2xl font-bold text-brand-ink">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders Table */}
      <div className="rounded-md border border-border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="text-lg font-bold text-brand-ink">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-brand-red hover:underline uppercase tracking-wider"
          >
            View all orders
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-brand-ink">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b">
              <tr>
                <th className="px-6 py-3.5">Order No.</th>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Total</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-sm text-muted-foreground"
                  >
                    No orders placed yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-mono font-semibold text-xs">
                      #{order.orderNumber}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{order.user.name || "Guest"}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.user.email}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      {formatPrice(Number(order.total))}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={statusBadgeVariants({
                          status: order.status,
                        })}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
