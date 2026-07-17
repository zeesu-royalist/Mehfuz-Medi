"use client";

import { useTransition } from "react";
import { updateUserRole, toggleBlockUser, deleteUser } from "@/app/admin/actions";
import { toast } from "sonner";
import { Trash2, Ban, ShieldAlert, RefreshCw } from "lucide-react";

interface UserActionsRowProps {
  userId: string;
  userEmail: string;
  currentRole: "ADMIN" | "CLIENT";
  isBlocked: boolean;
}

export function UserActionsRow({
  userId,
  userEmail,
  currentRole,
  isBlocked,
}: UserActionsRowProps) {
  const [isPending, startTransition] = useTransition();

  const handleRoleChange = (newRole: "ADMIN" | "CLIENT") => {
    if (!confirm(`Are you sure you want to change role of ${userEmail} to ${newRole}?`)) return;

    startTransition(async () => {
      const res = await updateUserRole(userId, newRole);
      if (res.success) {
        toast.success("User role updated successfully");
      } else {
        toast.error(res.error || "Failed to update role");
      }
    });
  };

  const handleToggleBlock = () => {
    const actionText = isBlocked ? "unblock" : "block";
    if (!confirm(`Are you sure you want to ${actionText} user ${userEmail}?`)) return;

    startTransition(async () => {
      const res = await toggleBlockUser(userId);
      if (res.success) {
        toast.success(`User ${isBlocked ? "unblocked" : "blocked"} successfully`);
      } else {
        toast.error(res.error || "Failed to toggle block status");
      }
    });
  };

  const handleDelete = () => {
    if (!confirm(`Are you sure you want to permanently delete user ${userEmail}?`)) return;

    startTransition(async () => {
      const res = await deleteUser(userId);
      if (res.success) {
        toast.success("User deleted successfully");
      } else {
        toast.error(res.error || "Failed to delete user");
      }
    });
  };

  return (
    <div className="flex gap-2 justify-end items-center">
      {/* Role select */}
      <select
        value={currentRole}
        onChange={(e) => handleRoleChange(e.target.value as "ADMIN" | "CLIENT")}
        disabled={isPending}
        className="text-xs h-8 rounded border border-border bg-white px-2 focus:ring-1 focus:ring-ring focus:outline-none"
      >
        <option value="CLIENT">Client</option>
        <option value="ADMIN">Admin</option>
      </select>

      {/* Block/Unblock toggle */}
      <button
        onClick={handleToggleBlock}
        disabled={isPending}
        className={`inline-flex h-8 px-2.5 items-center gap-1 text-xs rounded border transition-colors ${
          isBlocked
            ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            : "border-amber-200 text-amber-700 hover:bg-amber-50"
        } disabled:opacity-50`}
        title={isBlocked ? "Unblock user" : "Block user"}
      >
        {isPending ? (
          <RefreshCw className="h-3 w-3 animate-spin" />
        ) : (
          <>
            <Ban className="h-3.5 w-3.5" />
            {isBlocked ? "Unblock" : "Block"}
          </>
        )}
      </button>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
        title="Delete User"
      >
        {isPending ? (
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}
