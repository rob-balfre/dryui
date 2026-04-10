# AGENTS.md

Instructions for all AI coding agents working in this repository.

## Setup

Install the DryUI skill (conventions) and MCP server (live tools) for your AI coding tool.

```bash
# Claude Code — plugin installs both skill + MCP
claude plugin marketplace add rob-balfre/dryui
claude plugin install dryui@dryui

# Codex — public/manual install
$skill-installer install https://github.com/rob-balfre/dryui/tree/main/packages/ui/skills/dryui
codex mcp add dryui -- npx -y @dryui/mcp

# Codex — repo-local plugin when working in this repository
codex
/plugins
# Install DryUI from the "DryUI Local" marketplace exposed by .agents/plugins/marketplace.json

# Copilot / Cursor / Windsurf — copy skill + add MCP config
npx degit rob-balfre/dryui/packages/ui/skills/dryui .agents/skills/dryui
```

For MCP server config, each tool uses a different file and root key:

| Tool              | Config file                           | Root key          |
| ----------------- | ------------------------------------- | ----------------- |
| Cursor            | `.cursor/mcp.json`                    | `mcpServers`      |
| VS Code / Copilot | `.vscode/mcp.json`                    | `servers`         |
| Windsurf          | `~/.codeium/windsurf/mcp_config.json` | `mcpServers`      |
| Zed               | `~/.config/zed/settings.json`         | `context_servers` |

All tools use `"command": "npx", "args": ["-y", "@dryui/mcp"]` for the server entry.

## CSS Rules (enforced by @dryui/lint — build fails on violations)

- **No `width`/`inline-size` properties** in scoped `<style>` blocks — no `width`, `min-width`, `max-width`, `inline-size`, or min/max variants. Grid children are sized by their track. Use `grid-template-columns`/`grid-template-rows` instead.
- **No `display: flex`** — use `display: grid` for all layout.
- **No inline styles** — no `style="..."` or `style:` directives.
- **No `!important`**, no `:global()`, no CSS modules.
- **No `<!-- svelte-ignore css_unused_selector -->`** — fix the root cause instead. Ensure DOM elements are rendered directly in the component that styles them.

## Verification

Always run `bun run --filter '@dryui/ui' build` after editing `.svelte` files in `packages/ui/`. The lint preprocessor runs during build and will reject violations.
