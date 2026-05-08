---
name: dryui-build
description: 'Use when building UIs with DryUI (@dryui/ui) Svelte 5 components. Teaches correct patterns for compound components, theming, forms, and accessibility. Use the skill instructions as the default entry point; setup is owned by npx skills.'
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

Compound components are summarized in `rules/compound-components.md`. Verify there before you assume a bare name works, then use `.Root` and wrap the parts inside it.

The test: every compound component in your markup uses `.Root`, and its parts are wrapped inside it. See `rules/compound-components.md` for the parts reference.

## 3. Theme Tokens Are For Components, Not Decoration

**Import the theme. Reach for tokens only when you need a value. DryUI ships no default look — the host page owns visual style.**

- Import `@dryui/ui/themes/default.css` (and `dark.css`) before any component use. Components reach for tokens internally.
- When you do reach for tokens in your own CSS, use `--dry-color-*` and `--dry-space-*` instead of hex/rgb/raw px.
- Don't decorate user-authored wrappers by default (no `border-radius`, `border`, `background`, `box-shadow`, gradient on a `<section>` "because that's how DryUI looks"). DryUI has no default look. If a wrapper needs visual treatment, the host page decides what.
- Override semantic tokens (Tier 2) in `:root` if you're customizing palette. Component tokens (Tier 3) are component-internal — leave them alone.
- Prefer `<html class="theme-auto">`. Use `data-theme="light|dark"` only for explicit overrides.

```css
/* Wrong: hardcoded color */
.brand-button {
	background: #6366f1;
}

/* Right: token reference when you actually need a value */
.brand-button {
	background: var(--dry-color-fill-brand);
}
```

The test: does your CSS contain zero hex colors, zero `rgb()` values, zero inline styles, and zero "default" decoration on grouping wrappers?

## 4. Layout Lives in `src/layout.css`. Use `@container`.

**`src/layout.css` is structural-only. The lint enforces this. The AI authors the shape.**

DryUI does not ship a layout component. Page and section structure lives in `src/layout.css`, scoped under `[data-layout="<name>"]`. Visual styling goes to `src/app.css`. Mixing them trips four lint rules and blocks `bun run check`.

What `src/layout.css` allows (`dryui/layout-css-property`):

- `display` (grid, inline-grid, flex, inline-flex, contents only).
- Grid: `grid`, `grid-area`, `grid-template`, `grid-template-areas`, `grid-template-columns/rows`, `grid-auto-*`, `grid-row`, `grid-column`.
- Flex: `flex`, `flex-direction`, `flex-wrap`, `flex-flow`, `flex-grow`, `flex-shrink`, `flex-basis`, `order`.
- Container: `container-type`, `container-name`, `container`.
- Block sizing: `block-size`, `min-block-size`, `max-block-size` (no `width`, `height`, `inline-size`).
- Spacing: `gap`, `row-gap`, `column-gap`, `margin*`, `padding*`. Values must be `0`, `auto` (margin only), `var(--dry-space-*)`, or simple `calc()` over those.
- Alignment: `align-*`, `justify-*`, `place-*` with standard keywords.

What goes to `src/app.css`, never `src/layout.css` (`dryui/layout-css-property`):

- Color, background, border, outline, box-shadow, opacity.
- Font, line-height, letter-spacing, text-align, text-decoration, color.
- Position, top/right/bottom/left, z-index, transform, transition, animation, filter.
- Width / height / inline-size, overflow, cursor, pointer-events.

Other layout.css rules:

- Selectors must be `[data-layout='<name>']` or its `[data-layout-area='<area>']` children, no class or element selectors (`dryui/layout-css-selector`).
- Only `@container page (...)` wrappers allowed. Mobile-first base, never `@media` for layout breakpoints (`dryui/layout-css-at-rule`, `dryui/no-media-sizing`). No `@supports`, no unnamed or differently named container queries.
- Spacing values must be DryUI tokens (`dryui/layout-css-value` rejects raw `1rem`, `12px`).
- Page-level `display: grid`/`display: flex` in route-level `<style>` blocks is rejected by `dryui/no-raw-grid` and `dryui/no-flex`. No inline `style=`, no `style:` directives.
- For named grid areas, mark each child with `data-layout-area="<area>"`. Auto-flow grids and flex layouts don't need it.
- Page layout assumes `body { container-type: inline-size; container-name: page; }` lives in `src/app.css`. Without it, every `@container page (...)` rule silently fails.

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

- Install DryUI skills with `npx skills add rob-balfre/dryui`. Setup is owned by the upstream skills installer.
- If the Svelte MCP is not registered, the fallback is the remote endpoint `https://mcp.svelte.dev/mcp` or a one-liner like `claude mcp add -t stdio -s user svelte -- npx -y @sveltejs/mcp`.
- Scope split: DryUI skills cover component APIs, theming, composition, and validation expectations. Svelte MCP covers the runtime, compiler, and framework idioms.

The test: before writing non-trivial Svelte 5 or SvelteKit code, did you either call `svelte-autofixer` / `get-documentation`, or confirm the pattern is already covered by these DryUI rules and examples?

## Quick Start

**1. Install the DryUI agent skills** with the `npx skills` standard:

```bash
npx skills add rob-balfre/dryui
```

That single command installs all four DryUI skills (`dryui`, `dryui-feedback`, `dryui-live-feedback`, `dryui-init`) through the upstream skills installer. To target one agent: `npx skills add rob-balfre/dryui --agent <flag>` (full flag list at https://skills.sh). To install one skill: `npx skills add rob-balfre/dryui --skill dryui-feedback`.

**2. Start feedback tooling** when you need visual annotations:

```bash
bunx dryui-feedback
```

**3. Bootstrap the app manually or with the `dryui-init` skill.**

For greenfield and brownfield setup, use the `dryui-init` skill instructions.

### Manual install path

Kept for users who need to pin to a specific local path; the npx skills command above is the recommended path.

- Manual degit (Zed, or anyone who needs to pin to a specific path): `npx degit rob-balfre/dryui/skills/dryui-build .agents/skills/dryui-build`

**4. Register the Svelte MCP companion.** For Claude Code run `claude mcp add -t stdio -s user svelte -- npx -y @sveltejs/mcp`. For Codex add `[mcp_servers.svelte] command = "npx", args = ["-y", "@sveltejs/mcp"]` to `~/.codex/config.toml`. See rule 7 above.

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

### Feedback dashboard

Start the local feedback dashboard when you need visual annotations:

```bash
bunx dryui-feedback
```

### MCP

Use the installed DryUI skills for guidance, project package commands for deterministic checks, and the `dryui-feedback` MCP server for visual feedback dispatch.

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
