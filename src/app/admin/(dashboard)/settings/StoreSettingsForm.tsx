"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import LogoUploadField from "@/components/admin/LogoUploadField";
import SiteLogo from "@/components/SiteLogo";

export default function StoreSettingsForm({
  initialLogoUrl,
  settingsReady = true,
}: {
  initialLogoUrl: string | null;
  settingsReady?: boolean;
}) {
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [saved, setSaved] = useState(false);

  function handleChange(url: string | null) {
    setLogoUrl(url);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-8">
      <LogoUploadField
        value={logoUrl}
        onChange={handleChange}
        disabled={!settingsReady}
      />

      <div className="rounded-xl border border-surface-200 bg-surface-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-surface-500 mb-3">
          Live preview
        </p>
        <SiteLogo logoUrl={logoUrl} />
      </div>

      {saved && (
        <p className="inline-flex items-center gap-2 text-sm text-emerald-600">
          <CheckCircle2 className="h-4 w-4" />
          Logo saved — refresh your store to see it live
        </p>
      )}
    </div>
  );
}
