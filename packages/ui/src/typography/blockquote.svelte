<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLQuoteElement> {
		children: Snippet;
	}

	let { class: classAttr, children, ...rest }: Props = $props();
</script>

<blockquote class={classAttr} {...rest}>{@render children()}</blockquote>

<style>
	blockquote {
		margin: var(--dry-space-4) 0;
		padding: var(--dry-space-3) var(--dry-space-4);
		border-left: 4px solid var(--dry-typography-blockquote-border, var(--dry-color-fill-brand));
		background: var(--dry-typography-blockquote-bg, var(--dry-color-bg-overlay));
		color: var(--dry-color-text-weak);
		font-style: italic;
		line-height: 1.7;
	}
</style>
