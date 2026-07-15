import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, Text, View } from "react-native";
import { Body, Button, Display, ErrorNote, Field, Screen } from "../../src/components/ui";
import { useAuth } from "../../src/auth";
import { colors, fonts } from "../../src/theme";

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    setError(null);
    if (!fullName.trim()) return setError("Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Please enter a valid email.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");

    setBusy(true);
    try {
      await register({ fullName: fullName.trim(), email: email.trim(), password, role: "CONSUMER" });
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
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <Screen>
        <View style={{ marginTop: 24, marginBottom: 28 }}>
          <Display>Begin your journey</Display>
          <Body secondary style={{ marginTop: 6 }}>
            Create an account and discover your dosha.
          </Body>
        </View>

        <View style={{ gap: 16 }}>
          <Field
            label="Full name"
            value={fullName}
            onChangeText={setFullName}
            autoComplete="name"
            placeholder="Ananya Sharma"
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
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="At least 8 characters"
          />
          <ErrorNote message={error} />
          <Button title="Create account" onPress={onSubmit} loading={busy} />
        </View>

        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 24, gap: 4 }}>
          <Text style={{ fontFamily: fonts.body, color: colors.inkMuted }}>Already have an account?</Text>
          <Pressable onPress={() => router.replace("/(auth)/login")}>
            <Text style={{ fontFamily: fonts.bodySemi, color: colors.forest }}>Sign in</Text>
          </Pressable>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
