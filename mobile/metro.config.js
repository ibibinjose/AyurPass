// Standalone mobile package — prefer mobile/node_modules over monorepo root.
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "..");
const config = getDefaultConfig(projectRoot);

config.projectRoot = projectRoot;
// shared package lives one level up
config.watchFolders = [projectRoot, path.resolve(workspaceRoot, "shared")];

// Prefer mobile/node_modules first so root expo@wrong-version is never used
config.resolver = {
  ...config.resolver,
  nodeModulesPaths: [
    path.resolve(projectRoot, "node_modules"),
    path.resolve(workspaceRoot, "node_modules"),
  ],
  // Block monorepo-root expo packages that conflict with SDK 55
  blockList: [
    new RegExp(
      `${workspaceRoot.replace(/[/\\]/g, "[/\\\\]")}/node_modules/expo(/|$)`,
    ),
    new RegExp(
      `${workspaceRoot.replace(/[/\\]/g, "[/\\\\]")}/node_modules/expo-modules-core(/|$)`,
    ),
  ],
};

module.exports = config;
