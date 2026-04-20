import type { HTMLAttributes } from 'svelte/elements';
import { fromAction } from 'svelte/attachments';
import { createAnchoredPopover, type Placement } from '@dryui/primitives';

interface AnchoredOverlayContentContext {
	readonly open: boolean;
	readonly contentId: string;
	triggerEl: HTMLElement | null;
}

interface AnchoredOverlayContentOptions {
	ctx: AnchoredOverlayContentContext;
	placement: () => Placement;
	offset: () => number;
	style: () => HTMLAttributes<HTMLDivElement>['style'];
	onContentChange?: (contentEl: HTMLDivElement | null) => void;
}

export function createAnchoredOverlayContent(options: AnchoredOverlayContentOptions) {
	let contentEl = $state<HTMLDivElement>();

	const popover = createAnchoredPopover({
		triggerEl: () => options.ctx.triggerEl,
		contentEl: () => contentEl ?? null,
		open: () => options.ctx.open,
		placement: options.placement,
		offset: options.offset
	});
	const position = fromAction(popover.applyPosition, options.style);

	function bindContent(node: HTMLDivElement) {
		contentEl = node;
		options.onContentChange?.(node);

		return () => {
			if (contentEl === node) {
				contentEl = undefined;
			}
			options.onContentChange?.(null);
		};
	}

	return {
		bindContent,
		contentEl: () => contentEl ?? null,
		position
	};
}
