<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { variantAttrs } from '@dryui/primitives';

	interface Props extends HTMLAttributes<HTMLElement> {
		as?: 'div' | 'button';
		selected?: boolean;
		disabled?: boolean;
		orientation?: 'vertical' | 'horizontal';
		variant?: 'default' | 'elevated' | 'interactive';
		size?: 'default' | 'sm';
		children: Snippet;
	}

	let {
		as = 'div',
		selected,
		disabled,
		orientation,
		variant = 'default',
		size = 'default',
		class: className,
		children,
		...rest
	}: Props = $props();
</script>

{#if as === 'button'}
	<button
		class={className}
		data-card
		data-selected={selected ? '' : undefined}
		data-orientation={orientation}
		{...variantAttrs({
			variant: variant !== 'default' ? variant : undefined,
			size: size !== 'default' ? size : undefined
		})}
		data-disabled={disabled ? '' : undefined}
		{disabled}
		aria-disabled={disabled || undefined}
		type="button"
		{...rest as HTMLButtonAttributes}
	>
		{@render children()}
	</button>
{:else}
	<div
		class={className}
		data-card
		data-selected={selected ? '' : undefined}
		data-orientation={orientation}
		{...variantAttrs({
			variant: variant !== 'default' ? variant : undefined,
			size: size !== 'default' ? size : undefined
		})}
		data-disabled={disabled ? '' : undefined}
		aria-disabled={disabled || undefined}
		{...rest}
	>
		{@render children()}
	</div>
{/if}

<style>
	[data-card] {
		--dry-card-radius: var(--dry-radius-2xl);
		--dry-radius-nested: max(
			0px,
			calc(var(--dry-card-radius) - var(--dry-card-padding, var(--dry-space-8)))
		);
		--dry-btn-radius: var(--dry-radius-nested);

		container-type: inline-size;
		display: grid;
		background: var(--dry-card-bg, var(--dry-surface-bg, var(--dry-color-bg-raised)));
		border: 1px solid
			var(--dry-card-border, var(--dry-surface-border, var(--dry-color-stroke-weak)));
		border-radius: var(--dry-card-radius, var(--dry-surface-radius, var(--dry-radius-2xl)));
		box-shadow: var(--dry-card-shadow, var(--dry-surface-shadow, var(--dry-shadow-raised)));
		overflow: hidden;
	}

	/* ── Selected state ────────────────────────────────────────────────────── */

	[data-card][data-selected] {
		--dry-card-selected-ring-color: var(
			--dry-color-stroke-selected,
			var(--dry-color-fill-brand, #3b82f6)
		);

		outline: 2px solid var(--dry-card-selected-ring-color);
		outline-offset: -2px;
		box-shadow:
			inset 0 0 0 1px var(--dry-card-selected-ring-color),
			var(--dry-card-shadow, var(--dry-surface-shadow, var(--dry-shadow-raised)));
	}

	/* ── Clickable card (button) ───────────────────────────────────────────── */

	button[data-card] {
		appearance: none;
		border: none;
		padding: 0;
		font: inherit;
		color: inherit;
		text-align: inherit;
		cursor: pointer;
		transition:
			box-shadow var(--dry-duration-normal, 200ms) ease,
			transform var(--dry-duration-fast, 100ms) ease;
	}

	button[data-card]:hover {
		box-shadow: var(--dry-shadow-md, 0 4px 6px -1px rgb(15 23 42 / 0.1));
		border-color: var(--dry-color-stroke-strong);
	}

	button[data-card]:active {
		transform: scale(0.99);
	}

	button[data-card]:focus-visible {
		outline: var(--dry-focus-ring);
		outline-offset: 2px;
	}

	[data-card][data-disabled] {
		cursor: not-allowed;
	}

	/* ── Horizontal orientation ────────────────────────────────────────────── */

	[data-card][data-orientation='horizontal'] {
		grid-auto-flow: column;
	}

	/* ── Variant: elevated (shadow-only separation, no border) ─────────────── */

	[data-card][data-variant='elevated'] {
		--dry-card-bg: var(--dry-color-bg-overlay);
		border-color: transparent;
		--dry-card-shadow: var(--dry-shadow-md);
	}

	/* ── Variant: interactive (hoverable card) ─────────────────────────────── */

	[data-card][data-variant='interactive'] {
		cursor: pointer;
		transition:
			box-shadow var(--dry-duration-normal) var(--dry-ease-default),
			transform var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-card][data-variant='interactive']:hover {
		box-shadow: var(--dry-shadow-md);
		border-color: var(--dry-color-stroke-strong);
	}

	[data-card][data-variant='interactive']:active {
		transform: translateY(1px);
	}

	[data-card][data-variant='interactive']:focus-visible {
		outline: var(--dry-focus-ring);
		outline-offset: 2px;
	}

	/* ── Size: sm (compact padding) ────────────────────────────────────────── */

	[data-card][data-size='sm'] {
		--dry-card-padding: var(--dry-space-4);
	}
</style>
