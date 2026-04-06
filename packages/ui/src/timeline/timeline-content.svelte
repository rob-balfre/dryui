<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<div data-part="content" class={className} {...rest}>
	{@render children()}
</div>

<style>
	[data-part='content'] {
		display: grid;
		gap: var(--dry-timeline-content-gap, var(--dry-space-1));
		padding-bottom: var(--dry-space-2);
	}
</style>
