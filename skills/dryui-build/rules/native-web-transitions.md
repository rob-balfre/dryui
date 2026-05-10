# Native Web Transitions

Use this file when adding motion to a DryUI interface. Motion must be progressive, native, accessible, and easy to remove.

## Default Approach

1. Build a fully functional no-animation version first.
2. Use CSS transitions, the View Transitions API, scroll-driven animations, or small Svelte transitions only after layout and accessibility are correct.
3. Keep motion local to the component or route that owns the interaction.
4. Never use motion to hide missing loading, disabled, empty, or error states.
5. Respect reduced motion.

## View Transition Pattern

Use View Transitions for route or state changes where the old and new DOM are both meaningful.

```ts
function withViewTransition(update: () => void) {
	if (!document.startViewTransition) {
		update();
		return;
	}

	document.startViewTransition(update);
}
```

```svelte
<Button onclick={() => withViewTransition(() => (view = 'detail'))}>Open detail</Button>
```

Keep `view-transition-name` specific and sparse. Do not name every node on the page.

## CSS Transition Pattern

Use tokenized durations and properties that do not disturb layout.

```css
[data-state='open'] {
	opacity: 1;
	transform: translateY(0);
	transition:
		opacity var(--dry-duration-fast) var(--dry-ease-standard),
		transform var(--dry-duration-fast) var(--dry-ease-standard);
}
```

Prefer opacity and transform. Avoid animating width, height, inline-size, grid tracks, or layout-critical spacing.

## Reduced Motion

Reduced-motion media queries are allowed for motion preferences. They are not layout breakpoints.

```css
@media (prefers-reduced-motion: reduce) {
	[data-state='open'] {
		transition: none;
	}
}
```

In JavaScript, skip replay, typewriter, stagger, and delayed reveal effects when reduced motion is active.

## Svelte Notes

- Use Svelte transitions for local entrance/exit effects only.
- Do not use transitions to compensate for unstable layout.
- Avoid storing animation state in `$effect`; update state from user events or explicit lifecycle points.
- Clean up timers, observers, and animation handles.

## Checklist

1. The UI works with all animation removed.
2. Motion uses native browser or Svelte primitives.
3. Reduced motion produces an immediate or near-immediate final state.
4. Animation does not change layout tracks or cause text overlap.
5. Motion styles do not use `!important`, `:global()`, or inline style hacks.
