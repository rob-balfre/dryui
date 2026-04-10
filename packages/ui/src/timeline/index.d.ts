import type { TimelineRootProps as PrimitiveTimelineRootProps } from '@dryui/primitives';
export type { TimelineItemProps, TimelineIconProps, TimelineContentProps, TimelineTitleProps, TimelineDescriptionProps, TimelineTimeProps } from '@dryui/primitives';
export interface TimelineRootProps extends PrimitiveTimelineRootProps {
    orientation?: 'vertical' | 'horizontal';
}
import TimelineRoot from './timeline-root.svelte';
import TimelineItem from './timeline-item.svelte';
import TimelineIcon from './timeline-icon.svelte';
import TimelineContent from './timeline-content.svelte';
import TimelineTitle from './timeline-title.svelte';
import TimelineDescription from './timeline-description.svelte';
import TimelineTime from './timeline-time.svelte';
export declare const Timeline: {
    Root: typeof TimelineRoot;
    Item: typeof TimelineItem;
    Icon: typeof TimelineIcon;
    Content: typeof TimelineContent;
    Title: typeof TimelineTitle;
    Description: typeof TimelineDescription;
    Time: typeof TimelineTime;
};
