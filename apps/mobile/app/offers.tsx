import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Body, Display, EmptyState, ErrorNote, Loading } from "../src/components/ui";
import { api } from "../src/api";
import type { Offer } from "../src/types";
import { colors, fonts, radius } from "../src/theme";

const DISCIPLINES = [
  "All",
  "Ayurveda",
  "Yoga",
  "Spa",
  "Meditation",
  "Fitness",
  "Nutrition",
  "Retreats",
];

function OfferCard({ offer, onPress }: { offer: Offer; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.cardHeader}>
        {offer.discipline ? <Text style={styles.discipline}>{offer.discipline}</Text> : null}
        {offer.discountLabel ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{offer.discountLabel}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.title}>{offer.title}</Text>
      {offer.description ? (
        <Text style={styles.description} numberOfLines={3}>
          {offer.description}
        </Text>
      ) : null}
      {offer.code ? <Text style={styles.code}>{offer.code}</Text> : null}
    </Pressable>
  );
}

export default function OffersScreen() {
  const router = useRouter(); // back navigation
  const [offers, setOffers] = useState<Offer[] | null>(null);
  const [discipline, setDiscipline] = useState("All");
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setOffers(await api.offers());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load offers.");
      setOffers([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const shown = useMemo(
    () => (offers ?? []).filter((o) => discipline === "All" || o.discipline === discipline),
    [offers, discipline],
  );

  function openOffer(offer: Offer) {
    if (offer.ctaUrl) {
      Linking.openURL(offer.ctaUrl).catch(() => {});
      return;
    }
    const lines = [offer.description, offer.code ? `Code: ${offer.code}` : null]
      .filter(Boolean)
      .join("\n\n");
    Alert.alert(offer.title, lines || "This promotion is listed for discovery on AyurPass.");
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.leaf} />}
      >
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Display>Offers & deals</Display>
        <Body muted style={{ marginTop: 4 }}>
          Handpicked wellness promotions curated by AyurPass.
        </Body>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, marginTop: 20 }}
        >
          {DISCIPLINES.map((d) => {
            const active = d === discipline;
            return (
              <Pressable
                key={d}
                onPress={() => setDiscipline(d)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{d}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={{ marginTop: 20 }}>
          <ErrorNote message={error} />
          {offers === null ? (
            <Loading />
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  back: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.forest, marginBottom: 12 },
  chip: {
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: colors.forest, borderColor: colors.forest },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.inkSecondary },
  chipTextActive: { color: colors.white },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.lg,
    padding: 16,
    gap: 6,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  discipline: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.leaf,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  badge: {
    backgroundColor: colors.gold,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: fonts.bodySemi,
    fontSize: 10,
    color: colors.forestDeep,
    textTransform: "uppercase",
  },
  title: { fontFamily: fonts.bodySemi, fontSize: 17, color: colors.forest },
  description: { fontFamily: fonts.body, fontSize: 14, color: colors.inkSecondary, lineHeight: 20 },
  code: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 4,
    fontVariant: ["tabular-nums"],
  },
});