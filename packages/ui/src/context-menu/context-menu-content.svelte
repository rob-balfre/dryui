<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getContextMenuCtx } from './context.svelte.js';

	const MENU_ITEM_SELECTOR = '[role="menuitem"]:not([data-disabled])';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, style, ...rest }: Props = $props();

	const ctx = getContextMenuCtx();

	let el = $state<HTMLDivElement>();

	function getMenuItems(container: HTMLElement): HTMLElement[] {
		return Array.from(container.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR));
	}

	function focusItem(items: HTMLElement[], index: number): void {
		if (items.length === 0) return;
		const clamped = ((index % items.length) + items.length) % items.length;
		items[clamped]?.focus();
	}

	$effect(() => {
		if (ctx.open && el) {
			el.style.position = 'fixed';
			el.style.left = `${ctx.position.x}px`;
			el.style.top = `${ctx.position.y}px`;
			if (!el.matches(':popover-open')) {
				el.showPopover();
				const items = getMenuItems(el);
				const first = items[0];
				if (first) {
					first.focus();
				} else {
					el.focus();
				}
			}
		} else if (!ctx.open && el?.matches(':popover-open')) {
			el.hidePopover();
		}
	});

	// Manual dismiss: close on click outside or Escape
	$effect(() => {
		if (!ctx.open) return;

		function handlePointerDown(e: PointerEvent) {
			if (el?.contains(e.target as Node)) return;
			ctx.close();
		}

		function handleKeydown(e: KeyboardEvent) {
			if (e.key === 'Escape') {
				e.preventDefault();
				ctx.close();
			}
		}

		document.addEventListener('pointerdown', handlePointerDown);
		document.addEventListener('keydown', handleKeydown, true);
		return () => {
			document.removeEventListener('pointerdown', handlePointerDown);
			document.removeEventListener('keydown', handleKeydown, true);
		};
	});

	function handleKeydown(e: KeyboardEvent) {
		if (!el) return;
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
	popover="manual"
	role="menu"
	tabindex="-1"
	id={ctx.contentId}
	aria-labelledby={ctx.triggerId}
	data-context-menu-content
	data-state={ctx.open ? 'open' : 'closed'}
	class={className}
	{style}
	onkeydown={handleKeydown}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-context-menu-content] {
		/* Reset UA popover defaults */
		inset: unset;
		margin: 0;

		--dry-menu-bg: var(--dry-color-bg-overlay);
		--dry-menu-border: var(--dry-color-stroke-weak);
		--dry-menu-radius: var(--dry-radius-lg);
		--dry-menu-shadow: var(--dry-shadow-lg);
		--dry-menu-padding: var(--dry-space-1);

		display: grid;
		grid-template-columns: minmax(12rem, max-content);
		background: var(--dry-menu-bg);
		color: var(--dry-color-text-strong);
		border: 1px solid var(--dry-menu-border);
		border-radius: var(--dry-menu-radius);
		box-shadow: var(--dry-menu-shadow);
		padding: var(--dry-menu-padding);

		transition:
			opacity var(--dry-duration-fast) var(--dry-ease-emphasized),
			transform var(--dry-duration-fast) var(--dry-ease-emphasized);
	}

	[data-context-menu-content]:not(:popover-open) {
		display: none;
	}

	[data-context-menu-content]:popover-open {
		display: grid;
		opacity: 1;
		transform: scale(1) translateY(0);
	}

	@starting-style {
		[data-context-menu-content]:popover-open {
			opacity: 0;
			transform: scale(var(--dry-motion-scale-enter))
				translateY(calc(var(--dry-motion-distance-xs) * -1));
		}
	}
</style>
