import { getSiteSettings } from "@/lib/site-settings";
import StoreSettingsForm from "./StoreSettingsForm";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Store Settings</h1>
        <p className="text-sm text-surface-500 mt-1">
          Manage branding shown on your live website
        </p>
      </div>

      {!settings.ready && (
        <div className="mb-6 max-w-2xl rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">One-time database setup required</p>
          <p className="mt-1 text-amber-800">
            Open your Supabase project → <strong>SQL Editor</strong> → New query,
            then run the file{" "}
            <code className="rounded bg-amber-100 px-1">
              supabase/migrations/20260712143000_site_settings.sql
            </code>
            . After that, refresh this page and upload your logo.
          </p>
        </div>
      )}

      <div className="max-w-2xl rounded-xl border border-surface-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-surface-900">Store Logo</h2>
        <p className="mt-1 text-sm text-surface-500">
          This logo appears in the website header and footer. Upload a square or
          wide PNG logo with a transparent background for best results.
        </p>

        <div className="mt-6">
          <StoreSettingsForm
            initialLogoUrl={settings.logoUrl}
            settingsReady={settings.ready}
          />
        </div>
      </div>
    </div>
  );
}
