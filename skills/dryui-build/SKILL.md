---
name: dryui-build
description: Builds and edits Svelte 5 user interfaces with DryUI components, layout hooks, theme tokens, and accessibility rules. Use when creating or modifying app UI, pages, routes, forms, dashboards, component compositions, visual polish, or design-to-code work with @dryui/ui.
---

# DryUI Build

Build real Svelte 5 UI with DryUI. This skill is only for UI implementation and polish. It does not install DryUI, scaffold projects, run live feedback, or resolve feedback submissions; use the dedicated setup or feedback skill for those jobs.

## Core Workflow

1. Restate the target UI in one line: user, screen, primary task, density.
2. Inspect existing app patterns before inventing new ones.
3. Read only the rule files and component metadata needed for the components you will touch.
4. Implement with `@dryui/ui`, Svelte 5 runes, `data-layout` hooks, `src/layout.css`, and DryUI theme tokens.
5. Run the narrowest deterministic validation available for the changed files, then broaden if shared UI or package contracts changed.
6. For visual work, verify in a browser screenshot at desktop and mobile widths.

## Cross-Agent Use

- Keep instructions portable across agents that read `SKILL.md`.
- Do not rely on tool-specific command syntax, dynamic context injection, or agent names in this skill body.
- If a Svelte docs or MCP tool is available, use it for framework questions; otherwise inspect local code and run local Svelte checks.
- Prefer repository scripts and deterministic checks over editor-specific behavior.

## Lookup Order

Use progressive disclosure. Stop as soon as you have enough evidence.

1. `rules/composition.md` for page structure, `data-layout`, `src/layout.css`, and lint trip-wires.
2. `rules/theming.md` for token usage, semantic color, spacing, and CSS boundaries.
3. `rules/accessibility.md` for forms, dialogs, keyboard behavior, labels, and icon-only controls.
4. `rules/compound-components.md` for `.Root` components, required parts, and part names.
5. `rules/svelte.md` for Svelte 5 runes, snippets, props, and event patterns.
6. `rules/native-web-transitions.md` for motion and transition work.
7. `packages/ui/src/<component>/<component>.meta.ts`, `index.ts`, then component source only when the rule files do not answer the API question.

## Hard Rules

- Import UI primitives from `@dryui/ui`; do not recreate primitives with raw HTML when DryUI provides one.
- DryUI does not ship a layout component; page and section structure is plain markup plus layout hooks.
- Assume components are compound until proven otherwise. Prefer `<Dialog.Root>` style APIs after checking the manifest or rules.
- Every interior raw element must have either `data-layout="<specific-name>"` or `data-layout-area="<area>"`.
- Do not use generic layout names such as `ui`, `wrapper`, `box`, `container`, `inner`, `outer`, `block`, or `element`.
- Do not pass `class=` to DryUI components. Use wrappers, component props, `data-*` attributes, or `--dry-*` custom properties.
- Use DryUI components instead of raw `<button>`, `<input>`, `<select>`, `<dialog>`, `<hr>`, or `<table>` in route markup.
- Wrap each input in `Field.Root` with `Label`. Use `AlertDialog` for destructive confirmation.
- Add `aria-label` to icon-only buttons and `type="submit"` to primary form submit buttons.

## Layout and Theme

- Page and section structure lives in `src/layout.css`, scoped by `[data-layout='<name>']`.
- Route and component `<style>` blocks must not contain page-level `display: grid`, `display: flex`, `style=`, `style:`, or layout breakpoints.
- Use mobile-first base rules and `@container page (...)` for responsive layout; never `@media` for layout breakpoints.
- Keep `src/layout.css` structural only: grid, flex, container, spacing, alignment, and block-size properties.
- Use DryUI theme CSS before component use.
- Set `body { font-family: var(--dry-font-sans); }` in `src/app.css`; it is required for popovers, dialogs, and native top-layer content to inherit the app font.
- Use `--dry-color-*` and `--dry-space-*` tokens instead of hex, rgb, raw px spacing, or invented variables.

## Svelte Rules

- Use Svelte 5 runes only: `$state`, `$derived`, `$props`, `$bindable`, and `$effect` where appropriate.
- Prefer `$derived` for computed values; do not update derived state through `$effect`.
- Use typed, destructured `$props`.
- Use snippets instead of slots.
- Treat `$effect` as an escape hatch for external systems and browser lifecycle work.

## Stop Signs

Do not add these to get past lint or compiler pressure:

- `:global()`
- `!important`
- `all: unset`
- `<svelte:element>`
- `<!-- svelte-ignore ... -->`
- inline `style=`
- `style:` directives
- raw native controls when a DryUI component exists
- width or inline-size hacks to solve layout pressure

Restructure markup, move layout to `src/layout.css`, or use the canonical DryUI component instead.

## Validation

- For `.svelte` route or app work, run the local Svelte check or package check that covers the changed files.
- For `packages/ui/` component work, run the UI package build.
- For skill or rule edits, run `bun run validate:skills`.
- For docs UI work, run the docs check/build wrapper used by the repo.
- Report any validation you could not run and why.
