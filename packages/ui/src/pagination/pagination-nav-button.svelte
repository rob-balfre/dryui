<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import NavArrowButton from '../internal/nav-arrow-button.svelte';
	import { getPaginationCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		direction: 'prev' | 'next';
		children: Snippet;
	}

	let { direction, children, ...rest }: Props = $props();

	const ctx = getPaginationCtx();

	const canAdvance = $derived(direction === 'prev' ? ctx.canPrevious : ctx.canNext);
</script>

<NavArrowButton
	{direction}
	variant="pill"
	size="sm"
	label={direction === 'prev' ? 'Go to previous page' : 'Go to next page'}
	disabled={!canAdvance}
	onclick={() => (direction === 'prev' ? ctx.previous() : ctx.next())}
	{children}
	{...rest}
/>
