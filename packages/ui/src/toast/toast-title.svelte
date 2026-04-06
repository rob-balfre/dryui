<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLParagraphElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<p data-part="title" class={className} {...rest}>
	{@render children()}
</p>

<style>
	[data-part='title'] {
		font-family: var(--dry-font-sans);
		font-size: var(--dry-type-small-size);
		line-height: var(--dry-type-small-leading);
		font-weight: 500;
		color: var(--dry-toast-title-color, var(--dry-color-text-strong));
		margin: 0;
	}
</style>
