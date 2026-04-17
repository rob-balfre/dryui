<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children?: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<div data-part="icon" class={className} {...rest}>
	{#if children}
		{@render children()}
	{/if}
</div>

<style>
	[data-part='icon'] {
		display: inline-grid;
		place-items: center;
		height: var(--dry-timeline-dot-size, 0.875rem);
		aspect-ratio: 1;
		margin-block-start: var(
			--dry-timeline-icon-offset,
			calc(
				(var(--dry-timeline-content-line-height, 1.5rem) - var(--dry-timeline-dot-size, 0.875rem)) /
					2
			)
		);
		border-radius: var(--dry-radius-full);
		background: var(--dry-timeline-dot-color, var(--dry-color-fill-brand));
		color: var(--dry-color-bg-raised);
		font-family: var(--dry-font-sans);
		font-size: var(--dry-timeline-icon-font-size, var(--dry-type-tiny-size));
		font-weight: 700;
		font-variant-numeric: tabular-nums lining-nums;
		line-height: 1;
		box-shadow: 0 0 0 3px var(--dry-color-bg-raised);
	}
</style>
