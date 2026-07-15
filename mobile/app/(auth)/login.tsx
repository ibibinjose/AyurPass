import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, Text, View } from "react-native";
import { Body, Button, Display, ErrorNote, Field, Screen } from "../../src/components/ui";
import { useAuth } from "../../src/auth";
import { ApiError } from "../../src/api";
import { colors, fonts } from "../../src/theme";

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    setError(null);
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
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <Screen>
        <View style={{ marginTop: 24, marginBottom: 28 }}>
          <Display>Welcome back</Display>
          <Body secondary style={{ marginTop: 6 }}>
            Sign in to continue your wellness journey.
          </Body>
        </View>

        <View style={{ gap: 16 }}>
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
            placeholder="••••••••"
          />
          <ErrorNote message={error} />
          <Button title="Sign in" onPress={onSubmit} loading={busy} />
        </View>

        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 24, gap: 4 }}>
          <Text style={{ fontFamily: fonts.body, color: colors.inkMuted }}>New to AyurPass?</Text>
          <Pressable onPress={() => router.replace("/(auth)/register")}>
            <Text style={{ fontFamily: fonts.bodySemi, color: colors.forest }}>Create an account</Text>
          </Pressable>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
