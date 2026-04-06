<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getMenubarCtx, getMenubarMenuCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
	}

	let { children, onclick, onkeydown, ...rest }: Props = $props();

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
	onclick={handleClick}
	onpointerenter={handlePointerEnter}
	onkeydown={handleKeydown}
	{...rest}
>
	{@render children()}
</button>
