<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { getButtonGroupCtx } from '../button-group/context.svelte.js';

	const groupCtx = getButtonGroupCtx();

	// Props that consumers commonly narrow (forcing us to accept their widened spreads).
	// Extend HTMLButtonAttributes but replace color with a friendlier union. disabled/type
	// are left as HTMLButtonAttributes' own (boolean | null | undefined, etc.) so consumers
	// spreading `...rest: HTMLButtonAttributes` into Button type-check.
	interface Props extends Omit<HTMLButtonAttributes, 'color'> {
		variant?:
			| 'solid'
			| 'outline'
			| 'ghost'
			| 'soft'
			| 'secondary'
			| 'link'
			| 'bare'
			| 'trigger'
			| 'nav'
			| 'tab'
			| 'toggle'
			| 'pill';
		size?: 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg';
		// Autocomplete still suggests the canonical values via the literal union.
		color?: 'primary' | 'danger' | (string & {}) | null;
		href?: string;
		rel?: string;
		target?: string;
		download?: boolean | string;
		/** Callback invoked with the rendered `<button>` or `<a>` element on mount, `null` on destroy. */
		ref?: (el: HTMLButtonElement | HTMLAnchorElement | null) => void;
		children: Snippet;
	}

	type AnchorRest = Omit<
		HTMLAnchorAttributes,
		'href' | 'rel' | 'target' | 'download' | 'onclick' | 'children'
	>;

	let {
		variant = 'solid',
		size = 'md',
		color = 'primary',
		disabled = false,
		href,
		rel,
		target,
		download,
		type = 'button',
		onclick,
		class: className,
		ref,
		children,
		...rest
	}: Props = $props();

	function handleLinkClick(event: MouseEvent) {
		if (disabled) {
			event.preventDefault();
			event.stopPropagation();
			return;
		}

		(onclick as ((event: MouseEvent) => void) | undefined)?.(event);
	}

	function attachRef(node: HTMLButtonElement | HTMLAnchorElement) {
		ref?.(node);
		return () => ref?.(null);
	}
</script>

{#snippet element()}
	{#if href !== undefined}
		<a
			{...rest as AnchorRest}
			href={disabled ? undefined : href}
			{rel}
			{target}
			{download}
			aria-disabled={disabled || undefined}
			data-disabled={disabled || undefined}
			tabindex={disabled ? -1 : undefined}
			data-variant={variant}
			data-size={size}
			data-color={color}
			class={className}
			onclick={handleLinkClick}
			{@attach attachRef}
		>
			{@render children()}
		</a>
	{:else}
		<button
			{type}
			{disabled}
			data-disabled={disabled || undefined}
			data-variant={variant}
			data-size={size}
			data-color={color}
			class={className}
			{onclick}
			{...rest}
			{@attach attachRef}
		>
			{@render children()}
		</button>
	{/if}
{/snippet}

{#if groupCtx}
	<span class="wrapper" data-in-group="" data-group-orientation={groupCtx.orientation}>
		{@render element()}
	</span>
{:else}
	{@render element()}
{/if}

<style>
	.wrapper {
		display: inline-grid;
	}

	a,
	button {
		/* Resolve public button tokens without stomping inherited overrides. */
		--_dry-btn-accent: var(--dry-btn-accent, var(--dry-color-fill-brand));
		--_dry-btn-accent-fg: var(--dry-btn-accent-fg, var(--dry-color-text-brand));
		--_dry-btn-accent-stroke: var(--dry-btn-accent-stroke, var(--dry-color-stroke-brand));
		--_dry-btn-accent-weak: var(--dry-btn-accent-weak, var(--dry-color-fill-brand-weak));
		--_dry-btn-accent-hover: var(--dry-btn-accent-hover, var(--dry-color-fill-brand-hover));
		--_dry-btn-accent-active: var(--dry-btn-accent-active, var(--dry-color-fill-brand-active));
		--_dry-btn-on-accent: var(--dry-btn-on-accent, var(--dry-color-on-brand));
		--_dry-btn-bg: var(--dry-btn-bg, var(--_dry-btn-accent));
		--_dry-btn-color: var(--dry-btn-color, var(--_dry-btn-on-accent));
		--_dry-btn-border: var(--dry-btn-border, transparent);
		--_dry-btn-radius: var(--dry-btn-radius, var(--dry-radius-md));
		--_dry-btn-padding-x: var(--dry-btn-padding-x, var(--dry-space-4));
		--_dry-btn-padding-y: var(--dry-btn-padding-y, var(--dry-space-2_5));
		--_dry-btn-font-size: var(
			--dry-btn-font-size,
			var(--dry-type-small-size, var(--dry-text-sm-size))
		);
		--_dry-btn-soft-bg: var(
			--dry-btn-soft-bg,
			color-mix(in srgb, var(--_dry-btn-accent) 12%, transparent)
		);
		--_dry-btn-soft-hover-bg: var(
			--dry-btn-soft-hover-bg,
			color-mix(in srgb, var(--_dry-btn-accent) 20%, transparent)
		);
		--_dry-btn-soft-active-bg: var(
			--dry-btn-soft-active-bg,
			color-mix(in srgb, var(--_dry-btn-accent) 28%, transparent)
		);
		--_dry-btn-ghost-underline: var(
			--dry-btn-ghost-underline,
			color-mix(in srgb, var(--_dry-btn-accent) 65%, transparent)
		);

		display: inline-grid;
		grid-auto-flow: column;
		justify-content: var(--dry-btn-justify, center);
		place-items: var(--dry-btn-align, center);
		gap: var(--dry-space-2);
		padding: var(--_dry-btn-padding-y) var(--_dry-btn-padding-x);
		font-size: var(--_dry-btn-font-size);
		font-family: var(--dry-font-sans);
		font-weight: 500;
		line-height: 1.25;
		color: var(--_dry-btn-color);
		background: var(--_dry-btn-bg);
		border: 1px solid var(--_dry-btn-border);
		border-radius: var(--_dry-btn-radius);
		cursor: pointer;
		letter-spacing: -0.01em;
		text-decoration: none;
		white-space: nowrap;
		user-select: none;
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			box-shadow var(--dry-duration-fast) var(--dry-ease-default),
			color var(--dry-duration-fast) var(--dry-ease-default),
			opacity var(--dry-duration-fast) var(--dry-ease-default);

		&:focus-visible {
			outline: 2px solid var(--dry-color-focus-ring);
			outline-offset: 2px;
			box-shadow: 0 0 0 1px var(--dry-color-stroke-focus);
		}

		&:active:not([data-disabled]) {
			transform: translateY(1px);
		}

		&[data-disabled] {
			--_dry-btn-bg: var(--dry-btn-bg, var(--dry-color-fill-disabled));
			--_dry-btn-color: var(--dry-btn-color, var(--dry-color-text-disabled));
			--_dry-btn-border: var(--dry-btn-border, var(--dry-color-stroke-disabled));
			cursor: not-allowed;
			box-shadow: none;
		}
	}

	/* ── Variants ──────────────────────────────────────────────────────────────── */

	:is(a, button)[data-variant='solid'] {
		--_dry-btn-bg: var(--dry-btn-bg, var(--_dry-btn-accent));
		--_dry-btn-color: var(--dry-btn-color, var(--_dry-btn-on-accent));
		--_dry-btn-border: var(--dry-btn-border, transparent);
		box-shadow: var(--dry-shadow-raised);

		&:hover:not([data-disabled]) {
			--_dry-btn-bg: var(--dry-btn-bg, var(--_dry-btn-accent-hover));
		}

		&:active:not([data-disabled]) {
			--_dry-btn-bg: var(--dry-btn-bg, var(--_dry-btn-accent-active));
		}
	}

	:is(a, button)[data-variant='outline'] {
		--_dry-btn-bg: var(--dry-btn-bg, transparent);
		--_dry-btn-color: var(--dry-btn-color, var(--_dry-btn-accent-fg));
		--_dry-btn-border: var(--dry-btn-border, var(--_dry-btn-accent-stroke));
		box-shadow: var(--dry-shadow-raised);

		&:hover:not([data-disabled]) {
			--_dry-btn-bg: var(--dry-btn-bg, var(--dry-color-bg-alternate));
			--_dry-btn-border: var(--dry-btn-border, var(--dry-color-stroke-strong));
			--_dry-btn-color: var(--dry-btn-color, var(--dry-color-text-strong));
			box-shadow: var(--dry-shadow-sm);
		}

		&:active:not([data-disabled]) {
			--_dry-btn-bg: var(--dry-btn-bg, var(--dry-color-fill));
			--_dry-btn-border: var(--dry-btn-border, var(--dry-color-stroke-strong));
			--_dry-btn-color: var(--dry-btn-color, var(--dry-color-text-strong));
		}
	}

	:is(a, button)[data-variant='ghost'] {
		--_dry-btn-bg: var(--dry-btn-bg, transparent);
		--_dry-btn-color: var(--dry-btn-color, var(--_dry-btn-accent-fg));
		--_dry-btn-border: var(--dry-btn-border, transparent);

		text-decoration: underline;
		text-decoration-color: color-mix(in srgb, var(--_dry-btn-accent-stroke) 70%, transparent);
		text-underline-offset: 2px;

		&:hover:not([data-disabled]) {
			--_dry-btn-bg: var(--dry-btn-bg, var(--_dry-btn-accent-weak));
			--_dry-btn-color: var(--dry-btn-color, var(--_dry-btn-accent-fg));
			text-decoration-color: color-mix(in srgb, var(--_dry-btn-accent-stroke) 70%, transparent);
		}

		&:active:not([data-disabled]) {
			--_dry-btn-bg: var(--dry-btn-bg, var(--_dry-btn-accent));
			--_dry-btn-color: var(--dry-btn-color, var(--_dry-btn-on-accent));
			text-decoration-color: transparent;
		}
	}

	:is(a, button)[data-variant='soft'] {
		--_dry-btn-bg: var(--dry-btn-bg, var(--_dry-btn-accent-weak));
		--_dry-btn-color: var(--dry-btn-color, var(--_dry-btn-accent-fg));
		--_dry-btn-border: var(--dry-btn-border, transparent);

		&:hover:not([data-disabled]) {
			--_dry-btn-bg: var(--dry-btn-bg, var(--_dry-btn-accent-hover));
			--_dry-btn-color: var(--dry-btn-color, var(--_dry-btn-on-accent));
			box-shadow: var(--dry-shadow-sm);
		}

		&:active:not([data-disabled]) {
			--_dry-btn-bg: var(--dry-btn-bg, var(--_dry-btn-accent));
			--_dry-btn-color: var(--dry-btn-color, var(--_dry-btn-on-accent));
		}
	}

	:is(a, button)[data-variant='secondary'] {
		--_dry-btn-bg: var(--dry-btn-bg, transparent);
		--_dry-btn-color: var(--dry-btn-color, var(--_dry-btn-accent-fg));
		--_dry-btn-border: var(--dry-btn-border, var(--_dry-btn-accent-stroke));

		&:hover:not([data-disabled]) {
			--_dry-btn-bg: var(--dry-btn-bg, var(--_dry-btn-accent-weak));
			--_dry-btn-border: var(--dry-btn-border, var(--_dry-btn-accent-stroke));
			--_dry-btn-color: var(--dry-btn-color, var(--_dry-btn-accent-fg));
			box-shadow: var(--dry-shadow-sm);
		}

		&:active:not([data-disabled]) {
			--_dry-btn-bg: var(--dry-btn-bg, var(--_dry-btn-accent));
			--_dry-btn-border: var(--dry-btn-border, var(--_dry-btn-accent-stroke));
			--_dry-btn-color: var(--dry-btn-color, var(--_dry-btn-on-accent));
		}
	}

	:is(a, button)[data-variant='bare'] {
		--_dry-btn-bg: var(--dry-btn-bg, transparent);
		--_dry-btn-color: var(--dry-btn-color, inherit);
		--_dry-btn-border: var(--dry-btn-border, transparent);
		--_dry-btn-padding-x: var(--dry-btn-padding-x, 0);
		--_dry-btn-padding-y: var(--dry-btn-padding-y, 0);

		&:hover:not([data-disabled]) {
			opacity: 0.7;
		}

		&:active:not([data-disabled]) {
			opacity: 0.5;
		}
	}

	:is(a, button)[data-variant='link'] {
		--_dry-btn-bg: var(--dry-btn-bg, transparent);
		--_dry-btn-color: var(--dry-btn-color, var(--_dry-btn-accent-fg));
		--_dry-btn-border: var(--dry-btn-border, transparent);
		text-decoration: underline;
		text-decoration-color: color-mix(in srgb, var(--_dry-btn-accent-stroke) 70%, transparent);
		text-underline-offset: 0.18em;
		padding-inline: 0;

		&:hover:not([data-disabled]) {
			--_dry-btn-color: var(--dry-btn-color, var(--_dry-btn-accent-hover));
			text-decoration-color: color-mix(in srgb, var(--_dry-btn-accent-stroke) 70%, transparent);
		}

		&:active:not([data-disabled]) {
			--_dry-btn-color: var(--dry-btn-color, var(--_dry-btn-accent-active));
			text-decoration-color: color-mix(in srgb, var(--_dry-btn-accent-stroke) 90%, transparent);
		}
	}

	:is(a, button)[data-variant='trigger'] {
		--_dry-btn-bg: var(--dry-btn-bg, transparent);
		--_dry-btn-color: var(--dry-btn-color, var(--dry-color-text-strong));
		--_dry-btn-border: var(--dry-btn-border, transparent);

		&:hover:not([data-disabled]) {
			--_dry-btn-bg: var(--dry-btn-bg, var(--dry-color-fill));
		}

		&:active:not([data-disabled]) {
			--_dry-btn-bg: var(--dry-btn-bg, var(--dry-color-fill-hover));
		}

		&[aria-expanded='true'] {
			--_dry-btn-bg: var(--dry-btn-bg, var(--dry-color-fill));
			--_dry-btn-color: var(--dry-btn-color, var(--dry-color-text-brand));
		}
	}

	:is(a, button)[data-variant='nav'] {
		--_dry-btn-bg: var(--dry-btn-bg, var(--dry-color-bg-raised));
		--_dry-btn-color: var(--dry-btn-color, var(--dry-color-text-strong));
		--_dry-btn-border: var(--dry-btn-border, var(--dry-color-stroke-weak));
		border-radius: 9999px;
		aspect-ratio: 1;
		padding: 0;

		&:hover:not([data-disabled]) {
			--_dry-btn-bg: var(--dry-btn-bg, var(--dry-color-fill));
			--_dry-btn-border: var(--dry-btn-border, var(--dry-color-stroke-strong));
		}

		&:active:not([data-disabled]) {
			--_dry-btn-bg: var(--dry-btn-bg, var(--dry-color-fill-hover));
		}
	}

	:is(a, button)[data-variant='tab'] {
		--_dry-btn-bg: var(--dry-btn-bg, transparent);
		--_dry-btn-color: var(--dry-btn-color, var(--dry-color-text-weak));
		--_dry-btn-border: var(--dry-btn-border, transparent);
		border-bottom: 4px solid transparent;
		border-radius: 0;
		transition:
			color var(--dry-duration-fast) var(--dry-ease-default),
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			background var(--dry-duration-fast) var(--dry-ease-default);

		&:hover:not([data-disabled]) {
			--_dry-btn-color: var(--dry-btn-color, var(--dry-color-text-strong));
		}

		&[aria-selected='true'] {
			--_dry-btn-color: var(--dry-btn-color, var(--dry-color-text-brand));
			border-bottom-color: var(--dry-color-stroke-selected);
			font-weight: 600;
		}
	}

	:is(a, button)[data-variant='toggle'] {
		--_dry-btn-bg: var(--dry-btn-bg, transparent);
		--_dry-btn-color: var(--dry-btn-color, var(--dry-color-text-weak));
		--_dry-btn-border: var(--dry-btn-border, transparent);

		&:hover:not([data-disabled]) {
			--_dry-btn-bg: var(--dry-btn-bg, var(--dry-color-fill));
			--_dry-btn-color: var(--dry-btn-color, var(--dry-color-text-strong));
		}

		&[aria-pressed='true'] {
			--_dry-btn-bg: var(--dry-btn-bg, var(--dry-color-fill-brand));
			--_dry-btn-color: var(--dry-btn-color, var(--dry-color-on-brand));
		}
	}

	:is(a, button)[data-variant='pill'] {
		--_dry-btn-bg: var(--dry-btn-bg, transparent);
		--_dry-btn-color: var(--dry-btn-color, var(--dry-color-text-weak));
		--_dry-btn-border: var(--dry-btn-border, transparent);
		border-radius: 9999px;

		&:hover:not([data-disabled]) {
			--_dry-btn-bg: var(--dry-btn-bg, var(--dry-color-fill-hover));
			--_dry-btn-border: var(--dry-btn-border, var(--dry-color-stroke-strong));
		}

		&[aria-current='page'],
		&[aria-pressed='true'] {
			--_dry-btn-border: var(--dry-btn-border, var(--dry-color-stroke-strong));
		}
	}

	:is(a, button)[data-color='primary'] {
		--_dry-btn-accent: var(--dry-btn-accent, var(--dry-color-fill-brand));
		--_dry-btn-accent-fg: var(--dry-btn-accent-fg, var(--dry-color-text-brand));
		--_dry-btn-accent-stroke: var(--dry-btn-accent-stroke, var(--dry-color-stroke-brand));
		--_dry-btn-accent-weak: var(--dry-btn-accent-weak, var(--dry-color-fill-brand-weak));
		--_dry-btn-accent-hover: var(--dry-btn-accent-hover, var(--dry-color-fill-brand-hover));
		--_dry-btn-accent-active: var(--dry-btn-accent-active, var(--dry-color-fill-brand-active));
	}

	:is(a, button)[data-color='danger'] {
		--_dry-btn-accent: var(--dry-btn-accent, var(--dry-color-fill-error));
		--_dry-btn-accent-fg: var(--dry-btn-accent-fg, var(--dry-color-text-error));
		--_dry-btn-accent-stroke: var(--dry-btn-accent-stroke, var(--dry-color-stroke-error));
		--_dry-btn-accent-weak: var(--dry-btn-accent-weak, var(--dry-color-fill-error-weak));
		--_dry-btn-accent-hover: var(--dry-btn-accent-hover, var(--dry-color-fill-error-hover));
		--_dry-btn-accent-active: var(--dry-btn-accent-active, var(--dry-color-fill-error-hover));
		--_dry-btn-on-accent: var(--dry-btn-on-accent, var(--dry-color-on-error));
	}

	/* ── Sizes ─────────────────────────────────────────────────────────────────── */

	:is(a, button)[data-size='sm'] {
		--_dry-btn-padding-x: var(--dry-btn-padding-x, var(--dry-space-3));
		--_dry-btn-padding-y: var(--dry-btn-padding-y, var(--dry-space-1_5));
		--_dry-btn-font-size: var(
			--dry-btn-font-size,
			var(--dry-type-tiny-size, var(--dry-text-xs-size))
		);
		--_dry-btn-radius: var(--dry-btn-radius, var(--dry-radius-md));
		min-height: var(--dry-btn-min-height, var(--dry-space-8));
	}

	:is(a, button)[data-size='md'] {
		--_dry-btn-padding-x: var(--dry-btn-padding-x, var(--dry-space-4));
		--_dry-btn-padding-y: var(--dry-btn-padding-y, var(--dry-space-2_5));
		--_dry-btn-font-size: var(
			--dry-btn-font-size,
			var(--dry-type-small-size, var(--dry-text-sm-size))
		);
		--_dry-btn-radius: var(--dry-btn-radius, var(--dry-radius-md));
		min-height: var(--dry-btn-min-height, var(--dry-space-12));
	}

	:is(a, button)[data-size='lg'] {
		--_dry-btn-padding-x: var(--dry-btn-padding-x, var(--dry-space-6));
		--_dry-btn-padding-y: var(--dry-btn-padding-y, var(--dry-space-3));
		--_dry-btn-font-size: var(
			--dry-btn-font-size,
			var(--dry-type-heading-4-size, var(--dry-text-base-size))
		);
		--_dry-btn-radius: var(--dry-btn-radius, var(--dry-radius-xl));
		min-height: var(--dry-btn-min-height, var(--dry-space-14));
	}

	/* ── Icon-only sizes (square aspect ratio) ────────────────────────────── */

	:is(a, button)[data-size='icon'] {
		--_dry-btn-padding-x: var(--dry-btn-padding-x, 0);
		--_dry-btn-padding-y: var(--dry-btn-padding-y, 0);
		aspect-ratio: 1;
		height: var(--dry-space-12);
		--_dry-btn-radius: var(--dry-btn-radius, var(--dry-radius-md));
	}

	:is(a, button)[data-size='icon-sm'] {
		--_dry-btn-padding-x: var(--dry-btn-padding-x, 0);
		--_dry-btn-padding-y: var(--dry-btn-padding-y, 0);
		aspect-ratio: 1;
		height: var(--dry-space-8);
		--_dry-btn-radius: var(--dry-btn-radius, var(--dry-radius-sm));
		--_dry-btn-font-size: var(
			--dry-btn-font-size,
			var(--dry-type-tiny-size, var(--dry-text-xs-size))
		);
	}

	:is(a, button)[data-size='icon-lg'] {
		--_dry-btn-padding-x: var(--dry-btn-padding-x, 0);
		--_dry-btn-padding-y: var(--dry-btn-padding-y, 0);
		aspect-ratio: 1;
		height: var(--dry-space-14);
		--_dry-btn-radius: var(--dry-btn-radius, var(--dry-radius-lg));
		--_dry-btn-font-size: var(
			--dry-btn-font-size,
			var(--dry-type-heading-4-size, var(--dry-text-base-size))
		);
	}

	/* ── Button-group integration ─────────────────────────────────────── */

	.wrapper[data-in-group] :is(a, button) {
		border-radius: 0;
	}

	/* Horizontal: first child gets left radii */
	.wrapper[data-in-group][data-group-orientation='horizontal']:first-child :is(a, button) {
		border-top-left-radius: var(--dry-button-group-radius);
		border-bottom-left-radius: var(--dry-button-group-radius);
	}

	/* Horizontal: last child gets right radii */
	.wrapper[data-in-group][data-group-orientation='horizontal']:last-child :is(a, button) {
		border-top-right-radius: var(--dry-button-group-radius);
		border-bottom-right-radius: var(--dry-button-group-radius);
	}

	/* Horizontal: non-first child removes inline-start border */
	.wrapper[data-in-group][data-group-orientation='horizontal']:not(:first-child) :is(a, button) {
		border-inline-start: 0;
	}

	/* Vertical: first child gets top radii */
	.wrapper[data-in-group][data-group-orientation='vertical']:first-child :is(a, button) {
		border-top-left-radius: var(--dry-button-group-radius);
		border-top-right-radius: var(--dry-button-group-radius);
	}

	/* Vertical: last child gets bottom radii */
	.wrapper[data-in-group][data-group-orientation='vertical']:last-child :is(a, button) {
		border-bottom-left-radius: var(--dry-button-group-radius);
		border-bottom-right-radius: var(--dry-button-group-radius);
	}

	/* Vertical: non-first child removes block-start border */
	.wrapper[data-in-group][data-group-orientation='vertical']:not(:first-child) :is(a, button) {
		border-block-start: 0;
	}

	/* Hover/focus z-index for grouped buttons */
	.wrapper[data-in-group]:hover :is(a, button),
	.wrapper[data-in-group]:focus-within :is(a, button) {
		z-index: var(--dry-button-group-hover-z-index);
		position: relative;
	}
</style>
