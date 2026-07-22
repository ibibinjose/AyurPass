import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Body, Display, EmptyState, ErrorNote, Loading } from "../../src/components/ui";
import { ServiceCard } from "../../src/components/ServiceCard";
import { api } from "../../src/api";
import { SERVICE_CATEGORY_LABEL } from "../../src/catalog";
import type { Service, ServiceCategory } from "../../src/types";
import { colors, fonts, radius } from "../../src/theme";

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
  const [services, setServices] = useState<Service[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (cat: ServiceCategory | "ALL") => {
    setError(null);
    try {
      setServices(await api.services(cat === "ALL" ? undefined : cat));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load services.");
      setServices([]);
    }
  }, []);

  useEffect(() => {
    setServices(null);
    load(category);
  }, [category, load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load(category);
    setRefreshing(false);
  }, [load, category]);

  const label = useMemo(
    () => (category === "ALL" ? "All" : SERVICE_CATEGORY_LABEL[category]),
    [category],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
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
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {c === "ALL" ? "All" : SERVICE_CATEGORY_LABEL[c]}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.leaf} />}
      >
        <ErrorNote message={error} />
        {services === null ? (
          <Loading />
        ) : services.length === 0 ? (
          <EmptyState title={`No ${label.toLowerCase()} sessions yet`} body="Try another category." />
        ) : (
          <View style={{ gap: 12 }}>
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

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  chipActive: { backgroundColor: colors.forest, borderColor: colors.forest },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.inkSecondary },
  chipTextActive: { color: colors.white },
});
