<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children?: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<div data-part="description" data-option-picker-description class={className} {...rest}>
	{@render children?.()}
</div>

<style>
	[data-option-picker-description] {
		grid-column: var(--dry-option-picker-description-column, 2);
		grid-row: var(--dry-option-picker-description-row, 2);
		font-size: var(--dry-type-small-size);
		line-height: 1.35;
		color: var(--dry-color-text-weak);
		text-wrap: pretty;
	}
</style>
