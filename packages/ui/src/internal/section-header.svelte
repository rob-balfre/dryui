<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { children, class: className, ...rest }: Props = $props();
</script>

<div class={className} {...rest}>
	{@render children()}
</div>

<style>
	div {
		padding: var(--dry-section-padding);
		border-bottom: 1px solid var(--dry-section-border);
	}
</style>
