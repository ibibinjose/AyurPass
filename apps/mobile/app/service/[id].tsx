import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Badge, Body, Button, EmptyState, Loading, Title } from "../../src/components/ui";
import { formatMoney } from "../../src/api";
import { SERVICE_CATEGORY_ICON, SERVICE_CATEGORY_LABEL } from "../../src/catalog";
import { useServiceDetail } from "../../src/hooks/useCatalogDetail";
import { colors, fonts } from "../../src/theme";

function Fact({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        gap: 4,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.hairline,
        backgroundColor: colors.surface,
        padding: 14,
      }}
    >
      <Ionicons name={icon} size={18} color={colors.leaf} />
      <Text style={{ marginTop: 4, fontFamily: fonts.body, fontSize: 12, color: colors.inkMuted }}>{label}</Text>
      <Text style={{ fontFamily: fonts.bodySemi, fontSize: 15, color: colors.foreground }}>{value}</Text>
    </View>
  );
}

export default function ServiceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: service, isLoading } = useServiceDetail(id);

  if (isLoading && service === undefined) {
    return (
      <SafeAreaView className="flex-1 bg-background" style={{ flex: 1, backgroundColor: colors.background }} edges={["bottom"]}>
        <Loading />
      </SafeAreaView>
    );
  }
  if (!service) {
    return (
      <SafeAreaView className="flex-1 bg-background p-5" style={{ flex: 1, backgroundColor: colors.background, padding: 20 }} edges={["bottom"]}>
        <EmptyState title="Service not found" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" style={{ flex: 1, backgroundColor: colors.background }} edges={["bottom"]}>
      <View style={{ flex: 1, padding: 20 }}>
        {/* Top Hero Banner */}
        <View style={{ position: "relative", overflow: "hidden", borderRadius: 24, padding: 20, marginBottom: 16 }}>
          <LinearGradient
            colors={[colors.forestDeep, colors.forest, colors.leaf]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
          />

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ height: 48, width: 48, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "rgba(255,255,255,0.18)" }}>
              <Ionicons name={SERVICE_CATEGORY_ICON[service.category]} size={26} color={colors.goldSoft} />
            </View>
            <Pressable
              onPress={() => router.back()}
              style={{ height: 36, width: 36, alignItems: "center", justifyContent: "center", borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)" }}
            >
              <Ionicons name="close" size={20} color={colors.white} />
            </Pressable>
          </View>

          <Title style={{ marginTop: 14, fontSize: 24, lineHeight: 30, color: colors.white }}>{service.name}</Title>

          {service.provider ? (
            <Pressable onPress={() => router.push(`/provider/${service.providerId}`)} hitSlop={8} style={{ marginTop: 6 }}>
              <Text style={{ fontSize: 14, fontFamily: fonts.bodySemi, color: colors.goldSoft }}>
                {service.provider.businessName} ›
              </Text>
            </Pressable>
          ) : null}
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          <Badge tone="leaf">{SERVICE_CATEGORY_LABEL[service.category]}</Badge>
          {service.isVirtual ? <Badge tone="gold">Virtual</Badge> : null}
        </View>

        <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
          <Fact icon="time-outline" label="Duration" value={`${service.durationMinutes} min`} />
          <Fact
            icon="people-outline"
            label="Group size"
            value={service.maxParticipants > 1 ? `Up to ${service.maxParticipants}` : "1-on-1"}
          />
        </View>

        {service.description ? (
          <Body secondary style={{ fontSize: 15, lineHeight: 22, color: colors.inkSecondary }}>
            {service.description}
          </Body>
        ) : null}

        <View style={{ flex: 1 }} />

        <View style={{ flexDirection: "row", alignItems: "center", borderTopWidth: 1, borderTopColor: colors.hairline, paddingTop: 16 }}>
          <View>
            <Text style={{ fontSize: 12, fontFamily: fonts.body, color: colors.inkMuted }}>Price</Text>
            <Text style={{ fontSize: 24, fontFamily: fonts.display, color: colors.forest }}>
              {formatMoney(service.price, service.currency)}
            </Text>
          </View>
          <Button
            title="Book this session"
            onPress={() => router.push(`/book/${service.id}`)}
            style={{ flex: 1, marginLeft: 16, backgroundColor: colors.forest, borderRadius: 999 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
