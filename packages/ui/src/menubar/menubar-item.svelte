<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getMenubarCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		disabled?: boolean;
		onSelect?: () => void;
		children: Snippet;
	}

	let {
		class: className,
		disabled,
		onSelect,
		children,
		onclick,
		onkeydown,
		...rest
	}: Props = $props();

	const ctx = getMenubarCtx();

	function handleClick(e: MouseEvent & { currentTarget: HTMLDivElement }) {
		if (disabled) return;
		if (onSelect) onSelect();
		if (onclick) (onclick as (e: MouseEvent & { currentTarget: HTMLDivElement }) => void)(e);
		ctx.closeMenu();
	}

	function handleKeydown(e: KeyboardEvent & { currentTarget: HTMLDivElement }) {
		if (disabled) return;
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			(e.currentTarget as HTMLElement).click();
		}
		if (onkeydown) (onkeydown as (e: KeyboardEvent & { currentTarget: HTMLDivElement }) => void)(e);
	}
</script>

<div
	role="menuitem"
	tabindex={disabled ? undefined : -1}
	data-menubar-item
	data-disabled={disabled || undefined}
	class={className}
	onclick={handleClick}
	onkeydown={handleKeydown}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-menubar-item] {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
		padding: var(--dry-menu-item-padding, var(--dry-space-2_5) var(--dry-space-2));
		border-radius: var(
			--dry-menu-item-radius,
			min(var(--dry-control-radius, var(--dry-radius-sm)), var(--dry-space-4))
		);
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		cursor: pointer;
		user-select: none;
		outline: none;
		color: var(--dry-color-text-strong);
		min-height: var(--dry-space-11);
		transition: background var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-menubar-item]:hover:not([data-disabled]),
	[data-menubar-item]:focus-visible {
		background: var(--dry-color-fill);
	}

	[data-menubar-item]:active:not([data-disabled]) {
		background: var(--dry-color-fill-hover);
	}

	[data-menubar-item][data-disabled] {
		color: var(--dry-color-text-disabled);
		cursor: not-allowed;
		pointer-events: none;
	}
</style>
