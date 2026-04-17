<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { variantAttrs } from '@dryui/primitives';
	import Button from '../button/button.svelte';
	import { resolveAlias } from '../internal/color-aliases.js';
	import type { TagColor } from './index.js';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		variant?: 'solid' | 'outline' | 'soft';
		color?: TagColor;
		size?: 'sm' | 'md';
		dismissible?: boolean;
		onDismiss?: () => void;
		children: Snippet;
	}

	let {
		variant = 'soft',
		color = 'gray',
		size = 'sm',
		dismissible = false,
		onDismiss,
		class: className,
		children,
		...rest
	}: Props = $props();
	const resolvedColor = $derived(resolveAlias(color, 'gray'));
</script>

<span data-wrapper>
	<span
		class={className}
		data-tag
		{...variantAttrs({ variant, color: resolvedColor, size })}
		{...rest}
	>
		{@render children()}
		{#if dismissible}
			<Button variant="bare" type="button" aria-label="Dismiss" onclick={onDismiss}>
				<svg
					width="14"
					height="14"
					viewBox="0 0 14 14"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					aria-hidden="true"
				>
					<path
						d="M11 3L3 11M3 3L11 11"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</Button>
		{/if}
	</span>
</span>

<style>
	[data-wrapper] {
		display: inline-grid;
		justify-self: start;
	}

	[data-tag] {
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-1);
		padding: var(--dry-tag-padding-y, var(--dry-space-1))
			var(--dry-tag-padding-x, var(--dry-space-2_5));
		font-size: var(--dry-tag-font-size, var(--dry-type-tiny-size));
		font-family: var(--dry-font-sans);
		font-weight: 500;
		line-height: var(--dry-type-tiny-leading);
		color: var(--dry-tag-color, var(--dry-color-text-weak));
		background: var(--dry-tag-bg, var(--dry-color-fill));
		border: 1px solid var(--dry-tag-border, transparent);
		border-radius: var(--dry-tag-radius, var(--dry-radius-2xl));
		white-space: nowrap;
		user-select: none;
		transition: background var(--dry-duration-fast) var(--dry-ease-default);
	}

	/* ── Sizes ────────────────────────────────────────────────────────────────── */

	[data-size='sm'] {
		--dry-tag-font-size: var(--dry-type-tiny-size);
		--dry-tag-padding-x: var(--dry-space-2_5);
		--dry-tag-padding-y: var(--dry-space-1);
		min-height: var(--dry-space-6);
	}

	[data-size='md'] {
		--dry-tag-font-size: var(--dry-type-small-size);
		--dry-tag-padding-x: var(--dry-space-3);
		--dry-tag-padding-y: var(--dry-space-1_5);
		min-height: var(--dry-space-8);
		line-height: var(--dry-type-tiny-leading);
	}

	/* ── Variant: solid ───────────────────────────────────────────────────────── */

	[data-variant='solid'] {
		--dry-tag-border: transparent;
	}

	[data-variant='solid'][data-color='gray'] {
		--dry-tag-bg: var(--dry-color-fill-inverse);
		--dry-tag-color: var(--dry-color-text-inverse);
	}

	[data-variant='solid'][data-color='blue'] {
		--dry-tag-bg: var(--dry-color-fill-brand);
		--dry-tag-color: var(--dry-color-on-brand);
	}

	[data-variant='solid'][data-color='red'] {
		--dry-tag-bg: var(--dry-color-fill-error);
		--dry-tag-color: var(--dry-color-on-error);
	}

	[data-variant='solid'][data-color='green'] {
		--dry-tag-bg: var(--dry-color-fill-success);
		--dry-tag-color: var(--dry-color-on-success);
	}

	[data-variant='solid'][data-color='yellow'] {
		--dry-tag-bg: var(--dry-color-fill-yellow);
		--dry-tag-color: var(--dry-color-on-warning);
	}

	[data-variant='solid'][data-color='purple'] {
		--dry-tag-bg: color-mix(in srgb, var(--dry-color-fill-brand) 80%, hsl(280, 65%, 55%));
		--dry-tag-color: var(--dry-color-on-brand);
	}

	[data-variant='solid'][data-color='orange'] {
		--dry-tag-bg: color-mix(
			in srgb,
			var(--dry-color-fill-warning) 70%,
			var(--dry-color-fill-error)
		);
		--dry-tag-color: var(--dry-color-on-warning);
	}

	/* ── Variant: outline ─────────────────────────────────────────────────────── */

	[data-variant='outline'] {
		--dry-tag-bg: transparent;
	}

	[data-variant='outline'][data-color='gray'] {
		--dry-tag-color: var(--dry-color-text-weak);
		--dry-tag-border: var(--dry-color-stroke-weak);
	}

	[data-variant='outline'][data-color='blue'] {
		--dry-tag-color: var(--dry-color-text-brand);
		--dry-tag-border: var(--dry-color-stroke-brand);
	}

	[data-variant='outline'][data-color='red'] {
		--dry-tag-color: var(--dry-color-text-error);
		--dry-tag-border: var(--dry-color-stroke-error);
	}

	[data-variant='outline'][data-color='green'] {
		--dry-tag-color: var(--dry-color-text-success);
		--dry-tag-border: var(--dry-color-stroke-success);
	}

	[data-variant='outline'][data-color='yellow'] {
		--dry-tag-color: var(--dry-color-text-warning);
		--dry-tag-border: var(--dry-color-stroke-warning);
	}

	[data-variant='outline'][data-color='purple'] {
		--dry-tag-color: color-mix(in srgb, var(--dry-color-text-brand) 70%, hsl(280, 65%, 40%));
		--dry-tag-border: color-mix(in srgb, var(--dry-color-stroke-brand) 60%, hsl(280, 50%, 70%));
	}

	[data-variant='outline'][data-color='orange'] {
		--dry-tag-color: color-mix(
			in srgb,
			var(--dry-color-text-warning) 60%,
			var(--dry-color-text-error)
		);
		--dry-tag-border: color-mix(
			in srgb,
			var(--dry-color-stroke-warning) 60%,
			var(--dry-color-stroke-error)
		);
	}

	/* ── Variant: soft ────────────────────────────────────────────────────────── */

	[data-variant='soft'] {
		--dry-tag-border: var(--dry-color-stroke-weak);
	}

	[data-variant='soft'][data-color='gray'] {
		--dry-tag-bg: var(--dry-color-fill);
		--dry-tag-color: var(--dry-color-text-weak);
	}

	[data-variant='soft'][data-color='blue'] {
		--dry-tag-bg: var(--dry-color-fill-brand-weak);
		--dry-tag-color: var(--dry-color-text-brand);
	}

	[data-variant='soft'][data-color='red'] {
		--dry-tag-bg: var(--dry-color-fill-error-weak);
		--dry-tag-color: var(--dry-color-text-error);
	}

	[data-variant='soft'][data-color='green'] {
		--dry-tag-bg: var(--dry-color-fill-success-weak);
		--dry-tag-color: var(--dry-color-text-success);
	}

	[data-variant='soft'][data-color='yellow'] {
		--dry-tag-bg: var(--dry-color-fill-warning-weak);
		--dry-tag-color: var(--dry-color-text-warning);
	}

	[data-variant='soft'][data-color='purple'] {
		--dry-tag-bg: color-mix(in srgb, var(--dry-color-fill-brand-weak) 70%, hsl(280, 65%, 55%, 0.1));
		--dry-tag-color: color-mix(in srgb, var(--dry-color-text-brand) 70%, hsl(280, 65%, 40%));
	}

	[data-variant='soft'][data-color='orange'] {
		--dry-tag-bg: color-mix(
			in srgb,
			var(--dry-color-fill-warning-weak) 50%,
			var(--dry-color-fill-error-weak)
		);
		--dry-tag-color: color-mix(
			in srgb,
			var(--dry-color-text-warning) 50%,
			var(--dry-color-text-error)
		);
	}
</style>
