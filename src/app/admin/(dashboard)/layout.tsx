import AdminSidebar from "@/components/admin/AdminSidebar";
import NewOrderNotifier from "@/components/admin/NewOrderNotifier";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-surface-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto pb-16 md:pb-0">{children}</main>
      <NewOrderNotifier />
    </div>
  );
}
