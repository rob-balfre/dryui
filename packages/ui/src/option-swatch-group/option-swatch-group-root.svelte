<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setSelectableTileGroupCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value?: string;
		disabled?: boolean;
		orientation?: 'horizontal' | 'vertical';
		children: Snippet;
	}

	let {
		value = $bindable(''),
		disabled = false,
		orientation = 'horizontal',
		class: className,
		children,
		...rest
	}: Props = $props();

	setSelectableTileGroupCtx({
		get value() {
			return value;
		},
		get disabled() {
			return disabled;
		},
		get orientation() {
			return orientation;
		},
		select(nextValue: string) {
			value = nextValue;
		},
		isSelected(itemValue: string) {
			return value === itemValue;
		}
	});
</script>

<div
	role="radiogroup"
	aria-orientation={orientation}
	data-orientation={orientation}
	data-disabled={disabled || undefined}
	data-option-swatch-group-root
	class={className}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-option-swatch-group-root] {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(7.5rem, max-content));
		gap: var(--dry-space-3);
	}

	[data-option-swatch-group-root][data-orientation='vertical'] {
		grid-template-columns: 1fr;
	}

	[data-option-swatch-group-item] {
		--dry-option-swatch-bg: var(--dry-color-bg-raised);
		--dry-option-swatch-border: var(--dry-color-stroke-weak);
		--dry-option-swatch-border-selected: var(--dry-color-stroke-focus);
		--dry-option-swatch-text: var(--dry-color-text-strong);
		--dry-option-swatch-muted: var(--dry-color-text-weak);

		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: center;
		gap: var(--dry-space-3);
		padding: var(--dry-space-3);
		border: 1px solid var(--dry-option-swatch-border);
		border-radius: var(--dry-radius-xl);
		background: var(--dry-option-swatch-bg);
		color: var(--dry-option-swatch-text);
		box-shadow: var(--dry-shadow-xs);
		cursor: pointer;
		transition:
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			box-shadow var(--dry-duration-fast) var(--dry-ease-default),
			transform var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-option-swatch-group-item]:hover:not(:disabled) {
		border-color: var(--dry-color-stroke-strong);
		transform: translateY(-1px);
	}

	[data-option-swatch-group-item]:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 2px;
	}

	[data-option-swatch-group-item][data-state='checked'] {
		border-color: var(--dry-option-swatch-border-selected);
		box-shadow: 0 0 0 1px var(--dry-option-swatch-border-selected);
	}

	[data-option-swatch-group-item][data-unavailable] {
		opacity: 0.6;
	}

	[data-option-swatch-group-swatch] {
		--dry-option-swatch-chip: var(--dry-color-fill-brand);

		display: inline-grid;
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

	[data-option-swatch-group-content] {
		display: grid;
		gap: var(--dry-space-1);
		text-align: left;
	}

	[data-option-swatch-group-label] {
		font-size: var(--dry-type-small-size);
		font-weight: 600;
		line-height: 1.2;
	}

	[data-option-swatch-group-meta] {
		color: var(--dry-option-swatch-muted);
		font-size: var(--dry-type-tiny-size);
		line-height: 1.2;
	}
</style>
