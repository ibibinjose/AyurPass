import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, Text, View } from "react-native";
import { Body, Button, Display, ErrorNote, Field, Screen } from "../../src/components/ui";
import { useAuth } from "../../src/auth";
import { ApiError } from "../../src/api";

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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1"
    >
      <Screen>
        <View className="mb-7 mt-6">
          <Display>Welcome back</Display>
          <Body secondary className="mt-1.5">
            Sign in to continue your wellness journey.
          </Body>
        </View>

        <View className="gap-4">
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

        <View className="mt-6 flex-row items-center justify-center gap-1">
          <Text className="font-body text-ink-muted">New to AyurPass?</Text>
          <Pressable onPress={() => router.replace("/(auth)/register")} hitSlop={8}>
            <Text className="font-body-semi text-forest">Create an account</Text>
          </Pressable>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
