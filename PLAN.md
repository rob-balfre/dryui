# DryUI MCP Tool Collapse

Status: draft v3 (two review passes applied)
Owner: Rob
Source signals: `review.md` (Hammerfall DryUI rebuild), flight-form incident (LLM reached for `<Input value="Apr 16, 2026" />` instead of `DatePicker`)

## Motivation

DryUI's MCP server registers 11 runtime tools at `packages/mcp/src/index.ts:135–540` and 7 prompts at `index.ts:581–757` (full enumeration in the Current canonical surface tables below). Three failure modes confirmed:

1. **LLMs don't discover the surface.** In the flight-form incident the LLM never called `compose`, `info`, or any anti-pattern lookup — it wrote raw `<Input value="Apr 16, 2026" />` with a date-shaped string. Anti-pattern metadata for `<Input type="date">` already exists at `packages/mcp/src/composition-data.ts:11–15`. The data didn't help because the tool was never invoked. Surface too wide to find.

2. **Surface drift between registration and metadata.** `packages/mcp/src/ai-surface.ts:12` advertises a `get` MCP tool that does not exist in `index.ts` registrations. It does exist as a CLI command. `ai-surface.ts` also advertises 8 prompts while only 7 are actually registered. Spec/contract/llms generation reads from `ai-surface.ts`, so downstream artifacts carry phantom surface.

3. **Consumer experience confirms the problem (`review.md` §4–§5).**
   - **§5**: `doctor` and `diagnose` both surface the same `--dry-color-text-*` contrast warnings to the user. They do not share an implementation path — `doctor`/`lint` call `scanWorkspace()` in `packages/mcp/src/workspace-audit.ts` (which delegates to `reviewComponent()` + `diagnoseTheme()`), while `diagnose` calls `diagnoseTheme()` directly. The duplication is at the *consumer surface*, not in shared code.
   - **§4**: `dryui lint` (CLI) passes while the `dryuiLint()` preprocessor fails on the same file. Three independent engines: `reviewer.ts` (regex-based spec checks), `theme-checker.ts` (CSS variable checks), `@dryui/lint/rules.ts` (Svelte AST preprocessor). No shared rule metadata — messages, severities, and IDs drift.
   - **§reviewer-named tools**: the reviewer only exercised `detect`, `lint`, `doctor`, `diagnose` across a 23-import-site migration. `info`, `get`, `list`, `compose`, `plan_install`, `plan_add`, `review`, `tokens` never appeared in their workflow. Dead surface from the consumer's perspective.

## Current canonical surface (ground truth)

Reconciling what's actually registered vs. advertised:

| Tool | Registered in `index.ts` | Advertised in `ai-surface.ts` | Disposition |
|---|---|---|---|
| `review` | ✓ | ✓ | retire → `check` |
| `diagnose` | ✓ | ✓ | retire → `check <theme.css>` |
| `detect_project` | ✓ | ✓ | retire → `ask --scope setup` |
| `plan_install` | ✓ | ✓ | retire → `ask --scope setup` |
| `plan_add` | ✓ | ✓ | retire → `ask --scope component` (bundled into component response) |
| `doctor` | ✓ | ✓ | retire → `check` |
| `lint` | ✓ | ✓ | retire → `check` |
| `info` | ✓ | ✓ | retire → `ask --scope component` |
| `list` | ✓ | ✓ | retire → `ask --scope list` |
| `tokens` | ✓ | ✗ (missing from metadata!) | retire → `ask --scope list` (kind: token) |
| `compose` | ✓ | ✓ | retire → `ask --scope recipe` |
| `get` | ✗ (phantom!) | ✓ | delete from metadata (CLI-only) |

| Prompt | Registered | Advertised | Disposition |
|---|---|---|---|
| `dryui-compose` | ✓ | ✓ | retire → `dryui-ask` |
| `dryui-info` | ✓ | ✓ | retire → `dryui-ask` |
| `dryui-list` | ✓ | ✓ | retire → `dryui-ask` |
| `dryui-review` | ✓ | ✓ | retire → `dryui-check` |
| `dryui-install` | ✓ | ✓ | retire → `dryui-ask` |
| `dryui-add` | ✓ | ✓ | retire → `dryui-ask` |
| `dryui-diagnose` | ✓ | ✓ | retire → `dryui-check` |
| `dryui-get` | ✗ (phantom!) | ✓ | delete from metadata |

## Decisions (answers to open questions from review)

1. **`plan_add` survives as bundled data, not a separate scope.** `ask --scope component "Button"` returns `{ info, antiPatterns, installPlan? }`. The `installPlan` field is populated when `detectProject()` signals the component isn't already adopted. This preserves adoption planning without adding a fifth scope.

2. **MCP prompts collapse with the tools.** Retire all 7 registered prompts and delete the phantom `dryui-get` entry from metadata. Add 2 new ones: `dryui-ask` and `dryui-check`. No compat shims — matches the e1ee5799 "pre-alpha, no migration shim" precedent.

3. **`tokens` folds into `ask --scope list`.** Response rows are tagged `kind: 'component' | 'token'`. Optional filter: `ask --scope list --kind token`. No separate `tokens` scope.

4. **`get` is a phantom.** It's a CLI command, never was an MCP tool. Remove from `ai-surface.ts` and any docs that advertise it as an MCP tool. CLI retains `dryui get`.

5. **Changeset bumps:**
   - `@dryui/mcp`: **major**. 11 tools → 2, 7 prompts → 2. Real breaking change.
   - `@dryui/plugin`: **minor**. `plugin.json` doesn't encode the tool set (verified: no allowlist field). The plugin's MCP surface is inherited from `@dryui/mcp` via `.mcp.json`. Nothing structural breaks at the plugin package boundary — minor bump reflects the coincident MCP surface shift.
   - `@dryui/lint`: **minor**. New `./rule-catalog` export, no behavior change.
   - `@dryui/cli`: **patch**. Internal rule-catalog import; reviewer/theme-checker already call CLI-local helpers.

## Goals

- Collapse runtime MCP surface from 11 tools + 7 prompts to **2 tools + 2 prompts**: `ask`, `check`, `dryui-ask`, `dryui-check`.
- Reconcile `ai-surface.ts` and every downstream generated artifact with the actual runtime registrations.
- Share rule metadata across three engines (Option D): `reviewer.ts`, `theme-checker.ts`, `@dryui/lint/rules.ts` all import from a single source.
- Improve LLM discoverability so anti-pattern metadata actually gets reached.
- Preserve every AXI compliance win from commit `e1ee5799` (P1–P10).

## Non-goals

- Touching `@dryui/lint` preprocessor engine or AST check logic. Preprocessor is the load-bearing build-time gate; zero code changes, metadata imports only.
- Implementing autofixers. `check` reports `autoFixable: true` and `suggestedFix` text as metadata, no apply step. Matches `tsc` — diagnostics, not mutations.
- Changing the CLI surface. `dryui lint`, `dryui doctor`, `dryui compose`, `dryui tokens`, `dryui get`, etc. all stay. Humans keep targeted commands.
- Fixing the CLI `doctor`/`diagnose` duplication or the WCAG heuristic bug from review.md §5 (orthogonal — separate follow-up).
- Adding new rules or recipes. Pure refactor.

## Target surface

### `ask`

```ts
ask({
  query: string,
  scope: 'component' | 'recipe' | 'list' | 'setup'
})
```

Explicit scope dispatch. No query-shape heuristics.

| scope | behavior | internal helpers | response `kind` |
|---|---|---|---|
| `component` | lookup by name → info + anti-patterns + (if project detected and not already adopted) adoption plan | `getComponentInfo` + `composition-data` + `planAddFor(query)` | `component` |
| `recipe` | search composition recipes by query. Filters to recipes only, excludes component matches | `composeSearch` (includes `antiPatterns`) | `recipe` |
| `list` | enumerate components and tokens. Each row tagged `kind: 'component' \| 'token'` | `listComponents` + `getTokens` | `list` |
| `setup` | detect project state + inline install plan for DryUI bootstrap | `detectProject` + `planInstall` | `setup-plan` |

Response shape (TOON): `kind`, `matches[N]{...}`, `next[]` always steering at `check`.

### `check`

```ts
check({ path?: string })
```

One optional positional path. No flags. Behavior auto-detected:
- no path → workspace scan (replaces `doctor` + `lint`)
- `.svelte` path → `reviewComponent()` on that file (replaces `review`)
- `.css` path → `diagnoseTheme()` on that file (replaces `diagnose`)
- directory path → workspace scan scoped to dir

Merges results into unified `CheckReport`:

- `issues[]{ file, line, rule, severity, message, suggestedFix? }`
- Aggregates: `hasBlockers`, `autoFixable`, `severityCounts`, `coverage`
- Empty state: `issues[0]: clean`
- `next[]`: steers back at `ask` for fixes (`ask --scope component "DatePicker"` etc.)

## Phases

### Phase 0 — Reconcile canonical surface (prereq)

Ground-truth cleanup before any refactor starts. This is the other agent's top suggestion — fix the map before moving the territory.

Files:
- Modify `packages/mcp/src/ai-surface.ts`: delete phantom `get` tool entry (line 15), add missing `tokens` tool entry, reconcile prompts list with actual registrations. This is still the *old* surface — we're just making the manifest true.
- Run `bun run --filter '@dryui/mcp' build` → regenerates `spec.json`, `contract.v1.json`, `contract.v1.schema.json`, `llms.txt`, `llms-components.txt`, `architecture.json`.
- Verify generated artifacts now match runtime.
- Grep for surviving references to `get` as an MCP tool (not CLI) across docs and skill files. Delete any that advertise it.

Gate: `bun run validate` passes, and `diff` between `spec.json` before/after Phase 0 shows only surface reconciliation (adds `tokens`, removes `get`, aligns prompts), no unrelated drift.

### Phase 1 — Rule catalog (Option D)

Shared rule metadata across engines. Zero preprocessor behavior change.

Prereqs (blocking — complete before any file edit):

1. **Verify no circular dependency.** Run `rg '@dryui/mcp' packages/lint/src/` — any hit means `@dryui/lint` already references `@dryui/mcp`, and adding the reverse dep creates a cycle. Fallbacks if a cycle exists: (a) extract the catalog to a new leaf package `@dryui/rules` that both depend on, or (b) copy the catalog into `@dryui/mcp` directly and have `@dryui/lint` import from `@dryui/mcp/rule-catalog` instead.
2. **Inventory every active rule ID across three engines.** Read `packages/lint/src/rules.ts`, `packages/mcp/src/reviewer.ts`, `packages/mcp/src/theme-checker.ts` and enumerate every rule ID currently emitted. The catalog must cover all of them — anything missing produces silent drift. Confirmed from `rules.ts`: `dryui/no-layout-component`, `dryui/no-inline-style`, `dryui/no-style-directive`, `dryui/no-flex`, `dryui/no-component-class`, `dryui/no-css-ignore`, `dryui/no-svelte-element`, `dryui/no-width`, `dryui/no-all-unset`, `dryui/no-global`, `dryui/no-media-sizing`, `dryui/prefer-focus-ring-token`, `dryui/no-raw-native-element` (per-tag variants for button/dialog/hr/input/select/table/textarea), `dryui/no-anchor-without-href`. `reviewer.ts` rule IDs (e.g. `bare-compound`, `orphaned-part`, `missing-accessible-label`, `hardcoded-color`) and `theme-checker.ts` theme rule IDs (missing token, contrast warning, value error) must be discovered and recorded during inventory before catalog construction.

Files:
- New: `packages/lint/src/rule-catalog.ts` — const object keyed by rule ID from the prereq inventory. Schema: `{ id, message, severity: 'error' | 'warn' | 'info', suggestedFix?: string, docsUrl?: string }`.
- Modify: `packages/lint/src/rules.ts` — import catalog, replace inline string literals with `CATALOG['dryui/no-width'].message`. AST check logic unchanged. Same approach for message construction in `createNativeElementMessage`.
- Modify: `packages/lint/package.json` — add `./rule-catalog` export pointing at `dist/rule-catalog.js` + types.
- Modify: `packages/mcp/package.json` — add `"@dryui/lint": "workspace:*"` dependency (only if prereq 1 passes; otherwise take the fallback path).
- Modify: `packages/mcp/src/reviewer.ts` + `packages/mcp/src/theme-checker.ts` — import from `@dryui/lint/rule-catalog`. Emit findings with matching IDs/messages.
- New: `packages/lint/src/rule-catalog.test.ts` — schema validation (all entries have `message` + `severity`), no duplicate IDs, **golden file snapshot** of every serialized message so downstream drift is visible in diffs.
- Update `packages/cli/src/run.ts` or any other internal module if catalog IDs were referenced as string literals.

Gate: `bun run validate` passes AND the golden snapshot test passes byte-for-byte against pre-refactor messages. If a preprocessor error message changes even by whitespace, the refactor is wrong.

Downstream risk: preprocessor ships to consumer projects (Hammerfall etc.) that don't run our tests. The snapshot test protects against wording drift at the source.

### Phase 2 — Build `ask` + `check` tools (without retiring old ones)

Files:
- New: `packages/mcp/src/tools/check.ts` — implements `check({ path? })`. Auto-detect dispatch on path. Wraps existing `reviewComponent()`, `diagnoseTheme()`, `scanWorkspace()`. Merges `CheckReport` with TOON output.
- New: `packages/mcp/src/tools/check.test.ts` — path dispatch (no path, .svelte, .css, dir), TOON output, AXI checklist (empty states, aggregates, truncation, structured errors), `next[]` presence.
- New: `packages/mcp/src/tools/ask.ts` — implements `ask({ query, scope })`. Dispatch table on scope. Throws `toonError` with suggestion on unknown scope. `component` scope bundles optional `installPlan`.
- New: `packages/mcp/src/tools/ask.test.ts` — one test per scope, TOON output, AXI checklist, anti-pattern surfacing (verify `ask --scope component "Input"` returns the `<Input type="date">` anti-pattern), adoption plan bundling for `component` scope when project state demands it.
- Modify: `packages/mcp/src/index.ts` — register `ask` and `check` **alongside** existing tools. Old tools still work. This lets us run both surfaces in parallel for validation before the cutover.

Gate: new tests pass, existing tests still pass.

### Phase 3 — Tool + prompt cutover

Files:
- Modify: `packages/mcp/src/index.ts` — delete old tool registrations (11) and old prompt registrations (7). Add new prompts `dryui-ask` and `dryui-check` invoking `ask`/`check`.
- Modify: `packages/mcp/src/ai-surface.ts` — replace tools + prompts with `ask`, `check`, `dryui-ask`, `dryui-check`. Leave `cliCommands` untouched (CLI unchanged).
- Keep internal helpers (`getComponentInfo`, `composeSearch`, `reviewComponent`, `diagnoseTheme`, `scanWorkspace`, `project-planner.ts`, `tokens.ts`) as modules — still called by CLI and by `ask`/`check`.
- Run `bun run --filter '@dryui/mcp' build` → regenerates all artifacts against new surface:
  - `spec.json`
  - `contract.v1.json`
  - `contract.v1.schema.json`
  - `llms.txt`
  - `llms-components.txt`
  - `architecture.json`
- Run `check:contract` to confirm the contract regenerates cleanly.

### Phase 4 — Docs, skills, prompts, session-start

All the surface-area updates that live outside `@dryui/mcp` proper.

Files to modify (verified via grep sweep — see Pre-Phase-4 gate below):
- `packages/ui/skills/dryui/SKILL.md` — rewrite MCP tools section from 11-tool menu to 2-tool flow: `ask` before writing, `check` after writing. Include 1–2 example calls per scope.
- `.claude/skills/dryui/SKILL.md` — same rewrite.
- `CLAUDE.md` — update "MCP Server" section (lines covering DryUI MCP tools list) and any tool-name references.
- `apps/docs/src/lib/ai-setup.ts` — update install snippets / tool descriptions rendered on getting-started.
- `apps/docs/static/get-started.txt:211` — regenerated artifact; confirm it's source-of-truth-fed from `ai-surface.ts` and re-runs via `bun run --filter '@dryui/mcp' generate-llms` (or similar). If static, update directly.
- `apps/docs/src/routes/getting-started/+page.svelte:171` — may reference old tool names.
- `apps/docs/src/routes/tools/+page.svelte:19` — likely a dedicated tools listing page.
- `apps/docs/src/lib/home-intro.svelte.ts:1` — home page intro copy.
- `packages/cli/src/commands/ambient.ts` — if `toonProjectDetection()` output includes `next[]` hints with old tool names, update. Verified the hook script itself (`packages/plugin/hooks/session-start.sh`) just calls `dryui ambient`, so all text lives in `ambient.ts` / `toon.ts`.
- `packages/mcp/src/toon.ts` — search for hardcoded `next[]` hints referencing retired tool names; update to `ask`/`check`.
- `RELEASING.md` — search for MCP tool name references.

NOT updated (verified): `packages/plugin/.claude-plugin/plugin.json` — no tool allowlist field, only `skills`, `mcpServers`, `hooks`. Inherits surface from `.mcp.json` → `@dryui/mcp`.

**Pre-Phase-4 gate**: run narrow greps before touching any file. Illustrative patterns — tighten the regexes during execution to avoid false positives on common English words like "get" or "list":

- `rg 'mcp__dryui__' apps packages .claude` — exact MCP tool prefix in docs/skills/code
- `rg "server\.(tool|registerPrompt)" packages/mcp/src` — confirm runtime registrations match the new surface
- `rg "'dryui-(compose|info|list|review|install|add|diagnose|get)'" apps packages .claude` — old prompt names as string literals
- `rg '(detect_project|plan_install|plan_add)' apps packages .claude CLAUDE.md` — underscored tool names (low false-positive rate)
- `rg '\b(compose|info|review|diagnose|doctor|lint|tokens)\b' packages/ui/skills/dryui .claude/skills/dryui CLAUDE.md RELEASING.md` — skill/docs text advertising retired tools (high false-positive rate; review each hit)

Every hit that advertises old MCP surface (not CLI) gets updated. Document any hit we choose to leave (e.g., CHANGELOG entries referencing historical tool names).

### Phase 5 — Changesets

- `@dryui/mcp`: major. Body includes migration table:
  ```
  info <Name>         → ask --scope component "<Name>"
  get <query>         (CLI only, unchanged; was never an MCP tool)
  list                → ask --scope list ""
  compose "<query>"   → ask --scope recipe "<query>"
  tokens              → ask --scope list --kind token
  detect_project      → ask --scope setup ""
  plan_install        → ask --scope setup ""
  plan_add <Name>     → ask --scope component "<Name>" (installPlan bundled)
  review file.svelte  → check file.svelte
  diagnose theme.css  → check theme.css
  doctor              → check
  lint                → check
  ```
- `@dryui/plugin`: minor. Body: "MCP surface shift: inherits new `ask`/`check` tools from `@dryui/mcp`. No `plugin.json` schema change."
- `@dryui/lint`: minor. Body: "Export `./rule-catalog` for cross-engine rule metadata consistency."
- `@dryui/cli`: patch. Body: "Internal rule-catalog import via `@dryui/lint`; no CLI surface change."

### Phase 6 — Smoke test

Manual verification the LLM flow actually works post-collapse.

- Fresh Claude Code session with updated `dryui` skill loaded
- Prompt: "Build a flight search form with From, To, Depart date, and a time picker for leaving-around"
- Expected: LLM calls `ask --scope recipe "flight search"` or `ask --scope component "DatePicker"` before writing. Reaches `DatePicker` + `TimePicker` components. Does NOT write `<Input value="Apr 16, 2026" />`.
- If the LLM still reaches for raw `Input` with a date string, the skill update is insufficient and Phase 4 needs another pass.

Tick-box gate, not automated.

## AXI preservation checklist

Both `ask` and `check` must pass per-tool:

- [ ] P1 TOON by default, `--text` / `--json` fallbacks
- [ ] P2 3–4 field minimal row schemas
- [ ] P3 240-char field truncation with `--full` escape
- [ ] P4 Pre-computed aggregates (`matches[N]`, `hasBlockers`, `autoFixable`, `severityCounts`, `coverage`)
- [ ] P5 Definitive empty states (`issues[0]: clean`, `matches[0]: none`)
- [ ] P6 `toonError` for structured errors with `suggestions[]` (e.g. unknown scope → suggest valid scopes)
- [ ] P9 `next[]` contextual hints steering into the other tool
- [ ] P10 `--help` per tool and per scope

P7 (ambient SessionStart hook via `dryui ambient`) and P8 (content-first no-arg banner) inherit from CLI wiring. Verify hook output still makes sense after Phase 4 text updates.

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Rule catalog refactor silently alters preprocessor messages → downstream consumer drift | Medium | Golden snapshot test in Phase 1; `bun run validate` gate |
| Generated artifacts (spec/contract/llms) drift from runtime after phased PRs | Medium | Phase 0 regenerates before any change; Phase 3 regenerates after cutover; both verified against `check:contract` |
| Migration table in changeset incomplete → external consumers hit tool-not-found | Low | Explicit mapping for every one of 11 retired tools + phantom `get` clarification |
| Skill rewrite still doesn't route LLMs to pickers for date/time fields | Medium | Phase 6 smoke test; if failing, iterate on skill wording before merge |
| Pre-Phase-4 grep misses a reference | Low | Explicit ripgrep sweep across `apps`, `packages`, `.claude`, root docs |
| `@dryui/lint` → `@dryui/mcp` circular dep | Low | Verified in Phase 1 prereq 1 before any dep edit; fallback paths (new `@dryui/rules` leaf package or reversed dep direction) documented in Phase 1 |

## Open questions

None remaining — all five questions from the reviewer's pass have explicit answers in the Decisions section above.

## Rollout order (stacked PRs)

1. **PR1 — Phase 0** (surface reconciliation). Low-risk cleanup, ships independently, makes downstream artifacts truthful. Review.md §5 wording alignment delivered partially.
2. **PR2 — Phase 1** (rule catalog). Metadata-only refactor, protected by golden snapshot. Delivers full review.md §4 wording alignment.
3. **PR3 — Phases 2+3** (build + cutover). The actual collapse. Internal helpers unchanged so blast radius is bounded.
4. **PR4 — Phase 4** (docs/skills/prompts/session-start). Surface-area sweep.
5. **PR5 — Phase 5+6** (changesets + smoke test). Ships the user-visible breaking change with migration guide.

Splitting PR3 out lets us revert the cutover independently if something leaks past tests — the rule catalog (PR2) still delivers real value on its own.
