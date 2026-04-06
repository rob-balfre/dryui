<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setListCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLUListElement> {
		dense?: boolean;
		disablePadding?: boolean;
		children: Snippet;
	}

	let {
		dense = false,
		disablePadding = false,
		class: className,
		children,
		...rest
	}: Props = $props();

	setListCtx({
		get dense() {
			return dense;
		},
		get disablePadding() {
			return disablePadding;
		}
	});
</script>

<ul
	role="list"
	data-list-root
	data-dense={dense || undefined}
	data-disable-padding={disablePadding || undefined}
	class={className}
	{...rest}
>
	{@render children()}
</ul>

<!-- svelte-ignore css_unused_selector -->
<style>
	[data-list-root] {
		--dry-list-gap: var(--dry-space-1);
		--dry-list-padding: var(--dry-space-2);
		--dry-list-color: var(--dry-color-text-strong);
		--dry-list-item-padding: var(--dry-space-2_5) var(--dry-space-3);
		--dry-list-item-gap: var(--dry-space-3);
		--dry-list-item-radius: var(--dry-radius-md);
		--dry-list-item-hover-bg: color-mix(in srgb, var(--dry-color-fill-brand) 8%, transparent);
		--dry-list-item-active-bg: color-mix(in srgb, var(--dry-color-fill-brand) 12%, transparent);
		--dry-list-item-icon-color: var(--dry-color-icon-weak, var(--dry-color-text-weak));
		--dry-list-primary-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		--dry-list-secondary-size: var(--dry-type-tiny-size, var(--dry-text-xs-size));
		--dry-list-secondary-color: var(--dry-color-text-weak);
		--dry-list-subheader-color: var(--dry-color-text-weak);

		display: grid;
		gap: var(--dry-list-gap);
		margin: 0;
		padding: var(--dry-list-padding);
		list-style: none;
		color: var(--dry-list-color);
	}

	[data-list-root][data-disable-padding='true'] {
		--dry-list-padding: 0;
	}

	[data-list-item] {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: start;
		gap: var(--dry-list-item-gap);
		padding: var(--dry-list-item-padding);
		border-radius: var(--dry-list-item-radius);
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			color var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-list-item][data-interactive='true'] {
		cursor: pointer;
	}

	[data-list-item][data-interactive='true']:hover,
	[data-list-item][data-interactive='true']:focus-visible {
		background: var(--dry-list-item-hover-bg);
	}

	[data-list-item][data-interactive='true']:active {
		background: var(--dry-list-item-active-bg);
	}

	[data-list-item][data-interactive='true']:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: -2px;
	}

	[data-list-item][data-disabled='true'] {
		opacity: 0.5;
		cursor: not-allowed;
		pointer-events: none;
	}

	[data-list-item][data-dense='true'] {
		--dry-list-item-padding: var(--dry-space-1_5) var(--dry-space-2);
	}

	[data-list-item-icon] {
		display: inline-grid;
		place-items: center;
		color: var(--dry-list-item-icon-color);
	}

	[data-list-item-text] {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--dry-space-0_5);
	}

	[data-list-item-text] > [data-list-item-primary] {
		font-size: var(--dry-list-primary-size);
		line-height: 1.5;
	}

	[data-list-item-text] > [data-list-item-secondary] {
		font-size: var(--dry-list-secondary-size);
		color: var(--dry-list-secondary-color);
		line-height: 1.4;
	}

	[data-list-subheader] {
		padding: var(--dry-space-1_5) var(--dry-space-3) var(--dry-space-1);
		font-size: var(--dry-list-secondary-size);
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--dry-list-subheader-color);
	}
</style>
