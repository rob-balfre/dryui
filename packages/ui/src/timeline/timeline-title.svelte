<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLHeadingElement> {
		level?: 1 | 2 | 3 | 4 | 5 | 6;
		children: Snippet;
	}

	let { level = 3, class: className, children, ...rest }: Props = $props();
</script>

{#if level === 1}
	<h1 data-part="title" data-level={level} class={className} {...rest}>{@render children()}</h1>
{:else if level === 2}
	<h2 data-part="title" data-level={level} class={className} {...rest}>{@render children()}</h2>
{:else if level === 3}
	<h3 data-part="title" data-level={level} class={className} {...rest}>{@render children()}</h3>
{:else if level === 4}
	<h4 data-part="title" data-level={level} class={className} {...rest}>{@render children()}</h4>
{:else if level === 5}
	<h5 data-part="title" data-level={level} class={className} {...rest}>{@render children()}</h5>
{:else}
	<h6 data-part="title" data-level={level} class={className} {...rest}>{@render children()}</h6>
{/if}

<style>
	[data-part='title'] {
		margin: 0;
		color: var(--dry-color-text-strong);
		line-height: 1.25;
		letter-spacing: -0.02em;
	}

	[data-part='title'][data-level='1'] {
		font-size: var(--dry-type-heading-1-size, var(--dry-type-heading-1-size, 1.875rem));
	}

	[data-part='title'][data-level='2'] {
		font-size: var(--dry-type-heading-2-size, var(--dry-type-heading-2-size, 1.5rem));
	}

	[data-part='title'][data-level='3'] {
		font-size: var(--dry-type-heading-3-size, var(--dry-type-heading-3-size, 1.25rem));
	}

	[data-part='title'][data-level='4'] {
		font-size: var(--dry-type-heading-4-size, var(--dry-type-heading-4-size, 1.125rem));
	}

	[data-part='title'][data-level='5'],
	[data-part='title'][data-level='6'] {
		font-size: var(--dry-type-small-size, var(--dry-type-small-size));
	}
</style>
