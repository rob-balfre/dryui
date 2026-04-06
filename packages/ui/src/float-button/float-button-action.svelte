<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getFloatButtonCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
	}

	let { children, class: className, ...rest }: Props = $props();

	const ctx = getFloatButtonCtx();
</script>

<button
	type="button"
	data-state={ctx.open ? 'open' : 'closed'}
	tabindex={ctx.open ? 0 : -1}
	{...rest}
	class={className}
>
	{@render children()}
</button>

<!-- svelte-ignore css_unused_selector -->
<style>
	[data-float-button-action-wrapper] {
		display: contents;
	}

	[data-float-button-action-wrapper] :where(button) {
		--dry-fab-action-bg: var(--dry-color-bg-overlay);
		--dry-fab-action-color: var(--dry-color-text-strong);
		--dry-fab-action-border: var(--dry-color-stroke-weak);
		--dry-fab-action-shadow: var(--dry-shadow-md);
		--dry-fab-action-size: 44px;

		display: grid;
		place-items: center;
		height: var(--dry-fab-action-size);
		aspect-ratio: 1;
		padding: 0;
		background: var(--dry-fab-action-bg);
		color: var(--dry-fab-action-color);
		border: 1px solid var(--dry-fab-action-border);
		border-radius: 50%;
		box-shadow: var(--dry-fab-action-shadow);
		cursor: pointer;
		opacity: 0;
		transform: scale(0.6) translateY(var(--dry-motion-distance-xs));
		pointer-events: none;
		transition:
			opacity var(--dry-duration-normal) var(--dry-ease-default),
			transform var(--dry-duration-normal) var(--dry-ease-default);

		&[data-state='open'] {
			opacity: 1;
			transform: scale(1) translateY(0);
			pointer-events: auto;
		}

		&[data-state='open']:nth-last-child(2) {
			transition-delay: 0ms;
		}
		&[data-state='open']:nth-last-child(3) {
			transition-delay: 30ms;
		}
		&[data-state='open']:nth-last-child(4) {
			transition-delay: 60ms;
		}
		&[data-state='open']:nth-last-child(5) {
			transition-delay: 90ms;
		}
		&[data-state='open']:nth-last-child(6) {
			transition-delay: 120ms;
		}

		&:hover {
			--dry-fab-action-bg: color-mix(
				in srgb,
				var(--dry-color-fill-brand) 8%,
				var(--dry-color-bg-overlay)
			);
			--dry-fab-action-color: var(--dry-color-fill-brand);
		}

		&:focus-visible {
			outline: 2px solid var(--dry-color-focus-ring);
			outline-offset: 2px;
		}

		&[data-state='open']:active {
			transform: scale(0.9) translateY(0);
		}
	}
</style>
