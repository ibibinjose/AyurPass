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
import { LinearGradient } from "expo-linear-gradient";
import type { Booking } from "../../src/types";
import { colors, fonts } from "../../src/theme";

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
      <SafeAreaView className="flex-1 bg-background" style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* Hero Header Banner */}
          <View style={{ position: "relative", overflow: "hidden", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, marginBottom: 16 }}>
            <LinearGradient
              colors={[colors.forestDeep, colors.forest, colors.leaf]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
            />

            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
              <View>
                <Text style={{ fontSize: 13, color: colors.goldSoft, fontFamily: fonts.bodySemi }}>
                  Booking Request Submitted ✨
                </Text>
                <Text style={{ fontSize: 24, fontFamily: fonts.display, color: colors.white, marginTop: 2 }}>
                  Reservation <Text style={{ color: colors.goldSoft }}>received</Text>
                </Text>
              </View>
              <View style={{ height: 44, width: 44, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "rgba(255,255,255,0.15)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" }}>
                <Ionicons name="checkmark-circle-outline" size={24} color={colors.goldSoft} />
              </View>
            </View>
          </View>

          <View style={{ paddingHorizontal: 20 }}>
            <View style={{ alignItems: "center", borderRadius: 24, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.surface, padding: 24 }}>
              <View style={{ height: 56, width: 56, alignItems: "center", justifyContent: "center", borderRadius: 999, backgroundColor: colors.forest }}>
                <Ionicons name="calendar" size={28} color={colors.goldSoft} />
              </View>
              <Title style={{ marginTop: 16, textAlign: "center", fontSize: 22, color: colors.forest }}>Booking requested</Title>
              <Text style={{ marginTop: 8, textAlign: "center", fontFamily: fonts.body, fontSize: 14, color: colors.inkSecondary }}>
                <Text style={{ fontFamily: fonts.bodySemi, color: colors.foreground }}>{service.name}</Text>
                {service.provider ? ` at ${service.provider.businessName}` : ""}
              </Text>
              <Text style={{ marginTop: 4, textAlign: "center", fontFamily: fonts.bodySemi, fontSize: 16, color: colors.forest }}>
                {whenFormatted}
              </Text>

              <Text style={{ marginTop: 12, textAlign: "center", fontFamily: fonts.body, fontSize: 12, color: colors.inkMuted }}>
                The practice will confirm your slot shortly.
              </Text>

              {confirmed.paymentStatus === "paid" ? (
                <View style={{ marginTop: 20, flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, backgroundColor: colors.forest, paddingHorizontal: 16, paddingVertical: 10 }}>
                  <Ionicons name="checkmark-circle" size={18} color="#fff" />
                  <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: colors.white }}>
                    Paid {formatMoney(confirmed.totalAmount ?? service.price, service.currency)}
                  </Text>
                </View>
              ) : (
                <View style={{ marginTop: 20, width: "100%", gap: 12, borderTopWidth: 1, borderTopColor: colors.hairline, paddingTop: 16 }}>
                  <Text style={{ textAlign: "center", fontFamily: fonts.body, fontSize: 13, color: colors.inkSecondary }}>
                    Pay online to guarantee your reservation or pay at venue.
                  </Text>
                  <ErrorNote message={error} />
                  <Button
                    title={`Pay now (${formatMoney(confirmed.totalAmount ?? service.price, service.currency)})`}
                    onPress={handlePay}
                    loading={paying}
                    style={{ backgroundColor: colors.forest, borderRadius: 999 }}
                  />
                </View>
              )}

              <View style={{ marginTop: 24, width: "100%", gap: 12 }}>
                <Pressable
                  onPress={() => void openGoogleCalendar(confirmed)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: colors.forest,
                    backgroundColor: "rgba(30,50,40,0.05)",
                    paddingVertical: 12,
                  }}
                >
                  <Ionicons name="calendar-outline" size={18} color={colors.forest} />
                  <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: colors.forest }}>Add to Google Calendar</Text>
                </Pressable>

                <Button
                  title="View my bookings"
                  onPress={() => router.replace("/(tabs)/bookings")}
                  variant="ghost"
                />

                <Pressable
                  onPress={() => router.replace("/(tabs)/explore")}
                  style={{ alignItems: "center", paddingVertical: 8 }}
                >
                  <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.inkMuted }}>Book another session</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header Banner */}
        <View style={{ position: "relative", overflow: "hidden", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, marginBottom: 16 }}>
          <LinearGradient
            colors={[colors.forestDeep, colors.forest, colors.leaf]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
          />

          <Pressable
            onPress={() => router.back()}
            style={{
              position: "absolute",
              left: 16,
              top: 16,
              zIndex: 20,
              height: 36,
              width: 36,
              borderRadius: 18,
              backgroundColor: "rgba(255,255,255,0.2)",
              alignItems: "center",
              justifyContent: "center",
            }}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={20} color={colors.white} />
          </Pressable>

          <View style={{ paddingTop: 32, zIndex: 10 }}>
            <Text style={{ fontSize: 13, color: colors.goldSoft, fontFamily: fonts.bodySemi }}>
              Schedule Reservation 📅
            </Text>
            <Text style={{ fontSize: 24, fontFamily: fonts.display, color: colors.white, marginTop: 2 }}>
              {service.name}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 6 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 10, paddingVertical: 4 }}>
                <Ionicons name="time-outline" size={13} color={colors.white} />
                <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.white }}>{service.durationMinutes} min</Text>
              </View>
              <Text style={{ fontFamily: fonts.display, fontSize: 18, color: colors.goldSoft }}>
                {formatMoney(service.price, service.currency)}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ marginBottom: 12, fontFamily: fonts.bodySemi, fontSize: 15, color: colors.forest }}>Choose a day</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {days.map((d) => {
              const active = d.key === dayKey;
              return (
                <Pressable
                  key={d.key}
                  onPress={() => setDayKey(d.key)}
                  style={{
                    alignItems: "center",
                    borderRadius: 16,
                    borderWidth: 1,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderColor: active ? colors.forest : colors.hairline,
                    backgroundColor: active ? colors.forest : colors.surface,
                    minWidth: 54,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: fonts.bodyMedium,
                      fontSize: 11,
                      textTransform: "uppercase",
                      color: active ? colors.goldSoft : colors.inkMuted,
                    }}
                  >
                    {d.weekday}
                  </Text>
                  <Text
                    style={{
                      fontFamily: fonts.bodySemi,
                      fontSize: 16,
                      marginTop: 2,
                      color: active ? colors.white : colors.foreground,
                    }}
                  >
                    {d.dayOfMonth}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={{ marginBottom: 12, marginTop: 24, fontFamily: fonts.bodySemi, fontSize: 15, color: colors.forest }}>Choose a time</Text>
          {slots.length === 0 ? (
            <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.inkMuted }}>
              No slots remaining on this day — please try another date.
            </Text>
          ) : (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {slots.map((s) => {
                const active = selectedSlot?.start.getTime() === s.start.getTime();
                return (
                  <Pressable
                    key={s.start.toISOString()}
                    onPress={() => setSelectedSlot(s)}
                    style={{
                      borderRadius: 999,
                      borderWidth: 1,
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderColor: active ? colors.forest : colors.hairline,
                      backgroundColor: active ? colors.forest : colors.surface,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: fonts.bodyMedium,
                        fontSize: 14,
                        color: active ? colors.white : colors.inkSecondary,
                      }}
                    >
                      {s.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          <Text style={{ marginBottom: 4, marginTop: 24, fontFamily: fonts.bodySemi, fontSize: 15, color: colors.forest }}>Mobile number</Text>
          <Text style={{ marginBottom: 12, fontFamily: fonts.body, fontSize: 12, color: colors.inkMuted }}>
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
                  style={{
                    borderRadius: 999,
                    borderWidth: 1,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderColor: active ? colors.forest : colors.hairline,
                    backgroundColor: active ? colors.forest : colors.surface,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: fonts.bodyMedium,
                      fontSize: 13,
                      color: active ? colors.white : colors.inkSecondary,
                    }}
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
            style={{
              minHeight: 48,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.hairline,
              backgroundColor: colors.surface,
              paddingHorizontal: 14,
              fontFamily: fonts.body,
              fontSize: 16,
              color: colors.foreground,
            }}
          />

          <Text style={{ marginBottom: 8, marginTop: 24, fontFamily: fonts.bodySemi, fontSize: 15, color: colors.forest }}>
            Notes for the practitioner (optional)
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Health notes, preferences, first visit…"
            placeholderTextColor={colors.inkMuted}
            multiline
            style={{
              minHeight: 90,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.hairline,
              backgroundColor: colors.surface,
              padding: 14,
              fontFamily: fonts.body,
              fontSize: 15,
              color: colors.foreground,
            }}
            textAlignVertical="top"
          />

          <View style={{ marginTop: 24 }}>
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
              style={{ backgroundColor: colors.forest, borderRadius: 999 }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
