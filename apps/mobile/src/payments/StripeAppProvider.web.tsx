import type { ReactNode } from "react";
import { View } from "react-native";

/**
 * Web implementation of StripeAppProvider.
 * Avoids importing @stripe/stripe-react-native on Web to prevent bundling errors.
 */
export function StripeAppProvider({ children }: { children: ReactNode }) {
  return <View style={{ flex: 1 }}>{children}</View>;
}
