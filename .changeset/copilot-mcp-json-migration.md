---
'@dryui/cli': minor
---

`dryui setup --editor copilot --install` now writes `.mcp.json` at the project root (with the `mcpServers` key) instead of `.vscode/mcp.json` (with the `servers` key). GitHub Copilot CLI 1.x removed `.vscode/mcp.json` support and moved workspace MCP config to `.mcp.json` (same shape as Claude Code's `.mcp.json`), so the old installer silently stopped wiring Copilot CLI. The installer also now registers `dryui-feedback` alongside `dryui`, which had been missing from the Copilot target entirely.

The agent status probe was updated to check, in order: project `.mcp.json`, `~/.copilot/mcp-config.json` (Copilot CLI user config), and legacy `.vscode/mcp.json`. Existing VS Code Copilot extension users with `.vscode/mcp.json` continue to be detected. The Copilot setup guide text now reflects the new location.
