<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { createAnchorPosition } from '@dryui/primitives';
	import { getMenubarCtx, getMenubarMenuCtx } from './context.svelte.js';

	const MENU_ITEM_SELECTOR = '[role="menuitem"]:not([data-disabled])';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		placement?: 'bottom' | 'bottom-start' | 'bottom-end';
		offset?: number;
		children: Snippet;
	}

	let {
		class: className,
		placement = 'bottom-start',
		offset = 4,
		children,
		style,
		...rest
	}: Props = $props();

	const ctx = getMenubarCtx();
	const menuCtx = getMenubarMenuCtx();

	let el = $state<HTMLDivElement>();
	let triggerEl = $state<HTMLElement | null>(null);

	$effect(() => {
		const root = ctx.rootElement;
		triggerEl =
			root?.querySelector<HTMLElement>(`[data-menubar-trigger="${menuCtx.menuId}"]`) ?? null;
	});

	const anchor = createAnchorPosition(
		() => triggerEl,
		() => el ?? null,
		{
			get placement() {
				return placement;
			},
			get offset() {
				return offset;
			}
		}
	);

	$effect(() => {
		if (!el) return;

		el.style.cssText = typeof style === 'string' ? style : '';
		const positionStyles = anchor.styles;
		for (const [key, value] of Object.entries(positionStyles)) {
			el.style.setProperty(key, value);
		}
	});

	function getMenuItems(container: HTMLElement): HTMLElement[] {
		return Array.from(container.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR));
	}

	function focusItem(items: HTMLElement[], index: number): void {
		if (items.length === 0) return;
		const clamped = ((index % items.length) + items.length) % items.length;
		items[clamped]?.focus();
	}

	$effect(() => {
		if (menuCtx.open && el && !el.matches(':popover-open')) {
			el.showPopover();
			requestAnimationFrame(() => {
				if (!el) return;
				const items = getMenuItems(el);
				const first = items[0];
				if (first) {
					first.focus();
				} else {
					el.focus();
				}
			});
		} else if (!menuCtx.open && el?.matches(':popover-open')) {
			el.hidePopover();
		}
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
		const items = getMenuItems(el);
		const currentIndex = items.indexOf(document.activeElement as HTMLElement);

		switch (e.key) {
			case 'ArrowDown': {
				e.preventDefault();
				focusItem(items, currentIndex + 1);
				return;
			}
			case 'ArrowUp': {
				e.preventDefault();
				focusItem(items, currentIndex - 1);
				return;
			}
			case 'Home': {
				e.preventDefault();
				focusItem(items, 0);
				return;
			}
			case 'End': {
				e.preventDefault();
				focusItem(items, items.length - 1);
				return;
			}
			default: {
				if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
					const char = e.key.toLowerCase();
					const match = items.find((item) =>
						item.textContent?.trim().toLowerCase().startsWith(char)
					);
					if (match) match.focus();
				}
			}
		}
	}
</script>

<div
	bind:this={el}
	popover="auto"
	role="menu"
	tabindex="-1"
	aria-labelledby={`menubar-trigger-${menuCtx.menuId}`}
	data-menubar-content
	data-state={menuCtx.open ? 'open' : 'closed'}
	class={className}
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

<style>
	[data-menubar-content] {
		/* Reset UA popover defaults */
		inset: unset;
		margin: 0;

		background: var(--dry-color-bg-overlay);
		color: var(--dry-color-text-strong);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-lg);
		box-shadow: var(--dry-shadow-overlay);
		padding: var(--dry-space-1);

		transition:
			opacity var(--dry-duration-fast) var(--dry-ease-emphasized),
			transform var(--dry-duration-fast) var(--dry-ease-emphasized);
	}

	[data-menubar-content]:popover-open {
		opacity: 1;
		transform: scale(1) translateY(0);
	}

	@starting-style {
		[data-menubar-content]:popover-open {
			opacity: 0;
			transform: scale(var(--dry-motion-scale-enter))
				translateY(calc(var(--dry-motion-distance-xs) * -1));
		}
	}
</style>
