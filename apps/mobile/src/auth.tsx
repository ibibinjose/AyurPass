import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { api, ApiError, tokenStore } from "./api";
import type { RegisterPayload, UserProfile } from "./types";

type SessionState = "loading" | "authenticated" | "unauthenticated" | "unavailable";

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  sessionState: SessionState;
  login: (email: string, password: string) => Promise<UserProfile>;
  loginWithSocial: (
    provider: "google" | "apple",
    payload: { email: string; name?: string; idToken?: string }
  ) => Promise<UserProfile>;
  register: (payload: RegisterPayload) => Promise<UserProfile>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  retrySession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>("loading");
  const loading = sessionState === "loading";

  const restoreSession = useCallback(async () => {
    setSessionState("loading");
    await tokenStore.load();

    if (!tokenStore.access) {
      setUser(null);
      setSessionState("unauthenticated");
      return;
    }

    try {
      const profile = await api.profile();
      setUser(profile);
      setSessionState("authenticated");
    } catch (error) {
      if (error instanceof ApiError && error.isUnauthorized) {
        await tokenStore.clear();
        setUser(null);
        setSessionState("unauthenticated");
        return;
      }

      // Do not discard a valid persisted session because the device is offline
      // or the API is temporarily unavailable.
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
  }) => {
    const tokens = result.tokens || {
      accessToken: result.accessToken || "",
      refreshToken: result.refreshToken || "",
    };
    if (!tokens.accessToken || !tokens.refreshToken) {
      throw new Error("The server did not return a complete session. Please try signing in again.");
    }

    await tokenStore.set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
    const profile = await api.profile();
    setUser(profile);
    setSessionState("authenticated");
    return profile;
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await api.login(email, password);
      const profile = await establishSession(result);
      if (result.needsEmailVerification) {
        Alert.alert(
          "Email verification needed",
          "Please verify your email address before continuing. Check your inbox for a verification link."
        );
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
      return establishSession(result);
    },
    [establishSession]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const result = await api.register(payload);
      const profile = await establishSession(result);
      if (result.needsEmailVerification) {
        Alert.alert(
          "Email verification needed",
          "Please verify your email address before continuing. Check your inbox for a verification link."
        );
      }
      return profile;
    },
    [establishSession]
  );

  const logout = useCallback(async () => {
    await tokenStore.clear();
    setUser(null);
    setSessionState("unauthenticated");
  }, []);

  const refreshProfile = useCallback(async () => {
    await restoreSession();
  }, [restoreSession]);

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
