import { tryHidePopover, tryShowPopover } from './popover-toggle.js';
import { useAnchorStyles } from './use-anchor-styles.svelte.js';
import type { Placement } from './anchor-position.svelte.js';

interface PositionedPopoverOptions {
	triggerEl: () => HTMLElement | null;
	contentEl: () => HTMLElement | null;
	placement: () => Placement;
	offset: () => number;
}

export function createPositionedPopover(options: PositionedPopoverOptions) {
	const anchor = useAnchorStyles(options);

	function showPopover(el: HTMLElement) {
		if (el.matches(':popover-open')) return;

		const source = options.triggerEl();
		if (!source) {
			tryShowPopover(el);
			return;
		}

		try {
			(
				el as HTMLElement & { showPopover: (options?: { source?: HTMLElement }) => void }
			).showPopover({ source });
		} catch {
			tryShowPopover(el);
		}
	}

	function hidePopover(el: HTMLElement) {
		tryHidePopover(el);
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
