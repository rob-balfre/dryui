---
name: dryui-init
description: 'Bootstrap a SvelteKit + DryUI project using skill-led inspection and explicit file/package edits. Works for new projects, existing SvelteKit apps, and brownfield repos.'
---

# /dryui:init

Bootstrap DryUI in the current project, or scaffold a new SvelteKit app when the user asks for a new project.

## Install Or Refresh This Skill

The durable install path for DryUI skills is:

```bash
npx skills add rob-balfre/dryui
```

## Skill Discipline

This is a short, linear flow. Do not create per-step `TaskCreate` items — the bookkeeping costs more than the work it tracks. One intent line up front and one summary line at the end is enough.

**First tool call is always the script.** Do not run an explicit pre-triage `ls`/`[ -f X ]` call — the script self-triages and routes via exit code:

```bash
bash <skill-base-dir>/scripts/bare-skeleton.sh "$PWD"
```

- Exit 0 → done. Print one summary line and stop.
- Exit 2 with `route=existing-sveltekit` → follow **Apply Setup** below.
- Exit 2 with `route=ambiguous` → ask the user one question (scaffold over / integrate / abort), then act on the answer.
- Any other non-zero → read the message, fix the specific issue, do not re-run the whole thing manually.

Do not `Read` any file you just copied from `templates/` to verify it — those files are validated by `bun run check` at the end of the script. Do not run `bunx sv@latest create` into a temp dir. Do not overwrite `package.json` with `Write` — the script uses `jq` to merge so user-set keys (especially `overrides`) are preserved.

## What The Script Does

`scripts/bare-skeleton.sh` is the single entry point. It self-triages and either bootstraps a bare skeleton or exits 2 with a routing hint. Steps in order:

1. **Triage** — exits 2 with `route=existing-sveltekit` if `svelte.config.*` is present, or `route=ambiguous` if `src/` exists without a config.
2. Removes `index.ts` / `index.js` from the `bun init` skeleton.
3. Copies every file in `templates/` into the project root.
4. Merges scripts, `lucide-svelte` into `dependencies`, devDependencies, and `type: "module"` into `package.json` via `jq`. Preserves existing `overrides` and any other dependency keys.
5. Appends SvelteKit/Vite ignores to `.gitignore` (idempotent — checks for `/.svelte-kit` first).
6. Detects a local dryui workspace at `$DRYUI_LOCAL`, `../dryui`, `~/dryui`, `~/src/dryui`, or `~/code/dryui`. If found, runs `bun link` in each `packages/{ui,lint,primitives,feedback,feedback-server}` and writes overrides with `link:@dryui/<pkg>` so the consumer pulls the local workspace. If not found, falls back to `bun add @dryui/ui` + `bun add -d @dryui/lint @dryui/feedback @dryui/feedback-server` against npm.
7. Runs `bun run check` to validate the contract end-to-end.

The smoke-test `+page.svelte` is intentionally minimal: a single `<Heading level={1}>` inside `<main data-layout="home">` to prove `@dryui/ui` resolves and to satisfy `dryui/no-raw-element` (every raw `<main>` needs a `data-layout` hook). It carries no design — DryUI does not ship a default look, the user's first prompt fills the page in. `@dryui/feedback` is a dev-only dep; the live-feedback widget is opt-in (see "Live Feedback (Opt-In)" below).

For non-bun package managers (`npm`, `pnpm`, `yarn`), open `scripts/bare-skeleton.sh` and translate the install commands. The contract and templates are package-manager-agnostic.

## Inspect First (Existing SvelteKit Or Ambiguous Branches)

Read the project shape before changing files:

1. Check for `package.json`, `svelte.config.*`, `vite.config.*`, `src/app.html`, `src/routes/+layout.svelte`, `src/app.css`, and `src/layout.css`.
2. Identify the package manager from lockfiles. Prefer the existing one; use `bun` only when there is no signal.
3. Check whether `@dryui/ui` and `@dryui/lint` are already installed.
4. Check whether root layout imports DryUI themes, app CSS, and layout CSS in the right cascade order.
5. Check whether `dryuiLint()` and `dryuiLayoutCss()` are wired.

## Golden Consumer Setup Contract

This section is the Interface for a DryUI consumer setup. `scripts/e2e/scaffold-adapter.ts` is the concrete Adapter at this Seam for fresh E2E projects: it may write deterministic files and local tarball overrides, but it must satisfy this contract instead of carrying an independent setup recipe. That keeps setup Locality in this skill while giving tests Leverage through a repeatable Adapter.

A valid DryUI consumer setup has:

- `@dryui/ui` and `lucide-svelte` as runtime dependencies. `@dryui/lint`, `@dryui/feedback`, `@dryui/feedback-server`, and `@types/node` as dev dependencies. `lucide-svelte` is a runtime dep because it satisfies the `@dryui/feedback` peer dep and apps will routinely import icons from it; the vite SSR `noExternal` workaround in `templates/vite.config.ts` only kicks in when something imports it. The `@dryui/feedback-server` devDep ships the `dryui-feedback` bin into local `node_modules/.bin` so `bunx dryui-feedback` resolves without a registry round-trip. `@dryui/feedback` is dev-only because the live-feedback widget is opt-in (see "Live Feedback (Opt-In)" below). `@types/node` is a devDep because SvelteKit's generated `.svelte-kit/tsconfig.json` references Node types and `bun run check` fails without it. E2E may also pin local workspace tarballs for `@dryui/primitives` (transitive of feedback) so no published package leaks into the run.
- `dryuiLint({ strict: true })` as the first Svelte preprocessor, preserving any existing preprocessors after it.
- `dryuiLayoutCss()` before `sveltekit()` in Vite plugins.
- `src/app.html` ships bare `<html lang="en">` — no `class="theme-auto"`, no `data-theme`. Light tokens apply by default. Apps opt into dark or system mode by adding `class="theme-auto"` and/or `data-theme="…"` themselves.
- `src/routes/+layout.svelte` importing `@dryui/ui/themes/default.css`, `@dryui/ui/themes/dark.css`, `../app.css`, and `../layout.css` (last), then rendering `{@render children()}`. No `<Feedback>` mount by default — opt in per "Live Feedback (Opt-In)".
- `src/app.css` present with `body { container-type: inline-size; container-name: page; font-family: var(--dry-font-sans); }`.
- `src/layout.css` present and minimal. Page/section grid and flex layout lands here, scoped under `[data-layout="<name>"]`, with `@container page (...)` for responsive shifts.

## Apply Setup

For an existing SvelteKit app:

1. Install runtime + dev packages:

   ```bash
   bun add @dryui/ui lucide-svelte
   bun add -d @dryui/lint @dryui/feedback @dryui/feedback-server
   ```

   `lucide-svelte` is a runtime dep: it satisfies the `@dryui/feedback` peer and is available for the app's own icon usage. `@dryui/feedback-server` is a devDep so the `dryui-feedback` bin lands in local `node_modules/.bin`; `bunx dryui-feedback` then resolves locally instead of hitting the registry. `@dryui/feedback` is also a devDep — the widget is opt-in, see "Live Feedback (Opt-In)" below. Translate to `npm`, `pnpm`, or `yarn` when the repo already uses one of those. For local-workspace consumers, mirror the package list in `package.json` `overrides` with `link:@dryui/<pkg>` (including `@dryui/primitives`, transitive of feedback) before installing — bun overrides only apply when the package is also a dep.

2. In `svelte.config.*`, add `dryuiLint({ strict: true })` as the first preprocessor while preserving existing preprocessors.
3. In `vite.config.*`, add `dryuiLayoutCss()` before `sveltekit()`.
4. In `src/app.html`, leave `<html>` bare. Don't add `class="theme-auto"` or `data-theme` unless the app explicitly wants system-aware or forced dark mode — see `dryui-build` for the opt-in recipes.
5. In `src/routes/+layout.svelte`, import in this order: DryUI theme CSS, app CSS, then `../layout.css` last. Render `{@render children()}` and stop — no widget mounts by default.
6. Create or update `src/app.css` so `body` owns the page container and app font: `container-type: inline-size; container-name: page; font-family: var(--dry-font-sans);`.
7. Create `src/layout.css` if missing. Keep it minimal — page/section grid blocks land here as routes need them.

## UI Pipeline After Setup

Use this order for the first real interface:

1. Capture the user's brief in one line: what you are building, and for whom.
2. Use the `dryui-build` skill, component metadata, docs pages, and existing repo usage to confirm components, recipes, contracts, accessibility, and tokens.
3. Build with DryUI + Svelte 5 runes, grid layout, and `--dry-*` tokens.
4. Run the project's check/build/test command to validate contracts, a11y, tokens, and CSS discipline.

## Live Feedback (Opt-In)

DryUI does not mount the live-feedback widget by default. The `@dryui/feedback` dev dep is installed and ready, but nothing imports it until the user opts in. To enable for a session, add to `src/routes/+layout.svelte`:

```svelte
<script lang="ts">
	import { Feedback } from '@dryui/feedback';
</script>

{@render children()}

<Feedback serverUrl="http://localhost:4748" />
```

The widget is dormant until toggled (Cmd+M / Ctrl+M) and respects `DRY_FEEDBACK_DISABLED=1` for CI. Then add the `dryui-feedback` MCP server in the editor and run `bunx dryui-feedback --no-open` (or `bunx dryui-feedback` for the local dashboard) when the user kicks off a feedback session. Remove the import + mount before shipping production.
