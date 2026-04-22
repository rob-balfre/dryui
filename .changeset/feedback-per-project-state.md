---
'@dryui/cli': minor
'@dryui/feedback-server': minor
---

Feedback state is now scoped per project instead of living in a single global
`~/.dryui-feedback/` directory. Each project stores its SQLite database,
screenshots, and server config under `<project>/.dryui/feedback/`, and the
server picks the first free port starting at 4748 (incrementing on
`EADDRINUSE`) so multiple `dryui` sessions on one machine no longer collide.

The MCP entry and the `check-feedback.sh` hook now walk up from their cwd to
locate `.dryui/feedback/server.json`, so editors running from inside a project
tree connect to that project's server automatically. Pre-alpha data in the old
global location is dropped — no migration.
