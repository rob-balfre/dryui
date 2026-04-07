<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<div data-part="front" data-flip-card-front class={className} {...rest}>
	{@render children()}
</div>

<style>
	[data-flip-card-front] {
		z-index: 2;
		backface-visibility: hidden;
		transition: transform var(--dry-flip-card-duration, 0.6s) ease;
		position: absolute;
		inset: 0;
		transform: var(--dry-flip-card-front-transform, rotateY(0deg));
	}
</style>
