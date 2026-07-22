import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { Platform } from "react-native";
import { api } from "../api";
import { useAuth } from "../auth";
import { registerForPushNotificationsAsync } from "./push";

/**
 * Registers for push when authenticated, syncs Expo token to API,
 * and routes notification taps into the app.
 */
export function PushBootstrap() {
  const router = useRouter();
  const { user } = useAuth();
  const responseSub = useRef<Notifications.EventSubscription | null>(null);
  const lastSynced = useRef<string | null>(null);

  useEffect(() => {
    if (Platform.OS === "web") return;

    responseSub.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as {
        path?: string;
        bookingId?: string;
      };
      if (data?.path && typeof data.path === "string") {
        router.push(data.path as never);
        return;
      }
      if (data?.bookingId) {
        router.push("/(tabs)/bookings");
      }
    });

    return () => {
      responseSub.current?.remove();
    };
  }, [router]);

  useEffect(() => {
    if (Platform.OS === "web" || !user) return;

    let cancelled = false;
    void (async () => {
      const reg = await registerForPushNotificationsAsync();
      if (cancelled || !reg.token) return;
      if (__DEV__) console.log("[AyurPass] Expo push token:", reg.token);
      if (lastSynced.current === reg.token) return;
      try {
        await api.registerDevice(
          reg.token,
          Platform.OS === "ios" || Platform.OS === "android" ? Platform.OS : undefined,
        );
        lastSynced.current = reg.token;
      } catch (err) {
        if (__DEV__) console.warn("[AyurPass] device token sync failed", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return null;
}
