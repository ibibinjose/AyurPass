/**
 * Fallback root component when Metro resolves expo/AppEntry.js
 * (import App from '../../App'). Expo Router is the real app under app/.
 */
import { ExpoRoot } from "expo-router";

const ctx = require.context("./app");

export default function App() {
  return <ExpoRoot context={ctx} />;
}
