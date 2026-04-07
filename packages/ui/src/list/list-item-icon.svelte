<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<div data-list-item-icon class={className} {...rest}>
	{@render children()}
</div>

<style>
	[data-list-item-icon] {
		display: inline-grid;
		place-items: center;
		color: var(--dry-list-item-icon-color);
	}
</style>
