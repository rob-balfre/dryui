<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		children?: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<span data-part="label" data-option-swatch-group-label class={className} {...rest}
	>{@render children?.()}</span
>

<style>
	[data-option-swatch-group-label] {
		grid-column: 2;
		grid-row: 1;
		font-size: var(--dry-type-small-size);
		font-weight: 600;
		line-height: 1.2;
	}
</style>
