---
'@dryui/cli': minor
'@dryui/mcp': patch
---

Add first-class support for the official Svelte MCP (`@sveltejs/mcp`) as a recommended companion.

- `dryui setup --install` now also registers `@sveltejs/mcp` alongside the DryUI servers for Copilot, Cursor, OpenCode, Windsurf, and Zed. Pass `--no-svelte-mcp` to opt out.
- Interactive `dryui setup` asks before writing the svelte server to the MCP config (default yes) and surfaces `svelte-mcp: registered for …` in the menu status.
- Each printed `dryui setup --editor <id>` guide now includes a "Svelte MCP (recommended companion)" section with the paste-in snippet for editors where auto-install is not supported (Claude Code, Codex, Gemini CLI).
- The DryUI skill gains a new rule directing agents to use `svelte-autofixer` / `get-documentation` from `@sveltejs/mcp` for Svelte 5 and SvelteKit questions, keeping DryUI focused on component APIs.
- Docs getting-started page renders a new companion block per agent with the exact snippet for that tool's config file.
