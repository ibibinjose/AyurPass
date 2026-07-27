import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, ErrorNote } from "../../src/components/ui";
import { useAuth } from "../../src/auth";
import { ApiError } from "../../src/api";
import { colors } from "../../src/theme";

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    setError(null);
    if (!email.trim()) return setError("Please enter your email.");
    if (!password) return setError("Please enter your password.");

    setBusy(true);
    try {
      await login(email.trim(), password);
      router.replace("/(tabs)");
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? "Email or password is incorrect."
          : err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
      );
      setBusy(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }}
        >
          <View className="w-full max-w-[440px] self-center">
            {/* Header branding */}
            <View className="mb-6 items-center">
              <View className="mb-3 h-16 w-16 items-center justify-center rounded-2xl bg-forest shadow-md">
                <Ionicons name="leaf-outline" size={32} color={colors.goldSoft} />
              </View>
              <Text className="font-display text-[28px] text-forest">Welcome back</Text>
              <Text className="mt-1 text-center font-body text-[14px] text-ink-secondary leading-5">
                Sign in to manage your appointments, wellness pass, and health profile.
              </Text>
            </View>

            {/* Form Fields Card */}
            <View className="gap-4 rounded-3xl border border-hairline bg-surface p-5 shadow-sm">
              {/* Email */}
              <View>
                <Text className="mb-1.5 font-body-semi text-[13px] text-forest">Email address</Text>
                <View className="min-h-12 flex-row items-center gap-2.5 rounded-2xl border border-hairline bg-background px-3.5">
                  <Ionicons name="mail-outline" size={18} color={colors.inkMuted} />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor={colors.inkMuted}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    className="flex-1 font-body text-base text-foreground"
                  />
                </View>
              </View>

              {/* Password */}
              <View>
                <Text className="mb-1.5 font-body-semi text-[13px] text-forest">Password</Text>
                <View className="min-h-12 flex-row items-center gap-2.5 rounded-2xl border border-hairline bg-background px-3.5">
                  <Ionicons name="lock-closed-outline" size={18} color={colors.inkMuted} />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor={colors.inkMuted}
                    secureTextEntry={!showPassword}
                    className="flex-1 font-body text-base text-foreground"
                  />
                  <Pressable
                    onPress={() => setShowPassword((v) => !v)}
                    hitSlop={8}
                    accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={18}
                      color={colors.inkMuted}
                    />
                  </Pressable>
                </View>
              </View>

              <ErrorNote message={error} />

              <Button title="Sign In" onPress={onSubmit} loading={busy} />
            </View>

            {/* New user footer */}
            <View className="mt-6 flex-row items-center justify-center gap-1.5">
              <Text className="font-body text-ink-secondary text-[14px]">New to AyurPass?</Text>
              <Pressable onPress={() => router.replace("/(auth)/register")} hitSlop={8}>
                <Text className="font-body-semi text-forest text-[14px] underline">Create an account</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
