<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import { getAccordionCtx, getAccordionItemCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getAccordionCtx();
	const itemCtx = getAccordionItemCtx();
</script>

<Button
	variant="trigger"
	type="button"
	--dry-btn-justify="space-between"
	--dry-btn-radius="0"
	--dry-btn-active-transform="none"
	aria-expanded={itemCtx.open}
	aria-controls={itemCtx.contentId}
	data-state={itemCtx.open ? 'open' : 'closed'}
	disabled={itemCtx.disabled}
	{...rest}
	onclick={() => ctx.toggle(itemCtx.value)}
>
	{@render children()}
	<svg
		data-indicator
		class:open={itemCtx.open}
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

	@media (prefers-reduced-motion: reduce) {
		svg[data-indicator] {
			transition: none;
		}
	}
</style>
