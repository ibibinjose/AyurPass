import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, TextInput, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Badge, Body, Display, EmptyState, ErrorNote, Loading } from "../../src/components/ui";
import { useAuth } from "../../src/auth";
import { api } from "../../src/api";
import { formatAddress, PROVIDER_TYPE_ICON, PROVIDER_TYPE_LABEL } from "../../src/catalog";
import type { Provider } from "../../src/types";
import { colors, fonts, radius } from "../../src/theme";

function ProviderCard({ provider, onPress }: { provider: Provider; onPress: () => void }) {
  const location = formatAddress(provider.address);
  const verified = provider.verificationStatus === "verified";
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name={PROVIDER_TYPE_ICON[provider.type]} size={22} color={colors.goldSoft} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={styles.name} numberOfLines={1}>
            {provider.businessName}
          </Text>
          {verified ? (
            <View
              accessibilityLabel="Verified"
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: colors.systemBlue,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="checkmark" size={11} color={colors.white} />
            </View>
          ) : null}
        </View>
        <Text style={styles.type}>{PROVIDER_TYPE_LABEL[provider.type]}</Text>
        {location ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
            <Ionicons name="location-outline" size={13} color={colors.inkMuted} />
            <Text style={styles.meta}>{location}</Text>
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
  const [providers, setProviders] = useState<Provider[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (q?: string) => {
    setError(null);
    try {
      const data = await api.providers(q ? { q } : undefined);
      setProviders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load providers.");
      setProviders([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Debounced server-side search.
  useEffect(() => {
    const t = setTimeout(() => load(query.trim() || undefined), 350);
    return () => clearTimeout(t);
  }, [query, load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load(query.trim() || undefined);
    setRefreshing(false);
  }, [load, query]);

  const firstName = user?.fullName?.split(" ")[0];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.leaf} />}
      >
        <Body muted>{firstName ? `Namaste, ${firstName}` : "Namaste"}</Body>
        <Display style={{ marginTop: 2 }}>Discover providers</Display>

        <Pressable onPress={() => router.push("/offers")} style={styles.offersBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.offersEyebrow}>Limited-time</Text>
            <Text style={styles.offersTitle}>Wellness offers & deals</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.goldSoft} />
        </Pressable>

        <View style={styles.search}>
          <Ionicons name="search-outline" size={18} color={colors.inkMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search clinics, studios, spas…"
            placeholderTextColor={colors.inkMuted}
            style={styles.searchInput}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {query ? (
            <Pressable onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color={colors.inkMuted} />
            </Pressable>
          ) : null}
        </View>

        <View style={{ marginTop: 20 }}>
          <ErrorNote message={error} />
          {providers === null ? (
            <Loading label="Finding wellness near you…" />
          ) : providers.length === 0 ? (
            <EmptyState title="No providers found" body="Try a different search, or pull to refresh." />
          ) : (
            <View style={{ gap: 12 }}>
              {providers.map((p) => (
                <ProviderCard key={p.id} provider={p} onPress={() => router.push(`/provider/${p.id}`)} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  offersBanner: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.forest,
    borderRadius: radius.lg,
    padding: 16,
    gap: 12,
  },
  offersEyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.goldSoft,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  offersTitle: { fontFamily: fonts.bodySemi, fontSize: 17, color: colors.white, marginTop: 2 },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.full,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 48,
    marginTop: 16,
  },
  searchInput: { flex: 1, fontFamily: fonts.body, fontSize: 16, color: colors.foreground },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.lg,
    padding: 14,
    minHeight: 72,
  },
  iconWrap: {
    height: 48,
    width: 48,
    borderRadius: 24,
    backgroundColor: colors.forest,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontFamily: fonts.bodySemi, fontSize: 17, color: colors.forest, flexShrink: 1 },
  type: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.inkSecondary, marginTop: 3 },
  meta: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.inkMuted },
});
