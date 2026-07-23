import type { ReactNode } from "react";
import { View } from "react-native";
import { StripeProvider } from "@stripe/stripe-react-native";
import { usePaymentMode } from "../hooks/useCatalogDetail";

function looksLikeStripeKey(key: string): boolean {
  return /^pk_(test|live)_/.test(key) && !key.includes("REPLACE") && !key.includes("placeholder");
}

/**
 * Native Stripe wrapper. Only mounts StripeProvider when a real publishable key
 * is available — a fake placeholder key can crash or blank the UI on device.
 */
export function StripeAppProvider({ children }: { children: ReactNode }) {
  const { data } = usePaymentMode();
  const key = data?.publishableKey?.trim() || "";

  if (!looksLikeStripeKey(key)) {
    return <View style={{ flex: 1 }}>{children}</View>;
  }

  return (
    <StripeProvider publishableKey={key} urlScheme="ayurpass">
      <View style={{ flex: 1 }}>{children}</View>
    </StripeProvider>
  );
}
