# @dryui/feedback-server

## 0.4.0

### Minor Changes

- [`ff5ef41`](https://github.com/rob-balfre/dryui/commit/ff5ef412bba2f2f927dcc30d11d4d52324131e48) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Ship the unreleased April 17-18 work across the published packages.
  - `@dryui/primitives` + `@dryui/ui`: collapse Dialog/Drawer/AlertDialog into a shared `ModalContent` primitive, extract `escape`/`dismiss`/`menu-nav`/`anchored-popover` helpers and migrate 12 consumers, replace the `useThemeOverride` hook with a scoped `TokenScope` component, portal layered overlays so stacked modals nest cleanly, harden anchored positioning, pause offscreen border-beams, polish mega-menu, shimmer, and tabs surfaces, and align the Timeline (centred line on dots, line stretched across the gap, line-width offset baked into `line-left`, `Timeline.Root` no longer shadows consumer overrides for dot size, gap, and color, and dot numerals forced to sans).
  - `@dryui/feedback` + `@dryui/feedback-server`: add agent dispatch with toolbar picker, persistence, and bridge; restructure the detail view with a prompt-copy column and notes column; add Codex, Gemini CLI, Ghostty, and Windows (`wt.exe`) dispatch surfaces; refresh dashboard list/detail layout.
  - `@dryui/lint`: REVIEW.md hygiene wave — add the `!important` rule and a11y / `variantAttrs` / theme-semantics catalogue updates.
  - `@dryui/cli`: REVIEW.md hygiene wave — clean up `diagnose`, `doctor`, `lint`, `list`, `project-planner`, `review`, `tokens`, and `workspace-args` command surfaces, plus shared format helpers.
  - `@dryui/mcp`: regenerate the architecture / contract / spec / theme-token catalogues against the new component and lint surface.
  - `@dryui/theme-wizard`: tidy `WizardShell` against the REVIEW.md pass.

## 0.3.5

### Patch Changes

- [`d246743`](https://github.com/rob-balfre/dryui/commit/d246743278e3f06203711baeb84717170f3ff723) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Fix two release-pipeline bugs that shipped broken tarballs to npm, and harden the pipeline so they can't recur.
  - `@dryui/feedback-server@0.3.2` through `@0.3.4` published with an empty `dist/`. `scripts/validate.ts` never built feedback-server, and `scripts/publish-packages.ts` trusted validate instead of running its own build. The CLI's `require.resolve('@dryui/feedback-server/server')` failed, surfacing as "Unable to locate a built feedback dashboard." validate now builds feedback-server alongside the other leaf packages.
  - `@dryui/theme-wizard@5.0.0` through `@8.0.0` published with `exports` pointing at `./src/*`, which isn't in the tarball (`files: ["dist"]`). Added `publishConfig.exports`/`svelte`/`types` targeting `./dist/*` and wired in the shared `prepack`/`postpack` export-swap scripts.
  - `scripts/publish-packages.ts` now runs `bun run build:packages` before `changeset publish`, then walks every publishable `package.json` and verifies that `main`, `types`, `bin`, `exports`, and `files` resolve to real, non-empty paths. `scripts/publish.ts` (manual path) runs the same verification before `npm publish`. Shared helper: `scripts/lib/verify-dist.ts`.

## 0.3.4

### Patch Changes

- [`dc15f8c`](https://github.com/rob-balfre/dryui/commit/dc15f8c0432db32aff8321303aa3085ac3789910) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Add a `dryui-feedback-mcp` bin so the Claude and Codex plugin bundle can install the feedback MCP server without custom local wiring.

## 0.3.3

### Patch Changes

- Ship the unreleased April 16 feature wave across the published packages.
  - `@dryui/cli`: rewrite `dryui setup` into an interactive TUI with arrow-key menus, a unified setup/feedback hub, and the new default no-arg TTY flow. Session-start context now stays on `dryui ambient` instead of the separate `dryui-ambient` bin.
  - `@dryui/primitives` + `@dryui/ui`: add the new `BorderBeam` component/export, add the `Slider` pill variant and `valueLabel` snippet prop, and tighten dialog/drawer scroll-lock behavior.
  - `@dryui/feedback` + `@dryui/feedback-server`: add scroll-vs-viewport drawing spaces so annotations stay aligned in more host layouts, and refresh the feedback dashboard list/detail UI.
  - `@dryui/theme-wizard`: add the Wireframe preset and persist `adjust` filter values through recipe URL encoding/decoding and saved wizard state.
  - `@dryui/lint` + `@dryui/mcp`: allow `/* dryui-allow width */` escape hatches for intentional width usage and refresh generated catalog/spec metadata for the new component and slider surface.

## 0.3.2

### Patch Changes

- [`e27993e`](https://github.com/rob-balfre/dryui/commit/e27993e4c4307f64cde953a33e055b142392d047) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Feedback dashboard screenshots are now rendered as a thumbnail that opens a full-resolution Dialog with the original capture, viewport metadata, and a link out to the page. The dashboard reads its `?dev=` target through a shared `normalizeDevUrl` helper that always pins `?dryui-feedback=1` on the dev app URL, and the CLI launcher (`dryui` / `dryui feedback ui`) now constructs the dashboard URL with the same flag so the docs site only mounts the feedback overlay when the dashboard hands off to it.

## 0.3.1

### Patch Changes

- [`d76f9f4`](https://github.com/rob-balfre/dryui/commit/d76f9f4e530c8413431b781f7c1c73720106027b) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Calendar consolidation, input/embed fixes, and feedback dashboard merge.

  **@dryui/ui**
  - Consolidated `Calendar`, `DatePicker`, `DateRangePicker`, and `RangeCalendar` onto a single shared internal `CalendarGridButton` via a `CalendarGridAdapter` prop. ~600 lines of duplicated template + styles removed; behavior, narrow weekday headers (S M T W T F S), and brand-fill selection are now consistent across all four.
  - Fixed empty weekday header row caused by duplicate keys in the `{#each}` (narrow labels have repeated letters).
  - Selected dates fill with the brand color on first click via cell-level CSS variable cascade.
  - `NumberInput`: removed dead `container-type: inline-size` that was collapsing the wrapper to 38px and misaligning the +/- buttons; increment/decrement buttons now scale with the `size` prop (`sm`/`md`/`lg`).
  - `VideoEmbed`: iframe and video now fill the aspect-ratio box via `width="100%" height="100%"` HTML attributes (CSS `inset` alone doesn't override replaced-element intrinsic size).
  - `Image`: exposed `--dry-image-block-size` and `--dry-image-place-self` for consumer overrides.

  **@dryui/cli**
  - `dryui feedback launcher` now opens the unified feedback dashboard at `/ui/` directly (with the docs URL passed via `?dev=`), via the new `buildDashboardUrl()` helper. Removed the separate launcher URL/targets and the `includeLauncher` build option.

  **@dryui/feedback-server**
  - The standalone launcher UI (`launcher.html`, `Launcher.svelte`, `launcher.ts`) is removed. The main dashboard (`App.svelte`) is now the single entry point and reads the docs base URL from a `?dev=` query parameter. Added a copy-prompt button so submissions can be handed off to Claude with one click.

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
