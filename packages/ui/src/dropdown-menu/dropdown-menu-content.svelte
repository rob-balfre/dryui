<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { createPositionedPopover } from '@dryui/primitives';
	import type { Placement } from '@dryui/primitives';
	import { getDropdownMenuCtx } from './context.svelte.js';

	const MENU_ITEM_SELECTOR = '[role="menuitem"]:not([data-disabled])';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		placement?: Placement;
		offset?: number;
		children: Snippet;
	}

	let {
		class: className,
		placement = 'bottom-start',
		offset = 8,
		children,
		style,
		...rest
	}: Props = $props();

	const ctx = getDropdownMenuCtx();

	let el = $state<HTMLDivElement>();

	const popover = createPositionedPopover({
		triggerEl: () => ctx.triggerEl,
		contentEl: () => el ?? null,
		placement: () => placement,
		offset: () => offset
	});

	function getMenuItems(container: HTMLElement): HTMLElement[] {
		return Array.from(container.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR));
	}

	function focusItem(items: HTMLElement[], index: number): void {
		if (items.length === 0) return;
		const clamped = ((index % items.length) + items.length) % items.length;
		items[clamped]?.focus();
	}

	function focusFirstItem(): void {
		if (!el) return;
		const items = getMenuItems(el);
		const first = items[0];
		if (first) {
			first.focus();
		} else {
			el.focus();
		}
	}

	$effect(() => {
		if (ctx.open && el && !el.matches(':popover-open')) {
			popover.showPopover(el);
		} else if (!ctx.open && el?.matches(':popover-open')) {
			popover.hidePopover(el);
		}
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
	popover="auto"
	role="menu"
	tabindex="-1"
	id={ctx.contentId}
	aria-labelledby={ctx.triggerId}
	data-dropdown-menu-content
	data-state={ctx.open ? 'open' : 'closed'}
	class={className}
	use:popover.applyPosition={style}
	ontoggle={(e) => {
		const newState = (e as ToggleEvent).newState === 'open';
		if (newState && !ctx.open) {
			ctx.show();
			queueMicrotask(focusFirstItem);
		} else if (!newState && ctx.open) {
			ctx.close();
		}
	}}
	onkeydown={handleKeydown}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-dropdown-menu-content] {
		/* Reset UA popover defaults */
		inset: unset;
		margin: 0;

		background: var(--dry-menu-bg, var(--dry-overlay-bg, var(--dry-color-bg-overlay)));
		color: var(--dry-color-text-strong);
		border: 1px solid
			var(--dry-menu-border, var(--dry-overlay-border, var(--dry-color-stroke-weak)));
		border-radius: var(--dry-menu-radius, var(--dry-overlay-radius, var(--dry-radius-lg)));
		box-shadow: var(--dry-menu-shadow, var(--dry-overlay-shadow, var(--dry-shadow-overlay)));
		display: grid;
		grid-template-columns: minmax(12rem, auto);
		padding: var(--dry-menu-padding, var(--dry-space-2));
		--dry-radius-nested: max(
			0px,
			calc(
				var(--dry-menu-radius, var(--dry-radius-lg)) - var(--dry-menu-padding, var(--dry-space-2))
			)
		);

		transition:
			opacity var(--dry-duration-fast) var(--dry-ease-emphasized),
			transform var(--dry-duration-fast) var(--dry-ease-emphasized);
	}

	[data-dropdown-menu-content]:not(:popover-open) {
		display: none;
	}

	[data-dropdown-menu-content]:popover-open {
		display: grid;
		opacity: 1;
		transform: scale(1) translateY(0);
	}

	@starting-style {
		[data-dropdown-menu-content]:popover-open {
			opacity: 0;
			transform: scale(var(--dry-motion-scale-enter))
				translateY(calc(var(--dry-motion-distance-xs) * -1));
		}
	}
</style>
