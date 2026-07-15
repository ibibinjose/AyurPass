// AyurPass mobile is installed standalone (it is intentionally NOT part of the
// root npm workspaces) so Metro and the Expo toolchain resolve from a single,
// self-contained node_modules — avoiding React Native's monorepo hoisting traps.
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

module.exports = config;
