<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import { getCollapsibleCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getCollapsibleCtx();
</script>

<Button
	variant="outline"
	type="button"
	aria-expanded={ctx.open}
	aria-controls={ctx.contentId}
	data-state={ctx.open ? 'open' : 'closed'}
	disabled={ctx.disabled}
	{...rest}
	onclick={() => ctx.toggle()}
>
	{@render children()}
	<svg
		data-indicator
		class:open={ctx.open}
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg
	>
</Button>

<style>
	svg[data-indicator] {
		height: 1rem;
		aspect-ratio: 1;
		opacity: 0.5;
		transition: transform var(--dry-duration-fast) var(--dry-ease-default);
	}

	svg[data-indicator].open {
		transform: rotate(180deg);
	}
</style>
