import { db } from "@/lib/db";
import { UserActionsRow } from "@/components/admin/user-actions-row";
import { ShieldCheck, User } from "lucide-react";

export const revalidate = 0; // Live database query

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-brand-ink">
          Manage Users
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          View all registered accounts, modify roles, block users, or delete profiles.
        </p>
      </div>

      <div className="rounded-md border border-border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-brand-ink">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b">
              <tr>
                <th className="px-6 py-3.5">User Details</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Joined Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-sm text-muted-foreground"
                  >
                    No registered users found.
                  </td>
                </tr>
              ) : (
                users.map((usr) => (
                  <tr key={usr.id} className="hover:bg-slate-50/50">
                    {/* User profile */}
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-muted-foreground border">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-brand-ink">
                          {usr.name || "Unnamed"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {usr.email}
                        </p>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      {usr.role === "ADMIN" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-red uppercase">
                          <ShieldCheck className="h-4 w-4" />
                          Admin
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-muted-foreground uppercase">
                          Client
                        </span>
                      )}
                    </td>

                    {/* Blocked Status */}
                    <td className="px-6 py-4">
                      {usr.isBlocked ? (
                        <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800 uppercase tracking-wider">
                          Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                          Active
                        </span>
                      )}
                    </td>

                    {/* Created date */}
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(usr.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Action buttons */}
                    <td className="px-6 py-4 text-right">
                      <UserActionsRow
                        userId={usr.id}
                        userEmail={usr.email}
                        currentRole={usr.role}
                        isBlocked={usr.isBlocked}
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
