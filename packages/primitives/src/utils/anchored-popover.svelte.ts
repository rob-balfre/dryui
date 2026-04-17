import { createPositionedPopover } from './positioned-popover.svelte.js';
import type { Placement } from './anchor-position.svelte.js';

export type { Placement };

export interface AnchoredPopoverOptions {
	triggerEl: () => HTMLElement | null;
	contentEl: () => HTMLElement | null;
	open: () => boolean;
	placement: () => Placement;
	offset: () => number;
	/**
	 * Optional side-effect that runs each time the popover transitions from
	 * closed to open. Receives the content element so consumers can focus
	 * the first item, seed scroll position, etc.
	 */
	onAfterShow?: (contentEl: HTMLElement) => void;
	/** Optional side-effect after the popover is hidden. */
	onAfterHide?: (contentEl: HTMLElement) => void;
}

export interface AnchoredPopoverController {
	/** Shared `use:applyPosition` action that writes anchor styles to the node. */
	applyPosition: ReturnType<typeof createPositionedPopover>['applyPosition'];
}

/**
 * Thin wrapper around `createPositionedPopover` that owns the open/close
 * `$effect()` lifecycle. Use this when your content component just needs
 * "place me relative to trigger + show/hide the popover when open flips".
 *
 * Must be called from inside a component context (uses `$effect`).
 *
 *   const popover = createAnchoredPopover({
 *     triggerEl: () => ctx.triggerEl,
 *     contentEl: () => contentEl ?? null,
 *     open: () => ctx.open,
 *     placement: () => placement,
 *     offset: () => offset
 *   });
 *   <div bind:this={contentEl} use:popover.applyPosition={style}>...</div>
 */
export function createAnchoredPopover(options: AnchoredPopoverOptions): AnchoredPopoverController {
	const popover = createPositionedPopover({
		triggerEl: options.triggerEl,
		contentEl: options.contentEl,
		placement: options.placement,
		offset: options.offset
	});

	$effect(() => {
		const contentEl = options.contentEl();
		if (!contentEl) return;

		const isOpen = options.open();
		const isVisible = contentEl.matches(':popover-open');

		if (isOpen && !isVisible) {
			popover.showPopover(contentEl);
			options.onAfterShow?.(contentEl);
		} else if (!isOpen && isVisible) {
			popover.hidePopover(contentEl);
			options.onAfterHide?.(contentEl);
		}
	});

	return {
		applyPosition: popover.applyPosition
	};
}
