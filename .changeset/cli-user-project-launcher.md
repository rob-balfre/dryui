---
'@dryui/cli': minor
---

- `@dryui/cli` feedback session: detect the user's own DryUI project, offer to kill the port 5173 holder, spawn its dev server in the background, and point the feedback dashboard at it alongside the feedback server. Non-TTY callers skip the kill prompt and fall back to the original docs-monorepo flow.
