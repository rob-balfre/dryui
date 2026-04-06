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
		overflow: auto;
		scrollbar-width: thin;
		scrollbar-color: transparent transparent;
		transition: scrollbar-color var(--dry-duration-normal) var(--dry-ease-emphasized);

		&:hover {
			scrollbar-color: var(--dry-scrollbar-thumb) var(--dry-scrollbar-track);
		}

		&::-webkit-scrollbar {
			height: 6px;
		}
		&::-webkit-scrollbar-track {
			background: transparent;
		}
		&::-webkit-scrollbar-thumb {
			background: transparent;
			border-radius: var(--dry-radius-full);
		}
		&:hover::-webkit-scrollbar-thumb {
			background: var(--dry-scrollbar-thumb);
		}
		&::-webkit-scrollbar-thumb:hover {
			background: var(--dry-scrollbar-thumb-hover);
		}
	}
</style>
