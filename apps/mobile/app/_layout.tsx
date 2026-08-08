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
import { Component, useEffect, useState, type ErrorInfo, type ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../src/auth";
import { PushBootstrap } from "../src/notifications/PushBootstrap";
import { StripeAppProvider } from "../src/payments/StripeAppProvider";
import { createMobileQueryClient } from "../src/query-client";
import { colors, fonts } from "../src/theme";

// Keep native splash until fonts load (or timeout)
SplashScreen.preventAutoHideAsync().catch(() => {});

function FullScreenLoader() {
  return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color={colors.saffronSoft} />
      <Text style={styles.loaderText}>AyurPass</Text>
    </View>
  );
}

class RootErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[AyurPass root]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.errorRoot}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorBody}>
            {this.state.error.message || "The app failed to start. Please force-quit and reopen."}
          </Text>
          <Pressable
            style={styles.errorBtn}
            onPress={() => this.setState({ error: null })}
          >
            <Text style={styles.errorBtnText}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

function RootNavigator() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const inAuthGroup = segments[0] === "(auth)";
  const statusStyle = !user || inAuthGroup ? "light" : "dark";

  useEffect(() => {
    if (loading) return;
    const group = segments[0];
    // Wait until router has a group (avoid racing empty segments)
    if (!group) return;
    if (!user && group !== "(auth)") {
      router.replace("/(auth)/welcome");
    } else if (user && group === "(auth)") {
      router.replace("/(tabs)");
    }
  }, [user, loading, segments, router]);

  // While auth boots, keep dark shell (not ivory/white)
  if (loading) {
    return (
      <>
        <StatusBar style="light" />
        <FullScreenLoader />
      </>
    );
  }

  return (
    <>
      <StatusBar style={statusStyle} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.sageDark },
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.sage,
          headerTitleStyle: {
            fontFamily: fonts.bodySemi,
            fontSize: 17,
            color: colors.sage,
          },
          headerShadowVisible: false,
          headerBackTitle: "Back",
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen
          name="(tabs)"
          options={{ contentStyle: { backgroundColor: colors.background } }}
        />
        <Stack.Screen
          name="assessment"
          options={{
            presentation: "modal",
            headerShown: true,
            headerTitle: "Energy quiz",
            contentStyle: { backgroundColor: colors.background },
          }}
        />
        <Stack.Screen
          name="provider/[id]"
          options={{
            headerShown: true,
            headerTitle: "Practice",
            contentStyle: { backgroundColor: colors.background },
          }}
        />
        <Stack.Screen
          name="service/[id]"
          options={{
            headerShown: true,
            headerTitle: "Session",
            contentStyle: { backgroundColor: colors.background },
          }}
        />
        <Stack.Screen
          name="book/[serviceId]"
          options={{
            headerShown: true,
            headerTitle: "Book",
            contentStyle: { backgroundColor: colors.background },
          }}
        />
        <Stack.Screen
          name="offers"
          options={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
        />
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
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });
  const [fontTimedOut, setFontTimedOut] = useState(false);

  // Never block the UI forever if fonts hang (device offline / OTA issues)
  useEffect(() => {
    const t = setTimeout(() => setFontTimedOut(true), 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError || fontTimedOut) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError, fontTimedOut]);

  if (!fontsLoaded && !fontError && !fontTimedOut) {
    return <FullScreenLoader />;
  }

  return (
    <RootErrorBoundary>
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
    </RootErrorBoundary>
  );
}

export { FullScreenLoader };

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: colors.sageDark,
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
  },
  loaderText: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.saffronSoft,
  },
  errorRoot: {
    flex: 1,
    backgroundColor: colors.sageDark,
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  errorTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.white,
    marginBottom: 10,
  },
  errorBody: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 20,
  },
  errorBtn: {
    alignSelf: "flex-start",
    backgroundColor: colors.saffron,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  errorBtnText: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.sageDark,
  },
});
