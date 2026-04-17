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
		--_timeline-item-pl: var(--dry-timeline-item-pl, var(--dry-space-4));
		--_timeline-dot-size: var(--dry-timeline-dot-size, 0.875rem);
		--_timeline-line-w: var(--dry-timeline-line-w, 1px);
		--_timeline-content-lh: var(--dry-timeline-content-line-height, 1.5rem);
		--_timeline-gap: var(--dry-timeline-gap, var(--dry-space-4));

		position: relative;
		display: grid;
		grid-template-columns: var(--dry-timeline-item-columns, auto minmax(0, 1fr));
		align-items: start;
		gap: var(--dry-timeline-item-gap, var(--dry-space-3));
		padding-left: var(--_timeline-item-pl);
		padding-top: var(--dry-timeline-item-pt, 0);
	}

	[data-part='item']::before {
		content: '';
		position: absolute;
		left: var(
			--dry-timeline-line-left,
			calc(var(--_timeline-item-pl) + var(--_timeline-dot-size) / 2 - var(--_timeline-line-w) / 2)
		);
		top: var(
			--dry-timeline-line-top,
			calc((var(--_timeline-content-lh) + var(--_timeline-dot-size)) / 2 + var(--dry-space-1))
		);
		bottom: var(
			--dry-timeline-line-bottom,
			calc(-1 * (var(--_timeline-gap) + var(--_timeline-content-lh) / 2 - var(--dry-space-1)))
		);
		right: var(--dry-timeline-line-right, auto);
		height: var(--dry-timeline-line-h, auto);
		border-left: var(--_timeline-line-w) solid
			var(--dry-timeline-line-color, var(--dry-color-stroke-weak));
	}

	[data-part='item']:last-child::before {
		display: none;
	}
</style>
