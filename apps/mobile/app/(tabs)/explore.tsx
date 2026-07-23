import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Body, Display, EmptyState, Loading } from "../../src/components/ui";
import { OfflineBanner } from "../../src/components/OfflineBanner";
import { ServiceCard } from "../../src/components/ServiceCard";
import { SERVICE_CATEGORY_LABEL } from "../../src/catalog";
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
  "CONSULTATION",
];

export default function Explore() {
  const router = useRouter();
  const [category, setCategory] = useState<ServiceCategory | "ALL">("ALL");
  const { data, error, isLoading, refetch, isRefetching } = useServices(category);

  const services = data ?? [];
  const label = useMemo(
    () => (category === "ALL" ? "sessions" : SERVICE_CATEGORY_LABEL[category].toLowerCase()),
    [category],
  );
  const errMsg =
    error instanceof Error ? error.message : error ? "Couldn't load sessions." : null;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="px-5 pt-3">
        <Display>Sessions</Display>
        <Body muted className="mt-1 text-[14px] leading-5">
          Book Ayurveda, Yoga, Spa and more — they land on your Calendar.
        </Body>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingTop: 14, paddingBottom: 8 }}
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
              title={`No ${label} yet`}
              body="Bookable sessions appear when practices publish them. Browse the directory meanwhile."
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
          <View className="gap-3">
            <Text className="font-body-medium text-[13px] text-ink-muted">
              {services.length} available
            </Text>
            {services.map((s) => (
              <ServiceCard
                key={s.id}
                service={s}
                onPress={() => router.push(`/service/${s.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
