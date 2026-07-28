import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, tokenStore } from "./api";
import type { RegisterPayload, UserProfile } from "./types";
import { Alert } from "react-native"; // Added for showing verification alerts

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  loginWithSocial: (
    provider: "google" | "apple",
    payload: { email: string; name?: string; idToken?: string }
  ) => Promise<UserProfile>;
  register: (payload: RegisterPayload) => Promise<UserProfile>;
  logout: () => Promise<void>;
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
      const refresh = tokenStore.refresh;
      if (!refresh) return null;
      try {
        await tokenStore.set(await api.refresh(refresh));
        return await api.profile();
      } catch {
        await tokenStore.clear();
        return null;
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await tokenStore.load();
      const profile = await loadProfile();
      if (!cancelled) {
        setUser(profile);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadProfile]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password);
    const rawRes = res as unknown as { accessToken?: string; refreshToken?: string };
    const tokens = res.tokens || {
      accessToken: rawRes.accessToken || "",
      refreshToken: rawRes.refreshToken || "",
    };
    if (tokens.accessToken && tokens.refreshToken) {
      await tokenStore.set(tokens);
    }
    const profile = await api.profile();
    setUser(profile);
    
    // Check if email verification is needed
    if (res.needsEmailVerification) {
      Alert.alert(
        "Email Verification Needed",
        "Please verify your email address before continuing. Check your inbox for a verification link.",
        [{ text: "OK" }]
      );
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
      const tokens = res.tokens || {
        accessToken: rawRes.accessToken || "",
        refreshToken: rawRes.refreshToken || "",
      };
      if (tokens.accessToken && tokens.refreshToken) {
        await tokenStore.set(tokens);
      }
      const profile = await api.profile();
      setUser(profile);
      return profile;
    },
    []
  );

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await api.register(payload);
    const rawRes = res as unknown as { accessToken?: string; refreshToken?: string };
    const tokens = res.tokens || {
      accessToken: rawRes.accessToken || "",
      refreshToken: rawRes.refreshToken || "",
    };
    if (tokens.accessToken && tokens.refreshToken) {
      await tokenStore.set(tokens);
    }
    const profile = await api.profile();
    setUser(profile);
    
    if (res.needsEmailVerification) {
      Alert.alert(
        "Email Verification Needed",
        "Please verify your email address before continuing. Check your inbox for a verification link.",
        [{ text: "OK" }]
      );
    }
    
    return profile;
  }, []);

  const logout = useCallback(async () => {
    await tokenStore.clear();
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    setUser(await loadProfile());
  }, [loadProfile]);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, loginWithSocial, register, logout, refreshProfile }}
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
