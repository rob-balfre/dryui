# @dryui/feedback

## 0.5.2

### Patch Changes

- [#30](https://github.com/rob-balfre/dryui/pull/30) [`b0d3b1e`](https://github.com/rob-balfre/dryui/commit/b0d3b1e8200d5a2e0cad10c5dafdcbf7f510eaf6) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Introduce the DESIGN.md brief pipeline: `check-vision` auto-discovers the nearest `DESIGN.md` and threads it into the visual rubric, `check` diagnoses brief structure, and the dryui/plugin/ui skills document a user-brief → DESIGN.md → component-lookup → polish → check loop so design identity stays visible instead of implicit in agent taste.

- Updated dependencies [[`b0d3b1e`](https://github.com/rob-balfre/dryui/commit/b0d3b1e8200d5a2e0cad10c5dafdcbf7f510eaf6)]:
  - @dryui/ui@2.0.2
  - @dryui/primitives@2.0.2

## 0.5.1

### Patch Changes

- [#29](https://github.com/rob-balfre/dryui/pull/29) [`c3550b4`](https://github.com/rob-balfre/dryui/commit/c3550b4a3c8ff235f4988bb3efa6dc3bee85a4e5) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Address the main-branch review findings across security, SSR stability, generated artifact hygiene, docs deployment, and tooling validation.

  Rename the MarkdownRenderer raw HTML opt-out from `sanitize={false}` to the explicit `dangerouslyAllowRawHtml` prop, harden local feedback server request boundaries, sanitize rich text editor HTML, move component IDs to Svelte SSR-safe IDs, and tighten DateField and drag preview cleanup.

  Also stabilize package declaration cleanup, generated artifact drift checks, docs static output and component manifests, MCP reviewer/theme diagnostics, CLI setup/install behavior, feedback page identity, and docs demo coverage.

- Updated dependencies [[`ed72d91`](https://github.com/rob-balfre/dryui/commit/ed72d91d5919fb00d24727ef438b0945dec84a4c), [`c3550b4`](https://github.com/rob-balfre/dryui/commit/c3550b4a3c8ff235f4988bb3efa6dc3bee85a4e5)]:
  - @dryui/ui@2.0.0
  - @dryui/primitives@2.0.0

## 0.5.0

### Minor Changes

- [`0b4a533`](https://github.com/rob-balfre/dryui/commit/0b4a5335e03a6cdb153f65187df7f7fae690d981) Thanks [@rob-balfre](https://github.com/rob-balfre)! - The `<Feedback />` widget now honours a runtime opt-out. Set `DRY_FEEDBACK_DISABLED=1` (or `VITE_DRY_FEEDBACK_DISABLED=1`) and the component renders nothing on both server and client, without removing the import or unmounting in the layout. Useful for CI, screenshot jobs, recorded demos, and any environment where the dev-only widget should stay out of the DOM. Prefer the `VITE_`-prefixed form so Vite bakes the flag into the client bundle for consistent SSR + client behaviour.

### Patch Changes

- Updated dependencies [[`0b4a533`](https://github.com/rob-balfre/dryui/commit/0b4a5335e03a6cdb153f65187df7f7fae690d981), [`f16e759`](https://github.com/rob-balfre/dryui/commit/f16e7598da88d5d4ddf313c27c3db1b822dad596)]:
  - @dryui/primitives@1.8.0
  - @dryui/ui@1.8.0

## 0.4.6

### Patch Changes

- [`b6213cb`](https://github.com/rob-balfre/dryui/commit/b6213cb21b57b863d2ae5710a57826ad7a971baa) Thanks [@rob-balfre](https://github.com/rob-balfre)! - `dryui` now opens the dev site with `?dryui-feedback=1` so the Feedback component starts in annotation mode, and submitting feedback opens the dashboard in a named tab focused on the new submission (`?focus=<id>`). The inline agent picker in the toolbar has been removed; pick which agent to launch per submission from the dashboard instead. `@dryui/feedback-server` now re-exports `normalizeDevUrl`.

## 0.4.5

### Patch Changes

- [`2afee28`](https://github.com/rob-balfre/dryui/commit/2afee28ba3888b9e961098209226236738d5ac1e) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Anchor `dryui init <path>` to the explicit target so it no longer walks up into a parent workspace's `package.json`, and surface a richer feedback submit flow (`waiting-for-capture` / `capturing` / `uploading`) with clearer cancel and unavailable-API messages.

  Also tightens the MCP reviewer's `theme-in-style` check to flag only real `--dry-*` declarations (skipping comments and token consumption) and report the correct source line, refines the matching lint message, adds a `suggestedFix` for it, parses multi-line interface props in the spec generator, adds subpath `publishConfig.exports` for `@dryui/mcp`, and bumps toolchain deps (svelte, typescript, vite, wrangler, bun-types, vitest, mapbox-gl).

- Updated dependencies [[`2afee28`](https://github.com/rob-balfre/dryui/commit/2afee28ba3888b9e961098209226236738d5ac1e)]:
  - @dryui/primitives@1.7.4
  - @dryui/ui@1.7.4

## 0.4.4

### Patch Changes

- [`9921ae4`](https://github.com/rob-balfre/dryui/commit/9921ae4df796a6b18980f99c5d2429b038a343c1) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Extract `tryShowPopover`/`tryHidePopover` into `@dryui/primitives` so toast providers, context menus, and the feedback toast layer share one guarded popover-toggle helper instead of repeating inline try/catch + `:popover-open` checks.

- [`9921ae4`](https://github.com/rob-balfre/dryui/commit/9921ae4df796a6b18980f99c5d2429b038a343c1) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Promote feedback success and error toasts through a feedback-owned native popover layer so they render above modal hosts.

- Updated dependencies [[`9921ae4`](https://github.com/rob-balfre/dryui/commit/9921ae4df796a6b18980f99c5d2429b038a343c1)]:
  - @dryui/primitives@1.7.3
  - @dryui/ui@1.7.3

## 0.4.3

### Patch Changes

- [`9580c51`](https://github.com/rob-balfre/dryui/commit/9580c51aafd1259a75be8f462342694baf7b5394) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Launch Windsurf feedback dispatch through `windsurf chat` when the CLI is available, including the bundled macOS CLI inside Windsurf.app. Falls back to the existing clipboard and app-open path when chat dispatch is unavailable.

- Updated dependencies [[`9580c51`](https://github.com/rob-balfre/dryui/commit/9580c51aafd1259a75be8f462342694baf7b5394), [`9580c51`](https://github.com/rob-balfre/dryui/commit/9580c51aafd1259a75be8f462342694baf7b5394)]:
  - @dryui/ui@1.7.2
  - @dryui/primitives@1.7.2

## 0.4.2

### Patch Changes

- [`49fa611`](https://github.com/rob-balfre/dryui/commit/49fa6116ebc9570b830e80b2df9529643a8219e2) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Internal cleanup across the workspace: un-export symbols only consumed
  inside their own module, modernize RegExp iteration to `str.matchAll`,
  and drop unused dev dependencies (puppeteer, pixelmatch, pngjs,
  lucide-svelte, adapter-static). No public API changes for documented
  entry points.
- Updated dependencies [[`49fa611`](https://github.com/rob-balfre/dryui/commit/49fa6116ebc9570b830e80b2df9529643a8219e2)]:
  - @dryui/primitives@1.7.1
  - @dryui/ui@1.7.1

## 0.4.1

### Patch Changes

- [`ddfdd05`](https://github.com/rob-balfre/dryui/commit/ddfdd051b32d0a2b312cd3b049e067c18ac8f188) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Launch agents directly from the feedback admin console and swap the floating widget's dispatch picker to a `DropdownMenu`.

  `@dryui/feedback-server` extracts `dispatchPrompt(target, prompt, options)` and exposes `POST /dispatch` (202 on success, 400 on invalid input, 503 when the chosen platform is unsupported on the host). The admin UI fetches `/dispatch-targets` on mount, persists the chosen agent in `localStorage`, and renders a Launch button + agent dropdown alongside Copy for both single submissions and the batch "run through all pending" prompt.

  `@dryui/feedback` swaps the floating widget's target-picker from `Dialog` to a top-end `DropdownMenu` (brand logos preserved), adds dark CSS-var overrides via a wrap div, and teaches the drag-guard to ignore menu elements so opening the picker does not start a drag.

- Updated dependencies [[`ddfdd05`](https://github.com/rob-balfre/dryui/commit/ddfdd051b32d0a2b312cd3b049e067c18ac8f188)]:
  - @dryui/ui@1.7.0
  - @dryui/primitives@1.7.0

## 0.4.0

### Minor Changes

- [`a91a0fe`](https://github.com/rob-balfre/dryui/commit/a91a0fe0b5fbe134c30031eb4fa6fa043fb36e49) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Feedback submissions now carry both a WebP and a PNG screenshot plus structured position hints for every drawing. `captureScreenshot` in the client emits `{ webp, png }` (both base64, prefix stripped); WebP is quality 0.8 for compactness and PNG is lossless so agents that cannot decode WebP can still read the frame. The server writes both files to `~/.dryui-feedback/screenshots/<uuid>.webp` and `<uuid>.png`, stores the PNG path in a new `screenshot_png_path` column (additive, nullable migration so legacy WebP-only rows keep working), and exposes `screenshotPath: { webp, png }` on the `Submission` type. The `POST /submissions` endpoint now requires an `image: { webp, png }` object; `GET /submissions/:id/screenshot?format=png` serves the PNG variant.

  Every submission also includes the scroll offset at submit time (`scroll: { x, y }`) and a parallel `hints: DrawingHint[]` array aligned with `drawings` index-for-index. Each hint carries a coarse corner (`top-left | top-right | bottom-left | bottom-right | center`), normalized `percentX/percentY` relative to the viewport, and when an anchor point resolves via `document.elementFromPoint`, a short element descriptor (`tag`, `id`, `selector`). The helper `position-hints.ts` ships in `@dryui/feedback` and is covered by unit tests. `feedback_get_submissions` in the MCP now surfaces both screenshot paths, scroll, per-drawing hints, and a pre-computed `summary` block (drawing counts by kind, corner counts) so agents do not have to iterate to orient themselves. The `Submission.drawings` type is now a proper discriminated union instead of `unknown[]`.

### Patch Changes

- Updated dependencies [[`3ae293a`](https://github.com/rob-balfre/dryui/commit/3ae293a0b691e773b35154caa9b2a915a4c58487)]:
  - @dryui/ui@1.6.0
  - @dryui/primitives@1.6.0

## 0.3.0

### Minor Changes

- [`ff5ef41`](https://github.com/rob-balfre/dryui/commit/ff5ef412bba2f2f927dcc30d11d4d52324131e48) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Ship the unreleased April 17-18 work across the published packages.
  - `@dryui/primitives` + `@dryui/ui`: collapse Dialog/Drawer/AlertDialog into a shared `ModalContent` primitive, extract `escape`/`dismiss`/`menu-nav`/`anchored-popover` helpers and migrate 12 consumers, replace the `useThemeOverride` hook with a scoped `TokenScope` component, portal layered overlays so stacked modals nest cleanly, harden anchored positioning, pause offscreen border-beams, polish mega-menu, shimmer, and tabs surfaces, and align the Timeline (centred line on dots, line stretched across the gap, line-width offset baked into `line-left`, `Timeline.Root` no longer shadows consumer overrides for dot size, gap, and color, and dot numerals forced to sans).
  - `@dryui/feedback` + `@dryui/feedback-server`: add agent dispatch with toolbar picker, persistence, and bridge; restructure the detail view with a prompt-copy column and notes column; add Codex, Gemini CLI, Ghostty, and Windows (`wt.exe`) dispatch surfaces; refresh dashboard list/detail layout.
  - `@dryui/lint`: REVIEW.md hygiene wave — add the `!important` rule and a11y / `variantAttrs` / theme-semantics catalogue updates.
  - `@dryui/cli`: REVIEW.md hygiene wave — clean up `diagnose`, `doctor`, `lint`, `list`, `project-planner`, `review`, `tokens`, and `workspace-args` command surfaces, plus shared format helpers.
  - `@dryui/mcp`: regenerate the architecture / contract / spec / theme-token catalogues against the new component and lint surface.
  - `@dryui/theme-wizard`: tidy `WizardShell` against the REVIEW.md pass.

### Patch Changes

- Updated dependencies [[`ff5ef41`](https://github.com/rob-balfre/dryui/commit/ff5ef412bba2f2f927dcc30d11d4d52324131e48)]:
  - @dryui/primitives@1.3.0
  - @dryui/ui@1.3.0

## 0.2.2

### Patch Changes

- [`66e3471`](https://github.com/rob-balfre/dryui/commit/66e3471d881d69a003119e2446dc863cc4e2f588) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Fix CI build failures: resolve border-beam type errors with noUncheckedIndexedAccess, fix invalid `@const` placement in feedback drawing canvas, and add missing slider pill variant types.

- Ship the unreleased April 16 feature wave across the published packages.
  - `@dryui/cli`: rewrite `dryui setup` into an interactive TUI with arrow-key menus, a unified setup/feedback hub, and the new default no-arg TTY flow. Session-start context now stays on `dryui ambient` instead of the separate `dryui-ambient` bin.
  - `@dryui/primitives` + `@dryui/ui`: add the new `BorderBeam` component/export, add the `Slider` pill variant and `valueLabel` snippet prop, and tighten dialog/drawer scroll-lock behavior.
  - `@dryui/feedback` + `@dryui/feedback-server`: add scroll-vs-viewport drawing spaces so annotations stay aligned in more host layouts, and refresh the feedback dashboard list/detail UI.
  - `@dryui/theme-wizard`: add the Wireframe preset and persist `adjust` filter values through recipe URL encoding/decoding and saved wizard state.
  - `@dryui/lint` + `@dryui/mcp`: allow `/* dryui-allow width */` escape hatches for intentional width usage and refresh generated catalog/spec metadata for the new component and slider surface.

- Updated dependencies [[`66e3471`](https://github.com/rob-balfre/dryui/commit/66e3471d881d69a003119e2446dc863cc4e2f588)]:
  - @dryui/primitives@1.2.0
  - @dryui/ui@1.2.0

## 0.2.1

### Patch Changes

- [`e27993e`](https://github.com/rob-balfre/dryui/commit/e27993e4c4307f64cde953a33e055b142392d047) Thanks [@rob-balfre](https://github.com/rob-balfre)! - The feedback overlay now portals into the topmost open `<dialog>` or popover instead of `document.body` whenever one is present, so annotations and the toolbar render above modal content (DryUI Dialog, Drawer, Popover, etc.) rather than being clipped behind it. The host is tracked via document-level `toggle`/`close`/`cancel` listeners and a mutation observer for legacy `dialog[open]` toggles. The text-input commit handler was extracted, the saved-drawings fetch now aborts on cleanup, and the overlay root resets the native dialog box-model so it does not paint chrome over the page.

- Updated dependencies [[`e27993e`](https://github.com/rob-balfre/dryui/commit/e27993e4c4307f64cde953a33e055b142392d047)]:
  - @dryui/ui@1.1.4
  - @dryui/primitives@1.1.4

## 0.2.0

### Minor Changes

- [`b67f1dd`](https://github.com/rob-balfre/dryui/commit/b67f1dd0dadd98e31f888f2959250d799b095521) Thanks [@rob-balfre](https://github.com/rob-balfre)! - - `@dryui/primitives`: `parseKeys` now accepts a `mod` / `$mod` modifier that matches `Cmd` on macOS and `Ctrl` elsewhere.
  - `@dryui/ui`: `Diagram` exposes themeable node padding, gap, and font-size custom properties (`--dry-diagram-node-padding`, `--dry-diagram-node-gap`, `--dry-diagram-node-label-size`, etc.). `CodeBlock` copy button now drives its text color through `--dry-btn-color` so it inherits hover/copied states cleanly.
  - `@dryui/feedback`: `Feedback` accepts a `scrollRoot` prop (`string | HTMLElement`) for scoping annotation positioning to a custom scroll container. Toolbar and overlay layout refined.
  - `@dryui/mcp`: Regenerated `spec.json` / `contract.v1.json` to reflect the new `--dry-btn-color` css var on `CodeBlock`.

### Patch Changes

- Updated dependencies [[`b67f1dd`](https://github.com/rob-balfre/dryui/commit/b67f1dd0dadd98e31f888f2959250d799b095521)]:
  - @dryui/primitives@1.1.0
  - @dryui/ui@1.1.0

## 0.1.7

### Patch Changes

- Updated dependencies [[`313e94c`](https://github.com/rob-balfre/dryui/commit/313e94c3cd6dbcaa4924b51f365529078ed14d42), [`06e99c6`](https://github.com/rob-balfre/dryui/commit/06e99c612e40398b7febb8e1af938ec1bcd73a8e), [`d0ec666`](https://github.com/rob-balfre/dryui/commit/d0ec666287883253a9a31ff455483bc00cadc4bb), [`06e99c6`](https://github.com/rob-balfre/dryui/commit/06e99c612e40398b7febb8e1af938ec1bcd73a8e), [`5e900f5`](https://github.com/rob-balfre/dryui/commit/5e900f52e89bf204edbf540bba8b24a7ea1a0acb), [`313e94c`](https://github.com/rob-balfre/dryui/commit/313e94c3cd6dbcaa4924b51f365529078ed14d42)]:
  - @dryui/ui@1.0.0
  - @dryui/primitives@1.0.0

## 0.1.6

### Patch Changes

- Updated dependencies [[`79e4ab5`](https://github.com/rob-balfre/dryui/commit/79e4ab5740624fa6f2236c63367722314c3db210)]:
  - @dryui/primitives@0.5.1
  - @dryui/ui@0.5.1

## 0.1.5

### Patch Changes

- Updated dependencies [[`fa63bd3`](https://github.com/rob-balfre/dryui/commit/fa63bd3e027637b0b9e41f07fd52eaa1d4fafadf)]:
  - @dryui/ui@0.5.0

## 0.1.4

### Patch Changes

- Updated dependencies [[`67a4de9`](https://github.com/rob-balfre/dryui/commit/67a4de9e7c3812e65d1bb61bea6fcbaf1ed192bd)]:
  - @dryui/primitives@0.4.0
  - @dryui/ui@0.4.0

## 0.1.3

### Patch Changes

- Updated dependencies [[`533de8c`](https://github.com/rob-balfre/dryui/commit/533de8cbb1b8414122c2f0c4406ecd67694e3aa4)]:
  - @dryui/primitives@0.3.0
  - @dryui/ui@0.3.0

## 0.1.2

### Patch Changes

- [`162ff30`](https://github.com/rob-balfre/dryui/commit/162ff30eb00abe01d3952f3376ed787bd97f9533) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Rename live-review skill to live-feedback and fix submission polling instructions

## 0.1.1

### Patch Changes

- [`738ffe7`](https://github.com/rob-balfre/dryui/commit/738ffe709a6addd735fb921ce7e518cf7ef1f91f) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Fix Feedback Hotkey handler prop and MCP binary execute permissions

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
