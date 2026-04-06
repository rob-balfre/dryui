<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLUListElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<ul role="list" data-pagination-content class={className} {...rest}>
	{@render children()}
</ul>

<style>
	[data-pagination-content] {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-1);
		list-style: none;
		margin: 0;
		padding: 0;
	}
</style>
