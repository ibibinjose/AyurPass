import "../global.css";
import {
  useFonts,
  Fraunces_500Medium,
  Fraunces_600SemiBold,
} from "@expo-google-fonts/fraunces";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../src/auth";
import { PushBootstrap } from "../src/notifications/PushBootstrap";
import { StripeAppProvider } from "../src/payments/StripeAppProvider";
import { createMobileQueryClient } from "../src/query-client";
import { colors } from "../src/theme";

function FullScreenLoader() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center" }}>
      <ActivityIndicator color={colors.leaf} />
    </View>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const group = segments[0];
    if (!group) return;
    const inAuthGroup = group === "(auth)";
    if (!user && !inAuthGroup) router.replace("/(auth)/welcome");
    else if (user && inAuthGroup) router.replace("/(tabs)");
  }, [user, loading, segments, router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.forest,
        headerShadowVisible: false,
        headerTitle: "",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="assessment" options={{ presentation: "modal" }} />
      <Stack.Screen name="provider/[id]" options={{ headerShown: true }} />
      <Stack.Screen name="service/[id]" options={{ headerShown: true }} />
      <Stack.Screen name="book/[serviceId]" options={{ headerShown: true, headerTitle: "Book" }} />
      <Stack.Screen name="offers" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [queryClient] = useState(createMobileQueryClient);
  const [fontsLoaded] = useFonts({
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: colors.background }} />;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StripeAppProvider>
          <StatusBar style="dark" />
          <AuthProvider>
            <PushBootstrap />
            <RootNavigator />
          </AuthProvider>
        </StripeAppProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

export { FullScreenLoader };
