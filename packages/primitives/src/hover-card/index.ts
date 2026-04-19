import type { Snippet } from 'svelte';
import type { HTMLAnchorAttributes, HTMLButtonAttributes, HTMLAttributes } from 'svelte/elements';
import type { Placement } from '../utils/anchor-position.svelte.js';

export interface HoverCardRootProps {
	openDelay?: number;
	closeDelay?: number;
	children: Snippet;
}

export interface HoverCardTriggerProps
	extends Omit<HTMLAnchorAttributes, 'children' | 'href'>, Omit<HTMLButtonAttributes, 'children'> {
	href?: string;
	children: Snippet;
}

export interface HoverCardContentProps extends HTMLAttributes<HTMLDivElement> {
	placement?: Placement;
	offset?: number;
	children: Snippet;
}

import HoverCardRoot from './hover-card-root.svelte';
import HoverCardTrigger from './hover-card-trigger.svelte';
import HoverCardContent from './hover-card-content.svelte';

export const HoverCard: {
	Root: typeof HoverCardRoot;
	Trigger: typeof HoverCardTrigger;
	Content: typeof HoverCardContent;
} = {
	Root: HoverCardRoot,
	Trigger: HoverCardTrigger,
	Content: HoverCardContent
};
