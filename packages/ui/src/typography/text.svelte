<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { variantAttrs } from '@dryui/primitives';

	interface Props extends HTMLAttributes<HTMLElement> {
		as?: 'p' | 'span' | 'div';
		color?: 'default' | 'muted' | 'secondary';
		variant?: 'default' | 'muted' | 'secondary';
		size?: 'sm' | 'md' | 'lg';
		children: Snippet;
	}

	let {
		as = 'p',
		color,
		variant,
		size = 'md',
		class: className,
		children,
		...rest
	}: Props = $props();

	let tone = $derived(color ?? variant ?? 'default');
</script>

{#if as === 'span'}
	<span class={className} {...variantAttrs({ as, color: tone, size })} {...rest}
		>{@render children()}</span
	>
{:else if as === 'div'}
	<div class={className} {...variantAttrs({ as, color: tone, size })} {...rest}>
		{@render children()}
	</div>
{:else}
	<p class={className} {...variantAttrs({ as, color: tone, size })} {...rest}>
		{@render children()}
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

	[data-as='span'] {
		display: inline;
	}

	[data-as='div'] {
		display: block;
	}
</style>
