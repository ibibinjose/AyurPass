import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { formatMoney } from "../api";
import { formatCode, SERVICE_CATEGORY_ICON, SERVICE_CATEGORY_LABEL } from "../catalog";
import type { Service } from "../types";
import { colors, fonts } from "../theme";

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
        className="rounded-2xl border border-hairline bg-surface p-3 active:opacity-90 shadow-sm"
        style={{
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.hairline,
          backgroundColor: colors.surface,
          padding: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 5,
          elevation: 2,
        }}
      >
        <View style={{ marginBottom: 8, height: 36, width: 36, alignItems: "center", justifyContent: "center", borderRadius: 999, backgroundColor: "rgba(47,90,68,0.1)" }}>
          <Ionicons name={SERVICE_CATEGORY_ICON[service.category]} size={18} color={colors.leaf} />
        </View>
        <Text style={{ fontSize: 14, fontFamily: fonts.bodySemi, lineHeight: 20, color: colors.forest }} numberOfLines={2}>
          {service.name}
        </Text>
        <View style={{ marginTop: 4, flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 4 }}>
          <Text style={{ fontSize: 11, fontFamily: fonts.bodyMedium, color: colors.leaf }}>{catLabel}</Text>
          {code ? (
            <Text style={{ fontSize: 10, fontFamily: fonts.bodyMedium, color: colors.inkMuted }}>{code}</Text>
          ) : null}
        </View>
        <Text style={{ marginTop: 6, fontSize: 14, fontFamily: fonts.bodySemi, color: colors.foreground }}>
          {formatMoney(service.price, service.currency)}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      className="min-h-[72px] flex-row items-center gap-3 rounded-2xl border border-hairline bg-surface p-3.5 active:opacity-90 shadow-sm"
      style={{
        minHeight: 72,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.hairline,
        backgroundColor: colors.surface,
        padding: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <View style={{ height: 42, width: 42, alignItems: "center", justifyContent: "center", borderRadius: 999, backgroundColor: "rgba(47,90,68,0.1)" }}>
        <Ionicons name={SERVICE_CATEGORY_ICON[service.category]} size={20} color={colors.leaf} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontFamily: fonts.bodySemi, lineHeight: 20, color: colors.forest }} numberOfLines={2}>
          {service.name}
        </Text>
        {showProvider && service.provider ? (
          <Text style={{ marginTop: 2, fontSize: 13, fontFamily: fonts.body, color: colors.inkSecondary }} numberOfLines={1}>
            {service.provider.businessName}
          </Text>
        ) : null}
        <View style={{ marginTop: 4, flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 4 }}>
          <Text style={{ fontSize: 12, fontFamily: fonts.bodyMedium, color: colors.leaf }}>{catLabel}</Text>
          {code ? (
            <>
              <Text style={{ fontSize: 12, color: colors.inkMuted }}>·</Text>
              <Text style={{ fontSize: 11, fontFamily: fonts.bodyMedium, color: colors.inkMuted }}>{code}</Text>
            </>
          ) : null}
          <Text style={{ fontSize: 12, color: colors.inkMuted }}>·</Text>
          <Ionicons name="time-outline" size={13} color={colors.inkMuted} />
          <Text style={{ fontSize: 12, fontFamily: fonts.body, color: colors.inkMuted }}>{service.durationMinutes} min</Text>
          {service.isVirtual ? (
            <>
              <Text style={{ fontSize: 12, color: colors.inkMuted }}>·</Text>
              <Ionicons name="videocam-outline" size={13} color={colors.inkMuted} />
              <Text style={{ fontSize: 12, fontFamily: fonts.body, color: colors.inkMuted }}>Virtual</Text>
            </>
          ) : null}
        </View>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={{ fontSize: 15, fontFamily: fonts.bodySemi, color: colors.foreground }}>
          {formatMoney(service.price, service.currency)}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={colors.inkMuted} style={{ marginTop: 6 }} />
      </View>
    </Pressable>
  );
}
