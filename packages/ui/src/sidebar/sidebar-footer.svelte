<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<div data-sidebar-footer class={className} {...rest}>
	{@render children()}
</div>

<style>
	[data-sidebar-footer] {
		grid-row: 3;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		align-content: start;
		justify-items: stretch;
		gap: var(--dry-space-2);
		padding-block: var(--dry-sidebar-footer-padding-y, var(--dry-space-3));
		padding-inline: var(--dry-sidebar-content-padding, 0px);
		border-top: 1px solid var(--dry-sidebar-border);
	}
</style>
