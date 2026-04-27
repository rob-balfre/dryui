<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { variantAttrs } from '@dryui/primitives';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'class'> {
		as?: 'p' | 'span' | 'div';
		color?: 'default' | 'muted' | 'secondary';
		size?: 'xs' | 'sm' | 'md' | 'lg';
		font?: 'sans' | 'mono';
		weight?: 'normal' | 'medium' | 'semibold' | 'bold';
		variant?: 'default' | 'label';
		maxMeasure?: 'narrow' | 'default' | 'wide' | false;
		children?: Snippet;
	}

	let {
		as = 'p',
		color = 'default',
		size = 'md',
		font = 'sans',
		weight,
		variant = 'default',
		maxMeasure = false,
		children,
		...rest
	}: Props = $props();

	let measure: 'narrow' | 'default' | 'wide' | undefined = $derived(
		maxMeasure === false ? undefined : maxMeasure
	);
</script>

{#if as === 'span'}
	<span
		{...variantAttrs({ color, size, font, weight: weight || undefined, variant, measure })}
		{...rest}>{@render children?.()}</span
	>
{:else if as === 'div'}
	<div
		{...variantAttrs({ color, size, font, weight: weight || undefined, variant, measure })}
		{...rest}
	>
		{@render children?.()}
	</div>
{:else}
	<p
		{...variantAttrs({ color, size, font, weight: weight || undefined, variant, measure })}
		{...rest}
	>
		{@render children?.()}
	</p>
{/if}

<style>
	p,
	span,
	div {
		margin: 0;
		color: var(--dry-typography-text-color, var(--dry-color-text-strong));
		font-family: var(--dry-font-sans);
		line-height: 1.7;
		text-wrap: pretty;
	}

	[data-color='muted'] {
		--dry-typography-text-color: var(--dry-color-text-weak);
	}

	[data-color='secondary'] {
		--dry-typography-text-color: var(--dry-color-text-weak);
	}

	[data-size='xs'] {
		font-size: var(--dry-type-xs-size);
	}

	[data-size='sm'] {
		font-size: var(--dry-type-ui-control-size, var(--dry-type-tiny-size, var(--dry-text-sm-size)));
		line-height: var(
			--dry-type-ui-control-leading,
			var(--dry-type-tiny-leading, var(--dry-text-sm-leading))
		);
	}

	[data-size='md'] {
		font-size: var(--dry-type-ui-body-size, var(--dry-type-small-size, var(--dry-text-base-size)));
		line-height: var(
			--dry-type-ui-body-leading,
			var(--dry-type-small-leading, var(--dry-text-base-leading))
		);
	}

	[data-size='lg'] {
		font-size: var(
			--dry-type-ui-title-size,
			var(--dry-type-heading-4-size, var(--dry-text-lg-size))
		);
		line-height: var(
			--dry-type-ui-title-leading,
			var(--dry-type-heading-4-leading, var(--dry-text-lg-leading))
		);
	}

	span {
		display: inline;
	}

	div {
		display: block;
	}

	[data-font='mono'] {
		font-family: var(--dry-font-mono);
	}

	[data-weight='normal'] {
		font-weight: 400;
	}
	[data-weight='medium'] {
		font-weight: 500;
	}
	[data-weight='semibold'] {
		font-weight: 600;
	}
	[data-weight='bold'] {
		font-weight: 700;
	}

	[data-variant='label'] {
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 600;
	}

	/* ── Measure (max-inline-size) ─────────────────────────────────────────────
	   Body copy gets wider presets than Heading so paragraphs read well
	   without feeling cramped. */
	[data-measure='narrow'] {
		max-inline-size: 48ch;
	}

	[data-measure='default'] {
		max-inline-size: 65ch;
	}

	[data-measure='wide'] {
		max-inline-size: 80ch;
	}
</style>
