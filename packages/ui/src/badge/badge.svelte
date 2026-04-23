<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { variantAttrs } from '@dryui/primitives';
	import { resolveAlias } from '../internal/color-aliases.js';
	import type { BadgeColor } from './index.js';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		variant?: 'solid' | 'outline' | 'soft' | 'dot';
		color?: BadgeColor;
		size?: 'sm' | 'md';
		children?: Snippet;
		pulse?: boolean;
		icon?: Snippet;
		/**
		 * Tabular-nums + min-width so numeric counts don't jitter as values
		 * change (e.g. 9 → 10, 99 → 100). Applies `font-variant-numeric`
		 * from `--dry-numeric-variant` and a 1.5em min-width.
		 */
		numeric?: boolean;
	}

	let {
		variant = 'soft',
		color = 'gray',
		size = 'sm',
		class: className,
		children,
		pulse,
		icon,
		numeric = false,
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
		data-numeric={numeric && !isDot ? 'true' : undefined}
		{...variantAttrs({
			variant: isDot ? undefined : variant,
			color: resolvedColor,
			size: isDot ? undefined : size,
			'data-icon-only': hasIcon ? '' : undefined,
			'data-pulse': pulse ? '' : undefined
		})}
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
		justify-self: start;
	}

	[data-badge] {
		/* Component tokens (Tier 3) */
		--_badge-bg-default: var(--dry-color-fill);
		--_badge-color-default: var(--dry-color-text-weak);
		--_badge-border-default: transparent;
		--_badge-font-size-default: var(--dry-type-tiny-size, var(--dry-text-xs-size));
		--_badge-padding-x-default: var(--dry-space-2);
		--_badge-padding-y-default: var(--dry-space-0_5);
		--_badge-radius-default: var(--dry-radius-full);
		--_badge-bg: var(--dry-badge-bg, var(--_badge-bg-default));
		--_badge-color: var(--dry-badge-color, var(--_badge-color-default));
		--_badge-border: var(--dry-badge-border, var(--_badge-border-default));
		--_badge-font-size: var(--dry-badge-font-size, var(--_badge-font-size-default));
		--_badge-padding-x: var(--dry-badge-padding-x, var(--_badge-padding-x-default));
		--_badge-padding-y: var(--dry-badge-padding-y, var(--_badge-padding-y-default));
		--_badge-radius: var(--dry-badge-radius, var(--_badge-radius-default));

		display: inline-grid;
		place-items: center;
		padding: var(--_badge-padding-y) var(--_badge-padding-x);
		font-size: var(--_badge-font-size);
		font-family: var(--dry-font-sans);
		font-weight: 500;
		line-height: var(--dry-type-tiny-leading, var(--dry-text-xs-leading));
		color: var(--_badge-color);
		background: var(--_badge-bg);
		border: 1px solid var(--_badge-border);
		border-radius: var(--_badge-radius);
		white-space: nowrap;
		user-select: none;
	}

	/* ── Sizes ────────────────────────────────────────────────────────────────── */

	[data-size='sm'] {
		--_badge-font-size-default: var(--dry-type-tiny-size, var(--dry-text-xs-size));
		--_badge-padding-x-default: var(--dry-space-2);
		--_badge-padding-y-default: var(--dry-space-0_5);
	}

	[data-size='md'] {
		--_badge-font-size-default: var(--dry-type-small-size, var(--dry-text-sm-size));
		--_badge-padding-x-default: var(--dry-space-2_5);
		--_badge-padding-y-default: var(--dry-space-0_5);
	}

	/* ── Variant: solid ───────────────────────────────────────────────────────── */

	[data-variant='solid'] {
		--_badge-border-default: transparent;
	}

	[data-variant='solid'][data-color='gray'] {
		--_badge-bg-default: var(--dry-color-fill-inverse);
		--_badge-color-default: var(--dry-color-text-inverse);
	}

	[data-variant='solid'][data-color='blue'] {
		--_badge-bg-default: var(--dry-color-fill-brand);
		--_badge-color-default: var(--dry-color-on-brand);
	}

	[data-variant='solid'][data-color='red'] {
		--_badge-bg-default: var(--dry-color-fill-error);
		--_badge-color-default: var(--dry-color-on-error);
	}

	[data-variant='solid'][data-color='green'] {
		--_badge-bg-default: var(--dry-color-fill-success);
		--_badge-color-default: var(--dry-color-on-success);
	}

	[data-variant='solid'][data-color='yellow'] {
		--_badge-bg-default: var(--dry-color-fill-yellow);
		--_badge-color-default: var(--dry-color-on-warning);
	}

	[data-variant='solid'][data-color='purple'] {
		--_badge-bg-default: color-mix(in srgb, var(--dry-color-fill-brand) 80%, hsl(280, 65%, 55%));
		--_badge-color-default: var(--dry-color-on-brand);
	}

	[data-variant='solid'][data-color='orange'] {
		--_badge-bg-default: color-mix(
			in srgb,
			var(--dry-color-fill-warning) 70%,
			var(--dry-color-fill-error)
		);
		--_badge-color-default: var(--dry-color-on-warning);
	}

	/* ── Variant: outline ─────────────────────────────────────────────────────── */

	[data-variant='outline'] {
		--_badge-bg-default: transparent;
	}

	[data-variant='outline'][data-color='gray'] {
		--_badge-color-default: var(--dry-color-text-weak);
		--_badge-border-default: var(--dry-color-stroke-weak);
	}

	[data-variant='outline'][data-color='blue'] {
		--_badge-color-default: var(--dry-color-text-brand);
		--_badge-border-default: var(--dry-color-stroke-brand);
	}

	[data-variant='outline'][data-color='red'] {
		--_badge-color-default: var(--dry-color-text-error);
		--_badge-border-default: var(--dry-color-stroke-error);
	}

	[data-variant='outline'][data-color='green'] {
		--_badge-color-default: var(--dry-color-text-success);
		--_badge-border-default: var(--dry-color-stroke-success);
	}

	[data-variant='outline'][data-color='yellow'] {
		--_badge-color-default: var(--dry-color-text-warning);
		--_badge-border-default: var(--dry-color-stroke-warning);
	}

	[data-variant='outline'][data-color='purple'] {
		--_badge-color-default: color-mix(in srgb, var(--dry-color-fill-brand) 80%, hsl(280, 65%, 55%));
		--_badge-border-default: color-mix(
			in srgb,
			var(--dry-color-stroke-brand) 60%,
			hsl(280, 50%, 70%)
		);
	}

	[data-variant='outline'][data-color='orange'] {
		--_badge-color-default: color-mix(
			in srgb,
			var(--dry-color-text-warning) 60%,
			var(--dry-color-text-error)
		);
		--_badge-border-default: color-mix(
			in srgb,
			var(--dry-color-stroke-warning) 60%,
			var(--dry-color-stroke-error)
		);
	}

	/* ── Variant: soft ────────────────────────────────────────────────────────── */

	[data-variant='soft'] {
		--_badge-border-default: var(--dry-color-stroke-weak);
	}

	[data-variant='soft'][data-color='gray'] {
		--_badge-bg-default: var(--dry-color-fill);
		--_badge-color-default: var(--dry-color-text-weak);
	}

	[data-variant='soft'][data-color='blue'] {
		--_badge-bg-default: var(--dry-color-fill-brand-weak);
		--_badge-color-default: var(--dry-color-text-brand);
	}

	[data-variant='soft'][data-color='red'] {
		--_badge-bg-default: var(--dry-color-fill-error-weak);
		--_badge-color-default: var(--dry-color-text-error);
		--_badge-border-default: var(--dry-color-stroke-error-weak);
	}

	[data-variant='soft'][data-color='green'] {
		--_badge-bg-default: var(--dry-color-fill-success-weak);
		--_badge-color-default: var(--dry-color-text-success);
	}

	[data-variant='soft'][data-color='yellow'] {
		--_badge-bg-default: var(--dry-color-fill-warning-weak);
		--_badge-color-default: var(--dry-color-text-warning);
	}

	[data-variant='soft'][data-color='purple'] {
		--_badge-bg-default: color-mix(
			in srgb,
			var(--dry-color-fill-brand-weak) 70%,
			hsl(280, 65%, 55%, 0.1)
		);
		--_badge-color-default: color-mix(in srgb, var(--dry-color-text-brand) 70%, hsl(280, 65%, 40%));
	}

	[data-variant='soft'][data-color='orange'] {
		--_badge-bg-default: color-mix(
			in srgb,
			var(--dry-color-fill-warning-weak) 50%,
			var(--dry-color-fill-error-weak)
		);
		--_badge-color-default: color-mix(
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

	/* ── Numeric counts ────────────────────────────────────────────────────────
	   Tabular-nums + min-width so values like "9" and "10" occupy the same
	   footprint and don't jitter the surrounding layout as counts change. */
	[data-numeric='true'] {
		font-variant-numeric: var(--dry-numeric-variant);
		min-width: 1.5em;
		text-align: center;
	}
</style>
