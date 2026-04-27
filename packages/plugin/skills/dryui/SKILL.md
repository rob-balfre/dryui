---
name: dryui
description: 'Use when building UIs with DryUI (@dryui/ui) Svelte 5 components. Teaches correct patterns for compound components, theming, forms, accessibility, and the CSS / lint discipline. Prefer MCP `ask` / `check`; CLI `dryui ask` / `dryui check` mirror the same surface.'
---

# DryUI

Zero-dependency Svelte 5 components. All imports from `@dryui/ui`. Theme CSS import required. Svelte 5 runes only.

**Tradeoff:** these rules bias toward correctness over speed. For throwaway prototypes, use judgment.

## The 8 rules

The lint catalog (~50 rules in `@dryui/lint`) is enforcement of these eight pairs. Every diff that follows them passes `check`.

**1. Look up before you write.** Run `ask --scope component "<X>"` (or recipe) before first use. Component APIs vary, and bind targets are not interchangeable (`bind:value` vs `bind:checked` vs `bind:open` vs `bind:pressed` vs `bind:active`). Most components are compound: use `<X.Root>`, never bare `<X>`. Don't guess from memory.

**2. Grid for layout, not flex.** Scoped `display: grid` with `--dry-space-*` gaps. `Container` for constrained width. `@container` queries (not `@media`) for responsive sizing. `AreaGrid.Root` with `--dry-grid-area-name` on placed children for named-area page templates. Banned: `display: flex`, any `width` / `min-width` / `max-width` / `inline-size` (typographic `ch` / `ex` / `em` measure is the only carve-out), `@media` for sizing.

**3. No CSS escape hatches.** No `:global()`, `!important`, `all: unset`, `<svelte:element>`, `<!-- svelte-ignore ... -->`, `style=`, `style:` directives, or directional `inset` box-shadow (it clips against `border-radius`). When a rule pushes you toward one of these, the structure is wrong. Restructure the markup: add a wrapper, split into `{#if}` branches, move sizing onto parent grid tracks, or promote the pattern into the component that owns the underlying element.

**4. Don't pass `class=` to DryUI components.** Their `class` is silently ignored. Style overrides go through `--dry-*` custom properties on a wrapper, component props, or `data-*` attributes.

**5. DryUI components over native HTML.** `Button` (not `<button>`), `Field.Root` + `Label` (not raw `<label>` + `<input>`), `Container` (not max-width centering), `Separator` (not `<hr>`), `Select.Root` (not `<select>`), `Dialog.Root` / `AlertDialog.Root` (not `<dialog>`), `DatePicker` (not `<input type="date">`). Raw native elements are only allowed inside their canonical component directory. `<a>` always needs `href`; for actions, use `<Button>`.

**6. Tokens, not values.** Always `var(--dry-color-*)` and `var(--dry-space-*)`; never hex, `rgb()`, or hardcoded spacing. Override Tier-2 semantic tokens (`--dry-color-bg-base`, `--dry-color-bg-raised`, `--dry-color-text-strong`, `--dry-color-fill-brand`, `--dry-color-stroke-weak`...), never Tier-3 component tokens (`--dry-card-bg`, `--dry-btn-bg`, etc). Surfaces are solid (no low-alpha rgba on `--dry-color-bg-*`). Color pairs travel together: define `-hover` whenever you define the base. Default custom properties via `var(--name, fallback)` on consumption, never `--name: default` on `:root` (so a component's Svelte `--prop` inheritance still wins).

**7. Theme setup is ordered.** `<html class="theme-auto">` by default; `data-theme="light|dark"` only for explicit overrides. Import `@dryui/ui/themes/default.css` (and `dark.css`) **before** any local CSS that overrides `--dry-*`. Full themes go in `*.theme.css` (or with `/* @dryui-theme */` at the top); a few site-wide token tweaks scope under `body` / page selectors; per-route tweaks live in a component `<style>`.

**8. Accessibility is non-negotiable.** Every input lives in `Field.Root` with a `Label`. `Avatar` has `alt` + `fallback`. Icon-only buttons have `aria-label`. Use the focus token (`outline: var(--dry-focus-ring)` plus `outline-offset: 2px` outset or `-1px` inset), not a hand-rolled `2px solid var(--dry-color-focus-ring)`. Use `AlertDialog` (not `Dialog`) for destructive confirmations. Use `type="submit"` on primary form buttons.

The lint enforces all eight. If `check` is clean and every component traces to a lookup, you're done.

## Workflow

`ask` → build → `check`. Confirm contracts before writing, then validate after. Prefer MCP when registered; CLI mirrors the same surface.

1. Brief: one line of intent.
2. Lookup: `ask` for components, recipes, tokens, setup.
3. Build: DryUI components, runes, scoped grid, `--dry-*` tokens.
4. Check: `check [path]` after the edit. Fix every reported violation; do not suppress.

## Quick Start

```bash
bun install -g @dryui/cli@latest        # global, fastest
dryui init                              # existing project
dryui init my-app                       # scaffold SvelteKit + DryUI in one step
cd my-app && bun run dev
```

Without a global install, `bunx @dryui/cli <cmd>` and `npx -y @dryui/cli <cmd>` both work (slower, re-fetches each time).

Editor integrations (run after the CLI is wired):

- Claude Code: `claude plugin marketplace add rob-balfre/dryui && claude plugin install dryui@dryui`
- Codex (0.121+): `codex marketplace add rob-balfre/dryui`, then start `codex`, run `/plugins`, install `DryUI`
- OpenCode: `npx degit rob-balfre/dryui/packages/ui/skills/dryui .opencode/skills/dryui` plus the `dryui` and `dryui-feedback` MCP servers in `opencode.json`
- Copilot / Cursor / Windsurf: `npx degit rob-balfre/dryui/packages/ui/skills/dryui .agents/skills/dryui` plus MCP config (https://dryui.dev/tools)

`dryui setup --install` registers `@sveltejs/mcp` automatically for Copilot, Cursor, OpenCode, Windsurf, and Zed. For Claude Code: `claude mcp add -t stdio -s user svelte -- npx -y @sveltejs/mcp`.

## Manual setup

`dryui init` does all of this. Use only if you can't run it.

1. `bun add @dryui/ui`
2. `bun add -d @dryui/lint`
3. Wire `dryuiLint` as the **first** entry in `preprocess` in `svelte.config.js`:

   ```js
   import { dryuiLint } from '@dryui/lint';

   /** @type {import('@sveltejs/kit').Config} */
   const config = {
   	preprocess: [
   		dryuiLint({ strict: true, exclude: ['.svelte-kit/', '/dist/'] })
   		// keep any existing preprocessors after this
   	]
   };

   export default config;
   ```

4. Add `class="theme-auto"` to `<html>` in `src/app.html`.
5. In `src/routes/+layout.svelte`, import `@dryui/ui/themes/default.css` and `dark.css` **before** any local `app.css`.

Without `@dryui/lint` wired, the CSS-discipline rules are not enforced at build time; only post-write `check` catches them.

Optional: `dryuiLint({ forbidRawGrid: true })` requires every grid layout to flow through `AreaGrid.Root`. The default keeps raw scoped grid available for component-internal layout.

## Tools

| Workflow             | MCP                                                               | CLI                                              |
| -------------------- | ----------------------------------------------------------------- | ------------------------------------------------ |
| Project setup        | `ask --scope setup ""`                                            | `dryui setup` / `dryui detect` / `dryui install` |
| Lookup & composition | `ask --scope component`, `ask --scope recipe`, `ask --scope list` | `dryui ask <scope> "<query>"` / `dryui list`     |
| Tokens               | `ask --scope list --kind token`                                   | `dryui tokens --category color`                  |
| Validation           | `check <file.svelte>`, `check <theme.css>`                        | `dryui check [path]`                             |

CLI output is TOON by default; pass `--text` for plain text, `--json` where supported, `--full` to disable truncation.

Categories: action, input, form, layout, navigation, overlay, display, feedback, interaction, utility.

## Bindable props (common confusion)

Always verify with `ask --scope component`. The most-missed shapes:

- `bind:value` for Input, Select, Tabs, Combobox, ColorPicker...
- `bind:checked` for Checkbox, Switch
- `bind:pressed` for Toggle
- `bind:open` for Dialog, Popover, Drawer (also Select / Combobox in addition to `bind:value`)
- `bind:alpha` for ColorPicker (in addition to `bind:value`)
- `bind:sourceItems` / `bind:targetItems` for Transfer
- `bind:active` for Tour (not `bind:open`)

## Companion tools

DryUI deliberately scopes itself to components, theming, composition, and validation. Hand off when you cross a boundary.

- **Svelte MCP** owns runes (`$state`, `$derived`, `$effect`, `$props`), snippets, SvelteKit load fns, form actions, and compiler issues. Call `svelte-autofixer` and `get-documentation` from `@sveltejs/mcp` before guessing from memory.
- **Impeccable** owns design taste: brief, critique, polish, visual review, anti-pattern detection. Installed alongside DryUI by `dryui init` or `npx impeccable skills install`. Invoke as `/impeccable critique <target>`, `/impeccable audit <target>`, `/impeccable polish <target>`. Full catalog at https://impeccable.style/cheatsheet. If impeccable guidance ever conflicts with DryUI tokens, contracts, or accessibility, DryUI wins.

`PRODUCT.md` and `DESIGN.md` at the project root are impeccable-owned; DryUI tools do not read or write them.

## Rule files

The eight rules above are the contract. Read these for depth.

- `rules/compound-components.md` — parts lists, selection table, common mistakes
- `rules/theming.md` — three-tier tokens, dark mode options, palette customization
- `rules/composition.md` — form patterns, page layouts, recipes
- `rules/accessibility.md` — Field.Root, ARIA, focus management, pre-ship checklist
- `rules/svelte.md` — runes, snippets, native browser APIs, styling
- `rules/native-web-transitions.md` — View Transition API, scroll animations, reduced-motion
