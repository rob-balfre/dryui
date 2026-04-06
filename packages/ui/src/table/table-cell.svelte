<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLTableCellElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<td class={className} {...rest}>
	{@render children()}
</td>

<style>
	td {
		padding: var(--dry-table-padding-y) var(--dry-table-padding-x);
		font-size: var(--dry-type-small-size);
		line-height: var(--dry-type-small-leading);
		color: var(--dry-color-text-strong);
		vertical-align: middle;
	}
</style>
