---
'@dryui/cli': minor
'@dryui/feedback-server': minor
'@dryui/mcp': patch
'@dryui/primitives': patch
'@dryui/ui': patch
---

- `@dryui/cli`: Adds `dryui launcher` (the default no-arg command inside the repo) for opening the feedback dashboard and `dryui feedback ui` / `dryui feedback-ui-build` for building and serving it. Shared launch helpers deduped into `launch-utils.ts`.
- `@dryui/feedback-server`: Ships a new Vite-built Svelte dashboard UI and launcher page served directly by the HTTP server, with supporting endpoints and store/client updates.
- `@dryui/mcp`: Adds an `interactive-card-wrapper` reviewer rule plus minor tweaks to `architecture.ts` and `utils.ts`.
- `@dryui/ui`: `AccordionButtonTrigger` now sets `--dry-btn-justify="space-between"` and `--dry-btn-radius="0"` so the chevron sits flush-right and the trigger aligns cleanly with its panel.
