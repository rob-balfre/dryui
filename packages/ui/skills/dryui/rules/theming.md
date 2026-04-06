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
--dry-font-size-sm
```

### Tier 2: Semantic tokens

Map intent to primitive values. Override these to customize the palette.

```css
--dry-color-primary        /* Main brand color */
--dry-color-primary-hover  /* Primary on hover */
--dry-color-danger          /* Destructive actions */
--dry-color-success         /* Success states */
--dry-color-warning         /* Warning states */
--dry-color-surface         /* Card/panel background */
--dry-color-surface-raised  /* Elevated surfaces */
--dry-color-bg              /* Page background */
--dry-color-text            /* Primary text */
--dry-color-text-secondary  /* Secondary text */
--dry-color-muted           /* Disabled/placeholder text */
--dry-color-border          /* Default border */
--dry-color-border-hover    /* Border on hover */
```

### Tier 3: Component tokens

Per-component overrides. Reference semantic tokens by default.

```css
--dry-card-bg              /* defaults to var(--dry-color-surface) */
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
	--dry-color-primary: #2563eb;
	--dry-color-primary-hover: #1d4ed8;
	--dry-color-danger: #dc2626;
	--dry-color-success: #16a34a;
	--dry-color-surface: #ffffff;
	--dry-color-surface-raised: #f8fafc;
	--dry-color-bg: #f1f5f9;
	--dry-color-text: #0f172a;
	--dry-color-text-secondary: #475569;
	--dry-color-border: #e2e8f0;
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
	--dry-color-surface: #1e293b;
	--dry-color-border: #334155;
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
	--dry-color-surface: #1e293b;
	--dry-color-primary: #2563eb;
	--dry-color-bg: #0f172a;
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
		--dry-color-bg: #0f172a;
		--dry-color-surface: #1e293b;
		--dry-color-surface-raised: #334155;
		--dry-color-text: #f1f5f9;
		--dry-color-text-secondary: #94a3b8;
		--dry-color-border: #334155;
	}
}
```

### Option E: Class-based toggle

```css
.dark {
	--dry-color-bg: #0f172a;
	--dry-color-surface: #1e293b;
	--dry-color-text: #f1f5f9;
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
	--dry-color-surface-raised: rgba(217, 158, 100, 0.07);
}

/* Correct: solid surface color */
:root {
	--dry-color-surface-raised: #2d2520;
}
```

### Missing color pairings

When defining a primary color, always define its hover state too.

```css
/* Incorrect: primary without hover */
:root {
	--dry-color-primary: #2563eb;
}

/* Correct: primary with hover pair */
:root {
	--dry-color-primary: #2563eb;
	--dry-color-primary-hover: #1d4ed8;
}
```

### Low contrast text

Ensure sufficient contrast between text and background.

```css
/* Incorrect: text too close to background */
:root {
	--dry-color-bg: #1a1a2e;
	--dry-color-text: #2a2a3e; /* barely visible */
}

/* Correct: high contrast */
:root {
	--dry-color-bg: #1a1a2e;
	--dry-color-text: #e2e8f0;
}
```

## Validating Theme CSS

Run the CLI diagnose command to catch theme issues:

```bash
bunx @dryui/cli diagnose src/styles/global.css
```

Common diagnostic codes:

| Code                  | Meaning                                    | Fix                                        |
| --------------------- | ------------------------------------------ | ------------------------------------------ |
| `missing-token`       | Required semantic token not defined        | Add the token                              |
| `transparent-surface` | Surface has low opacity                    | Use a solid color                          |
| `low-contrast-text`   | Text too close to background               | Increase brightness difference             |
| `no-elevation`        | surface and surface-raised are too similar | Make surface-raised lighter/darker         |
| `missing-pairing`     | Color without contrast pair                | Add the missing pair (e.g., primary-hover) |
