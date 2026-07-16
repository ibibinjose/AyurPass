import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Alert, RefreshControl, ScrollView, Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Badge, Body, Button, Display, EmptyState, ErrorNote, Loading } from "../../src/components/ui";
import { useAuth } from "../../src/auth";
import { api, formatMoney } from "../../src/api";
import type { Booking, BookingStatus } from "../../src/types";
import { colors, fonts, radius } from "../../src/theme";

const STATUS_TONE: Record<BookingStatus, "leaf" | "gold" | "muted"> = {
  PENDING: "gold",
  CONFIRMED: "leaf",
  IN_PROGRESS: "leaf",
  COMPLETED: "muted",
  CANCELLED: "muted",
  NO_SHOW: "muted",
};

function formatWhen(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function BookingRow({ booking, onPaid }: { booking: Booking; onPaid: () => void }) {
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canPay = booking.paymentStatus === "unpaid" && booking.status !== "CANCELLED";

  async function pay() {
    setPaying(true);
    setError(null);
    try {
      const result = await api.payBooking(booking.id);
      if (result.paymentStatus === "paid" || result.payment?.mock) {
        onPaid();
        return;
      }
      if (result.payment?.clientSecret) {
        Alert.alert(
          "Complete payment on web",
          "Card checkout is available on ayurpass.com for now. After paying, tap Confirm to refresh.",
          [
            { text: "Cancel", style: "cancel", onPress: () => setPaying(false) },
            {
              text: "Confirm paid",
              onPress: async () => {
                try {
                  await api.confirmBookingPayment(booking.id);
                  onPaid();
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Payment not confirmed yet.");
                  setPaying(false);
                }
              },
            },
          ],
        );
        return;
      }
      onPaid();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed.");
      setPaying(false);
    }
  }

  return (
    <View style={styles.card}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={styles.service} numberOfLines={2}>
            {booking.service?.name ?? "Session"}
          </Text>
          {booking.provider ? <Text style={styles.provider}>{booking.provider.businessName}</Text> : null}
        </View>
        <Badge tone={STATUS_TONE[booking.status]}>{booking.status.replace("_", " ").toLowerCase()}</Badge>
      </View>

      <View style={styles.metaRow}>
        <Ionicons name="calendar-outline" size={14} color={colors.inkMuted} />
        <Text style={styles.meta}>{formatWhen(booking.startTime)}</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.price}>{formatMoney(booking.totalAmount, "USD")}</Text>
        {booking.paymentStatus === "paid" ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name="checkmark-circle" size={16} color={colors.leaf} />
            <Text style={styles.paid}>Paid</Text>
          </View>
        ) : canPay ? (
          <Button title="Pay now" onPress={pay} loading={paying} style={{ paddingVertical: 9, paddingHorizontal: 18 }} />
        ) : null}
      </View>
      <ErrorNote message={error} />
    </View>
  );
}

export default function Bookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setError(null);
    try {
      setBookings(await api.bookingsByConsumer(user.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load bookings.");
      setBookings([]);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.leaf} />}
      >
        <Display>Your bookings</Display>
        <View style={{ marginTop: 20 }}>
          <ErrorNote message={error} />
          {bookings === null ? (
            <Loading />
          ) : bookings.length === 0 ? (
            <EmptyState title="No bookings yet" body="Explore sessions and book your first experience." />
          ) : (
            <View style={{ gap: 12 }}>
              {bookings.map((b) => (
                <BookingRow key={b.id} booking={b} onPaid={load} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.lg,
    padding: 16,
    gap: 10,
  },
  service: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.forest, lineHeight: 21 },
  provider: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSecondary, marginTop: 2 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  meta: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSecondary },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    paddingTop: 12,
  },
  price: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.foreground },
  paid: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.leaf },
});
