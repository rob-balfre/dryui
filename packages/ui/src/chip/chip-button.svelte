<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
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
</script>

<span
	class="chip-wrap"
	data-chip-variant={variant}
	data-chip-color={resolvedColor}
	data-chip-size={size}
	data-chip-selected={selected || undefined}
>
	<Button
		variant="pill"
		size={size === 'sm' ? 'sm' : 'md'}
		{type}
		{disabled}
		{href}
		{rel}
		{target}
		{download}
		aria-pressed={selected || undefined}
		data-disabled={disabled || undefined}
		data-selected={selected || undefined}
		{...rest}
		{onclick}
	>
		{@render children()}
	</Button>
</span>

<style>
	.chip-wrap {
		display: inline-grid;
		--dry-btn-accent: var(--_chip-active-bg);
		--dry-btn-accent-fg: var(--_chip-color);
		--dry-btn-accent-stroke: var(--_chip-border);
		--dry-btn-accent-weak: var(--_chip-bg);
		--dry-btn-bg: var(--_chip-bg);
		--dry-btn-color: var(--_chip-color);
		--dry-btn-border: var(--_chip-border);
	}

	/* Defaults */
	.chip-wrap {
		--_chip-bg: var(--dry-color-fill);
		--_chip-color: var(--dry-color-text-weak);
		--_chip-border: transparent;
		--_chip-active-bg: var(--dry-color-fill-selected);
	}

	.chip-wrap[data-chip-selected] {
		--dry-btn-bg: var(--dry-color-fill-selected);
		--dry-btn-color: var(--dry-color-on-brand);
		--dry-btn-border: var(--dry-color-stroke-selected);
	}

	/* ── Variant: solid ─────────────────────────────────────────────────── */

	.chip-wrap[data-chip-variant='solid'][data-chip-color='gray'] {
		--_chip-bg: var(--dry-color-text-weak);
		--_chip-color: var(--dry-color-bg-base);
	}
	.chip-wrap[data-chip-variant='solid'][data-chip-color='blue'] {
		--_chip-bg: var(--dry-color-fill-brand);
		--_chip-color: var(--dry-color-on-brand);
	}
	.chip-wrap[data-chip-variant='solid'][data-chip-color='red'] {
		--_chip-bg: var(--dry-color-fill-error);
		--_chip-color: var(--dry-color-on-error);
	}
	.chip-wrap[data-chip-variant='solid'][data-chip-color='green'] {
		--_chip-bg: var(--dry-color-fill-success);
		--_chip-color: var(--dry-color-on-success);
	}
	.chip-wrap[data-chip-variant='solid'][data-chip-color='yellow'] {
		--_chip-bg: var(--dry-color-fill-warning);
		--_chip-color: var(--dry-color-on-warning);
	}

	/* ── Variant: soft ──────────────────────────────────────────────────── */

	.chip-wrap[data-chip-variant='soft'][data-chip-color='gray'] {
		--_chip-bg: var(--dry-color-fill);
		--_chip-color: var(--dry-color-text-weak);
	}
	.chip-wrap[data-chip-variant='soft'][data-chip-color='blue'] {
		--_chip-bg: var(--dry-color-fill-brand-weak);
		--_chip-color: var(--dry-color-text-brand);
	}
	.chip-wrap[data-chip-variant='soft'][data-chip-color='red'] {
		--_chip-bg: var(--dry-color-fill-error-weak);
		--_chip-color: var(--dry-color-text-error);
	}
	.chip-wrap[data-chip-variant='soft'][data-chip-color='green'] {
		--_chip-bg: var(--dry-color-fill-success-weak);
		--_chip-color: var(--dry-color-text-success);
	}
	.chip-wrap[data-chip-variant='soft'][data-chip-color='yellow'] {
		--_chip-bg: var(--dry-color-fill-warning-weak);
		--_chip-color: var(--dry-color-text-warning);
	}

	/* ── Variant: outline ────────────────────────────────────────────────── */

	.chip-wrap[data-chip-variant='outline'] {
		--_chip-bg: var(--dry-color-bg-base);
	}
	.chip-wrap[data-chip-variant='outline'][data-chip-color='gray'] {
		--_chip-color: var(--dry-color-text-weak);
		--_chip-border: var(--dry-color-stroke-weak);
	}
	.chip-wrap[data-chip-variant='outline'][data-chip-color='blue'] {
		--_chip-color: var(--dry-color-text-brand);
		--_chip-border: var(--dry-color-stroke-brand);
	}
	.chip-wrap[data-chip-variant='outline'][data-chip-color='red'] {
		--_chip-color: var(--dry-color-text-error);
		--_chip-border: var(--dry-color-stroke-error);
	}
	.chip-wrap[data-chip-variant='outline'][data-chip-color='green'] {
		--_chip-color: var(--dry-color-text-success);
		--_chip-border: var(--dry-color-stroke-success);
	}
	.chip-wrap[data-chip-variant='outline'][data-chip-color='yellow'] {
		--_chip-color: var(--dry-color-text-warning);
		--_chip-border: var(--dry-color-stroke-warning);
	}
</style>
