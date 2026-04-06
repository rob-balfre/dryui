<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<div data-description-list-item class={className} {...rest}>
	{@render children()}
</div>

<style>
	[data-description-list-item] {
		display: grid;
		gap: var(--dry-description-list-item-gap, var(--dry-space-2));
		padding-block: var(--dry-description-list-item-padding-y, var(--dry-space-3));
		border-bottom: 1px solid var(--dry-description-list-border, var(--dry-color-stroke-weak));
	}

	[data-description-list-item]:last-child {
		border-bottom: none;
	}

	@container (min-width: 768px) {
		[data-description-list-item] {
			grid-template-columns: minmax(11rem, 0.95fr) minmax(0, 1.4fr);
			align-items: start;
		}
	}
</style>
