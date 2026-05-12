/**
 * AuthContext — integrado com backend.
 * Stores accountPlan so usePlan() can read without extra API calls.
 */
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/shared/services/api";
import type { AccountPlan } from "@/modules/subscription/types";

export interface AppUser {
  id: string;
  email: string;
  shopName?: string;
  roles?: string[];
  accountPlan?: AccountPlan;
}

export interface AppSession {
  token: string;
  expiresAt?: string;
}

interface AuthContextValue {
  user: AppUser | null;
  session: AppSession | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, shopName?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const SESSION_KEY = "sr:session";
const USER_KEY    = "sr:user";

function loadSession() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    const user    = JSON.parse(localStorage.getItem(USER_KEY)    || "null");
    return { session, user };
  } catch {
    return { session: null, user: null };
  }
}

function saveSession(user: AppUser, session: AppSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.setItem(USER_KEY,    JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(USER_KEY);
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<AppUser | null>(null);
  const [session, setSession] = useState<AppSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { user: u, session: s } = loadSession();
    setUser(u);
    setSession(s);
    setLoading(false);
  }, []);

  function applyAuthResponse(data: Awaited<ReturnType<typeof api.login>>) {
    const appUser: AppUser = {
      id:          data.user.id,
      email:       data.user.email,
      shopName:    data.user.shopName,
      roles:       data.user.roles,
      accountPlan: (data.user as any).accountPlan ?? "free",
    };
    const appSession: AppSession = {
      token:     data.session!.token,
      expiresAt: data.session!.expiresAt,
    };
    setUser(appUser);
    setSession(appSession);
    saveSession(appUser, appSession);
  }

  async function signIn(email: string, password: string) {
    applyAuthResponse(await api.login(email, password));
  }

  async function signUp(email: string, password: string, shopName?: string) {
    applyAuthResponse(await api.register(email, password, shopName));
  }

  async function signOut() {
    if (session?.token) api.logout().catch(() => {});
    clearSession();
    setUser(null);
    setSession(null);
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut, signUp }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
