import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Badge, Body, EmptyState, ErrorNote, Loading, Title } from "../../src/components/ui";
import { ServiceCard } from "../../src/components/ServiceCard";
import { api } from "../../src/api";
import { formatAddress, PROVIDER_TYPE_ICON, PROVIDER_TYPE_LABEL } from "../../src/catalog";
import type { Provider, Service } from "../../src/types";
import { colors, fonts } from "../../src/theme";

export default function ProviderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null | undefined>(undefined);
  const [services, setServices] = useState<Service[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api.provider(id).then(setProvider).catch(() => setProvider(null));
    api.servicesByProvider(id).then(setServices).catch(() => setServices([]));
  }, [id]);

  if (provider === undefined) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["bottom"]}>
        <Loading />
      </SafeAreaView>
    );
  }

  if (provider === null) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: 20 }} edges={["bottom"]}>
        <EmptyState title="Provider not found" body="This listing may have been removed." />
      </SafeAreaView>
    );
  }

  const location = formatAddress(provider.address);
  const verified = provider.verificationStatus === "verified";
  const about = provider.brandProfile?.about;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <Ionicons name={PROVIDER_TYPE_ICON[provider.type]} size={28} color={colors.goldSoft} />
          </View>
          <View style={{ flex: 1 }}>
            <Title>{provider.businessName}</Title>
            <Text style={styles.type}>{PROVIDER_TYPE_LABEL[provider.type]}</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          {verified ? (
            <Badge tone="leaf">✓ Verified</Badge>
          ) : (
            <Badge tone="muted">Pending verification</Badge>
          )}
          {location ? <Badge tone="muted">{location}</Badge> : null}
        </View>

        {about ? (
          <Body secondary style={{ marginTop: 16, lineHeight: 22 }}>
            {about}
          </Body>
        ) : null}

        <Title style={{ fontSize: 18, marginTop: 28, marginBottom: 12 }}>Services</Title>
        <ErrorNote message={error} />
        {services === null ? (
          <Loading />
        ) : services.length === 0 ? (
          <EmptyState title="No services listed yet" />
        ) : (
          <View style={{ gap: 12 }}>
            {services.map((s) => (
              <ServiceCard
                key={s.id}
                service={s}
                showProvider={false}
                onPress={() => router.push(`/service/${s.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 14 },
  iconWrap: {
    height: 60,
    width: 60,
    borderRadius: 30,
    backgroundColor: colors.forest,
    alignItems: "center",
    justifyContent: "center",
  },
  type: { fontFamily: fonts.body, fontSize: 14, color: colors.inkSecondary, marginTop: 2 },
});
