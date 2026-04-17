<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getMenubarCtx, getMenubarMenuCtx } from './context.svelte.js';
	import { createAnchoredPopover } from '../utils/anchored-popover.svelte.js';
	import { createMenuNavigation } from '../utils/menu-navigation.svelte.js';

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

	const popover = createAnchoredPopover({
		triggerEl: () => triggerEl,
		contentEl: () => el ?? null,
		open: () => menuCtx.open,
		placement: () => placement,
		offset: () => offset,
		onAfterShow: () => {
			requestAnimationFrame(() => menu.focusFirst());
		}
	});

	const menu = createMenuNavigation({
		container: () => el ?? null,
		orientation: 'vertical'
	});

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
		menu.handleKeydown(e);
	}
</script>

<div
	bind:this={el}
	popover="auto"
	role="menu"
	tabindex="-1"
	aria-labelledby={`menubar-trigger-${menuCtx.menuId}`}
	data-state={menuCtx.open ? 'open' : 'closed'}
	use:popover.applyPosition={style}
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
