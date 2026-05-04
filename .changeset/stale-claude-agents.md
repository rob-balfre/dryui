---
'@dryui/cli': patch
'@dryui/mcp': patch
---

Detect and repair stale copied Claude agent prompts.

`dryui detect` now warns when a consumer project has old `.claude/agents` files that still reference removed DryUI guidance such as `AreaGrid` or the old `packages/ui/skills/*` paths. Workspace `dryui check` reports the same condition as `project/stale-claude-agent` with a repair hint.

`dryui setup --sync-agents [path]` refreshes bundled Claude agents on demand, and the launcher refresh path now overwrites known stale generated prompts even when the project copy has a newer mtime.
