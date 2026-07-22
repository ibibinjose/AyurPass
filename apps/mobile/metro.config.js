// AyurPass mobile — Expo monorepo Metro + NativeWind + shared package.
// Keep overrides minimal so `npx expo-doctor` stays green.
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Preserve Expo defaults, then add monorepo roots.
config.watchFolders = [
  ...new Set([
    ...(config.watchFolders ?? []),
    projectRoot,
    monorepoRoot,
    path.resolve(monorepoRoot, "packages/shared"),
  ]),
];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules ?? {}),
  "@ayurpass/shared": path.resolve(monorepoRoot, "packages/shared"),
};

module.exports = withNativeWind(config, { input: "./global.css" });
