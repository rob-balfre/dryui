<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getMenubarCtx, getMenubarMenuCtx } from './context.svelte.js';
	import { useAnchorStyles } from '../utils/use-anchor-styles.svelte.js';
	import { getMenuItems, focusFirstItem, handleMenuKeydown } from '../internal/menu-navigation.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		placement?: 'bottom' | 'bottom-start' | 'bottom-end';
		offset?: number;
		children: Snippet;
	}

	let { placement = 'bottom-start', offset = 4, children, style, ...rest }: Props = $props();

	const ctx = getMenubarCtx();
	const menuCtx = getMenubarMenuCtx();

	let el = $state<HTMLDivElement>();
	let triggerEl = $state<HTMLElement | null>(null);

	$effect(() => {
		const root = ctx.rootElement;
		triggerEl =
			root?.querySelector<HTMLElement>(`[data-menubar-trigger="${menuCtx.menuId}"]`) ?? null;
	});

	const anchor = useAnchorStyles({
		triggerEl: () => triggerEl,
		contentEl: () => el ?? null,
		placement: () => placement,
		offset: () => offset
	});

	$effect(() => {
		if (menuCtx.open && el && !el.matches(':popover-open')) {
			el.showPopover();
			focusFirstMenubarItem();
		} else if (!menuCtx.open && el?.matches(':popover-open')) {
			el.hidePopover();
		}
	});

	function focusFirstMenubarItem() {
		requestAnimationFrame(() => {
			if (!el) return;
			focusFirstItem(el, getMenuItems(el));
		});
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!el) return;
		switch (e.key) {
			case 'ArrowRight': {
				e.preventDefault();
				ctx.focusNextMenu(menuCtx.menuId);
				return;
			}
			case 'ArrowLeft': {
				e.preventDefault();
				ctx.focusPrevMenu(menuCtx.menuId);
				return;
			}
			case 'Escape': {
				e.preventDefault();
				ctx.closeMenu();
				const trigger = ctx.rootElement?.querySelector<HTMLButtonElement>(
					`[data-menubar-trigger="${menuCtx.menuId}"]`
				);
				trigger?.focus();
				return;
			}
		}
		handleMenuKeydown(e, getMenuItems(el));
	}
</script>

<div
	bind:this={el}
	popover="auto"
	role="menu"
	tabindex="-1"
	aria-labelledby={`menubar-trigger-${menuCtx.menuId}`}
	data-state={menuCtx.open ? 'open' : 'closed'}
	use:anchor.applyPosition={style}
	ontoggle={(e) => {
		const newState = (e as ToggleEvent).newState === 'open';
		if (!newState && menuCtx.open) {
			ctx.closeMenu();
		}
	}}
	onkeydown={handleKeydown}
	{...rest}
>
	{@render children()}
</div>
