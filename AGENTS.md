# AGENTS.md

Instructions for all AI coding agents working in this repository.

## Tools

Use `gh-axi` for GitHub and `chrome-devtools-axi` for browser automation.

## Setup

Install the DryUI skill (conventions) and MCP server (live tools) for your AI coding tool.

Per-tool install snippets, config file paths, and MCP JSON/TOML blobs for every supported client (Claude Code, Codex, Cursor, Windsurf, Copilot, Zed) live in [`apps/docs/src/lib/ai-setup.ts`](apps/docs/src/lib/ai-setup.ts) — the canonical source rendered to the docs [getting-started page](https://dryui.dev/getting-started). Don't duplicate those snippets here; update `ai-setup.ts` instead.

Codex (the primary AGENTS.md audience) canonical install:

```bash
# Public / manual install
$skill-installer install https://github.com/rob-balfre/dryui/tree/main/packages/ui/skills/dryui
codex mcp add dryui -- npx -y @dryui/mcp

# Repo-local plugin when working in this repository
codex
/plugins
# Install DryUI from the "DryUI Local" marketplace exposed by .agents/plugins/marketplace.json
```

All MCP entries (every tool) use `"command": "npx", "args": ["-y", "@dryui/mcp"]` for the stdio server.

## CSS Rules (enforced by @dryui/lint — build fails on violations)

- **No `width`/`inline-size` properties** in scoped `<style>` blocks — no `width`, `min-width`, `max-width`, `inline-size`, or min/max variants. Grid children are sized by their track. Use `grid-template-columns`/`grid-template-rows` instead.
- **No `display: flex`** — use `display: grid` for all layout.
- **No inline styles** — no `style="..."` or `style:` directives.
- **No `!important`**, no `:global()`, no CSS modules.
- **No `<!-- svelte-ignore css_unused_selector -->`** — fix the root cause instead. Ensure DOM elements are rendered directly in the component that styles them.

## Releasing

Automated via `.github/workflows/release.yml` (changesets/action):

1. Add a changeset: `bun run changeset`
2. Push to `main` → CI opens a "Version Packages" PR
3. Merge that PR → CI publishes to npm + creates GitHub Releases

Manual: `bun run release` (validate → version → build → publish)

### npm auth gotcha

There's a gitignored **project-level `.npmrc` at the repo root** that holds the publish token. It takes precedence over `~/.npmrc` when any publish command runs from inside the repo. The GitHub Actions `NPM_TOKEN` secret must match `./.npmrc`, not `~/.npmrc` — they're usually different tokens.

To rotate the CI secret:

```bash
awk -F= '/^\/\/registry.npmjs.org\/:_authToken=/{printf "%s", $2}' ./.npmrc \
  | gh secret set NPM_TOKEN --repo rob-balfre/dryui
```

Never paste tokens through the GitHub web UI — invisible whitespace causes npm to return 401, which it reports as a misleading 404 on publish. Always pipe via stdin with `printf` / `awk printf` so there's no trailing newline.

## Verification

Always run `bun run --filter '@dryui/ui' build` after editing `.svelte` files in `packages/ui/`. The lint preprocessor runs during build and will reject violations.
