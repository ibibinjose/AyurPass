import { Linking } from "react-native";
import type { Booking } from "./types";

function icsDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/**
 * Generate a Google Calendar Web Template URL for a booking.
 */
export function getGoogleCalendarUrl(booking: Booking): string {
  const title = booking.service?.name ?? "AyurPass Session";
  const location = booking.provider?.businessName ?? "AyurPass";
  const description = [
    booking.professional?.user?.fullName && `Practitioner: ${booking.professional.user.fullName}`,
    booking.notes && `Notes: ${booking.notes}`,
    `Booked via AyurPass (${booking.id})`,
  ]
    .filter(Boolean)
    .join("\n");

  const startUtc = icsDate(booking.startTime);
  const endUtc = icsDate(booking.endTime);
  const dates = `${startUtc}/${endUtc}`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates,
    details: description,
    location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Opens Google Calendar directly in browser/app to save event.
 */
export async function openGoogleCalendar(booking: Booking): Promise<void> {
  const url = getGoogleCalendarUrl(booking);
  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
  } else {
    await Linking.openURL(url);
  }
}
