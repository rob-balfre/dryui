<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		orientation?: 'vertical' | 'horizontal';
		children: Snippet;
	}

	let { orientation = 'vertical', class: className, children, ...rest }: Props = $props();
</script>

<div role="list" data-part="root" data-orientation={orientation} class={className} {...rest}>
	{@render children()}
</div>

<style>
	[data-part='root'] {
		--dry-timeline-line-color: var(--dry-color-stroke-weak);
		--dry-timeline-dot-size: 0.875rem;
		--dry-timeline-dot-color: var(--dry-color-fill-brand);
		--dry-timeline-gap: var(--dry-space-4);
		--dry-timeline-item-gap: var(--dry-space-3);
		--dry-timeline-content-gap: var(--dry-space-1);

		display: grid;
		gap: var(--dry-timeline-gap);
		color: var(--dry-color-text-strong);
	}

	[data-part='root'][data-orientation='horizontal'] {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-4);
		overflow-x: auto;
		padding-bottom: var(--dry-space-1);

		--dry-timeline-item-columns: 1fr;
		--dry-timeline-item-min-w: 16rem;
		--dry-timeline-item-pl: 0;
		--dry-timeline-item-pt: var(--dry-space-4);
		--dry-timeline-line-left: 0;
		--dry-timeline-line-top: calc(var(--dry-timeline-dot-size) / 2 + var(--dry-space-2));
		--dry-timeline-line-right: calc(var(--dry-space-1) * -1);
		--dry-timeline-line-bottom: auto;
		--dry-timeline-line-w: auto;
		--dry-timeline-line-h: 1px;
	}
</style>
