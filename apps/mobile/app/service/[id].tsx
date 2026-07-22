import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Badge, Body, Button, EmptyState, Loading, Title } from "../../src/components/ui";
import { formatMoney } from "../../src/api";
import { SERVICE_CATEGORY_ICON, SERVICE_CATEGORY_LABEL } from "../../src/catalog";
import { useServiceDetail } from "../../src/hooks/useCatalogDetail";
import { colors } from "../../src/theme";

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
    <View className="flex-1 gap-1 rounded-md border border-hairline bg-surface p-3.5">
      <Ionicons name={icon} size={18} color={colors.leaf} />
      <Text className="mt-1 font-body text-xs text-ink-muted">{label}</Text>
      <Text className="font-body-semi text-[15px] text-foreground">{value}</Text>
    </View>
  );
}

export default function ServiceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: service, isLoading } = useServiceDetail(id);

  if (isLoading && service === undefined) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
        <Loading />
      </SafeAreaView>
    );
  }
  if (!service) {
    return (
      <SafeAreaView className="flex-1 bg-background p-5" edges={["bottom"]}>
        <EmptyState title="Service not found" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <View className="flex-1 p-5">
        <View className="h-[52px] w-[52px] items-center justify-center rounded-full bg-leaf/10">
          <Ionicons name={SERVICE_CATEGORY_ICON[service.category]} size={26} color={colors.leaf} />
        </View>
        <Title className="mt-4 text-[26px] leading-8">{service.name}</Title>
        {service.provider ? (
          <Pressable onPress={() => router.push(`/provider/${service.providerId}`)} hitSlop={8}>
            <Text className="mt-2 font-body-medium text-[15px] text-leaf">
              {service.provider.businessName} ›
            </Text>
          </Pressable>
        ) : null}

        <View className="mt-3 flex-row flex-wrap gap-2">
          <Badge tone="leaf">{SERVICE_CATEGORY_LABEL[service.category]}</Badge>
          {service.isVirtual ? <Badge tone="gold">Virtual</Badge> : null}
        </View>

        <View className="mt-5 flex-row gap-3">
          <Fact icon="time-outline" label="Duration" value={`${service.durationMinutes} min`} />
          <Fact
            icon="people-outline"
            label="Group size"
            value={service.maxParticipants > 1 ? `Up to ${service.maxParticipants}` : "1-on-1"}
          />
        </View>

        {service.description ? (
          <Body secondary className="mt-[18px] leading-[22px]">
            {service.description}
          </Body>
        ) : null}

        <View className="flex-1" />

        <View className="flex-row items-center border-t border-hairline pt-4">
          <View>
            <Text className="font-body text-xs text-ink-muted">Price</Text>
            <Text className="font-display text-2xl text-forest">
              {formatMoney(service.price, service.currency)}
            </Text>
          </View>
          <Button
            title="Book this session"
            onPress={() => router.push(`/book/${service.id}`)}
            className="ml-4 flex-1"
            style={{ flex: 1, marginLeft: 16 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
