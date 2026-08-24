# AyurPass Production-Hardening Handoff

**Prepared:** 24 August 2026  
**Scope:** Security hygiene, environment reliability, durable engagement, operational observability, automated validation, mobile readiness, and deployment safeguards.

## Executive summary

This remediation batch strengthens the application at the code, database-schema, quality-assurance, mobile, and deployment-workflow levels. The branch now persists follows against authenticated accounts rather than browser-only storage, detects database-readiness failures correctly, correlates server failures to request identifiers, validates key public journeys in a browser, and exercises a database-backed API smoke journey in continuous integration.

The platform is **not yet operationally healthy in production** because its public database-aware readiness endpoint reported that the deployed API cannot reach its database. This is an infrastructure condition that cannot be repaired from the repository without AWS, database, networking, and deployment-secret access. The code changes make this failure visible to the deployment workflow rather than masking it as a successful health response.

## Implemented remediation

| Area | Delivered change | Result |
|---|---|---|
| Mobile dependency alignment | Updated the Expo SDK 55-compatible package set, React Native, Expo location, maps, router, assets, and related modules. | Expo dependency validation now reports the mobile dependency set as current. |
| Mobile type reliability | Added a local NativeWind/React Native type augmentation fallback. | The mobile application now passes TypeScript validation after the Expo package updates. |
| Dependency hygiene | Applied compatible updates to `concurrently` and validated the locked mobile dependency graph. | Production advisories were reduced from the earlier baseline; framework-bound advisories remain tracked below. |
| Durable follows | Added the `Follow` schema model and migration, authenticated list/update endpoints, dashboard API methods, optimistic client synchronization, legacy local-follow migration, and logout cleanup. | Saved practices and practitioners now persist per account across browsers and devices. |
| Consumer activation | Connected the existing Following dashboard section to authenticated server synchronization. | Members can return to saved practices and practitioners from their wellness dashboard. |
| Observability | Added request IDs and server-side logging for slow and 5xx requests, while excluding query strings and bodies from logs. | Client reports can be correlated to production logs without collecting sensitive request payloads. |
| Readiness accuracy | Changed `/health/ready` to return HTTP 503 on database failure. | Load balancers and deployment automation can now distinguish a live process from a usable API. |
| Deployment verification | Added post-ECS deployment probing of the database-aware readiness endpoint. | ECS stabilization is followed by a real API/database check. |
| CI integration testing | Added a PostGIS service, migrations, deterministic seed data, API unit tests, API startup, and authenticated smoke journey to the API workflow. | Core marketplace behavior gains an isolated database-backed regression gate. |
| Browser journeys | Added Playwright Chromium tests for desktop global search and compact mobile navigation, plus a local browser-test command. | Public discovery and navigation regressions are covered in CI. |
| Mobile build gate | Added Expo alignment and web-export checks to CI. | The mobile project is validated beyond TypeScript type checking. |

## Validation evidence

| Check | Result |
|---|---|
| Full workspace type check | Passed across API, dashboard, mobile, and shared packages. |
| API unit suite | Passed: **73 tests** across **7 suites**. |
| Follow persistence tests | Included in the API suite: save, remove, list, and removed-target rejection. |
| Readiness controller tests | Passed separately: database success and HTTP-503 failure semantics. |
| Browser journeys | Passed: desktop search routing and compact mobile navigation routing. |
| Mobile Expo validation | Passed: `expo install --check`. |
| Mobile web bundle | Passed: Expo web export completed. |
| Dashboard production build | Passed: 90 static pages generated. |
| Working-tree whitespace check | Passed: `git diff --check`. |

## Production issue requiring infrastructure access

On 24 August 2026, the live readiness endpoint returned a degraded database state:

> [`https://api.ayurpass.com/health/ready`](https://api.ayurpass.com/health/ready) returned `{"status":"degraded","database":"unreachable",...}`.

The following production checks must be completed by an AWS/database administrator or a deployment identity with the required permissions.

| Required action | Expected outcome |
|---|---|
| Inspect the active ECS task’s `DATABASE_URL` and database security-group/network path. | The API task can resolve and connect to the correct production PostgreSQL/PostGIS database. |
| Inspect ECS task logs using the new request-aware server logging. | The specific Prisma/network/credential cause of the readiness failure is identified. |
| Verify database migrations, including `20260824010000_add_user_follows`. | The `Follow` table and indexes are present in production. |
| Configure repository variable `API_HEALTHCHECK_URL` if the live API endpoint is not `https://api.ayurpass.com/health/ready`. | The deployment workflow probes the correct environment endpoint. |
| Verify AWS deployment credentials and the configured Stripe, email, storage, analytics, CORS, and backup values. | The external services remain available after deployment. |
| Deploy this branch and confirm `/health/ready` returns HTTP 200 with `status: ready`. | Production database connectivity and deployment readiness are restored. |

## Remaining dependency upgrade work

The production dependency scan reports **24 advisories**: 14 high, 10 moderate, and no critical advisories. The remaining high-risk paths are primarily coupled to the Next.js 15 to 16 major upgrade; the remaining Expo path is reported by the package advisory graph as requiring an incompatible major downgrade. Neither should be forced onto the production branch without a dedicated framework-upgrade test cycle.

The recommended next branch is a controlled **Next.js 16 and dependency-remediation upgrade** with dashboard visual regression testing, authentication/payment flow testing, and a mobile native-device smoke test. This separates framework risk from the reliability fixes already delivered here.

## Deployment sequence

1. Review and merge this remediation branch.
2. Resolve the live database connectivity issue in AWS and confirm the readiness endpoint is genuinely ready.
3. Allow the CI workflow to run its PostGIS-backed smoke journey, public Playwright journeys, and mobile export gate.
4. Deploy the API and confirm the post-deployment readiness probe passes.
5. Perform the dedicated major-framework dependency upgrade in a separate release candidate branch.
