# @dryui/cli

## 0.18.0

### Minor Changes

- [#28](https://github.com/rob-balfre/dryui/pull/28) [`ed72d91`](https://github.com/rob-balfre/dryui/commit/ed72d91d5919fb00d24727ef438b0945dec84a4c) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Close the gap between the static linter and how UIs actually render. Two parallel tracks: structural component fixes that make four classes of design bugs impossible at the source, and a new vision-critique tool that catches the residue.

  **Components (`@dryui/ui`, `@dryui/primitives`)**
  - `Badge`: container switched from `inline-grid; place-items: center` to `inline-grid; grid-auto-flow: column; align-items: center; gap`. Children with both an `<Icon>` and a text node now sit inline instead of stacking icon-above-text. The icon-only fast path is unchanged.
  - `Badge`: now reads `variant`, `color`, and `size` from `PAGE_HEADER_META_CONTEXT` when no explicit value is passed, so consumers can hoist the variant decision to the row.
  - New `<Pluralize count={n} singular="hotel" plural="hotels" />` (or shorthand `noun="pax"`). Renders with `tabular-nums` + `nowrap`. Eliminates `1 hotels` mismatches at the source.
  - New `<RefId>` (optional `prefix` prop). Wraps reference IDs in `nowrap` + tabular-nums + monospace so tokens like `BA-3490221` never break mid-token.
  - `PageHeader.Meta` accepts optional `variant` / `color` / `size` props that propagate to descendant `Badge` instances via context. Also enforces a wrapping chip flow row at the layout level.

  **Lint rules (`@dryui/lint`)**
  - `polish/badge-plural-mismatch`: flags `{count} word` patterns inside `<Badge>` that risk plural mismatch; suggests `<Pluralize>`.
  - `polish/page-header-meta-mixed-variants`: flags `<PageHeader.Meta>` rows that mix Badge variants without a parent variant; suggests hoisting the variant.
  - `polish/raw-ref-id-needs-wrap`: flags raw `[A-Z]{2,4}-\d{5,}` literals not wrapped in `<RefId>`.

  **Vision-critique tool (`@dryui/mcp`, `@dryui/cli`)**
  - New MCP tool `check-vision` and CLI subcommand `dryui check-vision <url>`. Renders the URL in headless Chromium, screenshots it, and sends the PNG plus a taste rubric (chip wrap, plural mismatch, variant mix, mid-token break, contrast, alignment, orphan, spacing rhythm) to the Codex CLI. Returns TOON findings + JSON.
  - Requires the Codex CLI on PATH and an authenticated Codex session.
  - `@dryui/mcp` reviewer's `prefer-grid-layout` rule now respects the same `[data-chip-group]` selector carve-out and `/* dryui-allow flex */` per-declaration opt-out that `@dryui/lint`'s `dryui/no-flex` already honors, so the two surfaces agree.

  The static linter has a hard ceiling: it cannot see runtime wrap, plural agreement, contrast against live data, or alignment drift. This pair (component-layer impossibility + VLM critique) covers the gap.

### Patch Changes

- [#29](https://github.com/rob-balfre/dryui/pull/29) [`c3550b4`](https://github.com/rob-balfre/dryui/commit/c3550b4a3c8ff235f4988bb3efa6dc3bee85a4e5) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Address the main-branch review findings across security, SSR stability, generated artifact hygiene, docs deployment, and tooling validation.

  Rename the MarkdownRenderer raw HTML opt-out from `sanitize={false}` to the explicit `dangerouslyAllowRawHtml` prop, harden local feedback server request boundaries, sanitize rich text editor HTML, move component IDs to Svelte SSR-safe IDs, and tighten DateField and drag preview cleanup.

  Also stabilize package declaration cleanup, generated artifact drift checks, docs static output and component manifests, MCP reviewer/theme diagnostics, CLI setup/install behavior, feedback page identity, and docs demo coverage.

- Updated dependencies [[`ed72d91`](https://github.com/rob-balfre/dryui/commit/ed72d91d5919fb00d24727ef438b0945dec84a4c), [`c3550b4`](https://github.com/rob-balfre/dryui/commit/c3550b4a3c8ff235f4988bb3efa6dc3bee85a4e5)]:
  - @dryui/mcp@2.6.0
  - @dryui/feedback-server@0.8.2

## 0.17.2

### Patch Changes

- [`f32e64a`](https://github.com/rob-balfre/dryui/commit/f32e64a115b78b5d4af45d538e39e471d1bdec30) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Kill peer server PIDs when one side of the launcher rejects so failed startups do not leave orphaned background processes.

  `dryui` and `dryui dev` start two servers in parallel (feedback + docs, or feedback + user dev server). Previously a rejection on one side left the other side's spawned PID running after the command exited. The launcher now awaits both promises, and if either rejects, the owned PIDs of any fulfilled peers are passed to `killOwnedProcess` before the error is rethrown.

- Updated dependencies [[`e1b4091`](https://github.com/rob-balfre/dryui/commit/e1b4091d641048b4db8844c3956da59c74fad9e6), [`954fcab`](https://github.com/rob-balfre/dryui/commit/954fcab90d767b79261e384e8185fdd9a2907616), [`e96430c`](https://github.com/rob-balfre/dryui/commit/e96430c92b64009042fcc49ec02cf46363267a77), [`0a51dd8`](https://github.com/rob-balfre/dryui/commit/0a51dd88a3cdd645f73fde30e0e39d002433bc95)]:
  - @dryui/mcp@2.4.0
  - @dryui/feedback-server@0.8.0

## 0.17.1

### Patch Changes

- [`54d061d`](https://github.com/rob-balfre/dryui/commit/54d061d19c464d9ea45f1ed46d2c92495da59a47) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Add generated agent contract artifacts and a minimal `dryui prompt --component` command.

- Updated dependencies [[`54d061d`](https://github.com/rob-balfre/dryui/commit/54d061d19c464d9ea45f1ed46d2c92495da59a47)]:
  - @dryui/mcp@2.3.1

## 0.17.0

### Minor Changes

- [`0b4a533`](https://github.com/rob-balfre/dryui/commit/0b4a5335e03a6cdb153f65187df7f7fae690d981) Thanks [@rob-balfre](https://github.com/rob-balfre)! - `dryui init` gains `--no-feedback` to skip installing `@dryui/feedback`, mounting `<Feedback />` in the root layout, and patching `vite.config`. Useful for CI scaffolds, library starters, or projects that want to opt in later.

  The scaffolded `+layout.svelte` now imports `@dryui/ui/themes/default.css` and `@dryui/ui/themes/dark.css` BEFORE `../app.css`. The previous order silently let the theme defaults clobber any `--dry-*` token overrides in `app.css`, so token customisations appeared to do nothing. Existing scaffolds are unaffected; new scaffolds get the correct order at write-time.

### Patch Changes

- Updated dependencies [[`f16e759`](https://github.com/rob-balfre/dryui/commit/f16e7598da88d5d4ddf313c27c3db1b822dad596)]:
  - @dryui/mcp@2.3.0

## 0.16.1

### Patch Changes

- [`4935108`](https://github.com/rob-balfre/dryui/commit/49351088643822ca03e4000afddd7f6e3320ed73) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Starting a feedback session from a directory with no Svelte/SvelteKit project no longer crashes when the descendant project walk hits an unreadable folder (e.g. `~/.Trash` on macOS). The walker skips inaccessible directories, and the interactive feedback menu now shows a brief notice explaining why the dev server was not auto-started before falling back to the dashboard-only URL.

- Updated dependencies [[`4935108`](https://github.com/rob-balfre/dryui/commit/49351088643822ca03e4000afddd7f6e3320ed73)]:
  - @dryui/mcp@2.2.7

## 0.16.0

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

### Patch Changes

- Updated dependencies [[`cadae39`](https://github.com/rob-balfre/dryui/commit/cadae393c5215c877f021fd46b2a8b2b38e1c089)]:
  - @dryui/feedback-server@0.7.0

## 0.15.2

### Patch Changes

- [`b6213cb`](https://github.com/rob-balfre/dryui/commit/b6213cb21b57b863d2ae5710a57826ad7a971baa) Thanks [@rob-balfre](https://github.com/rob-balfre)! - `dryui` now opens the dev site with `?dryui-feedback=1` so the Feedback component starts in annotation mode, and submitting feedback opens the dashboard in a named tab focused on the new submission (`?focus=<id>`). The inline agent picker in the toolbar has been removed; pick which agent to launch per submission from the dashboard instead. `@dryui/feedback-server` now re-exports `normalizeDevUrl`.

- Updated dependencies [[`b6213cb`](https://github.com/rob-balfre/dryui/commit/b6213cb21b57b863d2ae5710a57826ad7a971baa)]:
  - @dryui/feedback-server@0.6.6

## 0.15.1

### Patch Changes

- [`0ff075c`](https://github.com/rob-balfre/dryui/commit/0ff075c34ac266f03cef34b9ef3a8f6be0f6c740) Thanks [@rob-balfre](https://github.com/rob-balfre)! - `dryui setup` no longer repeats the Current workspace and Agents tables above every interactive prompt. The header now appears only when the user picks the "Detect current project setup" menu item.

## 0.15.0

### Minor Changes

- [`11237c0`](https://github.com/rob-balfre/dryui/commit/11237c056147c06b9e74f4109ddd592dd33fb3c6) Thanks [@rob-balfre](https://github.com/rob-balfre)! - `dryui init` now wires `@dryui/feedback` into the scaffolded project (install, mount `<Feedback />` in the root layout, patch `vite.config` `ssr.noExternal`) and offers to launch the feedback dashboard in a TTY. Pass `--no-launch` to skip the prompt.

## 0.14.1

### Patch Changes

- [`2afee28`](https://github.com/rob-balfre/dryui/commit/2afee28ba3888b9e961098209226236738d5ac1e) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Anchor `dryui init <path>` to the explicit target so it no longer walks up into a parent workspace's `package.json`, and surface a richer feedback submit flow (`waiting-for-capture` / `capturing` / `uploading`) with clearer cancel and unavailable-API messages.

  Also tightens the MCP reviewer's `theme-in-style` check to flag only real `--dry-*` declarations (skipping comments and token consumption) and report the correct source line, refines the matching lint message, adds a `suggestedFix` for it, parses multi-line interface props in the spec generator, adds subpath `publishConfig.exports` for `@dryui/mcp`, and bumps toolchain deps (svelte, typescript, vite, wrangler, bun-types, vitest, mapbox-gl).

- Updated dependencies [[`2afee28`](https://github.com/rob-balfre/dryui/commit/2afee28ba3888b9e961098209226236738d5ac1e)]:
  - @dryui/feedback-server@0.6.4
  - @dryui/mcp@2.2.6

## 0.14.0

### Minor Changes

- [`9580c51`](https://github.com/rob-balfre/dryui/commit/9580c51aafd1259a75be8f462342694baf7b5394) Thanks [@rob-balfre](https://github.com/rob-balfre)! - `dryui setup --editor copilot --install` now writes `.mcp.json` at the project root (with the `mcpServers` key) instead of `.vscode/mcp.json` (with the `servers` key). GitHub Copilot CLI 1.x removed `.vscode/mcp.json` support and moved workspace MCP config to `.mcp.json` (same shape as Claude Code's `.mcp.json`), so the old installer silently stopped wiring Copilot CLI. The installer also now registers `dryui-feedback` alongside `dryui`, which had been missing from the Copilot target entirely.

  The agent status probe was updated to check, in order: project `.mcp.json`, `~/.copilot/mcp-config.json` (Copilot CLI user config), and legacy `.vscode/mcp.json`. Existing VS Code Copilot extension users with `.vscode/mcp.json` continue to be detected. The Copilot setup guide text now reflects the new location.

- [`9580c51`](https://github.com/rob-balfre/dryui/commit/9580c51aafd1259a75be8f462342694baf7b5394) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Gemini CLI is now auto-installable via `dryui setup --editor gemini --install` — it merges both `dryui` and `dryui-feedback` MCP servers into `~/.gemini/settings.json`, preserving other keys. Previously `setup` only printed manual instructions for Gemini, so users who went the manual route before the extension existed often ended up with only `dryui` registered and silent feedback failures when the browser feedback flow tried to call `feedback_get_submissions`.

  The agent status probe now also:
  - detects a Gemini extension installed via `gemini extensions install <path>` by scanning `~/.gemini/extensions/*/gemini-extension.json` for `name: "dryui"` (reports `source: 'plugin'` or `'mixed'` instead of `'none'`);
  - tracks whether `dryui-feedback` is wired alongside `dryui` for every editor, surfaces it as a new `feedback` column in the Agents table and a `(no feedback)` tag in the text summary when the feedback server is missing.

### Patch Changes

- Updated dependencies [[`9580c51`](https://github.com/rob-balfre/dryui/commit/9580c51aafd1259a75be8f462342694baf7b5394)]:
  - @dryui/feedback-server@0.6.2

## 0.13.3

### Patch Changes

- [`49fa611`](https://github.com/rob-balfre/dryui/commit/49fa6116ebc9570b830e80b2df9529643a8219e2) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Internal cleanup across the workspace: un-export symbols only consumed
  inside their own module, modernize RegExp iteration to `str.matchAll`,
  and drop unused dev dependencies (puppeteer, pixelmatch, pngjs,
  lucide-svelte, adapter-static). No public API changes for documented
  entry points.
- Updated dependencies [[`49fa611`](https://github.com/rob-balfre/dryui/commit/49fa6116ebc9570b830e80b2df9529643a8219e2)]:
  - @dryui/feedback-server@0.6.1
  - @dryui/mcp@2.2.4

## 0.13.2

### Patch Changes

- Updated dependencies [[`ddfdd05`](https://github.com/rob-balfre/dryui/commit/ddfdd051b32d0a2b312cd3b049e067c18ac8f188), [`ddfdd05`](https://github.com/rob-balfre/dryui/commit/ddfdd051b32d0a2b312cd3b049e067c18ac8f188)]:
  - @dryui/feedback-server@0.6.0
  - @dryui/mcp@2.2.3

## 0.13.1

### Patch Changes

- Updated dependencies [[`8ed5d42`](https://github.com/rob-balfre/dryui/commit/8ed5d426243f109804ea0586ff031c3672708672), [`a91a0fe`](https://github.com/rob-balfre/dryui/commit/a91a0fe0b5fbe134c30031eb4fa6fa043fb36e49), [`3ae293a`](https://github.com/rob-balfre/dryui/commit/3ae293a0b691e773b35154caa9b2a915a4c58487)]:
  - @dryui/feedback-server@0.5.0
  - @dryui/mcp@2.2.2

## 0.13.0

### Minor Changes

- [`8e4aeba`](https://github.com/rob-balfre/dryui/commit/8e4aeba80edc2dd5597895cc70bb94a26494d97c) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Add first-class support for the official Svelte MCP (`@sveltejs/mcp`) as a recommended companion.
  - `dryui setup --install` now also registers `@sveltejs/mcp` alongside the DryUI servers for Copilot, Cursor, OpenCode, Windsurf, and Zed. Pass `--no-svelte-mcp` to opt out.
  - Interactive `dryui setup` asks before writing the svelte server to the MCP config (default yes) and surfaces `svelte-mcp: registered for …` in the menu status.
  - Each printed `dryui setup --editor <id>` guide now includes a "Svelte MCP (recommended companion)" section with the paste-in snippet for editors where auto-install is not supported (Claude Code, Codex, Gemini CLI).
  - The DryUI skill gains a new rule directing agents to use `svelte-autofixer` / `get-documentation` from `@sveltejs/mcp` for Svelte 5 and SvelteKit questions, keeping DryUI focused on component APIs.
  - Docs getting-started page renders a new companion block per agent with the exact snippet for that tool's config file.

### Patch Changes

- [`8e4aeba`](https://github.com/rob-balfre/dryui/commit/8e4aeba80edc2dd5597895cc70bb94a26494d97c) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Fix `dryui` feedback setup on fresh projects: the CLI now also ensures the `lucide-svelte` peer dependency of `@dryui/feedback` is installed and added to `ssr.noExternal` in `vite.config.ts`. Without this, a fresh SvelteKit project would 500 on every SSR request with `Cannot find module '…/lucide-svelte/dist/icons/index'` once the Feedback widget was mounted.

  Also surface actual dev server errors in the CLI output instead of reporting a generic `skipped (dev server did not respond within 30s)` timeout. When the user's dev server returns 5xx, the CLI now reports the HTTP status and the error summary extracted from the response body. When the dev server never binds the port, the transport error is shown. Dev server stdout/stderr is captured to a temp log file and the tail plus the log path are included in the output so you can diagnose what went wrong without re-running anything.

- Updated dependencies [[`8e4aeba`](https://github.com/rob-balfre/dryui/commit/8e4aeba80edc2dd5597895cc70bb94a26494d97c)]:
  - @dryui/mcp@2.2.1

## 0.12.1

### Patch Changes

- [`ea01d9d`](https://github.com/rob-balfre/dryui/commit/ea01d9d567dcf3ddd5ede903671c70081bde5514) Thanks [@rob-balfre](https://github.com/rob-balfre)! - - `@dryui/cli` feedback auto-setup: when a SvelteKit app has no `vite.config.(ts|js|mts|mjs)` at all, the CLI now writes a minimal one (with `ssr.noExternal: ['@dryui/feedback']`) instead of silently skipping the patch step. Previously the check quietly reported "patched" when no config existed, which left the app without the SSR exclusion and the feedback widget failing on first run.

## 0.12.0

### Minor Changes

- [`d3fe9cf`](https://github.com/rob-balfre/dryui/commit/d3fe9cf724c383231bd8997ab0a387b2f775c342) Thanks [@rob-balfre](https://github.com/rob-balfre)! - - `dryui setup` can now run editor installs instead of only printing them. After the printed guide, the interactive flow asks "Install for me now?" and there is a non-interactive `dryui setup --editor <id> --install` for scripts. The installer pulls the DryUI skill into the editor's expected folder via `npx degit --force` and merges the canonical MCP server block into the editor's JSON config (preserving any other servers and unrelated keys). Auto-install is wired for `copilot`, `cursor`, `opencode`, `windsurf`, and `zed`. `claude-code` and `codex` keep their guide-only flow because their canonical install requires an interactive `/plugins` session in the editor itself; `claude-code`'s existing optional `dryui install-hook` step is unchanged.

## 0.11.0

### Minor Changes

- [`d9aaeb3`](https://github.com/rob-balfre/dryui/commit/d9aaeb31ee2e12bbb50d06b3d84dfcbfbd7f9d5d) Thanks [@rob-balfre](https://github.com/rob-balfre)! - - `@dryui/cli` feedback session: the auto-setup prompt now also detects whether `@dryui/feedback` is listed in `vite.config.(ts|js|mts|mjs)` under `ssr.noExternal`. If it isn't, the CLI offers to patch the config alongside the install and mount steps. Without this, SvelteKit SSR externalises `@dryui/feedback` and Node chokes on the raw `.svelte` files in the package's `dist/`. The patcher handles the three common config shapes: existing `noExternal` array, existing `ssr` block, and bare `defineConfig({ ... })` / `export default { ... }`. Unusual shapes (functional configs, regex `noExternal`) fall through to a manual-patch note.

## 0.10.0

### Minor Changes

- [`2d227f1`](https://github.com/rob-balfre/dryui/commit/2d227f1e981361bc34a12e1554430435e03a4df4) Thanks [@rob-balfre](https://github.com/rob-balfre)! - - `@dryui/cli` feedback session: when `@dryui/feedback` is missing or not mounted, the interactive menu now asks to install the package and inject `<Feedback serverUrl="http://127.0.0.1:4748" />` into the root `src/routes/+layout.svelte` automatically. Non-TTY callers continue to receive the existing warning. The edit is idempotent, creates a `<script lang="ts">` block if one is missing, and does not create a layout file if the project has none.

## 0.9.0

### Minor Changes

- [`c5010c5`](https://github.com/rob-balfre/dryui/commit/c5010c5925639d8851956b5aaa1e1f5402c3408d) Thanks [@rob-balfre](https://github.com/rob-balfre)! - - `@dryui/mcp` project detection: `ProjectDetection` now reports `dependencies.feedback` and `feedback.layoutPath` (path of the first `+layout.svelte` under `src/routes/` that imports `@dryui/feedback`). Detection is gated on the package being installed and the layout search depth is capped at two levels to cover grouped routes without walking the full tree.
  - `@dryui/cli` feedback session: when the user-project launcher opens the dashboard, it now emits a `Feedback widget:` note if `@dryui/feedback` is not installed or the `<Feedback />` component is not mounted in any layout. The launch still proceeds so the dashboard stays useful for reviewing submission history.

### Patch Changes

- Updated dependencies [[`c5010c5`](https://github.com/rob-balfre/dryui/commit/c5010c5925639d8851956b5aaa1e1f5402c3408d)]:
  - @dryui/mcp@2.2.0

## 0.8.0

### Minor Changes

- [`68da473`](https://github.com/rob-balfre/dryui/commit/68da473840519a6911d63395ba71998514a860a3) Thanks [@rob-balfre](https://github.com/rob-balfre)! - - `@dryui/cli` feedback session: detect the user's own DryUI project, offer to kill the port 5173 holder, spawn its dev server in the background, and point the feedback dashboard at it alongside the feedback server. Non-TTY callers skip the kill prompt and fall back to the original docs-monorepo flow.

## 0.7.2

### Patch Changes

- [`ff5ef41`](https://github.com/rob-balfre/dryui/commit/ff5ef412bba2f2f927dcc30d11d4d52324131e48) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Ship the unreleased April 17-18 work across the published packages.
  - `@dryui/primitives` + `@dryui/ui`: collapse Dialog/Drawer/AlertDialog into a shared `ModalContent` primitive, extract `escape`/`dismiss`/`menu-nav`/`anchored-popover` helpers and migrate 12 consumers, replace the `useThemeOverride` hook with a scoped `TokenScope` component, portal layered overlays so stacked modals nest cleanly, harden anchored positioning, pause offscreen border-beams, polish mega-menu, shimmer, and tabs surfaces, and align the Timeline (centred line on dots, line stretched across the gap, line-width offset baked into `line-left`, `Timeline.Root` no longer shadows consumer overrides for dot size, gap, and color, and dot numerals forced to sans).
  - `@dryui/feedback` + `@dryui/feedback-server`: add agent dispatch with toolbar picker, persistence, and bridge; restructure the detail view with a prompt-copy column and notes column; add Codex, Gemini CLI, Ghostty, and Windows (`wt.exe`) dispatch surfaces; refresh dashboard list/detail layout.
  - `@dryui/lint`: REVIEW.md hygiene wave — add the `!important` rule and a11y / `variantAttrs` / theme-semantics catalogue updates.
  - `@dryui/cli`: REVIEW.md hygiene wave — clean up `diagnose`, `doctor`, `lint`, `list`, `project-planner`, `review`, `tokens`, and `workspace-args` command surfaces, plus shared format helpers.
  - `@dryui/mcp`: regenerate the architecture / contract / spec / theme-token catalogues against the new component and lint surface.
  - `@dryui/theme-wizard`: tidy `WizardShell` against the REVIEW.md pass.

- Updated dependencies [[`ff5ef41`](https://github.com/rob-balfre/dryui/commit/ff5ef412bba2f2f927dcc30d11d4d52324131e48)]:
  - @dryui/feedback-server@0.4.0
  - @dryui/mcp@2.1.4

## 0.7.1

### Patch Changes

- [`3930288`](https://github.com/rob-balfre/dryui/commit/3930288c5cc89ed8cba1abbdf1d8ad3b06b8440e) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Bump the CLI so `bun install -g @dryui/cli@latest` forces bun to re-resolve transitive deps. Existing `@dryui/cli@0.7.0` globals carry a cached `@dryui/feedback-server@0.3.3`/`0.3.4` (both shipped empty `dist/`), and bun won't refresh transitives when the top-level version is unchanged. Also pins the minimum `@dryui/feedback-server` to `^0.3.5` so fresh installs can't fall into the same hole.

## 0.7.0

### Minor Changes

- Ship the unreleased April 16 feature wave across the published packages.
  - `@dryui/cli`: rewrite `dryui setup` into an interactive TUI with arrow-key menus, a unified setup/feedback hub, and the new default no-arg TTY flow. Session-start context now stays on `dryui ambient` instead of the separate `dryui-ambient` bin.
  - `@dryui/primitives` + `@dryui/ui`: add the new `BorderBeam` component/export, add the `Slider` pill variant and `valueLabel` snippet prop, and tighten dialog/drawer scroll-lock behavior.
  - `@dryui/feedback` + `@dryui/feedback-server`: add scroll-vs-viewport drawing spaces so annotations stay aligned in more host layouts, and refresh the feedback dashboard list/detail UI.
  - `@dryui/theme-wizard`: add the Wireframe preset and persist `adjust` filter values through recipe URL encoding/decoding and saved wizard state.
  - `@dryui/lint` + `@dryui/mcp`: allow `/* dryui-allow width */` escape hatches for intentional width usage and refresh generated catalog/spec metadata for the new component and slider surface.

### Patch Changes

- Updated dependencies []:
  - @dryui/feedback-server@0.3.3
  - @dryui/mcp@2.1.3

## 0.6.1

### Patch Changes

- [`9ec102f`](https://github.com/rob-balfre/dryui/commit/9ec102f597c1ecd5cd82432f887c61f789d4a9b8) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Hook into Codex marketplace (0.121.0+) so the install flow mirrors Claude Code: `codex marketplace add rob-balfre/dryui`. Update setup guides, llms.txt, and skill docs with the new command.

- Updated dependencies [[`9ec102f`](https://github.com/rob-balfre/dryui/commit/9ec102f597c1ecd5cd82432f887c61f789d4a9b8)]:
  - @dryui/mcp@2.1.2

## 0.6.0

### Minor Changes

- [`e27993e`](https://github.com/rob-balfre/dryui/commit/e27993e4c4307f64cde953a33e055b142392d047) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Added `dryui setup`, an interactive onboarding flow that walks through editor integration (Claude Code, Codex, Copilot, Cursor, Windsurf, Zed) and the optional Claude SessionStart hook, and can open feedback tooling at the end. Bare `dryui` now opens the same flow when run outside a DryUI project on a TTY, while still printing the project dashboard inside DryUI projects and the feedback launcher inside the monorepo. Per-editor snippets are shared between the CLI guide and the docs setup data. The MCP `ai-surface` manifest, `spec.json`, and `contract.v1.json` advertise the new `setup` command, and shared CLI helpers (`hasFlag`, `getFlag`, `isInteractiveTTY`) moved into `run.ts` so feedback, launcher, install-hook, and setup share one parser.

### Patch Changes

- [`e27993e`](https://github.com/rob-balfre/dryui/commit/e27993e4c4307f64cde953a33e055b142392d047) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Feedback dashboard screenshots are now rendered as a thumbnail that opens a full-resolution Dialog with the original capture, viewport metadata, and a link out to the page. The dashboard reads its `?dev=` target through a shared `normalizeDevUrl` helper that always pins `?dryui-feedback=1` on the dev app URL, and the CLI launcher (`dryui` / `dryui feedback ui`) now constructs the dashboard URL with the same flag so the docs site only mounts the feedback overlay when the dashboard hands off to it.

- Updated dependencies [[`e27993e`](https://github.com/rob-balfre/dryui/commit/e27993e4c4307f64cde953a33e055b142392d047), [`e27993e`](https://github.com/rob-balfre/dryui/commit/e27993e4c4307f64cde953a33e055b142392d047), [`e27993e`](https://github.com/rob-balfre/dryui/commit/e27993e4c4307f64cde953a33e055b142392d047)]:
  - @dryui/mcp@2.1.1
  - @dryui/feedback-server@0.3.2

## 0.5.3

### Patch Changes

- [`b108f15`](https://github.com/rob-balfre/dryui/commit/b108f150d2151b2251ba76bb19d81a61c377e3c0) Thanks [@rob-balfre](https://github.com/rob-balfre)! - `dryui detect` (ambient command) now imports the spec and project-planner through the `@dryui/mcp` package exports instead of relative source paths, so the published CLI no longer depends on the repo layout to load detection metadata.

- Updated dependencies [[`7ad699c`](https://github.com/rob-balfre/dryui/commit/7ad699c581e2d9c7c4e2004ead841e6b6932e2fc)]:
  - @dryui/mcp@2.1.0

## 0.5.2

### Patch Changes

- [`b61f462`](https://github.com/rob-balfre/dryui/commit/b61f462239c87eb7633430637ea29ff766691715) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Collapse the DryUI MCP runtime surface from the old multi-tool menu to two tools: `ask` and `check`.

  MCP migration:
  - `info <Name>` → `ask --scope component "<Name>"`
  - `list` → `ask --scope list ""`
  - `tokens` → `ask --scope list "" --kind token`
  - `compose "<query>"` → `ask --scope recipe "<query>"`
  - `detect_project` → `ask --scope setup ""`
  - `plan_install` → `ask --scope setup ""`
  - `plan_add <Name>` → `ask --scope component "<Name>"`
  - `review file.svelte` → `check file.svelte`
  - `diagnose theme.css` → `check theme.css`
  - `doctor` → `check`
  - `lint` → `check`
  - `get` remains a CLI command only; it was never a real MCP tool

  `@dryui/lint` now exports a shared `./rule-catalog` surface so the lint preprocessor, reviewer, and theme checker use the same rule metadata.

  `@dryui/plugin` inherits the new MCP surface from `@dryui/mcp`; no plugin manifest schema changed.

  `@dryui/cli` keeps its existing targeted commands and only changes its internal metadata wiring.

  Robustness fixes shipped alongside the collapse:
  - `ask --scope component "<Name>"` now returns anti-patterns for the exact component only. Previously it fuzzy-matched through `searchComposition` and flattened anti-patterns from every match, so `ask Button` surfaced guidance about `<select>`, `<input type="range">`, and other unrelated components.
  - Both `ask` and `check` MCP tools now accept an optional `cwd` parameter. Setup plans and component install plans resolve against that directory instead of the MCP server's process cwd, so monorepo targeting no longer points agents at the wrong workspace.
  - The `dryui-ask` and `dryui-check` MCP prompts now return `StructuredToolError` payloads as TOON text in the assistant message instead of throwing through the transport, matching the tool handlers.
  - The collapsed tools reuse TOON render helpers from `packages/mcp/src/toon.ts` (exported `esc`, `header`, `row`, `truncateField`) rather than maintaining local copies. The local `row()` implementations were also missing comma escaping, which would have silently broken TOON parsing on any message containing a comma.
  - `reviewer.ts` now strips `<script>`/`<style>` blocks and builds line offsets once per review instead of six times.
  - `theme-checker.ts` strips CSS comments once per diagnosis instead of twice.
  - `@dryui/lint`'s banned-layout-component regex is now precompiled (runs on every Svelte file in dev), and `formatRuleText` short-circuits templates that have no `{placeholder}`.

- Updated dependencies [[`b61f462`](https://github.com/rob-balfre/dryui/commit/b61f462239c87eb7633430637ea29ff766691715)]:
  - @dryui/mcp@2.0.0

## 0.5.1

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

- Updated dependencies [[`d76f9f4`](https://github.com/rob-balfre/dryui/commit/d76f9f4e530c8413431b781f7c1c73720106027b)]:
  - @dryui/feedback-server@0.3.1

## 0.5.0

### Minor Changes

- [`5049f55`](https://github.com/rob-balfre/dryui/commit/5049f553f31dd68b110e922c192e3d1a10ded154) Thanks [@rob-balfre](https://github.com/rob-balfre)! - - `@dryui/cli`: Adds `dryui launcher` (the default no-arg command inside the repo) for opening the feedback dashboard and `dryui feedback ui` / `dryui feedback-ui-build` for building and serving it. Shared launch helpers deduped into `launch-utils.ts`.
  - `@dryui/feedback-server`: Ships a new Vite-built Svelte dashboard UI and launcher page served directly by the HTTP server, with supporting endpoints and store/client updates.
  - `@dryui/mcp`: Adds an `interactive-card-wrapper` reviewer rule plus minor tweaks to `architecture.ts` and `utils.ts`.
  - `@dryui/ui`: `AccordionButtonTrigger` now sets `--dry-btn-justify="space-between"` and `--dry-btn-radius="0"` so the chevron sits flush-right and the trigger aligns cleanly with its panel.

### Patch Changes

- Updated dependencies [[`5049f55`](https://github.com/rob-balfre/dryui/commit/5049f553f31dd68b110e922c192e3d1a10ded154)]:
  - @dryui/feedback-server@0.3.0
  - @dryui/mcp@1.0.3

## 0.4.4

### Patch Changes

- [#13](https://github.com/rob-balfre/dryui/pull/13) [`6f60494`](https://github.com/rob-balfre/dryui/commit/6f604949c14692885ef9b3b3487ebae2af8c17f9) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Fix `@dryui/cli install --json` failing with `ENOENT: ../@dryui/ui/src/themes/default.css`
  in published builds. The theme token registry is now generated at build time into
  `theme-tokens.generated.json` and bundled with `@dryui/mcp`, so the CLI no longer
  tries to read CSS files from `@dryui/ui`'s source tree (which is not shipped with
  the published tarball).
- Updated dependencies [[`6f60494`](https://github.com/rob-balfre/dryui/commit/6f604949c14692885ef9b3b3487ebae2af8c17f9)]:
  - @dryui/mcp@1.0.1

## 0.4.3

### Patch Changes

- Updated dependencies [[`313e94c`](https://github.com/rob-balfre/dryui/commit/313e94c3cd6dbcaa4924b51f365529078ed14d42)]:
  - @dryui/mcp@1.0.0

## 0.4.2

### Patch Changes

- Updated dependencies [[`fa63bd3`](https://github.com/rob-balfre/dryui/commit/fa63bd3e027637b0b9e41f07fd52eaa1d4fafadf)]:
  - @dryui/mcp@0.5.0

## 0.4.1

### Patch Changes

- Updated dependencies []:
  - @dryui/feedback-server@0.2.0

## 0.4.0

### Minor Changes

- [`2b501d2`](https://github.com/rob-balfre/dryui/commit/2b501d258f4f7397e0d5642d72d0867a407372a3) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Review-driven improvements from dogfooding a flight search app.

  **@dryui/ui**
  - Add `LogoMark` component for brand marks, status indicators, and category badges
  - Add `options` prop shorthand to `Select.Root` for simple dropdowns (`<Select.Root options={['A','B']} />`)

  **@dryui/primitives**
  - Add `options` and `placeholder` props to `SelectRootProps`

  **@dryui/mcp**
  - Add `tokens` tool for `--dry-*` CSS token discovery with category filtering
  - Batch-friendly `info` tool — accepts comma-separated component names
  - Smarter `prefer-grid-layout` reviewer suggestion — suppresses for complex grids (>3 tracks, named areas, subgrid, minmax, repeat)
  - Add `aligned-card-list` composition recipe (CSS subgrid pattern)

  **@dryui/cli**
  - Add `tokens` command for `--dry-*` CSS token listing
  - Batch-friendly `info` command — accepts comma-separated names

  **@dryui/lint**
  - Allow `display: inline-flex` (no longer flagged by `dryui/no-flex`)
  - Add `/* dryui-allow flex */` comment to suppress flex violations per declaration

### Patch Changes

- Updated dependencies [[`2b501d2`](https://github.com/rob-balfre/dryui/commit/2b501d258f4f7397e0d5642d72d0867a407372a3)]:
  - @dryui/mcp@0.4.0

## 0.3.0

### Minor Changes

- [`1d85a8b`](https://github.com/rob-balfre/dryui/commit/1d85a8b0ecec8242d97b686edf697765591bfd7b) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Enhanced `dryui init` to bootstrap SvelteKit + DryUI projects from scratch. Works for greenfield, brownfield, and existing SvelteKit projects. The MCP `plan_install` tool now returns scaffold steps instead of blocking for unsupported projects.

### Patch Changes

- Updated dependencies [[`1d85a8b`](https://github.com/rob-balfre/dryui/commit/1d85a8b0ecec8242d97b686edf697765591bfd7b)]:
  - @dryui/mcp@0.3.0

## 0.2.0

### Minor Changes

- [`79e3d4c`](https://github.com/rob-balfre/dryui/commit/79e3d4cc7f4cd67272042f4007f2acbc3271b537) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Add AXI-inspired TOON output format for agent-optimized tool responses
  - New TOON (Token-Optimized Output) format: ~40% fewer tokens than JSON for all MCP tool output
  - CLI: --toon and --full flags on all commands (info, list, compose, review, diagnose, doctor, lint, detect, install)
  - Content truncation: compose snippets, workspace findings, component examples capped with hints
  - Pre-computed aggregates: hasBlockers, autoFixable (review), coverage % (diagnose), top-rule (workspace)
  - Contextual next-step suggestions appended to every response
  - Definitive empty states: issues[0]: clean, findings[0]: clean
  - Structured errors with suggestions for agent consumption
  - Content-first no-arg: `dryui` with no args shows project status in DryUI projects
  - Ambient context hook (packages/cli/src/ambient.ts) for Claude Code session integration
  - New shared module: composition-search.ts (extracted duplicated search logic from MCP and CLI)

### Patch Changes

- Updated dependencies [[`79e3d4c`](https://github.com/rob-balfre/dryui/commit/79e3d4cc7f4cd67272042f4007f2acbc3271b537)]:
  - @dryui/mcp@0.2.0

## 0.1.2

### Patch Changes

- fix(mcp): improve install plan snippets for LLM reliability
  - Root layout create-file step now includes `{@render children()}` so pages render
  - Edit-file descriptions are prescriptive: specify where to insert and how to merge
  - app.html snippet includes example with preserved lang attribute
  - Theme import snippet tells LLMs to add to existing `<script>` block, not create a duplicate

- Updated dependencies []:
  - @dryui/mcp@0.1.3

## 0.1.1

### Patch Changes

- Fix workspace:\* dependencies that broke npm installs

## 0.1.0

### Minor Changes

- [`58379a3`](https://github.com/rob-balfre/dryui/commit/58379a3e5667552da988cceed3415c25f8716e8c) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Initial public release of @dryui/mcp, @dryui/feedback-server, and @dryui/cli

### Patch Changes

- Updated dependencies [[`58379a3`](https://github.com/rob-balfre/dryui/commit/58379a3e5667552da988cceed3415c25f8716e8c)]:
  - @dryui/mcp@0.1.0
  - @dryui/feedback-server@0.1.0
