# Controlled Dependency Remediation — Next.js 16

**Branch:** `security/next-16-dependency-remediation`

**Status:** Ready for code review; manual visual and device verification remains required before merge.
**Scope:** Upgrade the dashboard's direct Next.js framework group only. This document deliberately excludes Prisma and Expo remediation work.

## Decision and Scope

The production dependency audit reported 21 advisories: 10 high and 11 moderate. The direct dashboard dependency `next` was responsible for the framework group containing the `next`, `postcss`, and `sharp` advisories. The repair upgrades `next` from the Next.js 15 release line to **16.3.3** while retaining the existing compatible ESLint configuration.

This is a controlled, reviewable framework migration rather than an `npm audit fix --force` operation. The dashboard already uses React 19.2, Node 22, and TypeScript 5. Its source scan found no synchronous `cookies`, `headers`, `draftMode`, `searchParams`, `params`, or `revalidateTag` usages that require a Next.js 16 migration. The dashboard also has no custom Webpack configuration. These conditions align with the official Next.js 16 upgrade requirements and reduce the migration surface.[1]

| Dependency | Previous resolved release | Remediated release | Reason                                                                                        |
| ---------- | ------------------------: | -----------------: | --------------------------------------------------------------------------------------------- |
| `next`     |                   15.5.23 |             16.3.3 | Removes the direct framework advisory and its affected `postcss` and `sharp` dependency path. |

| `react` / `react-dom` | 19.2.0 | 19.2.0 | Already compatible with Next.js 16; no change required. |

## Audit Evidence

| Audit state               | High | Moderate | Critical | Total |
| ------------------------- | ---: | -------: | -------: | ----: |
| Before this branch        |   10 |       11 |        0 |    21 |
| After Next.js remediation |    7 |       11 |        0 |    18 |
| Reduction                 |    3 |        0 |        0 |     3 |

The remaining advisories are intentionally not bundled into this change. Their automated suggestions require incompatible or semver-major Expo and Prisma changes, or are nested in the Metro toolchain. They need separate compatibility groups, device checks, and reviewable pull requests.

| Remaining group     | Remaining risk                                                      | Required next action                                                                                                                                           |
| ------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Expo SDK 55 / Metro | 4 high and 11 moderate transitive or direct advisory paths          | Create a dedicated Expo SDK remediation branch; validate Android and iOS device builds, authentication, image picking, secure storage, location, and checkout. |
| Prisma              | 3 high advisory paths involving `@prisma/config` and `deepmerge-ts` | Investigate the vendor-supported patched upgrade path; validate schema generation, migrations, API unit tests, and a database-backed smoke flow.               |

## Automated Validation Evidence

The following checks passed using the upgraded lockfile:

| Surface                         | Command                                                                   | Result                                                        |
| ------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Locked installation             | `npm ci --no-audit --no-fund`                                             | Passed.                                                       |
| Dashboard lint                  | `npm run lint -w @ayurpass/dashboard`                                     | Passed.                                                       |
| Dashboard typecheck             | `npm run typecheck -w @ayurpass/dashboard`                                | Passed.                                                       |
| Dashboard production build      | `npm run build:dashboard`                                                 | Passed under Next.js 16.3.3 with Turbopack.                   |
| Dashboard browser journeys      | `NEXT_PUBLIC_API_URL=http://localhost:4000 npm run test:e2e`              | Passed: 2 assertions passed, 2 expected mobile-project skips. |
| API unit suite                  | `npm run test -w @ayurpass/api -- --runInBand`                            | Passed: 11 suites and 84 tests.                               |
| Mobile dependency alignment     | `CI=1 npx expo install --check`                                           | Passed.                                                       |
| Mobile typecheck and web export | `npm run typecheck` and `npx expo export --platform web` in `apps/mobile` | Passed.                                                       |

## Required Manual Regression Checks Before Merge

Automated checks do not replace visual verification. A release owner must record the device, browser, account, timestamp, and outcome for each check below before merging this branch.

| Priority | Surface                 | Manual check                                                                                                                                                                                                                                      | Evidence required                                                        |
| -------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| P0       | Desktop web             | Open the public home, discovery, provider profile, booking, checkout, login, registration, and dashboard business screens at desktop width. Confirm navigation, layout, images, forms, client-side validation, and error states render correctly. | Screenshots or recording plus tester sign-off.                           |
| P0       | Mobile web              | Repeat public discovery, provider profile, booking, and checkout navigation at a narrow mobile viewport. Verify menus, filtering, back navigation, and Stripe hand-off.                                                                           | Screenshots or recording plus tester sign-off.                           |
| P0       | iOS device              | Validate sign-in, restored session, provider discovery, booking, logo/image-picker permission flow, address entry, payment sheet launch, and app recovery after backgrounding.                                                                    | Device model, iOS version, build identifier, and sign-off.               |
| P0       | Android device          | Validate the corresponding Android flows, including hardware-back navigation, image-picker permission flow, secure-storage session restoration, and payment sheet launch.                                                                         | Device model, Android version, build identifier, and sign-off.           |
| P1       | Provider operations     | Verify business profile address, logo, cover media, services, availability, subscription portal, and receipt history with a provider account.                                                                                                     | Test account identifier and screenshots.                                 |
| P1       | Customer communications | On a non-production Stripe/SMTP environment, complete payment, cancellation, refund, and provider-subscription paths. Verify one receipt/invoice and one transactional email per event.                                                           | Processor event ID, receipt ID, outbox status, and mail-delivery result. |

## Rollback Plan

Do not merge this branch until the required manual checks pass. If a production or staging issue appears after merge, revert the remediation commit or the merged pull request as a whole, restore the prior lockfile, run `npm ci`, and redeploy the previously verified dashboard build. Do not partially edit generated lockfile entries during rollback.

## Review Checklist

| Check           | Required outcome                                                                                                                                         |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scope review    | Diff changes only the dashboard's Next.js compatibility group, lockfile resolutions, generated Next.js-required configuration, and this evidence record. |
| Security review | Audit decreases by the three Next.js framework-path advisories; no credentials, production data, or unrelated dependency churn are present.              |
| CI review       | Lint, typecheck, build, browser, API, and mobile checks are green.                                                                                       |
| Manual sign-off | All P0 rows above have recorded evidence from desktop, mobile web, iOS, and Android.                                                                     |
| Merge decision  | A designated release owner explicitly approves or rejects merge after reviewing remaining Expo and Prisma advisories.                                    |

> This document is an engineering release checklist, not legal, tax, accounting, accessibility-certification, or privacy advice. Product owners must obtain jurisdiction-specific professional review before handling production payments, receipts, taxes, and customer data.

## References

[1]: https://nextjs.org/docs/app/guides/upgrading/version-16 "Next.js: How to upgrade to version 16"
