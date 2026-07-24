import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Body, Button, Display, ErrorNote, Field, Screen } from "../../src/components/ui";
import { useAuth } from "../../src/auth";

/** Keep in sync with web countries list (subset for mobile pickers). */
const COUNTRIES: { code: string; name: string }[] = [
  { code: "AU", name: "Australia" },
  { code: "IN", name: "India" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "CA", name: "Canada" },
  { code: "NZ", name: "New Zealand" },
  { code: "SG", name: "Singapore" },
  { code: "DE", name: "Germany" },
  { code: "LK", name: "Sri Lanka" },
  { code: "NP", name: "Nepal" },
  { code: "TH", name: "Thailand" },
  { code: "ID", name: "Indonesia" },
  { code: "MY", name: "Malaysia" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "NL", name: "Netherlands" },
  { code: "IE", name: "Ireland" },
  { code: "ZA", name: "South Africa" },
  { code: "PK", name: "Pakistan" },
  { code: "BD", name: "Bangladesh" },
  { code: "PH", name: "Philippines" },
];

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [countryCode, setCountryCode] = useState("AU");
  const [countryOpen, setCountryOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const countryName = COUNTRIES.find((c) => c.code === countryCode)?.name ?? countryCode;

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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1"
    >
      <Screen>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View className="mb-7 mt-6">
            <Display>Begin your journey</Display>
            <Body secondary className="mt-1.5">
              Create an account and discover your dosha. We’ll email a verification link.
            </Body>
          </View>

          <View className="gap-4">
            <Field
              label="Full name"
              value={fullName}
              onChangeText={setFullName}
              autoComplete="name"
              placeholder="Your name"
            />
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              placeholder="you@example.com"
            />
            <Field
              label="City"
              value={city}
              onChangeText={setCity}
              autoComplete="postal-address"
              placeholder="Melbourne"
            />

            <View>
              <Text className="mb-1.5 font-body-semi text-[13px] text-forest">Country</Text>
              <Pressable
                onPress={() => setCountryOpen((v) => !v)}
                className="min-h-12 justify-center rounded-2xl border border-hairline bg-surface px-4"
              >
                <Text className="font-body text-base text-foreground">{countryName}</Text>
              </Pressable>
              {countryOpen ? (
                <View className="mt-2 max-h-48 overflow-hidden rounded-2xl border border-hairline bg-surface">
                  <ScrollView nestedScrollEnabled>
                    {COUNTRIES.map((c) => (
                      <Pressable
                        key={c.code}
                        onPress={() => {
                          setCountryCode(c.code);
                          setCountryOpen(false);
                        }}
                        className={`px-4 py-3 ${
                          c.code === countryCode ? "bg-leaf/10" : ""
                        }`}
                      >
                        <Text
                          className={`font-body text-[15px] ${
                            c.code === countryCode ? "font-body-semi text-forest" : "text-foreground"
                          }`}
                        >
                          {c.name}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              ) : null}
            </View>

            <Field
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="At least 8 characters"
            />
            <ErrorNote message={error} />
            <Button title="Create account" onPress={onSubmit} loading={busy} />
            <Text className="text-center font-body text-[12px] leading-5 text-ink-muted">
              We’ll email a link to verify your address. You can browse immediately.
            </Text>
          </View>

          <View className="mt-6 flex-row items-center justify-center gap-1 pb-8">
            <Text className="font-body text-ink-muted">Already have an account?</Text>
            <Pressable onPress={() => router.replace("/(auth)/login")} hitSlop={8}>
              <Text className="font-body-semi text-forest">Sign in</Text>
            </Pressable>
          </View>
        </ScrollView>
      </Screen>
    </KeyboardAvoidingView>
  );
}
