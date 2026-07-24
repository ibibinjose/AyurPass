import { Ionicons } from "@expo/vector-icons";
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
import { Body, Display, EmptyState, Loading } from "../../src/components/ui";
import { OfflineBanner } from "../../src/components/OfflineBanner";
import { ServiceCard } from "../../src/components/ServiceCard";
import { HeaderLogo } from "../../src/components/HeaderLogo";
import { SERVICE_CATEGORY_LABEL } from "../../src/catalog";
import { useDebouncedValue } from "../../src/hooks/useDebouncedValue";
import { useServices } from "../../src/hooks/useServices";
import type { ServiceCategory } from "../../src/types";
import { colors } from "../../src/theme";

const CATEGORIES: (ServiceCategory | "ALL")[] = [
  "ALL",
  "AYURVEDA",
  "YOGA",
  "SPA",
  "MEDITATION",
  "FITNESS",
  "NUTRITION",
  "COOKING",
  "CONSULTATION",
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
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="px-5 pt-3">
        <View className="flex-row items-center justify-between">
          <Display>Sessions</Display>
          <HeaderLogo />
        </View>
        <Body muted className="mt-1 text-[14px] leading-5">
          Search by name or category — bookings land on your Calendar.
        </Body>
        <View className="mt-3 min-h-11 flex-row items-center gap-2 rounded-full border border-hairline bg-surface px-3.5 py-2.5">
          <Ionicons name="search-outline" size={17} color={colors.inkMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Name or category…"
            placeholderTextColor={colors.inkMuted}
            className="flex-1 font-body text-[15px] text-foreground"
            autoCapitalize="none"
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
        <View className="mt-2 flex-row items-center justify-between">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingVertical: 8, flexGrow: 1 }}
            style={{ flex: 1 }}
          >
            {CATEGORIES.map((c) => {
              const active = c === category;
              return (
                <Pressable
                  key={c}
                  onPress={() => setCategory(c)}
                  className={`rounded-full border px-3.5 py-2 ${
                    active ? "border-forest bg-forest" : "border-hairline bg-surface"
                  }`}
                >
                  <Text
                    className={`font-body-semi text-[13px] ${
                      active ? "text-white" : "text-ink-secondary"
                    }`}
                  >
                    {c === "ALL" ? "All" : SERVICE_CATEGORY_LABEL[c]}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <View className="ml-2 flex-row rounded-full border border-hairline bg-surface p-0.5">
            {(
              [
                ["list", "list-outline"],
                ["grid", "grid-outline"],
              ] as const
            ).map(([mode, icon]) => (
              <Pressable
                key={mode}
                onPress={() => setViewMode(mode)}
                className={`rounded-full px-2 py-1.5 ${viewMode === mode ? "bg-forest" : ""}`}
              >
                <Ionicons
                  name={icon}
                  size={15}
                  color={viewMode === mode ? colors.white : colors.inkMuted}
                />
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
            tintColor={colors.leaf}
          />
        }
      >
        <OfflineBanner
          error={errMsg}
          onRetry={() => void refetch()}
          retrying={isRefetching}
        />
        {isLoading && !data ? (
          <Loading label="Loading sessions…" />
        ) : services.length === 0 && !errMsg ? (
          <View className="gap-4">
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
              className="flex-row items-center justify-center gap-2 rounded-full border border-hairline bg-surface py-3.5 active:opacity-90"
            >
              <Ionicons name="compass-outline" size={18} color={colors.forest} />
              <Text className="font-body-semi text-[15px] text-forest">Browse practices</Text>
            </Pressable>
          </View>
        ) : services.length === 0 ? null : (
          <View className={viewMode === "grid" ? "flex-row flex-wrap justify-between gap-y-3" : "gap-3"}>
            <Text className="mb-0.5 w-full font-body-medium text-[13px] text-ink-muted">
              {services.length} available
            </Text>
            {services.map((s) => (
              <View key={s.id} className={viewMode === "grid" ? "w-[48%]" : "w-full"}>
                <ServiceCard
                  service={s}
                  onPress={() => router.push(`/service/${s.id}`)}
                  compact={viewMode === "grid"}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
