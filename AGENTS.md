# AGENTS.md

Instructions for all AI coding agents working in this repository.

## Tools

Use `gh-axi` for GitHub and `chrome-devtools-axi` for browser automation.

## Compatibility

DryUI is currently pre-alpha. Do not optimize for legacy compatibility or upgrade-path preservation unless a task explicitly asks for it.

## Setup

Use the DryUI CLI as the entry point for working with the library. Add the skill and MCP server after that when you want the same lookup and validation loop inside your editor.

```bash
bun install -g @dryui/cli@latest
dryui
```

Per-tool install snippets, config file paths, and MCP JSON/TOML blobs for every supported client (Claude Code, Codex, Gemini CLI, Cursor, Windsurf, Copilot, Zed) live in [`apps/docs/src/lib/ai-setup.ts`](apps/docs/src/lib/ai-setup.ts) — the canonical source rendered to the docs [getting-started page](https://dryui.dev/getting-started). Don't duplicate those snippets here; update `ai-setup.ts` instead.

Codex (the primary AGENTS.md audience) canonical install:

```bash
bun install -g @dryui/cli@latest
dryui
codex marketplace add rob-balfre/dryui
```

Then start `codex`, run `/plugins`, and install `DryUI`. Inside this repo, use the local plugin from `/plugins` rather than copying skills into `.codex/skills`.

The plugin is the canonical way Claude Code, Codex, and Gemini CLI get DryUI skills. Manual MCP config is only for tools that do not support plugins.

## CSS Rules

See [CLAUDE.md § CSS Discipline](./CLAUDE.md#css-discipline) for the full list. Violations are enforced by `@dryui/lint` (a Svelte preprocessor that runs during dev and build) and break the build.

## Releasing

Canonical release and npm-auth guidance lives in [`RELEASING.md`](./RELEASING.md). Release automation versions, publishes, and tags directly from pushes to `main`. Keep workflow changes there instead of duplicating them in agent-facing docs.

## Verification

Always run `bun run --filter '@dryui/ui' build` after editing `.svelte` files in `packages/ui/`. The lint preprocessor runs during build and will reject violations.
Prefer the root docs wrappers for docs work so local runs match CI: `bun run docs`, `bun run docs:build`, `bun run docs:check`, and `bun run build:docs`.
