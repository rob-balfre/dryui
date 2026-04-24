<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { variantAttrs } from '@dryui/primitives';
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
		// 'ink' renders a solid near-black editorial CTA in light theme that auto-inverts
		// (light bg, dark text) in dark theme, using --dry-color-{bg,text}-inverse tokens.
		color?: 'primary' | 'danger' | 'ink' | (string & {}) | null;
		href?: string;
		rel?: string;
		target?: string;
		download?: boolean | string;
		/** Back-compat alias for `class` — matches Heading/Text ergonomics. Prefer `class`. */
		className?: HTMLButtonAttributes['class'];
		/**
		 * Optical compensation for leading/trailing icons. When `'auto'` (default),
		 * the button trims its inline padding on the icon side by
		 * `--dry-optical-icon-offset` so the label reads visually centered against
		 * the icon. Set to `'off'` to disable the nudge.
		 */
		optical?: 'auto' | 'off';
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
		class: classAttr,
		className = classAttr,
		optical = 'auto',
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

	function syncIconEdgeAttrs(node: HTMLButtonElement | HTMLAnchorElement) {
		const children = Array.from(node.children).filter(
			(child): child is HTMLElement => child instanceof HTMLElement
		);
		const firstChild = children[0];
		const lastChild = children[children.length - 1];

		node.toggleAttribute('data-icon-start', firstChild?.hasAttribute('data-dry-icon') === true);
		node.toggleAttribute('data-icon-end', lastChild?.hasAttribute('data-dry-icon') === true);
	}

	function attachButton(node: HTMLButtonElement | HTMLAnchorElement) {
		ref?.(node);
		syncIconEdgeAttrs(node);

		const observer = new MutationObserver(() => syncIconEdgeAttrs(node));
		observer.observe(node, {
			attributeFilter: ['data-dry-icon'],
			attributes: true,
			childList: true,
			subtree: true
		});

		return () => {
			observer.disconnect();
			ref?.(null);
		};
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
			data-optical={optical}
			data-dry-button
			data-icon-start={undefined}
			data-icon-end={undefined}
			tabindex={disabled ? -1 : undefined}
			{...variantAttrs({ variant, size, color })}
			class={className}
			onclick={handleLinkClick}
			{@attach attachButton}
		>
			{@render children()}
		</a>
	{:else}
		<button
			{type}
			{disabled}
			data-disabled={disabled || undefined}
			data-optical={optical}
			data-dry-button
			data-icon-start={undefined}
			data-icon-end={undefined}
			{...variantAttrs({ variant, size, color })}
			class={className}
			{onclick}
			{...rest}
			{@attach attachButton}
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

	[data-dry-button] {
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
		--_dry-btn-active-transform: var(--dry-btn-active-transform, scale(0.98));
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
		transform-origin: center;
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			box-shadow var(--dry-duration-fast) var(--dry-ease-default),
			color var(--dry-duration-fast) var(--dry-ease-default),
			opacity var(--dry-duration-fast) var(--dry-ease-default);

		&:focus-visible {
			outline: var(--dry-focus-ring);
			outline-offset: 2px;
			box-shadow: 0 0 0 1px var(--dry-color-stroke-focus);
		}

		&:active:not([data-disabled]) {
			transform: var(--_dry-btn-active-transform);
		}

		&[data-disabled] {
			--_dry-btn-bg: var(--dry-btn-bg, var(--dry-color-fill-disabled));
			--_dry-btn-color: var(--dry-btn-color, var(--dry-color-text-disabled));
			--_dry-btn-border: var(--dry-btn-border, var(--dry-color-stroke-disabled));
			cursor: not-allowed;
			box-shadow: none;
		}
	}

	/* ── Optical icon offset ───────────────────────────────────────────────────
	   When a button has a leading or trailing child marked with
	   `[data-dry-icon]`, trim the padding on that side by
	   `--dry-optical-icon-offset` so the label reads visually centered against
	   the icon. Consumers set `data-optical="off"` (via the `optical` prop)
	   to disable the nudge. Data-attribute selectors pierce Svelte style
	   scoping without needing `:global()`, which is banned by
	   `dryui/no-global`. */
	[data-dry-button][data-optical='auto'][data-icon-start] {
		padding-inline-start: calc(var(--_dry-btn-padding-x) - var(--dry-optical-icon-offset));
	}

	[data-dry-button][data-optical='auto'][data-icon-end] {
		padding-inline-end: calc(var(--_dry-btn-padding-x) - var(--dry-optical-icon-offset));
	}

	/* ── Variants ──────────────────────────────────────────────────────────────── */

	[data-dry-button][data-variant='solid'] {
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

	[data-dry-button][data-variant='outline'] {
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

	[data-dry-button][data-variant='ghost'] {
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

	[data-dry-button][data-variant='soft'] {
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

	[data-dry-button][data-variant='secondary'] {
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

	[data-dry-button][data-variant='bare'] {
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

	[data-dry-button][data-variant='link'] {
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

	[data-dry-button][data-variant='trigger'] {
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
			--_dry-btn-bg: var(--dry-btn-trigger-open-bg, var(--dry-btn-bg, var(--dry-color-fill)));
			--_dry-btn-color: var(
				--dry-btn-trigger-open-color,
				var(--dry-btn-color, var(--dry-color-text-brand))
			);
			--_dry-btn-border: var(--dry-btn-trigger-open-border, var(--dry-btn-border, transparent));
		}
	}

	[data-dry-button][data-variant='nav'] {
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

	[data-dry-button][data-variant='tab'] {
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

	[data-dry-button][data-variant='toggle'] {
		--_dry-btn-bg: var(--dry-btn-bg, transparent);
		--_dry-btn-color: var(--dry-btn-color, var(--dry-color-text-weak));
		--_dry-btn-border: var(--dry-btn-border, transparent);

		&:hover:not([data-disabled]) {
			--_dry-btn-bg: var(--dry-btn-bg, var(--dry-color-fill));
			--_dry-btn-color: var(--dry-btn-color, var(--dry-color-text-strong));
		}

		&[aria-pressed='true'],
		&[aria-pressed='true']:hover:not([data-disabled]) {
			--_dry-btn-bg: var(--dry-btn-bg, var(--dry-color-fill-brand));
			--_dry-btn-color: var(--dry-btn-color, var(--dry-color-on-brand));
		}
	}

	[data-dry-button][data-variant='pill'] {
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

	[data-dry-button][data-color='primary'] {
		--_dry-btn-accent: var(--dry-btn-accent, var(--dry-color-fill-brand));
		--_dry-btn-accent-fg: var(--dry-btn-accent-fg, var(--dry-color-text-brand));
		--_dry-btn-accent-stroke: var(--dry-btn-accent-stroke, var(--dry-color-stroke-brand));
		--_dry-btn-accent-weak: var(--dry-btn-accent-weak, var(--dry-color-fill-brand-weak));
		--_dry-btn-accent-hover: var(--dry-btn-accent-hover, var(--dry-color-fill-brand-hover));
		--_dry-btn-accent-active: var(--dry-btn-accent-active, var(--dry-color-fill-brand-active));
	}

	[data-dry-button][data-color='danger'] {
		--_dry-btn-accent: var(--dry-btn-accent, var(--dry-color-fill-error));
		--_dry-btn-accent-fg: var(--dry-btn-accent-fg, var(--dry-color-text-error));
		--_dry-btn-accent-stroke: var(--dry-btn-accent-stroke, var(--dry-color-stroke-error));
		--_dry-btn-accent-weak: var(--dry-btn-accent-weak, var(--dry-color-fill-error-weak));
		--_dry-btn-accent-hover: var(--dry-btn-accent-hover, var(--dry-color-fill-error-hover));
		--_dry-btn-accent-active: var(--dry-btn-accent-active, var(--dry-color-fill-error-hover));
		--_dry-btn-on-accent: var(--dry-btn-on-accent, var(--dry-color-on-error));
	}

	/* ── Ink: editorial "download / primary CTA" preset.
	   Uses the semantic `inverse` tokens so the surface flips between themes:
	   light theme → near-black bg + white text; dark theme → white bg + near-black
	   text. Any consumer token override (--dry-btn-bg etc.) still wins because the
	   variant styles read from the public layer first. */
	[data-dry-button][data-color='ink'] {
		--_dry-btn-accent: var(--dry-btn-accent, var(--dry-color-bg-inverse));
		--_dry-btn-accent-fg: var(--dry-btn-accent-fg, var(--dry-color-text-inverse));
		--_dry-btn-accent-stroke: var(--dry-btn-accent-stroke, var(--dry-color-stroke-strong));
		--_dry-btn-accent-weak: var(
			--dry-btn-accent-weak,
			color-mix(in srgb, var(--dry-color-bg-inverse) 10%, transparent)
		);
		--_dry-btn-accent-hover: var(
			--dry-btn-accent-hover,
			color-mix(in srgb, var(--dry-color-bg-inverse) 85%, transparent)
		);
		--_dry-btn-accent-active: var(
			--dry-btn-accent-active,
			color-mix(in srgb, var(--dry-color-bg-inverse) 75%, transparent)
		);
		--_dry-btn-on-accent: var(--dry-btn-on-accent, var(--dry-color-text-inverse));
	}

	/* ── Sizes ─────────────────────────────────────────────────────────────────── */

	[data-dry-button][data-size='sm'] {
		--_dry-btn-padding-x: var(--dry-btn-padding-x, var(--dry-space-3));
		--_dry-btn-padding-y: var(--dry-btn-padding-y, var(--dry-space-1_5));
		--_dry-btn-font-size: var(
			--dry-btn-font-size,
			var(--dry-type-tiny-size, var(--dry-text-xs-size))
		);
		--_dry-btn-radius: var(--dry-btn-radius, var(--dry-radius-md));
		min-height: var(--dry-btn-min-height, var(--dry-space-8));
	}

	[data-dry-button][data-size='md'] {
		--_dry-btn-padding-x: var(--dry-btn-padding-x, var(--dry-space-4));
		--_dry-btn-padding-y: var(--dry-btn-padding-y, var(--dry-space-2_5));
		--_dry-btn-font-size: var(
			--dry-btn-font-size,
			var(--dry-type-small-size, var(--dry-text-sm-size))
		);
		--_dry-btn-radius: var(--dry-btn-radius, var(--dry-radius-md));
		min-height: var(--dry-btn-min-height, var(--dry-space-12));
	}

	[data-dry-button][data-size='lg'] {
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

	[data-dry-button][data-size='icon'] {
		--_dry-btn-padding-x: var(--dry-btn-padding-x, 0);
		--_dry-btn-padding-y: var(--dry-btn-padding-y, 0);
		aspect-ratio: 1;
		height: var(--dry-space-12);
		--_dry-btn-radius: var(--dry-btn-radius, var(--dry-radius-md));
	}

	[data-dry-button][data-size='icon-sm'] {
		--_dry-btn-padding-x: var(--dry-btn-padding-x, 0);
		--_dry-btn-padding-y: var(--dry-btn-padding-y, 0);
		aspect-ratio: 1;
		height: var(--dry-space-10);
		--_dry-btn-radius: var(--dry-btn-radius, var(--dry-radius-sm));
		--_dry-btn-font-size: var(
			--dry-btn-font-size,
			var(--dry-type-tiny-size, var(--dry-text-xs-size))
		);
	}

	[data-dry-button][data-size='icon-lg'] {
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

	.wrapper[data-in-group] [data-dry-button] {
		border-radius: 0;
	}

	/* Horizontal: first child gets left radii */
	.wrapper[data-in-group][data-group-orientation='horizontal']:first-child [data-dry-button] {
		border-top-left-radius: var(--dry-button-group-radius);
		border-bottom-left-radius: var(--dry-button-group-radius);
	}

	/* Horizontal: last child gets right radii */
	.wrapper[data-in-group][data-group-orientation='horizontal']:last-child [data-dry-button] {
		border-top-right-radius: var(--dry-button-group-radius);
		border-bottom-right-radius: var(--dry-button-group-radius);
	}

	/* Horizontal: non-first child removes inline-start border */
	.wrapper[data-in-group][data-group-orientation='horizontal']:not(:first-child) [data-dry-button] {
		border-inline-start: 0;
	}

	/* Vertical: first child gets top radii */
	.wrapper[data-in-group][data-group-orientation='vertical']:first-child [data-dry-button] {
		border-top-left-radius: var(--dry-button-group-radius);
		border-top-right-radius: var(--dry-button-group-radius);
	}

	/* Vertical: last child gets bottom radii */
	.wrapper[data-in-group][data-group-orientation='vertical']:last-child [data-dry-button] {
		border-bottom-left-radius: var(--dry-button-group-radius);
		border-bottom-right-radius: var(--dry-button-group-radius);
	}

	/* Vertical: non-first child removes block-start border */
	.wrapper[data-in-group][data-group-orientation='vertical']:not(:first-child) [data-dry-button] {
		border-block-start: 0;
	}

	/* Hover/focus z-index for grouped buttons */
	.wrapper[data-in-group]:hover [data-dry-button],
	.wrapper[data-in-group]:focus-within [data-dry-button] {
		z-index: var(--dry-button-group-hover-z-index);
		position: relative;
	}
</style>
