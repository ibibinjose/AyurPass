import "../global.css";
import * as SplashScreen from "expo-splash-screen";
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
import { colors, fonts } from "../src/theme";

// Keep native splash screen visible until fonts load
SplashScreen.preventAutoHideAsync().catch(() => {});

function FullScreenLoader() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.forestDeep,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator size="large" color={colors.goldSoft} />
    </View>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Dark welcome gradient → light content; main app → dark status bar icons
  const inAuthGroup = segments[0] === "(auth)";
  const statusStyle = !user || inAuthGroup ? "light" : "dark";

  useEffect(() => {
    if (loading) return;
    const group = segments[0];
    if (!group) return;
    if (!user && group !== "(auth)") router.replace("/(auth)/welcome");
    else if (user && group === "(auth)") router.replace("/(tabs)");
  }, [user, loading, segments, router]);

  return (
    <>
      <StatusBar style={statusStyle} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.forest,
          headerTitleStyle: {
            fontFamily: fonts.bodySemi,
            fontSize: 17,
            color: colors.forest,
          },
          headerShadowVisible: false,
          headerBackTitle: "Back",
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="assessment"
          options={{ presentation: "modal", headerShown: true, headerTitle: "Energy quiz" }}
        />
        <Stack.Screen
          name="provider/[id]"
          options={{ headerShown: true, headerTitle: "Practice" }}
        />
        <Stack.Screen
          name="service/[id]"
          options={{ headerShown: true, headerTitle: "Session" }}
        />
        <Stack.Screen
          name="book/[serviceId]"
          options={{ headerShown: true, headerTitle: "Book" }}
        />
        <Stack.Screen name="offers" options={{ headerShown: false }} />
        <Stack.Screen name="jobs/index" options={{ headerShown: false }} />
        <Stack.Screen name="jobs/[id]" options={{ headerShown: true, headerTitle: "Role" }} />
        <Stack.Screen
          name="jobs/apply/[id]"
          options={{ headerShown: true, headerTitle: "Apply" }}
        />
      </Stack>
    </>
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

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return <FullScreenLoader />;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StripeAppProvider>
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
