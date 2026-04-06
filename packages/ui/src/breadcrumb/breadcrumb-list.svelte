<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLOListElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<ol role="list" data-breadcrumb-list class={className} {...rest}>
	{@render children()}
</ol>

<style>
	[data-breadcrumb-list] {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-breadcrumb-gap, var(--dry-space-2));
		list-style: none;
		margin: 0;
		padding: 0;
		font-size: var(--dry-breadcrumb-font-size, var(--dry-type-small-size, var(--dry-text-sm-size)));
	}
</style>
