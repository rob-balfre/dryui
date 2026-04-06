<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLTableSectionElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<thead data-dg-header class={className} {...rest}>
	{@render children()}
</thead>

<style>
	[data-dg-header] {
		border-bottom: 2px solid var(--dry-data-grid-border);
		background: var(--dry-data-grid-header-bg);
	}
</style>
