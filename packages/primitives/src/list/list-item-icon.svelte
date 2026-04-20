<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();
</script>

<span data-list-item-icon {...rest}>
	{@render children()}
</span>

<style>
	[data-list-item-icon] {
		display: inline-grid;
		place-items: center;
	}
</style>
