import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import type { Role } from "../../src/types";
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

/** Role-specific theming */
type RoleConfig = {
  role: Role;
  label: string;
  badge: string;
  emoji: string;
  gradient: [string, string, string];
  accentColor: string;
  heroTitle: string;
  heroSubtitle: string;
  submitLabel: string;
  /** Route after successful registration */
  postRegisterPath: string;
};

const ROLE_CONFIGS: Record<string, RoleConfig> = {
  CONSUMER: {
    role: "CONSUMER",
    label: "Seeker Account",
    badge: "Free · Most Popular",
    emoji: "🌿",
    gradient: [colors.forestDeep, colors.forest, colors.leaf],
    accentColor: colors.leaf,
    heroTitle: "Begin your wellness journey",
    heroSubtitle:
      "Join AyurPass to discover vetted Ayurvedic clinics, yoga studios & wellness retreats near you.",
    submitLabel: "Create Seeker Account",
    postRegisterPath: "/assessment",
  },
  PROFESSIONAL: {
    role: "PROFESSIONAL",
    label: "Professional Account",
    badge: "For Practitioners",
    emoji: "🧘",
    gradient: ["#312e81", "#4338ca", "#6366f1"],
    accentColor: "#818cf8",
    heroTitle: "Showcase your practice",
    heroSubtitle:
      "Build your verified practitioner profile and get discovered by seekers actively looking for your expertise.",
    submitLabel: "Create Professional Account",
    postRegisterPath: "/",
  },
  PROVIDER_ADMIN: {
    role: "PROVIDER_ADMIN",
    label: "Business Account",
    badge: "For Clinics & Studios",
    emoji: "🏛️",
    gradient: ["#78350f", "#b45309", "#d97706"],
    accentColor: "#fbbf24",
    heroTitle: "List your wellness business",
    heroSubtitle:
      "Reach thousands of seekers. Manage staff, services & bookings from one beautiful dashboard.",
    submitLabel: "Create Business Account",
    postRegisterPath: "/",
  },
};

function calculatePasswordStrength(pass: string): {
  label: string;
  score: number;
  color: string;
} {
  if (!pass) return { label: "", score: 0, color: colors.hairline };
  if (pass.length < 6) return { label: "Weak", score: 1, color: colors.danger };
  const hasMixed = /[A-Z]/.test(pass) && /[0-9]/.test(pass);
  if (pass.length >= 8 && hasMixed)
    return { label: "Strong", score: 3, color: colors.leaf };
  if (pass.length >= 8) return { label: "Good", score: 2, color: colors.gold };
  return { label: "Fair", score: 1, color: colors.gold };
}

function isValidRole(r: unknown): r is Role {
  return r === "CONSUMER" || r === "PROFESSIONAL" || r === "PROVIDER_ADMIN";
}

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string }>();

  // Resolve role from URL param (default → CONSUMER)
  const rawRole = params.role;
  const roleKey = isValidRole(rawRole) ? rawRole : "CONSUMER";
  const config = ROLE_CONFIGS[roleKey];

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
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const [place] = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      const resolvedCity =
        place?.city || place?.subregion || place?.region || "";
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setError("Please enter a valid email.");
    if (password.length < 8)
      return setError("Password must be at least 8 characters.");
    if (!city.trim())
      return setError("Please add your city for Near Me results.");
    if (!countryCode) return setError("Please select your country.");

    setBusy(true);
    try {
      const profile = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role: config.role,
        city: city.trim(),
        country: countryName,
        countryCode,
      });
      
      // Check if email verification is needed after registration
      if (!profile.emailVerifiedAt) {
        router.replace("/(auth)/verify-email-prompt");
      } else {
        router.replace(config.postRegisterPath as "/");
      }
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

  // Focused field border/bg helpers
  const focusBorder = (field: string) =>
    activeField === field ? config.accentColor : colors.hairline;
  const focusBg = (field: string) =>
    activeField === field ? colors.surface : colors.background;

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top", "bottom"]}
    >
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
            {/* ─── Hero Gradient Header ─── */}
            <View
              style={{ position: "relative", overflow: "hidden", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}
            >
              <LinearGradient
                colors={config.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
              />

              {/* Top Nav Bar */}
              <View
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20, zIndex: 10 }}
              >
                <Pressable
                  onPress={() => router.back()}
                  style={{ height: 40, width: 40, alignItems: "center", justifyContent: "center", borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" }}
                  accessibilityLabel="Go back"
                >
                  <Ionicons name="chevron-back" size={20} color={colors.white} />
                </Pressable>

                {/* Role badge + change link */}
                <View style={{ alignItems: "center", gap: 4 }}>
                  <View
                    style={{ borderRadius: 999, backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 14, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" }}
                  >
                    <Text
                      style={{ color: colors.white, fontSize: 11, fontFamily: fonts.bodySemi, textTransform: "uppercase", letterSpacing: 0.5 }}
                    >
                      {config.emoji} {config.label}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => router.replace("/(auth)/account-type" as Href)}
                    hitSlop={8}
                  >
                    <Text
                      style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, fontFamily: fonts.body, textDecorationLine: "underline" }}
                    >
                      Change type
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Hero Branding */}
              <View style={{ alignItems: "center", zIndex: 10 }}>
                <View
                  style={{ marginBottom: 14, height: 64, width: 64, alignItems: "center", justifyContent: "center", borderRadius: 16, borderWidth: 2, borderColor: "rgba(233,217,184,0.4)", backgroundColor: "rgba(255,255,255,0.1)" }}
                >
                  <Text style={{ fontSize: 30 }}>{config.emoji}</Text>
                </View>

                <Text
                  style={{ fontSize: 28, color: colors.white, textAlign: "center", fontFamily: fonts.display }}
                >
                  {config.heroTitle.split(" ").slice(0, -1).join(" ")}{" "}
                  <Text style={{ color: colors.goldSoft }}>
                    {config.heroTitle.split(" ").slice(-1)[0]}
                  </Text>
                </Text>

                <Text
                  style={{ marginTop: 8, textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.82)", lineHeight: 19, maxWidth: 320, fontFamily: fonts.body }}
                >
                  {config.heroSubtitle}
                </Text>

                {/* Role perk pills */}
                <View
                  style={{ marginTop: 14, flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 }}
                >
                  {config.role === "CONSUMER" && (
                    <>
                      <RolePill icon="sparkles" label="Dosha Match" />
                      <RolePill icon="qr-code-outline" label="Instant Pass" />
                      <RolePill icon="star-outline" label="Loyalty Points" />
                    </>
                  )}
                  {config.role === "PROFESSIONAL" && (
                    <>
                      <RolePill icon="shield-checkmark-outline" label="Verified Badge" />
                      <RolePill icon="calendar-outline" label="Schedule Manager" />
                      <RolePill icon="people-outline" label="Client Bookings" />
                    </>
                  )}
                  {config.role === "PROVIDER_ADMIN" && (
                    <>
                      <RolePill icon="business-outline" label="Business Listing" />
                      <RolePill icon="people-circle-outline" label="Staff & Services" />
                      <RolePill icon="briefcase-outline" label="Hiring Board" />
                    </>
                  )}
                </View>
              </View>
            </View>

            {/* ─── Overlapping Form Card ─── */}
            <View
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
                <InputField label="Full name">
                  <View
                    style={{ minHeight: 48, flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, borderColor: focusBorder("fullName"), backgroundColor: focusBg("fullName") }}
                  >
                    <Ionicons name="person-outline" size={18} color={activeField === "fullName" ? config.accentColor : colors.inkMuted} />
                    <TextInput
                      value={fullName}
                      onChangeText={setFullName}
                      onFocus={() => setActiveField("fullName")}
                      onBlur={() => setActiveField(null)}
                      placeholder="e.g. Anita Mudnur"
                      placeholderTextColor={colors.inkMuted}
                      autoComplete="name"
                      style={{ flex: 1, fontSize: 16, color: colors.foreground, fontFamily: fonts.body }}
                    />
                  </View>
                </InputField>

                {/* Email */}
                <InputField label="Email address">
                  <View
                    style={{ minHeight: 48, flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, borderColor: focusBorder("email"), backgroundColor: focusBg("email") }}
                  >
                    <Ionicons name="mail-outline" size={18} color={activeField === "email" ? config.accentColor : colors.inkMuted} />
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
                      style={{ flex: 1, fontSize: 16, color: colors.foreground, fontFamily: fonts.body }}
                    />
                  </View>
                </InputField>

                {/* City & Country Row */}
                <View style={{ flexDirection: "row", gap: 12 }}>
                  {/* City */}
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <Text style={{ fontSize: 13, color: colors.forest, fontFamily: fonts.bodySemi }}>
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
                      style={{ minHeight: 48, flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 16, borderWidth: 1, paddingHorizontal: 12, borderColor: focusBorder("city"), backgroundColor: focusBg("city") }}
                    >
                      <Ionicons name="location-outline" size={18} color={activeField === "city" ? config.accentColor : colors.inkMuted} />
                      <TextInput
                        value={city}
                        onChangeText={setCity}
                        onFocus={() => setActiveField("city")}
                        onBlur={() => setActiveField(null)}
                        placeholder="Melbourne"
                        placeholderTextColor={colors.inkMuted}
                        autoComplete="postal-address"
                        style={{ flex: 1, fontSize: 16, color: colors.foreground, fontFamily: fonts.body }}
                      />
                    </View>
                  </View>

                  {/* Country */}
                  <View style={{ flex: 1 }}>
                    <Text style={{ marginBottom: 6, fontSize: 13, color: colors.forest, fontFamily: fonts.bodySemi }}>
                      Country
                    </Text>
                    <Pressable
                      onPress={() => setCountryOpen((v) => !v)}
                      style={{ minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: 16, borderWidth: 1, paddingHorizontal: 12, borderColor: countryOpen ? config.accentColor : colors.hairline, backgroundColor: countryOpen ? colors.surface : colors.background }}
                    >
                      <Text style={{ fontSize: 16, color: colors.foreground, fontFamily: fonts.body }} numberOfLines={1}>
                        {countryFlag} {countryCode}
                      </Text>
                      <Ionicons name={countryOpen ? "chevron-up" : "chevron-down"} size={16} color={colors.inkMuted} />
                    </Pressable>
                  </View>
                </View>

                {/* Country Accordion */}
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
                          style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: c.code === countryCode ? "rgba(30,50,40,0.1)" : "transparent" }}
                        >
                          <Text style={{ fontSize: 16 }}>{c.flag}</Text>
                          <Text style={{ flex: 1, fontSize: 14, fontFamily: c.code === countryCode ? fonts.bodySemi : fonts.body, color: c.code === countryCode ? colors.forest : colors.foreground }}>
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
                <InputField label="Password">
                  <View
                    style={{ minHeight: 48, flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, borderColor: focusBorder("password"), backgroundColor: focusBg("password") }}
                  >
                    <Ionicons name="lock-closed-outline" size={18} color={activeField === "password" ? config.accentColor : colors.inkMuted} />
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setActiveField("password")}
                      onBlur={() => setActiveField(null)}
                      placeholder="At least 8 characters"
                      placeholderTextColor={colors.inkMuted}
                      secureTextEntry={!showPassword}
                      style={{ flex: 1, fontSize: 16, color: colors.foreground, fontFamily: fonts.body }}
                    />
                    <Pressable
                      onPress={() => setShowPassword((v) => !v)}
                      hitSlop={8}
                      accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                    >
                      <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color={colors.inkMuted} />
                    </Pressable>
                  </View>

                  {/* Password Strength Meter */}
                  {password.length > 0 ? (
                    <View style={{ marginTop: 8, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 2 }}>
                      <View style={{ flex: 1, flexDirection: "row", gap: 4 }}>
                        {[1, 2, 3].map((step) => (
                          <View
                            key={step}
                            style={{ height: 6, flex: 1, borderRadius: 999, backgroundColor: step <= passStrength.score ? passStrength.color : colors.hairline }}
                          />
                        ))}
                      </View>
                      <Text style={{ fontSize: 11, fontFamily: fonts.bodySemi, color: passStrength.color }}>
                        {passStrength.label}
                      </Text>
                    </View>
                  ) : null}
                </InputField>

                <ErrorNote message={error} />

                {/* Submit CTA */}
                <Pressable
                  onPress={onSubmit}
                  disabled={busy}
                  style={{ marginTop: 4, overflow: "hidden", borderRadius: 16, elevation: 3 }}
                >
                  <LinearGradient
                    colors={config.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ minHeight: 52, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 24 }}
                  >
                    {busy ? (
                      <ActivityIndicator color={colors.white} />
                    ) : (
                      <>
                        <Text style={{ fontSize: 16, fontFamily: fonts.bodySemi, color: colors.white }}>
                          {config.submitLabel}
                        </Text>
                        <Ionicons name="arrow-forward" size={18} color={config.accentColor} />
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

            {/* Footer: sign-in link + change account type */}
            <View style={{ marginTop: 20, gap: 10, alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={{ fontSize: 14, color: colors.inkSecondary, fontFamily: fonts.body }}>
                  Already have an account?
                </Text>
                <Pressable onPress={() => router.replace("/(auth)/login")} hitSlop={8}>
                  <Text style={{ fontSize: 14, color: colors.forest, fontFamily: fonts.bodySemi, textDecorationLine: "underline" }}>
                    Sign in
                  </Text>
                </Pressable>
              </View>

              <Pressable
                onPress={() => router.replace("/(auth)/account-type" as Href)}
                hitSlop={8}
                style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
              >
                <Ionicons name="swap-horizontal-outline" size={13} color={colors.inkMuted} />
                <Text style={{ fontSize: 12, color: colors.inkMuted, fontFamily: fonts.body, textDecorationLine: "underline" }}>
                  Wrong account type? Switch
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** Small reusable label + children wrapper */
function InputField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View>
      <Text style={{ marginBottom: 6, fontSize: 13, color: colors.forest, fontFamily: fonts.bodySemi }}>
        {label}
      </Text>
      {children}
    </View>
  );
}

/** Small pill for hero perks */
function RolePill({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View
      style={{ flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" }}
    >
      <Ionicons name={icon} size={13} color={colors.goldSoft} />
      <Text style={{ color: colors.white, fontSize: 11, fontFamily: fonts.bodySemi }}>{label}</Text>
    </View>
  );
}
