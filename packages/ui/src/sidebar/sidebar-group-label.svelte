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
		margin-inline: calc(-1 * var(--dry-sidebar-content-padding));
		padding-block: var(--dry-space-2);
		padding-inline: calc(var(--dry-sidebar-content-padding) + var(--dry-sidebar-item-padding-x));
		background: var(--dry-sidebar-bg, var(--dry-color-bg-raised));
		font-size: var(--dry-type-tiny-size, var(--dry-text-xs-size));
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}
</style>
