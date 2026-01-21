import { SidebarLayout } from "@/components/sidebar-layout";
import { AuthProvider } from "@/components/providers/auth-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <SidebarLayout>{children}</SidebarLayout>
    </AuthProvider>
  );
}
