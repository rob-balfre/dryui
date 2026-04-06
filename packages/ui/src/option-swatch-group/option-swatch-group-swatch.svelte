<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		color?: string;
		shape?: 'circle' | 'rounded';
		children?: Snippet;
	}

	let { color, shape = 'circle', class: className, children, ...rest }: Props = $props();

	function setSwatchChip(node: HTMLSpanElement) {
		$effect(() => {
			if (color) {
				node.style.setProperty('--dry-option-swatch-chip', color);
			} else {
				node.style.removeProperty('--dry-option-swatch-chip');
			}
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
