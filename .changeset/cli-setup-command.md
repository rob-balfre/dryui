---
'@dryui/cli': minor
'@dryui/mcp': patch
---

Added `dryui setup`, an interactive onboarding flow that walks through editor integration (Claude Code, Codex, Copilot, Cursor, Windsurf, Zed) and the optional Claude SessionStart hook, and can open feedback tooling at the end. Bare `dryui` now opens the same flow when run outside a DryUI project on a TTY, while still printing the project dashboard inside DryUI projects and the feedback launcher inside the monorepo. Per-editor snippets are shared between the CLI guide and the docs setup data. The MCP `ai-surface` manifest, `spec.json`, and `contract.v1.json` advertise the new `setup` command, and shared CLI helpers (`hasFlag`, `getFlag`, `isInteractiveTTY`) moved into `run.ts` so feedback, launcher, install-hook, and setup share one parser.
