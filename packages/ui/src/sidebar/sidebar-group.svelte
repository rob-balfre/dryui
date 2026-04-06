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
	}
</style>
