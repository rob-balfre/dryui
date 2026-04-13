<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	interface Props extends HTMLAnchorAttributes {
		active?: boolean;
		children: Snippet;
	}

	let { href, active = false, class: className, children, ...rest }: Props = $props();
</script>

<a {href} data-active={active || undefined} data-sidebar-item class={className} {...rest}>
	{@render children()}
</a>

<style>
	[data-sidebar-item] {
		position: relative;
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-3);
		min-height: var(--dry-sidebar-item-height, var(--dry-space-12));
		padding: var(--dry-sidebar-item-padding-y, var(--dry-space-3)) var(--dry-sidebar-item-padding-x);
		color: var(--dry-color-text-strong);
		text-decoration: none;
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			color var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-sidebar-item]:hover {
		background: var(--dry-color-fill);
	}

	[data-sidebar-item][data-active] {
		background: var(--dry-sidebar-active-bg, var(--dry-color-fill-hover));
		color: var(--dry-sidebar-active-color, var(--dry-color-text-strong));
		font-weight: var(--dry-sidebar-active-weight, inherit);
	}

	[data-sidebar-item][data-active]::before {
		content: '';
		position: absolute;
		inset-block: 0;
		inset-inline-start: 0;
		inset-inline-end: calc(100% - var(--dry-sidebar-active-indicator-width, 4px));
		background: var(--dry-sidebar-active-indicator-color, var(--dry-color-stroke-selected));
	}

	[data-sidebar-item]:focus-visible {
		outline: var(--dry-focus-ring);
		outline-offset: 2px;
	}
</style>
