# Theming

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
--dry-type-small-size
--dry-text-sm-size
```

### Tier 2: Semantic tokens

Map intent to primitive values. Override these to customize the palette.

```css
--dry-color-fill-brand        /* Main brand fill */
--dry-color-fill-brand-hover  /* Brand fill on hover */
--dry-color-fill-error        /* Destructive actions */
--dry-color-fill-success      /* Success states */
--dry-color-fill-warning      /* Warning states */
--dry-color-bg-base           /* Page background */
--dry-color-bg-raised         /* Cards and panels */
--dry-color-bg-overlay        /* Popovers, dialogs, menus */
--dry-color-text-strong       /* Primary text */
--dry-color-text-weak         /* Secondary/helper text */
--dry-color-text-disabled     /* Disabled/placeholder text */
--dry-color-stroke-weak       /* Default subtle border */
--dry-color-stroke-strong     /* Strong or hover border */
```

### Tier 3: Component tokens

Per-component overrides. Reference semantic tokens by default.

```css
--dry-card-bg              /* defaults to var(--dry-color-bg-raised) */
--dry-card-radius
--dry-btn-bg
--dry-btn-radius
--dry-input-border
--dry-input-bg
```

## Setting Up Themes

### Greenfield project

Import the default theme in your root layout or app entry:

```svelte
<script>
	import '@dryui/ui/themes/default.css';
	import '@dryui/ui/themes/dark.css';
</script>
```

Prefer system mode by default:

```html
<html class="theme-auto"></html>
```

Use `data-theme="light"` or `data-theme="dark"` only when you need an explicit override.

### Common mistakes

```svelte
<!-- Incorrect: no theme import, components render unstyled -->
<script>
  import { Button, Card } from '@dryui/ui';
</script>

<!-- Correct: theme imported before using components -->
<script>
  import '@dryui/ui/themes/default.css';
  import { Button, Card } from '@dryui/ui';
</script>
```

## Customizing the Palette

Override semantic tokens in your global CSS to match your brand:

```css
:root {
	--dry-color-fill-brand: #2563eb;
	--dry-color-fill-brand-hover: #1d4ed8;
	--dry-color-fill-brand-active: #1e40af;
	--dry-color-fill-error: #dc2626;
	--dry-color-fill-success: #16a34a;
	--dry-color-bg-base: #f1f5f9;
	--dry-color-bg-raised: #ffffff;
	--dry-color-bg-overlay: #f8fafc;
	--dry-color-text-strong: #0f172a;
	--dry-color-text-weak: #475569;
	--dry-color-stroke-weak: #e2e8f0;
	--dry-color-stroke-strong: #cbd5e1;
}
```

### Incorrect vs Correct customization

```css
/* Incorrect: hardcoding colors in component styles */
.my-card {
	background: #1e293b;
	border: 1px solid #334155;
}

/* Correct: override tokens, let components inherit */
:root {
	--dry-color-bg-raised: #1e293b;
	--dry-color-stroke-weak: #334155;
}
```

```css
/* Incorrect: overriding component tokens with raw values */
:root {
	--dry-card-bg: #1e293b;
	--dry-btn-bg: #2563eb;
	--dry-input-bg: #0f172a;
}

/* Correct: override semantic tokens; component tokens inherit */
:root {
	--dry-color-bg-raised: #1e293b;
	--dry-color-fill-brand: #2563eb;
	--dry-color-bg-base: #0f172a;
}
```

## Dark Mode

### Option A: System theme by default

Import both theme files and add `class="theme-auto"` to `<html>`.

```html
<html class="theme-auto"></html>
```

This follows `prefers-color-scheme` automatically.

### Option B: Explicit override with data-theme

Force a specific theme:

```html
<html data-theme="dark"></html>
```

Use `data-theme="light"` for the inverse.

### Option B.1: Light-only sites

For a site that should always render light (brand / marketing / docs), combine
both attributes on `<html>`:

```html
<html class="theme-auto" data-theme="light"></html>
```

- `data-theme="light"` pins the page to light tokens even on a dark-preferring
  OS. The `.theme-auto` dark block is guarded with
  `:not([data-theme='light'])`, so a dark OS cannot silently override your
  light design.
- `class="theme-auto"` stays so an opt-in dark toggle (flipping `data-theme`
  to `"dark"`) keeps working. Drop `theme-auto` entirely only if you never
  want a dark pathway, and the explicit `data-theme='dark']` rule is enough
  on its own.

Use `ask --scope recipe "light only"` for the full scaffold.

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

Import default theme, then override tokens for dark mode:

```css
@media (prefers-color-scheme: dark) {
	:root {
		--dry-color-bg-base: #0f172a;
		--dry-color-bg-raised: #1e293b;
		--dry-color-bg-overlay: #334155;
		--dry-color-text-strong: #f1f5f9;
		--dry-color-text-weak: #94a3b8;
		--dry-color-stroke-weak: #334155;
	}
}
```

### Option E: Class-based toggle

```css
.dark {
	--dry-color-bg-base: #0f172a;
	--dry-color-bg-raised: #1e293b;
	--dry-color-text-strong: #f1f5f9;
	/* ... remaining tokens */
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

### Transparent surfaces

Surfaces with low alpha values make cards and panels invisible or washed out.

```css
/* Incorrect: transparent surface */
:root {
	--dry-color-bg-raised: rgba(217, 158, 100, 0.07);
}

/* Correct: solid surface color */
:root {
	--dry-color-bg-raised: #2d2520;
}
```

### Missing color pairings

When defining a brand fill color, define its hover and active states too.

```css
/* Incorrect: brand fill without interaction states */
:root {
	--dry-color-fill-brand: #2563eb;
}

/* Correct: brand fill with interaction states */
:root {
	--dry-color-fill-brand: #2563eb;
	--dry-color-fill-brand-hover: #1d4ed8;
	--dry-color-fill-brand-active: #1e40af;
}
```

### Low contrast text

Ensure sufficient contrast between text and background.

```css
/* Incorrect: text too close to background */
:root {
	--dry-color-bg-base: #1a1a2e;
	--dry-color-text-strong: #2a2a3e; /* barely visible */
}

/* Correct: high contrast */
:root {
	--dry-color-bg-base: #1a1a2e;
	--dry-color-text-strong: #e2e8f0;
}
```

## Validating Theme CSS

Use `dryui check <theme.css>` or MCP `check <theme.css>` to catch theme issues. Without either surface, validate by rebuilding the app with `@dryui/lint` wired and checking the resulting diagnostics:

```bash
dryui check src/styles/global.css
```

Common diagnostic codes:

| Code                  | Meaning                               | Fix                                           |
| --------------------- | ------------------------------------- | --------------------------------------------- |
| `missing-token`       | Required semantic token not defined   | Add the token                                 |
| `transparent-surface` | Surface has low opacity               | Use a solid color                             |
| `low-contrast-text`   | Text too close to background          | Increase brightness difference                |
| `no-elevation`        | bg-base and bg-raised are too similar | Make bg-raised lighter/darker                 |
| `missing-pairing`     | Color without contrast pair           | Add the missing pair (e.g., fill-brand-hover) |
