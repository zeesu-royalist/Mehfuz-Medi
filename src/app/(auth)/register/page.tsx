import { RegisterForm } from "./register-form";
import { AuthCard } from "@/components/layout/auth-card";
import Link from "next/link";
import { Suspense } from "react";

export const metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create your account"
      subtitle="Join to track orders, save your wishlist and more."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand-red">
            Log in
          </Link>
        </>
      }
    >
      <Suspense fallback={<div className="h-40 flex items-center justify-center text-xs text-muted-foreground">Loading form...</div>}>
        <RegisterForm />
      </Suspense>
    </AuthCard>
  );
}
