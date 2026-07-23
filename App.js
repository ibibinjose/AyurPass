// Monorepo root fallback for expo/AppEntry.js when Metro resolves ../../App
// from the hoisted node_modules/expo/AppEntry.js package.
//
// ⚠️ WARNING: DO NOT RUN EXPO FROM THE MONOREPO ROOT DIRECTORY!
// If you run 'npx expo start' here, Expo CLI will load the wrong configuration
// (the root app.json instead of the mobile sub-app's config), and NativeWind CSS
// compilation will fail.
//
// To start the mobile app correctly:
//   - Run "npm run dev:mobile" from the monorepo root, or:
//   - Run "cd apps/mobile && npx expo start --clear"
//
import App from "./apps/mobile/App";

export default App;
