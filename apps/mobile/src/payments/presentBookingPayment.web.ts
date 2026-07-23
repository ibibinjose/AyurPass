import type { BookingCheckout } from "../types";

export type PresentPaymentResult =
  | { status: "paid_mock" }
  | { status: "paid_sheet" }
  | { status: "canceled" }
  | { status: "unavailable"; reason: string }
  | { status: "error"; message: string };

/**
 * Web implementation of presentBookingPayment.
 * PaymentSheet is native-only; returns unavailable on Web without loading native Stripe.
 */
export async function presentBookingPayment(
  checkout: BookingCheckout,
): Promise<PresentPaymentResult> {
  if (checkout.paymentStatus === "paid" || checkout.payment?.mock) {
    return { status: "paid_mock" };
  }

  return {
    status: "unavailable",
    reason: "Native card checkout is not available on web. Use the website to pay.",
  };
}
