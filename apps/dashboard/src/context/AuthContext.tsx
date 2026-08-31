"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, ApiError, tokenStore } from "@/lib/api";
import { clearFollows } from "@/lib/engagement";
import type { RegisterPayload, UserProfile } from "@/lib/types";

type SessionState = "loading" | "authenticated" | "unauthenticated" | "unavailable";

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  /** Distinguishes a real sign-out from a recoverable API/network outage. */
  sessionState: SessionState;
  login: (email: string, password: string) => Promise<UserProfile>;
  loginWithSocial: (
    provider: "google" | "apple",
    payload: { email: string; name?: string; idToken?: string }
  ) => Promise<UserProfile>;
  register: (payload: RegisterPayload) => Promise<UserProfile>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  retrySession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>("loading");
  const loading = sessionState === "loading";

  /**
   * Restore once at application startup. The API client refreshes an expired
   * access token automatically. We only clear storage after a definite token
   * rejection—not during a temporary server, CORS, or offline failure.
   */
  const restoreSession = useCallback(async () => {
    if (!tokenStore.access) {
      setUser(null);
      setSessionState("unauthenticated");
      return;
    }

    setSessionState("loading");
    try {
      const profile = await api.profile();
      setUser(profile);
      setSessionState("authenticated");
    } catch (error) {
      if (error instanceof ApiError && error.isUnauthorized) {
        tokenStore.clear();
        setUser(null);
        setSessionState("unauthenticated");
        return;
      }

      // Preserve local credentials and let the user retry. A 5xx/offline
      // response is not evidence that the session has expired.
      setSessionState("unavailable");
    }
  }, []);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  const establishSession = useCallback(async (result: {
    tokens?: { accessToken?: string; refreshToken?: string };
    accessToken?: string;
    refreshToken?: string;
    needsEmailVerification?: boolean;
  }) => {
    const tokens = result.tokens || {
      accessToken: result.accessToken || "",
      refreshToken: result.refreshToken || "",
    };
    if (!tokens.accessToken || !tokens.refreshToken) {
      throw new Error("The server did not return a complete session. Please try signing in again.");
    }

    tokenStore.set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
    const profile = await api.profile();
    setUser(profile);
    setSessionState("authenticated");
    return profile;
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await api.login(email, password);
      const profile = await establishSession(result);
      if (result.needsEmailVerification && typeof window !== "undefined") {
        window.setTimeout(() => {
          window.location.assign("/verify-email");
        }, 0);
      }
      return profile;
    },
    [establishSession]
  );

  const loginWithSocial = useCallback(
    async (
      provider: "google" | "apple",
      payload: { email: string; name?: string; idToken?: string }
    ) => {
      const result = await api.socialAuth(provider, payload);
      const profile = await establishSession(result);
      if (result.needsEmailVerification && typeof window !== "undefined") {
        window.setTimeout(() => {
          window.location.assign("/verify-email");
        }, 0);
      }
      return profile;
    },
    [establishSession]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const result = await api.register(payload);
      const profile = await establishSession(result);
      if (result.needsEmailVerification && typeof window !== "undefined") {
        window.setTimeout(() => {
          window.location.assign("/verify-email");
        }, 0);
      }
      return profile;
    },
    [establishSession]
  );

  const logout = useCallback(() => {
    tokenStore.clear();
    clearFollows();
    setUser(null);
    setSessionState("unauthenticated");
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!tokenStore.access) return;
    try {
      const profile = await api.profile();
      setUser(profile);
    } catch (error) {
      if (error instanceof ApiError && error.isUnauthorized) {
        tokenStore.clear();
        setUser(null);
        setSessionState("unauthenticated");
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        sessionState,
        login,
        loginWithSocial,
        register,
        logout,
        refreshProfile,
        retrySession: restoreSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
