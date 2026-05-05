---
name: dryui
description: 'Use when building UIs with DryUI (@dryui/ui) Svelte 5 components. Teaches correct patterns for compound components, theming, forms, layout discipline, and accessibility. Use the skill instructions as the default entry point; setup is owned by npx skills and the CLI is only for feedback tooling and local helpers.'
---

# DryUI

Zero-dependency Svelte 5 components. All imports from `@dryui/ui`. Requires a theme CSS import. Svelte 5 runes only.

**Tradeoff:** These rules bias toward correctness over speed. For throwaway prototypes, use judgment.

## UI Creation Pipeline

DryUI work is explicit. Confirm contracts, build, then validate.

1. **User brief** — one line capturing what you are building and for whom.
2. **DryUI lookup/plan** — use this skill, the rule files below, and the checked-in component metadata/docs to confirm component contracts, tokens, recipes, and accessibility notes before choosing components.
3. **Implementation** — build with DryUI components, Svelte 5 runes, grid layout, `--dry-*` tokens, and accessible composition.
4. **Deterministic check** — run the project’s package checks, Svelte checks, builds, and `@dryui/lint` diagnostics to catch contract drift, accessibility regressions, token drift, and CSS discipline violations.

## Design guidance, critique, polish

DryUI is zero-dependency components + tokens + contracts. It deliberately does NOT ship design opinion. For design-quality flows like brief, critique, polish, visual review, or anti-pattern detection, use [impeccable](https://impeccable.style), installed via `npx impeccable skills install`.

Invoke from your AI harness:

- `/impeccable teach` — one-time: scaffold `PRODUCT.md` + `DESIGN.md`
- `/impeccable craft` — design-then-build a feature
- `/impeccable shape` — plan UX/UI before writing code
- `/impeccable critique <target>` — UX design review
- `/impeccable audit <target>` — a11y, performance, responsive checks
- `/impeccable polish <target>` — final pass before shipping
- Full catalog: https://impeccable.style/cheatsheet

`PRODUCT.md` and `DESIGN.md` at the project root are impeccable-owned. DryUI tools do not read or write them. Anti-pattern detection: `npx impeccable detect <path-or-url>`.

## 1. Look Up Before You Write

**Never guess a component API. Always verify first.**

- Read the relevant rule file and component metadata before using any component for the first time.
- Component APIs vary. `bind:value`, `bind:open`, `bind:checked` are NOT interchangeable.
- Compound vs simple, required parts, available props — all differ per component.
- If you skip the lookup, you'll write plausible-looking code that silently breaks.

The test: can you point to the rule file, component metadata, or existing usage that justifies every component or pattern in your output?

## 2. Everything is Compound Until Proven Otherwise

**Use `.Root`. Always check.**

Most DryUI components are compound. They require `<Dialog.Root>`, not `<Dialog>`. The bare name silently fails or renders wrong. Assume compound, verify against `rules/compound-components.md`, the component manifest, or nearby existing usage.

```svelte
<!-- Wrong -->
<Dialog>content</Dialog>
<!-- Right -->
<Dialog.Root>content</Dialog.Root>
```

Compound components are tracked in the manifest at `packages/mcp/src/component-catalog.ts` and summarized in `rules/compound-components.md`. Verify there before you assume a bare name works, then use `.Root` and wrap the parts inside it.

The test: every compound component in your markup uses `.Root`, and its parts are wrapped inside it. See `rules/compound-components.md` for the parts reference.

## 3. Let the Theme Do Its Job

**Import it. Use its tokens. Don't fight it.**

- Import `@dryui/ui/themes/default.css` (and `dark.css`) before any component use.
- Use `--dry-color-*` and `--dry-space-*` tokens. Never hardcode colors or spacing.
- Don't add decorative CSS (gradients, shadows, colored borders). The theme handles appearance.
- Override semantic tokens (Tier 2) in `:root`, not component tokens (Tier 3).
- Prefer `<html class="theme-auto">`. Use `data-theme="light|dark"` only for explicit overrides.

```css
/* Wrong */
.card {
	background: #6366f1;
	color: white;
}

/* Right */
.card {
	background: var(--dry-color-fill-brand);
	color: var(--dry-color-text-strong);
}
```

The test: does your CSS contain zero hex colors, zero `rgb()` values, and zero inline styles?

Theming precedence beats design opinion. If impeccable guidance conflicts with DryUI theme contracts, tokens, or accessibility rules, DryUI wins.

## 4. Layout in `src/layout.css`. @container for Responsive.

**Nothing else.**

- DryUI does not ship a layout component. Page and section structure live as grid, flex, and container-query CSS in `src/layout.css`, scoped under a stable `[data-layout="<name>"]` selector. Use the `dryui-layout` skill.
- Page-level `display: grid` and `display: flex` declarations live in `src/layout.css` (or `@container` blocks within it). Nowhere else for page layout: no grid/flex in route-level component `<style>` blocks, no `style=` inline, no `style:` directives.
- Constrained page tracks belong in `src/layout.css`; use `Container` only for component-level content measure when a recipe explicitly calls for it.
- Use `@container` queries for responsive sizing. Mobile-first base; never `@media` for layout breakpoints.
- Children opt into a grid area with `data-layout-area="<area>"`.

```svelte
<div data-layout="docs-shell">
	<nav data-layout-area="aside">Docs</nav>
	<main data-layout-area="main">Content</main>
</div>
```

```css
[data-layout='docs-shell'] {
	display: grid;
	grid-template-areas: 'main' 'aside';
	grid-template-columns: minmax(0, 1fr);
	gap: var(--dry-space-4);
}

[data-layout='docs-shell'] > [data-layout-area='aside'] {
	grid-area: aside;
}

[data-layout='docs-shell'] > [data-layout-area='main'] {
	grid-area: main;
	display: grid;
	gap: var(--dry-space-6);
}

@container page (min-width: 56rem) {
	[data-layout='docs-shell'] {
		grid-template-areas: 'aside main';
		grid-template-columns: 16rem minmax(0, 1fr);
	}
}
```

The test: grep route-level component `<style>` blocks for page-layout `display: grid`, `display: flex`, `style=`, `@media`. Page layout lives in `src/layout.css`.

## 4A. Escape Hatches Mean Stop.

**If lint or the compiler pushes you toward an escape hatch, the structure is usually wrong.**

- Never add `:global()`, `!important`, `all: unset`, `<svelte:element>`, or `<!-- svelte-ignore ... -->` just to make a selector or warning go away.
- Never add `width`, `min-width`, `max-width`, `inline-size`, `min-inline-size`, or `max-inline-size` to solve layout pressure.
- Never use raw native elements outside their canonical DryUI component directories just because composition feels inconvenient.
- Never pass `class=` to DryUI components expecting it to style their internals. Use wrapper elements, component props, `data-*` attributes, or `--dry-*` tokens instead.
- When blocked, restructure the markup instead: add a local wrapper, split explicit `{#if}` branches, move sizing to parent grid tracks, or promote the pattern into the canonical component where the raw element belongs.
- Treat `dryui/no-global`, `dryui/no-important`, `dryui/no-width`, `dryui/no-raw-native-element`, `dryui/no-css-ignore`, and `dryui/no-svelte-element` as design feedback, not obstacles to suppress.

The test: grep your output for `:global(`, `!important`, `all: unset`, `svelte-ignore`, `svelte:element`, raw `<button`, raw `<input`, raw `<select`, raw `<dialog`, raw `<hr`, raw `<table`, and `width:`. All should return nothing unless you are editing the canonical component that owns that native element.

## 5. Every Input Gets a Field.Root

**Accessibility isn't optional.**

- Wrap every form input in `Field.Root` with a `Label`.
- Use `AlertDialog` (not `Dialog`) for destructive confirmations.
- Add `aria-label` to every icon-only button.
- Use `type="submit"` on primary form action buttons.

```svelte
<!-- Wrong -->
<label>Email</label>
<Input bind:value={email} />

<!-- Right -->
<Field.Root>
	<Label>Email</Label>
	<Input bind:value={email} />
</Field.Root>
```

The test: every `<Input>`, `<Select.Root>`, `<Textarea>` is inside a `Field.Root` with a `Label` sibling.

## 6. Prefer DryUI Over Native HTML

**If a DryUI component exists for it, use it.**

`DatePicker` not `<input type="date">`. `Select.Root` not `<select>`. `Dialog.Root` not `<dialog>`. `Separator` not `<hr>`. `Button` not `<button>`. DryUI components handle theming and accessibility automatically. Native elements don't.

The test: search your markup for raw `<input`, `<select>`, `<dialog>`, `<button>`, `<hr>`, `<table>`. Each should be a DryUI component instead.

## 7. Ask the Svelte MCP for Svelte Questions

**DryUI owns components. `@sveltejs/mcp` owns the framework.**

For Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`), snippets, SvelteKit load fns, `+page.server.ts` shape, form actions, and anything Svelte-syntax adjacent: call the official `svelte-autofixer` and `get-documentation` tools from `@sveltejs/mcp` before guessing from memory.

- Install DryUI skills with `npx skills add rob-balfre/dryui`. Setup is owned by the upstream skills installer, not the DryUI CLI.
- If the Svelte MCP is not registered, the fallback is the remote endpoint `https://mcp.svelte.dev/mcp` or a one-liner like `claude mcp add -t stdio -s user svelte -- npx -y @sveltejs/mcp`.
- Scope split: DryUI skills cover component APIs, theming, composition, and validation expectations. Svelte MCP covers the runtime, compiler, and framework idioms.

The test: before writing non-trivial Svelte 5 or SvelteKit code, did you either call `svelte-autofixer` / `get-documentation`, or confirm the pattern is already covered by these DryUI rules and examples?

## Quick Start

**1. Install the DryUI agent skills** with the `npx skills` standard:

```bash
npx skills add rob-balfre/dryui
```

That single command installs all six DryUI skills (`dryui`, `dryui-layout`, `dryui-layout-polish`, `dryui-feedback`, `dryui-live-feedback`, `dryui-init`) through the upstream skills installer. To target one agent: `npx skills add rob-balfre/dryui --agent <flag>` (full flag list at https://skills.sh). To install one skill: `npx skills add rob-balfre/dryui --skill dryui-layout`.

**2. Check for a local CLI link before installing feedback helpers.** A global install replaces Bun's local link, so inspect it first:

```bash
readlink ~/.bun/install/global/node_modules/@dryui/cli
```

If the link points at a local DryUI checkout's `packages/cli`, do not run `bun install -g @dryui/cli@latest` or `npm install -g @dryui/cli@latest`. In the DryUI monorepo, restore or refresh local source mode instead:

```bash
bun run dev:link
DRYUI_DEV=1 dryui
```

Only install the published CLI when no local link exists and you are not iterating on DryUI source:

```bash
bun install -g @dryui/cli@latest   # or: npm install -g @dryui/cli@latest
```

**3. Start feedback tooling** when you need visual annotations:

```bash
dryui feedback
```

**4. Bootstrap the app manually or with the `dryui-init` skill.**

For greenfield and brownfield setup, use the `dryui-init` skill instructions. The CLI no longer owns project detection, install planning, or scaffolding.

> **No global install?** Prefix supported CLI commands with `bunx @dryui/cli ...` or `npx -y @dryui/cli ...`. Supported commands are `ambient`, `install-hook`, and `feedback`.

### Manual install path

Kept for users who need to pin to a specific local path; the npx skills command above is the recommended path.

- Manual degit (Zed, or anyone who needs to pin to a specific path): `npx degit rob-balfre/dryui/skills/dryui .agents/skills/dryui`

**5. Register the Svelte MCP companion.** For Claude Code run `claude mcp add -t stdio -s user svelte -- npx -y @sveltejs/mcp`. For Codex add `[mcp_servers.svelte] command = "npx", args = ["-y", "@sveltejs/mcp"]` to `~/.codex/config.toml`. See rule 7 above.

### Manual setup

1. `bun add @dryui/ui`
2. `bun add -d @dryui/lint`. Keeps page-level grid/flex/container layout in `src/layout.css`, bans inline-style/width during Svelte preprocessing, and checks `src/layout.css` during Vite dev/HMR and build. Without this step the CSS discipline rules are not enforced at build time.
3. Wire the lint preprocessor in `svelte.config.js` (add `dryuiLint` as the **first** item in the `preprocess` array):

   ```js
   import { dryuiLint } from '@dryui/lint';

   /** @type {import('@sveltejs/kit').Config} */
   const config = {
   	preprocess: [
   		dryuiLint({
   			strict: true,
   			exclude: ['.svelte-kit/', '/dist/']
   		})
   		// keep any existing preprocessors after this
   	]
   };

   export default config;
   ```

4. Wire the layout CSS Vite plugin in `vite.config.ts`:

   ```ts
   import { dryuiLayoutCss } from '@dryui/lint';

   export default {
   	plugins: [dryuiLayoutCss()]
   };
   ```

   Put `dryuiLayoutCss()` before `sveltekit()` when both are present. It warns if `src/layout.css` is missing and throws on violations during dev startup, HMR, and build.

5. Add `class="theme-auto"` to `<html>` in `src/app.html`.
6. In root layout (`src/routes/+layout.svelte`), import themes:
   ```svelte
   <script>
   	import '@dryui/ui/themes/default.css';
   	import '@dryui/ui/themes/dark.css';
   </script>
   ```
7. Import `app.css` AFTER theme CSS if you have custom styles, then import `../layout.css` last for global layout hooks.

> Prefer the `dryui-init` skill for a guided bootstrap when the project is not wired yet.

## Bindable Props, Common Confusion

Always verify against the component metadata or existing usage, but these are the most common mistakes:

- `bind:value` (Input, Select, Tabs...) vs `bind:checked` (Checkbox, Switch) vs `bind:pressed` (Toggle) vs `bind:open` (Dialog, Popover, Drawer...)
- Select and Combobox support both `bind:value` and `bind:open`.
- ColorPicker also exposes `bind:alpha`. Transfer uses `bind:sourceItems` / `bind:targetItems`.
- Tour uses `bind:active`, not `bind:open`.

## Tools

Use these to look up APIs, discover components, plan setup, and validate code.

### Recommended workflow

1. Resolve any component or recipe uncertainty with the relevant rule file, component metadata, docs page, or existing repo usage.
2. Build page and section layout with `data-layout` hooks plus `src/layout.css`; keep component-local CSS focused on the component’s own internals.
3. Run the relevant package check/build/test command after implementation to catch composition drift, layout violations, accessibility regressions, and token drift.
4. Never guess component shape from memory. DryUI is intentionally strict, and the lookup cost is lower than rework.

### CLI

Before installing globally, always check `readlink ~/.bun/install/global/node_modules/@dryui/cli`. If it points at a local DryUI checkout's `packages/cli`, keep the link and use `bun run dev:link` plus `DRYUI_DEV=1` instead of reinstalling. Only install once with `bun install -g @dryui/cli@latest` (or `npm install -g @dryui/cli@latest`) when no local link exists and you are not iterating on DryUI source. The CLI is intentionally small: it starts feedback tooling and prints local helper context.

```bash
dryui ambient                   # SessionStart context
dryui install-hook --dry-run    # Preview Claude hook wiring
dryui feedback                  # Start the local feedback dashboard
```

Without a global install, prefix any command with `bunx @dryui/cli …` or `npx -y @dryui/cli …`. Same behaviour, just slower (re-fetches on each call).

### MCP

`@dryui/mcp` is a context server for agents that still expect an MCP entry. It no longer exposes runtime `ask`, `check`, detect, or planning tools. Use the installed DryUI skills for guidance, project package commands for deterministic checks, and `dryui-feedback` MCP for visual feedback dispatch.

Categories: action, input, form, layout, navigation, overlay, display, feedback, interaction, utility

## Rule Files

Read these when you need deeper guidance:

- **`rules/compound-components.md`** — Parts lists, component selection table, common mistakes
- **`rules/theming.md`** — Three-tier token system, dark mode, palette customization
- **`rules/composition.md`** — Form patterns, page layouts, composition recipes
- **`rules/accessibility.md`** — Field.Root, ARIA, focus management, pre-ship checklist
- **`rules/svelte.md`** — Runes, snippets, native browser APIs, styling rules
- **`rules/native-web-transitions.md`** — View Transition API, scroll animations, reduced-motion

---

**These rules are working if:** every component traces to a documented contract or existing usage, diffs contain zero hardcoded colors, and package checks/builds pass.
