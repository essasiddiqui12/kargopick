import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logoUrl } = await getSiteSettings();

  return (
    <div className="bg-mesh min-h-screen text-surface-800 flex flex-col overflow-x-hidden">
      <Header logoUrl={logoUrl} />
      <main className="flex-1">{children}</main>
      <Footer logoUrl={logoUrl} />
      <CartDrawer />
      <WhatsAppButton />
    </div>
  );
}
