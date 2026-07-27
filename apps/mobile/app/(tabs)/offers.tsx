import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState, ErrorNote, Loading } from "../../src/components/ui";
import { useOffers } from "../../src/hooks/useCatalogDetail";
import type { Offer } from "../../src/types";
import { colors, fonts } from "../../src/theme";

const DISCIPLINES: { id: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: "All", label: "All Deals", icon: "sparkles-outline" },
  { id: "Ayurveda", label: "Ayurveda", icon: "leaf-outline" },
  { id: "Yoga", label: "Yoga", icon: "fitness-outline" },
  { id: "Spa", label: "Spa", icon: "water-outline" },
  { id: "Meditation", label: "Meditation", icon: "flower-outline" },
  { id: "Fitness", label: "Fitness", icon: "barbell-outline" },
  { id: "Nutrition", label: "Nutrition", icon: "nutrition-outline" },
  { id: "Retreats", label: "Retreats", icon: "earth-outline" },
];

function OfferCard({ offer, onPress }: { offer: Offer; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={offer.title}
      className="gap-2 rounded-2xl border border-hairline bg-surface p-4 shadow-sm active:opacity-90"
      style={{
        gap: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.hairline,
        backgroundColor: colors.surface,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        {offer.discipline ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.clay, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 }}>
            <Ionicons name="pricetag-outline" size={11} color={colors.leaf} />
            <Text style={{ fontSize: 11, fontFamily: fonts.bodySemi, color: colors.forest, textTransform: "uppercase" }}>
              {offer.discipline}
            </Text>
          </View>
        ) : (
          <View />
        )}
        {offer.discountLabel ? (
          <View style={{ borderRadius: 999, backgroundColor: colors.gold, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ fontSize: 11, fontFamily: fonts.bodySemi, color: colors.forestDeep, textTransform: "uppercase" }}>
              {offer.discountLabel}
            </Text>
          </View>
        ) : null}
      </View>

      <Text style={{ fontSize: 17, fontFamily: fonts.bodySemi, color: colors.forest, marginTop: 2 }}>{offer.title}</Text>

      {offer.description ? (
        <Text style={{ fontSize: 14, fontFamily: fonts.body, color: colors.inkSecondary, lineHeight: 20 }} numberOfLines={3}>
          {offer.description}
        </Text>
      ) : null}

      <View style={{ marginTop: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.hairline }}>
        {offer.code ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(221,214,200,0.4)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
            <Ionicons name="copy-outline" size={12} color={colors.forest} />
            <Text style={{ fontSize: 12, fontFamily: fonts.bodySemi, color: colors.forest }}>PROMO: {offer.code}</Text>
          </View>
        ) : (
          <Text style={{ fontSize: 12, fontFamily: fonts.bodyMedium, color: colors.leaf }}>Instant Pass Deal</Text>
        )}

        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Text style={{ fontSize: 13, fontFamily: fonts.bodySemi, color: colors.forest }}>Claim Deal</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.forest} />
        </View>
      </View>
    </Pressable>
  );
}

export default function OffersTab() {
  const { data, error, isLoading, refetch, isRefetching } = useOffers();
  const [discipline, setDiscipline] = useState("All");

  const offers = data ?? [];
  const shown = useMemo(
    () => offers.filter((o) => discipline === "All" || o.discipline === discipline),
    [offers, discipline],
  );
  const errMsg =
    error instanceof Error ? error.message : error ? "Couldn't load offers." : null;

  function openOffer(offer: Offer) {
    if (offer.ctaUrl) {
      Linking.openURL(offer.ctaUrl).catch(() => {});
      return;
    }
    const lines = [offer.description, offer.code ? `Promo Code: ${offer.code}` : null]
      .filter(Boolean)
      .join("\n\n");
    Alert.alert(offer.title, lines || "This promotion is listed on AyurPass.");
  }

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
                AyurPass Perks 🎁
              </Text>
              <Text style={{ fontSize: 26, fontFamily: fonts.display, color: colors.white, marginTop: 2 }}>
                Offers & <Text style={{ color: colors.goldSoft }}>deals</Text>
              </Text>
            </View>
            <View style={{ height: 44, width: 44, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "rgba(255,255,255,0.15)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" }}>
              <Ionicons name="gift-outline" size={22} color={colors.goldSoft} />
            </View>
          </View>
        </View>

        {/* Content Container */}
        <View style={{ marginTop: -12, paddingHorizontal: 20 }}>
          {/* Discipline filter chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingVertical: 14 }}
          >
            {DISCIPLINES.map((d) => {
              const active = d.id === discipline;
              return (
                <Pressable
                  key={d.id}
                  onPress={() => setDiscipline(d.id)}
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
                    name={d.icon}
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
                    {d.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={{ marginTop: 4 }}>
            <ErrorNote message={errMsg} />
            {isLoading && !data ? (
              <Loading label="Loading offers…" />
            ) : shown.length === 0 ? (
              <EmptyState title="No offers right now" body="Check back soon for new deals." />
            ) : (
              <View style={{ gap: 12 }}>
                {shown.map((o) => (
                  <OfferCard key={o.id} offer={o} onPress={() => openOffer(o)} />
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
