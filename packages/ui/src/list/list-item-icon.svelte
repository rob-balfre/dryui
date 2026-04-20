<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<span data-list-item-icon class={className} {...rest}>
	{@render children()}
</span>

<style>
	[data-list-item-icon] {
		display: inline-grid;
		place-items: center;
		color: var(--dry-list-item-icon-color);
	}
</style>
