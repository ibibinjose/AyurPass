// Explicit Expo Router entry for monorepo Metro.
// Forces a string app root for require.context (avoids EXPO_ROUTER_APP_ROOT error).
import "@expo/metro-runtime";
import { registerRootComponent } from "expo";
import { ExpoRoot } from "expo-router";

export function App() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ctx = require.context("./app");
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
