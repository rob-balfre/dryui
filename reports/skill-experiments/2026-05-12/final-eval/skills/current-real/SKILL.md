---
name: dryui-build
description: Builds and edits Svelte 5 user interfaces with DryUI components, layout hooks, theme tokens, and accessibility rules. Use when creating or modifying app UI, pages, routes, forms, dashboards, component compositions, visual polish, or design-to-code work with @dryui/ui.
---

# DryUI Build

Build real Svelte 5 UI with DryUI. This skill is only for UI implementation and polish. It does not install DryUI, scaffold projects, run live feedback, or resolve feedback submissions.

## Lint First

DryUI lint rules are the contract. If lint, the compiler, or component metadata disagrees with a visual idea, restructure the markup or CSS instead of bypassing the rule.

- Use `@dryui/ui` primitives when DryUI provides one. Do not recreate controls with raw HTML.
- DryUI does not ship a layout component. Use plain markup with `data-layout` and `data-layout-area`.
- Page and section layout lives in `src/layout.css`, scoped under `[data-layout='<name>']`.
- All consumer `display: grid` and `display: flex` declarations live in `src/layout.css` or `@container` blocks inside it.
- In `src/layout.css`, use only lint-safe `display` values such as `grid` or `flex`; never add `display: block`, `contents`, `flow-root`, or reset-style display values.
- Route and component `<style>` blocks must not contain page-level `display: grid`, `display: flex`, layout breakpoints, inline `style=`, or Svelte `style:` directives.
- Responsive layout is mobile-first and uses `@container page (...)`; never `@media` for layout breakpoints.
- `src/layout.css` is structural only: display, grid, flex, container, tokenized spacing, alignment, and block-size constraints. No color, background, border, shadow, opacity, transition, transform, font, text, position, z-index, width, height, or inline-size.
- Visual CSS belongs in app/component CSS and uses real `--dry-*` tokens such as `--dry-color-bg-base`, `--dry-color-text`, and `--dry-color-border`, or app-owned custom properties.
- In app/component CSS, constrain replaced media and text inside media-backed grids so intrinsic image size or long headings cannot enlarge grid tracks: use `inline-size: 100%`, `max-inline-size: 100%`, `min-inline-size: 0`, `object-fit`, and readable `max-width`/`maxMeasure` where needed.
- Set `body { font-family: var(--dry-font-sans); }` in `src/app.css` so dialogs, popovers, and top-layer UI inherit the app font.

Do not add these to get past lint or compiler pressure:

- `:global()`
- `!important`
- `all: unset`
- `<svelte:element>`
- `<!-- svelte-ignore ... -->`
- inline `style=`
- `style:` directives
- raw native controls when a DryUI component exists
- width or inline-size hacks to force unrelated layout fit; media/text constraints that prevent intrinsic overflow are required

## Workflow

1. Restate the target UI in one line: user, screen, primary task, density.
2. Inspect nearby app patterns and existing DryUI usage.
3. Check component metadata before guessing APIs: `packages/ui/src/<component>/<component>.meta.ts`, then `index.ts`, then source.
4. Implement with `@dryui/ui`, Svelte 5 runes, `data-layout` hooks, `src/layout.css`, and DryUI tokens.
5. Run the narrowest deterministic validation for the changed files; broaden when shared UI, package contracts, or docs changed.
6. For visual work, verify desktop and mobile browser screenshots.

## Markup

- Every interior raw element needs `data-layout="<specific-name>"` or `data-layout-area="<area>"`.
- Use `data-layout-area` only for children that participate in named grid areas.
- Do not use generic layout names: `ui`, `wrapper`, `box`, `container`, `div`, `block`, `el`, `elem`, `element`, `layout`, `inner`, `outer`.
- Do not pass `class=` to DryUI components. Use wrappers, component props, `data-*` attributes, or custom properties.
- Prefer `Button`, `Input`, `Select`, `DatePicker`, `Dialog`, `AlertDialog`, `Separator`, `Table`, and `DataGrid` over native route-level controls.
- Wrap each form control in `Field.Root` with `Label`.
- Use `AlertDialog` for destructive confirmation.
- Add `aria-label` to icon-only buttons and `type="submit"` to primary form submit buttons.

## Components

Assume a DryUI component is compound until metadata or nearby usage proves otherwise. Compound components use `.Root`; parts stay inside the matching root.

Common compound families include Accordion, AlertDialog, Breadcrumb, Collapsible, ColorPicker, Combobox, CommandPalette, ContextMenu, DataGrid, DatePicker, Dialog, Drawer, DropdownMenu, EmptyState, Field, FileUpload, FloatButton, Pagination, Popover, RadioGroup, RichTextEditor, Select, Splitter, Stepper, Table, Tabs, TagsInput, Toast, ToggleGroup, Toolbar, Tooltip, Tour, and Transfer.

## Theme

- Import DryUI theme CSS before rendering components and choose one document theme mode: light imports `default.css` and leaves `<html>` bare; system imports both themes and sets `class="theme-auto"`; explicit imports both and sets `data-theme="light"` or `data-theme="dark"`.
- `color-scheme` is not a theme switch. Do not set `color-scheme: light dark` or use `light-dark()` as the only dark-mode implementation; DryUI dark tokens come from `data-theme` or `.theme-auto`.
- App-owned custom properties must resolve to readable foreground/background pairs in every enabled mode. If using `light-dark()`, verify both resolutions and keep it out of image-overlay contrast decisions.
- For art-directed light surfaces with fixed custom ink/cream colors, keep nav, chips, cards, and panels on app-owned light backgrounds too. Do not place fixed dark text or icons on adaptive DryUI background tokens such as `--dry-color-bg-base`, `--dry-color-bg-raised`, or `--dry-color-bg-overlay`, because `.theme-auto` on a dark OS can turn those surfaces dark while custom text stays dark.
- Text over photos, video, canvas, charts, or gradients needs an actual contrast layer above the media and below the content, or a fixed text color chosen for that surface. A background gradient behind an `<img>` does not protect contrast.
- Auto/system pages must be checked in light and dark. If both cannot be verified, keep the app light-only and leave `<html>` bare.
- Override semantic tokens such as brand, danger, success, text, stroke, focus, spacing, and type aliases. Do not invent `--dry-*` names or nonexistent surface tokens such as `--dry-color-surface`, `--dry-color-panel`, or `--dry-color-background`.
- Do not resize the whole UI by changing `html` or `body` font-size; avoid raw hex, `rgb()`, and raw px spacing when a DryUI token exists.

## Svelte

- Use Svelte 5 runes: `$state`, `$derived`, `$props`, `$bindable`, and `$effect`.
- Prefer `$derived` for computed values. Do not use `$effect` to maintain derived state.
- Use typed, destructured `$props`; use `$bindable` only for props that support two-way binding.
- Use snippets instead of slots.
- Use event props such as `onclick`, `oninput`, and `onsubmit`; do not mix legacy `on:` handlers into new code.
- Guard browser-only APIs from SSR. Do not read `window`, `document`, `localStorage`, or layout measurements at module evaluation time.
- Treat `$effect` as an escape hatch for browser lifecycle work, observers, listeners, maps, canvas, timers, and cleanup.

## Motion

Build the no-animation version first. Use CSS transitions, Svelte transitions, View Transitions, or scroll-driven animations only after layout and accessibility are correct.

- Respect `prefers-reduced-motion`.
- Prefer opacity and transform. Do not animate layout tracks, width, height, inline-size, or critical spacing.
- Do not use motion to hide missing loading, disabled, empty, or error states.
- Keep `view-transition-name` sparse and specific.

## Validation

- For `.svelte` route or app work, run the local Svelte check or package check that covers the changed files.
- For `packages/ui/` component work, run `bun run --filter '@dryui/ui' build`.
- For docs UI work, run the docs check/build wrapper used by the repo.
- For skill content changes, run `bun run validate:skills`.
- Report any validation you could not run and why.
