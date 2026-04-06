<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getMenubarCtx, getMenubarMenuCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
	}

	let { class: className, children, onclick, onkeydown, ...rest }: Props = $props();

	const ctx = getMenubarCtx();
	const menuCtx = getMenubarMenuCtx();

	function handleClick(e: MouseEvent & { currentTarget: HTMLButtonElement }) {
		if (menuCtx.open) {
			ctx.closeMenu();
		} else {
			ctx.openMenu(menuCtx.menuId);
		}
		if (onclick) (onclick as (e: MouseEvent & { currentTarget: HTMLButtonElement }) => void)(e);
	}

	function handlePointerEnter() {
		if (ctx.hasOpenMenu) {
			ctx.openMenu(menuCtx.menuId);
		}
	}

	function handleKeydown(e: KeyboardEvent & { currentTarget: HTMLButtonElement }) {
		switch (e.key) {
			case 'ArrowRight': {
				e.preventDefault();
				ctx.focusNextMenu(menuCtx.menuId);
				break;
			}
			case 'ArrowLeft': {
				e.preventDefault();
				ctx.focusPrevMenu(menuCtx.menuId);
				break;
			}
			case 'ArrowDown': {
				e.preventDefault();
				ctx.openMenu(menuCtx.menuId);
				break;
			}
			case 'Escape': {
				e.preventDefault();
				ctx.closeMenu();
				break;
			}
		}
		if (onkeydown)
			(onkeydown as (e: KeyboardEvent & { currentTarget: HTMLButtonElement }) => void)(e);
	}
</script>

<button
	type="button"
	role="menuitem"
	aria-haspopup="menu"
	aria-expanded={menuCtx.open}
	data-menubar-trigger={menuCtx.menuId}
	data-state={menuCtx.open ? 'open' : 'closed'}
	class={className}
	onclick={handleClick}
	onpointerenter={handlePointerEnter}
	onkeydown={handleKeydown}
	{...rest}
>
	{@render children()}
</button>

<style>
	button {
		display: inline-grid;
		place-items: center;
		min-height: var(--dry-space-12);
		padding: var(--dry-space-2) var(--dry-space-3);
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		font-family: var(--dry-font-sans);
		color: var(--dry-color-text-strong);
		background: transparent;
		border: none;
		border-radius: var(--dry-radius-md);
		cursor: pointer;
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			transform var(--dry-duration-fast) var(--dry-ease-default);
	}

	button:hover {
		background: var(--dry-color-fill);
	}

	button:active {
		transform: translateY(1px);
	}

	button:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: -2px;
	}

	button[data-state='open'] {
		background: var(--dry-color-fill-brand-weak);
		color: var(--dry-color-text-brand);
	}
</style>
