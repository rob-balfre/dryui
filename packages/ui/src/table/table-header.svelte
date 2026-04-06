<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLTableSectionElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<thead class={className} {...rest}>
	{@render children()}
</thead>

<style>
	thead {
		border-bottom: 1px solid var(--dry-table-border);
		background: var(--dry-table-header-bg);
	}
</style>
