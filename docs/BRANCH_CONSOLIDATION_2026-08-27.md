# AyurPass Branch Consolidation Record

**Completed:** 27 August 2026  
**Purpose:** Safely synchronize current development, retain every remote branch tip, and integrate outstanding recent work without replacing or discarding history.

## Preservation strategy

The repository was fetched with all remote branches and tags before any integration work. A local safety branch was created at the then-current `main` tip, and an annotated preservation tag was created for every remote branch tip. These references make the exact pre-consolidation state recoverable even if a working branch later changes.

| Preserved reference | Commit | Remote source | Status at consolidation |
| --- | --- | --- | --- |
| `safety/pre-consolidation-20260827` | `166a2a5` | `origin/main` | Recovery branch created before new integration work. |
| `preserved/20260827/main` | `166a2a5` | `origin/main` | Main-branch recovery tag. |
| `preserved/20260827/feat-visual-redesign` | `a9df0d0` | `origin/feat/visual-redesign` | Unmerged visual work preserved and integrated. |
| `preserved/20260827/fix-app-config-issues` | `d9caa03` | `origin/fix/app-config-issues` | Already contained in main. |
| `preserved/20260827/manus-ux-reliability-audit` | `ad57c1a` | `origin/manus/ux-reliability-audit` | Already contained in main. |

## Integration outcome

Only one remote branch contained work not already represented in `main`: `origin/feat/visual-redesign`. Its terracotta-accent implementation was cherry-picked onto current `main` as commit `386ee18`. The one conflicting mobile tab selection-surface line was resolved by retaining the newer botanical-green selection surface while preserving the branch’s terracotta focus indicator. This combines the sharp-modern refresh with the additional visual-redesign contribution rather than choosing one over the other.

A follow-up commit, `7b3622d`, synchronizes the require-able CommonJS token mirror with the canonical TypeScript token source. This avoids a stale-token split between tooling and application code.

## Validation after consolidation

| Validation | Result |
| --- | --- |
| Locked dependency installation | Passed using a low-memory, serial install configuration. |
| Prisma Client generation | Passed. |
| Cross-workspace type checks | Passed for API, dashboard, mobile, and shared packages. |
| API regression suite | Passed: 11 suites and 84 tests in serial execution. |
| Dashboard production build | Passed. |
| Repository object integrity | Passed with `git fsck --full`. |
| Diff whitespace integrity | Passed with `git diff --check`. |

## Resulting history

The current branch contains the recent production-readiness work, the prior sharp-modern AyurPass refresh, and the recovered visual-redesign work. No existing remote branches were deleted, reset, or force-pushed as part of this consolidation.
