<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<div data-sidebar-content class={className} {...rest}>
	{@render children()}
</div>

<style>
	[data-sidebar-content] {
		grid-row: 2;
		display: grid;
		align-items: start;
		gap: var(--dry-sidebar-content-gap, var(--dry-space-3));
		padding: var(--dry-sidebar-content-padding);
		min-height: 0;
		overflow: var(--dry-sidebar-content-overflow, auto);
		scrollbar-gutter: var(--dry-sidebar-content-scrollbar-gutter, auto);
		scrollbar-width: var(--dry-sidebar-content-scrollbar-width, thin);
		scrollbar-color: var(--dry-scrollbar-thumb) transparent;
		transition: scrollbar-color var(--dry-duration-normal) var(--dry-ease-emphasized);

		&::-webkit-scrollbar-track {
			background: transparent;
		}
		&::-webkit-scrollbar-thumb {
			background: var(--dry-scrollbar-thumb);
			border: 0;
			background-clip: border-box;
			border-radius: var(--dry-radius-full);
		}
		&::-webkit-scrollbar-thumb:hover {
			background: var(--dry-scrollbar-thumb-hover);
		}
	}
</style>
