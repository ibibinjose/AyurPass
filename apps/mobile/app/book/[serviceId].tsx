import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Body, Button, EmptyState, ErrorNote, Loading, Title } from "../../src/components/ui";
import { useAuth } from "../../src/auth";
import { api, formatMoney } from "../../src/api";
import type { Service } from "../../src/types";
import { colors, fonts, radius } from "../../src/theme";

const SLOT_HOURS = [9, 12, 15, 18];

/** Build the next 5 days, each with fixed candidate slots (demo availability). */
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
  const [service, setService] = useState<Service | null | undefined>(undefined);
  const days = useMemo(buildDays, []);
  const [dayKey, setDayKey] = useState(days[0].key);
  const [hour, setHour] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!serviceId) return;
    api.service(serviceId).then(setService).catch(() => setService(null));
  }, [serviceId]);

  if (service === undefined) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["bottom"]}>
        <Loading />
      </SafeAreaView>
    );
  }
  if (service === null) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: 20 }} edges={["bottom"]}>
        <EmptyState title="Service not found" />
      </SafeAreaView>
    );
  }

  async function confirm() {
    if (!user || !service) return;
    if (hour === null) return setError("Please choose a time.");
    setError(null);
    setBusy(true);

    const day = days.find((d) => d.key === dayKey)!;
    const start = new Date(day.date);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start.getTime() + service.durationMinutes * 60_000);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    try {
      await api.createBooking({
        consumerId: user.id,
        serviceId: service.id,
        providerId: service.providerId,
        professionalId: service.professionalId ?? undefined,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        timezone,
        notes: notes.trim() || undefined,
      });
      Alert.alert("Booking requested", "Your session is reserved. Pay from the Bookings tab to confirm it.", [
        { text: "View bookings", onPress: () => router.replace("/(tabs)/bookings") },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create the booking.");
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Title>{service.name}</Title>
        <Body muted style={{ marginTop: 2 }}>
          {service.durationMinutes} min · {formatMoney(service.price, service.currency)}
        </Body>

        <Text style={styles.section}>Choose a day</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {days.map((d) => {
            const active = d.key === dayKey;
            return (
              <Pressable key={d.key} onPress={() => setDayKey(d.key)} style={[styles.chip, active && styles.chipActive]}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{d.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.section}>Choose a time</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {SLOT_HOURS.map((h) => {
            const active = h === hour;
            const label = `${((h + 11) % 12) + 1}:00 ${h < 12 ? "AM" : "PM"}`;
            return (
              <Pressable key={h} onPress={() => setHour(h)} style={[styles.timeChip, active && styles.chipActive]}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.section}>Notes for the practitioner (optional)</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Health notes, preferences, first visit…"
          placeholderTextColor={colors.inkMuted}
          multiline
          style={styles.notes}
        />

        <View style={{ marginTop: 20 }}>
          <ErrorNote message={error} />
          <Button title="Confirm booking" onPress={confirm} loading={busy} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  section: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.forest, marginTop: 24, marginBottom: 12 },
  chip: {
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  timeChip: {
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  chipActive: { backgroundColor: colors.forest, borderColor: colors.forest },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.inkSecondary },
  chipTextActive: { color: colors.white },
  notes: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    padding: 14,
    minHeight: 90,
    textAlignVertical: "top",
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.foreground,
  },
});
