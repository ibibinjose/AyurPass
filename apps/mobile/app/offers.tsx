import { useRouter } from "expo-router";
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
import { Body, Display, EmptyState, ErrorNote, Loading } from "../src/components/ui";
import { useOffers } from "../src/hooks/useCatalogDetail";
import type { Offer } from "../src/types";
import { colors } from "../src/theme";

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
    <Pressable
      onPress={onPress}
      className="gap-1.5 rounded-lg border border-hairline bg-surface p-4 active:opacity-90"
    >
      <View className="flex-row items-center justify-between">
        {offer.discipline ? (
          <Text className="font-body-medium text-[11px] uppercase tracking-wide text-leaf">
            {offer.discipline}
          </Text>
        ) : (
          <View />
        )}
        {offer.discountLabel ? (
          <View className="rounded-full bg-gold px-2.5 py-1">
            <Text className="font-body-semi text-[10px] uppercase text-forest-deep">
              {offer.discountLabel}
            </Text>
          </View>
        ) : null}
      </View>
      <Text className="font-body-semi text-[17px] text-forest">{offer.title}</Text>
      {offer.description ? (
        <Text className="font-body text-sm leading-5 text-ink-secondary" numberOfLines={3}>
          {offer.description}
        </Text>
      ) : null}
      {offer.code ? (
        <Text className="mt-1 font-body text-xs text-ink-muted">{offer.code}</Text>
      ) : null}
    </Pressable>
  );
}

export default function OffersScreen() {
  const router = useRouter();
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
    const lines = [offer.description, offer.code ? `Code: ${offer.code}` : null]
      .filter(Boolean)
      .join("\n\n");
    Alert.alert(offer.title, lines || "This promotion is listed for discovery on AyurPass.");
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
            tintColor={colors.leaf}
          />
        }
      >
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text className="mb-3 font-body-medium text-sm text-forest">← Back</Text>
        </Pressable>
        <Display>Offers & deals</Display>
        <Body muted className="mt-1">
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
                className={`rounded-full border px-3.5 py-2 ${
                  active ? "border-forest bg-forest" : "border-hairline bg-surface"
                }`}
              >
                <Text
                  className={`font-body-medium text-[13px] ${
                    active ? "text-white" : "text-ink-secondary"
                  }`}
                >
                  {d}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View className="mt-5">
          <ErrorNote message={errMsg} />
          {isLoading && !data ? (
            <Loading />
          ) : shown.length === 0 ? (
            <EmptyState title="No offers right now" body="Check back soon for new deals." />
          ) : (
            <View className="gap-3">
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
