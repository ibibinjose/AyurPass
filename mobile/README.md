# AyurPass Mobile (iOS + Android)

The consumer app for AyurPass, built with **Expo (React Native) + Expo Router + TypeScript**.
It talks to the same NestJS API as the web app and shares the brand design language.

> This package is installed **standalone** — it is intentionally *not* part of the root
> npm workspaces. React Native's Metro bundler and the Expo toolchain are fragile when
> their dependencies are hoisted, so the app keeps its own self-contained `node_modules`.

## Prerequisites

- Node 18+ and npm
- The **backend running** (`npm run dev:backend` from the repo root → API on `:4000`)
- Either the **Expo Go** app on your phone, or an iOS Simulator / Android Emulator

## Install & run

```bash
cd mobile
npm install          # standalone install (do NOT run from the repo root)
npx expo start       # then press i (iOS sim), a (Android emulator), or scan the QR in Expo Go
```

## Pointing the app at your API

`src/api.ts` resolves the API base URL in this order:

1. `extra.apiUrl` in **app.json** — set this for staging/production
   (e.g. `"apiUrl": "https://api.ayurpass.com"`).
2. In dev, the **LAN IP of the Metro host + `:4000`** — so a physical phone on the same
   Wi‑Fi reaches the backend on your computer automatically. No config needed.
3. `http://localhost:4000` — for the iOS Simulator.

If a physical device can't reach the API, make sure your phone and computer are on the same
network and that the backend allows the origin (CORS is currently pinned to the web app).

## What's implemented

The full consumer journey, wired to the live API:

- **Auth** — welcome, register, login (tokens stored in `expo-secure-store`, auto‑refresh)
- **Onboarding** — the 12‑question Prakriti (dosha) assessment, saved to the backend
- **Discover** — searchable list of verified providers
- **Explore** — services browsable by category
- **Provider & service detail** — profiles and bookable sessions
- **Booking** — pick a day/time, add notes, confirm
- **Bookings tab** — your reservations with a mock‑payment "Pay now" action
- **Profile** — your dosha meters, AyurPass Rewards balance, retake assessment, sign out

## Project structure

```
mobile/
  app/                    # Expo Router screens (file-based routing)
    _layout.tsx           # fonts + auth gate + navigation stack
    (auth)/               # welcome, login, register
    (tabs)/               # discover, explore, bookings, profile
    assessment.tsx        # dosha questionnaire
    provider/[id].tsx     # provider profile
    service/[id].tsx      # service detail
    book/[serviceId].tsx  # booking flow
  src/
    api.ts                # typed API client (SecureStore auth, host auto-detect)
    auth.tsx              # AuthProvider / useAuth
    types.ts              # API types (mirrors the backend contract)
    dosha.ts              # Prakriti questions + scoring (identical to web)
    theme.ts, catalog.ts  # brand tokens, labels & icons
    components/           # UI kit, ServiceCard, DoshaMeter
  assets/                 # app icon, adaptive icon, splash, favicon
```

## Building for the App Store / Play Store

Use **Expo Application Services (EAS)** — no local Xcode/Android build farm required:

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios       # or android, or all
eas submit --platform ios      # upload to App Store Connect / Play Console
```

Set a production `extra.apiUrl` (or an EAS environment/`app.config` variant) before building.

## Scripts

- `npm start` — Expo dev server
- `npm run ios` / `npm run android` / `npm run web`
- `npm run typecheck` — `tsc --noEmit`
