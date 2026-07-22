/**
 * Fallback root component when Metro resolves expo/AppEntry.js
 * (import App from '../../App'). Expo Router is the real app under app/.
 */
import { ExpoRoot } from "expo-router";

// require.context is provided by Metro bundler for Expo Router
const ctx = (require as any).context("./app");

export default function App() {
  return <ExpoRoot context={ctx} />;
}
