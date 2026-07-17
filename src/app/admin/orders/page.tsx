import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { OrderStatusSelector } from "@/components/admin/order-status-selector";

export const revalidate = 0; // Live lookup

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, email: true },
      },
      _count: {
        select: { items: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-brand-ink">
          Manage Orders
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Track customer purchases, update fulfillment statuses, or handle cancellations.
        </p>
      </div>

      <div className="rounded-md border border-border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-brand-ink">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b">
              <tr>
                <th className="px-6 py-3.5">Order No.</th>
                <th className="px-6 py-3.5">Customer details</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Items</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5 text-right font-semibold">Fulfillment status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-sm text-muted-foreground"
                  >
                    No customer orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50">
                    {/* Order ID */}
                    <td className="px-6 py-4 font-mono font-bold text-xs">
                      #{order.orderNumber}
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4">
                      <p className="font-semibold">{order.user.name || "Guest"}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.user.email}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Items quantity */}
                    <td className="px-6 py-4 text-xs font-semibold">
                      {order._count.items} unique items
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 font-bold">
                      {formatPrice(Number(order.total))}
                    </td>

                    {/* Status selector */}
                    <td className="px-6 py-4 text-right">
                      <OrderStatusSelector
                        orderId={order.id}
                        currentStatus={order.status}
                      />
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
