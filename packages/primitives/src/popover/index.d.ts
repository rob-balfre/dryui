import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { Placement } from '../utils/anchor-position.svelte.js';
export interface PopoverRootProps {
	open?: boolean;
	children: Snippet;
}
export interface PopoverTriggerProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
export interface PopoverContentProps extends HTMLAttributes<HTMLDivElement> {
	placement?: Placement;
	offset?: number;
	children: Snippet;
}
import PopoverRoot from './popover-root.svelte';
import PopoverTrigger from './popover-trigger.svelte';
import PopoverContent from './popover-content.svelte';
export declare const Popover: {
	Root: typeof PopoverRoot;
	Trigger: typeof PopoverTrigger;
	Content: typeof PopoverContent;
};
