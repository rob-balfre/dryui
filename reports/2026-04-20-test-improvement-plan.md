# DryUI Test Improvement Plan

Date: 2026-04-20

Sources:

- local coverage and test runs on 2026-04-20
- `package.json`
- `scripts/validate.ts`
- `.github/workflows/validate.yml`
- `docs/audits/2026-04-17-fresh-eyes-review.md`

Primary goal:

- make test signal trustworthy, make coverage measurable, and then expand coverage on the highest-risk code paths first

Non-goals:

- do not chase a vanity repo-wide percentage before the suites are stable
- do not add large brittle snapshot suites as a substitute for behavioral tests
- do not gate releases on coverage thresholds that we cannot currently measure reliably

## Progress Update

Update after implementation on 2026-04-20:

- `bun run test:unit` passes: `256` passing, `0` failing.
- `bun run test:browser` passes: `49 / 49` files and `190 / 190` tests.
- `bun run test:coverage` passes and emits:
  - `coverage/unit/lcov.info`
  - `coverage/browser/index.html`
  - `coverage/browser/coverage-summary.json`
  - `coverage/summary/coverage-summary.json`
  - `coverage/summary/coverage-summary.md`
- The canonical summary currently reports:
  - unit: `56.07%` lines and `43.12%` functions
  - browser: `28.29%` lines, `30.63%` functions, `18.43%` branches, and `27.64%` statements

Implemented in this pass:

- added `scripts/coverage-summary.ts` and wired `bun run coverage:summary` plus `bun run test:coverage`
- updated `CONTRIBUTING.md`, added a dedicated PR coverage job in `.github/workflows/validate.yml`, and published retained `coverage/unit`, `coverage/browser`, and `coverage/summary` artifacts keyed by commit SHA
- added workflow coverage-lane assertions in `tests/unit/workspace-contract.test.ts`
- added focused CLI regression tests for `packages/cli/src/run.ts` and `packages/cli/src/commands/install-hook.ts`
- fixed the red unit failures in `extract-theme-color` and `generate-spec`
- fixed the browser regressions still reproducible in the current tree: stale `a11y-country-select`, `theme-bootstrap`, and `combobox`
- regenerated MCP spec and contract artifacts after the parser fix

Remaining blocker outside this pass:

- `bun run validate --no-test` still fails on unrelated `svelte-check` errors in `packages/primitives/src/context-menu/context-menu-item.svelte` and `packages/primitives/src/dropdown-menu/dropdown-menu-item.svelte`
- `packages/cli` unit coverage is still stuck at `16.58%` lines, so broader command coverage and/or Bun coverage-accounting investigation is still pending

## Initial Baseline

### Unit suite

Command:

```bash
bun run test:coverage:unit
```

Observed result on 2026-04-20:

- line coverage: `56.62%`
- function coverage: `54.05%`
- passing tests: `245`
- failing tests: `7`

Known failures:

- `tests/unit/motion/extract-theme-color.test.ts`
- `tests/unit/mcp/generate-spec.test.ts`

Per-package unit line coverage from the same run:

| Package                    |     Lines | Priority |
| -------------------------- | --------: | -------- |
| `apps/docs`                |  `88.54%` | low      |
| `packages/cli`             |  `16.58%` | critical |
| `packages/feedback`        | `100.00%` | low      |
| `packages/feedback-server` |  `61.49%` | medium   |
| `packages/lint`            |  `90.79%` | low      |
| `packages/mcp`             |  `71.24%` | medium   |
| `packages/primitives`      |  `59.01%` | high     |
| `packages/theme-wizard`    |  `53.40%` | high     |
| `packages/ui`              |  `51.70%` | critical |

### Browser suite

Command:

```bash
bun run test:coverage:browser
```

Observed result on 2026-04-20:

- no browser coverage artifact was produced
- test files passing: `37 / 50`
- test files failing: `13 / 50`
- tests passing: `145 / 186`
- tests failing: `41 / 186`

Known failing clusters:

- import and build failures in `a11y-country-select`, `a11y-transfer-rte`, and `visual-benchmark`
- Svelte lifecycle and context failures in `select`, `combobox`, `multi-select-combobox`, `file-select`, and `mega-menu`
- orphaned effect and template runtime failures in `a11y-menubar-notification`, `feedback-overlay`, `primitives-remediation`, and `theme-wizard`
- syntax failure in `theme-bootstrap`

### CI and validation baseline

Current PR validation behavior:

- `bun run validate --no-test`
- `bunx playwright install chromium`
- `bun run test:browser`

Important consequences:

- unit coverage is not enforced in CI
- browser coverage is not measured in CI
- docs visual coverage is not part of the PR gate
- the current `test:coverage` story is local-only and partially broken

## Exit Criteria

The test and coverage story is in good shape only when all of the following are true:

- `bun run test:unit` passes
- `bun run test:browser` passes
- `bun run test:coverage:unit` passes and emits a stable artifact
- `bun run test:coverage:browser` passes and emits a stable artifact
- there is one canonical coverage summary for the repo, including package-level numbers
- Tier 0 interactive components each have at least one stable browser regression test
- the current package-level baselines are enforced in CI and only ratchet upward
- docs visual coverage has a clear role in CI or nightly runs instead of living as an unused side lane

## Workstreams

### 1. Make Coverage Measurable Before Expanding It

- [x] Decide on the canonical coverage outputs:
  - unit `lcov.info`
  - browser `html` plus a machine-readable file
  - one repo summary generated from both
- [x] Add a small script such as `scripts/coverage-summary.ts` that:
  - reads unit and browser artifacts
  - prints a concise CLI summary
  - writes a JSON or Markdown snapshot for CI artifacts
- [x] Define whether "overall coverage" means:
  - combined unit + browser
  - separate unit and browser numbers
  - both, which is the safest option
- [x] Publish package-level coverage, not just one repo-wide number.
- [x] Store the first stable baseline in CI artifacts so future regressions are comparable.
- [x] Document the canonical commands in `CONTRIBUTING.md` once the workflow is stable.

Current status:

- local coverage measurement is now stable and reproducible
- PR CI now runs a dedicated coverage job, publishes the markdown summary, and uploads retained SHA-scoped artifacts for unit, browser, and combined coverage

Definition of done:

- one command answers "what is coverage right now?"
- coverage reports are reproducible from a clean checkout
- CI can upload and retain the coverage artifacts

### 2. Turn The Existing Suites Green

Coverage expansion is wasted effort until the current suites stop lying.

### 2.1 Fix the red unit tests

- [x] Fix `tests/unit/motion/extract-theme-color.test.ts` and the underlying motion helper so it runs correctly under the chosen DOM environment.
- [x] Fix `tests/unit/mcp/generate-spec.test.ts` by resolving the drift between the generator and the test expectation.
- [x] Re-run:

```bash
bun run test:unit
bun run test:coverage:unit
```

- [x] Add or tighten regression assertions so the same failures cannot silently return.

Definition of done:

- unit tests are green without skipping the failing cases
- unit coverage runs green and still emits the same artifact shape

### 2.2 Fix browser import and bundling failures

- [x] Remove the obsolete `a11y-country-select` browser harness and spec; there is no current `CountrySelect` surface in UI, primitives, or generated spec output.
- [ ] Investigate the Vite dependency re-optimization and dynamic-import reload failures affecting:
  - `tests/browser/a11y-transfer-rte.browser.test.ts`
  - `tests/browser/visual-benchmark.browser.test.ts`
- [ ] Add explicit `optimizeDeps.include` entries if that is the clean fix.
- [x] Verify `vitest --browser --run tests/browser` can load the full suite without partial file-import failures.

Current status:

- the full browser suite now loads and passes in the current tree

Definition of done:

- every browser test file loads successfully before test assertions even begin

### 2.3 Fix browser runtime failures

- [ ] Fix `lifecycle_outside_component` errors in:
  - `select`
  - `combobox`
  - `multi-select-combobox`
  - `file-select`
  - `mega-menu`
- [ ] Fix `effect_orphan` errors in overlay and anchor-position utilities and the wrappers that call them.
- [ ] Fix DOM and template runtime errors in:
  - `a11y-menubar-notification`
  - `feedback-overlay`
  - `primitives-remediation`
  - `theme-wizard`
- [x] Fix the syntax failure in `tests/browser/theme-bootstrap.browser.test.ts`.
- [ ] Review the Svelte "state referenced locally" warnings and fix the real stale-state issues instead of ignoring them.
- [x] Re-run targeted suites first, then the whole browser suite, then browser coverage.

Current status:

- `bun run test:browser` and `bun run test:coverage:browser` are green in the current tree
- the earlier runtime failure clusters listed in the baseline are not reproducing after the targeted fixes above

Definition of done:

- `bun run test:browser` passes from a clean checkout
- `bun run test:coverage:browser` passes and writes a usable report

### 3. Add The Missing Coverage Infrastructure

- [x] Add a combined coverage entry point, for example:

```bash
bun run test:coverage
bun run coverage:summary
```

- [x] Make the combined summary show:
  - overall unit line and function coverage
  - overall browser coverage
  - per-package unit coverage
  - red or missing artifacts
- [x] Decide whether browser coverage should be merged into the same report or reported separately with a single summary page.
- [x] Upload coverage artifacts in CI so local and CI numbers match.
- [x] Add a short troubleshooting section for:
  - coverage artifacts missing
  - browser suite loading but not instrumenting
  - Vite reload or optimize-deps churn

Current status:

- the local combined summary is in place and working
- PR CI now runs the same combined coverage command, publishes the repo summary to the step summary, and uploads retained unit, browser, and summary artifacts

Definition of done:

- maintainers no longer need to parse raw tool output by hand to understand test health

### 4. Raise Unit Coverage In The Worst-Covered Packages

### 4.1 CLI first

Current state: `packages/cli` is about `16.58%` line coverage.

- [ ] Add focused unit tests for:
  - `detect.ts`
  - `info.ts`
  - `init.ts`
  - `install.ts`
  - `install-hook.ts`
  - `feedback.ts`
  - `launcher.ts`
  - `project-planner.ts`
  - `setup.ts`
  - `setup-guides.ts`
  - `setup-installers.ts`
  - `run.ts`
- [ ] Use temp directories and fixture workspaces rather than broad integration shells where possible.
- [ ] Assert user-facing error output, branch selection, and filesystem side effects.
- [ ] Cover both success paths and refusal paths.

Current status:

- this pass added targeted tests around `run.ts` helper behavior and `install-hook.ts` dry-run, merge, already-wired, and invalid-settings flows
- existing higher-level tests still cover parts of `detect`, `install`, and `info`, but direct wrapper coverage remains thin and the package is still the repo's clearest unit-coverage outlier

Definition of done:

- CLI coverage is no longer the obvious outlier in the repo
- core CLI commands have contract tests around their visible behavior

### 4.2 High-value utilities with poor coverage

- [ ] Add or expand tests for:
  - `packages/mcp/src/toon.ts`
  - `packages/mcp/src/spec-formatters.ts`
  - `packages/mcp/src/project-planner.ts`
  - `packages/theme-wizard/src/engine/export-css.ts`
  - `packages/theme-wizard/src/engine/palette.ts`
  - `packages/theme-wizard/src/engine/url-codec.ts`
  - `packages/primitives/src/color-picker/extract-colors.ts`
  - `packages/primitives/src/internal/motion.ts`
  - `packages/primitives/src/utils/dismiss.svelte.ts`
  - `packages/primitives/src/utils/create-context.ts`
  - `packages/ui/src/theme-toggle/theme-controller.svelte.ts`
  - `packages/ui/src/code-block/highlighter/css.ts`
- [ ] Prefer deterministic algorithmic tests over DOM-heavy tests for these files.
- [ ] Add regressions for any bugs found while fixing browser failures.

Definition of done:

- obvious `0%` and near-`0%` files in critical paths are gone

### 5. Build A Real Component Coverage Matrix

The old audit percentages are now stale. We need generated coverage accounting.

- [ ] Generate an inventory from `packages/mcp/src/spec.json`.
- [ ] Map each component to:
  - browser tests
  - unit tests
  - docs demos or routes
  - docs visual tests, if any
- [ ] Group components into risk tiers:
  - Tier 0: core controls and core overlay or menu primitives
  - Tier 1: complex interactive composites
  - Tier 2: mostly visual, layout, or content-only components
- [ ] Commit the generated matrix or generate it in CI.
- [ ] Replace rough audit claims with generated numbers once the matrix exists.

Suggested Tier 0 starting set:

- `Button`
- `Input`
- `Textarea`
- `Checkbox`
- `RadioGroup`
- `Toggle`
- `Field`
- `Select`
- `Combobox`
- `MultiSelectCombobox`
- `FileSelect`
- `Dialog`
- `Drawer`
- `Popover`
- `Tooltip`
- `HoverCard`
- `DropdownMenu`
- `ContextMenu`
- `Menubar`
- `MegaMenu`
- `DatePicker`
- `DateRangePicker`
- `Calendar`
- `RangeCalendar`

Suggested Tier 1 starting set:

- `NotificationCenter`
- `Feedback`
- `ThemeWizard`
- `Tree`
- `Carousel`
- `Transfer`
- `RichTextEditor`
- `Chart`
- `StudioShell`
- `StudioAI`

Definition of done:

- we can answer "which important components are untested?" from generated data, not guesswork

### 6. Expand Browser Coverage On Risk, Not Vanity

- [ ] For every Tier 0 component, add at least one stable browser spec covering:
  - mount and render
  - keyboard interaction
  - focus movement or focus return
  - disabled or unavailable state
  - form or value behavior where applicable
- [ ] For every Tier 1 component, add:
  - one happy-path browser spec
  - one regression or accessibility-focused spec
- [ ] Prefer shared fixtures under `tests/browser/fixtures` instead of full docs-page tests when the component can be isolated.
- [ ] Keep docs-page browser tests for:
  - cross-component integration
  - docs route correctness
  - public-facing accessibility regressions
- [ ] Add regression coverage every time a browser bug is fixed in Workstream 2.

Definition of done:

- the browser suite protects the library's actual interaction model, not just smoke renders

### 7. Close The Docs And Visual Coverage Gap

- [ ] Audit docs routes and demos against the coverage matrix so important components are not missing both tests and demos.
- [ ] For components that gain new browser coverage, ensure the docs surface shows the same states where it makes sense.
- [ ] Reassess `bun run test:docs-visual` and decide whether it belongs in:
  - PR CI
  - a slower required lane
  - nightly only
- [ ] Expand docs visual coverage only after current visual or browser flakes are under control.
- [ ] Keep docs visual tests focused on:
  - docs shell
  - representative component pages
  - layout and theming regressions

Definition of done:

- docs coverage is no longer an accidental shadow of test coverage
- visual tests have an explicit role instead of being optional driftware

### 8. Put A Ratcheting Policy In CI

Do not add hard thresholds until the red suites are fixed and the artifact story is stable.

- [x] Add a dedicated CI job for coverage after Workstreams 1 through 3 are green.
- [x] Upload unit and browser coverage artifacts on every PR.
- [ ] Start with "no regressions from baseline" rules, not arbitrary repo-wide targets.
- [ ] Enforce package-level baselines first because repo-wide numbers hide weak spots.
- [ ] After two stable green weeks, ratchet weak packages upward in small increments.
- [ ] Fail PRs that add or materially change interactive components without one of:
  - browser coverage
  - a docs visual update
  - a documented exemption with a follow-up issue
- [ ] Keep `test:docs-visual` out of the fast path until it is proven stable.

Current status:

- coverage now runs in its own PR job and publishes a concise markdown summary alongside retained artifacts
- baseline regression checks and ratcheting thresholds are still not enforced

Suggested ratchet order:

1. lock current stable baselines
2. raise `packages/cli`
3. raise `packages/ui`
4. raise `packages/primitives`
5. raise `packages/theme-wizard`
6. then raise the repo summary

Definition of done:

- CI blocks coverage regressions without depending on fake comfort metrics

### 9. Verification Cadence

Every phase should end with the smallest command set that proves the change.

Targeted verification:

```bash
bun run test:unit
bun run test:browser -- tests/browser/<target>.browser.test.ts
```

Coverage verification:

```bash
bun run test:coverage:unit
bun run test:coverage:browser
```

Full validation:

```bash
bun run validate
```

Visual verification when relevant:

```bash
bun run test:docs-visual
```

## Suggested Execution Order

1. Stabilize the red unit tests.
2. Stabilize browser imports and runtime failures until browser coverage emits an artifact.
3. Add the coverage summary and CI artifact plumbing.
4. Expand unit coverage in CLI and other weak utility packages.
5. Generate the component coverage matrix from spec data.
6. Expand browser coverage across Tier 0 and Tier 1 components.
7. Close the docs and visual coverage gaps.
8. Add CI ratchets once the measurement and stability story is trustworthy.
