<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getCalendarCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children?: Snippet;
	}

	let { children, class: className, ...rest }: Props = $props();

	const ctx = getCalendarCtx();
</script>

<button
	type="button"
	aria-label="Next month"
	disabled={ctx.disabled}
	data-calendar-nav
	class={className}
	onclick={() => ctx.nextMonth()}
	{...rest}
>
	{#if children}
		{@render children()}
	{:else}
		&#8250;
	{/if}
</button>

<style>
	[data-calendar-nav] {
		display: inline-grid;
		place-items: center;
		height: var(--dry-space-8);
		aspect-ratio: 1;
		border: 1px solid transparent;
		border-radius: var(--dry-calendar-day-radius, var(--dry-radius-md));
		background: transparent;
		color: var(--dry-calendar-header-color, var(--dry-color-text-strong));
		cursor: pointer;
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			border-color var(--dry-duration-fast) var(--dry-ease-default);

		&:hover:not([disabled]) {
			background: var(--dry-calendar-day-hover-bg, var(--dry-color-bg-raised));
			border-color: var(--dry-color-stroke-strong);
		}

		&:focus-visible {
			outline: 2px solid var(--dry-color-focus-ring);
			outline-offset: 1px;
		}
	}
</style>
