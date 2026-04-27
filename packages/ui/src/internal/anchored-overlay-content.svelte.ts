import { createAnchoredPopover, type Placement } from '@dryui/primitives';

interface AnchoredOverlayContentContext {
	readonly open: boolean;
	readonly contentId: string;
	triggerEl: HTMLElement | null;
}

interface AnchoredOverlayContentOptions {
	ctx: AnchoredOverlayContentContext;
	contentEl: () => HTMLElement | null;
	placement: () => Placement;
	offset: () => number;
	onContentChange?: (contentEl: HTMLElement | null) => void;
}

/**
 * Wires an overlay content element to its trigger via createAnchoredPopover.
 * Consumers own the content element (`bind:this={contentEl}`) and pass a
 * getter; this helper returns the `applyPosition` action which is used as
 * `use:overlay.applyPosition={style}` on the same element.
 */
export function createAnchoredOverlayContent(options: AnchoredOverlayContentOptions) {
	const popover = createAnchoredPopover({
		triggerEl: () => options.ctx.triggerEl,
		contentEl: options.contentEl,
		open: () => options.ctx.open,
		placement: options.placement,
		offset: options.offset
	});

	if (options.onContentChange) {
		$effect(() => {
			options.onContentChange?.(options.contentEl());
		});
	}

	return {
		applyPosition: popover.applyPosition,
		contentEl: options.contentEl
	};
}
