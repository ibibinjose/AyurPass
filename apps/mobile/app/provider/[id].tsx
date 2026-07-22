import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Badge,
  Body,
  EmptyState,
  ErrorNote,
  Loading,
  VerifiedTick,
} from "../../src/components/ui";
import { ServiceCard } from "../../src/components/ServiceCard";
import { api } from "../../src/api";
import { formatAddress, PROVIDER_TYPE_ICON, PROVIDER_TYPE_LABEL } from "../../src/catalog";
import type { Provider, Service } from "../../src/types";
import { colors, fonts, radius } from "../../src/theme";

type TabId = "about" | "services";

/**
 * Neo-minimal practice profile — gradient hero, blue tick by name,
 * status-ring avatar, sliding About / Services tabs.
 */
export default function ProviderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const pad = width >= 400 ? 20 : 16;
  const [provider, setProvider] = useState<Provider | null | undefined>(undefined);
  const [services, setServices] = useState<Service[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("about");

  useEffect(() => {
    if (!id) return;
    api.provider(id).then(setProvider).catch(() => setProvider(null));
    api.servicesByProvider(id).then(setServices).catch(() => setServices([]));
  }, [id]);

  const location = provider ? formatAddress(provider.address) : "";
  const verified = provider?.verificationStatus === "verified";
  const about = provider?.brandProfile?.about;
  const typeLabel = provider ? PROVIDER_TYPE_LABEL[provider.type] : "";

  const tabs = useMemo(
    () =>
      [
        { id: "about" as const, label: "About" },
        {
          id: "services" as const,
          label: "Services",
          count: services?.length,
        },
      ] as const,
    [services?.length],
  );

  if (provider === undefined) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["bottom"]}>
        <Loading />
      </SafeAreaView>
    );
  }

  if (provider === null) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background, padding: 20 }}
        edges={["bottom"]}
      >
        <EmptyState title="Provider not found" body="This listing may have been removed." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrap}>
          <LinearGradient
            colors={[colors.forest, colors.leaf, "#4a6b58"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.heroInner, { paddingHorizontal: pad }]}>
            <View style={styles.iconRing}>
              <View style={styles.iconInner}>
                <Ionicons
                  name={PROVIDER_TYPE_ICON[provider.type]}
                  size={32}
                  color={colors.goldSoft}
                />
              </View>
            </View>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={2}>
                {provider.businessName}
              </Text>
              {verified ? <VerifiedTick size={22} /> : null}
            </View>
            <Text style={styles.type}>{typeLabel}</Text>
            {location ? (
              <View style={styles.locRow}>
                <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.85)" />
                <Text style={styles.locText} numberOfLines={1}>
                  {location}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={{ paddingHorizontal: pad, marginTop: 14 }}>
          <View style={styles.tabBar}>
            {tabs.map((t) => {
              const active = tab === t.id;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => setTab(t.id)}
                  style={[styles.tab, active && styles.tabActive]}
                >
                  <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                    {t.label}
                    {"count" in t && t.count != null ? ` ${t.count}` : ""}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <ErrorNote message={error} />

          {tab === "about" ? (
            <View style={{ marginTop: 16, gap: 12 }}>
              {about ? (
                <Body secondary style={{ lineHeight: 24, fontSize: 16 }}>
                  {about}
                </Body>
              ) : (
                <EmptyState title="No story yet" body="This practice hasn't written an about section." />
              )}
              {(provider.registrationNumber || provider.licenceNumber) && (
                <View style={styles.credCard}>
                  {provider.registrationNumber ? (
                    <Text style={styles.credLine}>
                      Registration ·{" "}
                      <Text style={styles.credValue}>{provider.registrationNumber}</Text>
                    </Text>
                  ) : null}
                  {provider.licenceNumber ? (
                    <Text style={styles.credLine}>
                      Licence · <Text style={styles.credValue}>{provider.licenceNumber}</Text>
                    </Text>
                  ) : null}
                </View>
              )}
              {provider.brandProfile?.tags && provider.brandProfile.tags.length > 0 ? (
                <View style={styles.tagRow}>
                  {provider.brandProfile.tags.slice(0, 8).map((tag) => (
                    <Badge key={tag} tone="muted">
                      {tag}
                    </Badge>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}

          {tab === "services" ? (
            <View style={{ marginTop: 16, gap: 12 }}>
              {services === null ? (
                <Loading />
              ) : services.length === 0 ? (
                <EmptyState title="No services listed yet" />
              ) : (
                services.map((s) => (
                  <ServiceCard
                    key={s.id}
                    service={s}
                    onPress={() => router.push(`/service/${s.id}`)}
                  />
                ))
              )}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    minHeight: 200,
    paddingTop: 24,
    paddingBottom: 28,
  },
  heroInner: {
    alignItems: "center",
  },
  iconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    padding: 4,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginBottom: 14,
  },
  iconInner: {
    flex: 1,
    borderRadius: 40,
    backgroundColor: colors.forestDeep,
    alignItems: "center",
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    maxWidth: "92%",
    justifyContent: "center",
  },
  name: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.white,
    textAlign: "center",
    flexShrink: 1,
  },
  type: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: "rgba(255,255,255,0.88)",
    marginTop: 6,
  },
  locRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
    maxWidth: "90%",
  },
  locText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.clay,
    borderRadius: radius.full,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    minHeight: 40,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  tabActive: {
    backgroundColor: colors.surface,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tabLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.inkMuted,
  },
  tabLabelActive: {
    color: colors.forest,
  },
  credCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 14,
    gap: 6,
  },
  credLine: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.inkMuted,
  },
  credValue: {
    fontFamily: fonts.bodySemi,
    color: colors.foreground,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});
