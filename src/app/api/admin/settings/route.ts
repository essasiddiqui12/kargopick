import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getSiteSettings, setStoreLogoUrl } from "@/lib/site-settings";

export async function GET() {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { logoUrl } = await request.json();

  if (logoUrl !== null && typeof logoUrl !== "string") {
    return NextResponse.json({ error: "Invalid logo URL" }, { status: 400 });
  }

  const settings = await setStoreLogoUrl(logoUrl || null);
  return NextResponse.json(settings);
}
