<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLParagraphElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<p data-part="description" class={className} {...rest}>
	{@render children()}
</p>

<style>
	[data-part='description'] {
		font-family: var(--dry-font-sans);
		font-size: var(--dry-type-tiny-size);
		line-height: var(--dry-type-tiny-leading);
		color: var(--dry-color-text-weak);
		margin: 0;
	}
</style>
