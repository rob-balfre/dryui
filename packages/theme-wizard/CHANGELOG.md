# @dryui/theme-wizard

## 16.0.0

### Patch Changes

- Updated dependencies [[`ed72d91`](https://github.com/rob-balfre/dryui/commit/ed72d91d5919fb00d24727ef438b0945dec84a4c), [`c3550b4`](https://github.com/rob-balfre/dryui/commit/c3550b4a3c8ff235f4988bb3efa6dc3bee85a4e5)]:
  - @dryui/ui@2.0.0
  - @dryui/primitives@2.0.0

## 15.0.0

### Patch Changes

- [`5e82614`](https://github.com/rob-balfre/dryui/commit/5e8261432d89625774e6ca528b216e62deddff66) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Bake Jakub Krehel's 11 interface-polish principles into DryUI: new concentric-radius / motion / numeric / optical tokens; `--dry-shadow-{sm,md,lg,xl}` redefined with a 3-layer edge + contact + ambient recipe (plus `-hover` variants and dark/midnight/aurora/terminal overrides); Card drops its default 1px border in favour of shadow-only chrome (with `bordered` escape hatch); Separator gains `variant="shadow"`; Image + Avatar switch inset box-shadow to outline; Button gains optical `:has()` padding trim + `data-dry-icon` marker on Icon; Field.Root gains `nestRadius`; Badge gains `numeric`; RelativeTime + FormatDate pick up tabular-nums via `--dry-numeric-variant`; overlay radii (Dialog, Popover, DropdownMenu, ContextMenu, Menubar, Toast, Tooltip, Drawer, CommandPalette) consume per-container tokens.

  New primitives: `<IconSwap>`, `<Numeric>`, `<Enter>`, `<Exit>`, `<Stagger>` components plus `enter` / `leave` Svelte transition functions exported from `@dryui/ui/motion`.

  Check surface: `@dryui/lint` gains a `category: 'polish' | 'correctness' | 'a11y'` field on `RuleCatalogEntry`, 12 new `polish/*` rules (raw-heading, raw-paragraph, raw-img, raw-icon-conditional, nested-radius-mismatch, missing-theme-smoothing, numeric-without-tabular, inter-tabular-warning, keyframes-on-interactive, ad-hoc-enter-keyframe, symmetric-exit-animation, solid-border-on-raised), a `checkTheme()` export for theme-file polish rules, and `checkSvelteFile` / `checkStyle` / `checkMarkup` / `checkScript` all accept a `categoryFilter`. The `@dryui/lint` preprocessor now filters by severity so only `error`-severity violations block the build; suggestion/warning/info print but don't fail CI. `@dryui/mcp` `check` accepts `scope: 'polish' | 'no-polish'`, and `renderTheme` omits the coverage field from its header when the theme-correctness audit is scope-skipped.

  Docs: new `/docs/polish-pass` page and ten composition recipes (typography, concentric-radius, icon-swap, numeric-display, interactive-motion, stagger-entrance, exit-animation, shadow-as-border, icon-in-button, image-edge).

- Updated dependencies [[`5e82614`](https://github.com/rob-balfre/dryui/commit/5e8261432d89625774e6ca528b216e62deddff66)]:
  - @dryui/ui@1.9.0
  - @dryui/primitives@1.9.0

## 14.0.0

### Patch Changes

- Updated dependencies [[`0b4a533`](https://github.com/rob-balfre/dryui/commit/0b4a5335e03a6cdb153f65187df7f7fae690d981), [`f16e759`](https://github.com/rob-balfre/dryui/commit/f16e7598da88d5d4ddf313c27c3db1b822dad596)]:
  - @dryui/primitives@1.8.0
  - @dryui/ui@1.8.0

## 13.0.2

### Patch Changes

- [`2afee28`](https://github.com/rob-balfre/dryui/commit/2afee28ba3888b9e961098209226236738d5ac1e) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Anchor `dryui init <path>` to the explicit target so it no longer walks up into a parent workspace's `package.json`, and surface a richer feedback submit flow (`waiting-for-capture` / `capturing` / `uploading`) with clearer cancel and unavailable-API messages.

  Also tightens the MCP reviewer's `theme-in-style` check to flag only real `--dry-*` declarations (skipping comments and token consumption) and report the correct source line, refines the matching lint message, adds a `suggestedFix` for it, parses multi-line interface props in the spec generator, adds subpath `publishConfig.exports` for `@dryui/mcp`, and bumps toolchain deps (svelte, typescript, vite, wrangler, bun-types, vitest, mapbox-gl).

- Updated dependencies [[`2afee28`](https://github.com/rob-balfre/dryui/commit/2afee28ba3888b9e961098209226236738d5ac1e)]:
  - @dryui/primitives@1.7.4
  - @dryui/ui@1.7.4

## 13.0.1

### Patch Changes

- [`49fa611`](https://github.com/rob-balfre/dryui/commit/49fa6116ebc9570b830e80b2df9529643a8219e2) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Internal cleanup across the workspace: un-export symbols only consumed
  inside their own module, modernize RegExp iteration to `str.matchAll`,
  and drop unused dev dependencies (puppeteer, pixelmatch, pngjs,
  lucide-svelte, adapter-static). No public API changes for documented
  entry points.
- Updated dependencies [[`49fa611`](https://github.com/rob-balfre/dryui/commit/49fa6116ebc9570b830e80b2df9529643a8219e2)]:
  - @dryui/primitives@1.7.1
  - @dryui/ui@1.7.1

## 13.0.0

### Patch Changes

- Updated dependencies [[`ddfdd05`](https://github.com/rob-balfre/dryui/commit/ddfdd051b32d0a2b312cd3b049e067c18ac8f188)]:
  - @dryui/ui@1.7.0
  - @dryui/primitives@1.7.0

## 12.0.0

### Patch Changes

- Updated dependencies [[`3ae293a`](https://github.com/rob-balfre/dryui/commit/3ae293a0b691e773b35154caa9b2a915a4c58487)]:
  - @dryui/ui@1.6.0
  - @dryui/primitives@1.6.0

## 11.0.0

### Patch Changes

- Updated dependencies [[`8e4aeba`](https://github.com/rob-balfre/dryui/commit/8e4aeba80edc2dd5597895cc70bb94a26494d97c)]:
  - @dryui/primitives@1.5.0
  - @dryui/ui@1.5.0

## 10.0.0

### Patch Changes

- Updated dependencies [[`8971b0e`](https://github.com/rob-balfre/dryui/commit/8971b0e4dca6de0be282f6710ad5ceefb31e921a)]:
  - @dryui/ui@1.4.0
  - @dryui/primitives@1.4.0

## 9.0.0

### Patch Changes

- [`ff5ef41`](https://github.com/rob-balfre/dryui/commit/ff5ef412bba2f2f927dcc30d11d4d52324131e48) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Ship the unreleased April 17-18 work across the published packages.
  - `@dryui/primitives` + `@dryui/ui`: collapse Dialog/Drawer/AlertDialog into a shared `ModalContent` primitive, extract `escape`/`dismiss`/`menu-nav`/`anchored-popover` helpers and migrate 12 consumers, replace the `useThemeOverride` hook with a scoped `TokenScope` component, portal layered overlays so stacked modals nest cleanly, harden anchored positioning, pause offscreen border-beams, polish mega-menu, shimmer, and tabs surfaces, and align the Timeline (centred line on dots, line stretched across the gap, line-width offset baked into `line-left`, `Timeline.Root` no longer shadows consumer overrides for dot size, gap, and color, and dot numerals forced to sans).
  - `@dryui/feedback` + `@dryui/feedback-server`: add agent dispatch with toolbar picker, persistence, and bridge; restructure the detail view with a prompt-copy column and notes column; add Codex, Gemini CLI, Ghostty, and Windows (`wt.exe`) dispatch surfaces; refresh dashboard list/detail layout.
  - `@dryui/lint`: REVIEW.md hygiene wave — add the `!important` rule and a11y / `variantAttrs` / theme-semantics catalogue updates.
  - `@dryui/cli`: REVIEW.md hygiene wave — clean up `diagnose`, `doctor`, `lint`, `list`, `project-planner`, `review`, `tokens`, and `workspace-args` command surfaces, plus shared format helpers.
  - `@dryui/mcp`: regenerate the architecture / contract / spec / theme-token catalogues against the new component and lint surface.
  - `@dryui/theme-wizard`: tidy `WizardShell` against the REVIEW.md pass.

- Updated dependencies [[`ff5ef41`](https://github.com/rob-balfre/dryui/commit/ff5ef412bba2f2f927dcc30d11d4d52324131e48)]:
  - @dryui/primitives@1.3.0
  - @dryui/ui@1.3.0

## 8.0.1

### Patch Changes

- [`d246743`](https://github.com/rob-balfre/dryui/commit/d246743278e3f06203711baeb84717170f3ff723) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Fix two release-pipeline bugs that shipped broken tarballs to npm, and harden the pipeline so they can't recur.
  - `@dryui/feedback-server@0.3.2` through `@0.3.4` published with an empty `dist/`. `scripts/validate.ts` never built feedback-server, and `scripts/publish-packages.ts` trusted validate instead of running its own build. The CLI's `require.resolve('@dryui/feedback-server/server')` failed, surfacing as "Unable to locate a built feedback dashboard." validate now builds feedback-server alongside the other leaf packages.
  - `@dryui/theme-wizard@5.0.0` through `@8.0.0` published with `exports` pointing at `./src/*`, which isn't in the tarball (`files: ["dist"]`). Added `publishConfig.exports`/`svelte`/`types` targeting `./dist/*` and wired in the shared `prepack`/`postpack` export-swap scripts.
  - `scripts/publish-packages.ts` now runs `bun run build:packages` before `changeset publish`, then walks every publishable `package.json` and verifies that `main`, `types`, `bin`, `exports`, and `files` resolve to real, non-empty paths. `scripts/publish.ts` (manual path) runs the same verification before `npm publish`. Shared helper: `scripts/lib/verify-dist.ts`.

## 8.0.0

### Major Changes

- Ship the unreleased April 16 feature wave across the published packages.
  - `@dryui/cli`: rewrite `dryui setup` into an interactive TUI with arrow-key menus, a unified setup/feedback hub, and the new default no-arg TTY flow. Session-start context now stays on `dryui ambient` instead of the separate `dryui-ambient` bin.
  - `@dryui/primitives` + `@dryui/ui`: add the new `BorderBeam` component/export, add the `Slider` pill variant and `valueLabel` snippet prop, and tighten dialog/drawer scroll-lock behavior.
  - `@dryui/feedback` + `@dryui/feedback-server`: add scroll-vs-viewport drawing spaces so annotations stay aligned in more host layouts, and refresh the feedback dashboard list/detail UI.
  - `@dryui/theme-wizard`: add the Wireframe preset and persist `adjust` filter values through recipe URL encoding/decoding and saved wizard state.
  - `@dryui/lint` + `@dryui/mcp`: allow `/* dryui-allow width */` escape hatches for intentional width usage and refresh generated catalog/spec metadata for the new component and slider surface.

### Patch Changes

- Updated dependencies [[`66e3471`](https://github.com/rob-balfre/dryui/commit/66e3471d881d69a003119e2446dc863cc4e2f588)]:
  - @dryui/primitives@1.2.0
  - @dryui/ui@1.2.0

## 7.0.0

### Patch Changes

- Updated dependencies [[`b67f1dd`](https://github.com/rob-balfre/dryui/commit/b67f1dd0dadd98e31f888f2959250d799b095521)]:
  - @dryui/primitives@1.1.0
  - @dryui/ui@1.1.0

## 6.0.0

### Patch Changes

- Updated dependencies [[`313e94c`](https://github.com/rob-balfre/dryui/commit/313e94c3cd6dbcaa4924b51f365529078ed14d42), [`06e99c6`](https://github.com/rob-balfre/dryui/commit/06e99c612e40398b7febb8e1af938ec1bcd73a8e), [`d0ec666`](https://github.com/rob-balfre/dryui/commit/d0ec666287883253a9a31ff455483bc00cadc4bb), [`06e99c6`](https://github.com/rob-balfre/dryui/commit/06e99c612e40398b7febb8e1af938ec1bcd73a8e), [`5e900f5`](https://github.com/rob-balfre/dryui/commit/5e900f52e89bf204edbf540bba8b24a7ea1a0acb), [`313e94c`](https://github.com/rob-balfre/dryui/commit/313e94c3cd6dbcaa4924b51f365529078ed14d42)]:
  - @dryui/ui@1.0.0
  - @dryui/primitives@1.0.0

## 5.0.1

### Patch Changes

- Updated dependencies [[`79e4ab5`](https://github.com/rob-balfre/dryui/commit/79e4ab5740624fa6f2236c63367722314c3db210)]:
  - @dryui/primitives@0.5.1
  - @dryui/ui@0.5.1

## 5.0.0

### Patch Changes

- Updated dependencies [[`fa63bd3`](https://github.com/rob-balfre/dryui/commit/fa63bd3e027637b0b9e41f07fd52eaa1d4fafadf)]:
  - @dryui/ui@0.5.0

## 4.0.0

### Patch Changes

- Updated dependencies [[`67a4de9`](https://github.com/rob-balfre/dryui/commit/67a4de9e7c3812e65d1bb61bea6fcbaf1ed192bd)]:
  - @dryui/primitives@0.4.0
  - @dryui/ui@0.4.0

## 3.0.0

### Patch Changes

- Updated dependencies [[`533de8c`](https://github.com/rob-balfre/dryui/commit/533de8cbb1b8414122c2f0c4406ecd67694e3aa4)]:
  - @dryui/primitives@0.3.0
  - @dryui/ui@0.3.0

## 2.0.0

### Patch Changes

- Updated dependencies [[`2b501d2`](https://github.com/rob-balfre/dryui/commit/2b501d258f4f7397e0d5642d72d0867a407372a3)]:
  - @dryui/ui@0.2.0
  - @dryui/primitives@0.2.0

## 1.0.1

### Patch Changes

- Fix workspace:\* dependencies that broke npm installs

- Updated dependencies []:
  - @dryui/ui@0.1.1

## 1.0.0

### Patch Changes

- Updated dependencies [[`a3ced6e`](https://github.com/rob-balfre/dryui/commit/a3ced6ef72d256a07977b3803e9e9e5df881bfa2)]:
  - @dryui/primitives@0.1.0
  - @dryui/ui@0.1.0
