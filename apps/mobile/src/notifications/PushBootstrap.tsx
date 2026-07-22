import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { Platform } from "react-native";
import { registerForPushNotificationsAsync } from "./push";

/**
 * Registers for push on mount and routes notification taps into the app.
 * Token is logged in __DEV__; wire to API when a device-token endpoint ships.
 */
export function PushBootstrap() {
  const router = useRouter();
  const responseSub = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (Platform.OS === "web") return;

    let cancelled = false;
    void (async () => {
      const reg = await registerForPushNotificationsAsync();
      if (cancelled) return;
      if (__DEV__ && reg.token) {
        console.log("[AyurPass] Expo push token:", reg.token);
      }
    })();

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
        return;
      }
    });

    return () => {
      cancelled = true;
      responseSub.current?.remove();
    };
  }, [router]);

  return null;
}
