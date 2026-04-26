<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import { getFloatButtonCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getFloatButtonCtx();
</script>

<div class="action-slot" data-state={ctx.open ? 'open' : 'closed'}>
	<Button
		variant="solid"
		size="sm"
		type="button"
		data-float-button-action
		aria-hidden={!ctx.open}
		tabindex={ctx.open ? 0 : -1}
		{...rest}
	>
		{@render children()}
	</Button>
</div>

<style>
	.action-slot {
		--dry-fab-action-scale-closed: 0.85;
		--dry-fab-action-origin: 50% 100%;
		/* Floor the action to a comfortable 44px touch target. Cascades into Button
		   via its --dry-btn-min-height variable so the value applies on every
		   pointer (DryUI lint blocks pointer-media queries). */
		--dry-btn-min-height: 44px;

		display: grid;
		transform-origin: var(--dry-fab-action-origin);
	}

	.action-slot[data-state='closed'] {
		opacity: 0;
		transform: scale(var(--dry-fab-action-scale-closed));
		pointer-events: none;
	}

	@media (prefers-reduced-motion: no-preference) {
		.action-slot {
			transition:
				opacity var(--dry-duration-fast, 0.15s) var(--dry-ease-default, ease-out),
				transform var(--dry-duration-fast, 0.15s) var(--dry-ease-default, ease-out);
		}
	}
</style>
