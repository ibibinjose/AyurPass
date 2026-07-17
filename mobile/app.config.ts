import type { ExpoConfig, ConfigContext } from "expo/config";

/**
 * Dynamic Expo config for AyurPass mobile (Expo SDK 55).
 *
 * API URL resolution (highest wins):
 *  1. EXPO_PUBLIC_API_URL (EAS env / shell)
 *  2. extra.apiUrl from static defaults
 *  3. Runtime LAN / localhost in src/api.ts
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const apiUrl =
    process.env.EXPO_PUBLIC_API_URL?.trim() ||
    (typeof config.extra?.apiUrl === "string" ? config.extra.apiUrl : "") ||
    "";

  return {
    ...config,
    name: "AyurPass",
    slug: "ayurpass",
    scheme: "ayurpass",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    // New Architecture is always on in Expo SDK 55 / RN 0.83
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#1e3228",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.ayurpass.app",
      buildNumber: "1",
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
      package: "com.ayurpass.app",
      versionCode: 1,
      softwareKeyboardLayoutMode: "resize",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#1e3228",
      },
      permissions: ["CAMERA", "READ_MEDIA_IMAGES"],
    },
    web: {
      bundler: "metro",
      favicon: "./assets/favicon.png",
    },
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
      [
        "expo-image-picker",
        {
          photosPermission:
            "Allow AyurPass to access your photos for your profile picture.",
          cameraPermission:
            "Allow AyurPass to use the camera for your profile picture.",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      ...((config.extra as object) || {}),
      apiUrl,
      eas: {
        projectId: process.env.EAS_PROJECT_ID || "REPLACE_WITH_EAS_PROJECT_ID",
      },
    },
    owner: process.env.EAS_OWNER || undefined,
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      url: process.env.EAS_UPDATE_URL || undefined,
    },
  };
};
