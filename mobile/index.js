/**
 * Explicit entry for Expo Router (SDK 55).
 * Prevents Metro falling back to expo/AppEntry.js → ../../App
 * which fails because this app uses file-based routes under app/.
 */
import "expo-router/entry";
