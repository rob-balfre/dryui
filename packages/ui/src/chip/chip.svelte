<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { resolveAlias } from '../internal/color-aliases.js';
	import type { ChipColor } from './index.js';

	interface SharedProps {
		selected?: boolean;
		disabled?: boolean;
		variant?: 'solid' | 'outline' | 'soft';
		color?: ChipColor;
		size?: 'sm' | 'md';
		href?: string;
		rel?: string;
		target?: string;
		download?: boolean | string;
		type?: 'button' | 'submit' | 'reset';
		onclick?: (event: MouseEvent) => void;
		children: Snippet;
	}

	type RestProps = Omit<HTMLButtonAttributes, 'type' | 'disabled' | 'onclick' | 'children'> &
		Omit<
			HTMLAnchorAttributes,
			'href' | 'rel' | 'target' | 'download' | 'type' | 'onclick' | 'children'
		>;

	type Props = SharedProps & RestProps;

	let {
		selected,
		disabled,
		variant = 'soft',
		color = 'gray',
		size = 'sm',
		class: className,
		href,
		rel,
		target,
		download,
		type = 'button',
		onclick,
		children,
		...rest
	}: Props = $props();

	const resolvedColor = $derived(resolveAlias(color, 'gray'));

	function handleLinkClick(event: MouseEvent) {
		if (disabled) {
			event.preventDefault();
			event.stopPropagation();
			return;
		}

		onclick?.(event);
	}
</script>

<span data-chip-wrapper>
	{#if href !== undefined}
		<a
			{...rest as Record<string, unknown>}
			data-chip
			data-variant={variant}
			data-color={resolvedColor}
			data-size={size}
			href={disabled ? undefined : href}
			{rel}
			{target}
			{download}
			aria-disabled={disabled || undefined}
			data-disabled={disabled || undefined}
			data-selected={selected || undefined}
			tabindex={disabled ? -1 : undefined}
			class={className}
			onclick={handleLinkClick}
		>
			{@render children()}
		</a>
	{:else}
		<button
			{type}
			{disabled}
			aria-pressed={selected || undefined}
			data-disabled={disabled || undefined}
			data-selected={selected || undefined}
			data-chip
			data-variant={variant}
			data-color={resolvedColor}
			data-size={size}
			class={className}
			{onclick}
			{...rest as HTMLButtonAttributes}
		>
			{@render children()}
		</button>
	{/if}
</span>

<style>
	[data-chip-wrapper] {
		display: inline-grid;
		min-height: var(--dry-space-12);
		align-items: center;
	}

	[data-chip] {
		--dry-chip-default-bg: var(--dry-color-fill);
		--dry-chip-default-color: var(--dry-color-text-weak);
		--dry-chip-bg: var(--dry-chip-default-bg);
		--dry-chip-color: var(--dry-chip-default-color);
		--dry-chip-border: transparent;
		--dry-chip-selected-bg: var(--dry-color-fill-selected);
		--dry-chip-selected-color: var(--dry-color-on-brand);
		--dry-chip-selected-border: var(--dry-color-stroke-selected);
		--dry-chip-font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		--dry-chip-padding-x: var(--dry-space-3);
		--dry-chip-padding-y: var(--dry-space-1);
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
		box-shadow: inset 0 0 0 1px transparent;
		white-space: nowrap;
		cursor: pointer;
		user-select: none;
		text-decoration: none;
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			color var(--dry-duration-fast) var(--dry-ease-default),
			transform var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-chip]:hover:not([data-disabled]) {
		transform: translateY(-1px);
	}

	[data-chip]:focus-visible {
		outline: 2px solid var(--dry-color-stroke-focus);
		outline-offset: 2px;
	}

	[data-chip][data-disabled] {
		--dry-chip-bg: var(--dry-color-fill-disabled);
		--dry-chip-color: var(--dry-color-text-disabled);
		--dry-chip-border: var(--dry-color-stroke-disabled);
		opacity: 1;
		cursor: not-allowed;
		pointer-events: none;
	}

	/* ── Sizes ────────────────────────────────────────────────────────────────── */

	[data-size='sm'] {
		--dry-chip-font-size: var(--dry-type-tiny-size, var(--dry-text-xs-size));
		--dry-chip-padding-x: var(--dry-space-2_5);
		--dry-chip-padding-y: var(--dry-space-0_5);
	}

	[data-size='md'] {
		--dry-chip-font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		--dry-chip-padding-x: var(--dry-space-3);
		--dry-chip-padding-y: var(--dry-space-1);
	}

	/* ── Variant: solid ──────────────────────────────────────────────────────── */

	[data-variant='solid'][data-color='gray'] {
		--dry-chip-bg: var(--dry-color-text-weak);
		--dry-chip-color: var(--dry-color-bg-base);
	}

	[data-variant='solid'][data-color='blue'] {
		--dry-chip-bg: var(--dry-color-fill-brand);
		--dry-chip-color: var(--dry-color-on-brand);
	}

	[data-variant='solid'][data-color='red'] {
		--dry-chip-bg: var(--dry-color-fill-error);
		--dry-chip-color: var(--dry-color-on-error);
	}

	[data-variant='solid'][data-color='green'] {
		--dry-chip-bg: var(--dry-color-fill-success);
		--dry-chip-color: var(--dry-color-on-success);
	}

	[data-variant='solid'][data-color='yellow'] {
		--dry-chip-bg: var(--dry-color-fill-warning);
		--dry-chip-color: var(--dry-color-on-warning);
	}

	[data-variant='solid'][data-color='purple'] {
		--dry-chip-bg: color-mix(in srgb, var(--dry-color-fill-brand) 80%, hsl(280, 65%, 55%));
		--dry-chip-color: var(--dry-color-on-brand);
	}

	[data-variant='solid'][data-color='orange'] {
		--dry-chip-bg: color-mix(
			in srgb,
			var(--dry-color-fill-warning) 70%,
			var(--dry-color-fill-error)
		);
		--dry-chip-color: var(--dry-color-on-warning);
	}

	/* ── Variant: soft ───────────────────────────────────────────────────────── */

	[data-variant='soft'][data-color='gray'] {
		--dry-chip-bg: var(--dry-color-fill);
		--dry-chip-color: var(--dry-color-text-weak);
	}

	[data-variant='soft'][data-color='blue'] {
		--dry-chip-bg: var(--dry-color-fill-brand-weak);
		--dry-chip-color: var(--dry-color-text-brand);
	}

	[data-variant='soft'][data-color='red'] {
		--dry-chip-bg: var(--dry-color-fill-error-weak);
		--dry-chip-color: var(--dry-color-text-error);
	}

	[data-variant='soft'][data-color='green'] {
		--dry-chip-bg: var(--dry-color-fill-success-weak);
		--dry-chip-color: var(--dry-color-text-success);
	}

	[data-variant='soft'][data-color='yellow'] {
		--dry-chip-bg: var(--dry-color-fill-warning-weak);
		--dry-chip-color: var(--dry-color-text-warning);
	}

	[data-variant='soft'][data-color='purple'] {
		--dry-chip-bg: color-mix(
			in srgb,
			var(--dry-color-fill-brand-weak) 70%,
			hsl(280, 65%, 55%, 0.1)
		);
		--dry-chip-color: color-mix(in srgb, var(--dry-color-text-brand) 70%, hsl(280, 65%, 40%));
	}

	[data-variant='soft'][data-color='orange'] {
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

	/* ── Variant: outline ────────────────────────────────────────────────────── */

	[data-variant='outline'] {
		--dry-chip-bg: var(--dry-color-bg-base);
	}

	[data-variant='outline'][data-color='gray'] {
		--dry-chip-color: var(--dry-color-text-weak);
		--dry-chip-border: var(--dry-color-stroke-weak);
	}

	[data-variant='outline'][data-color='blue'] {
		--dry-chip-color: var(--dry-color-text-brand);
		--dry-chip-border: var(--dry-color-stroke-brand);
	}

	[data-variant='outline'][data-color='red'] {
		--dry-chip-color: var(--dry-color-text-error);
		--dry-chip-border: var(--dry-color-stroke-error);
	}

	[data-variant='outline'][data-color='green'] {
		--dry-chip-color: var(--dry-color-text-success);
		--dry-chip-border: var(--dry-color-stroke-success);
	}

	[data-variant='outline'][data-color='yellow'] {
		--dry-chip-color: var(--dry-color-text-warning);
		--dry-chip-border: var(--dry-color-stroke-warning);
	}

	[data-variant='outline'][data-color='purple'] {
		--dry-chip-color: color-mix(in srgb, var(--dry-color-text-brand) 70%, hsl(280, 65%, 40%));
		--dry-chip-border: color-mix(in srgb, var(--dry-color-stroke-brand) 60%, hsl(280, 50%, 70%));
	}

	[data-variant='outline'][data-color='orange'] {
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

	/* ── Selected state ──────────────────────────────────────────────────────── */

	[data-chip][data-selected='true']:not([data-disabled]) {
		--dry-chip-bg: var(--dry-chip-selected-bg);
		--dry-chip-color: var(--dry-chip-selected-color);
		--dry-chip-border: var(--dry-chip-selected-border);
		box-shadow: inset 0 0 0 1px var(--dry-chip-selected-border);
		font-weight: 600;
	}
</style>
