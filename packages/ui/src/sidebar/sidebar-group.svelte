<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<div role="group" data-sidebar-group class={className} {...rest}>
	{@render children()}
</div>

<style>
	[data-sidebar-group] {
		display: grid;
		gap: var(--dry-sidebar-group-gap, var(--dry-space-1));
		padding-block: var(--dry-sidebar-group-padding-y, var(--dry-space-2));
	}

	[data-sidebar-group]:not(:first-child) {
		margin-block-start: var(--dry-sidebar-group-stack-gap, var(--dry-space-1));
		padding-block-start: var(--dry-sidebar-group-stack-padding, var(--dry-space-4));
		border-top: 1px solid
			var(--dry-sidebar-group-divider, var(--dry-sidebar-border, var(--dry-color-stroke-weak)));
	}
</style>
