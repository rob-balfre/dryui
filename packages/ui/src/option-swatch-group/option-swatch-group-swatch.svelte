<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		color?: string;
		shape?: 'circle' | 'rounded';
		children?: Snippet;
	}

	let { color, shape = 'circle', class: className, children, ...rest }: Props = $props();

	function setSwatchChip(swatchColor: string | undefined) {
		return (node: HTMLSpanElement) => {
			if (swatchColor) {
				node.style.setProperty('--dry-option-swatch-chip', swatchColor);
			} else {
				node.style.removeProperty('--dry-option-swatch-chip');
			}
		};
	}
</script>

<span
	{@attach setSwatchChip(color)}
	data-option-swatch-group-swatch
	data-option-swatch-group-rounded={shape === 'rounded' || undefined}
	class={className}
	{...rest}
>
	{@render children?.()}
</span>

<style>
	[data-option-swatch-group-swatch] {
		--dry-option-swatch-chip: var(--dry-color-fill-brand);

		display: inline-grid;
		grid-column: 1;
		grid-row: 1 / span 2;
		align-self: center;
		aspect-ratio: 1;
		height: var(--dry-option-swatch-group-swatch-size, 1.5rem);
		border-radius: 999px;
		border: 1px solid var(--dry-option-swatch-group-swatch-border, var(--dry-color-stroke-weak));
		background: var(--dry-option-swatch-chip);
	}

	[data-option-swatch-group-rounded] {
		border-radius: var(--dry-radius-md);
	}
</style>
