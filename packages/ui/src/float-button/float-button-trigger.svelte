<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import { getFloatButtonCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		size?: 'sm' | 'md' | 'lg';
		children: Snippet;
	}

	let { children, size = 'md', ...rest }: Props = $props();

	const ctx = getFloatButtonCtx();

	const btnSize = $derived(size === 'sm' ? 'icon-sm' : size === 'lg' ? 'icon-lg' : 'icon');
</script>

<div class="trigger-slot">
	<Button
		variant="solid"
		size={btnSize}
		type="button"
		aria-expanded={ctx.open}
		aria-controls={ctx.menuId}
		data-state={ctx.open ? 'open' : 'closed'}
		data-float-button-trigger
		onclick={() => ctx.toggle()}
		{...rest}
	>
		{@render children()}
	</Button>
</div>

<style>
	.trigger-slot {
		display: grid;
		/* `order` lets the trigger sit visually last (closest to the anchored
		   corner) while keeping it first in the DOM for keyboard focus order.
		   Auto-flow places the actions in rows 1..n above it. */
		order: 1;
	}
</style>
