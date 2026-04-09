<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<div role="listitem" data-part="item" class={className} {...rest}>
	{@render children()}
</div>

<style>
	[data-part='item'] {
		position: relative;
		display: grid;
		grid-template-columns: var(--dry-timeline-item-columns, auto minmax(0, 1fr));
		align-items: start;
		gap: var(--dry-timeline-item-gap, var(--dry-space-3));
		padding-left: var(--dry-timeline-item-pl, var(--dry-space-4));
		padding-top: var(--dry-timeline-item-pt, 0);
	}

	[data-part='item']::before {
		content: '';
		position: absolute;
		left: var(
			--dry-timeline-line-left,
			calc(var(--dry-timeline-dot-size, 0.875rem) / 2 + var(--dry-space-2))
		);
		top: var(
			--dry-timeline-line-top,
			calc(var(--dry-timeline-dot-size, 0.875rem) + var(--dry-space-1))
		);
		bottom: var(--dry-timeline-line-bottom, calc(var(--dry-space-1) * -1));
		right: var(--dry-timeline-line-right, auto);
		height: var(--dry-timeline-line-h, auto);
		border-left: var(--dry-timeline-line-w, 1px) solid
			var(--dry-timeline-line-color, var(--dry-color-stroke-weak));
	}
</style>
