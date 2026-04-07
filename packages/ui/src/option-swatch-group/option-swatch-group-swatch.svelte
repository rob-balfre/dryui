<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		color?: string;
		shape?: 'circle' | 'rounded';
		children?: Snippet;
	}

	let { color, shape = 'circle', class: className, style, children, ...rest }: Props = $props();

	function setSwatchChip(node: HTMLSpanElement) {
		$effect(() => {
			node.style.cssText = `${style ?? ''}${color ? `; --dry-option-swatch-chip: ${color};` : ''}`;
		});
	}
</script>

<span
	{@attach setSwatchChip}
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
		height: 1.5rem;
		border-radius: 999px;
		border: 1px solid color-mix(in srgb, black 16%, transparent);
		background: var(--dry-option-swatch-chip);
		box-shadow:
			inset 0 0 0 1px rgb(255 255 255 / 0.24),
			0 1px 3px rgb(15 23 42 / 0.15);
	}

	[data-option-swatch-group-rounded] {
		border-radius: var(--dry-radius-md);
	}
</style>
