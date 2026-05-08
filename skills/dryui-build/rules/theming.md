# Theming

DryUI ships no default visual style. Components reach for tokens for their own internals (focus rings, control fills, motion). The host page decides everything else: page background, surface treatment, typography, density.

## Three-Tier CSS Variable System

DryUI uses a layered token system. Higher tiers reference lower tiers.

### Tier 1: Primitive tokens

Raw design values. Not typically overridden.

```css
--dry-gray-500
--dry-blue-600
--dry-space-4          /* 1rem */
--dry-radius-lg        /* 0.5rem */
--dry-shadow-md
--dry-font-size-sm
```

### Tier 2: Semantic tokens

Map intent to primitive values. Override these to align components with your brand or design system.

```css
--dry-color-primary        /* Main brand color */
--dry-color-primary-hover  /* Primary on hover */
--dry-color-danger         /* Destructive actions */
--dry-color-success        /* Success states */
--dry-color-warning        /* Warning states */
--dry-color-text           /* Primary text */
--dry-color-text-secondary /* Secondary text */
--dry-color-foreground     /* Foreground over arbitrary surface (alias of --dry-color-text) */
--dry-color-muted          /* Disabled/placeholder text */
--dry-color-border         /* Default border */
--dry-color-border-hover   /* Border on hover */
--dry-color-bg             /* Page background. Only override if you want components to inherit a non-default page colour; most apps leave this alone and paint the page themselves. */
```

These short names are public aliases of the longer Tier 3 tokens (`--dry-color-fill-brand`, `--dry-color-text-strong`, `--dry-color-fill-error`, `--dry-color-stroke-weak`, etc.). Override the short name to retheme; components reading the long name pick up the change automatically through `var(--alias)` derivation. You can override either name, but the short alias is the documented public surface.

> **No surface tokens at Tier 2.** DryUI does not expose `--dry-color-surface` or `--dry-color-surface-raised` as user-overridable tokens. "Surface" is a visual choice, not a semantic primitive: if your design wants raised cards, sunken sections, or no surfaces at all, write that CSS in your own page styles. Components manage their own internal surfaces (Dialog backdrop, Drawer pane, Popover content) via Tier 3 tokens.

### Tier 3: Component tokens

Per-component overrides. Reference semantic tokens by default. Component-internal — leave them alone unless you have a specific reason.

```css
--dry-form-control-bg
--dry-form-control-border
--dry-form-control-radius
--dry-toggle-track-bg
--dry-toggle-selected-bg
```

## Never scale `html` or `body` font-size

DryUI tokens (spacing, type scale, focus rings, control padding, motion distances) are rem-based and tuned for the browser default 16px root. Setting `html { font-size: 9px }` (or any non-default value) silently shrinks every component by that ratio: a `var(--dry-space-4)` gap drops from 16px to 9px, a `var(--dry-type-small-size)` body line falls from 16px to 9px, focus rings under-render at 1.1px and disappear under sub-pixel rounding. The whole interface goes off-key.

```css
/* Incorrect: scaling the root to make a layout fit */
html {
	font-size: 9px;
}
```

If a layout overflows or text wraps awkwardly, the fix is in the grid track in `src/layout.css` (widen the column, raise the breakpoint, or switch to `minmax(0, 1fr)`), not the root type scale. See `composition.md` for the canonical grid track recipes.

```css
/* Correct: leave the root alone, fix the track */
html {
	/* no font-size declaration. Browser default (16px) wins. */
}

[data-layout='dashboard'] {
	display: grid;
	grid-template-columns: 16rem minmax(0, 1fr) 20rem;
}
```

Hard-coded `font-size: 2.4rem` overrides on headings are the same smell at a smaller scale: reach for the `--dry-type-heading-*` tokens (or `--dry-type-ui-section-*` / `--dry-type-ui-display-*`) and let the type ladder stay coherent. If the heading still does not fit, restructure the grid track, do not shrink the type.

## Tokens are exhaustive

Only the tokens defined in `packages/ui/src/themes/default.css` (and its theme siblings: `dark.css`, `aurora.css`, `midnight.css`, `terminal.css`) exist. Do not invent token names. If a name does not appear in the canonical theme file, it is not a real token, and `var(--dry-color-foo)` falls back to `unset` and silently breaks contrast.

The shipped colour families (consult `default.css` for the authoritative list):

- **Public Tier 2 aliases**: see _Tier 2: Semantic tokens_ above for the full list. Override any of those to retheme; the long Tier 3 names below derive from them.
- **Text**: `--dry-color-text-strong`, `--dry-color-text-weak`, `--dry-color-text-disabled`, `--dry-color-text-inverse`, `--dry-color-text-inverse-weak`, `--dry-color-text-brand`, `--dry-color-text-error`, `--dry-color-text-warning`, `--dry-color-text-success`, `--dry-color-text-info`, `--dry-color-text-purple`.
- **Background**: `--dry-color-bg-base`, `--dry-color-bg-raised`, `--dry-color-bg-overlay`, `--dry-color-bg-sunken`, `--dry-color-bg-alternate`, `--dry-color-bg-inverse`, `--dry-color-bg-floating`. Plus the bare alias `--dry-color-bg`, which resolves to `--dry-color-bg-base`.
- **Stroke (border)**: `--dry-color-stroke-strong`, `--dry-color-stroke-weak`, `--dry-color-stroke-focus`, `--dry-color-stroke-selected`, `--dry-color-stroke-disabled`, `--dry-color-stroke-brand`, `--dry-color-stroke-brand-strong`, plus the status variants `--dry-color-stroke-{error,warning,success,info,purple,accent}` (most also have a `-strong` form).
- **Fill (filled surfaces)**: `--dry-color-fill`, `--dry-color-fill-hover`, `--dry-color-fill-active`, `--dry-color-fill-weak`, `--dry-color-fill-weaker`, `--dry-color-fill-selected`, `--dry-color-fill-disabled`, `--dry-color-fill-inverse`, `--dry-color-fill-inverse-weak`, `--dry-color-fill-brand`, `--dry-color-fill-brand-hover`, `--dry-color-fill-brand-active`, `--dry-color-fill-brand-weak`, plus status variants `--dry-color-fill-{error,warning,success,info,accent,purple,yellow}` (most have a `-weak` form, error has `-hover`).
- **Brand and on-brand**: `--dry-color-brand`, `--dry-color-on-brand`, `--dry-color-on-error`, `--dry-color-on-warning`, `--dry-color-on-success`, `--dry-color-on-purple`.
- **Focus**: `--dry-color-focus-ring` (used by the `--dry-focus-ring` shorthand).
- **Icon**: `--dry-color-icon`.

If you need a token that is not in the file, write your own custom property in your app CSS (e.g. `--app-card-bg`) instead of inventing a `--dry-*` name.

```css
/* Incorrect: invented tokens resolve to unset, contrast collapses */
.sidebar {
	background: var(--dry-color-surface-raised-2);
	color: var(--dry-color-headline);
}

/* Correct: use a real token, or define your own under a non-dry prefix */
.sidebar {
	background: var(--dry-color-bg-raised);
	color: var(--dry-color-text-strong);
}
```

When in doubt, `grep -nE '^\s*--dry-color-' packages/ui/src/themes/default.css` is the authoritative list. The lint package flags unknown component (Tier 3) tokens via `unknown-component-token`, but typo'd colour names will not error: they will silently resolve to `unset`. Treat the canonical theme file as the only source of truth.

## Setting Up Themes

### Greenfield project

Import the default theme in your root layout or app entry:

```svelte
<script>
	import '@dryui/ui/themes/default.css';
	import '@dryui/ui/themes/dark.css';
</script>
```

Default to a bare `<html>` — light tokens apply, nothing dark fires:

```html
<html></html>
```

Opt into the OS preference with `class="theme-auto"`, or pin a theme with `data-theme="light"` or `data-theme="dark"`. See "Dark Mode" below for the full set of recipes.

### Common mistakes

```svelte
<!-- Incorrect: no theme import, components render unstyled -->
<script>
  import { Button } from '@dryui/ui';
</script>

<!-- Correct: theme imported before using components -->
<script>
  import '@dryui/ui/themes/default.css';
  import { Button } from '@dryui/ui';
</script>
```

## Customizing the Palette

Override one or two semantic tokens in your global CSS to align components with your brand. Use values from your design system; never hardcode hex in component CSS.

```css
:root {
	--dry-color-primary: var(--brand-primary);
	--dry-color-primary-hover: var(--brand-primary-hover);
}
```

Most apps need nothing more than primary + primary-hover. Add danger / success / warning only if your design calls for distinct status colours. Page background, page text, surface treatment, typography: write those in your own CSS, not as token overrides.

### Incorrect vs Correct customization

```css
/* Incorrect: hardcoded color buried in component CSS */
.brand-button {
	background: #2563eb;
}

/* Correct: override the semantic token, components inherit */
:root {
	--dry-color-primary: var(--brand-primary);
}
```

```css
/* Incorrect: reaching into component (Tier 3) tokens */
:root {
	--dry-form-control-bg: var(--brand-surface);
	--dry-toggle-selected-bg: var(--brand-primary);
}

/* Correct: override semantic (Tier 2) tokens; component tokens inherit */
:root {
	--dry-color-primary: var(--brand-primary);
}
```

## Dark Mode

### Option A: Light-only (default)

Leave `<html>` bare. Light tokens apply, the dark block never fires — even if `dark.css` is imported and the OS prefers dark.

```html
<html></html>
```

This is the scaffold default. Reach for it whenever the design is light-only (most marketing / docs / brand sites, and any app that hasn't explicitly designed a dark variant).

### Option B: System theme

Import both theme files and add `class="theme-auto"` to `<html>`.

```html
<html class="theme-auto"></html>
```

This follows `prefers-color-scheme` automatically.

### Option C: Explicit override with data-theme

Force a specific theme:

```html
<html data-theme="dark"></html>
```

Use `data-theme="light"` for the inverse.

### Option C.1: System theme with a light fallback

For a site that should follow the OS but stay light when the user has no preference, combine both attributes on `<html>`:

```html
<html class="theme-auto" data-theme="light"></html>
```

- `data-theme="light"` pins the page to light tokens even on a dark-preferring OS. The `.theme-auto` dark block is guarded with `:not([data-theme='light'])`, so a dark OS cannot silently override your light design.
- `class="theme-auto"` stays so an opt-in dark toggle (flipping `data-theme` to `"dark"`) keeps working. Drop `theme-auto` entirely only if you never want a dark pathway, and the explicit `data-theme='dark']` rule is enough on its own.

Use this recipe when you want explicit user control plus system awareness.

### Option C: Persisted theme toggle

If you add a theme switcher, keep system mode as the default and only store explicit user choices:

```js
const preference = localStorage.getItem('theme');

if (preference === 'light' || preference === 'dark') {
	document.documentElement.dataset.theme = preference;
	document.documentElement.classList.remove('theme-auto');
} else {
	delete document.documentElement.dataset.theme;
	document.documentElement.classList.add('theme-auto');
}
```

### Option D: Media query token overrides

Import default theme, then override tokens for dark mode. Reference your own brand primitives, not raw hex:

```css
@media (prefers-color-scheme: dark) {
	:root {
		--dry-color-primary: var(--brand-primary-dark);
		--dry-color-primary-hover: var(--brand-primary-hover-dark);
	}
}
```

### Option E: Class-based toggle

```css
.dark {
	--dry-color-primary: var(--brand-primary-dark);
}
```

```svelte
<script>
	let isDark = $state(false);
</script>

<div class:dark={isDark}>
	<Button onclick={() => (isDark = !isDark)}>Toggle Theme</Button>
</div>
```

## Common Pitfalls

### Missing color pairings

When defining a primary color, always define its hover state too. The lesson is the pair, not the specific hue.

```css
/* Incorrect: primary without hover */
:root {
	--dry-color-primary: var(--brand-primary);
}

/* Correct: primary with hover pair */
:root {
	--dry-color-primary: var(--brand-primary);
	--dry-color-primary-hover: var(--brand-primary-hover);
}
```

### Low contrast text

When you override `--dry-color-bg`, ensure `--dry-color-text` has enough contrast against it (WCAG AA: 4.5:1 for body text, 3:1 for large text).

```css
/* Incorrect: text and background too close */
:root {
	--dry-color-bg: var(--brand-bg-dark);
	--dry-color-text: var(--brand-text-dim); /* fails contrast against bg */
}

/* Correct: pick a text token with sufficient contrast */
:root {
	--dry-color-bg: var(--brand-bg-dark);
	--dry-color-text: var(--brand-text-strong);
}
```

### Reaching for surface tokens

If a previous version of these docs (or another design system) taught you to override `--dry-color-surface` or `--dry-color-surface-raised`, stop. DryUI does not expose those as user-facing tokens. If your design wants visible cards, sections, or panels, write that CSS in your own page styles or component wrappers — not as a global token override.

```css
/* Incorrect: assumes a Tier 2 surface token exists */
:root {
	--dry-color-surface: var(--brand-surface);
}

/* Correct: style the wrapper directly in your own CSS */
.brand-card {
	background: var(--brand-surface);
	border-radius: var(--brand-radius);
	padding: var(--dry-space-6);
}
```

## Validating Theme CSS

Validate theme CSS by rebuilding or checking the app with `@dryui/lint` wired and reviewing the resulting diagnostics:

```bash
bun run check
```

Common diagnostic codes:

| Code                | Meaning                             | Fix                                        |
| ------------------- | ----------------------------------- | ------------------------------------------ |
| `missing-token`     | Required semantic token not defined | Add the token                              |
| `low-contrast-text` | Text too close to background        | Increase brightness difference             |
| `missing-pairing`   | Color without contrast pair         | Add the missing pair (e.g., primary-hover) |
