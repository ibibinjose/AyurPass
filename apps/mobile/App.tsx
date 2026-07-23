/**
 * Fallback when Metro resolves expo/AppEntry → import App from '../../App'.
 * Primary entry is package.json "main": "./index.js". Do not import index here
 * (that would double-register the root component).
 */
import { ExpoRoot } from "expo-router";

// require.context is provided by Metro for Expo Router
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx = (require as any).context("./app");

export default function App() {
  return <ExpoRoot context={ctx} />;
}
