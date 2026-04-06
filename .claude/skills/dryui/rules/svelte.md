# Svelte 5 Standards

## Core Principle

Use Svelte 5 runes correctly. Use native browser APIs. No legacy patterns.

## Rune Rules

### `$state` -- Only for reactive variables

```svelte
// GOOD: reactive variable that triggers UI updates let count = $state(0); // GOOD: use $state.raw
for large objects that are reassigned, not mutated let items = $state.raw(await fetchItems()); //
BAD: deep proxy overhead on large data let items = $state(await fetchItems());
```

### `$derived` -- For computed values, NOT `$effect`

```svelte
// GOOD
let doubled = $derived(count * 2);
let filtered = $derived.by(() => items.filter(i => i.active));

// BAD: never update state inside $effect
let doubled;
$effect(() => { doubled = count * 2; }); // WRONG
```

### `$effect` -- Escape hatch, mostly avoid

Use `$effect` ONLY for:

- Syncing with external libs (D3, maps, canvas)
- Browser API setup that needs cleanup (observers, listeners)
- NOT for derived state, NOT for event responses

**Never use two `$effect`s for bidirectional sync.** They race: Effect A sees a derived value change, reads the stale prop, and overwrites the state back to the old value before Effect B can sync the prop.

```svelte
// BAD: two effects fighting over the same state
$effect(() => {
  if (value !== hex && isValidHex(value)) internalHsv = rgbToHsv(hexToRgb(value));
});
$effect(() => { value = hex; }); // races with Effect 1

// GOOD: sync prop directly in setter, single effect for external changes
function updateHsv(hsv: HSV) {
  internalHsv = hsv;
  const newHex = rgbToHex(hsvToRgb(hsv));
  lastSyncedValue = newHex;
  value = newHex;
}
let lastSyncedValue = value;
$effect.pre(() => {
  if (value !== lastSyncedValue && isValid(value)) {
    lastSyncedValue = value;
    internalState = parse(value);
  }
});
```

Prefer `{@attach}` for DOM element lifecycle:

```svelte
<!-- GOOD: attach for element lifecycle -->
<canvas {@attach node => { const ctx = node.getContext('2d'); ... }}></canvas>

<!-- BAD: $effect + bind:this -->
<script>
  let canvas;
  $effect(() => { if (canvas) { ... } });
</script>
<canvas bind:this={canvas}></canvas>
```

### `$props` -- Always typed, always destructured

```svelte
<script lang="ts">
	interface Props extends HTMLButtonAttributes {
		variant?: 'solid' | 'outline' | 'ghost';
		size?: 'sm' | 'md' | 'lg';
	}
	let { variant = 'solid', size = 'md', children, ...rest }: Props = $props();
</script>
```

### `$bindable` -- For two-way binding props

```svelte
<script lang="ts">
	interface Props {
		value: string;
	}
	let { value = $bindable('') }: Props = $props();
</script>
```

When a component has internal state derived from a `$bindable` prop, sync the prop in setter functions -- never via `$effect` chains.

## Component Patterns

### Snippets replace slots

```svelte
<!-- Component receives snippet as prop -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Props {
		icon?: Snippet;
		children: Snippet;
	}
	let { icon, children }: Props = $props();
</script>

{#snippet icon()}
	<svg>...</svg>
{/snippet}
<Button {icon}>Click me</Button>
<button>
	{#if icon}{@render icon()}{/if}
	{@render children()}
</button>
```

### Compound components via context

```typescript
// context.svelte.ts
import { getContext, setContext } from 'svelte';
const KEY = Symbol('accordion');

export function setAccordionCtx(ctx: AccordionState) {
	setContext(KEY, ctx);
}
export function getAccordionCtx(): AccordionState {
	return getContext(KEY);
}
```

### Shared reactive logic in `.svelte.ts` files

```typescript
export function createCounter(initial = 0) {
	let count = $state(initial);
	return {
		get count() {
			return count;
		},
		increment() {
			count++;
		},
		reset() {
			count = initial;
		}
	};
}
```

### Event handling in component libraries

Svelte 5 compiles `onclick` on elements into event delegation. This can fail on `<div>` elements in published packages. Use actions for reliable native event binding on non-button elements:

```svelte
// BAD: onclick on <div> in component library
<div onclick={handleClick} {...rest}></div>

// GOOD: Svelte action with native addEventListener
<script>
  function interactive(node: HTMLElement) {
    function handleClick() { /* ... */ }
    node.addEventListener('click', handleClick);
    return { destroy() { node.removeEventListener('click', handleClick); } };
  }
</script>
<div use:interactive {...rest}></div>
```

## Native Browser APIs -- No Libraries

| Need        | Use                              | NOT                   |
| ----------- | -------------------------------- | --------------------- |
| Modals      | `<dialog>` + `showModal()`       | JS modal libs         |
| Dropdowns   | Popover API (`popover="auto"`)   | Floating UI           |
| Positioning | CSS Anchor Positioning           | Floating UI/Popper    |
| Responsive  | Container queries (`@container`) | Media queries         |
| Focus trap  | `<dialog>` + `inert` attribute   | focus-trap libs       |
| Scroll lock | `<dialog>` modal behavior        | body-scroll-lock      |
| Accordions  | `<details name="group">`         | custom JS             |
| Animations  | Web Animations API / CSS         | GSAP for simple cases |
| Dates       | `Intl.DateTimeFormat`            | moment/date-fns       |
| Copy/paste  | Clipboard API                    | clipboard.js          |

### Popover API: `auto` vs `manual`

`popover="auto"` gives free light-dismiss but only works with `popovertarget` on `<button>`. Components that open programmatically must use `popover="manual"` with explicit dismiss logic.

## Styling Rules

- Svelte scoped `<style>` blocks -- no CSS modules
- CSS variables (`--dry-*`) for theming
- Container queries for responsive layout -- never media queries for sizing
- `data-state`, `data-disabled` attributes for state-based styling
- No inline styles except dynamic values from props
- Never use `!important` or `:global()`

### CSS custom property tokens: use `var()` fallbacks

```css
/* BAD: local declaration blocks parent overrides */
.root {
	--sidebar-width: 18rem;
	width: var(--sidebar-width);
}

/* GOOD: fallback lets parents override */
.root {
	width: var(--sidebar-width, 18rem);
}
```

## SSR Safety

Guard browser APIs with `onMount` or `{@attach}`:

```svelte
<script>
	import { onMount } from 'svelte';
	let mounted = $state(false);
	onMount(() => {
		mounted = true;
	});
</script>
```
