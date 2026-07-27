import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState, Loading } from "../../src/components/ui";
import { OfflineBanner } from "../../src/components/OfflineBanner";
import { ServiceCard } from "../../src/components/ServiceCard";
import { SERVICE_CATEGORY_LABEL } from "../../src/catalog";
import { useDebouncedValue } from "../../src/hooks/useDebouncedValue";
import { useServices } from "../../src/hooks/useServices";
import type { ServiceCategory } from "../../src/types";
import { colors, fonts } from "../../src/theme";

const CATEGORIES: { id: ServiceCategory | "ALL"; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: "ALL", label: "All", icon: "sparkles-outline" },
  { id: "AYURVEDA", label: "Ayurveda", icon: "leaf-outline" },
  { id: "YOGA", label: "Yoga", icon: "fitness-outline" },
  { id: "SPA", label: "Spa", icon: "water-outline" },
  { id: "MEDITATION", label: "Meditation", icon: "flower-outline" },
  { id: "FITNESS", label: "Fitness", icon: "barbell-outline" },
  { id: "NUTRITION", label: "Nutrition", icon: "nutrition-outline" },
  { id: "COOKING", label: "Cooking", icon: "restaurant-outline" },
  { id: "CONSULTATION", label: "Consultation", icon: "clipboard-outline" },
];

export default function Explore() {
  const router = useRouter();
  const [category, setCategory] = useState<ServiceCategory | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const debounced = useDebouncedValue(query, 300);
  const { data, error, isLoading, refetch, isRefetching } = useServices(category);

  const services = useMemo(() => {
    const list = data ?? [];
    const q = debounced.trim().toLowerCase();
    if (!q) return list;
    return list.filter((s) => {
      const cat = SERVICE_CATEGORY_LABEL[s.category] ?? s.category;
      const hay = [
        s.name,
        s.description ?? "",
        cat,
        s.category,
        s.code ?? "",
        s.provider?.businessName ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [data, debounced]);

  const label = useMemo(
    () => (category === "ALL" ? "sessions" : SERVICE_CATEGORY_LABEL[category].toLowerCase()),
    [category],
  );
  const errMsg =
    error instanceof Error ? error.message : error ? "Couldn't load sessions." : null;

  return (
    <SafeAreaView className="flex-1 bg-background" style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 36 }}
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
                AyurPass Catalog 🧘
              </Text>
              <Text style={{ fontSize: 26, fontFamily: fonts.display, color: colors.white, marginTop: 2 }}>
                Explore <Text style={{ color: colors.goldSoft }}>sessions</Text>
              </Text>
            </View>
            <View style={{ height: 44, width: 44, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "rgba(255,255,255,0.15)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" }}>
              <Ionicons name="compass-outline" size={22} color={colors.goldSoft} />
            </View>
          </View>
        </View>

        {/* Content Container */}
        <View style={{ marginTop: -12, paddingHorizontal: 20 }}>
          {/* Name / category search input */}
          <View style={{ minHeight: 48, flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 999, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 10 }}>
            <Ionicons name="search-outline" size={18} color={colors.inkMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search session or treatment…"
              placeholderTextColor={colors.inkMuted}
              className="flex-1 font-body text-base text-foreground"
              style={{ flex: 1, fontSize: 16, color: colors.foreground, fontFamily: fonts.body }}
              autoCapitalize="none"
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {query.length > 0 ? (
              <Pressable onPress={() => setQuery("")} hitSlop={10} accessibilityLabel="Clear search">
                <Ionicons name="close-circle" size={18} color={colors.inkMuted} />
              </Pressable>
            ) : null}
          </View>

          {/* Categories & View Switcher */}
          <View style={{ marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingVertical: 8, flexGrow: 1 }}
              style={{ flex: 1 }}
            >
              {CATEGORIES.map((c) => {
                const active = c.id === category;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => setCategory(c.id)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      borderRadius: 999,
                      borderWidth: 1,
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderColor: active ? colors.forest : colors.hairline,
                      backgroundColor: active ? colors.forest : colors.surface,
                    }}
                  >
                    <Ionicons
                      name={c.icon}
                      size={15}
                      color={active ? colors.goldSoft : colors.forest}
                    />
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: fonts.bodySemi,
                        color: active ? colors.white : colors.forest,
                      }}
                    >
                      {c.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <View style={{ marginLeft: 8, flexDirection: "row", borderRadius: 999, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.surface, padding: 2 }}>
              {(
                [
                  ["list", "list-outline"],
                  ["grid", "grid-outline"],
                ] as const
              ).map(([mode, icon]) => (
                <Pressable
                  key={mode}
                  onPress={() => setViewMode(mode)}
                  style={{
                    borderRadius: 999,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    backgroundColor: viewMode === mode ? colors.forest : "transparent",
                  }}
                >
                  <Ionicons
                    name={icon}
                    size={16}
                    color={viewMode === mode ? colors.white : colors.inkMuted}
                  />
                </Pressable>
              ))}
            </View>
          </View>

          <View style={{ marginTop: 4 }}>
            <OfflineBanner
              error={errMsg}
              onRetry={() => void refetch()}
              retrying={isRefetching}
            />
            {isLoading && !data ? (
              <Loading label="Loading sessions…" />
            ) : services.length === 0 && !errMsg ? (
              <View style={{ gap: 16 }}>
                <EmptyState
                  title={query ? "No matches" : `No ${label} yet`}
                  body={
                    query
                      ? "Try another name or category."
                      : "Bookable sessions appear when practices publish them. Browse the directory meanwhile."
                  }
                />
                <Pressable
                  onPress={() => router.push("/(tabs)")}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: colors.hairline,
                    backgroundColor: colors.surface,
                    paddingVertical: 14,
                  }}
                >
                  <Ionicons name="compass-outline" size={18} color={colors.forest} />
                  <Text style={{ fontSize: 15, fontFamily: fonts.bodySemi, color: colors.forest }}>Browse practices</Text>
                </Pressable>
              </View>
            ) : services.length === 0 ? null : (
              <View style={{ gap: 12 }}>
                <Text style={{ fontSize: 13, fontFamily: fonts.bodyMedium, color: colors.inkMuted }}>
                  {services.length} {services.length === 1 ? "session" : "sessions"} available
                </Text>
                <View style={viewMode === "grid" ? { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 12 } : { gap: 12 }}>
                  {services.map((s) => (
                    <View key={s.id} style={viewMode === "grid" ? { width: "48%" } : { width: "100%" }}>
                      <ServiceCard
                        service={s}
                        onPress={() => router.push(`/service/${s.id}`)}
                        compact={viewMode === "grid"}
                      />
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
