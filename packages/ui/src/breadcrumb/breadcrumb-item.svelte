<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLLIElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<li data-breadcrumb-item class={className} {...rest}>
	{@render children()}
</li>

<style>
	[data-breadcrumb-item] {
		display: inline-grid;
		grid-auto-flow: column;
		align-items: center;
		gap: var(--dry-breadcrumb-gap, var(--dry-space-2));
	}
</style>
