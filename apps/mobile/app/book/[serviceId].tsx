import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Badge, Body, Button, EmptyState, ErrorNote, Loading, Title } from "../../src/components/ui";
import { useAuth } from "../../src/auth";
import { formatMoney } from "../../src/api";
import { useCreateBooking, useServiceDetail } from "../../src/hooks/useCatalogDetail";
import { useConfirmBookingPayment, usePayBooking } from "../../src/hooks/useBookings";
import { presentBookingPayment } from "../../src/payments/presentBookingPayment";
import { openGoogleCalendar } from "../../src/calendar";
import { scheduleLocalBookingReminder } from "../../src/notifications/push";
import type { Booking } from "../../src/types";
import { colors } from "../../src/theme";

export interface DayOption {
  date: Date;
  key: string; // YYYY-MM-DD
  label: string; // "Mon, 27 Jul"
  weekday: string; // "Mon"
  dayOfMonth: number;
}

export interface SlotOption {
  start: Date;
  label: string; // "9:30 AM"
}

function nextDays(count = 14): DayOption[] {
  const days: DayOption[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;
    days.push({
      date: d,
      key,
      label: d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }),
      weekday: d.toLocaleDateString(undefined, { weekday: "short" }),
      dayOfMonth: d.getDate(),
    });
  }
  return days;
}

const OPEN_HOUR = 8;
const CLOSE_HOUR = 19;

function slotsForDay(day: Date, durationMinutes: number): SlotOption[] {
  const slots: SlotOption[] = [];
  const now = new Date();
  for (let minutes = OPEN_HOUR * 60; minutes + durationMinutes <= CLOSE_HOUR * 60; minutes += 30) {
    const start = new Date(day);
    start.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
    if (start <= now) continue;
    slots.push({
      start,
      label: start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
    });
  }
  return slots;
}

const DIALS = [
  { dial: "+61", label: "🇦🇺 +61" },
  { dial: "+91", label: "🇮🇳 +91" },
  { dial: "+1", label: "🇺🇸 +1" },
  { dial: "+44", label: "🇬🇧 +44" },
  { dial: "+971", label: "🇦🇪 +971" },
  { dial: "+64", label: "🇳🇿 +64" },
  { dial: "+65", label: "🇸🇬 +65" },
  { dial: "+49", label: "🇩🇪 +49" },
];

export default function BookScreen() {
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const { data: service, isLoading } = useServiceDetail(serviceId);
  const createBooking = useCreateBooking(user?.id);
  const payBooking = usePayBooking(user?.id);
  const confirmPayment = useConfirmBookingPayment(user?.id);

  const days = useMemo(() => nextDays(14), []);
  const [dayKey, setDayKey] = useState(days[0].key);
  const [selectedSlot, setSelectedSlot] = useState<SlotOption | null>(null);
  const [notes, setNotes] = useState("");
  const [phoneDial, setPhoneDial] = useState("+61");
  const [phoneNational, setPhoneNational] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<Booking | null>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!user?.phone) return;
    const raw = user.phone.trim();
    const match = DIALS.find((d) => raw.startsWith(d.dial));
    if (match) {
      setPhoneDial(match.dial);
      setPhoneNational(raw.slice(match.dial.length).replace(/\D/g, ""));
    } else {
      setPhoneNational(raw.replace(/\D/g, ""));
    }
  }, [user?.phone]);

  const selectedDay = days.find((d) => d.key === dayKey) ?? days[0];
  const slots = useMemo(
    () => (service ? slotsForDay(selectedDay.date, service.durationMinutes) : []),
    [service, selectedDay],
  );

  const [prevDayKey, setPrevDayKey] = useState(dayKey);
  if (dayKey !== prevDayKey) {
    setPrevDayKey(dayKey);
    setSelectedSlot(null);
  }

  if (isLoading && service === undefined) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
        <Loading />
      </SafeAreaView>
    );
  }
  if (!service) {
    return (
      <SafeAreaView className="flex-1 bg-background p-5" edges={["bottom"]}>
        <EmptyState title="Service not found" />
      </SafeAreaView>
    );
  }

  async function confirm() {
    if (!user || !service) return;
    if (!selectedSlot) return setError("Please choose a time slot.");
    const digits = phoneNational.replace(/\D/g, "").replace(/^0+/, "");
    if (digits.length < 6) {
      return setError("Please enter a valid mobile number with country code.");
    }
    setError(null);

    const contactPhone = `${phoneDial}${digits}`;
    const start = selectedSlot.start;
    const end = new Date(start.getTime() + service.durationMinutes * 60_000);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    try {
      const booking = await createBooking.mutateAsync({
        consumerId: user.id,
        serviceId: service.id,
        providerId: service.providerId,
        professionalId: service.professionalId ?? undefined,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        timezone,
        notes: notes.trim() || undefined,
        contactPhone,
      });

      // Schedule local reminder 1 hour before
      const msUntil = start.getTime() - Date.now() - 60 * 60_000;
      const secondsFromNow = Math.max(60, Math.floor(msUntil / 1000));
      void scheduleLocalBookingReminder({
        title: "Upcoming AyurPass session",
        body: `${service.name} starts soon.`,
        secondsFromNow,
      });

      setConfirmed(booking as Booking);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create the booking.");
    }
  }

  async function handlePay() {
    if (!confirmed) return;
    setPaying(true);
    setError(null);
    try {
      const result = await payBooking.mutateAsync(confirmed.id);
      if (result.paymentStatus === "paid" || result.payment?.mock) {
        setConfirmed(result as Booking);
        setPaying(false);
        return;
      }

      const sheet = await presentBookingPayment(result);
      if (sheet.status === "paid_mock" || sheet.status === "paid_sheet") {
        try {
          const updated = await confirmPayment.mutateAsync(confirmed.id);
          setConfirmed(updated as Booking);
        } catch {
          setConfirmed({ ...confirmed, paymentStatus: "paid" });
        }
      } else if (sheet.status === "error") {
        setError(sheet.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed.");
    } finally {
      setPaying(false);
    }
  }

  // Render Post-Booking Confirmation View
  if (confirmed) {
    const whenFormatted = new Date(confirmed.startTime).toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    return (
      <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
          <View className="items-center rounded-3xl border border-hairline bg-surface p-6 text-center">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-forest">
              <Ionicons name="calendar" size={28} color={colors.goldSoft} />
            </View>
            <Title className="mt-4 text-center text-2xl">Booking requested</Title>
            <Text className="mt-2 text-center font-body text-sm text-ink-secondary">
              <Text className="font-body-semi text-foreground">{service.name}</Text>
              {service.provider ? ` at ${service.provider.businessName}` : ""}
            </Text>
            <Text className="mt-1 text-center font-body-semi text-base text-forest">
              {whenFormatted}
            </Text>

            <Text className="mt-3 text-center font-body text-xs text-ink-muted">
              The practice will confirm your slot shortly.
            </Text>

            {confirmed.paymentStatus === "paid" ? (
              <View className="mt-5 flex-row items-center gap-1.5 rounded-full bg-forest px-4 py-2">
                <Ionicons name="checkmark-circle" size={18} color="#fff" />
                <Text className="font-body-semi text-sm text-white">
                  Paid {formatMoney(confirmed.totalAmount ?? service.price, service.currency)}
                </Text>
              </View>
            ) : (
              <View className="mt-5 w-full gap-3 border-t border-hairline pt-4">
                <Text className="text-center font-body text-xs text-ink-secondary">
                  Pay online to guarantee your reservation or pay at venue.
                </Text>
                <ErrorNote message={error} />
                <Button
                  title={`Pay now (${formatMoney(confirmed.totalAmount ?? service.price, service.currency)})`}
                  onPress={handlePay}
                  loading={paying}
                />
              </View>
            )}

            <View className="mt-6 w-full gap-3">
              <Pressable
                onPress={() => void openGoogleCalendar(confirmed)}
                className="flex-row items-center justify-center gap-2 rounded-full border border-forest bg-forest/5 py-3"
              >
                <Ionicons name="calendar-outline" size={18} color={colors.forest} />
                <Text className="font-body-semi text-sm text-forest">Add to Google Calendar</Text>
              </Pressable>

              <Button
                title="View my bookings"
                onPress={() => router.replace("/(tabs)/bookings")}
                variant="ghost"
              />

              <Pressable
                onPress={() => router.replace("/(tabs)/explore")}
                className="items-center py-2"
              >
                <Text className="font-body-medium text-xs text-ink-muted">Book another session</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <Title>{service.name}</Title>
        <Body muted className="mt-0.5">
          {service.durationMinutes} min · {formatMoney(service.price, service.currency)}
        </Body>

        <Text className="mb-3 mt-6 font-body-semi text-[15px] text-forest">Choose a day</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {days.map((d) => {
            const active = d.key === dayKey;
            return (
              <Pressable
                key={d.key}
                onPress={() => setDayKey(d.key)}
                className={`items-center rounded-2xl border px-3.5 py-2.5 ${
                  active ? "border-forest bg-forest" : "border-hairline bg-surface"
                }`}
              >
                <Text
                  className={`font-body-medium text-[11px] uppercase ${
                    active ? "text-white" : "text-ink-muted"
                  }`}
                >
                  {d.weekday}
                </Text>
                <Text
                  className={`font-body-semi text-base ${active ? "text-white" : "text-foreground"}`}
                >
                  {d.dayOfMonth}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text className="mb-3 mt-6 font-body-semi text-[15px] text-forest">Choose a time</Text>
        {slots.length === 0 ? (
          <Text className="font-body text-sm text-ink-muted">
            No slots remaining on this day — please try another date.
          </Text>
        ) : (
          <View className="flex-row flex-wrap gap-2">
            {slots.map((s) => {
              const active = selectedSlot?.start.getTime() === s.start.getTime();
              return (
                <Pressable
                  key={s.start.toISOString()}
                  onPress={() => setSelectedSlot(s)}
                  className={`rounded-full border px-4 py-2.5 ${
                    active ? "border-forest bg-forest" : "border-hairline bg-surface"
                  }`}
                >
                  <Text
                    className={`font-body-medium text-sm ${
                      active ? "text-white" : "text-ink-secondary"
                    }`}
                  >
                    {s.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <Text className="mb-1.5 mt-6 font-body-semi text-[15px] text-forest">Mobile number</Text>
        <Text className="mb-3 font-body text-[12px] text-ink-muted">
          Required — country code + number so the practice can reach you.
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, marginBottom: 10 }}
        >
          {DIALS.map((d) => {
            const active = d.dial === phoneDial;
            return (
              <Pressable
                key={d.dial}
                onPress={() => setPhoneDial(d.dial)}
                className={`rounded-full border px-3 py-2 ${
                  active ? "border-forest bg-forest" : "border-hairline bg-surface"
                }`}
              >
                <Text
                  className={`font-body-medium text-[13px] ${
                    active ? "text-white" : "text-ink-secondary"
                  }`}
                >
                  {d.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <TextInput
          value={phoneNational}
          onChangeText={setPhoneNational}
          placeholder="412 345 678"
          placeholderTextColor={colors.inkMuted}
          keyboardType="phone-pad"
          className="min-h-12 rounded-md border border-hairline bg-surface px-3.5 font-body text-[16px] text-foreground"
        />

        <Text className="mb-3 mt-6 font-body-semi text-[15px] text-forest">
          Notes for the practitioner (optional)
        </Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Health notes, preferences, first visit…"
          placeholderTextColor={colors.inkMuted}
          multiline
          className="min-h-[90px] rounded-md border border-hairline bg-surface p-3.5 font-body text-[15px] text-foreground"
          textAlignVertical="top"
        />

        <View className="mt-6">
          <ErrorNote message={error} />
          <Button
            title={
              !selectedSlot
                ? "Select a time slot"
                : !phoneNational.trim()
                  ? "Enter mobile number"
                  : "Confirm booking"
            }
            onPress={confirm}
            disabled={!selectedSlot || !phoneNational.trim()}
            loading={createBooking.isPending}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
