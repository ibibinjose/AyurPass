import type { Booking } from "./types";

function icsDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function esc(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/** Build an RFC 5545 calendar event for a booking and trigger a download. */
export function downloadBookingIcs(booking: Booking) {
  const title = booking.service?.name ?? "Wellness session";
  const location = booking.provider?.businessName ?? "AyurPass";
  const description = [
    booking.professional?.user?.fullName && `Practitioner: ${booking.professional.user.fullName}`,
    booking.room?.name && `Room: ${booking.room.name}`,
    booking.notes && `Notes: ${booking.notes}`,
    `Booked via AyurPass (${booking.id})`,
  ]
    .filter(Boolean)
    .join("\n");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AyurPass//Bookings//EN",
    "BEGIN:VEVENT",
    `UID:${booking.id}@ayurpass`,
    `DTSTAMP:${icsDate(new Date().toISOString())}`,
    `DTSTART:${icsDate(booking.startTime)}`,
    `DTEND:${icsDate(booking.endTime)}`,
    `SUMMARY:${esc(title)}`,
    `LOCATION:${esc(location)}`,
    `DESCRIPTION:${esc(description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ayurpass-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
