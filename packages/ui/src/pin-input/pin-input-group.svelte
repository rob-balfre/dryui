<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { children, class: className, ...rest }: Props = $props();
</script>

<div data-pin-input-group role="presentation" class={className} {...rest}>
	{@render children()}
</div>

<style>
	[data-pin-input-group] {
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-pin-group-gap, var(--dry-space-2));
	}
</style>
