<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getSidebarCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const ctx = getSidebarCtx();
</script>

<div
	data-sidebar-group-label
	data-collapsed={ctx.collapsed || undefined}
	class={className}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-sidebar-group-label] {
		position: sticky;
		top: calc(-1 * var(--dry-sidebar-content-padding));
		z-index: 1;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		align-items: center;
		margin-inline: calc(-1 * var(--dry-sidebar-content-padding));
		min-height: var(--dry-sidebar-group-label-min-height, var(--dry-space-8));
		padding-block: var(--dry-sidebar-group-label-padding-y, var(--dry-space-3))
			var(--dry-sidebar-group-label-padding-bottom, var(--dry-space-2));
		padding-inline: calc(var(--dry-sidebar-content-padding) + var(--dry-sidebar-item-padding-x));
		background: var(--dry-sidebar-bg, var(--dry-color-bg-raised));
		font-size: var(--dry-type-tiny-size, var(--dry-text-xs-size));
		font-weight: var(--dry-sidebar-group-label-weight, 700);
		letter-spacing: var(--dry-sidebar-group-label-letter-spacing, 0.12em);
		line-height: var(--dry-sidebar-group-label-line-height, 1.1);
		text-transform: uppercase;
		color: var(--dry-sidebar-group-label-color, var(--dry-color-text-weak));
	}
</style>
