import { useAnchorStyles } from './use-anchor-styles.svelte.js';
import type { Placement } from './anchor-position.svelte.js';

export type { Placement };

interface PositionedPopoverOptions {
	triggerEl: () => HTMLElement | null;
	contentEl: () => HTMLElement | null;
	placement: () => Placement;
	offset: () => number;
}

export function createPositionedPopover(options: PositionedPopoverOptions) {
	const anchor = useAnchorStyles(options);

	function showPopover(el: HTMLElement) {
		try {
			if (!el.matches(':popover-open')) {
				el.showPopover();
			}
		} catch {
			// Already shown
		}
	}

	function hidePopover(el: HTMLElement) {
		try {
			if (el.matches(':popover-open')) {
				el.hidePopover();
			}
		} catch {
			// Already hidden
		}
	}

	return {
		get styles() {
			return anchor.styles;
		},
		applyPosition: anchor.applyPosition,
		showPopover,
		hidePopover
	};
}
