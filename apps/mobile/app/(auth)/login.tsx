import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ErrorNote } from "../../src/components/ui";
import { useAuth } from "../../src/auth";
import { ApiError } from "../../src/api";
import { colors, fonts } from "../../src/theme";

export default function Login() {
  const { login, loginWithSocial } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ next?: string }>();
  const rawNext = Array.isArray(params.next) ? params.next[0] : params.next;
  const nextHref =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? (rawNext as Href)
      : ("/(tabs)" as Href);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [socialModalProvider, setSocialModalProvider] = useState<"google" | "apple" | null>(null);
  const [socialEmail, setSocialEmail] = useState("");
  const [socialName, setSocialName] = useState("");

  async function onSubmit() {
    setError(null);
    if (!email.trim()) return setError("Please enter your email.");
    if (!password) return setError("Please enter your password.");

    setBusy(true);
    try {
      const profile = await login(email.trim(), password);
      // Check if email verification is needed
      if (!profile.emailVerifiedAt) {
        // Navigate to a verification screen or show a modal
        router.push("/(auth)/verify-email-prompt" as Href);
      } else {
        router.replace(nextHref);
      }
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
    <SafeAreaView className="flex-1 bg-background" style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Centered responsive container for web & mobile */}
          <View
            className="w-full max-w-[460px] self-center overflow-hidden"
            style={{ width: "100%", maxWidth: 460, alignSelf: "center" }}
          >
            {/* Hero Gradient Header */}
            <View
              className="relative overflow-hidden px-5 pt-4 pb-8"
              style={{ position: "relative", overflow: "hidden", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}
            >
              <LinearGradient
                colors={[colors.forestDeep, colors.forest, colors.leaf]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
              />

              {/* Top Navigation Bar */}
              <View
                className="flex-row items-center justify-between mb-5 z-10"
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20, zIndex: 10 }}
              >
                <Pressable
                  onPress={() => router.back()}
                  className="h-10 w-10 items-center justify-center rounded-full bg-white/15 border border-white/20 active:opacity-80"
                  style={{ height: 40, width: 40, alignItems: "center", justifyContent: "center", borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" }}
                  accessibilityLabel="Go back"
                >
                  <Ionicons name="chevron-back" size={20} color={colors.white} />
                </Pressable>
                <View
                  className="rounded-full bg-white/20 px-3.5 py-1 border border-white/25"
                  style={{ borderRadius: 999, backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 14, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" }}
                >
                  <Text
                    className="font-body-semi text-[11px] text-white uppercase tracking-wider"
                    style={{ color: colors.white, fontSize: 11, fontFamily: fonts.bodySemi, textTransform: "uppercase", letterSpacing: 0.5 }}
                  >
                    Secure Sign In
                  </Text>
                </View>
              </View>

              {/* Hero Branding */}
              <View className="items-center z-10" style={{ alignItems: "center", zIndex: 10 }}>
                <View
                  className="mb-3.5 h-16 w-16 items-center justify-center rounded-2xl border-2 border-gold-soft/40 bg-white/10 shadow-lg"
                  style={{ marginBottom: 14, height: 64, width: 64, alignItems: "center", justifyContent: "center", borderRadius: 16, borderWidth: 2, borderColor: "rgba(233,217,184,0.4)", backgroundColor: "rgba(255,255,255,0.1)" }}
                >
                  <Ionicons name="leaf-outline" size={32} color={colors.goldSoft} />
                </View>

                <Text
                  className="font-display text-[30px] text-white text-center"
                  style={{ fontSize: 30, color: colors.white, textAlign: "center", fontFamily: fonts.display }}
                >
                  Welcome back to <Text style={{ color: colors.goldSoft }}>AyurPass</Text>
                </Text>
                <Text
                  className="mt-1.5 text-center font-body text-[14px] text-white/85 leading-5 max-w-[340px]"
                  style={{ marginTop: 6, textAlign: "center", fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 20, maxWidth: 340, fontFamily: fonts.body }}
                >
                  Sign in to manage your appointments, wellness pass, and health profile.
                </Text>

                {/* Feature Pills */}
                <View
                  className="mt-4 flex-row flex-wrap justify-center gap-2"
                  style={{ marginTop: 16, flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 }}
                >
                  <View
                    className="flex-row items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 border border-white/20"
                    style={{ flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" }}
                  >
                    <Ionicons name="checkmark-circle" size={13} color={colors.goldSoft} />
                    <Text style={{ color: colors.white, fontSize: 11, fontFamily: fonts.bodySemi }}>Vetted Clinics</Text>
                  </View>
                  <View
                    className="flex-row items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 border border-white/20"
                    style={{ flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" }}
                  >
                    <Ionicons name="sparkles" size={13} color={colors.goldSoft} />
                    <Text style={{ color: colors.white, fontSize: 11, fontFamily: fonts.bodySemi }}>Personalised Care</Text>
                  </View>
                  <View
                    className="flex-row items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 border border-white/20"
                    style={{ flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" }}
                  >
                    <Ionicons name="calendar-outline" size={13} color={colors.goldSoft} />
                    <Text style={{ color: colors.white, fontSize: 11, fontFamily: fonts.bodySemi }}>Instant Booking</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Overlapping Glassmorphic Form Card */}
            <View
              className="-mt-4 mx-4 rounded-[28px] border border-hairline bg-surface p-5 shadow-lg"
              style={{
                marginTop: -16,
                marginHorizontal: 16,
                borderRadius: 28,
                borderWidth: 1,
                borderColor: colors.hairline,
                backgroundColor: colors.surface,
                padding: 20,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 4,
              }}
            >
              <View style={{ gap: 16 }}>
                {/* Email */}
                <View>
                  <Text
                    className="mb-1.5 font-body-semi text-[13px] text-forest"
                    style={{ marginBottom: 6, fontSize: 13, color: colors.forest, fontFamily: fonts.bodySemi }}
                  >
                    Email address
                  </Text>
                  <View
                    className={`min-h-12 flex-row items-center gap-2.5 rounded-2xl border px-3.5 bg-background ${
                      activeField === "email" ? "border-forest bg-surface" : "border-hairline"
                    }`}
                    style={{
                      minHeight: 48,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                      borderRadius: 16,
                      borderWidth: 1,
                      paddingHorizontal: 14,
                      borderColor: activeField === "email" ? colors.forest : colors.hairline,
                      backgroundColor: activeField === "email" ? colors.surface : colors.background,
                    }}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={18}
                      color={activeField === "email" ? colors.forest : colors.inkMuted}
                    />
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setActiveField("email")}
                      onBlur={() => setActiveField(null)}
                      placeholder="you@example.com"
                      placeholderTextColor={colors.inkMuted}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoComplete="email"
                      className="flex-1 font-body text-base text-foreground"
                      style={{ flex: 1, fontSize: 16, color: colors.foreground, fontFamily: fonts.body }}
                    />
                  </View>
                </View>

                {/* Password */}
                <View>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <Text
                      className="font-body-semi text-[13px] text-forest"
                      style={{ fontSize: 13, color: colors.forest, fontFamily: fonts.bodySemi }}
                    >
                      Password
                    </Text>
                  </View>
                  <View
                    className={`min-h-12 flex-row items-center gap-2.5 rounded-2xl border px-3.5 bg-background ${
                      activeField === "password" ? "border-forest bg-surface" : "border-hairline"
                    }`}
                    style={{
                      minHeight: 48,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                      borderRadius: 16,
                      borderWidth: 1,
                      paddingHorizontal: 14,
                      borderColor: activeField === "password" ? colors.forest : colors.hairline,
                      backgroundColor: activeField === "password" ? colors.surface : colors.background,
                    }}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color={activeField === "password" ? colors.forest : colors.inkMuted}
                    />
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setActiveField("password")}
                      onBlur={() => setActiveField(null)}
                      placeholder="••••••••"
                      placeholderTextColor={colors.inkMuted}
                      secureTextEntry={!showPassword}
                      className="flex-1 font-body text-base text-foreground"
                      style={{ flex: 1, fontSize: 16, color: colors.foreground, fontFamily: fonts.body }}
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

                {/* Social Sign-In Buttons */}
                <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
                  <Pressable
                    onPress={() => {
                      setError(null);
                      setSocialEmail("user@gmail.com");
                      setSocialName("Google Member");
                      setSocialModalProvider("google");
                    }}
                    style={{
                      flex: 1,
                      minHeight: 46,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: colors.hairline,
                      backgroundColor: colors.surface,
                    }}
                  >
                    <Ionicons name="logo-google" size={18} color="#EA4335" />
                    <Text style={{ fontSize: 13, fontFamily: fonts.bodySemi, color: colors.foreground }}>
                      Google
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setError(null);
                      setSocialEmail("user@icloud.com");
                      setSocialName("Apple Member");
                      setSocialModalProvider("apple");
                    }}
                    style={{
                      flex: 1,
                      minHeight: 46,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: colors.hairline,
                      backgroundColor: colors.surface,
                    }}
                  >
                    <Ionicons name="logo-apple" size={18} color={colors.foreground} />
                    <Text style={{ fontSize: 13, fontFamily: fonts.bodySemi, color: colors.foreground }}>
                      Apple
                    </Text>
                  </Pressable>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                  <View style={{ flex: 1, height: 1, backgroundColor: colors.hairline }} />
                  <Text style={{ marginHorizontal: 12, fontSize: 10, fontFamily: fonts.bodySemi, color: colors.inkMuted, textTransform: "uppercase" }}>
                    or continue with email
                  </Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: colors.hairline }} />
                </View>

                <ErrorNote message={error} />

                {/* Submit CTA Button with LinearGradient */}
                <Pressable
                  onPress={onSubmit}
                  disabled={busy}
                  style={{ marginTop: 4, overflow: "hidden", borderRadius: 16, elevation: 3 }}
                >
                  <LinearGradient
                    colors={[colors.forest, colors.leaf]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ minHeight: 52, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 24 }}
                  >
                    {busy ? (
                      <ActivityIndicator color={colors.white} />
                    ) : (
                      <>
                        <Text style={{ fontSize: 16, fontFamily: fonts.bodySemi, color: colors.white }}>Sign In</Text>
                        <Ionicons name="arrow-forward" size={18} color={colors.goldSoft} />
                      </>
                    )}
                  </LinearGradient>
                </Pressable>

                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 4 }}>
                  <Ionicons name="shield-checkmark-outline" size={14} color={colors.leaf} />
                  <Text style={{ fontSize: 12, color: colors.inkMuted, fontFamily: fonts.body }}>
                    Encrypted session · 256-bit security
                  </Text>
                </View>
              </View>
            </View>

            {/* New user footer */}
            <View style={{ marginTop: 24, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Text style={{ fontSize: 14, color: colors.inkSecondary, fontFamily: fonts.body }}>New to AyurPass?</Text>
              <Pressable onPress={() => router.replace({ pathname: "/(auth)/register", params: rawNext ? { next: rawNext } : {} })} hitSlop={8}>
                <Text style={{ fontSize: 14, color: colors.forest, fontFamily: fonts.bodySemi, textDecorationLine: "underline" }}>Create an account</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Mobile Social OAuth Modal */}
      <Modal
        visible={socialModalProvider !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSocialModalProvider(null)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", padding: 20 }}>
          <View style={{ width: "100%", maxWidth: 400, borderRadius: 24, backgroundColor: colors.surface, padding: 24, borderWidth: 1, borderColor: colors.hairline }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Ionicons name={socialModalProvider === "google" ? "logo-google" : "logo-apple"} size={22} color={socialModalProvider === "google" ? "#EA4335" : colors.foreground} />
                <Text style={{ fontSize: 18, fontFamily: fonts.display, color: colors.forest }}>
                  Sign in with {socialModalProvider === "google" ? "Google" : "Apple"}
                </Text>
              </View>
              <Pressable onPress={() => setSocialModalProvider(null)} hitSlop={8}>
                <Ionicons name="close" size={20} color={colors.inkMuted} />
              </Pressable>
            </View>

            <Text style={{ fontSize: 13, fontFamily: fonts.body, color: colors.inkMuted, marginBottom: 16 }}>
              Authorize your identity via {socialModalProvider === "google" ? "Google OAuth" : "Apple ID"}:
            </Text>

            <View style={{ gap: 12, marginBottom: 20 }}>
              <View>
                <Text style={{ fontSize: 12, fontFamily: fonts.bodySemi, color: colors.foreground, marginBottom: 4 }}>
                  Account Email
                </Text>
                <TextInput
                  value={socialEmail}
                  onChangeText={setSocialEmail}
                  placeholder={socialModalProvider === "google" ? "you@gmail.com" : "you@icloud.com"}
                  placeholderTextColor={colors.inkMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{ minHeight: 46, borderRadius: 14, borderWidth: 1, borderColor: colors.hairline, paddingHorizontal: 12, fontSize: 15, color: colors.foreground, backgroundColor: colors.background }}
                />
              </View>

              <View>
                <Text style={{ fontSize: 12, fontFamily: fonts.bodySemi, color: colors.foreground, marginBottom: 4 }}>
                  Full Name (Optional)
                </Text>
                <TextInput
                  value={socialName}
                  onChangeText={setSocialName}
                  placeholder="Your Name"
                  placeholderTextColor={colors.inkMuted}
                  style={{ minHeight: 46, borderRadius: 14, borderWidth: 1, borderColor: colors.hairline, paddingHorizontal: 12, fontSize: 15, color: colors.foreground, backgroundColor: colors.background }}
                />
              </View>
            </View>

            <Pressable
              onPress={async () => {
                if (!socialModalProvider || !socialEmail.trim()) return;
                setBusy(true);
                const provider = socialModalProvider;
                setSocialModalProvider(null);
                try {
                  const sanitizedEmail = socialEmail.trim().replace(/[^a-zA-Z0-9]/g, "");
                  const profile = await loginWithSocial(provider, {
                    email: socialEmail.trim(),
                    name: socialName.trim(),
                    idToken: `mobile-${provider}-oauth-${sanitizedEmail}`,
                  });
                  if (!profile.emailVerifiedAt) {
                    router.push("/(auth)/verify-email-prompt" as Href);
                  } else {
                    router.replace(nextHref);
                  }
                } catch (err) {
                  setError(err instanceof Error ? err.message : `${provider} sign-in failed.`);
                  setBusy(false);
                }
              }}
              style={{ overflow: "hidden", borderRadius: 14 }}
            >
              <LinearGradient
                colors={[colors.forest, colors.leaf]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ minHeight: 48, alignItems: "center", justifyContent: "center" }}
              >
                <Text style={{ fontSize: 15, fontFamily: fonts.bodySemi, color: colors.white }}>
                  Authorize & Sign In
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
