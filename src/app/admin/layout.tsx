import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Guard rails in case middleware is bypassed
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="pl-64">
        {/* Top Navbar */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-white px-8 shadow-sm">
          <div className="text-sm font-medium text-brand-ink">
            Admin Workspace
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">
              Logged in as <strong className="text-brand-ink">{session.user.name}</strong>
            </span>
            <div className="h-8 w-8 rounded-full bg-brand-red text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
              {session.user.name?.charAt(0) || "A"}
            </div>
          </div>
        </header>

        {/* Dynamic page contents */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
