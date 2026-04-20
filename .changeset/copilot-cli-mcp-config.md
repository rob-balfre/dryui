---
'@dryui/feedback-server': patch
---

Fix Copilot CLI MCP setup in `@dryui/feedback-server`. The feedback-server dispatcher now sanity-checks `~/.copilot/mcp-config.json` before shelling to `copilot -i` and writes a one-time stderr hint with the exact `dryui-feedback` snippet when the file is missing or lacks a `dryui-feedback` entry. The launch still proceeds either way.
