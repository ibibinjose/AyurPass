import { Pressable, Text, View } from "react-native";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

/**
 * Sticky offline / error retry strip for list screens.
 */
export function OfflineBanner({
  error,
  onRetry,
  retrying,
}: {
  error?: string | null;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  const online = useOnlineStatus();
  const showOffline = !online;
  const showError = online && Boolean(error);

  if (!showOffline && !showError) return null;

  return (
    <View
      className={`mb-3 rounded-md border px-3 py-2.5 ${
        showOffline
          ? "border-gold/40 bg-gold-soft/40"
          : "border-danger/25 bg-danger/10"
      }`}
      accessibilityRole="alert"
    >
      <Text
        className={`font-body-medium text-[13px] leading-[18px] ${
          showOffline ? "text-forest" : "text-danger"
        }`}
      >
        {showOffline
          ? "You're offline. Changes will load when you're back online."
          : error}
      </Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          disabled={retrying}
          className="mt-2 self-start active:opacity-70"
          hitSlop={8}
        >
          <Text
            className={`font-body-semi text-[13px] ${
              showOffline ? "text-forest" : "text-danger"
            }`}
          >
            {retrying ? "Retrying…" : "Retry"}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
