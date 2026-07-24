import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { formatMoney } from "../api";
import { formatCode, SERVICE_CATEGORY_ICON, SERVICE_CATEGORY_LABEL } from "../catalog";
import type { Service } from "../types";
import { colors } from "../theme";

export function ServiceCard({
  service,
  onPress,
  showProvider = true,
  compact = false,
}: {
  service: Service;
  onPress: () => void;
  showProvider?: boolean;
  compact?: boolean;
}) {
  const code = service.code ? formatCode(service.code) : null;
  const catLabel = SERVICE_CATEGORY_LABEL[service.category];

  if (compact) {
    return (
      <Pressable
        onPress={onPress}
        className="rounded-2xl border border-hairline bg-surface p-3 active:opacity-90"
      >
        <View className="mb-2 h-9 w-9 items-center justify-center rounded-full bg-leaf/10">
          <Ionicons name={SERVICE_CATEGORY_ICON[service.category]} size={18} color={colors.leaf} />
        </View>
        <Text className="font-body-semi text-[14px] leading-5 text-forest" numberOfLines={2}>
          {service.name}
        </Text>
        <View className="mt-1 flex-row flex-wrap items-center gap-1">
          <Text className="font-body-medium text-[11px] text-leaf">{catLabel}</Text>
          {code ? (
            <Text className="font-body-medium text-[10px] text-ink-muted">{code}</Text>
          ) : null}
        </View>
        <Text className="mt-1.5 font-body-semi text-[14px] text-foreground">
          {formatMoney(service.price, service.currency)}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      className="min-h-[72px] flex-row items-center gap-3 rounded-2xl border border-hairline bg-surface p-3.5 active:opacity-90"
    >
      <View className="h-[42px] w-[42px] items-center justify-center rounded-full bg-leaf/10">
        <Ionicons name={SERVICE_CATEGORY_ICON[service.category]} size={20} color={colors.leaf} />
      </View>
      <View className="flex-1">
        <Text className="font-body-semi text-[15px] leading-5 text-forest" numberOfLines={2}>
          {service.name}
        </Text>
        {showProvider && service.provider ? (
          <Text className="mt-0.5 font-body text-[13px] text-ink-secondary" numberOfLines={1}>
            {service.provider.businessName}
          </Text>
        ) : null}
        <View className="mt-1 flex-row flex-wrap items-center gap-1">
          <Text className="font-body-medium text-xs text-leaf">{catLabel}</Text>
          {code ? (
            <>
              <Text className="text-xs text-ink-muted">·</Text>
              <Text className="font-body-medium text-[11px] text-ink-muted">{code}</Text>
            </>
          ) : null}
          <Text className="text-xs text-ink-muted">·</Text>
          <Ionicons name="time-outline" size={13} color={colors.inkMuted} />
          <Text className="font-body text-xs text-ink-muted">{service.durationMinutes} min</Text>
          {service.isVirtual ? (
            <>
              <Text className="text-xs text-ink-muted">·</Text>
              <Ionicons name="videocam-outline" size={13} color={colors.inkMuted} />
              <Text className="font-body text-xs text-ink-muted">Virtual</Text>
            </>
          ) : null}
        </View>
      </View>
      <View className="items-end">
        <Text className="font-body-semi text-[15px] text-foreground">
          {formatMoney(service.price, service.currency)}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={colors.inkMuted} style={{ marginTop: 6 }} />
      </View>
    </Pressable>
  );
}
