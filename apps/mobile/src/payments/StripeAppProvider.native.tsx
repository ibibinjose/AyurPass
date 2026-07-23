import type { ReactNode } from "react";
import { View } from "react-native";
import { StripeProvider } from "@stripe/stripe-react-native";
import { usePaymentMode } from "../hooks/useCatalogDetail";

/**
 * Native (iOS/Android) implementation of StripeAppProvider.
 * Wraps the app with StripeProvider when a publishable key is available.
 */
export function StripeAppProvider({ children }: { children: ReactNode }) {
  const { data } = usePaymentMode();
  const publishableKey = data?.publishableKey?.trim() || "";
  const key = publishableKey || "pk_test_placeholder";

  return (
    <StripeProvider publishableKey={key} urlScheme="ayurpass">
      <View style={{ flex: 1 }}>{children}</View>
    </StripeProvider>
  );
}
