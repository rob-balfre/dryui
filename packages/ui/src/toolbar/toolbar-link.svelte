<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	interface Props extends HTMLAnchorAttributes {
		href: string;
		children: Snippet;
	}

	let { href, class: className, children, ...rest }: Props = $props();
</script>

<a {href} data-part="link" tabindex={-1} class={className} {...rest}>
	{@render children()}
</a>

<style>
	[data-part='link'] {
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		padding: var(--dry-space-2) var(--dry-space-3);
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		color: var(--dry-color-text-brand);
		text-decoration: none;
		border-radius: var(--dry-radius-md);
		transition:
			background var(--dry-duration-fast),
			transform var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-part='link']:hover {
		background: var(--dry-color-fill-hover);
		text-decoration: underline;
	}

	[data-part='link']:active {
		transform: translateY(1px);
	}

	[data-part='link']:focus-visible {
		outline: 2px solid var(--dry-color-stroke-focus);
		outline-offset: -2px;
	}
</style>
