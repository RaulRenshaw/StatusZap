import { useAuth } from "@/modules/auth/hooks/use-auth";

export function useIsAdmin() {
  const { user, loading } = useAuth();
  const roles = (user as { roles?: string[] } | null)?.roles ?? [];
  const isAdmin = roles.includes("ADMIN") || !!user?.email?.endsWith("@admin.com");
  return { isAdmin, loading };
}
