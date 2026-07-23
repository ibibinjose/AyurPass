import { forwardRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewProps,
  TextStyle,
  StyleProp,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";

export function Screen({
  children,
  scroll = true,
  padded = true,
  className,
  style,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  className?: string;
  style?: ViewProps["style"];
}) {
  const { width } = useWindowDimensions();
  const horizontal = width >= 768 ? 32 : width >= 400 ? 20 : 16;
  const inner = (
    <View className={className} style={[padded && { paddingHorizontal: horizontal }, style]}>
      {children}
    </View>
  );
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={{ paddingVertical: 20, paddingBottom: 56 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {inner}
        </ScrollView>
      ) : (
        <View className="flex-1 py-5">{inner}</View>
      )}
    </SafeAreaView>
  );
}

export function Display({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text
      className={`font-display text-[32px] leading-[38px] text-forest ${className ?? ""}`}
      style={style}
    >
      {children}
    </Text>
  );
}

export function Title({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text
      className={`font-display text-[22px] leading-7 text-forest ${className ?? ""}`}
      style={style}
    >
      {children}
    </Text>
  );
}

export function Body({
  children,
  muted,
  secondary,
  className,
  style,
}: {
  children: React.ReactNode;
  muted?: boolean;
  secondary?: boolean;
  className?: string;
  style?: StyleProp<TextStyle>;
}) {
  const tone = muted
    ? "text-ink-muted font-body-medium"
    : secondary
      ? "text-ink-secondary font-body-medium"
      : "text-foreground font-body";
  return (
    <Text className={`text-base leading-6 ${tone} ${className ?? ""}`} style={style}>
      {children}
    </Text>
  );
}

export function Card({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: ViewProps["style"];
}) {
  return (
    <View
      className={`rounded-2xl border border-hairline bg-surface p-4 ${className ?? ""}`}
      style={style}
    >
      {children}
    </View>
  );
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
      className="items-center justify-center bg-system-blue"
      style={{ width: size, height: size, borderRadius: size / 2 }}
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
  className,
  style,
}: {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "gold" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  style?: ViewProps["style"];
}) {
  const isDisabled = disabled || loading;
  const bg =
    variant === "primary"
      ? "bg-forest"
      : variant === "gold"
        ? "bg-gold"
        : "bg-surface border border-hairline";
  const fg =
    variant === "ghost" ? colors.forest : variant === "gold" ? colors.forestDeep : colors.white;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      className={`min-h-tap items-center justify-center rounded-full px-[22px] py-3.5 ${bg} ${
        isDisabled ? "opacity-55" : "active:opacity-90"
      } ${className ?? ""}`}
      style={style}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text className="font-body-semi text-base" style={{ color: fg }}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

export const Field = forwardRef<TextInput, TextInputProps & { label?: string }>(
  ({ label, className, style, ...props }, ref) => (
    <View className="mb-1">
      {label ? (
        <Text className="mb-2 font-body-semi text-sm text-foreground">{label}</Text>
      ) : null}
      <TextInput
        ref={ref}
        placeholderTextColor={colors.inkMuted}
        className={`min-h-tap rounded-md border border-hairline bg-surface px-3.5 py-3.5 font-body text-base text-foreground ${className ?? ""}`}
        style={style}
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
  const bg =
    tone === "leaf" ? "bg-leaf/15" : tone === "gold" ? "bg-gold/20" : "bg-clay";
  const fg =
    tone === "leaf" ? "text-leaf" : tone === "gold" ? "text-gold" : "text-ink-secondary";
  return (
    <View className={`self-start rounded-full px-2.5 py-1 ${bg}`}>
      <Text className={`font-body-semi text-xs ${fg}`}>{children}</Text>
    </View>
  );
}

export function ErrorNote({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <View
      className="my-1 rounded-md border border-danger/25 bg-danger/10 p-3"
      accessibilityRole="alert"
    >
      <Text className="font-body-medium text-[15px] leading-[21px] text-danger">{message}</Text>
    </View>
  );
}

export function Loading({ label }: { label?: string }) {
  return (
    <View className="items-center gap-3 py-12">
      <ActivityIndicator color={colors.leaf} />
      {label ? <Body muted>{label}</Body> : null}
    </View>
  );
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <View className="items-center rounded-2xl border border-dashed border-hairline bg-surface/60 px-5 py-10">
      <Text className="font-display text-xl text-forest">{title}</Text>
      {body ? (
        <Body muted className="mt-2 text-center" style={{ textAlign: "center", marginTop: 8 }}>
          {body}
        </Body>
      ) : null}
    </View>
  );
}
