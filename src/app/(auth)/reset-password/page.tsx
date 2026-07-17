import { AuthCard } from "@/components/layout/auth-card";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata = { title: "Reset Password" };

interface ResetPasswordPageProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  return (
    <AuthCard title="Set a new password">
      {params.token ? (
        <ResetPasswordForm token={params.token} />
      ) : (
        <p className="text-center text-sm text-destructive">
          This reset link is missing a token. Please request a new one.
        </p>
      )}
    </AuthCard>
  );
}
