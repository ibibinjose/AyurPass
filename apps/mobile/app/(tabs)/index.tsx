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
import { HeaderLogo } from "../../src/components/HeaderLogo";
import { useAuth } from "../../src/auth";
import { formatAddress, PROVIDER_TYPE_ICON, PROVIDER_TYPE_LABEL } from "../../src/catalog";
import { useDebouncedValue } from "../../src/hooks/useDebouncedValue";
import { useProviders } from "../../src/hooks/useProviders";
import type { Provider, ProviderType } from "../../src/types";
import { colors } from "../../src/theme";

const TYPE_CHIPS: { id: ProviderType | "ALL"; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "AYURVEDA_CLINIC", label: "Ayurveda" },
  { id: "YOGA_STUDIO", label: "Yoga" },
  { id: "LUXURY_SPA", label: "Spa" },
  { id: "MEDITATION_CENTER", label: "Meditation" },
  { id: "HEALTH_CLUB", label: "Health club" },
  { id: "WELLNESS_RETREAT", label: "Retreat" },
];

function ProviderCard({ provider, onPress }: { provider: Provider; onPress: () => void }) {
  const location = formatAddress(provider.address);
  const verified = provider.verificationStatus === "verified";
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${provider.businessName}${verified ? ", verified" : ""}`}
      className="min-h-[76px] flex-row items-center gap-3.5 rounded-2xl border border-hairline bg-surface p-3.5 active:opacity-90"
    >
      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-forest">
        <Ionicons name={PROVIDER_TYPE_ICON[provider.type]} size={22} color={colors.goldSoft} />
      </View>
      <View className="min-w-0 flex-1">
        <View className="flex-row items-center gap-1.5">
          <Text className="shrink font-body-semi text-[16px] text-forest" numberOfLines={1}>
            {provider.businessName}
          </Text>
          {verified ? (
            <View
              accessibilityLabel="Verified"
              className="h-[18px] w-[18px] items-center justify-center rounded-full bg-system-blue"
            >
              <Ionicons name="checkmark" size={11} color={colors.white} />
            </View>
          ) : null}
        </View>
        <Text className="mt-0.5 font-body-medium text-[13px] text-ink-secondary" numberOfLines={1}>
          {PROVIDER_TYPE_LABEL[provider.type]}
        </Text>
        {location ? (
          <View className="mt-1 flex-row items-center gap-1">
            <Ionicons name="location-outline" size={13} color={colors.inkMuted} />
            <Text className="flex-1 font-body-medium text-[13px] text-ink-muted" numberOfLines={1}>
              {location}
            </Text>
          </View>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
    </Pressable>
  );
}

export default function Discover() {
  const { user } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ProviderType | "ALL">("ALL");
  const debounced = useDebouncedValue(query, 350);
  const { data, error, isLoading, isFetching, refetch, isRefetching } = useProviders(debounced);

  const providers = useMemo(() => {
    const list = data ?? [];
    if (typeFilter === "ALL") return list;
    return list.filter((p) => p.type === typeFilter);
  }, [data, typeFilter]);

  const firstName = user?.fullName?.split(" ")[0];
  const errMsg =
    error instanceof Error ? error.message : error ? "Couldn't load providers." : null;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor={colors.leaf}
          />
        }
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Body muted className="text-[13px]">
              {firstName ? `Hi, ${firstName}` : "Welcome"}
            </Body>
            <Display className="mt-0.5">Discover</Display>
          </View>
          <HeaderLogo />
        </View>
        <Body muted className="mt-1 text-[14px] leading-5">
          Clinics, studios and spas — free to browse.
        </Body>

        <Pressable
          onPress={() => router.push("/(tabs)/offers")}
          className="mt-4 flex-row items-center gap-3 rounded-2xl bg-forest px-4 py-3.5 active:opacity-90"
        >
          <View className="h-9 w-9 items-center justify-center rounded-full bg-white/10">
            <Ionicons name="gift-outline" size={18} color={colors.goldSoft} />
          </View>
          <View className="flex-1">
            <Text className="font-body-medium text-[11px] uppercase tracking-wide text-gold-soft">
              Limited-time
            </Text>
            <Text className="mt-0.5 font-body-semi text-[15px] text-white">
              Wellness offers & deals
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.goldSoft} />
        </Pressable>

        <View className="mt-4 min-h-12 flex-row items-center gap-2.5 rounded-full border border-hairline bg-surface px-4 py-3">
          <Ionicons name="search-outline" size={18} color={colors.inkMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search clinics, studios, spas…"
            placeholderTextColor={colors.inkMuted}
            className="flex-1 font-body text-base text-foreground"
            autoCapitalize="none"
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery("")} hitSlop={10} accessibilityLabel="Clear search">
              <Ionicons name="close-circle" size={18} color={colors.inkMuted} />
            </Pressable>
          ) : null}
          {isFetching && !isRefetching ? (
            <Ionicons name="sync-outline" size={16} color={colors.leaf} />
          ) : null}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 14 }}
        >
          {TYPE_CHIPS.map((chip) => {
            const active = chip.id === typeFilter;
            return (
              <Pressable
                key={chip.id}
                onPress={() => setTypeFilter(chip.id)}
                className={`rounded-full border px-3.5 py-2 ${
                  active ? "border-forest bg-forest" : "border-hairline bg-surface"
                }`}
              >
                <Text
                  className={`font-body-semi text-[13px] ${
                    active ? "text-white" : "text-ink-secondary"
                  }`}
                >
                  {chip.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View className="mt-1">
          <OfflineBanner
            error={errMsg}
            onRetry={() => void refetch()}
            retrying={isRefetching}
          />
          {isLoading && !data ? (
            <Loading label="Finding wellness near you…" />
          ) : providers.length === 0 && !errMsg ? (
            <EmptyState
              title={query || typeFilter !== "ALL" ? "No matches" : "No practices yet"}
              body={
                query || typeFilter !== "ALL"
                  ? "Try another search or filter."
                  : "Pull to refresh — new listings appear as practices join."
              }
            />
          ) : providers.length === 0 ? null : (
            <View className="gap-3">
              <Text className="mb-0.5 font-body-medium text-[13px] text-ink-muted">
                {providers.length} {providers.length === 1 ? "practice" : "practices"}
              </Text>
              {providers.map((p) => (
                <ProviderCard
                  key={p.id}
                  provider={p}
                  onPress={() => router.push(`/provider/${p.id}`)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
