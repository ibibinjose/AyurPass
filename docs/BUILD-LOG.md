# AyurPass Build Log

## 2026-07-28 — Documentation Updates & Current State
- **Documentation Refresh**: Updated README.md, RUN_APP.md, SETUP_LOCAL.md, and IMPLEMENTATION_PLAN.md to reflect current application state
- **Feature Inventory**: Documented all 32+ backend modules and their functionalities
- **Architecture Update**: Reflected current tech stack including PostGIS for geospatial features
- **Deployment Status**: Updated to reflect 24+ database migrations and production deployment status

## 2026-07-24 — Provider Currency Support, Email Verification, Forgot Password
- **Provider Currency**: Added `provider_currency` field allowing international providers to operate in their local currency
- **Email Verification**: Implemented email verification flow with timestamp tracking (`email_verified_at`)
- **Forgot Password**: Added secure password recovery mechanism
- **Migration**: `20260724120000_email_verified_at` and `20260721020938_add_forgot_password`

## 2026-07-23 — Job Listings Module
- **Job Listings**: Added dedicated module for wellness industry employment opportunities
- **Job Management**: Create, update, and search functionality for job postings
- **Application Process**: Integration with user profiles for job applications
- **Migration**: `20260723160000_job_listings`

## 2026-07-22 — Device Push Tokens & Staff Management
- **Device Tokens**: Added push notification infrastructure for mobile devices
- **Staff Management**: Enhanced provider staff management capabilities
- **Notification System**: Server-side push notification handling
- **Migration**: `20260722120000_device_push_tokens` and `20260721020938_add_forgot_password`

## 2026-07-21 — Professional & Provider Slugs
- **Professional Slugs**: Added vanity URLs for professionals (`/pro/:slug`)
- **Provider Slugs**: Added vanity URLs for providers (`/practice/:slug`)
- **Migration**: `20260720100000_add_provider_currency`, `20260716120000_professional_slug`, `20260716130000_provider_slug`

## 2026-07-20 — Database fixes, React Compiler strictness, and AWS Amplify hosting readiness
- **Database Migrations**: Fixed PostgreSQL collation mismatches. Corrected Prisma migrations SQL sequence dependencies where `FeedbackReport`, `Reaction`, and `Review` columns were dropped prior to their definition.
- **React Compiler & Hook Strictness**: Wrapped synchronous state updates within `useEffect` hooks in async microtask deferrals (`await Promise.resolve()`) across Next.js and custom components to avoid cascading renders.
- **Render-phase URL Hydration**: Refactored URL query syncing in `useDirectoryUrlState.ts` to update local state directly during the render phase and defer ref writes to a dedicated `useEffect` hook.
- **TypeScript Type Corrections**:
  - Eliminated `any` casts in `terminal/page.tsx` and `products/page.tsx`.
  - Added `InventoryTransaction` interface to properly type stock movement logs in `products/page.tsx`.
  - Fixed empty interface declaration in `PasswordInput.tsx` with a type alias.
- **JSX Character Escaping**: Wrapped unescaped single quotes and apostrophes in JSX curly braces in `forgot-password` and `RetreatDetailClient.tsx` templates.
- **Calendar Layout Refactoring**:
  - Extracted inner components `ResourceDayGrid` and `EventBlock` from inside the render body of the `CalendarPage` component to the module scope to avoid re-declaring components during render.
  - Moved columns memoization hooks above the early return checks.
- **AWS Amplify Hosting Readiness**:
  - Configured Next.js production build for standalone output (`output: "standalone"`) inside `next.config.ts` to compile self-contained packages.
  - Aligned root and frontend `amplify.yml` build configurations.
  - Created a step-by-step AWS Amplify and App Runner hosting playbook at `docs/AWS-AMPLIFY-HOSTING.md`.
- **Growth Plan Pricing & Feature Updates**: Modified subscription tiers on the landing and benefits pages to update the Growth plan pricing to $369/month, adding Social media management, One Page WebSite, and 1 Podcast to the tier's features.
- **Dynamic SEO Keywords Mapping**: Implemented a dynamic keyword mapping helper (`getDynamicKeywords`) in `frontend/src/lib/seo.ts` to automatically enrich HTML metadata keywords for providers and practitioners based on their specific wellness disciplines (e.g. adding 'Panchakarma', 'Abhyanga massage' for Ayurveda clinics, and 'Vinyasa flow' for yoga studios).
- **Pro-AI Crawler Configuration**: Refactored `frontend/src/app/robots.ts` to explicitly welcome and allow indexing by major AI/LLM search crawlers (`GPTBot`, `ChatGPT-User`, `ClaudeBot`, `Grok`, `xai-crawler`, `PerplexityBot`, `Google-Extended`, and `Applebot-Extended`) while securing private endpoints (dashboard, logins, etc.).

## 2026-07-17 — Tags + AAA AU row, profiles, discover, link-in-bio
- **TagAuthorityRow**: discipline/focus tags (e.g. Ayurveda) sit beside authority chips (**AAA AU**) on one row
- Used on Discover **Practitioners** & **Practices** cards, practice & practitioner public profiles
- AAA import always surfaces `AAA` + region `AU` (from `verificationDocuments.source = aaa`)
- Professional list/detail APIs no longer return `passwordHash` (public user select)
- Practitioner & practice profiles: high-end layout, no duplicate contact/share blocks
- Discover practitioners: polished cards, verified chip filter, sort hint
- Link-in-bio pages: `/practice/:slug/bio` and `/providers/:id/bio` for social bios
- Profile tabs include Services & Shop; dashboard Public URL shows bio share link
- Vanity root handles: request from Business → Public URL; admin approve/deny
- Social links: handle-only entry with platform prefix; brand logos on public profiles

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

## 2026-07-10 12:45 — Documentation Phase Complete
- Created comprehensive documentation suite (9 documents)
- Executive Overview, Business Strategy, Database Schema, Advanced Features, Integrations, User Journeys, API Contracts, AI Engine, Prisma Models

---

*All timestamps in GMT+10*