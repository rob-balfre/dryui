<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { variantAttrs } from '@dryui/primitives';

	interface Props extends HTMLAttributes<HTMLHeadingElement> {
		level?: 1 | 2 | 3 | 4 | 5 | 6;
		variant?: 'default' | 'display';
		children: Snippet;
	}

	let {
		level = 2,
		variant = 'default',
		class: classAttr,
		className = classAttr,
		children,
		...rest
	}: Props = $props();
</script>

{#if level === 1}
	<h1 class={className} {...variantAttrs({ level, variant })} {...rest}>
		{@render children()}
	</h1>
{:else if level === 2}
	<h2 class={className} {...variantAttrs({ level, variant })} {...rest}>
		{@render children()}
	</h2>
{:else if level === 3}
	<h3 class={className} {...variantAttrs({ level, variant })} {...rest}>
		{@render children()}
	</h3>
{:else if level === 4}
	<h4 class={className} {...variantAttrs({ level, variant })} {...rest}>
		{@render children()}
	</h4>
{:else if level === 5}
	<h5 class={className} {...variantAttrs({ level, variant })} {...rest}>
		{@render children()}
	</h5>
{:else}
	<h6 class={className} {...variantAttrs({ level, variant })} {...rest}>
		{@render children()}
	</h6>
{/if}

<style>
	h1,
	h2,
	h3,
	h4,
	h5,
	h6 {
		margin: 0;
		color: var(--dry-typography-heading-color, var(--dry-color-text-strong));
		font-family: var(--dry-font-sans);
		font-weight: 700;
		line-height: var(--dry-type-heading-2-leading, 2.5rem);
		letter-spacing: -0.03em;
		text-wrap: balance;
	}

	[data-level='1'] {
		font-size: var(--dry-type-heading-1-size, var(--dry-text-4xl-size, 2.25rem));
		line-height: var(--dry-type-heading-1-leading, 3rem);
	}

	[data-level='2'] {
		font-size: var(--dry-type-heading-2-size, var(--dry-text-3xl-size, 1.875rem));
		line-height: var(--dry-type-heading-2-leading, 2.5rem);
	}

	[data-level='3'] {
		font-size: var(--dry-type-heading-3-size, var(--dry-text-2xl-size, 1.5rem));
		line-height: var(--dry-type-heading-3-leading, 2rem);
	}

	[data-level='4'] {
		font-size: var(--dry-type-heading-4-size, var(--dry-text-xl-size, 1.25rem));
		line-height: var(--dry-type-heading-4-leading, 1.75rem);
	}

	[data-level='5'] {
		font-size: var(--dry-type-small-size, var(--dry-text-lg-size, 1.125rem));
		line-height: var(--dry-type-small-leading, 1.5rem);
	}

	[data-level='6'] {
		font-size: var(--dry-type-tiny-size, var(--dry-text-xs-size));
		line-height: var(--dry-type-tiny-leading, 1.25rem);
	}

	[data-variant='display'] {
		font-size: var(--dry-type-display-size, var(--dry-text-4xl-size, 2.25rem));
		line-height: var(--dry-type-display-leading, 4rem);
		letter-spacing: -0.04em;
	}
</style>
