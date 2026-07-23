# Changelog

## 1.1.0 — 2026-07-23

### Platform
- Monorepo packages aligned to **1.1.0** (root, api, dashboard, mobile, shared)
- Mobile app version **1.1.0** (`app.config.ts`)
- API health endpoint reports **1.1.0**
- Dependency cleanup: single React **19.2.0**, reanimated **4.2.1**
- Expo doctor: **19/19** checks passed

### Mobile
- EAS production + preview workflows
- iOS bundle id `com.passionarc.ayurpass`
- Production API env on preview/production builds

### Web / API
- Amplify monorepo deploy path for `apps/dashboard`
- Device push token API (optional; push client stubbed until Apple Push capability)

