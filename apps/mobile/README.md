# AyurPass Mobile (iOS + Android)

Consumer app for AyurPass — **Expo SDK 55 · React Native 0.83 · React 19.2 · Expo Router**.

Talks to the same NestJS API as the web app (local or **AWS**). Installed **standalone** (not a root npm workspace) so Metro does not break on hoisted deps.

## Prerequisites

- Node 20+ and npm  
- Backend reachable (`:4000` local, or your AWS API URL)  
- Expo Go (SDK 55) **or** iOS Simulator / Android Emulator  
- For store builds: [EAS CLI](https://docs.expo.dev/eas/) + Apple/Google developer accounts  

## Install & run

```bash
# Always run from mobile/ (not the monorepo root)
cd mobile
npm install --legacy-peer-deps
npx expo start --clear
# i = iOS · a = Android · w = web · scan QR with Expo Go (SDK 55)
```

> **Entry:** `package.json` → `main: "index.js"` → `expo-router/entry`.  
> If you see `Unable to resolve "../../App"`, you started Expo outside `mobile/` or with a stale cache — stop, `cd mobile`, then `npx expo start --clear`.

| Script | Purpose |
|---|---|
| `npm start` | Expo dev server |
| `npm run ios` / `android` / `web` | Platform shortcuts |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build:preview` | EAS internal build (iOS + Android) |
| `npm run build:all` | EAS production builds |
| `npm run submit:ios` / `submit:android` | Store upload |

## Pointing at the API

`src/api.ts` resolves the base URL in this order:

1. **`EXPO_PUBLIC_API_URL`** — set for EAS / AWS staging & production  
2. **`extra.apiUrl`** from `app.config.ts` / `app.json`  
3. **Dev LAN** — Metro host IP + `:4000` (physical device on same Wi‑Fi)  
4. **`http://localhost:4000`** — simulators  

Examples:

```bash
# Local machine
export EXPO_PUBLIC_API_URL=http://localhost:4000

# AWS staging
export EXPO_PUBLIC_API_URL=https://api-staging.ayurpass.com
```

In `eas.json`, preview/production profiles already set staging/prod URLs — change them to your real ALB / App Runner hostnames.

## What’s implemented

- **Auth** — welcome, register, login (tokens in `expo-secure-store`, refresh)  
- **Dosha assessment** — 12-question Prakriti, saved to API  
- **Discover** — providers  
- **Explore** — services by category  
- **Provider & service detail**  
- **Booking** — day/time, notes, confirm  
- **Bookings tab** — list + pay via API  
- **Profile** — dosha meters, rewards, retake assessment, sign out  

## AWS soft launch (mobile side)

The app only needs a **public HTTPS API**. You still need (on AWS) RDS, API service, secrets, and preferably S3 for media — see **[docs/AWS-AND-MOBILE-LAUNCH.md](../docs/AWS-AND-MOBILE-LAUNCH.md)**.

Mobile does **not** talk to Postgres or S3 directly.

## Store builds (EAS)

```bash
npm install -g eas-cli && eas login
cd mobile
eas build:configure   # once — paste project id into app.config.ts extra.eas.projectId

eas build --platform all --profile preview     # TestFlight internal / APK
eas build --platform all --profile production
eas submit --platform ios --profile production
eas submit --platform android --profile production
```

Bundle IDs: **`com.ayurpass.app`** (iOS + Android).

## Project structure

```
mobile/
  app/                 # Expo Router screens
  app.config.ts        # Dynamic config (API URL, privacy, plugins)
  eas.json             # EAS build/submit profiles
  src/api.ts           # Typed client + SecureStore auth
  src/auth.tsx         # AuthProvider
  assets/              # icon, splash, adaptive icon
```

## SDK notes

- **New Architecture** is required on SDK 55 (RN 0.83).  
- Prefer **`npm install --legacy-peer-deps`** if peer resolution conflicts during upgrades.  
- After changing `EXPO_PUBLIC_*` for production, **rebuild** (values are compile-time).  
