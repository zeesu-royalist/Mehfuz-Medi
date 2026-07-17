import { db } from "@/lib/db";
import { SettingsForm } from "@/components/admin/settings-form";

export const revalidate = 0; // Live check

export default async function AdminSettingsPage() {
  const dbSettings = await db.siteSetting.findMany();

  // Convert array of models into a single key-value dictionary
  const initialSettings = dbSettings.reduce((acc, current) => {
    acc[current.key] = current.value;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-brand-ink">
          Website Settings
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Configure general store attributes, shipping rates, and tax fees.
        </p>
      </div>

      <SettingsForm initialSettings={initialSettings} />
    </div>
  );
}
