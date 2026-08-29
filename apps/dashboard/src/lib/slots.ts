/** Booking-slot helpers: a simple 30-minute grid over the venue's working day. */

export interface DayOption {
  date: Date;
  iso: string; // YYYY-MM-DD
  weekday: string; // "Mon"
  dayOfMonth: number;
  month: string; // "Jul"
  isToday: boolean;
}

export function nextDays(count = 14): DayOption[] {
  const days: DayOption[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    days.push({
      date: d,
      iso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate(),
      ).padStart(2, "0")}`,
      weekday: d.toLocaleDateString(undefined, { weekday: "short" }),
      dayOfMonth: d.getDate(),
      month: d.toLocaleDateString(undefined, { month: "short" }),
      isToday: i === 0,
    });
  }
  return days;
}

export interface SlotOption {
  start: Date;
  label: string; // "9:30 AM"
}

const OPEN_HOUR = 8;
const CLOSE_HOUR = 19;

/** Start times on a grid such that start + duration + bufferMinutes fits before closing. */
export function slotsForDay(day: Date, durationMinutes: number, bufferMinutes = 0): SlotOption[] {
  const slots: SlotOption[] = [];
  const now = new Date();
  const totalOccupied = durationMinutes + bufferMinutes;
  for (let minutes = OPEN_HOUR * 60; minutes + totalOccupied <= CLOSE_HOUR * 60; minutes += 30) {
    const start = new Date(day);
    start.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
    if (start <= now) continue; // no past slots
    slots.push({
      start,
      label: start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
    });
  }
  return slots;
}
