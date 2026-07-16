import { forwardRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewProps,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts, radius, tapMin, type as typeScale } from "../theme";

export function Screen({
  children,
  scroll = true,
  padded = true,
  style,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: ViewProps["style"];
}) {
  const { width } = useWindowDimensions();
  const horizontal = width >= 768 ? 32 : width >= 400 ? 20 : 16;
  const inner = (
    <View style={[padded && { paddingHorizontal: horizontal }, style]}>{children}</View>
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={{ paddingVertical: 20, paddingBottom: 56 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {inner}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, paddingVertical: 20 }}>{inner}</View>
      )}
    </SafeAreaView>
  );
}

export function Display({ children, style }: { children: React.ReactNode; style?: object }) {
  return <Text style={[styles.display, style]}>{children}</Text>;
}

export function Title({ children, style }: { children: React.ReactNode; style?: object }) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

export function Body({
  children,
  muted,
  secondary,
  style,
}: {
  children: React.ReactNode;
  muted?: boolean;
  secondary?: boolean;
  style?: object;
}) {
  return (
    <Text
      style={[
        styles.body,
        secondary && { color: colors.inkSecondary, fontFamily: fonts.bodyMedium },
        muted && { color: colors.inkMuted, fontFamily: fonts.bodyMedium },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewProps["style"] }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/**
 * Verified mark = tick only (no "Verified" label).
 * Matches web VerifiedTick.
 */
export function VerifiedTick({ size = 22 }: { size?: number }) {
  const icon = Math.round(size * 0.55);
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="Verified"
      style={[
        styles.verifiedTick,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Ionicons name="checkmark" size={icon} color={colors.white} />
    </View>
  );
}

export function Button({
  title,
  onPress,
  variant = "primary",
  loading,
  disabled,
  style,
}: {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "gold" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewProps["style"];
}) {
  const isDisabled = disabled || loading;
  const bg =
    variant === "primary" ? colors.forest : variant === "gold" ? colors.gold : colors.surface;
  const fg = variant === "ghost" ? colors.forest : variant === "gold" ? colors.forestDeep : colors.white;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: isDisabled ? 0.55 : pressed ? 0.9 : 1 },
        variant === "ghost" && { borderWidth: 1, borderColor: colors.hairline },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export const Field = forwardRef<TextInput, TextInputProps & { label?: string }>(
  ({ label, style, ...props }, ref) => (
    <View style={{ marginBottom: 4 }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        ref={ref}
        placeholderTextColor={colors.inkMuted}
        style={[styles.input, style]}
        {...props}
      />
    </View>
  ),
);
Field.displayName = "Field";

export function Badge({
  children,
  tone = "leaf",
}: {
  children: React.ReactNode;
  tone?: "leaf" | "gold" | "muted";
}) {
  const map = {
    leaf: { bg: "rgba(47,90,68,0.14)", fg: colors.leaf },
    gold: { bg: "rgba(166,122,36,0.16)", fg: colors.gold },
    muted: { bg: colors.clay, fg: colors.inkSecondary },
  }[tone];
  return (
    <View style={[styles.badge, { backgroundColor: map.bg }]}>
      <Text style={[styles.badgeText, { color: map.fg }]}>{children}</Text>
    </View>
  );
}

export function ErrorNote({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <View style={styles.errorNote} accessibilityRole="alert">
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

export function Loading({ label }: { label?: string }) {
  return (
    <View style={{ paddingVertical: 48, alignItems: "center", gap: 12 }}>
      <ActivityIndicator color={colors.leaf} />
      {label ? <Body muted>{label}</Body> : null}
    </View>
  );
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {body ? (
        <Body muted style={{ textAlign: "center", marginTop: 8 }}>
          {body}
        </Body>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  display: typeScale.display,
  title: typeScale.title,
  body: typeScale.body,
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 16,
  },
  button: {
    borderRadius: radius.full,
    minHeight: tapMin,
    paddingVertical: 14,
    paddingHorizontal: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { fontFamily: fonts.bodySemi, fontSize: 16 },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.foreground,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: tapMin,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.foreground,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: { fontFamily: fonts.bodySemi, fontSize: 12 },
  verifiedTick: {
    backgroundColor: colors.systemBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  errorNote: {
    backgroundColor: "rgba(180,35,24,0.08)",
    borderWidth: 1,
    borderColor: "rgba(180,35,24,0.25)",
    borderRadius: radius.md,
    padding: 12,
    marginVertical: 4,
  },
  errorText: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.danger, lineHeight: 21 },
  empty: {
    borderWidth: 1,
    borderColor: colors.hairline,
    borderStyle: "dashed",
    borderRadius: radius.lg,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  emptyTitle: { fontFamily: fonts.display, fontSize: 20, color: colors.forest },
});
