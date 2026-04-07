<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		children?: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<span data-part="meta" data-option-swatch-group-meta class={className} {...rest}
	>{@render children?.()}</span
>

<style>
	[data-option-swatch-group-meta] {
		grid-column: 2;
		grid-row: 2;
		color: var(--dry-option-swatch-muted);
		font-size: var(--dry-type-tiny-size);
		line-height: 1.2;
	}
</style>
