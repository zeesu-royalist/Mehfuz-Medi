"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/validators/auth";
import { changePassword } from "@/app/(auth)/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw, KeyRound, User } from "lucide-react";

interface ProfileViewProps {
  user: {
    name: string | null;
    email: string;
  };
}

export function ProfileView({ user }: ProfileViewProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmitPassword = (data: ChangePasswordInput) => {
    startTransition(async () => {
      const res = await changePassword(data);
      if (res.success) {
        toast.success("Password changed successfully.");
        reset();
      } else {
        toast.error(res.error || "Failed to change password.");
      }
    });
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* ── Personal Info Summary ── */}
      <div className="rounded-md border border-border bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-md font-bold text-brand-ink border-b pb-2 flex items-center gap-2">
          <User className="h-4.5 w-4.5 text-brand-ink/80" /> Personal Profile
        </h2>

        <div className="space-y-3.5">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Full Name
            </span>
            <p className="text-sm font-semibold text-brand-ink">
              {user.name || "Not set"}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Email Address
            </span>
            <p className="text-sm font-semibold text-brand-ink">
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* ── Change Password Form ── */}
      <div className="rounded-md border border-border bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-md font-bold text-brand-ink border-b pb-2 flex items-center gap-2">
          <KeyRound className="h-4.5 w-4.5 text-brand-ink/80" /> Change Password
        </h2>

        <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              {...register("currentPassword")}
              disabled={isPending || isSubmitting}
            />
            {errors.currentPassword && (
              <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              {...register("newPassword")}
              disabled={isPending || isSubmitting}
            />
            {errors.newPassword && (
              <p className="text-xs text-destructive">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              disabled={isPending || isSubmitting}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isPending || isSubmitting}>
            {isPending || isSubmitting ? (
              <>
                <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Changing password...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
