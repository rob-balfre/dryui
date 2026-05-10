# Theming

Use this file when styling a DryUI screen or changing theme tokens. DryUI components read tokens for internals; the host app owns page background, surfaces, typography rhythm, and density.

## Token Model

DryUI has three token tiers:

1. Primitive tokens: raw scales in theme files. Treat them as implementation details.
2. Semantic tokens: public theme surface such as brand, danger, success, text, stroke, focus, spacing, and type aliases.
3. Component tokens: component-internal variables that should usually derive from semantic tokens.

Override semantic tokens for a theme. Avoid component-token overrides unless you are deliberately changing one component family.

## Theme Imports

Import theme CSS before rendering DryUI components.

```svelte
<script>
	import '@dryui/ui/themes/default.css';
	import '@dryui/ui/themes/dark.css';
	import { Button } from '@dryui/ui';
</script>
```

Default to a bare `<html>` for light theme. Use `class="theme-auto"` for OS preference, or `data-theme="light"` / `data-theme="dark"` for explicit overrides.

## Global Typography

Every DryUI app must set a body font in `src/app.css`.

```css
body {
	font-family: var(--dry-font-sans);
}
```

Keep this on `body`, not only on a route wrapper. Native popovers, dialogs, and top-layer surfaces need a global inheritance path. `dryuiLayoutCss()` fails builds when `src/app.css` is present but body has no `font-family`.

## Token Rules

- Use real `--dry-*` tokens only. Do not invent token names.
- Use `--dry-color-*`, `--dry-space-*`, and `--dry-type-*` instead of raw color, spacing, or type values in DryUI-facing CSS.
- If an app needs custom design values, define app-owned variables such as `--app-panel-bg`; do not create fake `--dry-*` names.
- Do not use nonexistent surface tokens such as `--dry-color-surface` or `--dry-color-surface-raised`.
- Do not set `html` or `body` font-size to resize the UI. DryUI spacing, type, and focus tokens assume the browser default root size.
- Do not hardcode hex, `rgb()`, or raw px spacing in component or route CSS when a DryUI token exists.

## Palette Customization

Keep brand customization small and semantic.

```css
:root {
	--dry-color-primary: oklch(52% 0.18 250);
	--dry-color-primary-hover: oklch(47% 0.18 250);
	--dry-color-on-primary: white;
}
```

Avoid this:

```css
:root {
	--dry-button-bg: #4f46e5;
	--dry-color-surface-raised: #ffffff;
}
```

The first reaches into component internals and the second invents a surface token.

## Visual Styling Boundary

App CSS can style app-owned wrappers, but keep it deliberate:

```css
[data-layout='invoice-panel'] {
	/* layout.css only: structure */
	display: grid;
	gap: var(--dry-space-4);
}
```

```css
[data-panel='invoice'] {
	/* app.css: visual treatment */
	background: var(--app-panel-bg);
	border: 1px solid var(--dry-color-stroke-weak);
}
```

Do not add default decoration to every section. DryUI is not a card system.

## Dark Mode Recipes

- Light-only: import `default.css`; leave `<html>` bare.
- System theme: import `default.css` and `dark.css`; add `class="theme-auto"` to `<html>`.
- Explicit theme: import both; set `data-theme="light"` or `data-theme="dark"`.
- Persisted user choice: store only explicit choices; otherwise return to system mode.

When writing a theme toggle, update `document.documentElement.dataset.theme` for explicit choices and remove it for system mode.

## Validation

If theme changes look wrong, check:

- The theme CSS import exists and runs before component usage.
- Token names exist in `packages/ui/src/themes/default.css` or sibling theme files.
- Text and fill token pairs maintain contrast.
- No invented `--dry-*` variables were introduced.
- No root font-size scaling was added.
