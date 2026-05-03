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
		--_tag-bg-default: var(--dry-color-fill);
		--_tag-color-default: var(--dry-color-text-weak);
		--_tag-border-default: transparent;
		--_tag-font-size-default: var(--dry-type-tiny-size);
		--_tag-padding-x-default: var(--dry-space-2_5);
		--_tag-padding-y-default: var(--dry-space-1);

		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-1);
		padding: var(--dry-tag-padding-y, var(--_tag-padding-y-default))
			var(--dry-tag-padding-x, var(--_tag-padding-x-default));
		font-size: var(--dry-tag-font-size, var(--_tag-font-size-default));
		font-family: var(--dry-font-sans);
		font-weight: 500;
		line-height: var(--dry-type-tiny-leading);
		color: var(--dry-tag-color, var(--_tag-color-default));
		background: var(--dry-tag-bg, var(--_tag-bg-default));
		border: 1px solid var(--dry-tag-border, var(--_tag-border-default));
		border-radius: var(--dry-tag-radius, var(--dry-radius-2xl));
		white-space: nowrap;
		user-select: none;
		transition: background var(--dry-duration-fast) var(--dry-ease-default);
	}

	/* ── Sizes ────────────────────────────────────────────────────────────────── */

	[data-size='sm'] {
		--_tag-font-size-default: var(--dry-type-tiny-size);
		--_tag-padding-x-default: var(--dry-space-2_5);
		--_tag-padding-y-default: var(--dry-space-1);
		min-height: var(--dry-space-6);
	}

	[data-size='md'] {
		--_tag-font-size-default: var(--dry-type-small-size);
		--_tag-padding-x-default: var(--dry-space-3);
		--_tag-padding-y-default: var(--dry-space-1_5);
		min-height: var(--dry-space-8);
		line-height: var(--dry-type-tiny-leading);
	}

	/* ── Variant: solid ───────────────────────────────────────────────────────── */

	[data-variant='solid'] {
		--_tag-border-default: transparent;
	}

	[data-variant='solid'][data-color='gray'] {
		--_tag-bg-default: var(--dry-color-fill-inverse);
		--_tag-color-default: var(--dry-color-text-inverse);
	}

	[data-variant='solid'][data-color='blue'] {
		--_tag-bg-default: var(--dry-color-fill-brand);
		--_tag-color-default: var(--dry-color-on-brand);
	}

	[data-variant='solid'][data-color='red'] {
		--_tag-bg-default: var(--dry-color-fill-error);
		--_tag-color-default: var(--dry-color-on-error);
	}

	[data-variant='solid'][data-color='green'] {
		--_tag-bg-default: var(--dry-color-fill-success);
		--_tag-color-default: var(--dry-color-on-success);
	}

	[data-variant='solid'][data-color='yellow'] {
		--_tag-bg-default: var(--dry-color-fill-yellow);
		--_tag-color-default: var(--dry-color-on-warning);
	}

	[data-variant='solid'][data-color='purple'] {
		--_tag-bg-default: var(--dry-color-fill-purple);
		--_tag-color-default: var(--dry-color-on-purple);
	}

	[data-variant='solid'][data-color='orange'] {
		--_tag-bg-default: color-mix(
			in srgb,
			var(--dry-color-fill-warning) 70%,
			var(--dry-color-fill-error)
		);
		--_tag-color-default: var(--dry-color-on-warning);
	}

	/* ── Variant: outline ─────────────────────────────────────────────────────── */

	[data-variant='outline'] {
		--_tag-bg-default: transparent;
	}

	[data-variant='outline'][data-color='gray'] {
		--_tag-color-default: var(--dry-color-text-weak);
		--_tag-border-default: var(--dry-color-stroke-weak);
	}

	[data-variant='outline'][data-color='blue'] {
		--_tag-color-default: var(--dry-color-text-brand);
		--_tag-border-default: var(--dry-color-stroke-brand);
	}

	[data-variant='outline'][data-color='red'] {
		--_tag-color-default: var(--dry-color-text-error);
		--_tag-border-default: var(--dry-color-stroke-error);
	}

	[data-variant='outline'][data-color='green'] {
		--_tag-color-default: var(--dry-color-text-success);
		--_tag-border-default: var(--dry-color-stroke-success);
	}

	[data-variant='outline'][data-color='yellow'] {
		--_tag-color-default: var(--dry-color-text-warning);
		--_tag-border-default: var(--dry-color-stroke-warning);
	}

	[data-variant='outline'][data-color='purple'] {
		--_tag-color-default: var(--dry-color-text-purple);
		--_tag-border-default: var(--dry-color-stroke-purple);
	}

	[data-variant='outline'][data-color='orange'] {
		--_tag-color-default: color-mix(
			in srgb,
			var(--dry-color-text-warning) 60%,
			var(--dry-color-text-error)
		);
		--_tag-border-default: color-mix(
			in srgb,
			var(--dry-color-stroke-warning) 60%,
			var(--dry-color-stroke-error)
		);
	}

	/* ── Variant: soft ────────────────────────────────────────────────────────── */

	[data-variant='soft'] {
		--_tag-border-default: var(--dry-color-stroke-weak);
	}

	[data-variant='soft'][data-color='gray'] {
		--_tag-bg-default: var(--dry-color-fill);
		--_tag-color-default: var(--dry-color-text-weak);
	}

	[data-variant='soft'][data-color='blue'] {
		--_tag-bg-default: var(--dry-color-fill-brand-weak);
		--_tag-color-default: var(--dry-color-text-brand);
	}

	[data-variant='soft'][data-color='red'] {
		--_tag-bg-default: var(--dry-color-fill-error-weak);
		--_tag-color-default: var(--dry-color-text-error);
	}

	[data-variant='soft'][data-color='green'] {
		--_tag-bg-default: var(--dry-color-fill-success-weak);
		--_tag-color-default: var(--dry-color-text-success);
	}

	[data-variant='soft'][data-color='yellow'] {
		--_tag-bg-default: var(--dry-color-fill-warning-weak);
		--_tag-color-default: var(--dry-color-text-warning);
	}

	[data-variant='soft'][data-color='purple'] {
		--_tag-bg-default: var(--dry-color-fill-purple-weak);
		--_tag-color-default: var(--dry-color-text-purple);
	}

	[data-variant='soft'][data-color='orange'] {
		--_tag-bg-default: color-mix(
			in srgb,
			var(--dry-color-fill-warning-weak) 50%,
			var(--dry-color-fill-error-weak)
		);
		--_tag-color-default: color-mix(
			in srgb,
			var(--dry-color-text-warning) 50%,
			var(--dry-color-text-error)
		);
	}
</style>
