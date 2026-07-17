import Link from "next/link";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-brand-cream px-4 py-12">
      <div className="w-full max-w-md rounded-md border border-border bg-white p-8 shadow-sm">
        <Link href="/" className="mb-6 block text-center font-display text-3xl text-brand-red">
          Mehfuz Medi
        </Link>
        <h1 className="text-center text-xl font-bold text-brand-ink">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-center text-sm text-muted-foreground">{subtitle}</p>
        )}
        <div className="mt-6">{children}</div>
        {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
      </div>
    </div>
  );
}
