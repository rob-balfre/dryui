import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface TimelineRootProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

export interface TimelineItemProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

export interface TimelineIconProps extends HTMLAttributes<HTMLDivElement> {
	children?: Snippet;
}

export interface TimelineContentProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

export interface TimelineTitleProps extends HTMLAttributes<HTMLHeadingElement> {
	level?: 1 | 2 | 3 | 4 | 5 | 6;
	children: Snippet;
}

export interface TimelineDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
	children: Snippet;
}

export interface TimelineTimeProps extends HTMLAttributes<HTMLTimeElement> {
	datetime?: string;
	children: Snippet;
}

import TimelineRoot from './timeline-root.svelte';
import TimelineItem from './timeline-item.svelte';
import TimelineIcon from './timeline-icon.svelte';
import TimelineContent from './timeline-content.svelte';
import TimelineTitle from './timeline-title.svelte';
import TimelineDescription from './timeline-description.svelte';
import TimelineTime from './timeline-time.svelte';

export const Timeline: {
	Root: typeof TimelineRoot;
	Item: typeof TimelineItem;
	Icon: typeof TimelineIcon;
	Content: typeof TimelineContent;
	Title: typeof TimelineTitle;
	Description: typeof TimelineDescription;
	Time: typeof TimelineTime;
} = {
	Root: TimelineRoot,
	Item: TimelineItem,
	Icon: TimelineIcon,
	Content: TimelineContent,
	Title: TimelineTitle,
	Description: TimelineDescription,
	Time: TimelineTime
};
