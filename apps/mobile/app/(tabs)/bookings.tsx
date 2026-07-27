import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Alert, Linking, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Badge,
  Button,
  EmptyState,
  ErrorNote,
  Loading,
} from "../../src/components/ui";
import { OfflineBanner } from "../../src/components/OfflineBanner";
import { useAuth } from "../../src/auth";
import { formatMoney } from "../../src/api";
import { openGoogleCalendar } from "../../src/calendar";
import {
  colorForServiceCategory,
  SERVICE_CATEGORY_LABEL,
  softColorForServiceCategory,
} from "../../src/catalog";
import {
  useConfirmBookingPayment,
  useConsumerBookings,
  usePayBooking,
} from "../../src/hooks/useBookings";
import { usePaymentMode } from "../../src/hooks/useCatalogDetail";
import { presentBookingPayment } from "../../src/payments/presentBookingPayment";
import type { Booking, BookingStatus, ServiceCategory } from "../../src/types";
import { colors, fonts } from "../../src/theme";

const WEB_BOOKINGS_URL =
  process.env.EXPO_PUBLIC_WEB_URL?.replace(/\/$/, "") || "https://ayurpass.com";

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

function BookingRow({
  booking,
  userId,
  onSettled,
}: {
  booking: Booking;
  userId: string | undefined;
  onSettled: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const pay = usePayBooking(userId);
  const confirm = useConfirmBookingPayment(userId);
  const paymentMode = usePaymentMode();
  const paying = pay.isPending || confirm.isPending;
  const canPay = booking.paymentStatus === "unpaid" && booking.status !== "CANCELLED";

  const cat = booking.service?.category as ServiceCategory | undefined;
  const color = colorForServiceCategory(cat);
  const soft = softColorForServiceCategory(cat);
  const label = cat ? SERVICE_CATEGORY_LABEL[cat] : "Session";

  async function openWebCheckout() {
    await Linking.openURL(`${WEB_BOOKINGS_URL}/dashboard/bookings`);
  }

  async function onPay() {
    setError(null);
    try {
      const result = await pay.mutateAsync(booking.id);
      if (result.paymentStatus === "paid" || result.payment?.mock) {
        onSettled();
        return;
      }

      const sheet = await presentBookingPayment(result);
      if (sheet.status === "paid_mock" || sheet.status === "paid_sheet") {
        try {
          await confirm.mutateAsync(booking.id);
        } catch {
          // Webhook may already mark paid — still refresh list.
        }
        onSettled();
        return;
      }
      if (sheet.status === "canceled") return;
      if (sheet.status === "error") {
        setError(sheet.message);
        return;
      }

      const modeHint =
        paymentMode.data?.mock === false
          ? "Open web checkout to pay securely with Stripe."
          : "Card checkout opens in the browser. After paying, return here and confirm.";
      Alert.alert("Complete payment", `${sheet.reason}\n\n${modeHint}`, [
        { text: "Cancel", style: "cancel" },
        { text: "Open web checkout", onPress: () => void openWebCheckout() },
        {
          text: "I've paid — refresh",
          onPress: async () => {
            try {
              await confirm.mutateAsync(booking.id);
              onSettled();
            } catch (err) {
              setError(err instanceof Error ? err.message : "Payment not confirmed yet.");
            }
          },
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed.");
    }
  }

  return (
    <View
      style={{
        borderLeftWidth: 4,
        borderLeftColor: color,
        backgroundColor: soft,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.hairline,
        padding: 16,
        gap: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <View style={{ backgroundColor: color, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
              <Text style={{ fontSize: 10, fontFamily: fonts.bodySemi, color: colors.white, textTransform: "uppercase" }}>
                {label}
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 16, fontFamily: fonts.bodySemi, color: colors.forest, lineHeight: 22 }} numberOfLines={2}>
            {booking.service?.name ?? "Session"}
          </Text>
          {booking.provider ? (
            <Text style={{ marginTop: 2, fontSize: 13, fontFamily: fonts.body, color: colors.inkSecondary }}>
              {booking.provider.businessName}
            </Text>
          ) : null}
        </View>
        <Badge tone={STATUS_TONE[booking.status]}>
          {booking.status.replace("_", " ").toLowerCase()}
        </Badge>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Ionicons name="calendar-outline" size={14} color={colors.inkMuted} />
          <Text style={{ fontSize: 13, fontFamily: fonts.body, color: colors.inkSecondary }}>
            {formatWhen(booking.startTime)}
          </Text>
        </View>

        {booking.status !== "CANCELLED" ? (
          <Pressable
            onPress={() => void openGoogleCalendar(booking)}
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            hitSlop={8}
          >
            <Ionicons name="calendar" size={14} color={colors.leaf} />
            <Text style={{ fontSize: 12, fontFamily: fonts.bodyMedium, color: colors.leaf }}>Add to Calendar</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: colors.hairline, paddingTop: 10, marginTop: 2 }}>
        <Text style={{ fontSize: 16, fontFamily: fonts.bodySemi, color: colors.foreground }}>
          {formatMoney(booking.totalAmount, booking.service?.currency || "AUD")}
        </Text>
        {booking.paymentStatus === "paid" ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name="checkmark-circle" size={16} color={colors.leaf} />
            <Text style={{ fontSize: 13, fontFamily: fonts.bodyMedium, color: colors.leaf }}>Paid</Text>
          </View>
        ) : canPay ? (
          <Button
            title="Pay now"
            onPress={onPay}
            loading={paying}
            style={{ paddingVertical: 8, paddingHorizontal: 16 }}
          />
        ) : null}
      </View>
      <ErrorNote message={error} />
    </View>
  );
}

export default function Bookings() {
  const { user } = useAuth();
  const { data, error, isLoading, refetch, isRefetching } = useConsumerBookings(user?.id);
  const [tab, setTab] = useState<"upcoming" | "past" | "all">("upcoming");

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const bookings = data ?? [];
  const errMsg =
    error instanceof Error ? error.message : error ? "Couldn't load bookings." : null;

  const now = new Date();
  const filteredBookings = bookings.filter((b) => {
    const bookingDate = new Date(b.startTime);
    if (tab === "upcoming") return bookingDate >= now && b.status !== "CANCELLED";
    if (tab === "past") return bookingDate < now || b.status === "COMPLETED" || b.status === "CANCELLED";
    return true;
  });

  return (
    <SafeAreaView className="flex-1 bg-background" style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
            tintColor={colors.leaf}
          />
        }
      >
        {/* Hero Header Banner */}
        <View style={{ position: "relative", overflow: "hidden", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}>
          <LinearGradient
            colors={[colors.forestDeep, colors.forest, colors.leaf]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
          />

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
            <View>
              <Text style={{ fontSize: 13, color: colors.goldSoft, fontFamily: fonts.bodySemi }}>
                AyurPass Sessions 🗓️
              </Text>
              <Text style={{ fontSize: 26, fontFamily: fonts.display, color: colors.white, marginTop: 2 }}>
                My <Text style={{ color: colors.goldSoft }}>bookings</Text>
              </Text>
            </View>
            <View style={{ height: 44, width: 44, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "rgba(255,255,255,0.15)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" }}>
              <Ionicons name="bookmark-outline" size={22} color={colors.goldSoft} />
            </View>
          </View>
        </View>

        {/* Content Container */}
        <View style={{ marginTop: -12, paddingHorizontal: 20 }}>
          {/* Filter Segmented Control */}
          <View style={{ flexDirection: "row", borderRadius: 999, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.surface, padding: 4 }}>
            {(["upcoming", "past", "all"] as const).map((t) => {
              const active = tab === t;
              return (
                <Pressable
                  key={t}
                  onPress={() => setTab(t)}
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 999,
                    paddingVertical: 8,
                    backgroundColor: active ? colors.forest : "transparent",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: fonts.bodySemi,
                      textTransform: "capitalize",
                      color: active ? colors.white : colors.inkSecondary,
                    }}
                  >
                    {t}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={{ marginTop: 14 }}>
            <OfflineBanner
              error={errMsg}
              onRetry={() => void refetch()}
              retrying={isRefetching}
            />
            {isLoading && !data ? (
              <Loading label="Loading your sessions…" />
            ) : filteredBookings.length === 0 && !errMsg ? (
              <EmptyState
                title={tab === "upcoming" ? "No upcoming bookings" : "No bookings found"}
                body={
                  tab === "upcoming"
                    ? "Explore top practitioners and book your next session."
                    : "Your session history will appear here."
                }
              />
            ) : (
              <View style={{ gap: 12 }}>
                {filteredBookings.map((b) => (
                  <BookingRow
                    key={b.id}
                    booking={b}
                    userId={user?.id}
                    onSettled={() => void refetch()}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
