import { HeaderLayout } from "@/components/header-layout";
import { AuthProvider } from "@/components/providers/auth-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // children artık kullanılmıyor - TabContentRenderer sayfa içeriklerini yönetiyor
  return (
    <AuthProvider>
      <HeaderLayout />
    </AuthProvider>
  );
}
