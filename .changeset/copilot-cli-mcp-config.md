---
'@dryui/feedback-server': patch
'@dryui/docs': patch
---

Fix Copilot CLI MCP setup. The docs page previously pointed Copilot users at `.vscode/mcp.json` with root key `servers`, which is the VS Code Copilot (extension) format. Copilot CLI actually reads `~/.copilot/mcp-config.json` with root key `mcpServers`. The getting-started snippet now documents both surfaces and includes the `dryui-feedback` MCP alongside `dryui`, using the `sh -c 'cd "${TMPDIR:-/tmp}" && exec npx ...'` wrapper the plugin already uses for the feedback server in consumer projects. The feedback-server dispatcher also now sanity-checks `~/.copilot/mcp-config.json` before shelling to `copilot -i` and writes a one-time stderr hint with the exact snippet when the file is missing or lacks a `dryui-feedback` entry. The launch proceeds either way.
