import { useMemo, type ReactNode } from "react";
import { Platform, View } from "react-native";
import { StripeProvider } from "@stripe/stripe-react-native";
import { usePaymentMode } from "../hooks/useCatalogDetail";

/**
 * Wraps the app with StripeProvider when a publishable key is available.
 * On web, children render without the Stripe native bridge.
 */
export function StripeAppProvider({ children }: { children: ReactNode }) {
  const { data } = usePaymentMode();
  const publishableKey = data?.publishableKey?.trim() || "";
  const key = publishableKey || "pk_test_placeholder";

  const merchantIdentifier = useMemo(
    () => (Platform.OS === "ios" ? "merchant.com.thepassionarc.ayurpass" : undefined),
    [],
  );

  if (Platform.OS === "web") {
    return <View style={{ flex: 1 }}>{children}</View>;
  }

  return (
    <StripeProvider
      publishableKey={key}
      merchantIdentifier={merchantIdentifier}
      urlScheme="ayurpass"
    >
      <View style={{ flex: 1 }}>{children}</View>
    </StripeProvider>
  );
}
