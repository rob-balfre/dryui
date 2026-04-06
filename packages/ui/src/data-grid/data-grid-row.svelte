<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLTableRowElement> {
		rowId?: string;
		children: Snippet;
	}

	let { rowId, class: className, children, ...rest }: Props = $props();
</script>

<tr data-dg-row data-row-id={rowId ?? undefined} class={className} {...rest}>
	{@render children()}
</tr>

<style>
	[data-dg-row] {
		border-bottom: 1px solid var(--dry-data-grid-border);
		transition: background var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-dg-row]:hover {
		background: var(--dry-data-grid-row-hover);
	}

	[data-dg-row][data-expanded] {
		border-bottom: none;
	}

	[data-dg-row][data-selected] {
		background: var(--dry-color-fill-brand-weak, rgba(59, 130, 246, 0.05));
	}

	[data-dg-row][data-selected]:hover {
		background: var(--dry-color-fill-brand-weak, rgba(59, 130, 246, 0.08));
	}
</style>
