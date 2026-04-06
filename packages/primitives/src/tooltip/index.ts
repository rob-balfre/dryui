import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { Placement } from '../utils/anchor-position.svelte.js';

export interface TooltipRootProps {
	openDelay?: number;
	closeDelay?: number;
	children: Snippet;
}

export interface TooltipTriggerProps extends HTMLAttributes<HTMLSpanElement> {
	children: Snippet;
}

export interface TooltipContentProps extends HTMLAttributes<HTMLDivElement> {
	placement?: Placement;
	offset?: number;
	children: Snippet;
}

import TooltipRoot from './tooltip-root.svelte';
import TooltipTrigger from './tooltip-trigger.svelte';
import TooltipContent from './tooltip-content.svelte';

export const Tooltip: {
	Root: typeof TooltipRoot;
	Trigger: typeof TooltipTrigger;
	Content: typeof TooltipContent;
} = {
	Root: TooltipRoot,
	Trigger: TooltipTrigger,
	Content: TooltipContent
};
