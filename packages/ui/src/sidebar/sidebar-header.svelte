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
		grid-template-columns: minmax(0, 1fr);
		align-content: start;
		justify-items: start;
		gap: var(--dry-sidebar-header-gap, var(--dry-space-1));
		padding: var(
			--dry-sidebar-header-padding,
			var(--dry-space-5) var(--dry-space-6) var(--dry-space-4)
		);
		border-bottom: 1px solid var(--dry-sidebar-border, var(--dry-color-stroke-weak));
		color: var(--dry-sidebar-header-color, var(--dry-color-text-strong));
		font-size: var(--dry-sidebar-header-size, var(--dry-text-base-size, 1rem));
		font-weight: var(--dry-sidebar-header-weight, 600);
		line-height: var(--dry-sidebar-header-line-height, 1.2);
	}
</style>
