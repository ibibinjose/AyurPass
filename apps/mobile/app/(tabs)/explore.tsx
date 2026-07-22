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
    () => (category === "ALL" ? "All" : SERVICE_CATEGORY_LABEL[category]),
    [category],
  );
  const errMsg =
    error instanceof Error ? error.message : error ? "Couldn't load services." : null;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="px-5 pt-5">
        <Display>Book a session</Display>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 16 }}
        >
          {CATEGORIES.map((c) => {
            const active = c === category;
            return (
              <Pressable
                key={c}
                onPress={() => setCategory(c)}
                className={`rounded-full border px-4 py-2 ${
                  active
                    ? "border-forest bg-forest"
                    : "border-hairline bg-surface"
                }`}
              >
                <Text
                  className={`font-body-medium text-[13px] ${
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
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
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
          <Loading />
        ) : services.length === 0 && !errMsg ? (
          <EmptyState title={`No ${label.toLowerCase()} sessions yet`} body="Try another category." />
        ) : services.length === 0 ? null : (
          <View className="gap-3">
            <Body muted>{services.length} available</Body>
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} onPress={() => router.push(`/service/${s.id}`)} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
