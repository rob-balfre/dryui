<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	interface Props extends HTMLAnchorAttributes {
		active?: boolean;
		children: Snippet;
	}

	let { href, active = false, class: className, children, ...rest }: Props = $props();
</script>

<a {href} data-active={active || undefined} data-nav-menu-link class={className} {...rest}>
	{@render children()}
</a>

<style>
	[data-nav-menu-link] {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		min-height: var(--dry-space-12);
		gap: var(--dry-space-2);
		padding: var(--dry-nav-menu-link-padding-y) var(--dry-nav-menu-link-padding-x);
		border-radius: var(--dry-radius-md);
		color: var(--dry-color-text-strong);
		text-decoration: none;
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			color var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-nav-menu-link]:hover {
		background: var(--dry-color-fill);
		color: var(--dry-color-text-strong);
	}

	[data-nav-menu-link][data-active] {
		background: var(--dry-color-fill-brand-weak);
		color: var(--dry-color-text-brand);
		box-shadow: inset 2px 0 0 var(--dry-color-stroke-selected);
		font-weight: 600;
	}

	[data-nav-menu-link]:focus-visible {
		outline: var(--dry-focus-ring);
		outline-offset: 2px;
	}
</style>
