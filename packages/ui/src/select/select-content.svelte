<script lang="ts">
	import { fromAction } from 'svelte/attachments';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { createAnchoredPopover, type Placement } from '@dryui/primitives';
	import { getSelectCtx } from './context.svelte.js';

	const OPTION_SELECTOR = '[role="option"]:not([data-disabled])';

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

	const ctx = getSelectCtx();

	let el = $state<HTMLDivElement | null>(null);

	function attachContent(node: HTMLDivElement) {
		el = node;

		return () => {
			if (el === node) {
				el = null;
			}
		};
	}

	function getOptionItems(container: HTMLElement): HTMLElement[] {
		return Array.from(container.querySelectorAll<HTMLElement>(OPTION_SELECTOR));
	}

	function focusItem(items: HTMLElement[], index: number): void {
		if (items.length === 0) return;
		const clamped = ((index % items.length) + items.length) % items.length;
		items[clamped]?.focus();
	}

	const popover = createAnchoredPopover({
		triggerEl: () => ctx.triggerEl,
		contentEl: () => el ?? null,
		open: () => ctx.open,
		placement: () => placement,
		offset: () => offset,
		onAfterShow: () => {
			focusFirstSelectItem();
		}
	});

	function focusFirstSelectItem() {
		if (!el) return;
		const items = getOptionItems(el);
		const selected = items.find((item) => item.getAttribute('aria-selected') === 'true');
		if (selected) {
			selected.focus();
		} else if (items[0]) {
			items[0].focus();
		} else {
			el.focus();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!el) return;
		if (e.key === 'Escape') {
			e.preventDefault();
			ctx.close();
			ctx.triggerEl?.focus();
			return;
		}
		const items = getOptionItems(el);
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
	{@attach attachContent}
	{@attach fromAction(popover.applyPosition, () => style)}
	popover="auto"
	role="listbox"
	id={ctx.contentId}
	aria-labelledby={ctx.triggerId}
	data-select-content
	data-state={ctx.open ? 'open' : 'closed'}
	class={className}
	ontoggle={(e) => {
		const newState = (e as ToggleEvent).newState === 'open';
		if (newState && !ctx.open) {
			ctx.show();
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
	[data-select-content] {
		/* Reset UA popover defaults */
		inset: unset;
		margin: 0;

		display: grid;
		grid-template-columns: minmax(max(12rem, anchor-size(inline)), max-content);
		background: var(--dry-overlay-bg, var(--dry-color-bg-overlay));
		border: 1px solid var(--dry-overlay-border, var(--dry-color-stroke-weak));
		border-radius: var(--dry-overlay-radius, var(--dry-radius-md));
		box-shadow: var(--dry-overlay-shadow, var(--dry-shadow-lg));
		padding: var(--dry-space-1);
		max-height: 200px;
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: var(--dry-scrollbar-thumb) var(--dry-scrollbar-track);

		transition:
			opacity var(--dry-duration-fast) var(--dry-ease-emphasized),
			transform var(--dry-duration-fast) var(--dry-ease-emphasized);
	}

	[data-select-content]::-webkit-scrollbar {
		height: var(--dry-scrollbar-width);
	}

	[data-select-content]::-webkit-scrollbar-track {
		background: var(--dry-scrollbar-track);
	}

	[data-select-content]::-webkit-scrollbar-thumb {
		background: var(--dry-scrollbar-thumb);
		border-radius: var(--dry-radius-full);
		border: 2px solid transparent;
		background-clip: content-box;
	}

	[data-select-content]::-webkit-scrollbar-thumb:hover {
		background: var(--dry-scrollbar-thumb-hover);
		background-clip: content-box;
	}

	[data-select-content]:not(:popover-open) {
		display: none;
	}

	[data-select-content]:popover-open {
		display: grid;
		opacity: 1;
		transform: scale(1) translateY(0);
	}

	@starting-style {
		[data-select-content]:popover-open {
			opacity: 0;
			transform: scale(var(--dry-motion-scale-enter))
				translateY(calc(var(--dry-motion-distance-xs) * -1));
		}
	}
</style>
