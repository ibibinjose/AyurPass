import { initPaymentSheet, presentPaymentSheet } from "@stripe/stripe-react-native";
import type { BookingCheckout } from "../types";

export type PresentPaymentResult =
  | { status: "paid_mock" }
  | { status: "paid_sheet" }
  | { status: "canceled" }
  | { status: "unavailable"; reason: string }
  | { status: "error"; message: string };

/**
 * Native (iOS/Android) implementation of presentBookingPayment.
 * Presents native Stripe PaymentSheet for a booking checkout response.
 */
export async function presentBookingPayment(
  checkout: BookingCheckout,
): Promise<PresentPaymentResult> {
  if (checkout.paymentStatus === "paid" || checkout.payment?.mock) {
    return { status: "paid_mock" };
  }

  const clientSecret = checkout.payment?.clientSecret;
  const publishableKey = checkout.payment?.publishableKey;

  if (!clientSecret) {
    return {
      status: "unavailable",
      reason: "No payment intent returned. Try again or pay on the website.",
    };
  }

  if (!publishableKey) {
    return {
      status: "unavailable",
      reason: "Stripe publishable key missing from checkout response.",
    };
  }

  try {
    const { error: initError } = await initPaymentSheet({
      merchantDisplayName: "AyurPass",
      paymentIntentClientSecret: clientSecret,
      allowsDelayedPaymentMethods: false,
      returnURL: "ayurpass://stripe-redirect",
      defaultBillingDetails: {
        name: undefined,
      },
      appearance: {
        colors: {
          primary: "#1e3228",
          background: "#fffdf9",
          componentBackground: "#fffdf9",
          primaryText: "#1a1714",
          secondaryText: "#5c574e",
          componentBorder: "#ddd6c8",
          placeholderText: "#5c574e",
        },
      },
    });

    if (initError) {
      return {
        status: "error",
        message: initError.message ?? "Could not start card payment.",
      };
    }

    const { error: presentError } = await presentPaymentSheet();
    if (presentError) {
      if (presentError.code === "Canceled") {
        return { status: "canceled" };
      }
      return {
        status: "error",
        message: presentError.message ?? "Payment failed.",
      };
    }

    return { status: "paid_sheet" };
  } catch (err) {
    return {
      status: "error",
      message:
        err instanceof Error
          ? err.message
          : "Native payments require a dev/production build (not Expo Go).",
    };
  }
}
