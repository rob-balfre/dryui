---
name: dryui-init
description: 'Bootstrap a SvelteKit + DryUI project using skill-led inspection and explicit file/package edits. Works for new projects, existing SvelteKit apps, and brownfield repos without relying on DryUI CLI detection or scaffolding commands.'
---

# /dryui:init

Bootstrap DryUI in the current project, or scaffold a new SvelteKit app when the user asks for a new project.

The DryUI CLI no longer owns project detection, install planning, or scaffolding. This skill is the setup workflow.

## Inspect First

Read the project shape before changing files:

1. Check for `package.json`, `svelte.config.*`, `vite.config.*`, `src/app.html`, `src/routes/+layout.svelte`, `src/app.css`, and `src/layout.css`.
2. Identify the package manager from lockfiles. Prefer the existing one; use `bun` only when there is no signal.
3. Check whether `@dryui/ui` and `@dryui/lint` are already installed.
4. Check whether root layout imports DryUI themes, app CSS, and layout CSS in the right cascade order.
5. Check whether `dryuiLint()` and `dryuiLayoutCss()` are wired.

If the user asked for a new app and no app exists, scaffold SvelteKit with the project’s preferred package manager, then apply the setup steps below.

## Apply Setup

For an existing SvelteKit app:

1. Install runtime and lint packages:

   ```bash
   bun add @dryui/ui
   bun add -d @dryui/lint
   ```

   Translate to `npm`, `pnpm`, or `yarn` when the repo already uses one of those.

2. In `svelte.config.*`, add `dryuiLint({ strict: true })` as the first preprocessor while preserving existing preprocessors.
3. In `vite.config.*`, add `dryuiLayoutCss()` before `sveltekit()`.
4. In `src/app.html`, set `<html class="theme-auto">` unless the app already has an explicit theme strategy.
5. In `src/routes/+layout.svelte`, import in this order: DryUI theme CSS, app CSS, then `../layout.css` last.
6. Create `src/layout.css` if missing. Keep it minimal until `dryui-layout` creates page zones.

## UI Pipeline After Setup

Use this order for the first real interface:

1. Capture the user's brief in one line: what you are building, and for whom.
2. Use the `dryui` skill rule files, component metadata, docs pages, and existing repo usage to confirm components, recipes, contracts, accessibility, and tokens.
3. Build with DryUI + Svelte 5 runes, grid layout, and `--dry-*` tokens.
4. Run the project’s check/build/test command to validate contracts, a11y, tokens, and CSS discipline.

For design-quality flows (brief, critique, polish, audit), delegate to [impeccable](https://impeccable.style) via `/impeccable teach`, `/impeccable craft`, `/impeccable critique`, `/impeccable audit`, or `/impeccable polish` in your AI harness. DryUI ships no design opinion.

## Editor And Feedback Setup

If the user also wants editor integration or visual feedback tooling, run:

```bash
dryui setup
```

That command only wires skills, feedback MCP, and optional Svelte MCP snippets. It does not bootstrap the app.
