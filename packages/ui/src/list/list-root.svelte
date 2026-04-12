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

<style>
	[data-list-root] {
		--dry-list-gap: var(--dry-space-1);
		--dry-list-padding: var(--dry-space-2);
		--dry-list-color: var(--dry-color-text-strong);
		--dry-list-item-padding: var(--dry-space-2_5) var(--dry-space-3);
		--dry-list-item-gap: var(--dry-space-3);
		--dry-list-item-radius: min(
			var(--dry-control-radius, var(--dry-radius-md)),
			var(--dry-space-4)
		);
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
</style>
