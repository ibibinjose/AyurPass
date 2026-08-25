# AyurPass Sharp Modern Refresh

**Completed:** 25 August 2026  
**Scope:** Shared brand system, customer web experience, public-profile recovery, native navigation, and release validation.

## Outcome

AyurPass has been refreshed as a **sharper, more deliberate premium-wellness product**. The core identity remains intact: the meditative lotus symbol that forms an “A”, a botanical-green foundation, warm ivory surfaces, and saffron vitality. The implementation makes that identity clearer at icon scale, more consistent across web and mobile, and less visually diffuse in high-traffic customer flows.

The customer experience now gives priority to discovery while keeping the constitution quiz, practice onboarding, sessions, events, offers, calendar, retail, retreats, and profile tools accessible through existing routes. This is a product-strengthening release, not an unbounded feature expansion.

## Delivered changes

| Area | Completed implementation | Result |
| --- | --- | --- |
| Brand mark | Created a refined version of the existing lotus-and-A mark, keeping the centred dot, three-petal silhouette, botanical green, ivory field, and saffron point of light. | The mark is more balanced and legible at PWA and native icon sizes while remaining recognisably AyurPass. |
| Brand assets | Packaged matching master, favicon, PWA, Apple, and Expo icon assets from the refined mark. The transparent verification seal was deliberately retained for cover-image use. | Web, installed-PWA, and native app entry points now share a consistent identity without regressing verified-badge presentation. |
| Web skin | Updated the web palette, aliases, focus treatment, card edges, elevation, glass treatment, and interaction shadows. | The visual system has deeper botanical contrast, cleaner hierarchy, more precise borders, and restrained saffron emphasis. |
| Shared tokens | Updated the canonical `@ayurpass/shared` palette and applicable service colours. | Native and web UI draw from the same refined brand language. |
| Navigation | Reduced desktop primary navigation to the four most immediate marketplace tasks; retained calendar in the secondary menu and account menu. Search, keyboard focus, responsive drawer, and existing routes remain intact. | Users encounter less first-level choice overload without losing access to existing functionality. |
| Homepage | Tightened the search control, hero typography, action language, discovery card styling, and entry-point section framing. | Discovery is visually and semantically the clearest first action. |
| Public-profile recovery | Replaced the passive incomplete-profile message with direct discovery and eligible business-claim actions. | Visitors can continue their journey instead of reaching a dead end. |
| Native navigation | Updated tab selection contrast, control geometry, label treatment, and surface shadow. | The mobile app retains its purposeful Discover, Bookings, Calendar, and Profile model with a cohesive renewed finish. |
| PWA metadata | Aligned installed-app chrome to the refreshed deep-green brand anchor. | Browser and installed-app context better match the new mark and web surface. |

## Validation

| Check | Result | Evidence |
| --- | --- | --- |
| Dependency installation | Passed | Locked workspace dependencies installed with `npm ci`. |
| Schema generation | Passed | Prisma Client regenerated successfully. |
| Cross-workspace type checks | Passed | API, dashboard, mobile, and shared workspaces completed successfully. |
| Dashboard production build | Passed | Next.js compiled and generated all 90 static pages. |
| API regression tests | Passed | 11 suites and 84 tests passed in serial execution. |
| Lint and source integrity | Passed | Workspace lint completed successfully; `git diff --check` reported no whitespace errors. |
| Asset packaging | Passed | Refined primary icons validated at 512 × 512 for PWA and Expo targets. |

> The default parallel API test command was affected by a sandbox worker termination under transient memory pressure. Rerunning the same API suite serially completed successfully with all 84 tests passing. This does not indicate an application-test failure.

## Operational notes

No payment, clinical, consent, database, or third-party integration behaviour was altered in this release. Those production concerns remain governed by their existing environment configuration. The refreshed app has been validated at the source, type, production-build, and API-test levels; live payment or database-readiness confirmation requires the connected production services.

## Key files

| File group | Purpose |
| --- | --- |
| `apps/dashboard/public/brand/*`, `apps/mobile/assets/*` | Refined primary brand mark and platform-specific assets. |
| `apps/dashboard/src/lib/brand.ts`, `apps/dashboard/src/components/Logo.tsx` | Cache-versioned asset activation and shared logo presentation. |
| `apps/dashboard/src/app/globals.css`, `packages/shared/src/tokens.ts` | Cross-platform sharp-modern visual language. |
| `apps/dashboard/src/components/Navbar.tsx`, `apps/dashboard/src/app/page.tsx` | Clearer customer navigation and discovery-first homepage experience. |
| `apps/dashboard/src/app/providers/[id]/ProviderProfileClient.tsx` | Actionable recovery state for incomplete listings. |
| `apps/mobile/app/(tabs)/_layout.tsx` | Refined native-app task navigation. |
| `scripts/package_refined_brand_assets.py` | Reproducible icon export helper for future brand-mark updates. |
