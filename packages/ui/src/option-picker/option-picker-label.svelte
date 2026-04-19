<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		children?: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<span data-part="label" data-option-picker-label class={className} {...rest}>
	{@render children?.()}
</span>

<style>
	[data-option-picker-label] {
		grid-column: var(--dry-option-picker-label-column, 2);
		grid-row: var(--dry-option-picker-label-row, 1);
		font-size: var(--dry-option-picker-label-size, var(--dry-type-small-size));
		font-weight: 600;
		line-height: var(--dry-option-picker-label-line-height, 1.2);
	}
</style>
