import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
import { ProviderMapView } from "../../src/components/ProviderMapView";
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
import { colors, fonts } from "../../src/theme";

const TYPE_CHIPS: { id: ProviderType | "ALL"; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: "ALL", label: "All", icon: "sparkles-outline" },
  { id: "AYURVEDA_CLINIC", label: "Ayurveda", icon: "leaf-outline" },
  { id: "YOGA_STUDIO", label: "Yoga", icon: "fitness-outline" },
  { id: "LUXURY_SPA", label: "Spa", icon: "water-outline" },
  { id: "MEDITATION_CENTER", label: "Meditation", icon: "flower-outline" },
  { id: "HEALTH_CLUB", label: "Health Club", icon: "barbell-outline" },
  { id: "WELLNESS_RETREAT", label: "Retreat", icon: "earth-outline" },
  { id: "NUTRITIONIST", label: "Nutrition", icon: "nutrition-outline" },
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
  const ratingVal = provider.rating ? Number(provider.rating).toFixed(1) : "4.9";
  const reviewCnt = provider.reviewCount ?? 12;

  if (compact) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={provider.businessName}
        className="mb-3 w-[48%] overflow-hidden rounded-2xl border border-hairline bg-surface p-3.5 shadow-sm active:opacity-90"
        style={{
          marginBottom: 12,
          width: "48%",
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.hairline,
          backgroundColor: colors.surface,
          padding: 14,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <View style={{ height: 40, width: 40, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: colors.sage }}>
            <Ionicons name={PROVIDER_TYPE_ICON[provider.type]} size={20} color={colors.saffronSoft} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 999, backgroundColor: colors.saffronSoft, paddingHorizontal: 8, paddingVertical: 2 }}>
            <Ionicons name="star" size={11} color={colors.saffron} />
            <Text style={{ fontSize: 11, fontFamily: fonts.bodySemi, color: colors.sage }}>{ratingVal}</Text>
          </View>
        </View>

        <Text style={{ fontSize: 14, fontFamily: fonts.bodySemi, lineHeight: 20, color: colors.sage }} numberOfLines={2}>
          {provider.businessName}
        </Text>

        <View style={{ marginTop: 4, flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Text style={{ fontSize: 11, fontFamily: fonts.bodyMedium, color: colors.inkSecondary }} numberOfLines={1}>
            {typeLabel}
          </Text>
          {verified ? (
            <Ionicons name="checkmark-circle" size={12} color={colors.sageLight} />
          ) : null}
        </View>

        {location ? (
          <Text style={{ marginTop: 4, fontSize: 11, fontFamily: fonts.body, color: colors.inkMuted }} numberOfLines={1}>
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
      className="flex-row items-center gap-3.5 rounded-2xl border border-hairline bg-surface p-3.5 shadow-sm active:opacity-95"
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.hairline,
        backgroundColor: colors.surface,
        padding: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View style={{ height: 52, width: 52, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: colors.sage }}>
        <Ionicons name={PROVIDER_TYPE_ICON[provider.type]} size={22} color={colors.saffronSoft} />
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={{ flexShrink: 1, fontSize: 15, fontFamily: fonts.bodySemi, color: colors.sage }} numberOfLines={1}>
            {provider.businessName}
          </Text>
          {verified ? (
            <View style={{ height: 16, width: 16, alignItems: "center", justifyContent: "center", borderRadius: 999, backgroundColor: colors.sageLight }}>
              <Ionicons name="checkmark" size={10} color={colors.white} />
            </View>
          ) : null}
        </View>

        <View style={{ marginTop: 2, flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ fontSize: 12, fontFamily: fonts.bodyMedium, color: colors.inkSecondary }}>
            {typeLabel}
          </Text>
          <View style={{ height: 4, width: 4, borderRadius: 999, backgroundColor: colors.hairline }} />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name="star" size={12} color={colors.saffron} />
            <Text style={{ fontSize: 12, fontFamily: fonts.bodySemi, color: colors.sage }}>{ratingVal}</Text>
            <Text style={{ fontSize: 11, fontFamily: fonts.body, color: colors.inkMuted }}>({reviewCnt})</Text>
          </View>
        </View>

        {location ? (
          <View style={{ marginTop: 4, flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name="location-outline" size={12} color={colors.inkMuted} />
            <Text style={{ flex: 1, fontSize: 12, fontFamily: fonts.body, color: colors.inkMuted }} numberOfLines={1}>
              {location}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={{ height: 32, width: 32, alignItems: "center", justifyContent: "center", borderRadius: 999, backgroundColor: colors.sand }}>
        <Ionicons name="chevron-forward" size={16} color={colors.sage} />
      </View>
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

  return (
    <SafeAreaView className="flex-1 bg-background" style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 28 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor={colors.sageLight}
          />
        }
      >
        <View style={{ position: "relative", overflow: "hidden", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}>
          <LinearGradient
            colors={[colors.sageDark, colors.sage, colors.sageLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
          />

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
            <View>
              <Text style={{ fontSize: 13, color: colors.saffronSoft, fontFamily: fonts.bodySemi }}>
                {firstName ? `Namaste, ${firstName} \u{1F64F}` : "Welcome to AyurPass \u{1F64F}"}
              </Text>
              <Text style={{ fontSize: 26, fontFamily: fonts.display, color: colors.white, marginTop: 2 }}>
                Discover <Text style={{ color: colors.saffronSoft }}>wellness</Text>
              </Text>
            </View>
            <View style={{ height: 44, width: 44, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)" }}>
              <Ionicons name="sparkles" size={22} color={colors.saffronSoft} />
            </View>
          </View>
        </View>

        {/* Overlapping Content Container */}
        <View style={{ marginTop: -12, paddingHorizontal: 20 }}>
          {/* Limited time offers card */}
          <Pressable
            onPress={() => router.push("/(tabs)/offers")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              borderRadius: 20,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.hairline,
              paddingHorizontal: 16,
              paddingVertical: 14,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <View style={{ height: 36, width: 36, alignItems: "center", justifyContent: "center", borderRadius: 999, backgroundColor: colors.saffronSoft }}>
              <Ionicons name="gift-outline" size={18} color={colors.saffron} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontFamily: fonts.bodyMedium, textTransform: "uppercase", letterSpacing: 0.5, color: colors.saffron }}>
                Limited-time deals
              </Text>
              <Text style={{ marginTop: 2, fontSize: 15, fontFamily: fonts.bodySemi, color: colors.sage }}>
                Wellness offers & clinic passes
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.sage} />
          </Pressable>

          {/* Name / category search */}
          <View style={{ marginTop: 14, minHeight: 48, flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 999, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 10 }}>
            <Ionicons name="search-outline" size={18} color={colors.inkMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search clinic, yoga, spa..."
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
            {isFetching && !isRefetching ? (
              <Ionicons name="sync-outline" size={16} color={colors.sageLight} />
            ) : null}
          </View>

          {/* Location search + Near me */}
          <View style={{ marginTop: 10, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ minHeight: 48, flex: 1, flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 10 }}>
              <Ionicons name="location-outline" size={18} color={colors.inkMuted} />
              <TextInput
                value={locationQuery}
                onChangeText={setLocationQuery}
                placeholder="City or country"
                placeholderTextColor={colors.inkMuted}
                className="flex-1 font-body text-base text-foreground"
                style={{ flex: 1, fontSize: 16, color: colors.foreground, fontFamily: fonts.body }}
                autoCapitalize="words"
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
            </View>
            <Pressable
              onPress={() => void locateNearMe()}
              disabled={nearBusy}
              style={{ minHeight: 48, alignItems: "center", justifyContent: "center", borderRadius: 999, backgroundColor: "rgba(45,90,71,0.12)", paddingHorizontal: 14 }}
              accessibilityLabel="Near me"
            >
              <Ionicons
                name={nearBusy ? "hourglass-outline" : "navigate-outline"}
                size={20}
                color={colors.sage}
              />
            </Pressable>
          </View>
          {nearError ? (
            <Text style={{ marginTop: 6, paddingHorizontal: 4, fontSize: 12, fontFamily: fonts.bodyMedium, color: colors.danger }}>{nearError}</Text>
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
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    borderRadius: 999,
                    borderWidth: 1,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderColor: active ? colors.sage : colors.hairline,
                    backgroundColor: active ? colors.sage : colors.surface,
                  }}
                >
                  <Ionicons
                    name={chip.icon}
                    size={15}
                    color={active ? colors.saffronSoft : colors.sage}
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: fonts.bodySemi,
                      color: active ? colors.white : colors.sage,
                    }}
                  >
                    {chip.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* View mode: list / grid / map */}
          <View style={{ marginBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 13, fontFamily: fonts.bodyMedium, color: colors.inkMuted }}>
              {isLoading && !data
                ? "…"
                : `${providers.length} ${providers.length === 1 ? "practice" : "practices"}`}
            </Text>
            <View style={{ flexDirection: "row", borderRadius: 999, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.surface, padding: 2 }}>
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
                  style={{
                    borderRadius: 999,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    backgroundColor: viewMode === mode ? colors.sage : "transparent",
                  }}
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

          <View style={{ marginTop: 4 }}>
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
              <View style={{ marginTop: 4 }}>
                <ProviderMapView providers={providers} height={480} />
              </View>
            ) : viewMode === "grid" ? (
              <View
                style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", maxWidth: width - 40 }}
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
              <View style={{ gap: 12 }}>
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
