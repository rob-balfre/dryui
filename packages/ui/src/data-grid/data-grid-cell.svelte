<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLTableCellElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<td role="gridcell" data-dg-cell class={className} {...rest}>
	{@render children()}
</td>

<style>
	[data-dg-cell] {
		padding: var(--dry-data-grid-padding-y) var(--dry-data-grid-padding-x);
		font-size: var(--dry-type-small-size, var(--dry-type-small-size));
		line-height: var(--dry-type-small-leading, var(--dry-type-small-leading));
		color: var(--dry-color-text-strong);
		vertical-align: middle;
	}

	[data-dg-cell][data-pinned] {
		position: sticky;
		left: 0;
		z-index: 1;
		background: inherit;
		box-shadow: 2px 0 4px -2px rgb(15 23 42 / 0.1);
	}

	[data-dg-cell][data-type='number'],
	[data-dg-cell][data-align='end'] {
		font-variant-numeric: tabular-nums;
	}
</style>
