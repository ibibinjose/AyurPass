/**
 * Push helpers — stubbed until Push Notifications is enabled on the
 * Apple App ID (com.passionarc.ayurpass) and expo-notifications is re-added.
 */

export type PushRegistration = {
  token: string | null;
  status: "granted" | "denied" | "undetermined" | "unsupported" | "error";
  message?: string;
};

export async function registerForPushNotificationsAsync(): Promise<PushRegistration> {
  return {
    token: null,
    status: "unsupported",
    message:
      "Push disabled for this build. Enable Push on the App ID, reinstall expo-notifications, then rebuild.",
  };
}

export async function scheduleLocalBookingReminder(_input: {
  title: string;
  body: string;
  secondsFromNow: number;
}): Promise<string | null> {
  return null;
}
