<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getCalendarCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { class: className, ...rest }: Props = $props();

	const ctx = getCalendarCtx();
</script>

{#if ctx.categories.length > 0}
	<div data-calendar-event-legend class={className} role="list" {...rest}>
		{#each ctx.categories as category (category.id)}
			<div role="listitem" data-calendar-event-legend-item>
				<span
					data-calendar-event-legend-dot
					aria-hidden="true"
					style={`--dry-calendar-legend-color: ${category.color};`}
				></span>
				<span data-calendar-event-legend-label>{category.label}</span>
			</div>
		{/each}
	</div>
{/if}

<style>
	[data-calendar-event-legend] {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-4);
		align-items: center;
		padding: var(--dry-space-2) 0;
	}

	[data-calendar-event-legend-item] {
		display: inline-grid;
		grid-auto-flow: column;
		align-items: center;
		gap: var(--dry-space-2);
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
	}

	[data-calendar-event-legend-dot] {
		aspect-ratio: 1;
		height: 0.5rem;
		border-radius: 999px;
		background: var(--dry-calendar-legend-color, var(--dry-color-fill-brand));
	}

	[data-calendar-event-legend-label] {
		color: var(--dry-color-text-strong);
	}
</style>
