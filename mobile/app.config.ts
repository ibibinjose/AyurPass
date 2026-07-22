import type { ExpoConfig, ConfigContext } from "expo/config";

/**
 * Dynamic Expo config for AyurPass mobile (Expo SDK 55).
 *
 * This is the SINGLE SOURCE OF TRUTH for all Expo/EAS configuration.
 * mobile/app.json is a minimal stub — all real config lives here.
 *
 * API URL resolution (highest wins):
 *  1. EXPO_PUBLIC_API_URL (EAS env / shell)
 *  2. Runtime LAN / localhost in src/api.ts
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim() || "";

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
    // Ensure expo-router is primary plugin (registers entry)
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
    ],
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#1e3228",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.thepassionarc.ayurpass",
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
      package: "com.thepassionarc.ayurpass",
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
    experiments: {
      typedRoutes: true,
    },
    extra: {
      apiUrl,
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
