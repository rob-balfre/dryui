# Svelte 5

Use this file when writing or editing Svelte code for a DryUI interface. DryUI assumes Svelte 5 runes, snippets, typed props, and native browser APIs.

## Runes

Use `$state` only for reactive local state.

```svelte
let count = $state(0);
let items = $state.raw(await loadItems());
```

Use `$derived` for computed values.

```svelte
let filtered = $derived.by(() => items.filter((item) => item.active));
```

Do not use `$effect` to maintain derived state.

```svelte
<!-- Incorrect -->
$effect(() => {
	filtered = items.filter((item) => item.active);
});
```

Use `$effect` only for browser lifecycle work, external libraries, observers, listeners, canvas, maps, and cleanup. Avoid paired effects for two-way sync; update bindable props in setter functions instead.

## Props

Props are typed and destructured.

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		value?: string;
		label: string;
		children?: Snippet;
	}

	let { value = $bindable(''), label, children }: Props = $props();
</script>
```

Use `$bindable` only for props that support two-way binding.

## Snippets

Use snippets instead of legacy slots.

```svelte
{#snippet icon()}
	<SearchIcon />
{/snippet}

<Button {icon}>Search</Button>
```

When authoring components, receive snippets as typed props and render them with `{@render ...}`.

## Events

- Use modern event props such as `onclick`, `oninput`, and `onsubmit`.
- Do not mix legacy `on:click` style with Svelte 5 component code.
- For component libraries, expose explicit callbacks or bindable props instead of relying on DOM event forwarding.

## Browser APIs

Prefer native browser APIs over dependencies:

| Need | Prefer |
| --- | --- |
| Dialog semantics | `Dialog` / `AlertDialog` components |
| Popover behavior | Popover API-backed components |
| Resize work | `ResizeObserver` |
| Clipboard | `navigator.clipboard` |
| Dates | `Intl.DateTimeFormat` where possible |
| Responsive layout | CSS container queries |

## Styling

- Use CSS custom properties with fallbacks when authoring reusable components.
- Do not use route-level CSS for page grid/flex layout; use `src/layout.css`.
- Do not use `:global()`, `!important`, or inline styles to bypass lint.
- Keep component CSS local to component visuals, not page structure.

## SSR Safety

- Guard browser-only APIs with browser lifecycle code or environment checks.
- Do not read `window`, `document`, `localStorage`, or layout measurements at module evaluation time.
- Prefer progressive enhancement for browser-only interactions.

## Framework Questions

For SvelteKit load functions, actions, routing, runes edge cases, compiler warnings, or syntax uncertainty, use the available Svelte documentation/MCP tooling first. If that tooling is unavailable, inspect local project examples and run the project Svelte check after editing.
