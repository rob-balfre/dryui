<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { getButtonGroupCtx } from '../button-group/context.svelte.js';

	const groupCtx = getButtonGroupCtx();

	interface Props extends HTMLButtonAttributes {
		variant?: 'solid' | 'outline' | 'ghost' | 'soft' | 'secondary' | 'link' | 'bare';
		size?: 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg';
		color?: 'primary' | 'danger';
		disabled?: boolean;
		href?: string;
		rel?: string;
		target?: string;
		download?: boolean | string;
		type?: 'button' | 'submit' | 'reset';
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
</script>

<span
	class="wrapper"
	data-in-group={groupCtx ? '' : undefined}
	data-group-orientation={groupCtx?.orientation}
>
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
		>
			{@render children()}
		</button>
	{/if}
</span>

<style>
	.wrapper {
		display: inline-grid;
	}

	a,
	button {
		/* Component tokens (Tier 3) */
		--dry-btn-accent: var(--dry-color-fill-brand);
		--dry-btn-accent-fg: var(--dry-color-text-brand);
		--dry-btn-accent-stroke: var(--dry-color-stroke-brand);
		--dry-btn-accent-weak: var(--dry-color-fill-brand-weak);
		--dry-btn-accent-hover: var(--dry-color-fill-brand-hover);
		--dry-btn-accent-active: var(--dry-color-fill-brand-active);
		--dry-btn-on-accent: var(--dry-color-on-brand);
		--dry-btn-bg: var(--dry-btn-accent);
		--dry-btn-color: var(--dry-btn-on-accent);
		--dry-btn-border: transparent;
		--dry-btn-radius: var(--dry-radius-md);
		--dry-btn-padding-x: var(--dry-space-4);
		--dry-btn-padding-y: var(--dry-space-2_5);
		--dry-btn-font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		--dry-btn-soft-bg: color-mix(in srgb, var(--dry-btn-accent) 12%, transparent);
		--dry-btn-soft-hover-bg: color-mix(in srgb, var(--dry-btn-accent) 20%, transparent);
		--dry-btn-soft-active-bg: color-mix(in srgb, var(--dry-btn-accent) 28%, transparent);
		--dry-btn-ghost-underline: color-mix(in srgb, var(--dry-btn-accent) 65%, transparent);

		display: inline-grid;
		grid-auto-flow: column;
		justify-content: center;
		place-items: center;
		gap: var(--dry-space-2);
		padding: var(--dry-btn-padding-y) var(--dry-btn-padding-x);
		font-size: var(--dry-btn-font-size);
		font-family: var(--dry-font-sans);
		font-weight: 500;
		line-height: 1.25;
		color: var(--dry-btn-color);
		background: var(--dry-btn-bg);
		border: 1px solid var(--dry-btn-border);
		border-radius: var(--dry-btn-radius);
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
			--dry-btn-bg: var(--dry-color-fill-disabled);
			--dry-btn-color: var(--dry-color-text-disabled);
			--dry-btn-border: var(--dry-color-stroke-disabled);
			cursor: not-allowed;
			box-shadow: none;
		}
	}

	/* ── Variants ──────────────────────────────────────────────────────────────── */

	:is(a, button)[data-variant='solid'] {
		--dry-btn-bg: var(--dry-btn-accent);
		--dry-btn-color: var(--dry-btn-on-accent);
		--dry-btn-border: transparent;
		box-shadow: var(--dry-shadow-raised);

		&:hover:not([data-disabled]) {
			--dry-btn-bg: var(--dry-btn-accent-hover);
		}

		&:active:not([data-disabled]) {
			--dry-btn-bg: var(--dry-btn-accent-active);
		}
	}

	:is(a, button)[data-variant='outline'] {
		--dry-btn-bg: transparent;
		--dry-btn-color: var(--dry-btn-accent-fg);
		--dry-btn-border: var(--dry-btn-accent-stroke);
		box-shadow: var(--dry-shadow-raised);

		&:hover:not([data-disabled]) {
			--dry-btn-bg: var(--dry-color-bg-alternate);
			--dry-btn-border: var(--dry-color-stroke-strong);
			--dry-btn-color: var(--dry-color-text-strong);
			box-shadow: var(--dry-shadow-sm);
		}

		&:active:not([data-disabled]) {
			--dry-btn-bg: var(--dry-color-fill);
			--dry-btn-border: var(--dry-color-stroke-strong);
			--dry-btn-color: var(--dry-color-text-strong);
		}
	}

	:is(a, button)[data-variant='ghost'] {
		--dry-btn-bg: transparent;
		--dry-btn-color: var(--dry-btn-accent-fg);
		--dry-btn-border: transparent;

		text-decoration: underline;
		text-decoration-color: color-mix(in srgb, var(--dry-btn-accent-stroke) 70%, transparent);
		text-underline-offset: 2px;

		&:hover:not([data-disabled]) {
			--dry-btn-bg: var(--dry-btn-accent-weak);
			--dry-btn-color: var(--dry-btn-accent-fg);
			text-decoration-color: color-mix(in srgb, var(--dry-btn-accent-stroke) 70%, transparent);
		}

		&:active:not([data-disabled]) {
			--dry-btn-bg: var(--dry-btn-accent);
			--dry-btn-color: var(--dry-btn-on-accent);
			text-decoration-color: transparent;
		}
	}

	:is(a, button)[data-variant='soft'] {
		--dry-btn-bg: var(--dry-btn-accent-weak);
		--dry-btn-color: var(--dry-btn-accent-fg);
		--dry-btn-border: transparent;

		&:hover:not([data-disabled]) {
			--dry-btn-bg: var(--dry-btn-accent-hover);
			--dry-btn-color: var(--dry-btn-on-accent);
			box-shadow: var(--dry-shadow-sm);
		}

		&:active:not([data-disabled]) {
			--dry-btn-bg: var(--dry-btn-accent);
			--dry-btn-color: var(--dry-btn-on-accent);
		}
	}

	:is(a, button)[data-variant='secondary'] {
		--dry-btn-bg: transparent;
		--dry-btn-color: var(--dry-btn-accent-fg);
		--dry-btn-border: var(--dry-btn-accent-stroke);

		&:hover:not([data-disabled]) {
			--dry-btn-bg: var(--dry-btn-accent-weak);
			--dry-btn-border: var(--dry-btn-accent-stroke);
			--dry-btn-color: var(--dry-btn-accent-fg);
			box-shadow: var(--dry-shadow-sm);
		}

		&:active:not([data-disabled]) {
			--dry-btn-bg: var(--dry-btn-accent);
			--dry-btn-border: var(--dry-btn-accent-stroke);
			--dry-btn-color: var(--dry-btn-on-accent);
		}
	}

	:is(a, button)[data-variant='bare'] {
		--dry-btn-bg: transparent;
		--dry-btn-color: inherit;
		--dry-btn-border: transparent;
		--dry-btn-padding-x: 0;
		--dry-btn-padding-y: 0;

		&:hover:not([data-disabled]) {
			opacity: 0.7;
		}

		&:active:not([data-disabled]) {
			opacity: 0.5;
		}
	}

	:is(a, button)[data-variant='link'] {
		--dry-btn-bg: transparent;
		--dry-btn-color: var(--dry-btn-accent-fg);
		--dry-btn-border: transparent;
		text-decoration: underline;
		text-decoration-color: color-mix(in srgb, var(--dry-btn-accent-stroke) 70%, transparent);
		text-underline-offset: 0.18em;
		padding-inline: 0;

		&:hover:not([data-disabled]) {
			--dry-btn-color: var(--dry-btn-accent-hover);
			text-decoration-color: color-mix(in srgb, var(--dry-btn-accent-stroke) 70%, transparent);
		}

		&:active:not([data-disabled]) {
			--dry-btn-color: var(--dry-btn-accent-active);
			text-decoration-color: color-mix(in srgb, var(--dry-btn-accent-stroke) 90%, transparent);
		}
	}

	:is(a, button)[data-color='primary'] {
		--dry-btn-accent: var(--dry-color-fill-brand);
		--dry-btn-accent-fg: var(--dry-color-text-brand);
		--dry-btn-accent-stroke: var(--dry-color-stroke-brand);
		--dry-btn-accent-weak: var(--dry-color-fill-brand-weak);
		--dry-btn-accent-hover: var(--dry-color-fill-brand-hover);
		--dry-btn-accent-active: var(--dry-color-fill-brand-active);
	}

	:is(a, button)[data-color='danger'] {
		--dry-btn-accent: var(--dry-color-fill-error);
		--dry-btn-accent-fg: var(--dry-color-text-error);
		--dry-btn-accent-stroke: var(--dry-color-stroke-error);
		--dry-btn-accent-weak: var(--dry-color-fill-error-weak);
		--dry-btn-accent-hover: var(--dry-color-fill-error-hover);
		--dry-btn-accent-active: var(--dry-color-fill-error-hover);
		--dry-btn-on-accent: var(--dry-color-on-error);
	}

	/* ── Sizes ─────────────────────────────────────────────────────────────────── */

	:is(a, button)[data-size='sm'] {
		--dry-btn-padding-x: var(--dry-space-3);
		--dry-btn-padding-y: var(--dry-space-1_5);
		--dry-btn-font-size: var(--dry-type-tiny-size, var(--dry-text-xs-size));
		--dry-btn-radius: var(--dry-radius-md);
		min-height: var(--dry-space-8);
	}

	:is(a, button)[data-size='md'] {
		--dry-btn-padding-x: var(--dry-space-4);
		--dry-btn-padding-y: var(--dry-space-2_5);
		--dry-btn-font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		--dry-btn-radius: var(--dry-radius-md);
		min-height: var(--dry-space-12);
	}

	:is(a, button)[data-size='lg'] {
		--dry-btn-padding-x: var(--dry-space-6);
		--dry-btn-padding-y: var(--dry-space-3);
		--dry-btn-font-size: var(--dry-type-heading-4-size, var(--dry-text-base-size));
		--dry-btn-radius: var(--dry-radius-xl);
		min-height: var(--dry-space-14);
	}

	/* ── Icon-only sizes (square aspect ratio) ────────────────────────────── */

	:is(a, button)[data-size='icon'] {
		--dry-btn-padding-x: 0;
		--dry-btn-padding-y: 0;
		aspect-ratio: 1;
		height: var(--dry-space-12);
		--dry-btn-radius: var(--dry-radius-md);
	}

	:is(a, button)[data-size='icon-sm'] {
		--dry-btn-padding-x: 0;
		--dry-btn-padding-y: 0;
		aspect-ratio: 1;
		height: var(--dry-space-12);
		--dry-btn-radius: var(--dry-radius-sm);
		--dry-btn-font-size: var(--dry-type-tiny-size, var(--dry-text-xs-size));
	}

	:is(a, button)[data-size='icon-lg'] {
		--dry-btn-padding-x: 0;
		--dry-btn-padding-y: 0;
		aspect-ratio: 1;
		height: var(--dry-space-12);
		--dry-btn-radius: var(--dry-radius-lg);
		--dry-btn-font-size: var(--dry-type-heading-4-size, var(--dry-text-base-size));
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
