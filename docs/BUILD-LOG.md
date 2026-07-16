# AyurPass Build Log

## 2026-07-17 — Credentials, health authorities, blue tick, Apple HIG
- Provider + Professional: `registrationNumber`, `licenceNumber`, `healthAuthorities` (JSON badges)
- Presets: AAA (AU), AHPRA, CMBA, ATMS, Yoga Aus, NMC/CCIM (IN), CQC/GMC/CNHC (UK), NCCAOM (US)
- Dashboard: Business profile + Settings (practitioner) edit credentials & authority marks
- Public profiles/cards: authority chips + reg/licence lines; **blue tick** (iOS system blue) next to name
- Apple design tokens: system blue, separators, grouped surfaces, continuous corners
- Migration: `20260717120000_credentials_and_authorities`

## 2026-07-17 — Mobile-first design (web + iOS/Android app)
- Fluid type scale, higher-contrast ink, safe-area insets, 44px tap targets
- Viewport `device-width` + `viewport-fit=cover` for notch/home indicator
- **Verified = tick only** (no “Verified” label) via `VerifiedTick` on web + mobile
- Cards/nav/catalog: denser mobile padding, bolder titles, clearer meta hierarchy
- Expo: responsive horizontal padding, larger body type, tick mark on provider list/detail

## 2026-07-17 — UI/UX polish + P0 security pack
### Frontend UX
- Skip-to-content, global `:focus-visible` rings, reduced-motion support (`globals.css`)
- Navbar simplified: primary Discover / Retreats / Offers / Book + **More** menu; mobile drawer with Escape, scroll lock, route close
- Shared UI: `PageHeader`, `FilterChip`, `CardSkeletonGrid`, `SuccessNote`, `EmptyState` actions, soft button variant
- Catalog pages (explore, shop, packages, discover): retry on error, result counts, consistent headers, no nested `<main>`
- Cards: meaningful image `alt`, lazy loading, shared `card-surface` hover
- Enquire modal: dialog a11y, Escape, body scroll lock, client validation
- Dashboard: active nav prefix matching, mobile chip scroll, login `?next=` redirect, privacy link from settings
- Login: rate-limit messaging, safe `next` redirect, back-to-home
- Default OG image → landscape `og-wellness.jpg` (1200×630), locale `en_AU`

### Backend security (P0)
- Payment IDOR closed: `assertBookingPayer` / `assertOrderPayer` on checkout/confirm; party checks on refund
- Production hard-fail for JWT secrets + explicit CORS; HSTS when strict
- Auth throttling (`@nestjs/throttler`): 10 login/register/min, 20 refresh/min
- Password min length 8 (API); mock card pay blocked when `NODE_ENV=production` or `AYURPASS_STRICT=1`
- Privacy dashboard `/dashboard/permissions` + enriched `GET /consents/me`

## 2026-07-10 17:55 — Full Ownership Mode
- User requested full-stack development without further direction
- Taking full ownership to build a complete, production-grade AyurPass platform
- Continuing aggressive development of backend + starting mobile app scaffolding
- Created root package.json with convenient scripts:
  - npm run dev:backend
  - npm run dev:frontend
  - npm run dev:mobile
  - npm run install:all
- Backend now runs cleanly with `npm run start:dev` inside backend/ folder
- All modules compile successfully
- Added HealthProfilesModule (Prakriti scores + health tracking)
- Added PackagesModule (package creation & provider listing)
- Added TreatmentPlansModule (full CRUD for longitudinal plans)
- Added AuthModule (JWT authentication with login/register)
- Initialized NestJS backend structure
- Created production-grade Prisma schema with all core + advanced models
- Implemented modules:
  - UsersModule
  - BookingsModule
  - ConsentsModule (with create/revoke)
  - ProfessionalsModule
  - AuthModule (JWT + bcrypt login/register)
  - TreatmentPlansModule
  - PackagesModule
  - HealthProfilesModule
- Added PrismaService with proper lifecycle hooks
- Updated README with current progress
- Added PackagesModule (package creation & provider listing)
- Added TreatmentPlansModule (full CRUD for longitudinal plans)
- Added AuthModule (JWT authentication with login/register)
- Initialized NestJS backend structure
- Created production-grade Prisma schema with all core + advanced models
- Implemented modules:
  - UsersModule
  - BookingsModule
  - ConsentsModule (with create/revoke)
  - ProfessionalsModule
  - AuthModule (JWT + bcrypt login/register)
  - TreatmentPlansModule
  - PackagesModule
- Added PrismaService with proper lifecycle hooks
- Updated README with current progress
- Added PackagesModule (package creation & provider listing)
- Added TreatmentPlansModule (full CRUD for longitudinal plans)
- Added AuthModule (JWT authentication with login/register)
- Initialized NestJS backend structure
- Created production-grade Prisma schema with all core + advanced models
- Implemented modules:
  - UsersModule
  - BookingsModule
  - ConsentsModule (with create/revoke)
  - ProfessionalsModule
  - AuthModule (JWT + bcrypt login/register)
  - TreatmentPlansModule
- Added PrismaService with proper lifecycle hooks
- Updated README with current progress

## 2026-07-10 12:45 — Documentation Phase Complete
- Created comprehensive documentation suite (9 documents)
- Executive Overview, Business Strategy, Database Schema, Advanced Features, Integrations, User Journeys, API Contracts, AI Engine, Prisma Models

---

*All timestamps in GMT+10*