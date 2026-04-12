<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import NavArrowButton from '../internal/nav-arrow-button.svelte';
	import { getCalendarCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		direction: 'prev' | 'next';
		children?: Snippet;
	}

	let { direction, children, ...rest }: Props = $props();

	const ctx = getCalendarCtx();
</script>

<NavArrowButton
	{direction}
	variant="trigger"
	size="icon-sm"
	label={direction === 'prev' ? 'Previous month' : 'Next month'}
	disabled={ctx.disabled}
	onclick={() => (direction === 'prev' ? ctx.prevMonth() : ctx.nextMonth())}
	{children}
	{...rest}
/>
