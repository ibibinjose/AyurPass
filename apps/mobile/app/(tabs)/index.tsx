import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Body, Display, EmptyState, Loading } from "../../src/components/ui";
import { OfflineBanner } from "../../src/components/OfflineBanner";
import { HeaderLogo } from "../../src/components/HeaderLogo";
import { useAuth } from "../../src/auth";
import {
  formatAddress,
  formatCode,
  PROVIDER_TYPE_ICON,
  PROVIDER_TYPE_LABEL,
} from "../../src/catalog";
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
  { id: "NUTRITIONIST", label: "Nutrition" },
];

type ViewMode = "list" | "grid" | "map";

function includesText(hay: string, needle: string) {
  return hay.toLowerCase().includes(needle.toLowerCase());
}

function ProviderCard({
  provider,
  onPress,
  compact,
}: {
  provider: Provider;
  onPress: () => void;
  compact?: boolean;
}) {
  const location = formatAddress(provider.address);
  const verified = provider.verificationStatus === "verified";
  const typeLabel = PROVIDER_TYPE_LABEL[provider.type] ?? provider.type;
  const code = provider.code ? formatCode(provider.code) : null;

  if (compact) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={provider.businessName}
        className="mb-3 w-[48%] rounded-2xl border border-hairline bg-surface p-3 active:opacity-90"
      >
        <View className="mb-2 h-10 w-10 items-center justify-center rounded-xl bg-forest">
          <Ionicons name={PROVIDER_TYPE_ICON[provider.type]} size={20} color={colors.goldSoft} />
        </View>
        <Text className="font-body-semi text-[14px] text-forest" numberOfLines={2}>
          {provider.businessName}
        </Text>
        <View className="mt-1 flex-row flex-wrap items-center gap-1">
          <Text className="font-body-medium text-[11px] text-ink-secondary" numberOfLines={1}>
            {typeLabel}
          </Text>
          {code ? (
            <Text className="font-body-medium text-[10px] text-ink-muted">{code}</Text>
          ) : null}
        </View>
        {location ? (
          <Text className="mt-1 font-body text-[11px] text-ink-muted" numberOfLines={1}>
            {location}
          </Text>
        ) : null}
      </Pressable>
    );
  }

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
        <View className="mt-0.5 flex-row flex-wrap items-center gap-1.5">
          <Text className="font-body-medium text-[13px] text-ink-secondary" numberOfLines={1}>
            {typeLabel}
          </Text>
          {code ? (
            <Text className="rounded-full border border-dashed border-hairline px-1.5 py-0.5 font-body-medium text-[10px] text-ink-muted">
              {code}
            </Text>
          ) : null}
        </View>
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
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ProviderType | "ALL">("ALL");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [nearBusy, setNearBusy] = useState(false);
  const [nearError, setNearError] = useState<string | null>(null);
  const debounced = useDebouncedValue(query, 350);
  const debouncedLoc = useDebouncedValue(locationQuery, 350);
  const { data, error, isLoading, isFetching, refetch, isRefetching } = useProviders(debounced);

  const providers = useMemo(() => {
    let list = data ?? [];
    if (typeFilter !== "ALL") {
      list = list.filter((p) => p.type === typeFilter);
    }
    const q = debounced.trim();
    const loc = debouncedLoc.trim();
    if (q) {
      list = list.filter((p) => {
        const typeLabel = PROVIDER_TYPE_LABEL[p.type] ?? p.type;
        const hay = [
          p.businessName,
          typeLabel,
          p.code ?? "",
          formatAddress(p.address) ?? "",
          (p.brandProfile?.tags ?? []).join(" "),
        ].join(" ");
        return includesText(hay, q);
      });
    }
    if (loc) {
      list = list.filter((p) => includesText(formatAddress(p.address) ?? "", loc));
    }
    // Soft sort: location match first when Near me / location set
    if (loc) {
      list = [...list].sort((a, b) => {
        const aa = (formatAddress(a.address) ?? "").toLowerCase();
        const bb = (formatAddress(b.address) ?? "").toLowerCase();
        const needle = loc.toLowerCase();
        const sa = aa.includes(needle) ? 0 : 1;
        const sb = bb.includes(needle) ? 0 : 1;
        return sa - sb;
      });
    }
    return list;
  }, [data, typeFilter, debounced, debouncedLoc]);

  const firstName = user?.fullName?.split(" ")[0];
  const errMsg =
    error instanceof Error ? error.message : error ? "Couldn't load providers." : null;

  const locateNearMe = useCallback(async () => {
    setNearError(null);
    setNearBusy(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setNearError("Location permission denied. Type a city instead.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const [place] = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      const city = place?.city || place?.subregion || place?.region || "";
      const country = place?.country || "";
      const label = [city, country].filter(Boolean).join(", ");
      if (!label) {
        setNearError("Couldn't resolve your city. Type a location.");
        return;
      }
      setLocationQuery(label);
    } catch {
      setNearError("Couldn't get your location. Type a city instead.");
    } finally {
      setNearBusy(false);
    }
  }, []);

  const openMapsFor = useCallback((p: Provider) => {
    const addr = formatAddress(p.address) || p.businessName;
    const q = encodeURIComponent(addr);
    void Linking.openURL(`https://www.openstreetmap.org/search?query=${q}`);
  }, []);

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
          Search by name, category or location — free to browse.
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

        {/* Name / category search */}
        <View className="mt-4 min-h-12 flex-row items-center gap-2.5 rounded-full border border-hairline bg-surface px-4 py-3">
          <Ionicons name="search-outline" size={18} color={colors.inkMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Name or category…"
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

        {/* Location search + Near me */}
        <View className="mt-2.5 flex-row items-center gap-2">
          <View className="min-h-12 flex-1 flex-row items-center gap-2 rounded-full border border-hairline bg-surface px-4 py-3">
            <Ionicons name="location-outline" size={18} color={colors.inkMuted} />
            <TextInput
              value={locationQuery}
              onChangeText={setLocationQuery}
              placeholder="City or country"
              placeholderTextColor={colors.inkMuted}
              className="flex-1 font-body text-base text-foreground"
              autoCapitalize="words"
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>
          <Pressable
            onPress={() => void locateNearMe()}
            disabled={nearBusy}
            className="min-h-12 items-center justify-center rounded-full bg-leaf/15 px-3.5 active:opacity-90"
            accessibilityLabel="Near me"
          >
            <Ionicons
              name={nearBusy ? "hourglass-outline" : "navigate-outline"}
              size={20}
              color={colors.forest}
            />
          </Pressable>
        </View>
        {nearError ? (
          <Text className="mt-1.5 px-1 font-body-medium text-[12px] text-red-700">{nearError}</Text>
        ) : null}

        {/* Category chips */}
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

        {/* View mode: list / grid / map */}
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="font-body-medium text-[13px] text-ink-muted">
            {isLoading && !data
              ? "…"
              : `${providers.length} ${providers.length === 1 ? "practice" : "practices"}`}
          </Text>
          <View className="flex-row rounded-full border border-hairline bg-surface p-0.5">
            {(
              [
                ["list", "list-outline"],
                ["grid", "grid-outline"],
                ["map", "map-outline"],
              ] as const
            ).map(([mode, icon]) => (
              <Pressable
                key={mode}
                onPress={() => setViewMode(mode)}
                className={`rounded-full px-2.5 py-1.5 ${
                  viewMode === mode ? "bg-forest" : ""
                }`}
                accessibilityLabel={`${mode} view`}
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
              title={
                query || locationQuery || typeFilter !== "ALL"
                  ? "No matches"
                  : "No practices yet"
              }
              body={
                query || locationQuery || typeFilter !== "ALL"
                  ? "Try another name, location or category."
                  : "Pull to refresh — new listings appear as practices join."
              }
            />
          ) : providers.length === 0 ? null : viewMode === "map" ? (
            <View className="gap-2">
              <View className="rounded-2xl border border-hairline bg-leaf/10 px-4 py-5">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="map" size={22} color={colors.forest} />
                  <Text className="font-body-semi text-[15px] text-forest">Map view</Text>
                </View>
                <Text className="mt-1.5 font-body text-[13px] leading-5 text-ink-secondary">
                  Tap a practice to open it on OpenStreetMap, or open the profile.
                </Text>
              </View>
              {providers.map((p) => {
                const loc = formatAddress(p.address);
                return (
                  <View
                    key={p.id}
                    className="rounded-2xl border border-hairline bg-surface p-3.5"
                  >
                    <Text className="font-body-semi text-[15px] text-forest" numberOfLines={1}>
                      {p.businessName}
                    </Text>
                    <Text className="mt-0.5 font-body-medium text-[12px] text-ink-secondary">
                      {PROVIDER_TYPE_LABEL[p.type]}
                      {p.code ? ` · ${formatCode(p.code)}` : ""}
                    </Text>
                    {loc ? (
                      <Text className="mt-1 font-body text-[12px] text-ink-muted" numberOfLines={1}>
                        {loc}
                      </Text>
                    ) : null}
                    <View className="mt-2.5 flex-row gap-2">
                      <Pressable
                        onPress={() => openMapsFor(p)}
                        className="flex-1 items-center rounded-full bg-leaf/15 py-2.5 active:opacity-90"
                      >
                        <Text className="font-body-semi text-[13px] text-forest">Open map</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => router.push(`/provider/${p.id}`)}
                        className="flex-1 items-center rounded-full bg-forest py-2.5 active:opacity-90"
                      >
                        <Text className="font-body-semi text-[13px] text-white">View</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : viewMode === "grid" ? (
            <View
              className="flex-row flex-wrap justify-between"
              style={{ maxWidth: width - 40 }}
            >
              {providers.map((p) => (
                <ProviderCard
                  key={p.id}
                  provider={p}
                  compact
                  onPress={() => router.push(`/provider/${p.id}`)}
                />
              ))}
            </View>
          ) : (
            <View className="gap-3">
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
