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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts, radius } from "../theme";

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
  const inner = (
    <View style={[padded && { paddingHorizontal: 20 }, style]}>{children}</View>
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={{ paddingVertical: 20, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
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
        secondary && { color: colors.inkSecondary },
        muted && { color: colors.inkMuted },
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
    leaf: { bg: "rgba(61,102,80,0.12)", fg: colors.leaf },
    gold: { bg: "rgba(185,137,47,0.14)", fg: colors.gold },
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
    <View style={styles.errorNote}>
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
      {body ? <Body muted style={{ textAlign: "center", marginTop: 6 }}>{body}</Body> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  display: { fontFamily: fonts.display, fontSize: 30, color: colors.forest, lineHeight: 36 },
  title: { fontFamily: fonts.display, fontSize: 22, color: colors.forest },
  body: { fontFamily: fonts.body, fontSize: 15, color: colors.foreground, lineHeight: 22 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 16,
  },
  button: {
    borderRadius: radius.full,
    paddingVertical: 15,
    paddingHorizontal: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { fontFamily: fonts.bodySemi, fontSize: 15 },
  label: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.foreground, marginBottom: 6 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.foreground,
  },
  badge: { alignSelf: "flex-start", borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontFamily: fonts.bodyMedium, fontSize: 12 },
  errorNote: {
    backgroundColor: "rgba(180,35,24,0.08)",
    borderWidth: 1,
    borderColor: "rgba(180,35,24,0.25)",
    borderRadius: radius.md,
    padding: 12,
    marginVertical: 4,
  },
  errorText: { fontFamily: fonts.body, fontSize: 14, color: colors.danger },
  empty: {
    borderWidth: 1,
    borderColor: colors.hairline,
    borderStyle: "dashed",
    borderRadius: radius.lg,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  emptyTitle: { fontFamily: fonts.display, fontSize: 18, color: colors.forest },
});
