import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ErrorNote } from "../../src/components/ui";
import { useAuth } from "../../src/auth";
import { api } from "../../src/api";
import { colors, fonts } from "../../src/theme";

export default function VerifyEmailPrompt() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  async function handleResendVerification() {
    if (!user || cooldown > 0 || busy) return;
    
    setError(null);
    setBusy(true);
    
    try {
      await api.resendVerification();
      setResent(true);
      setCooldown(60);

      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setTimeout(() => setResent(false), 5000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to resend verification email. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleCheckVerification() {
    try {
      await refreshProfile();
      // If email is now verified, navigate to main app
      if (user?.emailVerifiedAt) {
        router.replace("/(tabs)");
      } else {
        Alert.alert("Email not verified", "Please check your email and click the verification link.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to check verification status. Please try again."
      );
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background" style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40, flexGrow: 1, justifyContent: "center" }}
        >
          <View
            className="w-full max-w-[460px] self-center px-5"
            style={{ width: "100%", maxWidth: 460, alignSelf: "center", paddingHorizontal: 20 }}
          >
            {/* Back Button */}
            <View className="mb-6" style={{ marginBottom: 24 }}>
              <Pressable
                onPress={() => router.back()}
                className="h-10 w-10 items-center justify-center rounded-full bg-surface border border-hairline active:opacity-80"
                style={{ height: 40, width: 40, alignItems: "center", justifyContent: "center", borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.hairline }}
                accessibilityLabel="Go back"
              >
                <Ionicons name="chevron-back" size={20} color={colors.inkSecondary} />
              </Pressable>
            </View>

            {/* Content */}
            <View className="items-center text-center" style={{ alignItems: "center" }}>
              <View
                className="w-16 h-16 rounded-full bg-forest/10 items-center justify-center mb-6"
                style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: `${colors.forest}20`, alignItems: "center", justifyContent: "center", marginBottom: 24 }}
              >
                <Ionicons name="mail-outline" size={32} color={colors.forest} />
              </View>

              <Text
                className="font-heading text-2xl text-foreground mb-3"
                style={{ color: colors.foreground, fontSize: 24, fontFamily: fonts.display, lineHeight: 32, marginBottom: 12, textAlign: "center" }}
              >
                Verify your email
              </Text>

              <Text
                className="font-body text-base text-ink-secondary mb-8 leading-5"
                style={{ color: colors.inkSecondary, fontSize: 16, fontFamily: fonts.body, lineHeight: 20, marginBottom: 32, textAlign: "center" }}
              >
                We sent a verification link to{" "}
                <Text className="font-body-semi" style={{ fontFamily: fonts.bodySemi }}>
                  {user?.email}
                </Text>
                . Please check your inbox and click the link to activate your account.
              </Text>

              {error && <ErrorNote message={error} />}

              <View className="w-full space-y-3 mt-4" style={{ width: "100%", marginTop: 16 }}>
                <Pressable
                  onPress={handleCheckVerification}
                  disabled={busy}
                  className={`h-12 rounded-full items-center justify-center ${
                    busy ? "bg-forest/50" : "bg-forest active:opacity-90"
                  }`}
                  style={{
                    height: 48,
                    borderRadius: 24,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: busy ? `${colors.forest}80` : colors.forest,
                  }}
                >
                  {busy ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text
                      className="font-body-semi text-base text-white"
                      style={{ color: colors.white, fontSize: 16, fontFamily: fonts.bodySemi }}
                    >
                      I've verified my email
                    </Text>
                  )}
                </Pressable>

                <Pressable
                  onPress={handleResendVerification}
                  disabled={busy || cooldown > 0}
                  className={`h-12 rounded-full items-center justify-center border ${
                    busy || cooldown > 0
                      ? "border-hairline bg-surface/50 opacity-60"
                      : "border-hairline bg-surface active:opacity-90"
                  }`}
                  style={{
                    height: 48,
                    borderRadius: 24,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: busy || cooldown > 0 ? `${colors.hairline}80` : colors.hairline,
                    backgroundColor: busy || cooldown > 0 ? `${colors.surface}80` : colors.surface,
                    opacity: cooldown > 0 ? 0.7 : 1,
                  }}
                >
                  <Text
                    className="font-body-semi text-base text-foreground"
                    style={{ color: colors.foreground, fontSize: 16, fontFamily: fonts.bodySemi }}
                  >
                    {cooldown > 0
                      ? `Resend in ${cooldown}s`
                      : resent
                      ? "Email sent! Check your inbox"
                      : "Resend verification email"}
                  </Text>
                </Pressable>
              </View>

              <Pressable
                onPress={() => router.navigate("/(tabs)")}
                className="mt-6"
                style={{ marginTop: 24 }}
              >
                <Text
                  className="font-body text-sm text-forest"
                  style={{ color: colors.forest, fontSize: 14, fontFamily: fonts.body }}
                >
                  Skip for now
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}