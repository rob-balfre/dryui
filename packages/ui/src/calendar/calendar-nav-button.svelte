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

	const label = $derived.by(() => {
		const verb = direction === 'prev' ? 'Previous' : 'Next';
		return `${verb} ${ctx.view === 'week' ? 'week' : 'month'}`;
	});

	function handleClick() {
		if (ctx.view === 'week') {
			direction === 'prev' ? ctx.prevWeek() : ctx.nextWeek();
		} else {
			direction === 'prev' ? ctx.prevMonth() : ctx.nextMonth();
		}
	}
</script>

<NavArrowButton
	{direction}
	variant="trigger"
	size="icon-sm"
	{label}
	disabled={ctx.disabled}
	onclick={handleClick}
	{children}
	{...rest}
/>
