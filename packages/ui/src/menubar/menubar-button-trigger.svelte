<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import { getMenubarCtx, getMenubarMenuCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
	}

	let { children, onclick, onkeydown, id, ...rest }: Props = $props();

	const ctx = getMenubarCtx();
	const menuCtx = getMenubarMenuCtx();
	const triggerId = $derived(id ?? `menubar-trigger-${menuCtx.menuId}`);

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
				ctx.focusNextMenu(menuCtx.menuId, ctx.hasOpenMenu);
				break;
			}
			case 'ArrowLeft': {
				e.preventDefault();
				ctx.focusPrevMenu(menuCtx.menuId, ctx.hasOpenMenu);
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

<Button
	variant="trigger"
	type="button"
	id={triggerId}
	role="menuitem"
	aria-haspopup="menu"
	aria-expanded={menuCtx.open}
	data-menubar-trigger={menuCtx.menuId}
	data-state={menuCtx.open ? 'open' : 'closed'}
	{...rest}
	onclick={handleClick}
	onpointerenter={handlePointerEnter}
	onkeydown={handleKeydown}
>
	{@render children()}
</Button>
