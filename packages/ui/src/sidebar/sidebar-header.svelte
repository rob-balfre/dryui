<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<div data-sidebar-header class={className} {...rest}>
	{@render children()}
</div>

<style>
	[data-sidebar-header] {
		grid-row: 1;
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
		padding: var(--dry-space-3) var(--dry-space-6);
		border-bottom: 1px solid var(--dry-sidebar-border, var(--dry-color-stroke-weak));
	}
</style>
