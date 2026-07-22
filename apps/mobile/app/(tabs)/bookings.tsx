import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Alert, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Badge, Button, Display, EmptyState, ErrorNote, Loading } from "../../src/components/ui";
import { useAuth } from "../../src/auth";
import { formatMoney } from "../../src/api";
import {
  useConfirmBookingPayment,
  useConsumerBookings,
  usePayBooking,
} from "../../src/hooks/useBookings";
import type { Booking, BookingStatus } from "../../src/types";
import { colors } from "../../src/theme";

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
  const paying = pay.isPending || confirm.isPending;
  const canPay = booking.paymentStatus === "unpaid" && booking.status !== "CANCELLED";

  async function onPay() {
    setError(null);
    try {
      const result = await pay.mutateAsync(booking.id);
      if (result.paymentStatus === "paid" || result.payment?.mock) {
        onSettled();
        return;
      }
      if (result.payment?.clientSecret) {
        Alert.alert(
          "Complete payment on web",
          "Card checkout is available on ayurpass.com for now. After paying, tap Confirm to refresh.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Confirm paid",
              onPress: async () => {
                try {
                  await confirm.mutateAsync(booking.id);
                  onSettled();
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Payment not confirmed yet.");
                }
              },
            },
          ],
        );
        return;
      }
      onSettled();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed.");
    }
  }

  return (
    <View className="gap-2.5 rounded-lg border border-hairline bg-surface p-4">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="font-body-semi text-base leading-[21px] text-forest" numberOfLines={2}>
            {booking.service?.name ?? "Session"}
          </Text>
          {booking.provider ? (
            <Text className="mt-0.5 font-body text-[13px] text-ink-secondary">
              {booking.provider.businessName}
            </Text>
          ) : null}
        </View>
        <Badge tone={STATUS_TONE[booking.status]}>
          {booking.status.replace("_", " ").toLowerCase()}
        </Badge>
      </View>

      <View className="flex-row items-center gap-1.5">
        <Ionicons name="calendar-outline" size={14} color={colors.inkMuted} />
        <Text className="font-body text-[13px] text-ink-secondary">{formatWhen(booking.startTime)}</Text>
      </View>

      <View className="flex-row items-center justify-between border-t border-hairline pt-3">
        <Text className="font-body-semi text-base text-foreground">
          {formatMoney(booking.totalAmount, "USD")}
        </Text>
        {booking.paymentStatus === "paid" ? (
          <View className="flex-row items-center gap-1">
            <Ionicons name="checkmark-circle" size={16} color={colors.leaf} />
            <Text className="font-body-medium text-[13px] text-leaf">Paid</Text>
          </View>
        ) : canPay ? (
          <Button
            title="Pay now"
            onPress={onPay}
            loading={paying}
            style={{ paddingVertical: 9, paddingHorizontal: 18 }}
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

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const bookings = data ?? [];
  const errMsg =
    error instanceof Error ? error.message : error ? "Couldn't load bookings." : null;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
            tintColor={colors.leaf}
          />
        }
      >
        <Display>Your bookings</Display>
        <View className="mt-5">
          <ErrorNote message={errMsg} />
          {isLoading && !data ? (
            <Loading />
          ) : bookings.length === 0 ? (
            <EmptyState
              title="No bookings yet"
              body="Explore sessions and book your first experience."
            />
          ) : (
            <View className="gap-3">
              {bookings.map((b) => (
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
      </ScrollView>
    </SafeAreaView>
  );
}
