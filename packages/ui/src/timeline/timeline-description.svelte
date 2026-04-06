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
		margin: 0;
		color: var(--dry-color-text-weak);
		line-height: 1.65;
	}
</style>
