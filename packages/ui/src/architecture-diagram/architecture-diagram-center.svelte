<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<div data-part="center" class={className} {...rest}>
	{@render children()}
</div>

<style>
	[data-part='center'] {
		display: grid;
		place-items: center;
		padding: var(--dry-space-5) var(--dry-space-8);
		background: var(--dry-arch-center-bg);
		color: var(--dry-arch-center-color);
		border-radius: var(--dry-arch-center-radius);
		font-size: var(--dry-type-heading-4-size, 1.25rem);
		font-weight: 700;
		letter-spacing: -0.02em;
		text-align: center;
		box-shadow: var(--dry-shadow-md);
		position: relative;
		z-index: 1;
	}
</style>
