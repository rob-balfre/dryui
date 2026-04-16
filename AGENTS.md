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

Per-tool install snippets, config file paths, and MCP JSON/TOML blobs for every supported client (Claude Code, Codex, Cursor, Windsurf, Copilot, Zed) live in [`apps/docs/src/lib/ai-setup.ts`](apps/docs/src/lib/ai-setup.ts) — the canonical source rendered to the docs [getting-started page](https://dryui.dev/getting-started). Don't duplicate those snippets here; update `ai-setup.ts` instead.

Codex (the primary AGENTS.md audience) canonical install:

```bash
bun install -g @dryui/cli@latest
dryui
codex marketplace add rob-balfre/dryui
```

Then start `codex`, run `/plugins`, and install `DryUI`. Inside this repo, use the local plugin from `/plugins` rather than copying skills into `.codex/skills`.

The plugin is the canonical way Claude Code and Codex get DryUI skills. Manual MCP config is only for tools that do not support plugins.

## CSS Rules (enforced by @dryui/lint — build fails on violations)

- **No `width`/`inline-size` properties** in scoped `<style>` blocks — no `width`, `min-width`, `max-width`, `inline-size`, or min/max variants. Grid children are sized by their track. Use `grid-template-columns`/`grid-template-rows` instead.
- **No `display: flex`** — use `display: grid` for all layout.
- **No inline styles** — no `style="..."` or `style:` directives.
- **No `!important`**, no `:global()`, no CSS modules.
- **No `<!-- svelte-ignore css_unused_selector -->`** — fix the root cause instead. Ensure DOM elements are rendered directly in the component that styles them.

## Releasing

Canonical release and npm-auth guidance lives in [`RELEASING.md`](./RELEASING.md). Keep release workflow changes there instead of duplicating them in agent-facing docs.

## Verification

Always run `bun run --filter '@dryui/ui' build` after editing `.svelte` files in `packages/ui/`. The lint preprocessor runs during build and will reject violations.
Prefer the root docs wrappers for docs work so local runs match CI: `bun run docs`, `bun run docs:build`, `bun run docs:check`, and `bun run build:docs`.
