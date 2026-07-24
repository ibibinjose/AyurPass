import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { api, formatMoney } from "../../src/api";
import {
  CALENDAR_CATEGORY_LEGEND,
  colorForServiceCategory,
  SERVICE_CATEGORY_LABEL,
  softColorForServiceCategory,
  EVENT_CATEGORY_LABEL,
} from "../../src/catalog";
import { useConsumerBookings } from "../../src/hooks/useBookings";
import type { Booking, ServiceCategory } from "../../src/types";
import { colors, fonts } from "../../src/theme";

type Ticket = Awaited<ReturnType<typeof api.myEventTickets>>[number];
type CatFilter = ServiceCategory | "ALL" | "EVENT";

type CalItem =
  | { kind: "booking"; at: Date; booking: Booking }
  | { kind: "event"; at: Date; ticket: Ticket };

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

const FILTERS: { id: CatFilter; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "AYURVEDA", label: "Ayurveda" },
  { id: "YOGA", label: "Yoga" },
  { id: "SPA", label: "Spa" },
  { id: "MEDITATION", label: "Meditation" },
  { id: "FITNESS", label: "Fitness" },
  { id: "CONSULTATION", label: "Consult" },
  { id: "COOKING", label: "Cooking" },
  { id: "EVENT", label: "Events" },
];

export default function CalendarScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { data, error, isLoading, refetch, isRefetching } = useConsumerBookings(user?.id);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState(() => startOfDay(new Date()));
  const [cat, setCat] = useState<CatFilter>("ALL");

  const loadTickets = useCallback(async () => {
    if (!user) {
      setTickets([]);
      return;
    }
    try {
      setTickets(await api.myEventTickets());
    } catch {
      setTickets([]);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      void refetch();
      void loadTickets();
    }, [refetch, loadTickets]),
  );

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  const bookings = data ?? [];
  const errMsg =
    error instanceof Error ? error.message : error ? "Couldn't load calendar." : null;

  const items = useMemo(() => {
    const out: CalItem[] = [];
    for (const b of bookings) {
      if (b.status === "CANCELLED") continue;
      out.push({ kind: "booking", at: new Date(b.startTime), booking: b });
    }
    for (const t of tickets) {
      if (!t.event?.startTime) continue;
      if (["CANCELLED", "REFUNDED"].includes(t.status)) continue;
      out.push({ kind: "event", at: new Date(t.event.startTime), ticket: t });
    }
    out.sort((a, b) => +a.at - +b.at);
    return out;
  }, [bookings, tickets]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (cat === "ALL") return true;
      if (cat === "EVENT") return item.kind === "event";
      if (item.kind === "booking") return item.booking.service?.category === cat;
      const ec = item.ticket.event?.category ?? "";
      if (cat === "COOKING") return ec === "COOKING_CLASS";
      return ec === cat;
    });
  }, [items, cat]);

  const byDay = useMemo(() => {
    const map = new Map<string, CalItem[]>();
    for (const item of filtered) {
      const k = dayKey(item.at);
      const list = map.get(k) ?? [];
      list.push(item);
      map.set(k, list);
    }
    return map;
  }, [filtered]);

  const monthCells = useMemo(() => {
    const first = startOfMonth(monthCursor);
    const pad = first.getDay();
    const dim = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < pad; i++) cells.push(null);
    for (let d = 1; d <= dim; d++) cells.push(new Date(first.getFullYear(), first.getMonth(), d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [monthCursor]);

  const selectedItems = byDay.get(dayKey(selected)) ?? [];
  const upcoming = useMemo(() => {
    const now = new Date();
    return filtered.filter((i) => i.at >= startOfDay(now)).slice(0, 30);
  }, [filtered]);

  const monthLabel = monthCursor.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              void refetch();
              void loadTickets();
            }}
            tintColor={colors.leaf}
          />
        }
      >
        <Display>Calendar</Display>
        <Body muted style={{ marginTop: 4 }}>
          Appointments & events — colour-coded by discipline.
        </Body>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {FILTERS.map((f) => {
            const active = cat === f.id;
            const color =
              f.id === "ALL"
                ? colors.forest
                : f.id === "EVENT"
                  ? colorForServiceCategory("EVENT")
                  : colorForServiceCategory(f.id);
            return (
              <Pressable
                key={f.id}
                onPress={() => setCat(f.id)}
                style={[
                  styles.chip,
                  active && { backgroundColor: color, borderColor: color },
                ]}
              >
                {!active && f.id !== "ALL" ? (
                  <View style={[styles.chipDot, { backgroundColor: color }]} />
                ) : null}
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Legend */}
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

        {/* Month navigator */}
        <View style={styles.monthNav}>
          <Pressable onPress={() => setMonthCursor((m) => addMonths(m, -1))} style={styles.navBtn}>
            <Ionicons name="chevron-back" size={18} color={colors.forest} />
          </Pressable>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <Pressable onPress={() => setMonthCursor((m) => addMonths(m, 1))} style={styles.navBtn}>
            <Ionicons name="chevron-forward" size={18} color={colors.forest} />
          </Pressable>
        </View>

        {/* Weekday headers */}
        <View style={styles.weekRow}>
          {["S", "M", "T", "W", "T", "F", "S"].map((w, i) => (
            <Text key={i} style={styles.weekHead}>
              {w}
            </Text>
          ))}
        </View>

        {/* Month grid */}
        <View style={styles.grid}>
          {monthCells.map((d, i) => {
            if (!d) return <View key={`e-${i}`} style={styles.cellEmpty} />;
            const key = dayKey(d);
            const dayItems = byDay.get(key) ?? [];
            const active = sameDay(d, selected);
            const isToday = sameDay(d, new Date());
            const dots = [
              ...new Set(
                dayItems.map((it) =>
                  it.kind === "booking"
                    ? colorForServiceCategory(it.booking.service?.category as ServiceCategory)
                    : colorForServiceCategory("EVENT"),
                ),
              ),
            ].slice(0, 3);
            return (
              <Pressable
                key={key}
                onPress={() => setSelected(startOfDay(d))}
                style={[
                  styles.cell,
                  active && styles.cellActive,
                  isToday && !active && styles.cellToday,
                ]}
              >
                <Text style={[styles.cellNum, active && styles.cellNumActive]}>{d.getDate()}</Text>
                <View style={styles.dotRow}>
                  {dots.map((c, di) => (
                    <View
                      key={di}
                      style={[
                        styles.miniDot,
                        { backgroundColor: active ? "rgba(255,255,255,0.9)" : c },
                      ]}
                    />
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={() => {
            const t = new Date();
            setMonthCursor(startOfMonth(t));
            setSelected(startOfDay(t));
          }}
          style={styles.todayLink}
        >
          <Text style={styles.todayLinkText}>Jump to today</Text>
        </Pressable>

        {/* Selected day */}
        <View style={styles.dayHeader}>
          <Text style={styles.dayHeaderTitle}>
            {selected.toLocaleDateString(undefined, {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </Text>
          <Pressable onPress={() => router.push("/(tabs)/explore")} style={styles.bookCta}>
            <Ionicons name="add" size={16} color={colors.white} />
            <Text style={styles.bookCtaText}>Book</Text>
          </Pressable>
        </View>

        <OfflineBanner
          error={errMsg}
          onRetry={() => {
            void refetch();
            void loadTickets();
          }}
          retrying={isRefetching}
        />

        {isLoading && !data ? (
          <Loading label="Loading your calendar…" />
        ) : selectedItems.length === 0 && !errMsg ? (
          <EmptyState
            title="Nothing this day"
            body="Book Ayurveda, Yoga, Spa or join an event — they land here in colour."
          />
        ) : (
          <View style={styles.list}>
            {selectedItems.map((item) =>
              item.kind === "booking" ? (
                <BookingRow
                  key={item.booking.id}
                  booking={item.booking}
                  onPress={() => router.push("/(tabs)/bookings")}
                />
              ) : (
                <EventRow key={item.ticket.id} ticket={item.ticket} />
              ),
            )}
          </View>
        )}

        {/* Upcoming list */}
        <Text style={styles.sectionTitle}>Upcoming</Text>
        {upcoming.length === 0 ? (
          <Text style={styles.muted}>No upcoming appointments or events.</Text>
        ) : (
          <View style={styles.list}>
            {upcoming.map((item) =>
              item.kind === "booking" ? (
                <BookingRow
                  key={`u-${item.booking.id}`}
                  booking={item.booking}
                  onPress={() => router.push("/(tabs)/bookings")}
                />
              ) : (
                <EventRow key={`u-${item.ticket.id}`} ticket={item.ticket} />
              ),
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function BookingRow({ booking, onPress }: { booking: Booking; onPress: () => void }) {
  const cat = booking.service?.category as ServiceCategory | undefined;
  const color = colorForServiceCategory(cat);
  const soft = softColorForServiceCategory(cat);
  const label = cat ? SERVICE_CATEGORY_LABEL[cat] : "Session";
  return (
    <Pressable onPress={onPress} style={[styles.event, { borderLeftColor: color, backgroundColor: soft }]}>
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

function EventRow({ ticket }: { ticket: Ticket }) {
  const cat = ticket.event?.category;
  return (
    <View
      style={[
        styles.event,
        { borderLeftColor: colorForServiceCategory("EVENT"), backgroundColor: softColorForServiceCategory("EVENT") },
      ]}
    >
      <View style={styles.eventTop}>
        <View style={[styles.catPill, { backgroundColor: colorForServiceCategory("EVENT") }]}>
          <Text style={styles.catPillText}>
            {cat ? EVENT_CATEGORY_LABEL[cat] || "Event" : "Event"}
          </Text>
        </View>
        {ticket.event?.startTime ? (
          <Text style={styles.eventTime}>{formatTime(ticket.event.startTime)}</Text>
        ) : null}
      </View>
      <Text style={styles.eventTitle} numberOfLines={2}>
        {ticket.event?.title ?? "Event"}
      </Text>
      {ticket.event?.provider?.businessName ? (
        <Text style={styles.eventMeta}>{ticket.event.provider.businessName}</Text>
      ) : null}
      <Text style={styles.eventStatus}>{ticket.status.replace(/_/g, " ")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 36 },
  chipRow: { gap: 8, paddingTop: 14, paddingBottom: 6 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  chipText: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.inkSecondary },
  chipTextActive: { color: colors.white },
  legendRow: { gap: 12, paddingVertical: 8 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.inkSecondary },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 8,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  monthLabel: { fontFamily: fonts.display, fontSize: 18, color: colors.forest },
  weekRow: { flexDirection: "row", marginBottom: 4 },
  weekHead: {
    flex: 1,
    textAlign: "center",
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.inkMuted,
  },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cellEmpty: { width: `${100 / 7}%`, aspectRatio: 1, padding: 2 },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  cellActive: { backgroundColor: colors.forest },
  cellToday: { backgroundColor: "rgba(47,90,68,0.12)" },
  cellNum: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.forest },
  cellNumActive: { color: colors.white },
  dotRow: { flexDirection: "row", gap: 2, marginTop: 3, minHeight: 5 },
  miniDot: { width: 5, height: 5, borderRadius: 2.5 },
  todayLink: { alignSelf: "center", marginTop: 8, marginBottom: 4 },
  todayLinkText: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.systemBlue },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    marginBottom: 10,
  },
  dayHeaderTitle: { fontFamily: fonts.display, fontSize: 20, color: colors.forest },
  bookCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.forest,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bookCtaText: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.white },
  list: { gap: 10 },
  sectionTitle: {
    marginTop: 22,
    marginBottom: 10,
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.forest,
  },
  muted: { fontFamily: fonts.body, fontSize: 14, color: colors.inkMuted },
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
  catPill: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  catPillText: {
    fontFamily: fonts.bodySemi,
    fontSize: 10,
    color: colors.white,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  eventTime: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.inkSecondary },
  eventTitle: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.forest },
  eventMeta: { marginTop: 2, fontFamily: fonts.body, fontSize: 13, color: colors.inkSecondary },
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
  eventPrice: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.foreground },
});
