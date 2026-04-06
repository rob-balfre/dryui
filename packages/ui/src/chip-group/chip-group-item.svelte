<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getChipGroupCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		value: string;
		variant?: 'solid' | 'outline' | 'soft';
		color?: 'gray' | 'blue' | 'red' | 'green' | 'yellow' | 'purple' | 'orange';
		disabled?: boolean;
		children: Snippet;
	}

	let {
		value,
		variant = 'soft',
		color = 'gray',
		disabled = false,
		onclick,
		class: className,
		children,
		...rest
	}: Props = $props();

	const group = getChipGroupCtx();
	const selected = $derived(group?.isSelected(value) ?? false);
	const isDisabled = $derived(Boolean(disabled || group?.disabled));

	const handleClick: NonNullable<Props['onclick']> = (event) => {
		if (isDisabled || !group) return;
		group.toggle(value);
		onclick?.(event);
	};
</script>

<button
	type="button"
	aria-pressed={selected}
	data-chip-item
	data-state={selected ? 'on' : 'off'}
	data-variant={variant}
	data-color={color}
	data-disabled={isDisabled || undefined}
	disabled={isDisabled}
	class={className}
	onclick={handleClick}
	{...rest}
>
	{@render children()}
</button>

<style>
	[data-chip-item] {
		--dry-chip-default-bg: var(--dry-color-fill);
		--dry-chip-default-color: var(--dry-color-text-weak);
		--dry-chip-bg: var(--dry-chip-default-bg);
		--dry-chip-color: var(--dry-chip-default-color);
		--dry-chip-border: transparent;
		--dry-chip-font-size: var(
			--dry-chip-group-font-size,
			var(--dry-type-tiny-size, var(--dry-text-xs-size))
		);
		--dry-chip-padding-x: var(--dry-chip-group-padding-x, var(--dry-space-3));
		--dry-chip-padding-y: var(--dry-chip-group-padding-y, var(--dry-space-1));
		--dry-chip-radius: var(--dry-radius-full);

		display: inline-grid;
		grid-auto-flow: column;
		place-items: center;
		gap: var(--dry-space-1_5);
		padding: var(--dry-chip-padding-y) var(--dry-chip-padding-x);
		font-size: var(--dry-chip-font-size);
		font-family: var(--dry-font-sans);
		font-weight: 500;
		line-height: 1.25;
		color: var(--dry-chip-color);
		background: var(--dry-chip-bg);
		border: 1px solid var(--dry-chip-border);
		border-radius: var(--dry-chip-radius);
		white-space: nowrap;
		cursor: pointer;
		user-select: none;
		position: relative;
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			color var(--dry-duration-fast) var(--dry-ease-default),
			transform var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-chip-item]:hover:not([data-disabled]) {
		transform: translateY(-1px);
	}

	[data-chip-item]:active:not([data-disabled]) {
		transform: translateY(0);
	}

	[data-chip-item]:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 2px;
	}

	[data-chip-item][data-disabled] {
		opacity: 0.5;
		cursor: not-allowed;
		pointer-events: none;
	}

	[data-chip-item][data-state='on'] {
		--dry-chip-bg: color-mix(in srgb, var(--dry-color-fill-brand) 14%, transparent);
		--dry-chip-color: var(--dry-color-fill-brand);
		--dry-chip-border: var(--dry-color-fill-brand);
	}

	/* ── Variant: solid ─────────────────────────────────────────────────── */

	[data-chip-item][data-variant='solid'][data-color='gray'] {
		--dry-chip-bg: var(--dry-color-text-weak);
		--dry-chip-color: var(--dry-color-bg-base);
	}
	[data-chip-item][data-variant='solid'][data-color='blue'] {
		--dry-chip-bg: var(--dry-color-fill-brand);
		--dry-chip-color: var(--dry-color-on-brand);
	}
	[data-chip-item][data-variant='solid'][data-color='red'] {
		--dry-chip-bg: var(--dry-color-fill-error);
		--dry-chip-color: var(--dry-color-on-error);
	}
	[data-chip-item][data-variant='solid'][data-color='green'] {
		--dry-chip-bg: var(--dry-color-fill-success);
		--dry-chip-color: var(--dry-color-on-success);
	}
	[data-chip-item][data-variant='solid'][data-color='yellow'] {
		--dry-chip-bg: var(--dry-color-fill-warning);
		--dry-chip-color: var(--dry-color-on-warning);
	}
	[data-chip-item][data-variant='solid'][data-color='purple'] {
		--dry-chip-bg: color-mix(in srgb, var(--dry-color-fill-brand) 80%, hsl(280, 65%, 55%));
		--dry-chip-color: var(--dry-color-on-brand);
	}
	[data-chip-item][data-variant='solid'][data-color='orange'] {
		--dry-chip-bg: color-mix(
			in srgb,
			var(--dry-color-fill-warning) 70%,
			var(--dry-color-fill-error)
		);
		--dry-chip-color: var(--dry-color-on-warning);
	}

	[data-chip-item][data-variant='solid'][data-state='on'] {
		--dry-chip-bg: var(--dry-color-fill-brand);
		--dry-chip-color: white;
		--dry-chip-border: var(--dry-color-fill-brand);
	}

	/* ── Variant: soft ──────────────────────────────────────────────────── */

	[data-chip-item][data-variant='soft'][data-color='gray'] {
		--dry-chip-bg: var(--dry-color-fill);
		--dry-chip-color: var(--dry-color-text-weak);
	}
	[data-chip-item][data-variant='soft'][data-color='blue'] {
		--dry-chip-bg: var(--dry-color-fill-brand-weak);
		--dry-chip-color: var(--dry-color-text-brand);
	}
	[data-chip-item][data-variant='soft'][data-color='red'] {
		--dry-chip-bg: var(--dry-color-fill-error-weak);
		--dry-chip-color: var(--dry-color-text-error);
	}
	[data-chip-item][data-variant='soft'][data-color='green'] {
		--dry-chip-bg: var(--dry-color-fill-success-weak);
		--dry-chip-color: var(--dry-color-text-success);
	}
	[data-chip-item][data-variant='soft'][data-color='yellow'] {
		--dry-chip-bg: var(--dry-color-fill-warning-weak);
		--dry-chip-color: var(--dry-color-text-warning);
	}
	[data-chip-item][data-variant='soft'][data-color='purple'] {
		--dry-chip-bg: color-mix(
			in srgb,
			var(--dry-color-fill-brand-weak) 70%,
			hsl(280, 65%, 55%, 0.1)
		);
		--dry-chip-color: color-mix(in srgb, var(--dry-color-text-brand) 70%, hsl(280, 65%, 40%));
	}
	[data-chip-item][data-variant='soft'][data-color='orange'] {
		--dry-chip-bg: color-mix(
			in srgb,
			var(--dry-color-fill-warning-weak) 50%,
			var(--dry-color-fill-error-weak)
		);
		--dry-chip-color: color-mix(
			in srgb,
			var(--dry-color-text-warning) 50%,
			var(--dry-color-text-error)
		);
	}

	/* ── Variant: outline ───────────────────────────────────────────────── */

	[data-chip-item][data-variant='outline'] {
		--dry-chip-bg: transparent;
	}
	[data-chip-item][data-variant='outline'][data-color='gray'] {
		--dry-chip-color: var(--dry-color-text-weak);
		--dry-chip-border: var(--dry-color-stroke-weak);
	}
	[data-chip-item][data-variant='outline'][data-color='blue'] {
		--dry-chip-color: var(--dry-color-text-brand);
		--dry-chip-border: var(--dry-color-stroke-brand);
	}
	[data-chip-item][data-variant='outline'][data-color='red'] {
		--dry-chip-color: var(--dry-color-text-error);
		--dry-chip-border: var(--dry-color-stroke-error);
	}
	[data-chip-item][data-variant='outline'][data-color='green'] {
		--dry-chip-color: var(--dry-color-text-success);
		--dry-chip-border: var(--dry-color-stroke-success);
	}
	[data-chip-item][data-variant='outline'][data-color='yellow'] {
		--dry-chip-color: var(--dry-color-text-warning);
		--dry-chip-border: var(--dry-color-stroke-warning);
	}
	[data-chip-item][data-variant='outline'][data-color='purple'] {
		--dry-chip-color: color-mix(in srgb, var(--dry-color-text-brand) 70%, hsl(280, 65%, 40%));
		--dry-chip-border: color-mix(in srgb, var(--dry-color-stroke-brand) 60%, hsl(280, 50%, 70%));
	}
	[data-chip-item][data-variant='outline'][data-color='orange'] {
		--dry-chip-color: color-mix(
			in srgb,
			var(--dry-color-text-warning) 60%,
			var(--dry-color-text-error)
		);
		--dry-chip-border: color-mix(
			in srgb,
			var(--dry-color-stroke-warning) 60%,
			var(--dry-color-stroke-error)
		);
	}
</style>
