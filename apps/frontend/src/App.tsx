import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/shared/components/ui/sonner";
import { Toaster } from "@/shared/components/ui/toaster";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { AppLayout } from "@/shared/components/AppLayout";
import { AuthProvider } from "@/modules/auth/hooks/use-auth";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
// 1. IMPORTAR DO PACOTE PADRÃO (SEM O "/next")
import { inject } from "@vercel/analytics";

// 2. INICIALIZAR O ANALYTICS AQUI (Fora do componente)
inject();
// ── Lazy-loaded pages ─────────────────────────────────────────────────────────
const Dashboard        = lazy(() => import("@/modules/dashboard/pages/Dashboard"));
const NewService       = lazy(() => import("@/modules/orders/pages/NewServicePage"));
const ServiceDetail    = lazy(() => import("@/modules/orders/pages/ServiceDetailPage"));
const ProfilePage      = lazy(() => import("@/modules/profile/pages/ProfilePage"));
const PublicTracking   = lazy(() => import("@/modules/tracking/pages/PublicTrackingPage"));
const Auth             = lazy(() => import("@/modules/auth/pages/Auth"));
const Admin            = lazy(() => import("@/modules/admin/pages/AdminPage"));
const SubscriptionPage = lazy(() => import("@/modules/subscription/pages/SubscriptionPage"));
const NotFound         = lazy(() => import("@/shared/components/NotFound"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ── Público ─────────────────────────────────────────── */}
              <Route path="/r/:slug/:label/:token" element={<PublicTracking />} />
              <Route path="/r/:slug/:token"        element={<PublicTracking />} />
              <Route path="/r/:token"              element={<PublicTracking />} />
              <Route path="/:slug/:short"          element={<PublicTracking />} />

              {/* ── Auth ────────────────────────────────────────────── */}
              <Route path="/auth" element={<Auth />} />

              {/* ── Protegido ───────────────────────────────────────── */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/"         element={<Dashboard />} />
                <Route path="/novo"     element={<NewService />} />
                <Route path="/servico/:id" element={<ServiceDetail />} />
                <Route path="/perfil"   element={<ProfilePage />} />
                <Route path="/assinar"  element={<SubscriptionPage />} />
                <Route path="/admin"    element={<Admin />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
