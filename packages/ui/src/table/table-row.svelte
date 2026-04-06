<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLTableRowElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<tr class={className} {...rest}>
	{@render children()}
</tr>

<style>
	tr {
		border-bottom: 1px solid var(--dry-table-border);
		transition: background var(--dry-duration-fast) var(--dry-ease-default);
	}

	tr:hover {
		background: var(
			--dry-table-row-hover,
			color-mix(in srgb, var(--dry-color-text-strong) 4%, transparent)
		);
	}
</style>
