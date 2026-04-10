# @dryui/feedback

## 0.1.0

### Minor Changes

- Strip feedback widget to minimal drawing tool with submission pipeline
  - Strip ~16k lines of annotation/layout code to a focused drawing overlay (pencil, arrow, text, move, eraser)
  - Add SQLite persistence for drawings (survive page refresh)
  - Add "Send feedback" button with full-page screenshot capture via getDisplayMedia API
  - Screenshots saved to disk as WebP, metadata in SQLite, exposed via MCP tools
  - New MCP tools: `feedback_get_submissions` (polling) and `feedback_resolve_submission`
  - New `/feedback` skill for Claude Code, Codex, and Cursor

## 0.0.6

### Patch Changes

- Updated dependencies [[`2b501d2`](https://github.com/rob-balfre/dryui/commit/2b501d258f4f7397e0d5642d72d0867a407372a3)]:
  - @dryui/ui@0.2.0
  - @dryui/primitives@0.2.0
  - @dryui/mcp@0.4.0

## 0.0.5

### Patch Changes

- Updated dependencies [[`1d85a8b`](https://github.com/rob-balfre/dryui/commit/1d85a8b0ecec8242d97b686edf697765591bfd7b), [`1d85a8b`](https://github.com/rob-balfre/dryui/commit/1d85a8b0ecec8242d97b686edf697765591bfd7b)]:
  - @dryui/mcp@0.3.0
  - @dryui/primitives@0.1.13
  - @dryui/ui@0.1.13

## 0.0.4

### Patch Changes

- Updated dependencies [[`79e3d4c`](https://github.com/rob-balfre/dryui/commit/79e3d4cc7f4cd67272042f4007f2acbc3271b537), [`2a73f9d`](https://github.com/rob-balfre/dryui/commit/2a73f9d6344c596f0f678417b6ce4ed1b9d95e01), [`2515334`](https://github.com/rob-balfre/dryui/commit/2515334757c50a26121884abeb3daecfe927cd6d)]:
  - @dryui/mcp@0.2.0
  - @dryui/primitives@0.1.7
  - @dryui/ui@0.1.7

## 0.0.3

### Patch Changes

- Fix workspace:\* dependencies that broke npm installs

- Updated dependencies []:
  - @dryui/ui@0.1.1

## 0.0.2

### Patch Changes

- Updated dependencies [[`a3ced6e`](https://github.com/rob-balfre/dryui/commit/a3ced6ef72d256a07977b3803e9e9e5df881bfa2), [`58379a3`](https://github.com/rob-balfre/dryui/commit/58379a3e5667552da988cceed3415c25f8716e8c)]:
  - @dryui/primitives@0.1.0
  - @dryui/ui@0.1.0
  - @dryui/mcp@0.1.0
