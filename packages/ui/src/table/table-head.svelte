<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLTableCellElement> {
		scope?: 'col' | 'row';
		children: Snippet;
	}

	let { scope = 'col', class: className, children, ...rest }: Props = $props();
</script>

<th {scope} class={className} {...rest}>
	{@render children()}
</th>

<style>
	th {
		padding: var(--dry-table-head-padding-y, var(--dry-space-2_5)) var(--dry-table-padding-x);
		text-align: left;
		font-weight: 600;
		font-size: var(--dry-type-tiny-size);
		line-height: var(--dry-type-tiny-leading);
		color: var(--dry-color-text-weak);
	}
</style>
