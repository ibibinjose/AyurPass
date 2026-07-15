import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Badge, Body, Button, EmptyState, Loading, Title } from "../../src/components/ui";
import { api, formatMoney } from "../../src/api";
import { SERVICE_CATEGORY_ICON, SERVICE_CATEGORY_LABEL } from "../../src/catalog";
import type { Service } from "../../src/types";
import { colors, fonts } from "../../src/theme";

function Fact({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Ionicons name={icon} size={18} color={colors.leaf} />
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

export default function ServiceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [service, setService] = useState<Service | null | undefined>(undefined);

  useEffect(() => {
    if (!id) return;
    api.service(id).then(setService).catch(() => setService(null));
  }, [id]);

  if (service === undefined) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["bottom"]}>
        <Loading />
      </SafeAreaView>
    );
  }
  if (service === null) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: 20 }} edges={["bottom"]}>
        <EmptyState title="Service not found" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["bottom"]}>
      <View style={{ flex: 1, padding: 20 }}>
        <View style={styles.iconWrap}>
          <Ionicons name={SERVICE_CATEGORY_ICON[service.category]} size={26} color={colors.leaf} />
        </View>
        <Title style={{ marginTop: 16, fontSize: 26, lineHeight: 32 }}>{service.name}</Title>
        {service.provider ? (
          <Pressable onPress={() => router.push(`/provider/${service.providerId}`)}>
            <Text style={styles.provider}>{service.provider.businessName} ›</Text>
          </Pressable>
        ) : null}

        <View style={{ flexDirection: "row", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <Badge tone="leaf">{SERVICE_CATEGORY_LABEL[service.category]}</Badge>
          {service.isVirtual ? <Badge tone="gold">Virtual</Badge> : null}
        </View>

        <View style={styles.facts}>
          <Fact icon="time-outline" label="Duration" value={`${service.durationMinutes} min`} />
          <Fact
            icon="people-outline"
            label="Group size"
            value={service.maxParticipants > 1 ? `Up to ${service.maxParticipants}` : "1-on-1"}
          />
        </View>

        {service.description ? (
          <Body secondary style={{ marginTop: 18, lineHeight: 22 }}>
            {service.description}
          </Body>
        ) : null}

        <View style={{ flex: 1 }} />

        <View style={styles.bar}>
          <View>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.price}>{formatMoney(service.price, service.currency)}</Text>
          </View>
          <Button
            title="Book this session"
            onPress={() => router.push(`/book/${service.id}`)}
            style={{ flex: 1, marginLeft: 16 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    height: 52,
    width: 52,
    borderRadius: 26,
    backgroundColor: "rgba(61,102,80,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  provider: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.leaf, marginTop: 8 },
  facts: { flexDirection: "row", gap: 12, marginTop: 20 },
  fact: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  factLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.inkMuted, marginTop: 4 },
  factValue: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.foreground },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    paddingTop: 16,
  },
  priceLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.inkMuted },
  price: { fontFamily: fonts.display, fontSize: 24, color: colors.forest },
});
