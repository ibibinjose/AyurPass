// AyurPass mobile — Expo monorepo Metro + NativeWind + shared package.
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");
const config = getDefaultConfig(projectRoot);

config.projectRoot = projectRoot;
// Watch monorepo packages used by the app.
config.watchFolders = [
  projectRoot,
  path.resolve(workspaceRoot, "packages/shared"),
  path.resolve(workspaceRoot, "node_modules"),
];

config.resolver = {
  ...config.resolver,
  // Prefer the app's node_modules, then the workspace root (npm workspaces hoist).
  nodeModulesPaths: [
    path.resolve(projectRoot, "node_modules"),
    path.resolve(workspaceRoot, "node_modules"),
  ],
  extraNodeModules: {
    "@ayurpass/shared": path.resolve(workspaceRoot, "packages/shared"),
  },
  // Ensure a single copy of critical React packages.
  unstable_enableSymlinks: true,
};

module.exports = withNativeWind(config, { input: "./global.css" });
