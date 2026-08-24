"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, tokenStore } from "@/lib/api";
import { clearFollows } from "@/lib/engagement";
import type { RegisterPayload, UserProfile } from "@/lib/types";

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  loginWithSocial: (
    provider: "google" | "apple",
    payload: { email: string; name?: string; idToken?: string }
  ) => Promise<UserProfile>;
  register: (payload: RegisterPayload) => Promise<UserProfile>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!tokenStore.access) return null;
    try {
      return await api.profile();
    } catch {
      // Access token may have expired — try one refresh, then give up.
      const refresh = tokenStore.refresh;
      if (!refresh) return null;
      try {
        tokenStore.set(await api.refresh(refresh));
        return await api.profile();
      } catch {
        tokenStore.clear();
        return null;
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadProfile().then((profile) => {
      if (!cancelled) {
        setUser(profile);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [loadProfile]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password);
    const rawRes = res as unknown as { accessToken?: string; refreshToken?: string };
    const tokens = res.tokens || { accessToken: rawRes.accessToken || "", refreshToken: rawRes.refreshToken || "" };
    if (tokens.accessToken && tokens.refreshToken) {
      tokenStore.set(tokens);
    }
    const profile = await api.profile();
    setUser(profile);
    
    // Check if email verification is needed and redirect if necessary
    if (res.needsEmailVerification && typeof window !== 'undefined') {
      // Redirect to verify-email page after a short delay to allow state update
      setTimeout(() => {
        window.location.href = '/verify-email';
      }, 500);
    }
    
    return profile;
  }, []);

  const loginWithSocial = useCallback(
    async (
      provider: "google" | "apple",
      payload: { email: string; name?: string; idToken?: string }
    ) => {
      const res = await api.socialAuth(provider, payload);
      const rawRes = res as unknown as { accessToken?: string; refreshToken?: string };
      const tokens = res.tokens || { accessToken: rawRes.accessToken || "", refreshToken: rawRes.refreshToken || "" };
      if (tokens.accessToken && tokens.refreshToken) {
        tokenStore.set(tokens);
      }
      const profile = await api.profile();
      setUser(profile);
      
      // Check if email verification is needed and redirect if necessary
      if (res.needsEmailVerification && typeof window !== 'undefined') {
        // Redirect to verify-email page after a short delay to allow state update
        setTimeout(() => {
          window.location.href = '/verify-email';
        }, 500);
      }
      
      return profile;
    },
    []
  );

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await api.register(payload);
    const rawRes = res as unknown as { accessToken?: string; refreshToken?: string };
    const tokens = res.tokens || { accessToken: rawRes.accessToken || "", refreshToken: rawRes.refreshToken || "" };
    if (tokens.accessToken && tokens.refreshToken) {
      tokenStore.set(tokens);
    }
    const profile = await api.profile();
    setUser(profile);
    
    // Check if email verification is needed and redirect if necessary
    if (res.needsEmailVerification && typeof window !== 'undefined') {
      // Redirect to verify-email page after a short delay to allow state update
      setTimeout(() => {
        window.location.href = '/verify-email';
      }, 500);
    }
    
    return profile;
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    clearFollows();
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const profile = await loadProfile();
    setUser(profile);
  }, [loadProfile]);

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithSocial, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
