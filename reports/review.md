# DryUI Main Branch Review

Date: 2026-04-23
Branch: `main`
HEAD: `4fc26d1e`
Open GitHub issues: 0
Open GitHub PRs: 0

## Scope And Review Standard

This review covered the current `main` branch through package-focused agent passes, repository scans, Svelte/DryUI documentation checks, local gates, and targeted code inspection of high-risk paths. I used the current Svelte guidance for SSR state, effects, custom properties, and keyed rendering, plus contemporary code-review/clean-code guidance that prioritizes code health, understandable design, tests, simplicity, and consistency.

External references used:

- Google Engineering Practices, "The Standard of Code Review": https://google.github.io/eng-practices/review/reviewer/standard.html
- Google Engineering Practices, "What to look for in a code review": https://google.github.io/eng-practices/review/reviewer/looking-for.html
- Svelte best practices: https://svelte.dev/docs/svelte/best-practices
- Svelte `$effect`: https://svelte.dev/docs/svelte/$effect
- SvelteKit state management: https://svelte.dev/docs/kit/state-management

## Verification Snapshot

- `gh-axi issue list --state open --limit 50`: 0 open issues.
- `gh-axi pr list --state open --limit 50`: 0 open pull requests.
- `bun run test:unit`: passed, 1054 tests across 81 files.
- `bun run check`: failed. The blocking failure is `check:lint:violations`, currently 42 violations.
- `bun run check:lint:violations`: failed with 42 committed violations in `packages/ui/src`.
- `bun run validate --no-test`: failed after Phase 7 because the drift guard reported `M packages/mcp/src/architecture.json`. An immediate `git status --short` after the command was clean, which makes this look transient or nondeterministic, but the release gate still exited 1.
- `bun run validate --no-test` also surfaced a Cloudflare Pages `_routes.json` warning and a large number of `svelte-package` warnings about local ignored `.d.ts` files in package `src` trees.
- DryUI MCP `check` reported blockers, but a large part of that output is stale/noisy against this branch. I treated it as a signal about checker quality, not as a direct list of source defects.
- Repository shape: 2174 tracked files, 2085 tracked TS/Svelte/JS/CSS/MD files, about 186k lines in those file types.

## Highest Priority Findings

### Critical: feedback server is unauthenticated with wildcard CORS and local dispatch side effects

Evidence:

- `packages/feedback-server/src/http.ts:29` defines `Access-Control-Allow-Origin: '*'`.
- `packages/feedback-server/src/http.ts:232` exposes `POST /dispatch`.
- `packages/feedback-server/src/http.ts:264` calls `dispatchPrompt(...)`, which launches local editor/agent integrations from attacker-controlled request JSON.
- `packages/feedback-server/src/http.ts:380`, `packages/feedback-server/src/http.ts:393`, and `packages/feedback-server/src/http.ts:415` expose drawings and submissions without an auth check.

Impact:

Any site visited by a developer can issue browser requests to the local feedback server. The wildcard CORS header also lets that site read responses. `/dispatch` is especially risky because it can trigger local Codex/Claude/Cursor/Windsurf workflows with a malicious prompt. This is a local privacy and local-side-effect issue, not just a deployment hardening issue.

Recommendation:

Require a per-project secret, session token, or strict origin allowlist on every state-changing and read endpoint. Treat `/dispatch`, `/submissions`, `/drawings`, `/annotations`, and SSE endpoints as protected. Add tests proving a foreign `Origin` cannot read data or dispatch an agent. Consider checking `Origin`, `Sec-Fetch-Site`, and a bearer/CSRF token.

### Critical: `main` is red under the repo's own `bun run check`

Evidence:

- `package.json:46` defines `check` as the repo-wide static gate.
- `package.json:39` includes `check:lint:violations`.
- `bun run check:lint:violations` currently fails with 42 violations.

Representative violations:

- Raw headings: `packages/ui/src/heading/heading.svelte:30`, `packages/ui/src/markdown-renderer/markdown-renderer.svelte:19`, `packages/ui/src/timeline/timeline-title.svelte:14`.
- Raw images: `packages/ui/src/avatar/avatar.svelte:69`, `packages/ui/src/image/image.svelte:40`, `packages/ui/src/logo-mark/logo-mark.svelte:51`.
- Raised surfaces with solid borders: `packages/ui/src/combobox/combobox-content.svelte:13`, `packages/ui/src/toolbar/toolbar-root.svelte:10`, `packages/ui/src/internal/picker-popover-content.svelte:7`.
- Motion polish violations: `packages/ui/src/internal/modal-content.svelte:235`, `packages/ui/src/toast/toast-root.svelte:53`.

Impact:

The design-system package is knowingly shipping against a failing internal policy. This weakens every future review because contributors cannot tell whether a new violation is a regression or existing debt.

Recommendation:

Fix the 42 violations or explicitly codify narrow exceptions with `dryui-allow` comments and rationale. Do not leave broad project-level debt in a blocking gate. Add the same gate to the release pipeline, covered below.

### High: release gate does not run the same lint-violation gate as `bun run check`

Evidence:

- `package.json:55` sets `release:gate` to `bun run validate --no-test`.
- `scripts/validate.ts:71` through `scripts/validate.ts:151` run unit lint tests, builds, docs checks, contract checks, publish hygiene, benchmarks, and skill sync.
- `scripts/validate.ts` does not run `bun run check:lint:violations`.
- `bun run validate --no-test` failed for drift, not for the 42 committed lint violations that make `bun run check` fail.

Impact:

The release gate and the regular check gate disagree. A release can miss the exact design-system violations that `bun run check` blocks, or contributors can waste time debugging different local/CI behavior.

Recommendation:

Make `validate --no-test` include `check:lint:violations`, or make `release:gate` call `bun run check` before/inside `validate`. The release gate should be a superset of the branch-health gate, not a parallel definition.

### High: package validation can fail with generated drift in `architecture.json`

Evidence:

- `scripts/validate.ts:158` compares `git status --porcelain` before and after the pipeline.
- `bun run validate --no-test` exited 1 with: `validate dirtied the worktree. Commit these regenerated files: M packages/mcp/src/architecture.json`.
- A subsequent `git status --short` was clean, so the failure is either transient, timing-related, or caused by a generated file that was restored after the guard observed it.

Impact:

A nondeterministic release gate is worse than a consistently failing one because it erodes trust in the tooling. If this is real drift, the generated artifact is stale. If it is transient, the drift guard is observing the repo at the wrong point.

Recommendation:

Run `generate-architecture` in the same deterministic generated-file check style as `check:contract`, or move all temporary publish/build swaps before the final status comparison is stable. Add a focused test for `validate --no-test` on a clean worktree.

### High: generated `.d.ts` files accumulate in package `src` directories and make builds noisy

Evidence:

- `.gitignore:53` through `.gitignore:59` explicitly ignores generated `.d.ts` files under `packages/*/src`.
- `find packages/ui/src packages/primitives/src -name '*.d.ts' | wc -l` returned 1300.
- Only one such file is tracked: `packages/ui/src/tour/tour-root.css.d.ts`.
- `bun run validate --no-test` emitted many `svelte-package` warnings of the form "Using $lib/... .d.ts instead of generated .d.ts file".

Impact:

The source tree is polluted with ignored generated types. Because ignored files affect local builds, contributors can get different warnings or type output depending on what they have run before. It also hides real package warnings in a wall of expected noise.

Recommendation:

Clean generated source `.d.ts` files before `svelte-package`, or configure package generation so generated declaration output never lands in source directories. Add a preflight that fails if ignored source declaration files exist before package builds.

## Security And Trust Boundaries

### High: RichTextEditor accepts and emits raw HTML without a sanitizer contract

Evidence:

- `packages/ui/src/rich-text-editor/rich-text-editor-content.svelte:24` assigns `contentEl.innerHTML = html`.
- `packages/ui/src/rich-text-editor/rich-text-editor-root.svelte:69` writes `value = ctx.contentEl.innerHTML`.
- `packages/ui/src/rich-text-editor/rich-text-editor-root.svelte:30` and `packages/ui/src/rich-text-editor/rich-text-editor-root.svelte:156` use `document.execCommand`.
- The primitives implementation mirrors this at `packages/primitives/src/rich-text-editor/rich-text-editor-content.svelte:25` and `packages/primitives/src/rich-text-editor/rich-text-editor-root.svelte:72`.

Impact:

If `value` can ever come from untrusted input, the editor is an XSS sink. Even when the current intended input is trusted, the component API does not make that boundary explicit. `execCommand` is also legacy/deprecated browser surface area, which makes the editor harder to reason about and test.

Recommendation:

Document `value` as trusted-only or add sanitization before assigning `innerHTML`. Prefer a structured document model or a focused editor library if this component is expected to handle untrusted content. Add tests with scriptable HTML, dangerous URLs, and pasted content.

### Medium: MarkdownRenderer exposes an unsafe escape hatch through `sanitize={false}`

Evidence:

- `packages/primitives/src/markdown-renderer/markdown-renderer.svelte:13` defaults `sanitize = true`.
- The renderer then uses `{@html ...}` for headings, paragraphs, and list items at `packages/primitives/src/markdown-renderer/markdown-renderer.svelte:21`, `:29`, and `:43`.
- The UI wrapper does the same at `packages/ui/src/markdown-renderer/markdown-renderer.svelte:19`, `:27`, and `:37`.
- The parser escapes HTML and blocks non-http(s) URLs by default in `packages/primitives/src/markdown-renderer/markdown-parser.ts:19` and `:27`, which is good, but `sanitize={false}` bypasses the core safety mechanism.

Impact:

The safe default is good, but the component surface has a sharp edge. The name `sanitize` reads like a rendering option, while the actual consequence is allowing raw HTML into `{@html}`.

Recommendation:

Rename the opt-out to something explicit like `dangerouslyAllowRawHtml`, or remove it from public UI. Add tests covering `sanitize={false}` so the risk remains intentional.

## SSR, Hydration, And Svelte Correctness

### High: module-global ID counter is not SSR/request safe

Evidence:

- `packages/primitives/src/utils/create-id.ts:1` stores `let counter = 0` at module scope.
- `packages/primitives/src/utils/create-id.ts:3` returns incremented IDs from that shared counter.
- `packages/primitives/src/utils/form-control.svelte.ts:34` exposes this through `generateFormId`.
- `rg` found many consumers across primitives and UI, including dialogs, popovers, comboboxes, date pickers, tooltips, fields, navigation menus, and radio groups.

Impact:

On a long-lived SSR server, module state is shared across requests. IDs can drift between server render and client hydration, breaking `aria-*` relationships and popover/listbox wiring. SvelteKit specifically warns against shared server state for this class of issue.

Recommendation:

Move ID generation to an SSR-safe per-component/per-request mechanism. In Svelte 5, prefer the framework's ID support where possible, or pass IDs through context/props so server and client agree. Add a hydration regression test rendering multiple requests in one process.

### High: theme wizard shared URLs do not seed state before first render

Evidence:

- `apps/docs/src/routes/+layout.ts:1` prerenders the docs tree.
- `apps/docs/src/routes/theme-wizard/+page.svelte:62` applies the `?t=` recipe only inside `afterNavigate`.
- `apps/docs/src/routes/theme-wizard/+page.svelte:72` calls `applyRecipe(decodeRecipe(recipe))` after navigation/hydration.

Impact:

A direct visit to a shared `theme-wizard?t=...` URL renders the default state first and only corrects after the client hydrates. That creates a first-paint mismatch between URL and UI and weakens shareability of theme recipes.

Recommendation:

Decode `t` in page data or another initial state path and seed the wizard before render. Keep `afterNavigate` only for subsequent client-side transitions.

### Medium: visual benchmark route forces its theme after mount

Evidence:

- `apps/docs/src/routes/view/bench/visual/+page.ts:1` prerenders the visual benchmark route.
- `apps/docs/src/lib/benchmarks/VisualBenchmarkScene.svelte:14` mutates `document.documentElement` in `$effect`.
- `apps/docs/src/lib/benchmarks/VisualBenchmarkScene.svelte:21` applies `theme-light` only after mount.

Impact:

Visual benchmark routes should be stable at SSR and first paint. Here the benchmark depends on a client-only effect, so screenshots can capture a pre-effect or transition state depending on timing.

Recommendation:

Apply the benchmark theme in SSR-rendered markup or a route wrapper. Keep benchmark setup deterministic without document mutation after mount.

### Medium: docs hash scrolling can throw on invalid selectors

Evidence:

- `apps/docs/src/routes/+layout.svelte:81` reads `navigation.to?.url.hash`.
- `apps/docs/src/routes/+layout.svelte:84` passes the raw hash to `document.querySelector(hash)`.

Impact:

URL fragments are not guaranteed to be valid CSS selectors. A hash such as `#1` or an escaped/special-character fragment can throw a `DOMException`, breaking navigation logic.

Recommendation:

Use `document.getElementById(decodeURIComponent(hash.slice(1)))` or `CSS.escape` around the fragment ID. Add a navigation test with a numeric/special-character hash.

### Medium: DateField segment timer can move focus after blur or destroy

Evidence:

- `packages/primitives/src/date-field/date-field-segment.svelte:28` stores `bufferTimeout`.
- `packages/primitives/src/date-field/date-field-segment.svelte:101` schedules delayed auto-advance.
- There is no cleanup on blur or destroy.

Impact:

If the user tabs away or the component unmounts inside the 750ms window, the timer can still fire and move focus into the next segment of an inactive or destroyed field.

Recommendation:

Clear `bufferTimeout` on blur and destroy, and guard delayed focus movement behind an active/mounted flag.

### Medium: Drag-and-drop preview clone can duplicate IDs and lacks unmount cleanup

Evidence:

- `packages/primitives/src/drag-and-drop/drag-and-drop-root.svelte:93` deep-clones the dragged element with `cloneNode(true)`.
- The clone is appended to `document.body` at `packages/primitives/src/drag-and-drop/drag-and-drop-root.svelte:114`.
- The clone removes a few top-level ARIA attributes but does not scrub descendant `id` attributes.

Impact:

Deep cloning arbitrary component content can create duplicate IDs in the document during drag. If the component unmounts mid-drag, there is also risk of orphaned preview DOM or scheduled work.

Recommendation:

Render a dedicated preview or scrub all descendant IDs on the clone. Add destroy cleanup that removes the preview and cancels pending animation/frame work.

## Build, Deploy, And Performance

### High: Cloudflare Pages route manifest is over the limit

Evidence:

- `apps/docs/svelte.config.js:15` uses `@sveltejs/adapter-cloudflare`.
- `apps/docs/wrangler.toml:4` points Pages at `.svelte-kit/cloudflare`.
- `apps/docs/src/routes/+layout.ts:1` prerenders the docs tree.
- `bun run validate --no-test` / docs build warned that Cloudflare Pages Functions' includes/excludes exceed `_routes.json` limits and dropped hundreds of exclude rules.

Impact:

Static docs assets will be routed through the function path unnecessarily. That can add latency and cost, and it makes deployment behavior less predictable.

Recommendation:

If the docs site is intended to be fully prerendered, consider `adapter-static`. If Cloudflare functions are required, reduce the prerendered route manifest or configure routing so the `_routes.json` file stays under Cloudflare Pages limits.

### High: docs component/search surfaces import the generated spec directly

Evidence:

- `apps/docs/src/routes/components/[slug]/+page.server.ts:5` imports `packages/mcp/src/spec.json`.
- `apps/docs/src/lib/search.ts:1` imports the same generated spec.
- Docs build output showed large chunks, including generated spec/composition-related chunks and large client/server bundles.

Impact:

The docs app is carrying a very large generated catalog. Importing all spec data into search/client-adjacent surfaces risks shipping more data than each page needs and makes the docs build heavier as the component count grows.

Recommendation:

Generate smaller docs-specific manifests: one for route params/page metadata, one for search, and one for component-detail server data. Keep full MCP spec out of client-reachable modules unless the whole dataset is truly needed.

### Medium: several modules are beyond easy review size

Largest tracked TS/Svelte/JS/CSS/MD files include:

- `packages/mcp/src/composition-data.ts`: 6656 lines.
- `packages/theme-wizard/src/engine/derivation.ts`: 2350 lines.
- `packages/ui/src/diagram/layout.ts`: 1996 lines.
- `packages/mcp/src/generate-spec.ts`: 1992 lines.
- `apps/docs/src/routes/+page.svelte`: 1502 lines.
- `packages/feedback/src/feedback.svelte`: 1433 lines.
- `packages/lint/src/rules.ts`: 1347 lines.
- `packages/cli/src/commands/setup.ts`: 1224 lines.

Impact:

Large files are not automatically wrong, but these files own multiple responsibilities and are hard to review under the "can be understood quickly by readers" standard. They concentrate risk and make future changes more expensive.

Recommendation:

Do not refactor all of these at once. For each touched area, extract around real seams: pure calculations, IO adapters, generated-data loaders, route view components, and command formatting. Add tests around the extracted unit before moving behavior.

## Tooling, MCP, And Design-System Governance

### High: DryUI MCP/checker is stale or incompatible with the current branch

Evidence:

- DryUI MCP `check` reported unknown components such as `BorderBeam`, `ThemeToggle`, and `TokenScope`, even though this branch's local spec/tests accept current components.
- The checker also reported many invalid props that are legal Svelte CSS custom-property component attributes, such as `--dry-drawer-size` and `--dry-sidebar-radius`.
- `packages/mcp/src/reviewer.ts:145` and `packages/mcp/src/reviewer.ts:154` parse prop names with identifier regexes that do not understand names beginning with `--`.
- `packages/mcp/src/reviewer.ts:236` only allows native props, `aria-*`, `data-*`, `on*`, and `bind:*`.
- Svelte's own docs show child-component styling via custom properties such as `<Child --color="red" />`.

Impact:

The recommended checker produces enough false positives that contributors will learn to ignore it. That hides real invalid-prop, accessibility, and composition issues.

Recommendation:

Teach the reviewer to parse and allow Svelte CSS custom-property component attributes. Add tests for `<Drawer.Content --dry-drawer-size="...">` and similar patterns. Ensure the installed plugin/MCP used by agents is generated from the same spec as the branch being reviewed.

### High: theme checker rejects or warns on valid theme tokens

Evidence:

- `packages/mcp/src/theme-checker.ts:807` hard-codes semantic-token prefixes to `color|space|radius|duration|shadow|text|font`.
- `packages/mcp/src/theme-tokens.generated.json:57` contains legitimate tokens like `--dry-image-edge`.
- The generated token file also includes families such as `--dry-toggle-*` and `--dry-beam-*`, which are not covered by the hard-coded allowlist.
- A local diagnosis of `packages/ui/src/themes/default.css` reported 7 errors and 132 warnings, including the nested-radius values at `packages/ui/src/themes/default.css:261`.

Impact:

The checker cannot distinguish valid semantic tokens from unknown component tokens. It also appears to misclassify some valid `max(..., calc(...))` radius values. This creates noise and weakens confidence in theme audits.

Recommendation:

Drive semantic-token recognition from `theme-tokens.ts` or `theme-tokens.generated.json`, not a partial regex. Add regression tests for every first-class token family and for calculated length/radius expressions.

### Medium: workspace audit skips important theme files that contain no `--dry-` overrides

Evidence:

- `packages/mcp/src/workspace-audit.ts:489` only runs CSS theme findings when `file.endsWith('.css') && content.includes('--dry-')`.
- The theme checker itself has cases for full-theme files, `*.theme.css`, and `/* @dryui-theme */` directives.

Impact:

A theme file that imports a theme, declares `color-scheme`, or is marked as a DryUI theme but does not yet include `--dry-*` declarations can be skipped entirely. That misses dark-scheme and missing-token diagnostics.

Recommendation:

Route CSS files into theme analysis based on file name/directive/project context, then let `diagnoseTheme()` decide whether there are findings.

### Medium: callback-style props are not validated by the MCP reviewer

Evidence:

- `packages/mcp/src/reviewer.ts:240` allows any prop starting with `on`.

Impact:

Typos such as `oncomplet`, `onActivatee`, or unsupported callback-style props pass through even when the component spec has a finite set of supported callbacks.

Recommendation:

Whitelist DOM event attributes separately from component callback props. For DryUI component tags, compare `on*` props against the component spec before allowing them.

### Medium: curated docs-nav and skill lists can drift from generated spec

Evidence:

- `packages/mcp/src/component-catalog.ts:33` defines `docsNavCategories`.
- `packages/mcp/src/component-catalog.ts:232` defines `skillCompoundComponents`.
- The comments say these lists are curated and cross-checked, but the current spec includes components that are absent from the curated surfaces.

Impact:

Components can exist in the generated spec while missing from docs IA or skill curation. That makes discovery inconsistent for users and agents.

Recommendation:

Generate coverage reports that list spec components missing from docs nav and skill lists, and decide explicitly whether each omission is intentional. If intentionally curated, encode the reason in metadata.

## Component And UI Findings

### Medium: Select trigger passes popover attributes through Button without matching Button's accepted surface

Evidence:

- `packages/ui/src/select/select-trigger-button.svelte:18` wraps a `Button`.
- `packages/ui/src/select/select-trigger-button.svelte:23` passes `popovertarget={ctx.contentId}`.

Impact:

This pattern also appears in related popover-backed triggers. The checker flags it as an invalid `Button` prop, so either the checker/spec is wrong or the component surface is type-inconsistent.

Recommendation:

Decide whether `Button` supports native popover attributes. If yes, widen Button's native attribute contract/spec. If no, use native `<button>` for these trigger wrappers.

### Medium: Heading hardcodes negative letter spacing

Evidence:

- `packages/ui/src/heading/heading.svelte:67` sets `letter-spacing: -0.03em`.

Impact:

Repo guidance says letter spacing should be zero unless a clear existing tokenized pattern requires otherwise. This hardcoded value leaks into every Heading consumer and conflicts with the design-system rule.

Recommendation:

Remove the negative tracking or move any optical adjustment into a documented token with tests/examples.

### Medium: Button has unused CSS selectors under Svelte check

Evidence:

- `bun run check` reported two Svelte warnings for unused selectors.
- The selectors are at `packages/ui/src/button/button.svelte:230` and `packages/ui/src/button/button.svelte:234`.

Impact:

The comments explain why these selectors exist, but Svelte still warns. Warning debt makes it harder to spot new Svelte warnings.

Recommendation:

Restructure the markup/style so Svelte can see the selectors, or add a narrowly scoped, documented suppression if this selector pattern is intentionally impossible for Svelte to statically prove.

### Medium: raw heading/image and raised-border violations show design-rule drift in core UI

Evidence:

- The 42 `check:lint:violations` failures include raw headings, raw images, symmetric exit animations, ad-hoc entrance keyframes, and raised surfaces with solid borders.

Impact:

These are exactly the rules DryUI tells downstream users and agents to follow. Violating them in core components weakens the design-system contract.

Recommendation:

Treat the failures as a component-polish debt epic. Fix the canonical components first, then decide whether the remaining violations should be rule exceptions.

## CLI Findings

### High: init runs install commands through a shell

Evidence:

- `packages/cli/src/commands/init.ts:108` accepts a command string.
- `packages/cli/src/commands/init.ts:109` calls `spawnSync(command, { shell: true })`.
- The command can be rewritten with dev-tarball paths.

Impact:

Paths with spaces can break installs, and shell metacharacters in substituted paths become an injection surface. Even if current inputs are mostly internal, the code path is avoidably fragile.

Recommendation:

Represent install steps as argv arrays and run them with `shell: false`. If a shell is absolutely necessary, quote every substituted path with a tested shell-quote function.

### Medium: `dryui init` help and flag parsing are too permissive

Evidence:

- `packages/cli/src/commands/init.ts:352` only checks `args[0] === '--help'`.
- `parseInitArgs` silently tolerates unknown flag shapes.

Impact:

`dryui init -h` or `dryui init myapp --help` can enter scaffold behavior instead of printing help. Unknown flags can be ignored in ways that surprise users or scripts.

Recommendation:

Use the same flag helper behavior as other CLI commands. Treat `--help` and `-h` anywhere as help, reject unknown flags, and validate missing `--pm` values.

### Medium: Claude hook detection can false-positive on substring matches

Evidence:

- `packages/cli/src/commands/install-hook.ts:79` treats any command containing `dryui ambient` as already wired.

Impact:

Commands like `echo dryui ambient` or wrapper commands that mention the text but do not run the canonical hook can cause the installer to skip writing the real hook.

Recommendation:

Parse command tokens or compare against the exact supported command forms. Add negative tests for non-executing substrings.

### Low: editor-server config idempotence depends on JSON property order

Evidence:

- `packages/cli/src/commands/setup-installers.ts:219` and `:220` compare existing and desired server config using `JSON.stringify`.

Impact:

Semantically identical configs with different key order can be rewritten, making "unchanged" less reliable for hand-edited files.

Recommendation:

Canonicalize objects before comparing or use a semantic deep-equality helper.

## Feedback Package Findings

### High: feedback widget uses inconsistent page identity for submissions and drawings

Evidence:

- `packages/feedback/src/feedback.svelte:831` submits `url: location.href`.
- `packages/feedback/src/feedback.svelte:874` defines `pageUrl()` as `location.pathname`.
- `packages/feedback/src/feedback.svelte:951` loads drawings by `pageUrl()`.
- `packages/feedback/src/feedback.svelte:973` saves drawings by `pageUrl()`.

Impact:

Submissions and drawing persistence use different keys. Query parameters like `dryui-feedback=1` can leak into submitted URLs, while drawings are keyed only by pathname. In a mounted layout, client-side navigation can also leave the load/save effects using stale page identity.

Recommendation:

Derive one canonical page key from reactive route state, strip transient feedback params, and use it for both submissions and drawings. Add a navigation/query-string regression test.

## Docs Findings

### Medium: docs lint warnings are not consistently enforced

Evidence:

- `apps/docs/svelte.config.js:9` wires `dryuiLint({ strict: true })`.
- `apps/docs/svelte.config.js:11` excludes several paths.
- Docs checks passed, but the build/check output still prints DryUI lint/preprocessor warnings in demos and docs surfaces.

Impact:

The docs site is the canonical demonstration surface. If warnings are allowed to accumulate there, examples can drift away from the style rules users are expected to follow.

Recommendation:

Decide whether docs demos are strict examples or intentionally looser showcases. If strict, make warnings fail in CI. If looser, add local `dryui-allow` comments with rationale so warnings do not drown out new issues.

### Low: docs sample includes `console.log`

Evidence:

- `apps/docs/src/routes/getting-started/+page.svelte:68` contains a sample `onclick={() => console.log('clicked')}`.
- The DryUI design rules include "No `console.log` left in production code".

Impact:

This is likely just example code, but docs examples are copied by users and agents. It conflicts with the rule text.

Recommendation:

Use a benign state update or no-op callback in the snippet instead of `console.log`.

## Testing Gaps

The unit suite is healthy, but several high-risk behaviors above are not covered by tests that would fail today:

- Foreign-origin feedback server requests should be rejected.
- `/dispatch` should require auth.
- SSR/hydration ID stability should be tested across multiple server renders in one process.
- Theme wizard `?t=` should render the recipe state on first paint.
- Visual benchmark route should be stable before client effects run.
- `validate --no-test` should either pass cleanly or fail deterministically for committed generated drift.
- The MCP reviewer should accept Svelte CSS custom-property component attributes and reject unsupported callback typos.
- RichTextEditor should test unsafe HTML inputs, pasted content, and link URLs.
- DateField delayed focus should be cancelled on blur/unmount.
- Drag-and-drop previews should not duplicate IDs and should clean up on destroy.

## Recommended Remediation Order

1. Secure `@dryui/feedback-server` first: origin/auth checks and `/dispatch` protection.
2. Make branch health deterministic: fix the 42 lint violations, add `check:lint:violations` to `validate`, and resolve the `architecture.json` drift failure.
3. Fix SSR/first-paint issues: global ID counter, theme-wizard URL seeding, visual benchmark theming, and docs hash selector handling.
4. Reduce tooling noise: generated `.d.ts` cleanup, theme-checker token registry, reviewer custom-property parsing, and stale MCP/plugin spec alignment.
5. Address component/runtime debts: RichTextEditor sanitization contract, DateField timer cleanup, DragAndDrop preview cleanup, Heading typography, Button selector warnings.
6. Improve docs/deploy performance: Cloudflare route manifest, smaller docs spec manifests, and docs lint consistency.
7. Split only the large modules that are touched by active work, with tests around each extraction.

## Non-Findings And Context

- There are no open GitHub issues or PRs at the time of this review.
- `bun run test:unit` is green.
- No tracked package `dist` directories were found in the review scans.
- The Markdown parser's default `sanitize=true` path escapes HTML and restricts URL protocols; the concern is the public opt-out plus `{@html}`, not the default path.
- Many DryUI MCP `check` results from the installed tool look stale against this branch, so the review does not treat every MCP issue as a product bug.
