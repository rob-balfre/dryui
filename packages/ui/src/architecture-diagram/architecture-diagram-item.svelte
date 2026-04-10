<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<div data-part="item" class={className} {...rest}>
	{@render children()}
</div>

<style>
	[data-part='item'] {
		padding: var(--dry-space-2) var(--dry-space-4);
		background: var(--dry-arch-item-bg);
		border: 1px solid var(--dry-arch-item-border);
		border-radius: var(--dry-arch-item-radius);
		font-size: var(--dry-type-ui-control-size, 0.875rem);
		font-weight: 500;
		color: var(--dry-color-text-strong);
		text-align: center;
		line-height: 1.25;
	}
</style>
