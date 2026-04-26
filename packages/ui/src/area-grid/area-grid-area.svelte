<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	export type AreaGridAreaElement =
		| 'section'
		| 'header'
		| 'main'
		| 'nav'
		| 'aside'
		| 'article'
		| 'footer';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
		as?: AreaGridAreaElement;
		children: Snippet;
	}

	let { as = 'section', children, class: className, ...rest }: Props = $props();
</script>

<!-- dryui-allow svelte-element -->
<svelte:element this={as} data-area-grid-area class={className} {...rest}>
	{@render children()}
</svelte:element>

<style>
	[data-area-grid-area] {
		--_dry-area-grid-area: var(--dry-area-grid-area, auto);

		grid-area: var(--_dry-area-grid-area);
		display: var(--dry-area-grid-area-display, block);
		align-content: start;
		gap: var(--dry-area-grid-area-gap, 0);
		min-block-size: 0;
		padding: var(--dry-area-grid-area-padding, 0);
		border: var(--dry-area-grid-area-border, 0 solid transparent);
		border-radius: var(--dry-area-grid-area-radius, 0);
		background: var(--dry-area-grid-area-bg, transparent);
		color: var(--dry-area-grid-area-color, inherit);
	}
</style>
