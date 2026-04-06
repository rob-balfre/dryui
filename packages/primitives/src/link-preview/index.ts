import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLAnchorAttributes } from 'svelte/elements';
import type { Placement } from '../utils/anchor-position.svelte.js';

export interface LinkPreviewRootProps {
	open?: boolean;
	openDelay?: number;
	closeDelay?: number;
	children: Snippet;
}

export interface LinkPreviewTriggerProps extends HTMLAnchorAttributes {
	children: Snippet;
}

export interface LinkPreviewContentProps extends HTMLAttributes<HTMLDivElement> {
	placement?: Placement;
	offset?: number;
	children: Snippet;
}

import LinkPreviewRoot from './link-preview-root.svelte';
import LinkPreviewTrigger from './link-preview-trigger.svelte';
import LinkPreviewContent from './link-preview-content.svelte';

export const LinkPreview: {
	Root: typeof LinkPreviewRoot;
	Trigger: typeof LinkPreviewTrigger;
	Content: typeof LinkPreviewContent;
} = {
	Root: LinkPreviewRoot,
	Trigger: LinkPreviewTrigger,
	Content: LinkPreviewContent
};
