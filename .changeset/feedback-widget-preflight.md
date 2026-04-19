---
'@dryui/cli': minor
'@dryui/mcp': minor
---

- `@dryui/mcp` project detection: `ProjectDetection` now reports `dependencies.feedback` and `feedback.layoutPath` (path of the first `+layout.svelte` under `src/routes/` that imports `@dryui/feedback`). Detection is gated on the package being installed and the layout search depth is capped at two levels to cover grouped routes without walking the full tree.
- `@dryui/cli` feedback session: when the user-project launcher opens the dashboard, it now emits a `Feedback widget:` note if `@dryui/feedback` is not installed or the `<Feedback />` component is not mounted in any layout. The launch still proceeds so the dashboard stays useful for reviewing submission history.
