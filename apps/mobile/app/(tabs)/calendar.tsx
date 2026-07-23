import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Body, Display, EmptyState, Loading } from "../../src/components/ui";
import { OfflineBanner } from "../../src/components/OfflineBanner";
import { useAuth } from "../../src/auth";
import { formatMoney } from "../../src/api";
import {
  CALENDAR_CATEGORY_LEGEND,
  colorForServiceCategory,
  SERVICE_CATEGORY_LABEL,
  softColorForServiceCategory,
} from "../../src/catalog";
import { useConsumerBookings } from "../../src/hooks/useBookings";
import type { Booking, ServiceCategory } from "../../src/types";
import { colors, fonts } from "../../src/theme";

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDayLabel(d: Date) {
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function categoryOf(b: Booking): ServiceCategory | undefined {
  return b.service?.category as ServiceCategory | undefined;
}

function BookingEvent({ booking, onPress }: { booking: Booking; onPress: () => void }) {
  const cat = categoryOf(booking);
  const color = colorForServiceCategory(cat);
  const soft = softColorForServiceCategory(cat);
  const label = cat ? SERVICE_CATEGORY_LABEL[cat] : "Session";

  return (
    <Pressable
      onPress={onPress}
      style={[styles.event, { borderLeftColor: color, backgroundColor: soft }]}
    >
      <View style={styles.eventTop}>
        <View style={[styles.catPill, { backgroundColor: color }]}>
          <Text style={styles.catPillText}>{label}</Text>
        </View>
        <Text style={styles.eventTime}>
          {formatTime(booking.startTime)}
          {booking.endTime ? ` – ${formatTime(booking.endTime)}` : ""}
        </Text>
      </View>
      <Text style={styles.eventTitle} numberOfLines={2}>
        {booking.service?.name ?? "Session"}
      </Text>
      {booking.provider?.businessName ? (
        <Text style={styles.eventMeta} numberOfLines={1}>
          {booking.provider.businessName}
        </Text>
      ) : null}
      <View style={styles.eventFooter}>
        <Text style={styles.eventStatus}>{booking.status.replace(/_/g, " ")}</Text>
        {booking.totalAmount != null ? (
          <Text style={styles.eventPrice}>
            {formatMoney(booking.totalAmount, booking.service?.currency || "AUD")}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export default function CalendarScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { data, error, isLoading, refetch, isRefetching } = useConsumerBookings(user?.id);
  const [selected, setSelected] = useState(() => startOfDay(new Date()));

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const bookings = data ?? [];
  const errMsg =
    error instanceof Error ? error.message : error ? "Couldn't load calendar." : null;

  const days = useMemo(() => {
    const start = addDays(startOfDay(new Date()), -1);
    return Array.from({ length: 14 }, (_, i) => addDays(start, i));
  }, []);

  const byDay = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of bookings) {
      const d = startOfDay(new Date(b.startTime));
      const key = d.toISOString();
      const list = map.get(key) ?? [];
      list.push(b);
      map.set(key, list);
    }
    for (const [, list] of map) {
      list.sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime));
    }
    return map;
  }, [bookings]);

  const selectedKey = startOfDay(selected).toISOString();
  const dayBookings = byDay.get(selectedKey) ?? [];

  const countsOnDay = (d: Date) => byDay.get(startOfDay(d).toISOString())?.length ?? 0;
  const colorsOnDay = (d: Date) => {
    const list = byDay.get(startOfDay(d).toISOString()) ?? [];
    const set = new Set(list.map((b) => colorForServiceCategory(categoryOf(b))));
    return [...set].slice(0, 3);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
            tintColor={colors.leaf}
          />
        }
      >
        <Display>Calendar</Display>
        <Body muted style={{ marginTop: 4 }}>
          Your sessions by day — colour-coded by discipline.
        </Body>

        {/* Colour legend */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.legendRow}
        >
          {CALENDAR_CATEGORY_LEGEND.map((c) => (
            <View key={c.id} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: c.color }]} />
              <Text style={styles.legendLabel}>{c.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Day strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayStrip}
        >
          {days.map((d) => {
            const active = sameDay(d, selected);
            const count = countsOnDay(d);
            const dots = colorsOnDay(d);
            return (
              <Pressable
                key={d.toISOString()}
                onPress={() => setSelected(startOfDay(d))}
                style={[styles.dayChip, active && styles.dayChipActive]}
              >
                <Text style={[styles.dayWeek, active && styles.dayTextActive]}>
                  {d.toLocaleDateString(undefined, { weekday: "short" })}
                </Text>
                <Text style={[styles.dayNum, active && styles.dayTextActive]}>{d.getDate()}</Text>
                <View style={styles.dotRow}>
                  {dots.length ? (
                    dots.map((c, i) => (
                      <View key={i} style={[styles.miniDot, { backgroundColor: c }]} />
                    ))
                  ) : (
                    <View style={styles.miniDotEmpty} />
                  )}
                </View>
                {count > 0 ? (
                  <Text style={[styles.dayCount, active && styles.dayTextActive]}>{count}</Text>
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.dayHeader}>
          <Text style={styles.dayHeaderTitle}>{formatDayLabel(selected)}</Text>
          <Pressable
            onPress={() => router.push("/(tabs)/explore")}
            style={styles.bookCta}
          >
            <Ionicons name="add" size={16} color={colors.white} />
            <Text style={styles.bookCtaText}>Book session</Text>
          </Pressable>
        </View>

        <OfflineBanner
          error={errMsg}
          onRetry={() => void refetch()}
          retrying={isRefetching}
        />

        {isLoading && !data ? (
          <Loading label="Loading your calendar…" />
        ) : dayBookings.length === 0 && !errMsg ? (
          <EmptyState
            title="Nothing scheduled"
            body="Book Ayurveda, Yoga, Spa or other sessions — they appear here by colour."
          />
        ) : (
          <View style={styles.list}>
            {dayBookings.map((b) => (
              <BookingEvent
                key={b.id}
                booking={b}
                onPress={() => router.push("/(tabs)/bookings")}
              />
            ))}
          </View>
        )}

        {bookings.length > 0 ? (
          <Pressable
            onPress={() => router.push("/(tabs)/bookings")}
            style={styles.allLink}
          >
            <Text style={styles.allLinkText}>View all bookings & payments</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.forest} />
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
  legendRow: { gap: 12, paddingVertical: 14 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.inkSecondary,
  },
  dayStrip: { gap: 8, paddingBottom: 8 },
  dayChip: {
    width: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
    paddingVertical: 10,
    alignItems: "center",
  },
  dayChipActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  dayWeek: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.inkMuted,
    textTransform: "uppercase",
  },
  dayNum: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.forest,
    marginTop: 2,
  },
  dayTextActive: { color: colors.white },
  dayCount: {
    fontFamily: fonts.bodySemi,
    fontSize: 10,
    color: colors.inkMuted,
    marginTop: 2,
  },
  dotRow: { flexDirection: "row", gap: 3, marginTop: 6, minHeight: 6 },
  miniDot: { width: 6, height: 6, borderRadius: 3 },
  miniDotEmpty: { width: 6, height: 6 },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 12,
  },
  dayHeaderTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.forest,
  },
  bookCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.forest,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bookCtaText: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.white,
  },
  list: { gap: 10 },
  event: {
    borderLeftWidth: 4,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  eventTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  catPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  catPillText: {
    fontFamily: fonts.bodySemi,
    fontSize: 10,
    color: colors.white,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  eventTime: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.inkSecondary,
  },
  eventTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.forest,
  },
  eventMeta: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkSecondary,
  },
  eventFooter: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventStatus: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.inkMuted,
    textTransform: "capitalize",
  },
  eventPrice: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.foreground,
  },
  allLink: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 12,
  },
  allLinkText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.forest,
  },
});
