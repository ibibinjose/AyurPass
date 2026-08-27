# AyurPass — AWS hosting + Expo 55 mobile launch

**Last updated:** 2026-07-17

This replaces the “Railway / Vercel” soft-launch sketch with an **AWS + EAS** plan. The *capabilities* you need are the same; only the *product names* change.

---

## Why those steps still apply on AWS

Hosting on AWS does **not** remove the need for data, secrets, media, and payments. It only changes *where* you put them.

| Soft-launch need | Why you need it | On AWS (typical) | Mobile (Expo 55 / EAS) |
|---|---|---|---|
| **Ship a release** | Uncommitted code is not deployable | GitHub → CI → ECR / S3 | `eas build` from a clean commit |
| **Managed Postgres + migrations** | Nest/Prisma need a durable DB | **RDS PostgreSQL** (+ optional PostGIS) | App talks to API only — not DB |
| **Host API + web** | Backend + Next.js must be public | **ECS Fargate** or **App Runner** (API); **Amplify** / **CloudFront+S3** or **ECS** (web); **ALB** + ACM TLS | App hits `https://api…` only |
| **Real secrets** | Prod boot refuses weak JWT / open CORS | **Secrets Manager** / SSM; `DATABASE_URL`, `JWT_*`, `CORS_ORIGIN` | `EXPO_PUBLIC_API_URL` in EAS env (public API base, not DB secrets) |
| **Stripe test (or payments off)** | Soft launch can be directory + enquiry first | Same Stripe keys in Secrets Manager | Pay flows call your API; no Stripe secret in the app |
| **Object storage for media** | Local `apps/api/uploads/` is lost on every new task | **S3** + **CloudFront** | Profile photos via API → S3 |
| **Staging DNS first** | Avoid marketing “live” until payments/media solid | Route 53: `staging.ayurpass.com`, `api-staging…` | Preview EAS profile → staging API |

**CORS note:** React Native does **not** use browser CORS. Mobile needs a reachable HTTPS API and correct TLS. Web (Next) still needs `CORS_ORIGIN` allowlisting your web domain(s).

**HIPAA:** Optional for a pure directory + enquiry soft launch. If you store health notes / dosha as PHI with covered entities, plan BAA + KMS + audit later — not required for “list practices + enquire”.

---

## Recommended AWS shape (soft launch)

```
Route 53
  ├─ www / app  → CloudFront → S3 or Amplify (Next.js)  OR  ALB → ECS (web)
  └─ api        → ALB → ECS Fargate (Nest) → RDS Postgres
                         └─ S3 (uploads)
                         └─ Secrets Manager
```

Minimal alternative: **App Runner** (API) + **Amplify Hosting** (Next) + **RDS** + **S3**.

---

## Mobile: Expo SDK 55 (iOS + Android)

### Current target
- **Expo SDK ~55** · **React Native 0.83** · **React 19.2** · **Expo Router ~55**
- Bundle IDs: `com.ayurpass.app` (iOS + Android)
- Tokens: **expo-secure-store** (not AsyncStorage)
- API URL: `EXPO_PUBLIC_API_URL` / `extra.apiUrl` / LAN auto-detect in dev

### Local dev

```bash
# Terminal A — API on AWS later; locally:
cd backend && npm run start:dev   # :4000

# Terminal B — app
cd mobile
npm install --legacy-peer-deps
npx expo start
# i = iOS sim · a = Android emulator · scan QR in Expo Go (SDK 55)
```

Physical device: same Wi‑Fi as machine; Metro host IP is used automatically for `:4000`.

### Point at AWS API

| Profile | `EXPO_PUBLIC_API_URL` |
|---|---|
| development | `http://localhost:4000` or LAN (auto) |
| preview (TestFlight / internal) | `https://api-staging.ayurpass.com` |
| production | `https://api.ayurpass.com` |

Set in `eas.json` env or EAS secrets. Rebuild after changing public env (they are baked into the binary).

### Store builds (EAS)

```bash
npm install -g eas-cli
eas login
cd mobile
eas build:configure   # once — writes/links EAS project id
# Put real EAS projectId in app.config.ts extra.eas.projectId

eas build --platform ios --profile preview
eas build --platform android --profile preview

# Production (after Apple / Play consoles ready)
eas build --platform all --profile production
eas submit --platform ios --profile production
eas submit --platform android --profile production
```

### Apple / Google checklist
- [ ] Apple Developer + App Store Connect app (`com.ayurpass.app`)
- [ ] Google Play Console app + service account JSON for submit
- [ ] Privacy policy URL (use `https://www.ayurpass.com/privacy`)
- [ ] Screenshots for 6.7" iPhone + Android phone
- [ ] Replace `REPLACE_WITH_EAS_PROJECT_ID` / ASC app id in config
- [ ] Production API live with HTTPS and real JWT secrets

### What the consumer app already does
Auth, dosha assessment, discover providers, explore services, provider/service detail, book, bookings list (pay via API), profile + rewards.

### Nice-to-haves before public store
- Push notifications (Expo Notifications + SNS/FCM)
- Deep links: `ayurpass://` + universal links to `ayurpass.com`
- Offline empty states when API is down
- Provider-facing app (later; currently consumer-only)

---

## Soft-launch order (AWS + mobile)

1. **Commit** release branch  
2. **RDS** + `prisma migrate deploy`  
3. **ECS/App Runner** API with Secrets Manager  
4. **S3** for uploads (or freeze uploads temporarily)  
5. **Next** on Amplify/CloudFront  
6. **Staging DNS** + Stripe test  
7. **EAS preview** builds against staging API  
8. Internal TestFlight / Play internal track  
9. Production DNS + store production builds  

---

## Related docs
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) — Phase 2–3 roadmap  
- [mobile/README.md](../mobile/README.md) — day-to-day mobile commands  
- [SETUP_LOCAL.md](../SETUP_LOCAL.md) — local Postgres + API  
