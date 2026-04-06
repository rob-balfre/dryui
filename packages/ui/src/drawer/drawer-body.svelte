<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		padding?: boolean;
		children: Snippet;
	}

	let { padding = true, class: className, children, ...rest }: Props = $props();
</script>

<div data-drawer-body data-no-padding={!padding || undefined} class={className} {...rest}>
	{@render children()}
</div>

<style>
	[data-drawer-body] {
		padding: var(--dry-space-12) var(--dry-space-8);
		overflow-y: auto;
		min-height: 0;

		--dry-sidebar-bg: var(--dry-drawer-bg);
		--dry-sidebar-border: transparent;
		--dry-sidebar-shadow: none;
		--dry-sidebar-radius: 0;
	}

	[data-drawer-body][data-no-padding] {
		padding: 0;
	}
</style>
