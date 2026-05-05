# CONTEXT

Domain glossary for the DryUI monorepo. Used by `/improve-codebase-architecture`, `/grill-with-docs`, and any agent reasoning about the codebase.

## Surfaces

**Skill** — the primary entry point a human-led, agent-assisted DryUI workflow runs from. Sources live under top-level [`skills/`](./skills/). Installed into editors via `npx skills add rob-balfre/dryui`. ADR-0001 makes skills the canonical product surface.

**CLI (`@dryui/cli`)** — the `dryui` binary. Intentionally narrow: feedback launcher, `ambient` (SessionStart hook payload), `install-hook` (idempotent settings.json merger). ADR-0001 forbids growing it back into project detection / setup. ADR-0002 delegates skill install to `vercel-labs/skills`.

**Lint surface** — a build-time enforcement point exposed by `@dryui/lint`. Two surfaces today: `dryuiLint()` (Svelte preprocessor) for component rules; `dryuiLayoutCss()` (Vite plugin) for `src/layout.css`.

## Feedback domain

**Session** — a feedback-capture window opened by a human in the dashboard. Carries a URL, a status (active / approved / closed), and a list of annotations.

**Annotation** — a single comment attached to one DOM element on a session URL. Carries an intent (fix / change / question / approve), a severity, a status, and an optional thread of human/agent messages.

**Submission** — a screenshot + drawings + click hints captured by the feedback widget, addressed to one **dispatch agent**. Distinct from an annotation: an annotation is a comment on an element; a submission is a visual diff request. Stored alongside annotations in the SQLite store.

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

**Composition data** — hand-curated guidance for combining DryUI components: which to pick, what to use it with, what to avoid. Single source of truth at [`packages/mcp/src/composition-data.ts`](./packages/mcp/src/composition-data.ts). Consumed by spec generation, MCP tools, and skills.

**Spec** — pre-generated JSON snapshot of every component's API (props, slots, styles), produced from `@dryui/ui` + `@dryui/primitives` source merged with composition data. Lives at [`packages/mcp/src/spec.json`](./packages/mcp/src/spec.json).

**Docs component page manifest** — generated docs runtime data derived from the Spec and Composition data. It lives at [`apps/docs/src/lib/generated/component-pages.json`](./apps/docs/src/lib/generated/component-pages.json), is produced by [`packages/mcp/src/docs-component-pages.ts`](./packages/mcp/src/docs-component-pages.ts), and keeps component docs route loaders thin.

**Theme token** — a `--dry-*` CSS variable defined in one of the theme stylesheets under `packages/ui/src/themes/*.css`. Background is `--dry-color-bg-base`, text is `--dry-color-text-strong`, etc. Consumer code uses `var(--name, fallback)` for defaults; never `--name: default` on the root.

## Layout domain

**Layout** — page or section structure for a `.svelte` route. A `<div data-layout="<name>">` in the route file plus a matching grid template in `src/layout.css` scoped under `[data-layout="<name>"]`. No DryUI layout component exists.

**Layout area** — a named region inside a layout, marked with `data-layout-area="<region>"`. The grid template assigns it a `grid-area`.

**Layout phase** — Phase 1 (zones, grid skeleton) handled by the `dryui-layout` skill; Phase 2 (placement, polish) handled by `dryui-layout-polish`. Phase 1 markup uses plain HTML, no DryUI components.

## Architecture vocabulary

For architectural review, the terms in [`.claude/skills/improve-codebase-architecture/LANGUAGE.md`](.claude/skills/improve-codebase-architecture/LANGUAGE.md) are canonical: **module**, **interface**, **implementation**, **depth**, **seam**, **adapter**, **leverage**, **locality**. Don't substitute "service," "boundary," or "API."
