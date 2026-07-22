import type { ExpoConfig, ConfigContext } from "expo/config";

/**
 * Dynamic Expo config for AyurPass mobile (Expo SDK 55).
 *
 * This is the SINGLE SOURCE OF TRUTH for all Expo/EAS configuration.
 * apps/mobile/app.json is a minimal stub — all real config lives here.
 *
 * API URL resolution (highest wins):
 *  1. EXPO_PUBLIC_API_URL (EAS env / shell)
 *  2. Runtime LAN / localhost in src/api.ts
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim() || "";
  const webUrl = process.env.EXPO_PUBLIC_WEB_URL?.trim() || "https://www.ayurpass.com";

  return {
    ...config,
    name: "AyurPass",
    slug: "ayurpass",
    scheme: "ayurpass",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    plugins: [
      "expo-router",
      "expo-secure-store",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#1e3228",
          image: "./assets/splash-icon.png",
          imageWidth: 180,
        },
      ],
      "expo-asset",
      "expo-updates",
      [
        "expo-image-picker",
        {
          photosPermission:
            "Allow AyurPass to access your photos for your profile picture.",
          cameraPermission:
            "Allow AyurPass to use the camera for your profile picture.",
        },
      ],
      // Push: enable "Push Notifications" on the App ID in Apple Developer, then
      // re-add this plugin and regenerate the provisioning profile.
      // "expo-notifications",
      // Stripe PaymentSheet (card). Apple Pay merchant ID is optional — enable later
      // in Apple Developer + re-add merchantIdentifier after the first device install works.
      [
        "@stripe/stripe-react-native",
        {
          enableGooglePay: true,
        },
      ],
    ],
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#1e3228",
    },
    ios: {
      supportsTablet: true,
      // Matches EAS credentials: com.passionarc.ayurpass
      bundleIdentifier: "com.passionarc.ayurpass",
      // Universal Links (applinks:) re-enable after App ID has Associated Domains.
      // Custom scheme ayurpass:// still works without this entitlement.
      // associatedDomains: ["applinks:ayurpass.com", "applinks:www.ayurpass.com"],
      infoPlist: {
        UIRequiresFullScreen: false,
        UIStatusBarStyle: "UIStatusBarStyleDarkContent",
        NSCameraUsageDescription:
          "AyurPass uses the camera so you can add a profile photo.",
        NSPhotoLibraryUsageDescription:
          "AyurPass needs photo library access so you can set a profile photo.",
        ITSAppUsesNonExemptEncryption: false,
      },
      privacyManifests: {
        NSPrivacyAccessedAPITypes: [
          {
            NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryUserDefaults",
            NSPrivacyAccessedAPITypeReasons: ["CA92.1"],
          },
        ],
      },
    },
    android: {
      package: "com.passionarc.ayurpass",
      versionCode: 1,
      softwareKeyboardLayoutMode: "resize",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#1e3228",
      },
      permissions: [
        "CAMERA",
        "READ_MEDIA_IMAGES",
        "POST_NOTIFICATIONS",
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE",
      ],
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            { scheme: "https", host: "ayurpass.com", pathPrefix: "/" },
            { scheme: "https", host: "www.ayurpass.com", pathPrefix: "/" },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
        {
          action: "VIEW",
          data: [{ scheme: "ayurpass" }],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
    },
    web: {
      bundler: "metro",
      favicon: "./assets/favicon.png",
    },
    experiments: {
      typedRoutes: true,
    },
    extra: {
      apiUrl,
      webUrl,
      eas: {
        projectId: "c2c21fac-bf55-46c5-a4d6-f44f1270690c",
      },
    },
    owner: "passionarc",
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      url: `https://u.expo.dev/c2c21fac-bf55-46c5-a4d6-f44f1270690c`,
    },
  };
};
