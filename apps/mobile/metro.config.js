// AyurPass mobile — Expo monorepo Metro config with NativeWind + shared package.
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");
const config = getDefaultConfig(projectRoot);

config.projectRoot = projectRoot;
config.watchFolders = [
  projectRoot,
  path.resolve(workspaceRoot, "packages/shared"),
  path.resolve(workspaceRoot, "node_modules"),
];

config.resolver = {
  ...config.resolver,
  nodeModulesPaths: [
    path.resolve(projectRoot, "node_modules"),
    path.resolve(workspaceRoot, "node_modules"),
  ],
  disableHierarchicalLookup: true,
  // Prefer app-local Expo packages if present (avoids root version conflicts).
  blockList: [
    new RegExp(
      `${workspaceRoot.replace(/[/\\]/g, "[/\\\\]")}/node_modules/expo(/|$)`,
    ),
    new RegExp(
      `${workspaceRoot.replace(/[/\\]/g, "[/\\\\]")}/node_modules/expo-modules-core(/|$)`,
    ),
  ],
  extraNodeModules: {
    "@ayurpass/shared": path.resolve(workspaceRoot, "packages/shared"),
  },
};

module.exports = withNativeWind(config, { input: "./global.css" });
