import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Header } from "@/components/layout/Header";

/**
 * Layout para páginas que requerem autenticação
 * Todas as páginas dentro deste grupo serão automaticamente protegidas
 */
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Header />
      <main>{children}</main>
      {/* <Footer /> */}
    </ProtectedRoute>
  );
}
