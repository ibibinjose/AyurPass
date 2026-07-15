import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { formatMoney } from "../api";
import { SERVICE_CATEGORY_ICON, SERVICE_CATEGORY_LABEL } from "../catalog";
import type { Service } from "../types";
import { colors, fonts, radius } from "../theme";

export function ServiceCard({
  service,
  onPress,
  showProvider = true,
}: {
  service: Service;
  onPress: () => void;
  showProvider?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name={SERVICE_CATEGORY_ICON[service.category]} size={20} color={colors.leaf} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name} numberOfLines={2}>
          {service.name}
        </Text>
        {showProvider && service.provider ? (
          <Text style={styles.provider} numberOfLines={1}>
            {service.provider.businessName}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          <Text style={styles.category}>{SERVICE_CATEGORY_LABEL[service.category]}</Text>
          <Text style={styles.dot}>·</Text>
          <Ionicons name="time-outline" size={13} color={colors.inkMuted} />
          <Text style={styles.meta}>{service.durationMinutes} min</Text>
          {service.isVirtual ? (
            <>
              <Text style={styles.dot}>·</Text>
              <Ionicons name="videocam-outline" size={13} color={colors.inkMuted} />
              <Text style={styles.meta}>Virtual</Text>
            </>
          ) : null}
        </View>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={styles.price}>{formatMoney(service.price, service.currency)}</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.inkMuted} style={{ marginTop: 6 }} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.lg,
    padding: 14,
  },
  iconWrap: {
    height: 42,
    width: 42,
    borderRadius: 21,
    backgroundColor: "rgba(61,102,80,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.forest, lineHeight: 20 },
  provider: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSecondary, marginTop: 2 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 5, flexWrap: "wrap" },
  category: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.leaf },
  meta: { fontFamily: fonts.body, fontSize: 12, color: colors.inkMuted },
  dot: { color: colors.inkMuted, fontSize: 12 },
  price: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.foreground },
});
