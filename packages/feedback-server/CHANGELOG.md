# @dryui/feedback-server

## 0.3.0

### Minor Changes

- [`5049f55`](https://github.com/rob-balfre/dryui/commit/5049f553f31dd68b110e922c192e3d1a10ded154) Thanks [@rob-balfre](https://github.com/rob-balfre)! - - `@dryui/cli`: Adds `dryui launcher` (the default no-arg command inside the repo) for opening the feedback dashboard and `dryui feedback ui` / `dryui feedback-ui-build` for building and serving it. Shared launch helpers deduped into `launch-utils.ts`.
  - `@dryui/feedback-server`: Ships a new Vite-built Svelte dashboard UI and launcher page served directly by the HTTP server, with supporting endpoints and store/client updates.
  - `@dryui/mcp`: Adds an `interactive-card-wrapper` reviewer rule plus minor tweaks to `architecture.ts` and `utils.ts`.
  - `@dryui/ui`: `AccordionButtonTrigger` now sets `--dry-btn-justify="space-between"` and `--dry-btn-radius="0"` so the chevron sits flush-right and the trigger aligns cleanly with its panel.

## 0.2.0

### Minor Changes

- Strip feedback widget to minimal drawing tool with submission pipeline
  - Strip ~16k lines of annotation/layout code to a focused drawing overlay (pencil, arrow, text, move, eraser)
  - Add SQLite persistence for drawings (survive page refresh)
  - Add "Send feedback" button with full-page screenshot capture via getDisplayMedia API
  - Screenshots saved to disk as WebP, metadata in SQLite, exposed via MCP tools
  - New MCP tools: `feedback_get_submissions` (polling) and `feedback_resolve_submission`
  - New `/feedback` skill for Claude Code, Codex, and Cursor

## 0.1.0

### Minor Changes

- [`58379a3`](https://github.com/rob-balfre/dryui/commit/58379a3e5667552da988cceed3415c25f8716e8c) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Initial public release of @dryui/mcp, @dryui/feedback-server, and @dryui/cli
