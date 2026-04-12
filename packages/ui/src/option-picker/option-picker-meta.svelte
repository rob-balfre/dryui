<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		children?: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<span data-part="meta" data-option-picker-meta class={className} {...rest}>
	{@render children?.()}
</span>

<style>
	[data-option-picker-meta] {
		grid-column: var(--dry-option-picker-meta-column, 2);
		grid-row: var(--dry-option-picker-meta-row, 3);
		font-size: var(--dry-type-tiny-size);
		line-height: 1.2;
		color: var(--dry-color-text-weaker, var(--dry-color-text-weak));
	}
</style>
