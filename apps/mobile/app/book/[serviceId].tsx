import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Body, Button, EmptyState, ErrorNote, Loading, Title } from "../../src/components/ui";
import { useAuth } from "../../src/auth";
import { formatMoney } from "../../src/api";
import { useCreateBooking, useServiceDetail } from "../../src/hooks/useCatalogDetail";
import { scheduleLocalBookingReminder } from "../../src/notifications/push";
import { colors } from "../../src/theme";

const SLOT_HOURS = [9, 12, 15, 18];

function buildDays() {
  const days: { key: string; label: string; date: Date }[] = [];
  const now = new Date();
  for (let i = 1; i <= 5; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    days.push({
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }),
      date: d,
    });
  }
  return days;
}

export default function BookScreen() {
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const { data: service, isLoading } = useServiceDetail(serviceId);
  const createBooking = useCreateBooking(user?.id);
  const days = useMemo(buildDays, []);
  const [dayKey, setDayKey] = useState(days[0].key);
  const [hour, setHour] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [phoneDial, setPhoneDial] = useState("+61");
  const [phoneNational, setPhoneNational] = useState("");
  const [error, setError] = useState<string | null>(null);

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
    if (hour === null) return setError("Please choose a time.");
    const digits = phoneNational.replace(/\D/g, "").replace(/^0+/, "");
    if (digits.length < 6) {
      return setError("Please enter a valid mobile number with country code.");
    }
    setError(null);

    const contactPhone = `${phoneDial}${digits}`;
    const day = days.find((d) => d.key === dayKey)!;
    const start = new Date(day.date);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start.getTime() + service.durationMinutes * 60_000);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    try {
      await createBooking.mutateAsync({
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

      // Local reminder ~1 hour before (or 1 min for near-term demo slots).
      const msUntil = start.getTime() - Date.now() - 60 * 60_000;
      const secondsFromNow = Math.max(60, Math.floor(msUntil / 1000));
      void scheduleLocalBookingReminder({
        title: "Upcoming AyurPass session",
        body: `${service.name} starts soon.`,
        secondsFromNow,
      });

      Alert.alert(
        "Booking requested",
        "Your session is reserved. Pay from the Bookings tab to confirm it.",
        [{ text: "View bookings", onPress: () => router.replace("/(tabs)/bookings") }],
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create the booking.");
    }
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
                className={`rounded-full border px-4 py-2.5 ${
                  active ? "border-forest bg-forest" : "border-hairline bg-surface"
                }`}
              >
                <Text
                  className={`font-body-medium text-sm ${active ? "text-white" : "text-ink-secondary"}`}
                >
                  {d.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text className="mb-3 mt-6 font-body-semi text-[15px] text-forest">Choose a time</Text>
        <View className="flex-row flex-wrap gap-2">
          {SLOT_HOURS.map((h) => {
            const active = h === hour;
            const label = `${((h + 11) % 12) + 1}:00 ${h < 12 ? "AM" : "PM"}`;
            return (
              <Pressable
                key={h}
                onPress={() => setHour(h)}
                className={`rounded-full border px-[18px] py-2.5 ${
                  active ? "border-forest bg-forest" : "border-hairline bg-surface"
                }`}
              >
                <Text
                  className={`font-body-medium text-sm ${active ? "text-white" : "text-ink-secondary"}`}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

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

        <View className="mt-5">
          <ErrorNote message={error} />
          <Button title="Confirm booking" onPress={confirm} loading={createBooking.isPending} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
