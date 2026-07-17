import Link from "next/link";
import { LoginForm } from "./login-form";
import { AuthCard } from "@/components/layout/auth-card";
import { Suspense } from "react";

export const metadata = { title: "Log In" };

export default function LoginPage() {
  return (
    <AuthCard
      title="Log in"
      subtitle="Welcome back."
      footer={
        <>
          New here?{" "}
          <Link href="/register" className="font-semibold text-brand-red">
            Create an account
          </Link>
        </>
      }
    >
      <Suspense fallback={<div className="h-40 flex items-center justify-center text-xs text-muted-foreground">Loading form...</div>}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
