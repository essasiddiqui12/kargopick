import { createAdminClient } from "@/lib/supabase/server";

export type SiteSettings = {
  logoUrl: string | null;
  ready: boolean;
};

const LOGO_KEY = "store_logo_url";

function isMissingSiteSettingsTable(error: {
  code?: string;
  message?: string;
}): boolean {
  const msg = error.message?.toLowerCase() ?? "";
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    msg.includes("site_settings") ||
    msg.includes("does not exist") ||
    msg.includes("schema cache")
  );
}

const defaultSettings: SiteSettings = {
  logoUrl: null,
  ready: false,
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", LOGO_KEY)
    .maybeSingle();

  if (error) {
    if (isMissingSiteSettingsTable(error)) {
      return defaultSettings;
    }
    throw new Error(error.message);
  }

  return {
    logoUrl: (data?.value as string | null) || null,
    ready: true,
  };
}

export async function setStoreLogoUrl(url: string | null): Promise<SiteSettings> {
  const supabase = createAdminClient();

  if (!url) {
    const { error } = await supabase
      .from("site_settings")
      .delete()
      .eq("key", LOGO_KEY);

    if (error) {
      if (isMissingSiteSettingsTable(error)) {
        throw new Error(
          "Logo storage is not set up yet. Run the database migration first."
        );
      }
      throw new Error(error.message);
    }
    return { logoUrl: null, ready: true };
  }

  const { error } = await supabase.from("site_settings").upsert(
    {
      key: LOGO_KEY,
      value: url,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );

  if (error) {
    if (isMissingSiteSettingsTable(error)) {
      throw new Error(
        "Logo storage is not set up yet. Run the database migration first."
      );
    }
    throw new Error(error.message);
  }

  return { logoUrl: url, ready: true };
}
