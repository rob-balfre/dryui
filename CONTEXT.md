# CONTEXT

Domain glossary for the DryUI monorepo. Used by `/improve-codebase-architecture`, `/grill-with-docs`, and any agent reasoning about the codebase.

## Surfaces

**Skill** — the primary entry point a human-led, agent-assisted DryUI workflow runs from. Sources live under top-level [`skills/`](./skills/). Installed into editors via `npx skills add rob-balfre/dryui`. ADR-0001 makes skills the canonical product surface. All component knowledge (APIs, recipes, accessibility, theming) lives here.

**Consumer packages**: three runtime/dev artifacts a DryUI app pulls in. `@dryui/ui` (styled Svelte 5 components), `@dryui/lint` (build-time CSS discipline via Svelte preprocessor and Vite plugin), `@dryui/feedback` (optional in-app annotation widget).

**Feedback server (`@dryui/feedback-server`)**: the local dashboard and MCP backend, exposed through the `dryui-feedback` bin (`bunx dryui-feedback`). Owns submission storage, dispatch, and the dashboard UI.

**Lint surface** — a build-time enforcement point exposed by `@dryui/lint`. Two surfaces today: `dryuiLint()` (Svelte preprocessor) for component rules; `dryuiLayoutCss()` (Vite plugin) for `src/layout.css`.

## Feedback domain

**Session** — a feedback-capture window opened by a human in the dashboard. Carries a URL, a status (active / approved / closed), and a list of annotations.

**Annotation** — a single comment attached to one DOM element on a session URL. Carries an intent (fix / change / question / approve), a severity, a status, and an optional thread of human/agent messages.

**Submission** — a screenshot + drawings + click hints captured by the feedback widget, addressed to one **dispatch agent**. Distinct from an annotation: an annotation is a comment on an element; a submission is a visual diff request. Stored alongside annotations in the SQLite store.

**Submission contract** — the feedback-local, no-DOM shape and normalization rules for a raw Submission payload and stored raw Submission row. It is not a public reader interface; local feedback modules may change it freely while keeping **Submission presentation** stable for agents and prompts.

**Submission capture** — the lifecycle that turns widget input into a stored Submission: writes WebP/PNG screenshot files, persists drawing intent arrays and viewport context, pins the dispatch workspace, lists queue/history entries, resolves status, and deletes the row plus screenshot files together. Screenshot files and the stored row are one lifecycle for architecture purposes.

**Submission presentation** — the agent-facing view of a Submission: normalized screenshot paths, drawing and hint summaries, text notes, drawing-to-hint pairing, structured intent counts, and preserved raw intent arrays for escape hatches. This is distinct from the raw stored Submission row; storage is an adapter concern, while the presentation is the interface agents and prompts should consume.

**Dispatch agent** — one of nine targets the feedback server can send a submission to (`claude`, `codex`, `gemini`, `opencode`, `copilot`, `copilot-vscode`, `cursor`, `windsurf`, `zed`), or `off` to suppress dispatch. Defined in [`packages/feedback-server/src/dispatch/agents.ts`](./packages/feedback-server/src/dispatch/agents.ts).

**Dispatch agent manifest** — the feedback-owned module in [`packages/feedback-server/src/dispatch/agents.ts`](./packages/feedback-server/src/dispatch/agents.ts) that owns Dispatch agent IDs, launch strategy selection, CLI/app probes, warning config, display labels, and docs-facing agent IDs. Docs and dashboard surfaces adapt this manifest instead of naming Dispatch agent facts independently.

**Launch strategy** — how a dispatch agent receives its prompt. Four strategies today, each one a function module under [`packages/feedback-server/src/dispatch/strategies.ts`](./packages/feedback-server/src/dispatch/strategies.ts):

- `terminal-cli` — open a terminal (osascript on macOS, `wt.exe` on Windows) and run the agent's CLI with the prompt. Used by `claude`, `gemini`, `opencode`, `copilot`.
- `deeplink` — encode the prompt into a URL the agent's app handler picks up. Used by `codex`.
- `workspace-app-cli-chat` — try a bundled CLI's `chat` subcommand, fall back to clipboard + URL/app open. Used by `copilot-vscode`, `windsurf`.
- `workspace-app-clipboard` — copy prompt to clipboard, open the agent's workspace app on the project. Used by `cursor`, `zed`.

**Platform context** — the bundle of OS-touching primitives (`commandExists`, `macAppExists`, `spawnDetached`, `copyPromptToClipboard`, `openExternalUrl`, `hasJsonEntry`, …) a launch strategy receives at the seam. Strategies never reach for `node:os` or `node:child_process` directly. Tests construct a fake. See [`packages/feedback-server/src/dispatch/platform.ts`](./packages/feedback-server/src/dispatch/platform.ts).

**Dispatch warning** — a one-shot stderr hint fired during launch when an agent's MCP config is missing the `dryui-feedback` entry. Distinct from probe: probe accepts either `dryui` or `dryui-feedback`, the warning specifically asks for `dryui-feedback`. Today only Copilot CLI and the VS Code Copilot extension carry one.

## Component domain

**Theme token** — a `--dry-*` CSS variable defined in one of the theme stylesheets under `packages/ui/src/themes/*.css`. Background is `--dry-color-bg-base`, text is `--dry-color-text-strong`, etc. Consumer code uses `var(--name, fallback)` for defaults; never `--name: default` on the root.

## Layout domain

**Layout** — page or section structure for a `.svelte` route. A `<div data-layout="<name>">` in the route file plus a matching grid or flex block in `src/layout.css` scoped under `[data-layout="<name>"]`. No DryUI layout component exists. Authors pick the shape (auto-flow, named areas, flex row); the lint enforces the location.

**Layout area** — an optional named region inside a layout, marked with `data-layout-area="<region>"`. Used when the grid template assigns explicit `grid-area` slots. Auto-flow grids and flex layouts don't need it.

**Layout contract** — the hard-validation rules for Layout files and hooks: `src/layout.css` owns page/section grid and flex declarations, selectors are scoped through Layout hooks, responsive structure uses named `@container page (...)` queries, and violations fail deterministic checks. `data-layout-area` selectors must be scoped under their owning `[data-layout="<name>"]` selector; bare area selectors are global leakage. This is stricter than advisory prose because LLM-generated layouts otherwise drift into unsupported UI structure.

## Lint domain

**Severity** — three-level vocabulary `error | warning | suggestion`, defined by **Diagnostic summary** and re-exported by **Rule catalog** as `RuleSeverity`. There is no `info` level; ambient findings are `suggestion`. The narrowing is intentional: every checker output and every prompt the agent sees uses the same three words.

**Diagnostic summary** — the canonical sort-and-count produced from any checker's output. A small module in `@dryui/lint` ([`packages/lint/src/diagnostic-summary.ts`](./packages/lint/src/diagnostic-summary.ts), subpath `@dryui/lint/diagnostic-summary`) owns the **Severity** vocabulary, the ordering rule (severity desc primary, line asc tiebreaker), and the human-readable count string. Component-checker and theme-checker adapt their domain-specific issue shapes through it; future checkers extend the canonical `Diagnostic` interface and reuse the seam instead of hand-rolling another sort and counter.

## Architecture vocabulary

For architectural review, the terms in [`.claude/skills/improve-codebase-architecture/LANGUAGE.md`](.claude/skills/improve-codebase-architecture/LANGUAGE.md) are canonical: **module**, **interface**, **implementation**, **depth**, **seam**, **adapter**, **leverage**, **locality**. Don't substitute "service," "boundary," or "API."
