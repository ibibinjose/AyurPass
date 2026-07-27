import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
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
import { colors, fonts } from "../../src/theme";

/** Keep in sync with web countries list (subset for mobile pickers). */
const COUNTRIES: { code: string; name: string; flag: string }[] = [
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰" },
  { code: "NP", name: "Nepal", flag: "🇳🇵" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
];

function calculatePasswordStrength(pass: string): { label: string; score: number; color: string } {
  if (!pass) return { label: "", score: 0, color: colors.hairline };
  if (pass.length < 6) return { label: "Weak", score: 1, color: colors.danger };
  const hasMixed = /[A-Z]/.test(pass) && /[0-9]/.test(pass);
  if (pass.length >= 8 && hasMixed) return { label: "Strong", score: 3, color: colors.leaf };
  if (pass.length >= 8) return { label: "Good", score: 2, color: colors.gold };
  return { label: "Fair", score: 1, color: colors.gold };
}

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [city, setCity] = useState("");
  const [countryCode, setCountryCode] = useState("AU");
  const [countryOpen, setCountryOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);

  const selectedCountry = COUNTRIES.find((c) => c.code === countryCode);
  const countryName = selectedCountry?.name ?? countryCode;
  const countryFlag = selectedCountry?.flag ?? "🌐";
  const passStrength = calculatePasswordStrength(password);

  const detectLocation = useCallback(async () => {
    setLocating(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission denied. Type your city manually.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [place] = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      const resolvedCity = place?.city || place?.subregion || place?.region || "";
      if (resolvedCity) setCity(resolvedCity);
      if (place?.isoCountryCode) {
        const found = COUNTRIES.find((c) => c.code === place.isoCountryCode);
        if (found) setCountryCode(found.code);
      }
    } catch {
      setError("Couldn't auto-detect location. Type your city manually.");
    } finally {
      setLocating(false);
    }
  }, []);

  async function onSubmit() {
    setError(null);
    if (!fullName.trim()) return setError("Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Please enter a valid email.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (!city.trim()) return setError("Please add your city for Near me results.");
    if (!countryCode) return setError("Please select your country.");

    setBusy(true);
    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role: "CONSUMER",
        city: city.trim(),
        country: countryName,
        countryCode,
      });
      router.replace("/assessment");
    } catch (err) {
      setError(
        err instanceof Error && err.message.toLowerCase().includes("exist")
          ? "An account with this email already exists — try signing in."
          : err instanceof Error
            ? err.message
            : "We couldn't create your account. Please try again.",
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
                    Step 1 of 2 · Free Account
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
                  Begin your <Text style={{ color: colors.goldSoft }}>wellness journey</Text>
                </Text>
                <Text
                  className="mt-1.5 text-center font-body text-[14px] text-white/85 leading-5 max-w-[340px]"
                  style={{ marginTop: 6, textAlign: "center", fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 20, maxWidth: 340, fontFamily: fonts.body }}
                >
                  Join AyurPass to discover vetted Ayurvedic clinics, yoga studios & wellness retreats near you.
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
                    <Text style={{ color: colors.white, fontSize: 11, fontFamily: fonts.bodySemi }}>Dosha Match</Text>
                  </View>
                  <View
                    className="flex-row items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 border border-white/20"
                    style={{ flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" }}
                  >
                    <Ionicons name="qr-code-outline" size={13} color={colors.goldSoft} />
                    <Text style={{ color: colors.white, fontSize: 11, fontFamily: fonts.bodySemi }}>Instant Pass</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Overlapping Form Card */}
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
                {/* Full Name */}
                <View>
                  <Text
                    className="mb-1.5 font-body-semi text-[13px] text-forest"
                    style={{ marginBottom: 6, fontSize: 13, color: colors.forest, fontFamily: fonts.bodySemi }}
                  >
                    Full name
                  </Text>
                  <View
                    className={`min-h-12 flex-row items-center gap-2.5 rounded-2xl border px-3.5 bg-background ${
                      activeField === "fullName" ? "border-forest bg-surface" : "border-hairline"
                    }`}
                    style={{
                      minHeight: 48,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                      borderRadius: 16,
                      borderWidth: 1,
                      paddingHorizontal: 14,
                      borderColor: activeField === "fullName" ? colors.forest : colors.hairline,
                      backgroundColor: activeField === "fullName" ? colors.surface : colors.background,
                    }}
                  >
                    <Ionicons
                      name="person-outline"
                      size={18}
                      color={activeField === "fullName" ? colors.forest : colors.inkMuted}
                    />
                    <TextInput
                      value={fullName}
                      onChangeText={setFullName}
                      onFocus={() => setActiveField("fullName")}
                      onBlur={() => setActiveField(null)}
                      placeholder="e.g. Anita Mudnur"
                      placeholderTextColor={colors.inkMuted}
                      autoComplete="name"
                      className="flex-1 font-body text-base text-foreground"
                      style={{ flex: 1, fontSize: 16, color: colors.foreground, fontFamily: fonts.body }}
                    />
                  </View>
                </View>

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

                {/* City & Country Row */}
                <View style={{ flexDirection: "row", gap: 12 }}>
                  {/* City */}
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <Text
                        className="font-body-semi text-[13px] text-forest"
                        style={{ fontSize: 13, color: colors.forest, fontFamily: fonts.bodySemi }}
                      >
                        City
                      </Text>
                      <Pressable
                        onPress={() => void detectLocation()}
                        disabled={locating}
                        hitSlop={6}
                        style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.clay, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}
                      >
                        <Ionicons name="navigate-outline" size={11} color={colors.leaf} />
                        <Text style={{ fontSize: 11, color: colors.leaf, fontFamily: fonts.bodySemi }}>
                          {locating ? "Locating…" : "Auto-detect"}
                        </Text>
                      </Pressable>
                    </View>
                    <View
                      className={`min-h-12 flex-row items-center gap-2 rounded-2xl border px-3 bg-background ${
                        activeField === "city" ? "border-forest bg-surface" : "border-hairline"
                      }`}
                      style={{
                        minHeight: 48,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        borderRadius: 16,
                        borderWidth: 1,
                        paddingHorizontal: 12,
                        borderColor: activeField === "city" ? colors.forest : colors.hairline,
                        backgroundColor: activeField === "city" ? colors.surface : colors.background,
                      }}
                    >
                      <Ionicons
                        name="location-outline"
                        size={18}
                        color={activeField === "city" ? colors.forest : colors.inkMuted}
                      />
                      <TextInput
                        value={city}
                        onChangeText={setCity}
                        onFocus={() => setActiveField("city")}
                        onBlur={() => setActiveField(null)}
                        placeholder="Melbourne"
                        placeholderTextColor={colors.inkMuted}
                        autoComplete="postal-address"
                        className="flex-1 font-body text-base text-foreground"
                        style={{ flex: 1, fontSize: 16, color: colors.foreground, fontFamily: fonts.body }}
                      />
                    </View>
                  </View>

                  {/* Country */}
                  <View style={{ flex: 1 }}>
                    <Text
                      className="mb-1.5 font-body-semi text-[13px] text-forest"
                      style={{ marginBottom: 6, fontSize: 13, color: colors.forest, fontFamily: fonts.bodySemi }}
                    >
                      Country
                    </Text>
                    <Pressable
                      onPress={() => setCountryOpen((v) => !v)}
                      style={{
                        minHeight: 48,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderRadius: 16,
                        borderWidth: 1,
                        paddingHorizontal: 12,
                        borderColor: countryOpen ? colors.forest : colors.hairline,
                        backgroundColor: countryOpen ? colors.surface : colors.background,
                      }}
                    >
                      <Text style={{ fontSize: 16, color: colors.foreground, fontFamily: fonts.body }} numberOfLines={1}>
                        {countryFlag} {countryCode}
                      </Text>
                      <Ionicons
                        name={countryOpen ? "chevron-up" : "chevron-down"}
                        size={16}
                        color={colors.inkMuted}
                      />
                    </Pressable>
                  </View>
                </View>

                {/* Country Accordion Dropdown */}
                {countryOpen ? (
                  <View style={{ maxHeight: 192, overflow: "hidden", borderRadius: 16, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.background }}>
                    <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
                      {COUNTRIES.map((c) => (
                        <Pressable
                          key={c.code}
                          onPress={() => {
                            setCountryCode(c.code);
                            setCountryOpen(false);
                          }}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 10,
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            backgroundColor: c.code === countryCode ? "rgba(30,50,40,0.1)" : "transparent",
                          }}
                        >
                          <Text style={{ fontSize: 16 }}>{c.flag}</Text>
                          <Text
                            style={{
                              flex: 1,
                              fontSize: 14,
                              fontFamily: c.code === countryCode ? fonts.bodySemi : fonts.body,
                              color: c.code === countryCode ? colors.forest : colors.foreground,
                            }}
                          >
                            {c.name}
                          </Text>
                          {c.code === countryCode ? (
                            <Ionicons name="checkmark" size={16} color={colors.leaf} />
                          ) : null}
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                ) : null}

                {/* Password */}
                <View>
                  <Text
                    className="mb-1.5 font-body-semi text-[13px] text-forest"
                    style={{ marginBottom: 6, fontSize: 13, color: colors.forest, fontFamily: fonts.bodySemi }}
                  >
                    Password
                  </Text>
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
                      placeholder="At least 8 characters"
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

                  {/* Password Strength Indicator Bar */}
                  {password.length > 0 ? (
                    <View style={{ marginTop: 8, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 2 }}>
                      <View style={{ flex: 1, flexDirection: "row", gap: 4 }}>
                        {[1, 2, 3].map((step) => (
                          <View
                            key={step}
                            style={{
                              height: 6,
                              flex: 1,
                              borderRadius: 999,
                              backgroundColor: step <= passStrength.score ? passStrength.color : colors.hairline,
                            }}
                          />
                        ))}
                      </View>
                      <Text style={{ fontSize: 11, fontFamily: fonts.bodySemi, color: passStrength.color }}>
                        {passStrength.label}
                      </Text>
                    </View>
                  ) : null}
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
                        <Text style={{ fontSize: 16, fontFamily: fonts.bodySemi, color: colors.white }}>Create Free Account</Text>
                        <Ionicons name="arrow-forward" size={18} color={colors.goldSoft} />
                      </>
                    )}
                  </LinearGradient>
                </Pressable>

                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 4 }}>
                  <Ionicons name="shield-checkmark-outline" size={14} color={colors.leaf} />
                  <Text style={{ fontSize: 12, color: colors.inkMuted, fontFamily: fonts.body }}>
                    Instant free access · No credit card required
                  </Text>
                </View>
              </View>
            </View>

            {/* Already have an account footer */}
            <View style={{ marginTop: 24, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Text style={{ fontSize: 14, color: colors.inkSecondary, fontFamily: fonts.body }}>Already have an account?</Text>
              <Pressable onPress={() => router.replace("/(auth)/login")} hitSlop={8}>
                <Text style={{ fontSize: 14, color: colors.forest, fontFamily: fonts.bodySemi, textDecorationLine: "underline" }}>Sign in</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
