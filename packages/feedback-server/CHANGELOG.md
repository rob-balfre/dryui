# @dryui/feedback-server

## 0.8.1

### Patch Changes

- [`5e82614`](https://github.com/rob-balfre/dryui/commit/5e8261432d89625774e6ca528b216e62deddff66) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Bake Jakub Krehel's 11 interface-polish principles into DryUI: new concentric-radius / motion / numeric / optical tokens; `--dry-shadow-{sm,md,lg,xl}` redefined with a 3-layer edge + contact + ambient recipe (plus `-hover` variants and dark/midnight/aurora/terminal overrides); Card drops its default 1px border in favour of shadow-only chrome (with `bordered` escape hatch); Separator gains `variant="shadow"`; Image + Avatar switch inset box-shadow to outline; Button gains optical `:has()` padding trim + `data-dry-icon` marker on Icon; Field.Root gains `nestRadius`; Badge gains `numeric`; RelativeTime + FormatDate pick up tabular-nums via `--dry-numeric-variant`; overlay radii (Dialog, Popover, DropdownMenu, ContextMenu, Menubar, Toast, Tooltip, Drawer, CommandPalette) consume per-container tokens.

  New primitives: `<IconSwap>`, `<Numeric>`, `<Enter>`, `<Exit>`, `<Stagger>` components plus `enter` / `leave` Svelte transition functions exported from `@dryui/ui/motion`.

  Check surface: `@dryui/lint` gains a `category: 'polish' | 'correctness' | 'a11y'` field on `RuleCatalogEntry`, 12 new `polish/*` rules (raw-heading, raw-paragraph, raw-img, raw-icon-conditional, nested-radius-mismatch, missing-theme-smoothing, numeric-without-tabular, inter-tabular-warning, keyframes-on-interactive, ad-hoc-enter-keyframe, symmetric-exit-animation, solid-border-on-raised), a `checkTheme()` export for theme-file polish rules, and `checkSvelteFile` / `checkStyle` / `checkMarkup` / `checkScript` all accept a `categoryFilter`. The `@dryui/lint` preprocessor now filters by severity so only `error`-severity violations block the build; suggestion/warning/info print but don't fail CI. `@dryui/mcp` `check` accepts `scope: 'polish' | 'no-polish'`, and `renderTheme` omits the coverage field from its header when the theme-correctness audit is scope-skipped.

  Docs: new `/docs/polish-pass` page and ten composition recipes (typography, concentric-radius, icon-swap, numeric-display, interactive-motion, stagger-entrance, exit-animation, shadow-as-border, icon-in-button, image-edge).

## 0.8.0

### Minor Changes

- [`e96430c`](https://github.com/rob-balfre/dryui/commit/e96430c92b64009042fcc49ec02cf46363267a77) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Ship the feed-shaped dashboard and pin dispatch to the submission's captured workspace.
  - The admin dashboard is now a vertical feed with a collapsible filter bar. Each submission renders its screenshot, notes, and dispatch controls inline via a new `SubmissionCard`, replacing the previous split list + detail layout. Tabs read `Pending` / `Complete` and the bulk "Work through all" launcher sits next to the filter.
  - Submissions now carry a `workspace` field stamped from the dispatcher at capture time (new `workspace` TEXT column, migrated in place via `ensureColumn`).
  - `/dispatch` accepts an optional `submissionId` and prefers that submission's stored workspace over the live server's cwd, so launching an agent from an older submission still opens the correct project when the server was restarted elsewhere.

## 0.7.0

### Minor Changes

- [`cadae39`](https://github.com/rob-balfre/dryui/commit/cadae393c5215c877f021fd46b2a8b2b38e1c089) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Feedback state is now scoped per project instead of living in a single global
  `~/.dryui-feedback/` directory. Each project stores its SQLite database,
  screenshots, and server config under `<project>/.dryui/feedback/`, and the
  server picks the first free port starting at 4748 (incrementing on
  `EADDRINUSE`) so multiple `dryui` sessions on one machine no longer collide.

  The MCP entry and the `check-feedback.sh` hook now walk up from their cwd to
  locate `.dryui/feedback/server.json`, so editors running from inside a project
  tree connect to that project's server automatically. Pre-alpha data in the old
  global location is dropped — no migration.

## 0.6.6

### Patch Changes

- [`b6213cb`](https://github.com/rob-balfre/dryui/commit/b6213cb21b57b863d2ae5710a57826ad7a971baa) Thanks [@rob-balfre](https://github.com/rob-balfre)! - `dryui` now opens the dev site with `?dryui-feedback=1` so the Feedback component starts in annotation mode, and submitting feedback opens the dashboard in a named tab focused on the new submission (`?focus=<id>`). The inline agent picker in the toolbar has been removed; pick which agent to launch per submission from the dashboard instead. `@dryui/feedback-server` now re-exports `normalizeDevUrl`.

## 0.6.5

### Patch Changes

- [`57b65f6`](https://github.com/rob-balfre/dryui/commit/57b65f646f9e3fb3371ebebc1898d5a2d5ca74de) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Auto-dispatched feedback prompts now carry the same 6-step review body and annotation text notes that the admin dashboard preview shows, instead of a one-line instruction. Fixes a regression where agents launched on submission lost the annotation context.

## 0.6.4

### Patch Changes

- [`2afee28`](https://github.com/rob-balfre/dryui/commit/2afee28ba3888b9e961098209226236738d5ac1e) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Anchor `dryui init <path>` to the explicit target so it no longer walks up into a parent workspace's `package.json`, and surface a richer feedback submit flow (`waiting-for-capture` / `capturing` / `uploading`) with clearer cancel and unavailable-API messages.

  Also tightens the MCP reviewer's `theme-in-style` check to flag only real `--dry-*` declarations (skipping comments and token consumption) and report the correct source line, refines the matching lint message, adds a `suggestedFix` for it, parses multi-line interface props in the spec generator, adds subpath `publishConfig.exports` for `@dryui/mcp`, and bumps toolchain deps (svelte, typescript, vite, wrangler, bun-types, vitest, mapbox-gl).

## 0.6.3

### Patch Changes

- [`9921ae4`](https://github.com/rob-balfre/dryui/commit/9921ae4df796a6b18980f99c5d2429b038a343c1) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Ask feedback agents to run the relevant project linter/check command before resolving feedback submissions.

## 0.6.2

### Patch Changes

- [`9580c51`](https://github.com/rob-balfre/dryui/commit/9580c51aafd1259a75be8f462342694baf7b5394) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Launch Windsurf feedback dispatch through `windsurf chat` when the CLI is available, including the bundled macOS CLI inside Windsurf.app. Falls back to the existing clipboard and app-open path when chat dispatch is unavailable.

## 0.6.1

### Patch Changes

- [`49fa611`](https://github.com/rob-balfre/dryui/commit/49fa6116ebc9570b830e80b2df9529643a8219e2) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Internal cleanup across the workspace: un-export symbols only consumed
  inside their own module, modernize RegExp iteration to `str.matchAll`,
  and drop unused dev dependencies (puppeteer, pixelmatch, pngjs,
  lucide-svelte, adapter-static). No public API changes for documented
  entry points.

## 0.6.0

### Minor Changes

- [`ddfdd05`](https://github.com/rob-balfre/dryui/commit/ddfdd051b32d0a2b312cd3b049e067c18ac8f188) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Launch agents directly from the feedback admin console and swap the floating widget's dispatch picker to a `DropdownMenu`.

  `@dryui/feedback-server` extracts `dispatchPrompt(target, prompt, options)` and exposes `POST /dispatch` (202 on success, 400 on invalid input, 503 when the chosen platform is unsupported on the host). The admin UI fetches `/dispatch-targets` on mount, persists the chosen agent in `localStorage`, and renders a Launch button + agent dropdown alongside Copy for both single submissions and the batch "run through all pending" prompt.

  `@dryui/feedback` swaps the floating widget's target-picker from `Dialog` to a top-end `DropdownMenu` (brand logos preserved), adds dark CSS-var overrides via a wrap div, and teaches the drag-guard to ignore menu elements so opening the picker does not start a drag.

## 0.5.0

### Minor Changes

- [`a91a0fe`](https://github.com/rob-balfre/dryui/commit/a91a0fe0b5fbe134c30031eb4fa6fa043fb36e49) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Feedback submissions now carry both a WebP and a PNG screenshot plus structured position hints for every drawing. `captureScreenshot` in the client emits `{ webp, png }` (both base64, prefix stripped); WebP is quality 0.8 for compactness and PNG is lossless so agents that cannot decode WebP can still read the frame. The server writes both files to `~/.dryui-feedback/screenshots/<uuid>.webp` and `<uuid>.png`, stores the PNG path in a new `screenshot_png_path` column (additive, nullable migration so legacy WebP-only rows keep working), and exposes `screenshotPath: { webp, png }` on the `Submission` type. The `POST /submissions` endpoint now requires an `image: { webp, png }` object; `GET /submissions/:id/screenshot?format=png` serves the PNG variant.

  Every submission also includes the scroll offset at submit time (`scroll: { x, y }`) and a parallel `hints: DrawingHint[]` array aligned with `drawings` index-for-index. Each hint carries a coarse corner (`top-left | top-right | bottom-left | bottom-right | center`), normalized `percentX/percentY` relative to the viewport, and when an anchor point resolves via `document.elementFromPoint`, a short element descriptor (`tag`, `id`, `selector`). The helper `position-hints.ts` ships in `@dryui/feedback` and is covered by unit tests. `feedback_get_submissions` in the MCP now surfaces both screenshot paths, scroll, per-drawing hints, and a pre-computed `summary` block (drawing counts by kind, corner counts) so agents do not have to iterate to orient themselves. The `Submission.drawings` type is now a proper discriminated union instead of `unknown[]`.

### Patch Changes

- [`8ed5d42`](https://github.com/rob-balfre/dryui/commit/8ed5d426243f109804ea0586ff031c3672708672) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Fix Copilot CLI MCP setup in `@dryui/feedback-server`. The feedback-server dispatcher now sanity-checks `~/.copilot/mcp-config.json` before shelling to `copilot -i` and writes a one-time stderr hint with the exact `dryui-feedback` snippet when the file is missing or lacks a `dryui-feedback` entry. The launch still proceeds either way.

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
