import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type PushRegistration = {
  token: string | null;
  status: "granted" | "denied" | "undetermined" | "unsupported" | "error";
  message?: string;
};

function permissionGranted(settings: { granted?: boolean; status?: string }): boolean {
  if (typeof settings.granted === "boolean") return settings.granted;
  return settings.status === "granted";
}

/**
 * Request notification permission and return Expo push token (when available).
 * Requires a physical device + development/production build for remote push.
 */
export async function registerForPushNotificationsAsync(): Promise<PushRegistration> {
  if (Platform.OS === "web") {
    return { token: null, status: "unsupported", message: "Web push not configured." };
  }

  if (!Device.isDevice) {
    return {
      token: null,
      status: "unsupported",
      message: "Push notifications require a physical device.",
    };
  }

  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "AyurPass",
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#1e3228",
      });
    }

    const current = await Notifications.getPermissionsAsync();
    let settings = current as { granted?: boolean; status?: string };
    if (!permissionGranted(settings)) {
      const requested = await Notifications.requestPermissionsAsync();
      settings = requested as { granted?: boolean; status?: string };
    }

    if (!permissionGranted(settings)) {
      return { token: null, status: "denied" };
    }

    const extra = Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined;
    const projectId =
      extra?.eas?.projectId ??
      (Constants as { easConfig?: { projectId?: string } }).easConfig?.projectId;

    const tokenResult = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );

    return { token: tokenResult.data, status: "granted" };
  } catch (err) {
    return {
      token: null,
      status: "error",
      message: err instanceof Error ? err.message : "Push registration failed.",
    };
  }
}

/** Local reminder helper (works without remote push backend). */
export async function scheduleLocalBookingReminder(input: {
  title: string;
  body: string;
  /** Seconds from now */
  secondsFromNow: number;
}): Promise<string | null> {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: input.title,
        body: input.body,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(5, Math.floor(input.secondsFromNow)),
        repeats: false,
      },
    });
    return id;
  } catch {
    return null;
  }
}
