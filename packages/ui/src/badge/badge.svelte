<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { resolveAlias } from '../internal/color-aliases.js';
	import type { BadgeColor } from './index.js';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		variant?: 'solid' | 'outline' | 'soft' | 'dot';
		color?: BadgeColor;
		size?: 'sm' | 'md';
		children?: Snippet;
		pulse?: boolean;
		icon?: Snippet;
	}

	let {
		variant = 'soft',
		color = 'gray',
		size = 'sm',
		class: className,
		children,
		pulse,
		icon,
		...rest
	}: Props = $props();
	const resolvedColor = $derived(resolveAlias(color, 'gray'));
	const isDot = $derived(variant === 'dot');
	const hasIcon = $derived(!!icon && !isDot);
</script>

<span data-wrapper>
	<span
		class={className}
		data-badge={isDot ? undefined : ''}
		data-dot={isDot ? '' : undefined}
		data-variant={isDot ? undefined : variant}
		data-color={resolvedColor}
		data-size={isDot ? undefined : size}
		data-icon-only={hasIcon ? '' : undefined}
		data-pulse={pulse ? '' : undefined}
		{...rest}
	>
		{#if isDot}
			<!-- dot variant renders no content -->
		{:else if icon}
			{@render icon()}
		{:else if children}
			{@render children()}
		{/if}
	</span>
</span>

<style>
	[data-wrapper] {
		display: inline-grid;
	}

	[data-badge] {
		/* Component tokens (Tier 3) */
		--dry-badge-default-bg: var(--dry-color-fill);
		--dry-badge-default-color: var(--dry-color-text-weak);
		--dry-badge-bg: var(--dry-badge-default-bg);
		--dry-badge-color: var(--dry-badge-default-color);
		--dry-badge-border: transparent;
		--dry-badge-font-size: var(--dry-type-tiny-size, var(--dry-text-xs-size));
		--dry-badge-padding-x: var(--dry-space-2);
		--dry-badge-padding-y: var(--dry-space-0_5);
		--dry-badge-radius: var(--dry-radius-full);

		display: inline-grid;
		place-items: center;
		padding: var(--dry-badge-padding-y) var(--dry-badge-padding-x);
		font-size: var(--dry-badge-font-size);
		font-family: var(--dry-font-sans);
		font-weight: 500;
		line-height: var(--dry-type-tiny-leading, var(--dry-text-xs-leading));
		color: var(--dry-badge-color);
		background: var(--dry-badge-bg);
		border: 1px solid var(--dry-badge-border);
		border-radius: var(--dry-badge-radius);
		white-space: nowrap;
		user-select: none;
	}

	/* ── Sizes ────────────────────────────────────────────────────────────────── */

	[data-size='sm'] {
		--dry-badge-font-size: var(--dry-type-tiny-size, var(--dry-text-xs-size));
		--dry-badge-padding-x: var(--dry-space-2);
		--dry-badge-padding-y: var(--dry-space-0_5);
	}

	[data-size='md'] {
		--dry-badge-font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		--dry-badge-padding-x: var(--dry-space-2_5);
		--dry-badge-padding-y: var(--dry-space-0_5);
	}

	/* ── Variant: solid ───────────────────────────────────────────────────────── */

	[data-variant='solid'] {
		--dry-badge-border: transparent;
	}

	[data-variant='solid'][data-color='gray'] {
		--dry-badge-bg: var(--dry-color-fill-inverse);
		--dry-badge-color: var(--dry-color-text-inverse);
	}

	[data-variant='solid'][data-color='blue'] {
		--dry-badge-bg: var(--dry-color-fill-brand);
		--dry-badge-color: var(--dry-color-on-brand);
	}

	[data-variant='solid'][data-color='red'] {
		--dry-badge-bg: var(--dry-color-fill-error);
		--dry-badge-color: var(--dry-color-on-error);
	}

	[data-variant='solid'][data-color='green'] {
		--dry-badge-bg: var(--dry-color-fill-success);
		--dry-badge-color: var(--dry-color-on-success);
	}

	[data-variant='solid'][data-color='yellow'] {
		--dry-badge-bg: var(--dry-color-fill-yellow);
		--dry-badge-color: var(--dry-color-on-warning);
	}

	[data-variant='solid'][data-color='purple'] {
		--dry-badge-bg: color-mix(in srgb, var(--dry-color-fill-brand) 80%, hsl(280, 65%, 55%));
		--dry-badge-color: var(--dry-color-on-brand);
	}

	[data-variant='solid'][data-color='orange'] {
		--dry-badge-bg: color-mix(
			in srgb,
			var(--dry-color-fill-warning) 70%,
			var(--dry-color-fill-error)
		);
		--dry-badge-color: var(--dry-color-on-warning);
	}

	/* ── Variant: outline ─────────────────────────────────────────────────────── */

	[data-variant='outline'] {
		--dry-badge-bg: transparent;
	}

	[data-variant='outline'][data-color='gray'] {
		--dry-badge-color: var(--dry-color-text-weak);
		--dry-badge-border: var(--dry-color-stroke-weak);
	}

	[data-variant='outline'][data-color='blue'] {
		--dry-badge-color: var(--dry-color-text-brand);
		--dry-badge-border: var(--dry-color-stroke-brand);
	}

	[data-variant='outline'][data-color='red'] {
		--dry-badge-color: var(--dry-color-text-error);
		--dry-badge-border: var(--dry-color-stroke-error);
	}

	[data-variant='outline'][data-color='green'] {
		--dry-badge-color: var(--dry-color-text-success);
		--dry-badge-border: var(--dry-color-stroke-success);
	}

	[data-variant='outline'][data-color='yellow'] {
		--dry-badge-color: var(--dry-color-text-warning);
		--dry-badge-border: var(--dry-color-stroke-warning);
	}

	[data-variant='outline'][data-color='purple'] {
		--dry-badge-color: color-mix(in srgb, var(--dry-color-fill-brand) 80%, hsl(280, 65%, 55%));
		--dry-badge-border: color-mix(in srgb, var(--dry-color-stroke-brand) 60%, hsl(280, 50%, 70%));
	}

	[data-variant='outline'][data-color='orange'] {
		--dry-badge-color: color-mix(
			in srgb,
			var(--dry-color-text-warning) 60%,
			var(--dry-color-text-error)
		);
		--dry-badge-border: color-mix(
			in srgb,
			var(--dry-color-stroke-warning) 60%,
			var(--dry-color-stroke-error)
		);
	}

	/* ── Variant: soft ────────────────────────────────────────────────────────── */

	[data-variant='soft'] {
		--dry-badge-border: var(--dry-color-stroke-weak);
	}

	[data-variant='soft'][data-color='gray'] {
		--dry-badge-bg: var(--dry-color-fill);
		--dry-badge-color: var(--dry-color-text-weak);
	}

	[data-variant='soft'][data-color='blue'] {
		--dry-badge-bg: var(--dry-color-fill-brand-weak);
		--dry-badge-color: var(--dry-color-text-brand);
	}

	[data-variant='soft'][data-color='red'] {
		--dry-badge-bg: var(--dry-color-fill-error-weak);
		--dry-badge-color: var(--dry-color-text-error);
		--dry-badge-border: var(--dry-color-stroke-error-weak);
	}

	[data-variant='soft'][data-color='green'] {
		--dry-badge-bg: var(--dry-color-fill-success-weak);
		--dry-badge-color: var(--dry-color-text-success);
	}

	[data-variant='soft'][data-color='yellow'] {
		--dry-badge-bg: var(--dry-color-fill-warning-weak);
		--dry-badge-color: var(--dry-color-text-warning);
	}

	[data-variant='soft'][data-color='purple'] {
		--dry-badge-bg: color-mix(
			in srgb,
			var(--dry-color-fill-brand-weak) 70%,
			hsl(280, 65%, 55%, 0.1)
		);
		--dry-badge-color: color-mix(in srgb, var(--dry-color-text-brand) 70%, hsl(280, 65%, 40%));
	}

	[data-variant='soft'][data-color='orange'] {
		--dry-badge-bg: color-mix(
			in srgb,
			var(--dry-color-fill-warning-weak) 50%,
			var(--dry-color-fill-error-weak)
		);
		--dry-badge-color: color-mix(
			in srgb,
			var(--dry-color-text-warning) 50%,
			var(--dry-color-text-error)
		);
	}

	/* ── Variant: dot ────────────────────────────────────────────────────────── */

	[data-dot] {
		aspect-ratio: 1;
		height: 0.5rem;
		padding: 0;
		border-radius: 50%;
		display: inline-block;
		line-height: 0;
		font-size: 0;
	}

	[data-dot][data-color='gray'] {
		background-color: var(--dry-color-icon);
	}
	[data-dot][data-color='red'] {
		background-color: var(--dry-color-fill-error);
	}
	[data-dot][data-color='green'] {
		background-color: var(--dry-color-fill-success);
	}
	[data-dot][data-color='blue'] {
		background-color: var(--dry-color-fill-brand);
	}
	[data-dot][data-color='yellow'] {
		background-color: var(--dry-color-fill-yellow);
	}
	[data-dot][data-color='purple'] {
		background-color: color-mix(in srgb, var(--dry-color-fill-brand) 70%, hsl(280, 65%, 55%));
	}
	[data-dot][data-color='orange'] {
		background-color: color-mix(
			in srgb,
			var(--dry-color-fill-warning) 70%,
			var(--dry-color-fill-error)
		);
	}

	/* ── Pulse animation ─────────────────────────────────────────────────────── */

	@keyframes dry-badge-pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	[data-pulse] {
		animation: dry-badge-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	@media (prefers-reduced-motion: reduce) {
		[data-dot][data-pulse] {
			animation: none;
		}
	}

	/* ── Icon-only layout ────────────────────────────────────────────────────── */

	[data-icon-only] {
		display: inline-grid;
		place-items: center;
		padding: var(--dry-space-0_5, 0.125rem);
	}
</style>
