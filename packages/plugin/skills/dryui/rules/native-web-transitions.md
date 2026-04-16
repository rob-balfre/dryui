# Native Web Transitions

Use this skill when a UI should animate with platform APIs first, not JS animation libraries.

## Default approach

1. Start from a fully functional no-animation version.
2. Add JS feature detection for `document.startViewTransition` before calling it.
3. Gate transition-specific CSS with `@supports (view-transition-name: foo)`.
4. Gate scroll-driven CSS with `@supports (animation-timeline: view())`.
5. Add `prefers-reduced-motion` handling that removes typewriter, transition, and scroll-linked animation.
6. Keep fallback behavior immediate and complete rather than approximating the effect with extra JS.

## View Transition pattern

Use when DOM changes should animate as a single state change.

```ts
function runWithViewTransition(update: () => void) {
	if (!document.startViewTransition) {
		update();
		return Promise.resolve();
	}

	const transition = document.startViewTransition(update);
	return transition.finished.catch(() => {});
}
```

Use stable names only on the elements that should animate:

```css
@supports (view-transition-name: foo) {
	.message {
		view-transition-name: var(--vt-name);
	}

	::view-transition-new(message-enter) {
		animation: dry-slide-up 240ms ease-out;
	}
}
```

Notes:

- Assign unique `view-transition-name` values per inserted item.
- Keep transitions short; they should clarify state changes, not delay interaction.
- Trigger follow-up work such as `scrollIntoView` after `transition.finished`.

## Scroll-driven reveal pattern

Use for footer or section entry reveals tied to viewport position.

```css
@supports (animation-timeline: view()) {
	.reveal {
		animation: dry-fade-up linear both;
		animation-timeline: view();
		animation-range: entry 15% cover 35%;
	}
}
```

Fallback: leave the section fully visible with no animation.

## Reduced motion

Always include a reduced-motion override:

```css
@media (prefers-reduced-motion: reduce) {
	.typing-dot,
	.reveal {
		animation: none !important;
	}

	:root {
		scroll-behavior: auto;
	}
}
```

In JS, skip delayed typewriter/replay steps and render the final state immediately when reduced motion is active.

## Svelte notes

- Keep DOM mutation orchestration in the component that owns the rendered list.
- Use `$effect` or `onMount` for browser-only APIs.
- Do not access `document` or `window` during SSR; guard with `browser` or call inside browser-only lifecycle.
- Prefer state-driven rendering and wrap only the mutation boundary in `startViewTransition`.

## Checklist

- Feature-detected `document.startViewTransition`
- `@supports` around transition CSS
- `@supports` around `animation-timeline`
- `prefers-reduced-motion` disables motion and delay
- Fallback path is functional without animation
- No dependency on third-party animation runtime
