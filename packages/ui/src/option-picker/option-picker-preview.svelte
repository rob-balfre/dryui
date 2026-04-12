<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		color?: string;
		shape?: 'circle' | 'rounded' | 'square' | 'pill';
		variant?: 'default' | 'preset' | 'font' | 'shape';
		children?: Snippet;
	}

	let { color, shape = 'rounded', variant = 'default', children, ...rest }: Props = $props();

	function attachPreviewVars(previewColor: string | undefined) {
		return (node: HTMLSpanElement) => {
			if (previewColor) {
				node.style.setProperty('--dry-option-picker-preview-bg', previewColor);
			} else {
				node.style.removeProperty('--dry-option-picker-preview-bg');
			}
		};
	}
</script>

<span
	{@attach attachPreviewVars(color)}
	data-option-picker-preview
	data-option-picker-preview-shape={shape}
	data-variant={variant !== 'default' ? variant : undefined}
	{...rest}
>
	{@render children?.()}
</span>

<style>
	[data-option-picker-preview] {
		display: inline-grid;
		grid-column: var(--dry-option-picker-preview-column, 1);
		grid-row: var(--dry-option-picker-preview-row, 1 / span 3);
		place-items: center;
		align-self: center;
		block-size: var(--dry-option-picker-preview-size, 2.25rem);
		aspect-ratio: 1;
		padding: var(--dry-option-picker-preview-padding, 0);
		border: 1px solid var(--dry-option-picker-preview-border, var(--dry-color-stroke-weak));
		border-radius: var(--dry-option-picker-preview-radius, var(--dry-radius-md));
		background: var(
			--dry-option-picker-preview-bg,
			color-mix(in srgb, var(--dry-color-fill-weak) 72%, var(--dry-color-bg-base) 28%)
		);
		color: var(--dry-option-picker-preview-color, var(--dry-color-text-strong));
		box-shadow: var(--dry-option-picker-preview-shadow, none);
		overflow: hidden;
	}

	[data-option-picker-preview-shape='circle'] {
		border-radius: 999px;
	}

	[data-option-picker-preview-shape='square'] {
		border-radius: var(--dry-radius-sm);
	}

	[data-option-picker-preview-shape='pill'] {
		border-radius: 999px;
		padding-inline: var(--dry-space-3);
		aspect-ratio: auto;
	}

	[data-option-picker-preview][data-variant='preset'] {
		--dry-option-picker-preview-color: white;
		--dry-option-picker-preview-border: color-mix(
			in srgb,
			var(--_preset-color) 46%,
			var(--dry-color-stroke-weak) 54%
		);
		--dry-option-picker-preview-size: 2.75rem;
		background: linear-gradient(
			155deg,
			color-mix(in srgb, white 18%, var(--_preset-color) 82%) 0%,
			var(--_preset-color) 58%,
			color-mix(in srgb, black 12%, var(--_preset-color) 88%) 100%
		);
		box-shadow:
			inset 0 1px 0 color-mix(in srgb, white 22%, transparent),
			inset 0 -1px 0 color-mix(in srgb, black 10%, transparent);
		transition: border-radius var(--dry-duration-fast, 100ms) ease;
	}

	[data-option-picker-preview][data-variant='font'] {
		--dry-option-picker-preview-size: 2.75rem;
		--dry-option-picker-preview-bg: color-mix(
			in srgb,
			var(--dry-color-fill-weak) 58%,
			var(--dry-color-bg-base) 42%
		);
		--dry-option-picker-preview-border: color-mix(
			in srgb,
			var(--dry-color-stroke-weak) 72%,
			transparent
		);
	}

	[data-option-picker-preview][data-variant='shape'] {
		--dry-option-picker-preview-bg: var(--dry-color-bg-base);
		--dry-option-picker-preview-border: color-mix(
			in srgb,
			var(--dry-color-stroke-strong) 82%,
			transparent
		);
		--dry-option-picker-preview-size: 2rem;
		transition: border-radius var(--dry-duration-fast, 100ms) ease;
	}

	[data-option-picker-preview][data-variant='preset'][data-shape='sharp'],
	[data-option-picker-preview][data-variant='shape'][data-shape='sharp'] {
		--dry-option-picker-preview-radius: 2px;
	}

	[data-option-picker-preview][data-variant='preset'][data-shape='soft'],
	[data-option-picker-preview][data-variant='shape'][data-shape='soft'] {
		--dry-option-picker-preview-radius: 6px;
	}

	[data-option-picker-preview][data-variant='preset'][data-shape='rounded'] {
		--dry-option-picker-preview-radius: 10px;
	}

	[data-option-picker-preview][data-variant='shape'][data-shape='rounded'] {
		--dry-option-picker-preview-radius: 16px;
	}

	[data-option-picker-preview][data-variant='preset'][data-shape='pill'],
	[data-option-picker-preview][data-variant='shape'][data-shape='pill'] {
		--dry-option-picker-preview-radius: 9999px;
	}
</style>
