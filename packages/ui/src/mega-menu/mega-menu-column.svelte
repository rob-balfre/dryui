<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		title?: string;
		children: Snippet;
	}

	let { title, class: className, children, ...rest }: Props = $props();
</script>

<div data-mega-menu-column class={className} {...rest}>
	{#if title}
		<div data-part="column-title">{title}</div>
	{/if}
	{@render children()}
</div>

<style>
	[data-mega-menu-column] [data-part='column-title'] {
		font-size: var(--dry-type-ui-caption-size, var(--dry-text-xs-size, 0.75rem));
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--dry-color-text-weak, #64748b);
		margin-bottom: var(--dry-space-3, 0.75rem);
	}
</style>
